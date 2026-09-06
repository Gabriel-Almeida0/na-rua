/**
 * Dinheiro no Na Rua é sempre inteiro em centavos. Nunca float, nunca decimal
 * de reais. Ver ADR-0005.
 *
 * Nota sobre `number` vs `bigint`: no Postgres a coluna é `bigint` (ADR-0005).
 * Em TypeScript representamos como `number` com validação de inteiro seguro,
 * porque `bigint` não sobrevive a `JSON.stringify` e a API entre o Fastify e o
 * PWA é JSON. O teto de `Number.MAX_SAFE_INTEGER` em centavos é da ordem de
 * R$ 90 trilhões — nove ordens de grandeza acima de qualquer caderneta.
 */

declare const marca: unique symbol;

/** Valor monetário em centavos. Sempre inteiro. Pode ser negativo (crédito a favor). */
export type Centavos = number & { readonly [marca]: "Centavos" };

export class ValorInvalidoError extends Error {
  readonly entrada: unknown;

  constructor(motivo: string, entrada: unknown) {
    super(`Valor monetário inválido: ${motivo}`);
    this.name = "ValorInvalidoError";
    this.entrada = entrada;
  }
}

/** Constrói Centavos a partir de um inteiro. Lança se não for inteiro seguro. */
export function centavos(valor: number): Centavos {
  if (!Number.isSafeInteger(valor)) {
    throw new ValorInvalidoError(
      "esperado inteiro seguro em centavos",
      valor,
    );
  }
  return valor as Centavos;
}

export const ZERO: Centavos = 0 as Centavos;

export function somar(...valores: Centavos[]): Centavos {
  return centavos(valores.reduce<number>((acc, v) => acc + v, 0));
}

export function subtrair(a: Centavos, b: Centavos): Centavos {
  return centavos(a - b);
}

export function negativo(v: Centavos): Centavos {
  return centavos(-v);
}

export function ehPositivo(v: Centavos): boolean {
  return v > 0;
}

/**
 * Converte o que o lojista digitou para centavos.
 *
 * Aceita as formas que aparecem num teclado numérico brasileiro: "18,50",
 * "18.50", "1.847,50", "1847", "R$ 18,50". Rejeita qualquer coisa com mais de
 * duas casas decimais, porque arredondar silenciosamente dinheiro de terceiros
 * é como se destrói a confiança na ferramenta.
 */
export function centavosDeTexto(entrada: string): Centavos {
  const limpo = entrada.trim().replace(/^R\$\s*/i, "").replace(/\s/g, "");
  if (limpo === "") throw new ValorInvalidoError("vazio", entrada);

  const negativa = limpo.startsWith("-");
  const semSinal = negativa ? limpo.slice(1) : limpo;

  if (!/^[\d.,]+$/.test(semSinal)) {
    throw new ValorInvalidoError("caracteres não numéricos", entrada);
  }

  // Regra de separadores, seguindo a convenção brasileira:
  //
  //   ","  é decimal. Precisa de 1 ou 2 dígitos depois. "518,444" é ERRO —
  //        provavelmente um dedo escorregado em "518,44", e adivinhar aqui
  //        significaria cobrar R$ 518.444,00 de alguém.
  //   "."  é milhar quando vêm exatamente 3 dígitos depois ("1.847"), e é
  //        decimal quando vêm 1 ou 2 ("18.50" — teclado sem vírgula).
  //
  // Quando é ambíguo, a função lança. Nunca adivinha valor de dinheiro.
  const ultimoSep = Math.max(semSinal.lastIndexOf(","), semSinal.lastIndexOf("."));
  let inteiros: string;
  let decimais: string;

  if (ultimoSep === -1) {
    inteiros = semSinal;
    decimais = "";
  } else {
    const sep = semSinal[ultimoSep];
    const depois = semSinal.slice(ultimoSep + 1);

    if (depois.length === 1 || depois.length === 2) {
      inteiros = semSinal.slice(0, ultimoSep);
      decimais = depois;
    } else if (sep === "." && depois.length === 3) {
      inteiros = semSinal;
      decimais = "";
    } else {
      throw new ValorInvalidoError(
        sep === ","
          ? "vírgula é separador decimal e aceita no máximo duas casas"
          : "agrupamento de milhar inválido",
        entrada,
      );
    }
  }

  const inteirosLimpos = inteiros.replace(/[.,]/g, "");
  if (inteirosLimpos !== "" && !/^\d+$/.test(inteirosLimpos)) {
    throw new ValorInvalidoError("separadores inconsistentes", entrada);
  }
  if (decimais !== "" && !/^\d{1,2}$/.test(decimais)) {
    throw new ValorInvalidoError("mais de duas casas decimais", entrada);
  }

  const total = Number(inteirosLimpos || "0") * 100 + Number(decimais.padEnd(2, "0") || "0");
  if (!Number.isSafeInteger(total)) {
    throw new ValorInvalidoError("valor grande demais", entrada);
  }
  return centavos(negativa ? -total : total);
}

/** Formata para exibição: 4750 -> "R$ 47,50". Sempre com duas casas. */
export function formatar(v: Centavos): string {
  const negativa = v < 0;
  const abs = Math.abs(v);
  const reais = Math.trunc(abs / 100);
  const cents = abs % 100;
  const reaisFmt = reais.toLocaleString("pt-BR");
  return `${negativa ? "-" : ""}R$ ${reaisFmt},${String(cents).padStart(2, "0")}`;
}

/** Formata sem o prefixo, para uso em campo de entrada: 4750 -> "47,50". */
export function formatarSemSimbolo(v: Centavos): string {
  return formatar(v).replace(/^(-?)R\$\s*/, "$1");
}
