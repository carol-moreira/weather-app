import { Icon } from "./Icon";

/**
 * Estado de carregamento com "skeleton" (esqueleto).
 *
 * Por que não só um spinner? O esqueleto mostra a FORMA do conteúdo que vai
 * chegar, então a página não "pula" quando os dados aparecem, e o usuário
 * percebe o app como mais rápido (perceived performance).
 * `role="status"` faz leitores de tela anunciarem o texto oculto.
 */
export function Loading() {
  return (
    <div className="loading" role="status" aria-live="polite">
      <span className="visually-hidden">Buscando informações do clima…</span>

      <div className="hero hero--skeleton" aria-hidden="true">
        <div className="skeleton skeleton--pill" />
        <div className="skeleton skeleton--temp" />
        <div className="skeleton skeleton--line" />
      </div>

      <div className="stats" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="stat glass">
            <div className="skeleton skeleton--line" />
            <div className="skeleton skeleton--value" />
          </div>
        ))}
      </div>

      <div className="forecast glass" aria-hidden="true">
        <div className="hours">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="skeleton skeleton--hour" />
          ))}
        </div>
      </div>
    </div>
  );
}

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

/**
 * RF05: mensagem de erro amigável, com opção de tentar novamente.
 * Sem vermelho: a paleta do projeto não o inclui. O significado é
 * transmitido por ícone + texto claro (nunca só por cor — boa prática de acessibilidade).
 */
export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="error-card glass reveal" role="alert">
      <Icon name="alert" size={32} className="error-card__icon" />
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn--glass" onClick={onRetry}>
          Tentar novamente
        </button>
      )}
    </div>
  );
}
