import type { PlaceKind } from "../types/place";
import type { CurrentWeather } from "../types/weather";
import { Icon, WeatherIcon, type IconName } from "./Icon";

interface CurrentConditionsProps {
  location: string;
  current: CurrentWeather;
  /** "state" = o usuário pesquisou um estado inteiro (mostra aviso de média). */
  scope: PlaceKind;
  onRefresh: () => void;
  /** true enquanto uma atualização está em andamento (gira o ícone e desabilita o botão). */
  isRefreshing: boolean;
}

const round = (n: number) => Math.round(n);
const clampPercent = (n: number) => Math.min(100, Math.max(0, round(n)));

interface Stat {
  icon: IconName;
  label: string;
  value: string;
  /** Se existir, desenha uma barrinha de progresso (0–100). */
  percent?: number;
}

/**
 * RF02 + RF04 — o "HERO" da página.
 *
 * Hierarquia visual (do mais para o menos importante):
 *   1. Temperatura gigante e fina (é a resposta principal do app)
 *   2. Condição em texto + faixa mín/máx
 *   3. Cards de apoio (sensação, umidade, chuva) — pequenos e sutis
 */
export function CurrentConditions({
  location,
  current,
  scope,
  onRefresh,
  isRefreshing,
}: CurrentConditionsProps) {
  const isState = scope === "state";
  const humidity = clampPercent(current.humidity);
  const rain = clampPercent(current.precipitationProbability);

  const stats: Stat[] = [
    {
      icon: "thermometer",
      label: "Sensação térmica",
      value: `${round(current.feelsLike)}°`,
    },
    { icon: "droplet", label: "Umidade", value: `${humidity}%`, percent: humidity },
    { icon: "umbrella", label: "Chance de chuva", value: `${rain}%`, percent: rain },
  ];

  return (
    <>
      <section className="hero" aria-label="Condições atuais">
        <div className="hero__top">
          <p className="location-pill">
            <Icon name="pin" size={16} />
            <span>{location}</span>
          </p>

          {/* RF04: reexecuta a última consulta. */}
          <button
            type="button"
            className="btn btn--glass"
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-busy={isRefreshing}
          >
            <Icon
              name="refresh"
              size={18}
              className={isRefreshing ? "spin" : "refresh-icon"}
            />
            Atualizar
          </button>
        </div>

        {/* Aviso de média: um estado tem várias temperaturas ao mesmo tempo. */}
        {isState && (
          <aside className="notice glass reveal" role="note">
            <Icon name="info" size={20} />
            <p>
              <strong>Média do estado</strong>
              Você pesquisou um estado inteiro, e cada região dele tem uma
              temperatura diferente. Os valores abaixo são uma média de
              referência para o estado. Para ver o clima exato, busque uma
              cidade.
            </p>
          </aside>
        )}

        <div className="hero__main">
          {isState && <span className="hero__badge">Média do estado</span>}

          {/* Ícone grande com leve "flutuar" (keyframes bob) */}
          <WeatherIcon icon={current.icon} size={72} className="hero__icon" />

          <p className="hero__temp" aria-label={`${isState ? "Média de " : ""}${round(current.temperature)} graus Celsius`}>
            <span className="hero__temp-value">{round(current.temperature)}</span>
            <span className="hero__temp-unit">°C</span>
          </p>

          <p className="hero__condition">{current.condition}</p>

          <p className="hero__range">
            <span>
              <Icon name="arrow-down" size={16} />
              <span className="visually-hidden">Mínima </span>
              {round(current.tempMin)}°
            </span>
            <span>
              <Icon name="arrow-up" size={16} />
              <span className="visually-hidden">Máxima </span>
              {round(current.tempMax)}°
            </span>
          </p>
        </div>
      </section>

      {/* Dados secundários: pequenos, em cards de vidro, com barras de progresso */}
      <dl className="stats">
        {stats.map(({ icon, label, value, percent }, index) => (
          <div
            key={label}
            className="stat glass reveal"
            style={{ ["--i" as string]: index }}
          >
            <dt>
              <Icon name={icon} size={16} />
              {label}
            </dt>
            <dd>{value}</dd>
            {percent !== undefined && (
              <span className="meter" aria-hidden="true">
                <span style={{ width: `${percent}%` }} />
              </span>
            )}
          </div>
        ))}
      </dl>
    </>
  );
}
