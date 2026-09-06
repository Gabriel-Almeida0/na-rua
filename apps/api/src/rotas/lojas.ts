import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { ErroDeRequisicao, naoAutenticado } from "../lib/erros.ts";
import { novoId } from "../lib/ids.ts";
import { comUsuario } from "../lib/tenant.ts";

const lojaNovaSchema = z.object({
  nome: z.string().trim().min(1, "diga o nome da loja").max(120),
  chavePix: z.string().trim().max(140).optional(),
  documento: z.string().trim().max(20).optional(),
  endereco: z.string().trim().max(200).optional(),
  diaVencimentoPadrao: z.number().int().min(1).max(31).optional(),
});

export async function rotasDeLojas(app: FastifyInstance) {
  /** As lojas em que o usuário é membro. É por onde o app começa. */
  app.get("/api/lojas", async (req) => {
    if (!req.usuarioId) throw naoAutenticado();
    return comUsuario(req.usuarioId, async (cx) => {
      const r = await cx.query<{
        id: string;
        nome: string;
        role: string;
        chave_pix: string | null;
      }>(
        `select s.id, s.nome, m.role, s.chave_pix
           from stores s
           join store_members m on m.store_id = s.id
          order by s.nome collate "pt_br"`,
      );
      return {
        lojas: r.rows.map((l) => ({
          id: l.id,
          nome: l.nome,
          papel: l.role,
          chavePix: l.chave_pix,
        })),
      };
    });
  });

  /**
   * Criar loja — o onboarding.
   *
   * Chama `private.criar_loja`, que é SECURITY DEFINER e cria a loja já com o
   * chamador como dono, numa operação só. A rota NÃO fura a RLS: quem tem o
   * privilégio é a função no banco, que é estreita o bastante para não aceitar
   * outro usuário como parâmetro.
   */
  app.post("/api/lojas", async (req, resposta) => {
    if (!req.usuarioId) throw naoAutenticado();
    const analise = lojaNovaSchema.safeParse(req.body);
    if (!analise.success) {
      throw new ErroDeRequisicao(
        422,
        "dados_invalidos",
        analise.error.issues[0]?.message ?? "Confere os dados da loja.",
      );
    }
    const dados = analise.data;

    return comUsuario(req.usuarioId, async (cx) => {
      const r = await cx.query<{ criar_loja: string }>(
        `select private.criar_loja($1,$2,$3,$4,$5,$6) as criar_loja`,
        [
          dados.nome,
          dados.chavePix ?? null,
          dados.documento ?? null,
          dados.endereco ?? null,
          dados.diaVencimentoPadrao ?? null,
          novoId(),
        ],
      );
      resposta.code(201);
      return { id: r.rows[0]?.criar_loja, nome: dados.nome, papel: "dono" };
    });
  });
}
