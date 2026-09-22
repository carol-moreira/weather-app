import { describe, expect, it } from "vitest";
import { getWeatherTheme } from "./weatherTheme";
import { weatherIconName } from "./weatherIcon";

const base = { icon: "cloudy", temperature: 22, precipitationProbability: 10 };

describe("getWeatherTheme", () => {
  it("usa o tema neutro quando ainda não há dados", () => {
    expect(getWeatherTheme(null)).toBe("mild");
  });

  it("chuva pela condição da API", () => {
    expect(getWeatherTheme({ ...base, icon: "rain" })).toBe("rain");
    expect(getWeatherTheme({ ...base, icon: "thunder-showers-day" })).toBe("rain");
  });

  it("chuva por probabilidade alta, mesmo com céu aberto", () => {
    expect(
      getWeatherTheme({ ...base, icon: "clear-day", precipitationProbability: 70 }),
    ).toBe("rain");
  });

  it("chuva tem prioridade sobre calor", () => {
    expect(
      getWeatherTheme({ icon: "rain", temperature: 32, precipitationProbability: 90 }),
    ).toBe("rain");
  });

  it("sol: céu aberto de dia e temperatura a partir de 25 °C", () => {
    expect(getWeatherTheme({ ...base, icon: "clear-day", temperature: 25 })).toBe("sun");
    expect(getWeatherTheme({ ...base, icon: "partly-cloudy-day", temperature: 30 })).toBe("sun");
  });

  it("céu aberto abaixo de 25 °C não é sol", () => {
    expect(getWeatherTheme({ ...base, icon: "clear-day", temperature: 24 })).toBe("mild");
  });

  it("noite quente não usa o tema de sol", () => {
    expect(getWeatherTheme({ ...base, icon: "clear-night", temperature: 28 })).toBe("mild");
  });

  it("frio: abaixo de 18 °C", () => {
    expect(getWeatherTheme({ ...base, temperature: 17 })).toBe("cold");
    expect(getWeatherTheme({ ...base, temperature: 18 })).toBe("mild");
  });
});

describe("weatherIconName", () => {
  it("mapeia os códigos da API", () => {
    expect(weatherIconName("clear-day")).toBe("sun");
    expect(weatherIconName("thunder-rain")).toBe("cloud-lightning");
    expect(weatherIconName("showers-night")).toBe("cloud-rain");
    expect(weatherIconName("fog")).toBe("cloud-fog");
  });

  it("usa nuvem como padrão para códigos desconhecidos", () => {
    expect(weatherIconName("algo-novo")).toBe("cloud");
  });
});
