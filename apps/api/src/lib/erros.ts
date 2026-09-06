/**
 * Erros do domínio da API. A mensagem que chega ao lojista segue o tom do
 * produto: diz o que fazer agora, sem jargão e sem culpar ninguém.
 * Ver docs/02-ux/03-microcopy.md.
 */
export class ErroDeRequisicao extends Error {
  // Campos declarados e atribuídos explicitamente, em vez de parameter
  // properties: o `--experimental-strip-types` do Node só remove tipos, e
  // `constructor(readonly x)` gera código. Evitar isso mantém o projeto
  // executável por qualquer runtime que apenas apague as anotações.
  readonly status: number;
  readonly codigo: string;

  constructor(status: number, codigo: string, mensagem: string) {
    super(mensagem);
    this.name = "ErroDeRequisicao";
    this.status = status;
    this.codigo = codigo;
  }
}

export const naoAutenticado = () =>
  new ErroDeRequisicao(401, "nao_autenticado", "Você precisa entrar na sua conta.");

export const semAcesso = () =>
  new ErroDeRequisicao(403, "sem_acesso", "Você não tem acesso a essa loja.");

export const naoEncontrado = (o: string) =>
  new ErroDeRequisicao(404, "nao_encontrado", `${o} não encontrado.`);
