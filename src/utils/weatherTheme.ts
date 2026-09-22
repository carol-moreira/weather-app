import type { CurrentWeather } from "../types/weather";

/**
 * ─────────────────────────────────────────────────────────────
 *  MAPEAMENTO CLIMA → TEMA VISUAL
 * ─────────────────────────────────────────────────────────────
 * Esta é a "regra de negócio" do visual: uma função PURA que recebe o clima
 * atual e devolve o nome de um tema. Nenhum componente decide cores ou
 * animações por conta própria — todos apenas leem o tema.
 *
 * Por que uma função pura?
 *  - é trivial de testar (veja weatherTheme.test.ts);
 *  - as regras ficam num único lugar: mudar "o que é calor" é mudar uma constante;
 *  - a UI fica declarativa: `data-theme="rain"` no CSS troca tudo.
 *
 * A ordem das regras é a PRIORIDADE: chuva vence sol, que vence frio.
 * (Chuva a 30 °C continua sendo um dia de chuva.)
 */

export type WeatherTheme = "rain" | "sun" | "cold" | "mild";

/** A partir de quantos % de chance de chuva o app "fecha o tempo". */
export const RAIN_PROBABILITY_THRESHOLD = 60;
/** Acima disso, com céu aberto, o tema é "sol". */
export const HOT_TEMPERATURE = 25;
/** Abaixo disso o tema é "frio". */
export const COLD_TEMPERATURE = 18;

type ThemeInput = Pick<
  CurrentWeather,
  "icon" | "temperature" | "precipitationProbability"
>;

// O campo "icon" da Visual Crossing é um código estável (ex.: "rain",
// "partly-cloudy-day"), mais confiável que comparar o texto traduzido.
const RAIN_ICON = /rain|showers|thunder|drizzle/;
const SUNNY_ICON = /^(clear|partly-cloudy)-day$/;

export function getWeatherTheme(current: ThemeInput | null): WeatherTheme {
  // Sem dados (tela inicial): tema calmo e neutro.
  if (!current) return "mild";

  const { icon, temperature, precipitationProbability } = current;

  // 1) Chuva: pela condição OU por probabilidade alta.
  if (
    RAIN_ICON.test(icon) ||
    precipitationProbability >= RAIN_PROBABILITY_THRESHOLD
  ) {
    return "rain";
  }

  // 2) Sol: céu aberto durante o dia E calor.
  if (SUNNY_ICON.test(icon) && temperature >= HOT_TEMPERATURE) {
    return "sun";
  }

  // 3) Frio: abaixo de 18 °C. Escolhi não exigir "nublado" — um dia frio de
  //    céu limpo também pede o clima cinza e sereno das nuvens passando.
  if (temperature < COLD_TEMPERATURE) return "cold";

  // 4) Todo o resto: dia ameno.
  return "mild";
}
