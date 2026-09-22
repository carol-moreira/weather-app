import type { PlaceKind } from "../types/place";
import type {
  ApiResponse,
  HourlyForecastItem,
  WeatherData,
} from "../types/weather";
import { toTitleCase } from "../utils/text";

const BASE_URL =
  "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline";

/** Quantidade de horas exibidas na previsão horária (RF03). */
export const HOURS_TO_SHOW = 12;

/** Categorias de erro que a UI sabe explicar ao usuário (RF05). */
export type WeatherErrorKind =
  | "empty_location"
  | "not_found"
  | "network"
  | "missing_key"
  | "invalid_key"
  | "rate_limit"
  | "unknown";

/**
 * Erro próprio do serviço. Carrega uma "kind" para a camada de UI decidir a
 * mensagem, sem precisar interpretar status HTTP.
 */
export class WeatherError extends Error {
  readonly kind: WeatherErrorKind;

  constructor(kind: WeatherErrorKind, message?: string) {
    super(message ?? kind);
    this.name = "WeatherError";
    this.kind = kind;
  }
}

/** Mensagens amigáveis por categoria de erro. */
export const ERROR_MESSAGES: Record<WeatherErrorKind, string> = {
  empty_location: "Digite o nome de uma cidade para buscar.",
  not_found:
    "Não foi possível localizar a cidade informada. Confira a grafia e tente novamente.",
  network:
    "Não foi possível se comunicar com o serviço de clima. Verifique sua conexão e tente novamente.",
  missing_key:
    "Chave da API não encontrada. Crie o arquivo .env na raiz do projeto com VITE_VISUAL_CROSSING_API_KEY=suachave e reinicie o servidor (npm run dev).",
  invalid_key:
    "A API recusou a chave informada. Confira se a chave no arquivo .env está correta.",
  rate_limit:
    "O limite de consultas foi atingido. Aguarde alguns instantes e tente de novo.",
  unknown: "Ocorreu um erro inesperado. Tente novamente em instantes.",
};

/** Requisição cancelada de propósito (AbortController): não é uma falha. */
export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

/** Traduz qualquer erro capturado para uma mensagem amigável. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof WeatherError) return ERROR_MESSAGES[error.kind];
  return ERROR_MESSAGES.unknown;
}

function buildUrl(location: string, apiKey: string): string {
  const params = new URLSearchParams({
    unitGroup: "metric", // °C
    lang: "pt", // condições em português
    include: "current,hours", // só o que precisamos: agora + horas do dia
    contentType: "json",
    key: apiKey,
  });
  // encodeURIComponent: o local vai no PATH da URL ("Campinas, SP" tem espaço e vírgula)
  return `${BASE_URL}/${encodeURIComponent(location)}/today?${params}`;
}

/** Converte "08:00:00" em "08:00". */
function formatTime(datetime: string): string {
  return datetime.slice(0, 5);
}

/**
 * Transforma a resposta bruta da API no modelo que a UI consome.
 * Exportada para poder ser testada isoladamente.
 */
export function mapResponse(
  api: ApiResponse,
  options: FetchOptions = {},
): WeatherData {
  const today = api.days?.[0];
  if (!today) throw new WeatherError("unknown", "Resposta sem dados do dia");

  // A API pode não devolver "current" — usamos os dados do dia como fallback.
  const now = api.currentConditions;

  // Filtra as horas a partir da hora atual da CIDADE (não do navegador).
  const currentHour = now ? Number(now.datetime.slice(0, 2)) : 0;

  const hourly: HourlyForecastItem[] = (today.hours ?? [])
    .filter((hour) => Number(hour.datetime.slice(0, 2)) >= currentHour)
    .slice(0, HOURS_TO_SHOW)
    .map((hour) => ({
      time: formatTime(hour.datetime),
      temperature: hour.temp,
      condition: hour.conditions,
      icon: hour.icon,
    }));

  return {
    // Prioridade: nome já formatado pela geocodificação. Se não houver, usamos o
    // endereço da API com iniciais maiúsculas (a API pode devolver o texto
    // exatamente como o usuário digitou, ex.: "são bernardo do campo").
    location: options.label ?? toTitleCase(api.resolvedAddress),
    scope: options.scope ?? "city",
    current: {
      temperature: now?.temp ?? today.temp,
      feelsLike: now?.feelslike ?? today.feelslike,
      humidity: now?.humidity ?? today.humidity,
      precipitationProbability: now?.precipprob ?? today.precipprob ?? 0,
      condition: now?.conditions ?? today.conditions,
      icon: now?.icon ?? today.icon,
      tempMin: today.tempmin,
      tempMax: today.tempmax,
    },
    hourly,
  };
}

/** Informações extras sobre o local consultado (vindas da geocodificação). */
export interface FetchOptions {
  label?: string;
  scope?: PlaceKind;
}

/**
 * Busca o clima de hoje para o local informado.
 * Lança WeatherError com uma "kind" clara para cada tipo de falha.
 */
export async function fetchWeather(
  location: string,
  signal?: AbortSignal,
  options: FetchOptions = {},
): Promise<WeatherData> {
  const query = location.trim();
  if (!query) throw new WeatherError("empty_location");

  const apiKey = import.meta.env.VITE_VISUAL_CROSSING_API_KEY as
    | string
    | undefined;
  if (!apiKey?.trim()) throw new WeatherError("missing_key");

  let response: Response;
  try {
    response = await fetch(buildUrl(query, apiKey), { signal });
  } catch (error) {
    // Cancelamento não é falha: repassamos para quem chamou ignorar.
    if (isAbortError(error)) throw error;
    // fetch só rejeita em falha de rede (offline, DNS, CORS, etc.)
    throw new WeatherError("network");
  }

  if (!response.ok) {
    // A Visual Crossing responde 400 para local inválido.
    if (response.status === 400 || response.status === 404) {
      throw new WeatherError("not_found");
    }
    if (response.status === 401 || response.status === 403) {
      throw new WeatherError("invalid_key");
    }
    if (response.status === 429) throw new WeatherError("rate_limit");
    throw new WeatherError("unknown", `HTTP ${response.status}`);
  }

  try {
    return mapResponse((await response.json()) as ApiResponse, options);
  } catch (error) {
    if (error instanceof WeatherError) throw error;
    throw new WeatherError("unknown", "Resposta da API em formato inesperado");
  }
}
