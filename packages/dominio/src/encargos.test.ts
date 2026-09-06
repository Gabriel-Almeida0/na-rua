import { describe, expect, it } from "vitest";
import { centavos } from "./centavos.ts";
import {
  EncargoInvalidoError,
  MULTA_MAXIMA_BP,
  SEM_ENCARGOS,
  calcularEncargos,
  validarEncargos,
} from "./encargos.ts";

describe("I7 · multa nunca passa de 2%", () => {
  it("aceita exatamente o teto", () => {
    expect(() => validarEncargos({ multaBp: MULTA_MAXIMA_BP, jurosAaBp: 0 })).not.toThrow();
  });

  it("rejeita 2,01% — a validação é do domínio, não da tela", () => {
    expect(() => validarEncargos({ multaBp: 201, jurosAaBp: 0 })).toThrow(EncargoInvalidoError);
    expect(() => validarEncargos({ multaBp: 201, jurosAaBp: 0 })).toThrow(/CDC art. 52/);
  });

  it("rejeita juros acima de 12% a.a.", () => {
    expect(() => validarEncargos({ multaBp: 0, jurosAaBp: 1201 })).toThrow(/REsp 1.720.656/);
  });

  it("rejeita valores não inteiros ou negativos", () => {
    expect(() => validarEncargos({ multaBp: -1, jurosAaBp: 0 })).toThrow();
    expect(() => validarEncargos({ multaBp: 1.5, jurosAaBp: 0 })).toThrow();
  });
});

describe("calcularEncargos", () => {
  it("o padrão do fiado de bairro é zero encargo", () => {
    const r = calcularEncargos({
      originario: centavos(24000),
      diasAtraso: 30,
      config: SEM_ENCARGOS,
    });
    expect(r.multa).toBe(0);
    expect(r.juros).toBe(0);
    expect(r.total).toBe(24000);
  });

  it("sem atraso não há encargo, mesmo configurado", () => {
    const r = calcularEncargos({
      originario: centavos(24000),
      diasAtraso: 0,
      config: { multaBp: 200, jurosAaBp: 1200 },
    });
    expect(r.total).toBe(24000);
  });

  it("discrimina originário, multa, juros e total (Lei SP 17.832 art. 49)", () => {
    const r = calcularEncargos({
      originario: centavos(24000),
      diasAtraso: 30,
      config: { multaBp: 200, jurosAaBp: 1200 },
    });
    expect(r.originario).toBe(24000);
    expect(r.multa).toBe(480); // 2% de 240,00
    expect(r.juros).toBe(Math.floor((24000 * 1200 * 30) / (10_000 * 365)));
    expect(r.total).toBe(r.originario + r.multa + r.juros);
  });

  it("arredonda para baixo, em favor do freguês", () => {
    // 2% de R$ 0,49 = 0,98 centavo. Cobrar 1 seria cobrar a mais.
    const r = calcularEncargos({
      originario: centavos(49),
      diasAtraso: 5,
      config: { multaBp: 200, jurosAaBp: 0 },
    });
    expect(r.multa).toBe(0);
  });

  it("propaga a validação de teto", () => {
    expect(() =>
      calcularEncargos({ originario: centavos(100), diasAtraso: 1, config: { multaBp: 500, jurosAaBp: 0 } }),
    ).toThrow(EncargoInvalidoError);
  });
});
