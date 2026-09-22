/**
 * Remove acentos e padroniza para minúsculas: "São Paulo" → "sao paulo".
 * É a base da busca "sem acento": comparamos SEMPRE os textos normalizados,
 * então "sao", "SÃO" e "são" são equivalentes.
 *
 * Como funciona: `normalize("NFD")` separa cada letra acentuada em letra +
 * acento ("ã" vira "a" + "~"), e o replace apaga a faixa dos acentos
 * (̀–ͯ).
 */
export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

// Preposições/conjunções que ficam em minúsculas em nomes próprios
const LOWERCASE_WORDS = new Set(["de", "da", "do", "das", "dos", "e"]);

/**
 * Formata um nome de lugar com iniciais maiúsculas, como deve ser exibido:
 *   "são bernardo do campo" → "São Bernardo do Campo"
 *   "campinas, sp"          → "Campinas, SP"   (sigla de estado em maiúsculas)
 */
export function toTitleCase(text: string): string {
  return text
    .split(",")
    .map((part, index) => {
      const trimmed = part.trim();

      // Depois de uma vírgula, 2 letras é uma sigla de estado (SP, RJ…)
      if (index > 0 && /^\p{L}{2}$/u.test(trimmed)) {
        return trimmed.toLocaleUpperCase("pt-BR");
      }

      return trimmed
        .split(/\s+/)
        .map((word, wordIndex) => {
          const lower = word.toLocaleLowerCase("pt-BR");
          if (wordIndex > 0 && LOWERCASE_WORDS.has(lower)) return lower;
          // Capitaliza o início da palavra e também depois de hífen ou apóstrofo
          return lower.replace(/(^|[-'])(\p{L})/gu, (_, sep: string, letter: string) =>
            sep + letter.toLocaleUpperCase("pt-BR"),
          );
        })
        .join(" ");
    })
    .join(", ");
}
