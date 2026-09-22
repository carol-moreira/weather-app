import type { PlaceKind } from "./place";

/**
 * Tipos do domínio da aplicação (o que a UI precisa).
 * Ficam separados dos tipos da API para que a interface não dependa
 * do formato de resposta do Visual Crossing.
 */

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  /** Probabilidade de chuva em % (0–100) */
  precipitationProbability: number;
  condition: string;
  /** Nome do ícone retornado pela API, ex.: "rain", "clear-day" */
  icon: string;
  tempMin: number;
  tempMax: number;
}

export interface HourlyForecastItem {
  /** Formato "HH:mm" */
  time: string;
  temperature: number;
  condition: string;
  icon: string;
}

export interface WeatherData {
  /** Nome do local já formatado para exibição, ex.: "Campinas, São Paulo, Brasil" */
  location: string;
  /**
   * O que foi pesquisado: "city" (uma cidade) ou "state" (um estado inteiro).
   * Quando é "state", a tela avisa que os valores são uma média de referência.
   */
  scope: PlaceKind;
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
}

/** O que o serviço precisa para consultar o clima de um lugar. */
export interface WeatherTarget {
  /** Texto para a API: um nome ("Campinas, SP") ou coordenadas ("-22.9,-47.06") */
  query: string;
  /** Nome para exibir. Se ausente, usamos o endereço devolvido pela API, formatado. */
  label?: string;
  scope?: PlaceKind;
}

/**
 * Estados possíveis da requisição — uma união discriminada evita estados impossíveis.
 *
 * `loading.previous`: ao ATUALIZAR, guardamos os dados que já estavam na tela.
 * Assim a interface não "pisca" para um esqueleto vazio: os números continuam
 * visíveis (levemente esmaecidos) enquanto o novo resultado chega.
 */
export type WeatherState =
  | { status: "idle" }
  | { status: "loading"; previous?: WeatherData }
  | { status: "success"; data: WeatherData }
  | { status: "error"; message: string };

/** ---- Formato bruto da API Visual Crossing (apenas os campos que usamos) ---- */

export interface ApiHour {
  datetime: string; // "08:00:00"
  temp: number;
  conditions: string;
  icon: string;
  precipprob: number | null;
}

export interface ApiDay {
  tempmax: number;
  tempmin: number;
  precipprob: number | null;
  humidity: number;
  feelslike: number;
  temp: number;
  conditions: string;
  icon: string;
  hours?: ApiHour[];
}

export interface ApiCurrentConditions {
  datetime: string; // "14:30:00" (hora local da cidade)
  temp: number;
  feelslike: number;
  humidity: number;
  precipprob: number | null;
  conditions: string;
  icon: string;
}

export interface ApiResponse {
  resolvedAddress: string;
  currentConditions?: ApiCurrentConditions;
  days: ApiDay[];
}
