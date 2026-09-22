import { useCallback, useEffect, useRef, useState } from "react";
import { placeToTarget, resolveTypedText } from "../services/locationResolver";
import {
  fetchWeather,
  getErrorMessage,
  isAbortError,
} from "../services/weatherService";
import type { Place } from "../types/place";
import type { WeatherData, WeatherState, WeatherTarget } from "../types/weather";

/** O usuário pode buscar por texto digitado ou por uma sugestão já escolhida. */
export type SearchInput = string | Place;

/**
 * Encapsula todo o ciclo de vida da consulta: loading, sucesso, erro
 * e "refazer a última busca". Os componentes só consomem o resultado.
 */
export function useWeather() {
  const [state, setState] = useState<WeatherState>({ status: "idle" });
  // Último alvo consultado com sucesso: é o que o botão "Atualizar" reexecuta.
  // Guardamos o alvo já resolvido (coordenadas), então atualizar não refaz a geocodificação.
  const [lastTarget, setLastTarget] = useState<WeatherTarget | null>(null);

  // Controller da requisição em andamento, para cancelar se outra começar.
  const controllerRef = useRef<AbortController | null>(null);

  const run = useCallback(
    async (
      resolveTarget: (signal: AbortSignal) => Promise<WeatherTarget>,
      previous?: WeatherData,
    ) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      setState({ status: "loading", previous });

      try {
        const target = await resolveTarget(controller.signal);
        const data = await fetchWeather(target.query, controller.signal, {
          label: target.label,
          scope: target.scope,
        });
        setLastTarget(target);
        setState({ status: "success", data });
      } catch (error) {
        // Requisição cancelada por uma mais nova: não mexe no estado.
        if (isAbortError(error)) return;
        setState({ status: "error", message: getErrorMessage(error) });
      }
    },
    [],
  );

  /** RF01 – nova busca (sem dados anteriores: mostra o esqueleto de carregamento). */
  const search = useCallback(
    (input: SearchInput) =>
      run((signal) =>
        typeof input === "string"
          ? resolveTypedText(input, signal)
          : Promise.resolve(placeToTarget(input)),
      ),
    [run],
  );

  /**
   * RF04 – repete a última busca bem-sucedida.
   * Passamos os dados atuais como `previous` para manter a tela preenchida
   * (UX: atualizar não deve fazer o conteúdo "sumir").
   */
  const refresh = useCallback(() => {
    if (!lastTarget) return;
    const previous = state.status === "success" ? state.data : undefined;
    void run(() => Promise.resolve(lastTarget), previous);
  }, [run, lastTarget, state]);

  // Cancela requisição pendente se o componente for desmontado.
  useEffect(() => () => controllerRef.current?.abort(), []);

  return { state, search, refresh, canRefresh: lastTarget !== null };
}
