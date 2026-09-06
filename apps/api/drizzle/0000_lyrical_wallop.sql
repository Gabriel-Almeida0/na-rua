CREATE TYPE "public"."account_kind" AS ENUM('receivable', 'cash', 'revenue', 'adjustment');--> statement-breakpoint
CREATE TYPE "public"."entry_direction" AS ENUM('debito', 'credito');--> statement-breakpoint
CREATE TYPE "public"."store_role" AS ENUM('balconista', 'gerente', 'dono');--> statement-breakpoint
CREATE TYPE "public"."tx_kind" AS ENUM('fiado', 'pagamento', 'estorno', 'ajuste');--> statement-breakpoint
CREATE TYPE "public"."tx_status" AS ENUM('pending', 'posted');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text NOT NULL,
	"kind" "account_kind" NOT NULL,
	"customer_id" text,
	"debit_normal" boolean NOT NULL,
	CONSTRAINT "receivable_tem_cliente" CHECK ((kind = 'receivable' and customer_id is not null)
       or (kind <> 'receivable' and customer_id is null))
);
--> statement-breakpoint
ALTER TABLE "accounts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "customers" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text NOT NULL,
	"nome" text NOT NULL,
	"telefone" text,
	"cpf" text,
	"optin_whatsapp" boolean DEFAULT false NOT NULL,
	"optin_em" timestamp with time zone,
	"optin_por" text,
	"limite_centavos" bigint,
	"dia_vencimento" smallint,
	"anonimizado_em" timestamp with time zone,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	CONSTRAINT "limite_positivo" CHECK ("customers"."limite_centavos" is null or "customers"."limite_centavos" > 0)
);
--> statement-breakpoint
ALTER TABLE "customers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "ledger_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"transaction_id" text NOT NULL,
	"store_id" text NOT NULL,
	"account_id" text NOT NULL,
	"direcao" "entry_direction" NOT NULL,
	"valor_centavos" bigint NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "valor_positivo" CHECK ("ledger_entries"."valor_centavos" > 0)
);
--> statement-breakpoint
ALTER TABLE "ledger_entries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "ledger_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text NOT NULL,
	"kind" "tx_kind" NOT NULL,
	"ocorrido_em" date NOT NULL,
	"descricao" text,
	"status" "tx_status" DEFAULT 'pending' NOT NULL,
	"estorna_id" text,
	"contestada" boolean DEFAULT false NOT NULL,
	"created_by" text NOT NULL,
	"device_id" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sem_data_futura" CHECK ("ledger_transactions"."ocorrido_em" <= current_date)
);
--> statement-breakpoint
ALTER TABLE "ledger_transactions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "store_members" (
	"store_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" "store_role" NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "store_members_store_id_user_id_pk" PRIMARY KEY("store_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "store_members" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "stores" (
	"id" text PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"documento" text,
	"endereco" text,
	"chave_pix" text,
	"dia_vencimento_padrao" smallint,
	"multa_bp" integer DEFAULT 0 NOT NULL,
	"juros_aa_bp" integer DEFAULT 0 NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "multa_dentro_do_teto" CHECK ("stores"."multa_bp" between 0 and 200),
	CONSTRAINT "juros_dentro_do_teto" CHECK ("stores"."juros_aa_bp" between 0 and 1200),
	CONSTRAINT "dia_vencimento_valido" CHECK ("stores"."dia_vencimento_padrao" is null or "stores"."dia_vencimento_padrao" between 1 and 31)
);
--> statement-breakpoint
ALTER TABLE "stores" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_transaction_id_ledger_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."ledger_transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_transactions" ADD CONSTRAINT "ledger_transactions_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_members" ADD CONSTRAINT "store_members_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_store_kind_idx" ON "accounts" USING btree ("store_id","kind");--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_receivable_uk" ON "accounts" USING btree ("store_id","customer_id") WHERE kind = 'receivable';--> statement-breakpoint
CREATE INDEX "customers_store_idx" ON "customers" USING btree ("store_id");--> statement-breakpoint
CREATE UNIQUE INDEX "customers_store_nome_uk" ON "customers" USING btree ("store_id",lower("nome")) WHERE "customers"."anonimizado_em" is null;--> statement-breakpoint
CREATE INDEX "ledger_entries_store_conta_idx" ON "ledger_entries" USING btree ("store_id","account_id");--> statement-breakpoint
CREATE INDEX "ledger_entries_tx_idx" ON "ledger_entries" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "ledger_tx_store_data_idx" ON "ledger_transactions" USING btree ("store_id","ocorrido_em" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "store_members_user_idx" ON "store_members" USING btree ("user_id");--> statement-breakpoint
CREATE POLICY "accounts_select" ON "accounts" AS PERMISSIVE FOR SELECT TO "narua_app" USING ((select private.has_store_role(store_id, 'balconista')));--> statement-breakpoint
CREATE POLICY "accounts_insert" ON "accounts" AS PERMISSIVE FOR INSERT TO "narua_app" WITH CHECK ((select private.has_store_role(store_id, 'balconista')));--> statement-breakpoint
CREATE POLICY "customers_select" ON "customers" AS PERMISSIVE FOR SELECT TO "narua_app" USING ((select private.has_store_role(store_id, 'balconista')));--> statement-breakpoint
CREATE POLICY "customers_insert" ON "customers" AS PERMISSIVE FOR INSERT TO "narua_app" WITH CHECK ((select private.has_store_role(store_id, 'balconista')));--> statement-breakpoint
CREATE POLICY "customers_update" ON "customers" AS PERMISSIVE FOR UPDATE TO "narua_app" USING ((select private.has_store_role(store_id, 'balconista'))) WITH CHECK ((select private.has_store_role(store_id, 'balconista')));--> statement-breakpoint
CREATE POLICY "customers_delete" ON "customers" AS PERMISSIVE FOR DELETE TO "narua_app" USING ((select private.has_store_role(store_id, 'gerente')));--> statement-breakpoint
CREATE POLICY "ledger_entries_select" ON "ledger_entries" AS PERMISSIVE FOR SELECT TO "narua_app" USING ((select private.has_store_role(store_id, 'balconista')));--> statement-breakpoint
CREATE POLICY "ledger_entries_insert" ON "ledger_entries" AS PERMISSIVE FOR INSERT TO "narua_app" WITH CHECK ((select private.has_store_role(store_id, 'balconista')));--> statement-breakpoint
CREATE POLICY "ledger_tx_select" ON "ledger_transactions" AS PERMISSIVE FOR SELECT TO "narua_app" USING ((select private.has_store_role(store_id, 'balconista')));--> statement-breakpoint
CREATE POLICY "ledger_tx_insert" ON "ledger_transactions" AS PERMISSIVE FOR INSERT TO "narua_app" WITH CHECK ((select private.has_store_role(store_id, 'balconista')));--> statement-breakpoint
CREATE POLICY "store_members_select" ON "store_members" AS PERMISSIVE FOR SELECT TO "narua_app" USING ((select private.has_store_role(store_id, 'balconista')));--> statement-breakpoint
CREATE POLICY "stores_select" ON "stores" AS PERMISSIVE FOR SELECT TO "narua_app" USING ((select private.has_store_role(id, 'balconista')));--> statement-breakpoint
CREATE POLICY "stores_update" ON "stores" AS PERMISSIVE FOR UPDATE TO "narua_app" USING ((select private.has_store_role(id, 'dono'))) WITH CHECK ((select private.has_store_role(id, 'dono')));