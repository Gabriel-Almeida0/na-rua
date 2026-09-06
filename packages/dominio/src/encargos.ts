/**
 * Multa e juros. Os tetos vivem aqui e no schema — nunca só na interface.
 * Ver docs/03-produto/02-regras-de-negocio.md, seção 3.
 *
 * ⚠️ Isto é regra de negócio derivada de pesquisa, não parecer jurídico.
 * Os pontos abertos estão em docs/06-compliance/01-requisitos-de-conformidade.md.
 */

import { type Centavos, centavos } from "./centavos.js";

/** Teto de multa de mora: 2% da prestação. CDC art. 52, §1º. */
export const MULTA_MAXIMA_BP = 200; // basis points

/**
 * Teto de juros remuneratórios para crediário de varejo: 12% ao ano.
 * STJ, REsp 1.720.656 — lojas não se equiparam a instituição financeira.
 *
 * ⚠️ Ponto aberto: a Lei 14.905/2024 alterou o art. 591 do Código Civil, que
 * era um dos fundamentos da decisão. Não há decisão posterior do STJ
 * localizada. Mantemos o teto conservador e o default em zero.
 */
export const JUROS_AA_MAXIMO_BP = 1200;

export class EncargoInvalidoError extends Error {
  constructor(motivo: string) {
    super(`Encargo inválido: ${motivo}`);
    this.name = "EncargoInvalidoError";
  }
}

export interface ConfiguracaoDeEncargos {
  /** Multa em basis points. 0 = sem multa (o padrão do fiado de bairro). */
  readonly multaBp: number;
  /** Juros ao ano em basis points. 0 = sem juros. */
  readonly jurosAaBp: number;
}

export const SEM_ENCARGOS: ConfiguracaoDeEncargos = {
  multaBp: 0,
  jurosAaBp: 0,
};

/** Valida a configuração contra os tetos. Roda no domínio, não só na UI. */
export function validarEncargos(cfg: ConfiguracaoDeEncargos): void {
  if (!Number.isInteger(cfg.multaBp) || cfg.multaBp < 0) {
    throw new EncargoInvalidoError("multa deve ser inteiro não negativo em bp");
  }
  if (cfg.multaBp > MULTA_MAXIMA_BP) {
    throw new EncargoInvalidoError(
      `multa de ${cfg.multaBp / 100}% excede o teto legal de 2% (CDC art. 52, §1º)`,
    );
  }
  if (!Number.isInteger(cfg.jurosAaBp) || cfg.jurosAaBp < 0) {
    throw new EncargoInvalidoError("juros devem ser inteiro não negativo em bp");
  }
  if (cfg.jurosAaBp > JUROS_AA_MAXIMO_BP) {
    throw new EncargoInvalidoError(
      `juros de ${cfg.jurosAaBp / 100}% a.a. excedem o teto de 12% a.a. ` +
        "(STJ REsp 1.720.656, crediário de varejo)",
    );
  }
}

export interface Encargos {
  readonly originario: Centavos;
  readonly multa: Centavos;
  readonly juros: Centavos;
  readonly total: Centavos;
  readonly diasAtraso: number;
}

/**
 * Calcula multa e juros de mora.
 *
 * Arredondamento sempre PARA BAIXO, em favor do freguês. Num app de cobrança,
 * o único arredondamento defensável é o que não cobra a mais.
 *
 * O resultado é discriminado item a item porque toda cobrança precisa mostrar
 * valor originário, multa, juros e total separados (Lei SP 17.832/2023, art. 49).
 */
export function calcularEncargos(params: {
  originario: Centavos;
  diasAtraso: number;
  config: ConfiguracaoDeEncargos;
}): Encargos {
  const { originario, diasAtraso, config } = params;
  validarEncargos(config);

  if (diasAtraso <= 0 || originario <= 0) {
    return {
      originario,
      multa: centavos(0),
      juros: centavos(0),
      total: originario,
      diasAtraso: Math.max(0, diasAtraso),
    };
  }

  const multa = centavos(Math.floor((originario * config.multaBp) / 10_000));
  const juros = centavos(
    Math.floor((originario * config.jurosAaBp * diasAtraso) / (10_000 * 365)),
  );

  return {
    originario,
    multa,
    juros,
    total: centavos(originario + multa + juros),
    diasAtraso,
  };
}
