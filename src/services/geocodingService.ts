import { BRAZIL_STATES, type BrazilState } from "../data/brazilStates";
import type { Place } from "../types/place";
import { normalizeText } from "../utils/text";
import { isAbortError, WeatherError } from "./weatherService";

/**
 * ─────────────────────────────────────────────────────────────
 *  GEOCODIFICAÇÃO: transforma o texto digitado em lugares reais
 * ─────────────────────────────────────────────────────────────
 * Serve a três necessidades ao mesmo tempo:
 *   1. SUGESTÕES enquanto o usuário digita;
 *   2. BUSCA SEM ACENTO ("sao paulo" acha "São Paulo");
 *   3. NOME CORRETO para exibir ("São Bernardo do Campo"), em vez de
 *      repetir o que o usuário digitou.
 *
 * Fonte das cidades: Open-Meteo Geocoding (gratuita, sem chave, com CORS).
 * Os estados vêm de uma lista local (data/brazilStates.ts).
 */

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";

/** Só sugerimos a partir de 3 letras (evita resultados ruidosos e chamadas à toa). */
export const MIN_SEARCH_CHARS = 3;
const MAX_SUGGESTIONS = 6;

/**
 * "População" simbólica de um estado, usada só para ordenar.
 * Assim, "São Paulo" (12 mi) e "Rio de Janeiro" (6 mi) mostram a CIDADE
 * primeiro, mas "Paraná" ou "Goiás" mostram o ESTADO antes de cidadezinhas
 * homônimas (que têm poucos milhares de habitantes).
 */
const STATE_POPULATION_WEIGHT = 1_000_000;

interface GeoResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
  admin1?: string;
  population?: number | null;
}

/**
 * Separa "Campinas, SP" em nome ("Campinas") e qualificadores (["sp"]).
 * O nome vai para a API; os qualificadores servem para escolher entre
 * cidades homônimas (RF01: cidade + estado, cidade + país).
 */
export function parseQuery(raw: string): { name: string; qualifiers: string[] } {
  const [name = "", ...rest] = raw.split(",");
  return {
    name: name.trim(),
    qualifiers: rest.map(normalizeText).filter(Boolean),
  };
}

const stateByName = new Map(
  BRAZIL_STATES.map((state) => [normalizeText(state.name), state]),
);

function stateToPlace(state: BrazilState): Place {
  return {
    id: `state-${state.uf}`,
    kind: "state",
    name: state.name,
    detail: "Estado · Brasil",
    label: `${state.name}, Brasil`,
    latitude: state.latitude,
    longitude: state.longitude,
    population: STATE_POPULATION_WEIGHT,
    countryCode: "BR",
    tags: [normalizeText(state.name), state.uf.toLowerCase(), "brasil", "brazil", "br"],
  };
}

function resultToPlace(result: GeoResult): Place {
  const country = result.country ?? "";
  const countryCode = result.country_code ?? "";
  const brazilianState = result.admin1
    ? stateByName.get(normalizeText(result.admin1))
    : undefined;

  const tags = [
    result.admin1,
    brazilianState?.uf,
    country,
    countryCode,
    countryCode === "BR" ? "brazil" : undefined,
  ]
    .filter((tag): tag is string => Boolean(tag))
    .map(normalizeText);

  return {
    id: `city-${result.id}`,
    kind: "city",
    name: result.name,
    detail: [result.admin1, country].filter(Boolean).join(", "),
    label: [result.name, result.admin1, country].filter(Boolean).join(", "),
    latitude: result.latitude,
    longitude: result.longitude,
    population: result.population ?? 0,
    countryCode,
    tags,
  };
}

async function fetchCities(name: string, signal?: AbortSignal): Promise<Place[]> {
  const params = new URLSearchParams({
    name,
    count: "10",
    language: "pt", // nomes de países e estados em português
    format: "json",
  });

  let response: Response;
  try {
    response = await fetch(`${GEOCODING_URL}?${params}`, { signal });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new WeatherError("network");
  }
  if (!response.ok) throw new WeatherError("network");

  // Quando nada é encontrado, a API simplesmente omite o campo "results".
  const data = (await response.json()) as { results?: GeoResult[] };
  return (data.results ?? []).map(resultToPlace);
}

/** Ordena: nome idêntico primeiro, depois começa-com; dentro disso, Brasil e mais populosos. */
function byRelevance(query: string) {
  const tier = (place: Place) => {
    const name = normalizeText(place.name);
    if (name === query) return 0;
    if (name.startsWith(query)) return 1;
    return 2;
  };

  return (a: Place, b: Place) =>
    tier(a) - tier(b) ||
    Number(b.countryCode === "BR") - Number(a.countryCode === "BR") ||
    b.population - a.population;
}

/** Um qualificador casa com uma tag se for igual (ou, com 3+ letras, o início dela). */
function matchesQualifier(place: Place, qualifier: string): boolean {
  return place.tags.some(
    (tag) => tag === qualifier || (qualifier.length >= MIN_SEARCH_CHARS && tag.startsWith(qualifier)),
  );
}

/**
 * Busca lugares (estados + cidades) para o texto digitado.
 * Devolve lista vazia se o nome tiver menos de 3 letras.
 */
export async function searchPlaces(
  rawQuery: string,
  signal?: AbortSignal,
): Promise<Place[]> {
  const { name, qualifiers } = parseQuery(rawQuery);
  const query = normalizeText(name);
  if (query.length < MIN_SEARCH_CHARS) return [];

  const states = BRAZIL_STATES.filter((state) =>
    normalizeText(state.name).includes(query),
  ).map(stateToPlace);

  const cities = await fetchCities(name, signal);

  // Remove duplicados por id (a mesma cidade pode vir repetida)
  const unique = [...new Map([...states, ...cities].map((p) => [p.id, p])).values()];

  // "Campinas, SP": mantém só o que casa com TODOS os qualificadores.
  // Se nada casar, não escondemos tudo — mostramos os resultados sem filtro.
  const matching = qualifiers.length
    ? unique.filter((place) => qualifiers.every((q) => matchesQualifier(place, q)))
    : unique;
  const pool = matching.length > 0 ? matching : unique;

  return pool.sort(byRelevance(query)).slice(0, MAX_SUGGESTIONS);
}
