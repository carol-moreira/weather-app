import { CurrentConditions } from "./components/CurrentConditions";
import { ErrorMessage, Loading } from "./components/Feedback";
import { HourlyForecast } from "./components/HourlyForecast";
import { Icon } from "./components/Icon";
import { SearchForm } from "./components/SearchForm";
import { WeatherBackground } from "./components/WeatherBackground";
import { useWeather } from "./hooks/useWeather";
import { getWeatherTheme } from "./utils/weatherTheme";

// Exemplos do enunciado (RF01): cidade, cidade + estado, cidade + país.
const SUGGESTIONS = ["São Paulo", "Campinas, SP", "Rio de Janeiro, Brasil"];

/**
 * Estrutura da página (de cima para baixo):
 *   HEADER → marca + busca flutuante
 *   HERO   → clima atual gigante + cards de apoio   (CurrentConditions)
 *   BASE   → previsão hora a hora                   (HourlyForecast)
 * Atrás de tudo, o WeatherBackground anima o céu conforme o clima.
 */
export default function App() {
  const { state, search, refresh, canRefresh } = useWeather();
  const isLoading = state.status === "loading";

  // Dados exibíveis: os atuais OU, durante uma atualização, os anteriores.
  const data =
    state.status === "success"
      ? state.data
      : state.status === "loading"
        ? state.previous
        : undefined;

  // A regra clima → tema vive em utils/weatherTheme.ts (função pura e testada).
  // O resultado vai para `data-theme`; o CSS faz o resto.
  const theme = getWeatherTheme(data?.current ?? null);

  return (
    <div className="app-shell" data-theme={theme}>
      <WeatherBackground theme={theme} />

      <div className="app">
        {/* ── HEADER ── */}
        <header className="header">
          <div className="brand">
            <span className="brand__logo">
              <Icon name="cloud-sun" size={22} />
            </span>
            <h1>Clima Agora</h1>
          </div>

          <SearchForm
            onSearch={search}
            disabled={isLoading}
            suggestions={state.status === "idle" ? SUGGESTIONS : undefined}
          />
        </header>

        <main>
          {/* Cada status corresponde a exatamente uma tela. */}
          {state.status === "idle" && (
            <section className="welcome reveal">
              <Icon name="cloud-sun" size={64} className="welcome__icon" />
              <h2>Como está o tempo hoje?</h2>
              <p>Busque uma cidade e veja o clima agora, hora a hora.</p>
            </section>
          )}

          {/* Primeira busca: esqueleto de carregamento */}
          {isLoading && !state.previous && <Loading />}

          {state.status === "error" && (
            <ErrorMessage
              message={state.message}
              onRetry={canRefresh ? refresh : undefined}
            />
          )}

          {/* Sucesso OU atualização em andamento (mantém os dados na tela, esmaecidos). */}
          {data && (
            <div className="results" data-refreshing={isLoading}>
              <CurrentConditions
                location={data.location}
                current={data.current}
                scope={data.scope}
                onRefresh={refresh}
                isRefreshing={isLoading}
              />
              <HourlyForecast hours={data.hourly} scope={data.scope} />
            </div>
          )}
        </main>

        <footer className="footer">Dados por Visual Crossing Weather</footer>
      </div>
    </div>
  );
}
