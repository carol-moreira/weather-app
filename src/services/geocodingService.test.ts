import { afterEach, describe, expect, it, vi } from "vitest";
import { parseQuery, searchPlaces } from "./geocodingService";
import { resolveTypedText } from "./locationResolver";

/** Resposta simulada da API de geocodificação. */
function mockGeocoding(results: object[] | undefined) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => (results ? { results } : {}),
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const saoPauloCity = {
  id: 1,
  name: "São Paulo",
  admin1: "São Paulo",
  country: "Brasil",
  country_code: "BR",
  population: 12_400_000,
  latitude: -23.55,
  longitude: -46.63,
};
const parana_ar = {
  id: 2,
  name: "Paraná",
  admin1: "Entre Ríos",
  country: "Argentina",
  country_code: "AR",
  population: 247_000,
  latitude: -31.73,
  longitude: -60.52,
};
const parana_rn = {
  id: 3,
  name: "Paraná",
  admin1: "Rio Grande do Norte",
  country: "Brasil",
  country_code: "BR",
  population: 3_900,
  latitude: -6.48,
  longitude: -38.31,
};

afterEach(() => vi.unstubAllGlobals());

describe("parseQuery", () => {
  it("separa o nome dos qualificadores normalizados", () => {
    expect(parseQuery("Campinas, SP")).toEqual({ name: "Campinas", qualifiers: ["sp"] });
    expect(parseQuery("Rio de Janeiro, Brasil")).toEqual({
      name: "Rio de Janeiro",
      qualifiers: ["brasil"],
    });
  });
});

describe("searchPlaces", () => {
  it("não consulta a API com menos de 3 letras", async () => {
    const fetchMock = mockGeocoding([]);
    expect(await searchPlaces("sa")).toEqual([]);
    expect(await searchPlaces("  ão ")).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("funciona sem acento e sem maiúsculas", async () => {
    mockGeocoding([saoPauloCity]);
    const places = await searchPlaces("sao paulo");
    expect(places[0].name).toBe("São Paulo");
    expect(places[0].label).toBe("São Paulo, São Paulo, Brasil");
  });

  it("mostra a CIDADE de São Paulo antes do estado (mais populosa)", async () => {
    mockGeocoding([saoPauloCity]);
    const places = await searchPlaces("São Paulo");
    expect(places.map((p) => p.kind)).toEqual(["city", "state"]);
  });

  it("inclui estados brasileiros mesmo que a API só devolva cidades", async () => {
    mockGeocoding([parana_ar, parana_rn]);
    const places = await searchPlaces("parana");
    // Estado do Paraná vem primeiro: é o "Paraná" mais provável para quem digita em português
    expect(places[0]).toMatchObject({ kind: "state", name: "Paraná", label: "Paraná, Brasil" });
  });

  it("usa o estado/país digitado para escolher entre cidades homônimas", async () => {
    mockGeocoding([parana_ar, parana_rn]);
    const places = await searchPlaces("Paraná, Rio Grande do Norte");
    expect(places).toHaveLength(1);
    expect(places[0].id).toBe("city-3");
  });

  it("entende a sigla do estado (RF01: cidade e estado)", async () => {
    mockGeocoding([
      { ...saoPauloCity, id: 10, name: "Campinas", admin1: "São Paulo", population: 1_200_000 },
      { ...saoPauloCity, id: 11, name: "Campinas", admin1: "Santa Catarina", population: 5_000 },
    ]);
    const places = await searchPlaces("Campinas, SP");
    expect(places.map((p) => p.id)).toEqual(["city-10"]);
  });

  it("devolve só estados quando a API não encontra nada", async () => {
    mockGeocoding(undefined);
    const places = await searchPlaces("goias");
    expect(places.map((p) => p.name)).toEqual(["Goiás"]);
  });

  it("falha de rede vira WeatherError('network')", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    await expect(searchPlaces("campinas")).rejects.toMatchObject({ kind: "network" });
  });
});

describe("resolveTypedText", () => {
  it("usa o melhor resultado, com coordenadas e nome formatado", async () => {
    mockGeocoding([saoPauloCity]);
    const target = await resolveTypedText("sao paulo");
    expect(target).toEqual({
      query: "-23.5500,-46.6300",
      label: "São Paulo, São Paulo, Brasil",
      scope: "city",
    });
  });

  it("marca o escopo como estado quando o melhor resultado é um estado", async () => {
    mockGeocoding([parana_ar, parana_rn]);
    const target = await resolveTypedText("parana");
    expect(target.scope).toBe("state");
  });

  it("se a geocodificação falhar, segue com o texto cru", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    expect(await resolveTypedText("Campinas")).toEqual({ query: "Campinas" });
  });

  it("rejeita texto vazio", async () => {
    await expect(resolveTypedText("   ")).rejects.toMatchObject({ kind: "empty_location" });
  });
});
