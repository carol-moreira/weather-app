import type { PlaceKind } from "../types/place";
import type { HourlyForecastItem } from "../types/weather";
import { WeatherIcon } from "./Icon";

interface HourlyForecastProps {
  hours: HourlyForecastItem[];
  scope: PlaceKind;
}

/**
 * RF03 — a BASE da página: previsão hora a hora.
 *
 * Decisões de UX:
 *  - Cards em fila horizontal com rolagem (e "snap"): natural no celular,
 *    onde o gesto de arrastar para o lado é familiar. Não parece uma tabela.
 *  - O primeiro card é a hora atual: recebe destaque em verde-folha e o
 *    rótulo "Agora". Assim o usuário se orienta sem ler todos os horários.
 *  - Entrada escalonada: cada card aparece 40 ms depois do anterior
 *    (variável CSS `--i`), criando uma sensação de "onda" agradável.
 */
export function HourlyForecast({ hours, scope }: HourlyForecastProps) {
  return (
    <section className="forecast glass reveal" aria-labelledby="forecast-title">
      <h2 id="forecast-title" className="forecast__title">
        Previsão por hora{scope === "state" ? " · média do estado" : ""}
      </h2>

      {hours.length === 0 ? (
        <p className="forecast__empty">Não há mais horas de previsão para hoje.</p>
      ) : (
        <ul className="hours">
          {hours.map((hour, index) => (
            <li
              key={hour.time}
              className={`hour${index === 0 ? " hour--now" : ""}`}
              style={{ ["--i" as string]: index }}
            >
              <span className="hour__time">{index === 0 ? "Agora" : hour.time}</span>
              <WeatherIcon icon={hour.icon} size={28} className="hour__icon" />
              <span className="hour__temp">{Math.round(hour.temperature)}°</span>
              <span className="hour__condition">{hour.condition}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
