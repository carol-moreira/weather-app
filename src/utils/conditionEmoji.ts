/**
 * Mapeia o "icon" da Visual Crossing para um emoji.
 * Emojis evitam depender de imagens/bibliotecas de ícones num projeto simples.
 */
const ICONS: Record<string, string> = {
  "clear-day": "☀️",
  "clear-night": "🌙",
  "partly-cloudy-day": "⛅",
  "partly-cloudy-night": "☁️",
  cloudy: "☁️",
  rain: "🌧️",
  showers: "🌦️",
  "showers-day": "🌦️",
  "showers-night": "🌦️",
  "thunder-rain": "⛈️",
  "thunder-showers-day": "⛈️",
  "thunder-showers-night": "⛈️",
  snow: "❄️",
  fog: "🌫️",
  wind: "💨",
};

export function conditionEmoji(icon: string): string {
  return ICONS[icon] ?? "🌡️";
}
