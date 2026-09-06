"use client";

import { useCallback, useEffect, useState } from "react";
import { api, type Loja } from "../lib/api.ts";
import { db, gravarMeta, lerMeta } from "../lib/db.ts";
import { Caderneta } from "./Caderneta.tsx";
import { CriarLoja } from "./CriarLoja.tsx";
import { Entrar } from "./Entrar.tsx";

type Estado =
  | { fase: "carregando" }
  | { fase: "entrar" }
  | { fase: "semLoja" }
  | { fase: "pronto"; loja: Loja };

export function App() {
  const [estado, setEstado] = useState<Estado>({ fase: "carregando" });

  const carregar = useCallback(async () => {
    // Primeiro tenta o que já está local. É o que faz o app abrir instantâneo
    // e continuar servindo mesmo sem rede — e é por isso que falta de sessão
    // não derruba o app: perder o login não pode significar perder a caderneta.
    const lojaSalva = await lerMeta<Loja>("loja");

    try {
      const sessao = await api.sessao();
      if (!sessao?.user) {
        setEstado(lojaSalva ? { fase: "pronto", loja: lojaSalva } : { fase: "entrar" });
        return;
      }
      const { lojas } = await api.lojas();
      const loja = lojas[0];
      if (!loja) {
        setEstado({ fase: "semLoja" });
        return;
      }
      await gravarMeta("loja", loja);
      setEstado({ fase: "pronto", loja });
    } catch {
      // Sem rede: se já tem loja local, segue trabalhando.
      setEstado(lojaSalva ? { fase: "pronto", loja: lojaSalva } : { fase: "entrar" });
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function sair() {
    try {
      await api.sair();
    } catch {
      /* sair local mesmo sem rede */
    }
    await db.delete();
    location.reload();
  }

  if (estado.fase === "carregando") {
    return (
      <main className="grid min-h-dvh place-items-center px-6">
        <p className="text-tinta-fraca">Abrindo sua caderneta…</p>
      </main>
    );
  }
  if (estado.fase === "entrar") return <Entrar aoEntrar={() => void carregar()} />;
  if (estado.fase === "semLoja") {
    return (
      <CriarLoja
        aoCriar={async (loja) => {
          await gravarMeta("loja", loja);
          setEstado({ fase: "pronto", loja });
        }}
      />
    );
  }
  return <Caderneta loja={estado.loja} aoSair={() => void sair()} />;
}
