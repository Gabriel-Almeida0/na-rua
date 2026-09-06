import type { PoolClient } from "pg";
import { novoId } from "../lib/ids.ts";
import type { ClienteNovo, Evento } from "./esquemas.ts";

/**
 * Serviço da caderneta.
 *
 * Escrita usa SQL parametrizado direto porque o que importa aqui é o
 * `ON CONFLICT DO NOTHING` — a idempotência que faz a sincronização offline
 * funcionar (ADR-0002). O Drizzle entra na definição do schema e na geração das
 * migrations, que é onde ele paga (ADR-0018).
 *
 * Todo método recebe um PoolClient que JÁ está dentro de uma transação com
 * `app.user_id` definido. Nenhum deles abre transação por conta própria.
 */

export interface LinhaDaCaderneta {
  clienteId: string;
  nome: string;
  telefone: string | null;
  saldoCentavos: number;
  diaVencimento: number | null;
  ultimoLancamentoEm: string | null;
}

export interface Caderneta {
  totalNaRuaCentavos: number;
  pessoasDevendo: number;
  clientes: LinhaDaCaderneta[];
}

/** A conta de "receivable" do cliente. Criada sob demanda, de forma idempotente. */
async function garantirContaDoCliente(
  cx: PoolClient,
  storeId: string,
  clienteId: string,
): Promise<string> {
  const existente = await cx.query<{ id: string }>(
    `select id from accounts
      where store_id = $1 and customer_id = $2 and kind = 'receivable'
      limit 1`,
    [storeId, clienteId],
  );
  const achada = existente.rows[0];
  if (achada) return achada.id;

  const id = novoId();
  const inserida = await cx.query<{ id: string }>(
    `insert into accounts (id, store_id, kind, customer_id, debit_normal)
     values ($1, $2, 'receivable', $3, true)
     on conflict do nothing
     returning id`,
    [id, storeId, clienteId],
  );
  const criada = inserida.rows[0];
  if (criada) return criada.id;

  // Corrida: outro request criou entre o select e o insert. Lê de novo.
  const relido = await cx.query<{ id: string }>(
    `select id from accounts
      where store_id = $1 and customer_id = $2 and kind = 'receivable' limit 1`,
    [storeId, clienteId],
  );
  const conta = relido.rows[0];
  if (!conta) throw new Error(`não consegui criar a conta do cliente ${clienteId}`);
  return conta.id;
}

/** Contas da loja que não pertencem a um cliente. Criadas sob demanda. */
async function garantirContaDaLoja(
  cx: PoolClient,
  storeId: string,
  kind: "cash" | "revenue" | "adjustment",
): Promise<string> {
  const debitNormal = kind === "cash";
  const existente = await cx.query<{ id: string }>(
    `select id from accounts where store_id = $1 and kind = $2 limit 1`,
    [storeId, kind],
  );
  const achada = existente.rows[0];
  if (achada) return achada.id;

  const id = novoId();
  await cx.query(
    `insert into accounts (id, store_id, kind, customer_id, debit_normal)
     values ($1, $2, $3, null, $4)
     on conflict do nothing`,
    [id, storeId, kind, debitNormal],
  );
  const relido = await cx.query<{ id: string }>(
    `select id from accounts where store_id = $1 and kind = $2 limit 1`,
    [storeId, kind],
  );
  const conta = relido.rows[0];
  if (!conta) throw new Error(`não consegui criar a conta ${kind} da loja`);
  return conta.id;
}

export async function criarCliente(
  cx: PoolClient,
  storeId: string,
  userId: string,
  dados: ClienteNovo,
): Promise<{ id: string; criado: boolean }> {
  const r = await cx.query<{ id: string }>(
    `insert into customers
       (id, store_id, nome, telefone, optin_whatsapp, optin_em, optin_por,
        dia_vencimento, limite_centavos, created_by)
     values ($1,$2,$3,$4,$5,
             case when $5 then now() else null end,
             case when $5 then $6 else null end,
             $7,$8,$6)
     on conflict (id) do nothing
     returning id`,
    [
      dados.id,
      storeId,
      dados.nome,
      dados.telefone ?? null,
      dados.optinWhatsapp ?? false,
      userId,
      dados.diaVencimento ?? null,
      dados.limiteCentavos ?? null,
    ],
  );
  return { id: dados.id, criado: r.rows.length > 0 };
}

/**
 * Aplica um lote de eventos de forma idempotente.
 *
 * Reenvio, retry automático e o lojista apertando salvar três vezes no 4G ruim
 * colapsam todos no mesmo id. O `ON CONFLICT DO NOTHING` é o que torna a
 * sincronização uma união de conjuntos, e não um problema de conflito.
 */
export async function aplicarEventos(
  cx: PoolClient,
  storeId: string,
  userId: string,
  eventos: Evento[],
  deviceId?: string,
): Promise<{ aplicados: string[]; jaExistiam: string[] }> {
  const aplicados: string[] = [];
  const jaExistiam: string[] = [];

  for (const ev of eventos) {
    let inseriu = false;

    if (ev.tipo === "fiado" || ev.tipo === "pagamento") {
      const contaCliente = await garantirContaDoCliente(cx, storeId, ev.clienteId);
      const contraparte = await garantirContaDaLoja(
        cx,
        storeId,
        ev.tipo === "fiado" ? "revenue" : "cash",
      );

      const tx = await cx.query(
        `insert into ledger_transactions
           (id, store_id, kind, ocorrido_em, descricao, status, created_by, device_id)
         values ($1,$2,$3,$4,$5,'posted',$6,$7)
         on conflict (id) do nothing`,
        [
          ev.id,
          storeId,
          ev.tipo,
          ev.ocorridoEm,
          ev.tipo === "fiado" ? (ev.descricao ?? null) : null,
          userId,
          deviceId ?? null,
        ],
      );
      inseriu = (tx.rowCount ?? 0) > 0;

      if (inseriu) {
        // Fiado:     débito no que o freguês deve, crédito em receita.
        // Pagamento: débito no caixa,             crédito no que ele deve.
        const [contaDebito, contaCredito] =
          ev.tipo === "fiado"
            ? [contaCliente, contraparte]
            : [contraparte, contaCliente];

        await cx.query(
          `insert into ledger_entries
             (id, transaction_id, store_id, account_id, direcao, valor_centavos)
           values ($1,$2,$3,$4,'debito',$5), ($6,$2,$3,$7,'credito',$5)
           on conflict (id) do nothing`,
          [
            ev.entradaDebitoId,
            ev.id,
            storeId,
            contaDebito,
            ev.valorCentavos,
            ev.entradaCreditoId,
            contaCredito,
          ],
        );
      }
    } else {
      // Estorno: contra-lançamento de cada linha do original (ADR-0004).
      const original = await cx.query<{
        id: string;
        account_id: string;
        direcao: "debito" | "credito";
        valor_centavos: string;
      }>(
        `select e.id, e.account_id, e.direcao, e.valor_centavos
           from ledger_entries e
          where e.transaction_id = $1
          order by e.id`,
        [ev.estornaId],
      );

      if (original.rows.length === 0) {
        throw new Error(`não achei a transação ${ev.estornaId} para estornar`);
      }
      if (ev.entradaIds.length !== original.rows.length) {
        throw new Error(
          `estorno precisa de ${original.rows.length} ids, recebeu ${ev.entradaIds.length}`,
        );
      }

      const tx = await cx.query(
        `insert into ledger_transactions
           (id, store_id, kind, ocorrido_em, status, estorna_id, created_by, device_id)
         values ($1,$2,'estorno',$3,'posted',$4,$5,$6)
         on conflict (id) do nothing`,
        [ev.id, storeId, ev.ocorridoEm, ev.estornaId, userId, deviceId ?? null],
      );
      inseriu = (tx.rowCount ?? 0) > 0;

      if (inseriu) {
        for (const [i, linha] of original.rows.entries()) {
          const novoIdEntrada = ev.entradaIds[i];
          if (!novoIdEntrada) throw new Error(`id ausente na posição ${i}`);
          await cx.query(
            `insert into ledger_entries
               (id, transaction_id, store_id, account_id, direcao, valor_centavos)
             values ($1,$2,$3,$4,$5,$6)
             on conflict (id) do nothing`,
            [
              novoIdEntrada,
              ev.id,
              storeId,
              linha.account_id,
              linha.direcao === "debito" ? "credito" : "debito",
              linha.valor_centavos,
            ],
          );
        }
      }
    }

    (inseriu ? aplicados : jaExistiam).push(ev.id);
  }

  return { aplicados, jaExistiam };
}

/** A tela inicial: quanto tá na rua e quem está devendo. */
export async function lerCaderneta(
  cx: PoolClient,
  storeId: string,
): Promise<Caderneta> {
  const total = await cx.query<{ total_centavos: string; pessoas_devendo: string }>(
    `select total_centavos, pessoas_devendo
       from v_total_na_rua where store_id = $1`,
    [storeId],
  );

  const clientes = await cx.query<{
    cliente_id: string;
    nome: string;
    telefone: string | null;
    saldo_centavos: string | null;
    dia_vencimento: number | null;
    ultimo_em: string | null;
  }>(
    `select
        c.id                       as cliente_id,
        c.nome,
        c.telefone,
        s.saldo_centavos,
        c.dia_vencimento,
        max(t.ocorrido_em)::text   as ultimo_em
       from customers c
       left join v_saldos s
              on s.customer_id = c.id and s.store_id = c.store_id
       left join accounts a
              on a.customer_id = c.id and a.kind = 'receivable'
       left join ledger_entries e
              on e.account_id = a.id
       left join ledger_transactions t
              on t.id = e.transaction_id
      where c.store_id = $1
        and c.anonimizado_em is null
      group by c.id, c.nome, c.telefone, s.saldo_centavos, c.dia_vencimento
      order by s.saldo_centavos desc nulls last, c.nome collate "pt_br"`,
    [storeId],
  );

  const linha = total.rows[0];
  return {
    totalNaRuaCentavos: Number(linha?.total_centavos ?? 0),
    pessoasDevendo: Number(linha?.pessoas_devendo ?? 0),
    clientes: clientes.rows.map((r) => ({
      clienteId: r.cliente_id,
      nome: r.nome,
      telefone: r.telefone,
      saldoCentavos: Number(r.saldo_centavos ?? 0),
      diaVencimento: r.dia_vencimento,
      ultimoLancamentoEm: r.ultimo_em,
    })),
  };
}
