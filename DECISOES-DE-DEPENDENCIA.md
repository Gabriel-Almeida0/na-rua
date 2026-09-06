# Decisões de dependência

Anotações curtas sobre versões que **não** são a mais recente, e por quê.
Sem isso, a próxima pessoa (ou eu, em três meses) "conserta" e quebra.

## Vitest 4, não 5

`better-auth@1.7.3` declara peer opcional `vitest@^2 || ^3 || ^4`. Com Vitest 5
o npm recusa a árvore inteira.

As saídas eram:

| Opção | Custo |
|---|---|
| `legacy-peer-deps=true` no `.npmrc` | Desliga a checagem de peers do **projeto inteiro** — some com o aviso que pegaria uma incompatibilidade real depois |
| `overrides` no `package.json` | Não funciona: `overrides` altera faixa de dependência, não de **peer** |
| **Vitest 4** | Nenhum, na prática |

Escolhemos Vitest 4. O que o 5 traz e não usamos: Browser Mode estável (a
[ADR de qualidade](docs/04-arquitetura/07-qualidade-e-observabilidade.md) diz
explicitamente para não usar — já temos Playwright) e o Trace View.

**Revisar quando:** o `better-auth` aceitar `vitest@^5`. Checar com
`npm view better-auth peerDependencies`.

## Node 22, não 20

`vitest@4` aceita Node 20, mas o `engines` da raiz exige `>=22.12.0` porque é o
piso do Vitest 5 — para o dia em que a nota acima for resolvida. O `.nvmrc`
fixa a versão para quem usa nvm e para o CI.

## better-auth fixado em 1.7.2, não `^1.7.3`

O pnpm 12 recusou a instalação com `minimumReleaseAge`: o `better-auth@1.7.3` e
seus subpacotes tinham sido publicados **cerca de uma hora antes**.

Essa política existe porque a janela logo após a publicação é justamente quando
comprometimento de pacote é descoberto — instalar às cegas nas primeiras horas é
o padrão que já entregou malware para milhares de projetos.

Fixado em `1.7.2` (publicado 26/08/2026, onze dias antes). Versão exata, sem
`^`, para que um `pnpm update` distraído não puxe de novo algo recém-publicado.

**Revisar quando:** for atualizar de propósito. Conferir a idade com
`npm view better-auth time --json` antes de subir.

## pnpm, não npm

O `npm@10.9.8` **quebra com erro interno** (`arborist … Cannot read properties of
null (reading 'edgesOut')`) ao resolver o grafo de peers que o better-auth
arrasta (SvelteKit → Vite → devtools → vitest). Não é recusa de árvore, é crash
do resolvedor.

O pnpm resolve o mesmo grafo sem reclamar, com a checagem de peers **intacta** —
e ainda trouxe de graça a política de idade de release acima. Ativado via
`corepack`, sem instalação global.
