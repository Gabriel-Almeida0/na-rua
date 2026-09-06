import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const emDesenvolvimento = process.env.NODE_ENV === "development";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: emDesenvolvimento,
});

const config: NextConfig = {
  // O domínio é TypeScript cru vindo do workspace; o Next precisa transpilá-lo.
  transpilePackages: ["@na-rua/dominio"],
  experimental: {
    // Detecta falha de rede em navegação, prefetch e Server Actions, e refaz a
    // requisição ao reconectar. É complemento ao service worker, não substituto
    // — a própria doc marca como experimental.
    useOffline: true,
  },
};

/*
  O @serwist/next é plugin de WEBPACK, e o Next 16 usa Turbopack por padrão.
  Aplicar o wrapper em dev quebraria o `next dev` mesmo com `disable: true`,
  porque ele injeta configuração de webpack de qualquer forma.

  Solução: Turbopack no dev (fast refresh rápido, que é o que importa ali) e
  webpack no build, onde o service worker precisa ser gerado. O script de build
  passa --webpack explicitamente.

  Em dev o service worker fica de fora de propósito: ele mascara mudança de
  código e confunde o diagnóstico de offline.
*/
export default emDesenvolvimento ? config : withSerwist(config);
