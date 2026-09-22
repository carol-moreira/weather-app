import type { Place } from "../types/place";
import type { WeatherTarget } from "../types/weather";
import { searchPlaces } from "./geocodingService";
import { isAbortError, WeatherError } from "./weatherService";

/**
 * Converte um lugar escolhido em "alvo" da consulta de clima.
 * Consultamos a Visual Crossing por COORDENADAS: elimina ambiguidade
 * ("São Paulo" cidade ≠ "São Paulo" estado) e não depende de acentuação.
 */
export function placeToTarget(place: Place): WeatherTarget {
  return {
    query: `${place.latitude.toFixed(4)},${place.longitude.toFixed(4)}`,
    label: place.label,
    scope: place.kind,
  };
}

/**
 * Resolve o texto que o usuário DIGITOU (sem escolher uma sugestão).
 *  - Achou lugar → usa o melhor resultado (mesma ordem das sugestões).
 *  - Não achou, ou o serviço de geocodificação falhou → usa o texto cru:
 *    a própria Visual Crossing tenta localizar e, se não conseguir,
 *    devolve "não encontrado" (RF05). A busca nunca fica bloqueada por
 *    causa de um serviço auxiliar.
 */
export async function resolveTypedText(
  text: string,
  signal?: AbortSignal,
): Promise<WeatherTarget> {
  const query = text.trim();
  if (!query) throw new WeatherError("empty_location");

  try {
    const [best] = await searchPlaces(query, signal);
    if (best) return placeToTarget(best);
  } catch (error) {
    if (isAbortError(error)) throw error;
    // geocodificação indisponível: segue com o texto cru
  }

  return { query };
}
