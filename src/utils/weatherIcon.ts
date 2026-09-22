/**
 * Converte o código de ícone da API (ex.: "partly-cloudy-day") no nome de um
 * dos nossos ícones SVG monocromáticos.
 *
 * Por que não emojis (como na versão 1)? Emojis têm cores próprias e mudam de
 * aparência em cada sistema operacional. Ícones SVG usam `currentColor`, então
 * obedecem à paleta do projeto e ficam idênticos em qualquer lugar.
 */
export type WeatherIconName =
  | "sun"
  | "moon"
  | "cloud"
  | "cloud-sun"
  | "cloud-moon"
  | "cloud-rain"
  | "cloud-lightning"
  | "snowflake"
  | "cloud-fog"
  | "wind";

export function weatherIconName(icon: string): WeatherIconName {
  // A ordem importa: "thunder-rain" contém "rain", então trovoada vem antes.
  if (icon.includes("thunder")) return "cloud-lightning";
  if (/rain|showers|drizzle/.test(icon)) return "cloud-rain";
  if (/snow|sleet|hail/.test(icon)) return "snowflake";
  if (icon === "fog") return "cloud-fog";
  if (icon === "wind") return "wind";
  if (icon === "clear-day") return "sun";
  if (icon === "clear-night") return "moon";
  if (icon === "partly-cloudy-day") return "cloud-sun";
  if (icon === "partly-cloudy-night") return "cloud-moon";
  return "cloud"; // "cloudy" e qualquer código desconhecido
}
