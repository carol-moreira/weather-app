import { useState, type FormEvent, type KeyboardEvent } from "react";
import type { SearchInput } from "../hooks/useWeather";
import { usePlaceSuggestions } from "../hooks/usePlaceSuggestions";
import { MIN_SEARCH_CHARS, parseQuery } from "../services/geocodingService";
import { ERROR_MESSAGES } from "../services/weatherService";
import type { Place } from "../types/place";
import { normalizeText } from "../utils/text";
import { Icon } from "./Icon";

interface SearchFormProps {
  onSearch: (input: SearchInput) => void;
  disabled: boolean;
  /** Atalhos de busca (mostrados na tela inicial para reduzir o esforço de digitação). */
  suggestions?: string[];
}

/**
 * RF01 + RF05 (campo vazio): busca com AUTOCOMPLETE.
 *
 * Decisões de UX:
 *  - "Pílula flutuante": campo e botão num único contêiner branco com sombra
 *    profunda. Parece um controle só e se destaca do fundo.
 *  - Foco explícito (`:focus-within`): borda e halo verde-folha.
 *  - Sugestões a partir de 3 letras, sem exigir acento ("sao paulo" funciona).
 *    A primeira já vem destacada: digitou e apertou Enter, vai no mais provável.
 *  - Teclado completo: ↑ ↓ navegam, Enter escolhe, Esc fecha. O padrão ARIA
 *    "combobox" garante que leitores de tela anunciem a lista.
 *  - Validação sem alert(): mensagem abaixo, com "tremor" e ícone + texto
 *    (não depende só de cor).
 */
export function SearchForm({ onSearch, disabled, suggestions }: SearchFormProps) {
  const [value, setValue] = useState("");
  const [selected, setSelected] = useState<Place | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Só consulta sugestões enquanto a lista está aberta e nenhuma foi escolhida.
  const lookup = usePlaceSuggestions(value, open && selected === null);

  const longEnough =
    normalizeText(parseQuery(value).name).length >= MIN_SEARCH_CHARS;
  // Só usamos as sugestões se forem do texto ATUAL (não de uma digitação anterior).
  const places = lookup.query === value ? lookup.places : [];
  const isListVisible = open && longEnough && !disabled;
  const activeOption = places[activeIndex];

  function choose(place: Place) {
    setValue(place.label); // o campo mostra o nome correto e completo
    setSelected(place);
    setOpen(false);
    setValidationError(null);
    onSearch(place);
  }

  function submitText(text: string, place: Place | null = selected) {
    if (!text.trim()) {
      // Validação no cliente: nem chamamos a API se o campo estiver vazio.
      setValidationError(ERROR_MESSAGES.empty_location);
      return;
    }
    setValidationError(null);
    setOpen(false);
    onSearch(place ?? text);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); // evita recarregar a página

    // Lista aberta com opção destacada: Enter/Buscar escolhe essa opção.
    if (isListVisible && activeOption && selected === null) {
      choose(activeOption);
      return;
    }
    submitText(value);
  }

  function handleChange(text: string) {
    setValue(text);
    setSelected(null); // mudou o texto: a escolha anterior não vale mais
    setOpen(true);
    setActiveIndex(0);
    // Some com o erro assim que o usuário volta a digitar
    if (validationError) setValidationError(null);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

    event.preventDefault(); // impede o cursor de pular para o início/fim do texto
    if (!isListVisible) {
      setOpen(true);
      return;
    }
    if (places.length === 0) return;
    const step = event.key === "ArrowDown" ? 1 : -1;
    setActiveIndex((index) => (index + step + places.length) % places.length);
  }

  function handleChip(text: string) {
    setValue(text);
    setSelected(null);
    submitText(text, null); // `selected` ainda tem o valor antigo neste render

  }

  return (
    <form className="search" onSubmit={handleSubmit} noValidate role="search">
      <div className="search-pill" data-invalid={validationError !== null}>
        <Icon name="search" size={20} className="search-pill__icon" />

        <label htmlFor="location" className="visually-hidden">
          Cidade ou estado
        </label>
        <input
          id="location"
          type="text"
          role="combobox"
          value={value}
          placeholder="Buscar cidade ou estado…"
          autoComplete="off"
          autoCapitalize="words"
          enterKeyHint="search"
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={handleKeyDown}
          aria-invalid={validationError !== null}
          aria-describedby={validationError ? "location-error" : undefined}
          aria-expanded={isListVisible}
          aria-controls="place-suggestions"
          aria-autocomplete="list"
          aria-activedescendant={
            isListVisible && activeOption ? `place-option-${activeIndex}` : undefined
          }
        />

        <button type="submit" className="btn btn--primary" disabled={disabled}>
          {disabled ? <span className="btn__spinner" aria-hidden="true" /> : null}
          Buscar
        </button>
      </div>

      {isListVisible && (
        <div className="suggestions">
          {places.length > 0 ? (
            <ul id="place-suggestions" role="listbox" aria-label="Sugestões de lugares">
              {places.map((place, index) => (
                <li
                  key={place.id}
                  id={`place-option-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  className="option"
                  // mousedown (e não click) + preventDefault: a escolha acontece ANTES
                  // do campo perder o foco, senão a lista fecharia antes do clique.
                  onMouseDown={(e) => {
                    e.preventDefault();
                    choose(place);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <Icon name="pin" size={18} className="option__icon" />
                  <span className="option__text">
                    <span className="option__name">{place.name}</span>
                    <span className="option__detail">{place.detail}</span>
                  </span>
                  {place.kind === "state" && <span className="option__tag">Estado</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p id="place-suggestions" className="suggestions__empty">
              {lookup.status === "done" && lookup.query === value
                ? "Nenhuma sugestão encontrada. Você ainda pode apertar Buscar."
                : "Buscando sugestões…"}
            </p>
          )}
        </div>
      )}

      {/* Anuncia para leitores de tela quantas sugestões existem */}
      <p className="visually-hidden" aria-live="polite">
        {isListVisible && places.length > 0
          ? `${places.length} sugestões disponíveis. Use as setas para navegar.`
          : ""}
      </p>

      {validationError && (
        <p id="location-error" className="search-error" role="alert">
          <Icon name="alert" size={18} />
          {validationError}
        </p>
      )}

      {suggestions && suggestions.length > 0 && (
        <ul className="chips" aria-label="Sugestões de busca">
          {suggestions.map((suggestion) => (
            <li key={suggestion}>
              <button
                type="button"
                className="chip"
                onClick={() => handleChip(suggestion)}
                disabled={disabled}
              >
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
