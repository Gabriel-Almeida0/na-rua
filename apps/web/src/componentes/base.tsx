"use client";

import { formatar, type Centavos } from "@na-rua/dominio";

/** O saldo. É a informação; tudo o mais é legenda. */
export function NumeroHeroi({
  rotulo,
  valor,
  contexto,
  cor = "text-tinta",
}: {
  rotulo: string;
  valor: number;
  contexto?: string;
  cor?: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.18em] text-neutro uppercase">
        {rotulo}
      </p>
      <p className={`mt-1 text-[44px] font-extrabold leading-none ${cor}`}>
        {formatar(valor as Centavos)}
      </p>
      {contexto ? <p className="mt-2 text-sm text-tinta-fraca">{contexto}</p> : null}
    </div>
  );
}

/**
 * Botão primário. 64dp, na metade inferior da tela.
 * Nunca usa `+` ou `−` como significante — a palavra é o significante.
 */
export function BotaoPrimario({
  children,
  tom = "fiado",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tom?: "fiado" | "receber" | "marca";
}) {
  const fundo =
    tom === "fiado" ? "bg-fiado" : tom === "receber" ? "bg-receber" : "bg-marca";
  return (
    <button
      {...props}
      className={`h-16 w-full rounded-2xl ${fundo} px-6 text-lg font-bold text-white
        shadow-sm transition active:scale-[0.99] disabled:bg-neutro/40
        disabled:text-white/70`}
    >
      {children}
    </button>
  );
}

export function BotaoSecundario({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="h-14 w-full rounded-2xl border-2 border-borda bg-fundo px-5
        text-base font-bold text-tinta transition active:scale-[0.99]"
    >
      {children}
    </button>
  );
}

/**
 * Semáforo de status. Cor NUNCA vem sozinha: sempre com ícone e palavra.
 * Só cor exclui quem tem baixa visão — e desaparece ao sol.
 */
export function Status({ diasAtraso, diaVencimento }: {
  diasAtraso: number | null;
  diaVencimento: number | null;
}) {
  if (diasAtraso !== null && diasAtraso > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-atrasado">
        <span aria-hidden>🔴</span>
        Atrasou {diasAtraso} {diasAtraso === 1 ? "dia" : "dias"}
      </span>
    );
  }
  if (diaVencimento) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-atencao">
        <span aria-hidden>🟡</span>
        Vence dia {diaVencimento}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-neutro">
      <span aria-hidden>⚪</span>
      Em dia
    </span>
  );
}

/**
 * Estado da conexão.
 *
 * Discreta e âmbar, nunca vermelha e nunca modal. O lançamento ESTÁ salvo — o
 * que oscila é a conexão, e a mensagem diz exatamente isso.
 */
export function PilulaConexao({ online, pendentes }: {
  online: boolean;
  pendentes: number;
}) {
  if (online && pendentes === 0) return null;
  const texto = !online
    ? "Sem internet — está tudo anotado aqui"
    : `Guardando ${pendentes} ${pendentes === 1 ? "anotação" : "anotações"} na nuvem…`;
  return (
    <div className="mx-auto w-fit rounded-full bg-atencao-bg px-4 py-1.5 text-sm
      font-medium text-atencao ring-1 ring-atencao/20">
      {texto}
    </div>
  );
}

/** Desfazer em vez de confirmação modal. Ação rotineira não pede modal. */
export function BarraDesfazer({
  mensagem,
  aoDesfazer,
  aoFechar,
}: {
  mensagem: string;
  aoDesfazer: () => void;
  aoFechar: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <div className="mx-auto flex max-w-md items-center justify-between gap-4
        rounded-2xl bg-tinta px-5 py-4 text-white shadow-lg">
        <span className="text-sm font-medium">{mensagem}</span>
        <button
          onClick={() => {
            aoDesfazer();
            aoFechar();
          }}
          className="shrink-0 rounded-xl bg-white/15 px-4 py-2 text-sm font-bold"
        >
          Desfazer
        </button>
      </div>
    </div>
  );
}
