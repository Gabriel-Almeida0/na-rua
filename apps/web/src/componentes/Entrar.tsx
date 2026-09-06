"use client";

import { useState } from "react";
import { api, ErroDaApi } from "../lib/api.ts";
import { BotaoPrimario } from "./base.tsx";

export function Entrar({ aoEntrar }: { aoEntrar: () => void }) {
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setOcupado(true);
    try {
      if (modo === "criar") await api.cadastrar(nome.trim(), email.trim(), senha);
      else await api.entrar(email.trim(), senha);
      aoEntrar();
    } catch (err) {
      setErro(
        err instanceof ErroDaApi
          ? err.message
          : "Não consegui conectar. Vê se tem internet aí.",
      );
    } finally {
      setOcupado(false);
    }
  }

  const campo =
    "h-14 w-full rounded-xl border-2 border-borda bg-fundo px-4 text-base " +
    "outline-none focus:border-marca";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight">Na Rua</h1>
        <p className="mt-2 text-base text-tinta-fraca">
          Sua caderneta de fiado, que funciona até sem internet.
        </p>
      </div>

      <form onSubmit={enviar} className="flex flex-col gap-3">
        {modo === "criar" ? (
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Seu nome</span>
            <input
              className={campo}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoComplete="name"
              required
            />
          </label>
        ) : null}

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">E-mail</span>
          <input
            className={campo}
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Senha</span>
          <input
            className={campo}
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete={modo === "criar" ? "new-password" : "current-password"}
            minLength={8}
            required
          />
        </label>

        {erro ? (
          <p className="rounded-xl bg-atrasado-bg px-4 py-3 text-sm font-medium text-atrasado">
            {erro}
          </p>
        ) : null}

        <div className="mt-2">
          <BotaoPrimario tom="marca" type="submit" disabled={ocupado}>
            {ocupado ? "Um instante…" : modo === "criar" ? "Criar minha conta" : "Entrar"}
          </BotaoPrimario>
        </div>
      </form>

      <button
        onClick={() => {
          setModo(modo === "entrar" ? "criar" : "entrar");
          setErro(null);
        }}
        className="mt-5 text-sm font-semibold text-marca"
      >
        {modo === "entrar" ? "Ainda não tenho conta" : "Já tenho conta"}
      </button>
    </main>
  );
}
