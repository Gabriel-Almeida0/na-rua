import type { PoolClient } from "pg";
import { poolApp } from "../db/cliente.ts";

/**
 * Executa um bloco dentro de uma transação com o contexto de usuário definido.
 *
 * Este é o ponto mais sensível da aplicação inteira. Duas coisas não são
 * negociáveis aqui:
 *
 * 1. `set_config(..., true)` — o `true` significa LOCAL, ou seja, o valor morre
 *    no fim da transação. Com `SET` de sessão, atrás de um pooler em transaction
 *    mode, o contexto de um lojista vazaria para a requisição de outro. É a
 *    armadilha nº 9 da lista em docs/04-arquitetura/05-seguranca-e-multi-tenancy.md.
 *
 * 2. `set_config` com parâmetro, e não interpolação de string. `SET LOCAL` não
 *    aceita parâmetro, e montar o SQL na mão abriria injeção no exato lugar onde
 *    ela seria mais grave.
 *
 * Toda leitura e toda escrita do domínio passa por aqui. Não existe caminho que
 * fale com o banco sem contexto — sem `app.user_id`, a RLS não devolve linha
 * nenhuma, que é o comportamento correto.
 */
export async function comUsuario<T>(
  userId: string,
  fn: (cx: PoolClient) => Promise<T>,
): Promise<T> {
  const cx = await poolApp.connect();
  try {
    await cx.query("begin");
    await cx.query("select set_config('app.user_id', $1, true)", [userId]);
    const resultado = await fn(cx);
    await cx.query("commit");
    return resultado;
  } catch (erro) {
    await cx.query("rollback").catch(() => {});
    throw erro;
  } finally {
    cx.release();
  }
}
