"use client";

import { useState } from "react";
import { api, ErroDaApi, type Loja } from "../lib/api.ts";
import { BotaoPrimario } from "./base.tsx";

export function CriarLoja({ aoCriar }: { aoCriar: (loja: Loja) => void }) {
  const [nome, setNome] = useState("");
  const [chavePix, setChavePix] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setOcupado(true);
    setErro(null);
    try {
      const loja = await api.criarLoja({
        nome: nome.trim(),
        ...(chavePix.trim() ? { chavePix: chavePix.trim() } : {}),
      });
      aoCriar(loja);
    } catch (err) {
      setErro(err instanceof ErroDaApi ? err.message : "Não consegui criar a loja.");
    } finally {
      setOcupado(false);
    }
  }

  const campo =
    "h-14 w-full rounded-xl border-2 border-borda bg-fundo px-4 text-base " +
    "outline-none focus:border-marca";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
      <h1 className="text-3xl font-extrabold">Como chama sua loja?</h1>
      <p className="mt-2 text-base text-tinta-fraca">
        É só isso pra começar. O resto dá pra ajustar depois.
      </p>

      <form onSubmit={enviar} className="mt-8 flex flex-col gap-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Nome da loja</span>
          <input
            className={campo}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Mercadinho do Zé"
            required
            autoFocus
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">
            Sua chave Pix{" "}
            <span className="font-normal text-tinta-fraca">(dá pra deixar pra depois)</span>
          </span>
          <input
            className={campo}
            value={chavePix}
            onChange={(e) => setChavePix(e.target.value)}
            placeholder="11 98888-7777"
            inputMode="text"
          />
          <span className="mt-1.5 block text-xs text-tinta-fraca">
            Vai junto no recadinho de cobrança, pro freguês pagar na hora.
          </span>
        </label>

        {erro ? (
          <p className="rounded-xl bg-atrasado-bg px-4 py-3 text-sm font-medium text-atrasado">
            {erro}
          </p>
        ) : null}

        <div className="mt-2">
          <BotaoPrimario tom="marca" type="submit" disabled={ocupado || !nome.trim()}>
            {ocupado ? "Criando…" : "Pronto, abrir a caderneta"}
          </BotaoPrimario>
        </div>
      </form>
    </main>
  );
}
