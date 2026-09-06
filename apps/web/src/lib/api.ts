"use client";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

export class ErroDaApi extends Error {
  readonly status: number;
  readonly codigo: string;

  constructor(status: number, codigo: string, mensagem: string) {
    super(mensagem);
    this.name = "ErroDaApi";
    this.status = status;
    this.codigo = codigo;
  }
}

async function chamar<T>(
  caminho: string,
  opcoes: { metodo?: string; corpo?: unknown } = {},
): Promise<T> {
  const r = await fetch(BASE + caminho, {
    method: opcoes.metodo ?? "GET",
    // Cookie de sessão do Better Auth.
    credentials: "include",
    headers: { "content-type": "application/json" },
    ...(opcoes.corpo ? { body: JSON.stringify(opcoes.corpo) } : {}),
  });

  const texto = await r.text();
  const dados = texto ? JSON.parse(texto) : null;

  if (!r.ok) {
    throw new ErroDaApi(
      r.status,
      dados?.erro ?? dados?.code ?? "erro",
      dados?.mensagem ?? dados?.message ?? "Não consegui falar com o servidor.",
    );
  }
  return dados as T;
}

export interface Loja {
  id: string;
  nome: string;
  papel: string;
  chavePix: string | null;
}

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

export const api = {
  entrar: (email: string, senha: string) =>
    chamar<{ user: { id: string; name: string } }>("/api/auth/sign-in/email", {
      metodo: "POST",
      corpo: { email, password: senha },
    }),

  cadastrar: (nome: string, email: string, senha: string) =>
    chamar<{ user: { id: string; name: string } }>("/api/auth/sign-up/email", {
      metodo: "POST",
      corpo: { name: nome, email, password: senha },
    }),

  sair: () => chamar<unknown>("/api/auth/sign-out", { metodo: "POST" }),

  sessao: () =>
    chamar<{ user: { id: string; name: string } } | null>("/api/auth/get-session"),

  lojas: () => chamar<{ lojas: Loja[] }>("/api/lojas"),

  criarLoja: (dados: { nome: string; chavePix?: string; diaVencimentoPadrao?: number }) =>
    chamar<Loja>("/api/lojas", { metodo: "POST", corpo: dados }),

  caderneta: (lojaId: string) =>
    chamar<Caderneta>(`/api/lojas/${lojaId}/caderneta`),

  criarCliente: (
    lojaId: string,
    dados: { id: string; nome: string; telefone?: string; diaVencimento?: number },
  ) =>
    chamar<{ id: string; criado: boolean }>(`/api/lojas/${lojaId}/clientes`, {
      metodo: "POST",
      corpo: dados,
    }),

  sincronizar: (lojaId: string, eventos: unknown[], deviceId?: string) =>
    chamar<{ aplicados: string[]; jaExistiam: string[]; sincronizadoEm: string }>(
      `/api/lojas/${lojaId}/sync`,
      { metodo: "POST", corpo: { eventos, ...(deviceId ? { deviceId } : {}) } },
    ),

  extrato: (lojaId: string, clienteId: string) =>
    chamar<{
      saldoCentavos: number;
      lancamentos: Array<{
        transacaoId: string;
        tipo: string;
        ocorridoEm: string;
        descricao: string | null;
        valorCentavos: number;
        aumentaDivida: boolean;
      }>;
    }>(`/api/lojas/${lojaId}/clientes/${clienteId}/extrato`),
};
