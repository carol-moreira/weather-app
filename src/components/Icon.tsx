import type { ReactNode } from "react";
import { weatherIconName } from "../utils/weatherIcon";

/**
 * Conjunto de ícones SVG próprio (estilo "linha", traço de 1.75px).
 *
 * Decisão de UX/engenharia: sem biblioteca de ícones. São ~15 ícones simples,
 * então evitamos uma dependência e mantemos o bundle pequeno. Todos usam
 * `stroke="currentColor"`: a cor vem do CSS do elemento pai, o que garante que
 * os ícones sempre respeitem a paleta (branco, verde-folha, etc.).
 */
const ICONS = {
  // ── clima ──
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </>
  ),
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
  cloud: <path d="M17.5 19H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 0 1 0 9z" />,
  "cloud-sun": (
    <>
      <path d="M12 2v2M4.93 4.93l1.41 1.41M20 12h2M19.07 4.93l-1.41 1.41" />
      <path d="M15.95 12.65a4 4 0 0 0-5.93-4.13" />
      <path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6z" />
    </>
  ),
  "cloud-moon": (
    <>
      <path d="M13 16a3 3 0 1 1 0 6H7a5 5 0 1 1 4.9-6z" />
      <path d="M10.1 9A6 6 0 0 1 16 4a4.24 4.24 0 0 0 6 6 6 6 0 0 1-3 5.2" />
    </>
  ),
  "cloud-rain": (
    <>
      <path d="M4 14.9A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.24" />
      <path d="M16 14v6M8 14v6M12 16v6" />
    </>
  ),
  "cloud-lightning": (
    <>
      <path d="M6 16.33A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.97" />
      <path d="m13 12-3 5h4l-3 5" />
    </>
  ),
  snowflake: (
    <path d="M2 12h20M12 2v20m8-4-4-4 4-4M4 8l4 4-4 4m12-12-4 4-4-4M8 20l4-4 4 4" />
  ),
  "cloud-fog": (
    <>
      <path d="M4 14.9A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.24" />
      <path d="M16 17H7M17 21H9" />
    </>
  ),
  wind: (
    <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2M9.6 4.6A2 2 0 1 1 11 8H2M12.6 19.4A2 2 0 1 0 14 16H2" />
  ),

  // ── interface ──
  thermometer: <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0z" />,
  droplet: (
    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
  ),
  umbrella: <path d="M22 12a10 10 0 0 0-20 0zM12 12v8a2 2 0 0 0 4 0M12 2v1" />,
  refresh: (
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M8 16H3v5" />
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  pin: (
    <>
      <path d="M20 10c0 5-5.5 10.2-7.4 11.8a1 1 0 0 1-1.2 0C9.5 20.2 4 15 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  "arrow-up": <path d="M12 19V5M5 12l7-7 7 7" />,
  "arrow-down": <path d="M12 5v14M19 12l-7 7-7-7" />,
  alert: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof ICONS;

interface IconProps {
  name: IconName;
  size?: number | string;
  className?: string;
}

/** Ícone decorativo: `aria-hidden`, pois o texto ao lado já descreve a informação. */
export function Icon({ name, size = 24, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICONS[name]}
    </svg>
  );
}

/** Atalho: recebe o código da API ("rain", "clear-day"…) e desenha o ícone certo. */
export function WeatherIcon({
  icon,
  size,
  className,
}: {
  icon: string;
  size?: number | string;
  className?: string;
}) {
  return <Icon name={weatherIconName(icon)} size={size} className={className} />;
}
