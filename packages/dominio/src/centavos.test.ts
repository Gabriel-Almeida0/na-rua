import { describe, expect, it } from "vitest";
import {
  ValorInvalidoError,
  centavos,
  centavosDeTexto,
  formatar,
  formatarSemSimbolo,
} from "./centavos.js";

describe("centavos", () => {
  it("rejeita não-inteiro — dinheiro fracionado não existe", () => {
    expect(() => centavos(47.5)).toThrow(ValorInvalidoError);
  });

  it("o bug clássico do float não acontece aqui", () => {
    // 0.1 + 0.2 !== 0.3 em float. Em centavos, 10 + 20 === 30.
    expect(centavos(10) + centavos(20)).toBe(30);
  });
});

describe("centavosDeTexto — o que o lojista digita", () => {
  const casos: Array<[string, number]> = [
    ["18,50", 1850],
    ["18.50", 1850],
    ["R$ 18,50", 1850],
    ["r$18,50", 1850],
    ["1.847,50", 184750],
    ["1847,50", 184750],
    ["1847", 184700],
    ["0,05", 5],
    ["0,5", 50],
    [",5", 50],
    ["100", 10000],
    ["-20,00", -2000],
    [" 47,50 ", 4750],
  ];

  for (const [entrada, esperado] of casos) {
    it(`"${entrada}" -> ${esperado}`, () => {
      expect(centavosDeTexto(entrada)).toBe(esperado);
    });
  }

  it("1.847 é mil oitocentos e quarenta e sete, não 1,847", () => {
    expect(centavosDeTexto("1.847")).toBe(184700);
  });

  it("ponto com 3 dígitos é milhar; vírgula com 3 dígitos é erro", () => {
    expect(centavosDeTexto("1.847")).toBe(184700);
    expect(centavosDeTexto("1.234.567")).toBe(123456700);
    // Aqui está a diferença que importa: adivinhar custaria mil vezes o valor.
    expect(() => centavosDeTexto("518,444")).toThrow(/duas casas/);
  });

  it("rejeita mais de duas casas decimais em vez de arredondar", () => {
    // Um concorrente real transformava 518,44 em 518,45. Isso destrói a
    // confiança na ferramenta inteira.
    expect(() => centavosDeTexto("518,444")).toThrow(ValorInvalidoError);
  });

  it("rejeita entrada vazia e lixo", () => {
    expect(() => centavosDeTexto("")).toThrow(ValorInvalidoError);
    expect(() => centavosDeTexto("   ")).toThrow(ValorInvalidoError);
    expect(() => centavosDeTexto("abc")).toThrow(ValorInvalidoError);
    expect(() => centavosDeTexto("12abc")).toThrow(ValorInvalidoError);
  });

  it("ida e volta preserva o valor", () => {
    for (const v of [0, 5, 50, 1850, 184750, 999999]) {
      expect(centavosDeTexto(formatarSemSimbolo(centavos(v)))).toBe(v);
    }
  });
});

describe("formatar", () => {
  it("sempre duas casas, separador brasileiro", () => {
    expect(formatar(centavos(4750))).toBe("R$ 47,50");
    expect(formatar(centavos(5))).toBe("R$ 0,05");
    expect(formatar(centavos(0))).toBe("R$ 0,00");
    expect(formatar(centavos(184750))).toBe("R$ 1.847,50");
  });

  it("crédito a favor do freguês aparece negativo", () => {
    expect(formatar(centavos(-2000))).toBe("-R$ 20,00");
  });
});
