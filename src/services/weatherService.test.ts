import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchWeather,
  mapResponse,
  WeatherError,
} from "./weatherService";
import type { ApiResponse } from "../types/weather";

const apiSample: ApiResponse = {
  resolvedAddress: "Campinas, SP, Brasil",
  currentConditions: {
    datetime: "09:30:00",
    temp: 21.4,
    feelslike: 21,
    humidity: 70,
    precipprob: 40,
    conditions: "Parcialmente nublado",
    icon: "partly-cloudy-day",
  },
  days: [
    {
      tempmax: 27,
      tempmin: 16,
      precipprob: 50,
      humidity: 68,
      feelslike: 22,
      temp: 22,
      conditions: "Chuva",
      icon: "rain",
      hours: [
        { datetime: "08:00:00", temp: 18, conditions: "Nublado", icon: "cloudy", precipprob: 0 },
        { datetime: "09:00:00", temp: 20, conditions: "Ensolarado", icon: "clear-day", precipprob: 0 },
        { datetime: "10:00:00", temp: 22, conditions: "Ensolarado", icon: "clear-day", precipprob: 10 },
      ],
    },
  ],
};

describe("mapResponse", () => {
  it("converte a resposta da API para o modelo da UI", () => {
    const result = mapResponse(apiSample);
    expect(result.location).toBe("Campinas, SP, Brasil");
    expect(result.current).toMatchObject({
      temperature: 21.4,
      tempMin: 16,
      tempMax: 27,
      precipitationProbability: 40,
    });
  });

  it("mostra apenas as horas a partir da hora atual da cidade", () => {
    const times = mapResponse(apiSample).hourly.map((h) => h.time);
    expect(times).toEqual(["09:00", "10:00"]);
  });
});

describe("nome e escopo do local", () => {
  it("usa o nome da geocodificação e o escopo informados", () => {
    const result = mapResponse(apiSample, { label: "Paraná, Brasil", scope: "state" });
    expect(result.location).toBe("Paraná, Brasil");
    expect(result.scope).toBe("state");
  });

  it("sem nome informado, formata o endereço da API (iniciais maiúsculas)", () => {
    const result = mapResponse({ ...apiSample, resolvedAddress: "são bernardo do campo" });
    expect(result.location).toBe("São Bernardo do Campo");
    expect(result.scope).toBe("city");
  });
});

describe("fetchWeather", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_VISUAL_CROSSING_API_KEY", "test-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("rejeita campo vazio sem chamar a API (RF05)", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchWeather("   ")).rejects.toMatchObject({
      kind: "empty_location",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("informa chave ausente sem chamar a API", async () => {
    vi.stubEnv("VITE_VISUAL_CROSSING_API_KEY", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchWeather("Campinas")).rejects.toMatchObject({
      kind: "missing_key",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("classifica status 401 como chave recusada pela API", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 401 }));
    await expect(fetchWeather("Campinas")).rejects.toMatchObject({
      kind: "invalid_key",
    });
  });

  it("retorna os dados quando a API responde 200", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => apiSample }),
    );

    const data = await fetchWeather("Campinas, SP");
    expect(data.location).toBe("Campinas, SP, Brasil");
  });

  it("codifica o local na URL", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, status: 200, json: async () => apiSample });
    vi.stubGlobal("fetch", fetchMock);

    await fetchWeather("São Paulo");
    expect(fetchMock.mock.calls[0][0]).toContain("S%C3%A3o%20Paulo");
  });

  it("classifica status 400 como cidade não encontrada (RF05)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 400 }));
    await expect(fetchWeather("xxxxxx")).rejects.toMatchObject({ kind: "not_found" });
  });

  it("classifica falha de rede como erro de comunicação (RF05)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    const promise = fetchWeather("Campinas");
    await expect(promise).rejects.toBeInstanceOf(WeatherError);
    await expect(promise).rejects.toMatchObject({ kind: "network" });
  });
});
