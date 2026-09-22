/**
 * Um "lugar" que o usuário pode escolher: uma cidade ou um estado inteiro.
 * É o que aparece na lista de sugestões e o que alimenta a consulta de clima.
 */
export type PlaceKind = "city" | "state";

export interface Place {
  id: string;
  kind: PlaceKind;
  /** Nome curto, já com acentos e maiúsculas corretos. Ex.: "São Bernardo do Campo" */
  name: string;
  /** Segunda linha da sugestão. Ex.: "São Paulo, Brasil" ou "Estado · Brasil" */
  detail: string;
  /** Nome completo exibido na tela. Ex.: "São Bernardo do Campo, São Paulo, Brasil" */
  label: string;
  latitude: number;
  longitude: number;
  population: number;
  countryCode: string;
  /**
   * Termos normalizados (minúsculos, sem acento) usados para entender
   * qualificadores digitados: "Campinas, SP" → "sp" casa com o estado da cidade.
   */
  tags: string[];
}
