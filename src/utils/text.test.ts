import { describe, expect, it } from "vitest";
import { normalizeText, toTitleCase } from "./text";

describe("normalizeText", () => {
  it("remove acentos e ignora maiúsculas", () => {
    expect(normalizeText("São Paulo")).toBe("sao paulo");
    expect(normalizeText("  BRASÍLIA ")).toBe("brasilia");
    expect(normalizeText("Ribeirão Preto")).toBe("ribeirao preto");
  });
});

describe("toTitleCase", () => {
  it("coloca iniciais maiúsculas e mantém preposições em minúsculas", () => {
    expect(toTitleCase("são bernardo do campo")).toBe("São Bernardo do Campo");
    expect(toTitleCase("RIO DE JANEIRO")).toBe("Rio de Janeiro");
  });

  it("mantém siglas de estado em maiúsculas depois da vírgula", () => {
    expect(toTitleCase("campinas, sp")).toBe("Campinas, SP");
    expect(toTitleCase("rio de janeiro, brasil")).toBe("Rio de Janeiro, Brasil");
  });

  it("trata nomes com hífen", () => {
    expect(toTitleCase("são joão-del-rei")).toBe("São João-Del-Rei");
  });
});
