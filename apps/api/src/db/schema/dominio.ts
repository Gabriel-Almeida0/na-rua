import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  date,
  foreignKey,
  index,
  integer,
  pgEnum,
  pgPolicy,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  unique,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * Schema do domínio. Ver docs/04-arquitetura/02-modelo-de-dados.md.
 *
 * IDs são TEXT com ULID gerado no cliente, antes de qualquer chamada de rede
 * (ADR-0002). ULID é ordenável lexicograficamente, o que preserva a localidade
 * do índice B-tree — a mesma propriedade que a doc buscava com UUIDv7 — e ainda
 * é legível num log, o que UUID não é.
 *
 * As policies usam `current_setting('app.user_id')`, definido pelo Fastify com
 * SET LOCAL dentro da transação. É o equivalente ao `auth.uid()` do Supabase
 * (ADR-0009), e o SET LOCAL é obrigatório: com SET simples, atrás de um pooler
 * em transaction mode, o contexto de um lojista vazaria para a requisição de
 * outro.
 */

export const storeRole = pgEnum("store_role", ["balconista", "gerente", "dono"]);
export const accountKind = pgEnum("account_kind", [
  "receivable",
  "cash",
  "revenue",
  "adjustment",
]);
export const txKind = pgEnum("tx_kind", ["fiado", "pagamento", "estorno", "ajuste"]);
export const txStatus = pgEnum("tx_status", ["pending", "posted"]);
export const entryDirection = pgEnum("entry_direction", ["debito", "credito"]);

const ehMembro = sql`(select private.has_store_role(${sql.raw("store_id")}, 'balconista'))`;
const ehGerente = sql`(select private.has_store_role(${sql.raw("store_id")}, 'gerente'))`;

export const stores = pgTable(
  "stores",
  {
    id: text("id").primaryKey(),
    nome: text("nome").notNull(),
    // Exigidos pelo CDC art. 42-A em todo documento de cobrança.
    documento: text("documento"),
    endereco: text("endereco"),
    chavePix: text("chave_pix"),
    diaVencimentoPadrao: smallint("dia_vencimento_padrao"),
    // Tetos legais moram no schema, não só na tela.
    multaBp: integer("multa_bp").notNull().default(0),
    jurosAaBp: integer("juros_aa_bp").notNull().default(0),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check("multa_dentro_do_teto", sql`${t.multaBp} between 0 and 200`),
    check("juros_dentro_do_teto", sql`${t.jurosAaBp} between 0 and 1200`),
    check(
      "dia_vencimento_valido",
      sql`${t.diaVencimentoPadrao} is null or ${t.diaVencimentoPadrao} between 1 and 31`,
    ),
    pgPolicy("stores_select", {
      for: "select",
      to: "narua_app",
      using: sql`(select private.has_store_role(id, 'balconista'))`,
    }),
    pgPolicy("stores_update", {
      for: "update",
      to: "narua_app",
      using: sql`(select private.has_store_role(id, 'dono'))`,
      withCheck: sql`(select private.has_store_role(id, 'dono'))`,
    }),
  ],
).enableRLS();

export const storeMembers = pgTable(
  "store_members",
  {
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    role: storeRole("role").notNull(),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.storeId, t.userId] }),
    index("store_members_user_idx").on(t.userId),
    pgPolicy("store_members_select", {
      for: "select",
      to: "narua_app",
      using: ehMembro,
    }),
    // Só o dono mexe na equipe.
    pgPolicy("store_members_insert", {
      for: "insert",
      to: "narua_app",
      withCheck: sql`(select private.has_store_role(${sql.raw("store_id")}, 'dono'))`,
    }),
    pgPolicy("store_members_delete", {
      for: "delete",
      to: "narua_app",
      using: sql`(select private.has_store_role(${sql.raw("store_id")}, 'dono'))`,
    }),
  ],
).enableRLS();

export const customers = pgTable(
  "customers",
  {
    id: text("id").primaryKey(),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    // ÚNICO campo obrigatório. Ver ADR-0026.
    nome: text("nome").notNull(),
    telefone: text("telefone"),
    // Opcional e nunca exigido pelo produto.
    cpf: text("cpf"),
    optinWhatsapp: boolean("optin_whatsapp").notNull().default(false),
    optinEm: timestamp("optin_em", { withTimezone: true }),
    optinPor: text("optin_por"),
    limiteCentavos: bigint("limite_centavos", { mode: "number" }),
    diaVencimento: smallint("dia_vencimento"),
    anonimizadoEm: timestamp("anonimizado_em", { withTimezone: true }),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
    createdBy: text("created_by").notNull(),
  },
  (t) => [
    index("customers_store_idx").on(t.storeId),
    // Único POR LOJA, nunca global: unique global vazaria a existência de dado
    // de outro tenant pelo erro de duplicidade.
    uniqueIndex("customers_store_nome_uk")
      .on(t.storeId, sql`lower(${t.nome})`)
      .where(sql`${t.anonimizadoEm} is null`),
    check(
      "limite_positivo",
      sql`${t.limiteCentavos} is null or ${t.limiteCentavos} > 0`,
    ),
    pgPolicy("customers_select", { for: "select", to: "narua_app", using: ehMembro }),
    pgPolicy("customers_insert", {
      for: "insert",
      to: "narua_app",
      withCheck: ehMembro,
    }),
    pgPolicy("customers_update", {
      for: "update",
      to: "narua_app",
      using: ehMembro,
      withCheck: ehMembro,
    }),
    pgPolicy("customers_delete", { for: "delete", to: "narua_app", using: ehGerente }),
  ],
).enableRLS();

export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    kind: accountKind("kind").notNull(),
    customerId: text("customer_id").references(() => customers.id),
    debitNormal: boolean("debit_normal").notNull(),
  },
  (t) => [
    index("accounts_store_kind_idx").on(t.storeId, t.kind),
    uniqueIndex("accounts_receivable_uk")
      .on(t.storeId, t.customerId)
      .where(sql`kind = 'receivable'`),
    check(
      "receivable_tem_cliente",
      sql`(kind = 'receivable' and customer_id is not null)
       or (kind <> 'receivable' and customer_id is null)`,
    ),
    // Alvo da FK composta em ledger_entries. Ver o comentário lá.
    unique("accounts_id_store_uk").on(t.id, t.storeId),
    pgPolicy("accounts_select", { for: "select", to: "narua_app", using: ehMembro }),
    pgPolicy("accounts_insert", { for: "insert", to: "narua_app", withCheck: ehMembro }),
  ],
).enableRLS();

export const ledgerTransactions = pgTable(
  "ledger_transactions",
  {
    // ULID gerado no CLIENTE. É a chave da idempotência (ADR-0002).
    id: text("id").primaryKey(),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    kind: txKind("kind").notNull(),
    ocorridoEm: date("ocorrido_em").notNull(),
    descricao: text("descricao"),
    status: txStatus("status").notNull().default("pending"),
    estornaId: text("estorna_id"),
    // CDC art. 54-G: conta contestada suspende lembrete.
    contestada: boolean("contestada").notNull().default(false),
    createdBy: text("created_by").notNull(),
    deviceId: text("device_id"),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("ledger_tx_store_data_idx").on(t.storeId, t.ocorridoEm.desc()),
    // Fiado é registro de fato ocorrido. Data futura não existe.
    check("sem_data_futura", sql`${t.ocorridoEm} <= current_date`),
    unique("ledger_tx_id_store_uk").on(t.id, t.storeId),
    pgPolicy("ledger_tx_select", { for: "select", to: "narua_app", using: ehMembro }),
    pgPolicy("ledger_tx_insert", { for: "insert", to: "narua_app", withCheck: ehMembro }),
    // Sem policy de UPDATE/DELETE: o verbo é revogado e o trigger bloqueia.
  ],
).enableRLS();

export const ledgerEntries = pgTable(
  "ledger_entries",
  {
    id: text("id").primaryKey(),
    transactionId: text("transaction_id").notNull(),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    accountId: text("account_id").notNull(),
    direcao: entryDirection("direcao").notNull(),
    // bigint em centavos. Nunca float. Ver ADR-0005.
    valorCentavos: bigint("valor_centavos", { mode: "number" }).notNull(),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("ledger_entries_store_conta_idx").on(t.storeId, t.accountId),
    index("ledger_entries_tx_idx").on(t.transactionId),
    check("valor_positivo", sql`${t.valorCentavos} > 0`),
    /*
      FKs COMPOSTAS, incluindo store_id.

      Com FKs simples (account_id -> accounts.id), a loja A conseguia gravar um
      lançamento contra a conta a receber da loja B. A policy de INSERT só olha
      `store_id`, e a checagem de integridade referencial do Postgres IGNORA RLS
      por definição — é a armadilha nº 7 documentada em
      docs/04-arquitetura/05-seguranca-e-multi-tenancy.md.

      A linha não vazava para tela nenhuma (a RLS derruba o join dos dois lados),
      mas ficava gravada, e uma leitura sem RLS — migração, job, pg_dump, backup
      restaurado — mostraria o freguês de uma loja sob o store_id de outra. É
      violação da invariante I5, e o valor sumia de I4: não entrava no saldo de
      ninguém.

      Encontrado pela suíte pgTAP antes de existir usuário. Era exatamente para
      isso que ela foi escrita.
    */
    foreignKey({
      columns: [t.accountId, t.storeId],
      foreignColumns: [accounts.id, accounts.storeId],
      name: "ledger_entries_conta_da_mesma_loja_fk",
    }),
    foreignKey({
      columns: [t.transactionId, t.storeId],
      foreignColumns: [ledgerTransactions.id, ledgerTransactions.storeId],
      name: "ledger_entries_tx_da_mesma_loja_fk",
    }),
    pgPolicy("ledger_entries_select", { for: "select", to: "narua_app", using: ehMembro }),
    pgPolicy("ledger_entries_insert", {
      for: "insert",
      to: "narua_app",
      withCheck: ehMembro,
    }),
  ],
).enableRLS();
