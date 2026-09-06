"use client";

import { useState } from "react";
import { BotaoPrimario } from "./base.tsx";

/**
 * Teclado numérico próprio, e não o do sistema.
 *
 * Isso existe por causa de um bug real que quebrou um concorrente na Indonésia:
 * a barra de navegação do Android cobria o botão "0" e o botão de salvar, e o
 * lojista simplesmente não conseguia digitar o valor. Dezenas de avaliações
 * de 1 estrela, uma delas literalmente "desinstalei chorando".
 *
 * Com teclado próprio, o layout é nosso e o botão de salvar fica sempre acima,
 * dentro da safe-area. Ver a matriz de QA em
 * docs/04-arquitetura/07-qualidade-e-observabilidade.md.
 */
export function TecladoValor({
  titulo,
  subtitulo,
  rotuloAcao,
  tom,
  valorInicial = "",
  atalhos,
  aoConfirmar,
  aoCancelar,
}: {
  titulo: string;
  subtitulo?: string;
  rotuloAcao: string;
  tom: "fiado" | "receber";
  valorInicial?: string;
  atalhos?: Array<{ rotulo: string; centavos: number }>;
  aoConfirmar: (centavos: number) => void;
  aoCancelar: () => void;
}) {
  const [digitos, setDigitos] = useState(valorInicial);

  const centavos = Number(digitos || "0");
  const reais = Math.floor(centavos / 100);
  const cents = centavos % 100;
  const exibicao = `${reais.toLocaleString("pt-BR")},${String(cents).padStart(2, "0")}`;

  function tecla(t: string) {
    if (t === "apagar") {
      setDigitos((d) => d.slice(0, -1));
      return;
    }
    // Teto de R$ 999.999,99: acima disso é quase certamente dedo escorregado.
    setDigitos((d) => (d.length >= 8 ? d : (d + t).replace(/^0+/, "")));
  }

  const teclas = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "apagar"];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-fundo">
      <header className="flex items-center gap-3 border-b border-borda px-4 py-3">
        <button
          onClick={aoCancelar}
          aria-label="Voltar"
          className="grid size-11 place-items-center rounded-xl text-2xl text-tinta"
        >
          ←
        </button>
        <div>
          <h1 className="text-lg font-bold leading-tight">{titulo}</h1>
          {subtitulo ? (
            <p className="text-sm text-tinta-fraca">{subtitulo}</p>
          ) : null}
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-6">
        <div className="text-center">
          <span className="text-2xl font-semibold text-neutro">R$</span>
          <span className="ml-2 text-[56px] font-extrabold leading-none tabular-nums">
            {exibicao}
          </span>
        </div>
      </div>

      {atalhos && atalhos.length > 0 ? (
        <div className="flex gap-2 px-4 pb-3">
          {atalhos.map((a) => (
            <button
              key={a.rotulo}
              onClick={() => setDigitos(String(a.centavos))}
              className="h-12 flex-1 rounded-xl border-2 border-borda bg-fundo
                text-sm font-bold text-tinta"
            >
              {a.rotulo}
            </button>
          ))}
        </div>
      ) : null}

      {/* O botão de ação fica ACIMA do teclado e dentro da safe-area. */}
      <div
        className="border-t border-borda bg-fundo-tela px-4 pt-3"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <div className="grid grid-cols-3 gap-2">
          {teclas.map((t) => (
            <button
              key={t}
              onClick={() => tecla(t)}
              aria-label={t === "apagar" ? "Apagar" : t}
              className="h-14 rounded-xl bg-fundo text-2xl font-bold text-tinta
                shadow-sm active:bg-borda"
            >
              {t === "apagar" ? "⌫" : t}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <BotaoPrimario
            tom={tom}
            disabled={centavos <= 0}
            onClick={() => aoConfirmar(centavos)}
          >
            {centavos <= 0 ? "Digite o valor" : rotuloAcao}
          </BotaoPrimario>
        </div>
      </div>
    </div>
  );
}
