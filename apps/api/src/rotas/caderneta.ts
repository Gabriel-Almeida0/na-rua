import type { FastifyInstance } from "fastify";
import { ErroDeRequisicao, naoAutenticado, semAcesso } from "../lib/erros.ts";
import { comUsuario } from "../lib/tenant.ts";
import {
  aplicarEventos,
  criarCliente,
  lerCaderneta,
} from "./caderneta-servico.ts";
import { clienteNovoSchema, sincronizarSchema } from "./esquemas.ts";

/**
 * Rotas da caderneta.
 *
 * Toda rota entra por `comUsuario`, que abre a transação e define
 * `app.user_id`. A RLS decide o que é visível — a rota não filtra por loja na
 * mão como filtro primário.
 *
 * Mas ela também filtra: `where store_id = $1` aparece nas queries, além da
 * policy. É a recomendação da ADR-0009, regra 6: a RLS é rede de segurança, não
 * filtro primário. As duas camadas, como decidido.
 */
export async function rotasDaCaderneta(app: FastifyInstance) {
  function exigirUsuario(req: { usuarioId?: string }): string {
    if (!req.usuarioId) throw naoAutenticado();
    return req.usuarioId;
  }

  /** A tela inicial: tá na rua, quem deve, quem atrasou. */
  app.get<{ Params: { storeId: string } }>(
    "/api/lojas/:storeId/caderneta",
    async (req) => {
      const userId = exigirUsuario(req);
      const { storeId } = req.params;

      return comUsuario(userId, async (cx) => {
        // Sem acesso, a RLS devolve zero linhas em stores — o que é
        // indistinguível de loja inexistente, e é exatamente o que queremos:
        // não confirmamos a existência de loja alheia.
        const loja = await cx.query(`select id, nome from stores where id = $1`, [
          storeId,
        ]);
        if (loja.rows.length === 0) throw semAcesso();

        return lerCaderneta(cx, storeId);
      });
    },
  );

  /** Cadastrar freguês. Só o nome é obrigatório (ADR-0026). */
  app.post<{ Params: { storeId: string } }>(
    "/api/lojas/:storeId/clientes",
    async (req, resposta) => {
      const userId = exigirUsuario(req);
      const { storeId } = req.params;
      const analise = clienteNovoSchema.safeParse(req.body);
      if (!analise.success) {
        throw new ErroDeRequisicao(
          422,
          "dados_invalidos",
          analise.error.issues[0]?.message ?? "Confere os dados aí.",
        );
      }

      return comUsuario(userId, async (cx) => {
        const { criado } = await criarCliente(cx, storeId, userId, analise.data);
        resposta.code(criado ? 201 : 200);
        return { id: analise.data.id, criado };
      });
    },
  );

  /**
   * O caminho de escrita do ledger.
   *
   * É um lote, e não um endpoint por ação, porque o PWA acumula eventos no
   * outbox enquanto está offline e sobe todos de uma vez quando a rede volta.
   * Um endpoint por ação forçaria N requisições em série num 4G ruim.
   *
   * Idempotente: reenviar o mesmo lote não duplica nada. A resposta separa o
   * que foi aplicado do que já existia, para o cliente limpar a fila com
   * segurança nos dois casos.
   */
  app.post<{ Params: { storeId: string } }>(
    "/api/lojas/:storeId/sync",
    async (req) => {
      const userId = exigirUsuario(req);
      const { storeId } = req.params;
      const analise = sincronizarSchema.safeParse(req.body);
      if (!analise.success) {
        throw new ErroDeRequisicao(
          422,
          "dados_invalidos",
          analise.error.issues[0]?.message ?? "Lote inválido.",
        );
      }

      return comUsuario(userId, async (cx) => {
        const loja = await cx.query(`select id from stores where id = $1`, [storeId]);
        if (loja.rows.length === 0) throw semAcesso();

        const r = await aplicarEventos(
          cx,
          storeId,
          userId,
          analise.data.eventos,
          analise.data.deviceId,
        );
        return { ...r, sincronizadoEm: new Date().toISOString() };
      });
    },
  );

  /** Extrato de um freguês, para a ficha dele e para o link público. */
  app.get<{ Params: { storeId: string; clienteId: string } }>(
    "/api/lojas/:storeId/clientes/:clienteId/extrato",
    async (req) => {
      const userId = exigirUsuario(req);
      const { storeId, clienteId } = req.params;

      return comUsuario(userId, async (cx) => {
        const r = await cx.query<{
          tx_id: string;
          kind: string;
          ocorrido_em: string;
          descricao: string | null;
          direcao: string;
          valor_centavos: string;
          estorna_id: string | null;
        }>(
          `select t.id as tx_id, t.kind, t.ocorrido_em::text, t.descricao,
                  e.direcao, e.valor_centavos, t.estorna_id
             from ledger_entries e
             join ledger_transactions t on t.id = e.transaction_id
             join accounts a on a.id = e.account_id
            where a.customer_id = $1 and e.store_id = $2
            order by t.ocorrido_em desc, t.id desc`,
          [clienteId, storeId],
        );

        const saldo = await cx.query<{ saldo_centavos: string }>(
          `select saldo_centavos from v_saldos
            where customer_id = $1 and store_id = $2`,
          [clienteId, storeId],
        );

        return {
          saldoCentavos: Number(saldo.rows[0]?.saldo_centavos ?? 0),
          lancamentos: r.rows.map((l) => ({
            transacaoId: l.tx_id,
            tipo: l.kind,
            ocorridoEm: l.ocorrido_em,
            descricao: l.descricao,
            // Na ficha do cliente, débito é o que ele levou e crédito é o que
            // ele pagou. O sinal na interface vem daqui.
            valorCentavos: Number(l.valor_centavos),
            aumentaDivida: l.direcao === "debito",
            estornaId: l.estorna_id,
          })),
        };
      });
    },
  );
}
