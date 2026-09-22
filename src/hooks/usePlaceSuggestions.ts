import { useEffect, useState } from "react";
import { MIN_SEARCH_CHARS, parseQuery, searchPlaces } from "../services/geocodingService";
import { isAbortError } from "../services/weatherService";
import type { Place } from "../types/place";
import { normalizeText } from "../utils/text";

const DEBOUNCE_MS = 300;

interface SuggestionsState {
  /** O texto para o qual `places` foi calculado (evita usar sugestões "velhas"). */
  query: string;
  places: Place[];
  status: "idle" | "loading" | "done";
}

const EMPTY: SuggestionsState = { query: "", places: [], status: "idle" };

/**
 * Sugestões de lugares enquanto o usuário digita.
 *
 * Duas proteções para não sobrecarregar a API nem mostrar dados errados:
 *  - DEBOUNCE: espera 300 ms sem digitar antes de consultar. Quem digita
 *    "campinas" rápido dispara 1 chamada, não 8.
 *  - CANCELAMENTO: se o texto muda, a requisição anterior é abortada, então
 *    uma resposta lenta nunca sobrescreve uma mais nova.
 */
export function usePlaceSuggestions(query: string, enabled: boolean) {
  const [state, setState] = useState<SuggestionsState>(EMPTY);

  useEffect(() => {
    const longEnough =
      normalizeText(parseQuery(query).name).length >= MIN_SEARCH_CHARS;

    if (!enabled || !longEnough) {
      setState(EMPTY);
      return;
    }

    const controller = new AbortController();
    setState((prev) => ({ ...prev, status: "loading" }));

    const timer = setTimeout(async () => {
      try {
        const places = await searchPlaces(query, controller.signal);
        setState({ query, places, status: "done" });
      } catch (error) {
        if (isAbortError(error)) return;
        // Falha nas sugestões não é crítica: a busca normal continua funcionando.
        setState({ query, places: [], status: "done" });
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, enabled]);

  return state;
}
