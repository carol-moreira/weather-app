/**
 * Estados brasileiros (26 + Distrito Federal) com a sigla e o centro geográfico aproximado.
 *
 * Por que uma lista local? A API de geocodificação usada nas sugestões
 * (Open-Meteo) devolve cidades, mas não devolve estados inteiros. Como o
 * público do app é brasileiro e são apenas 27 itens, uma constante é a
 * solução mais simples, rápida (sem rede) e previsível.
 *
 * As coordenadas são o "ponto de referência" usado para consultar o clima do
 * estado como um todo (valores aproximados, suficientes para esse fim).
 */
export interface BrazilState {
  name: string;
  uf: string;
  latitude: number;
  longitude: number;
}

export const BRAZIL_STATES: BrazilState[] = [
  { name: "Acre", uf: "AC", latitude: -9.02, longitude: -70.81 },
  { name: "Alagoas", uf: "AL", latitude: -9.62, longitude: -36.82 },
  { name: "Amapá", uf: "AP", latitude: 1.41, longitude: -51.77 },
  { name: "Amazonas", uf: "AM", latitude: -3.47, longitude: -65.1 },
  { name: "Bahia", uf: "BA", latitude: -12.96, longitude: -41.7 },
  { name: "Ceará", uf: "CE", latitude: -5.2, longitude: -39.53 },
  { name: "Distrito Federal", uf: "DF", latitude: -15.78, longitude: -47.93 },
  { name: "Espírito Santo", uf: "ES", latitude: -19.19, longitude: -40.34 },
  { name: "Goiás", uf: "GO", latitude: -15.83, longitude: -49.84 },
  { name: "Maranhão", uf: "MA", latitude: -5.42, longitude: -45.44 },
  { name: "Mato Grosso", uf: "MT", latitude: -12.64, longitude: -55.42 },
  { name: "Mato Grosso do Sul", uf: "MS", latitude: -20.51, longitude: -54.54 },
  { name: "Minas Gerais", uf: "MG", latitude: -18.1, longitude: -44.38 },
  { name: "Pará", uf: "PA", latitude: -3.79, longitude: -52.48 },
  { name: "Paraíba", uf: "PB", latitude: -7.28, longitude: -36.72 },
  { name: "Paraná", uf: "PR", latitude: -24.89, longitude: -51.55 },
  { name: "Pernambuco", uf: "PE", latitude: -8.38, longitude: -37.86 },
  { name: "Piauí", uf: "PI", latitude: -6.6, longitude: -42.28 },
  { name: "Rio de Janeiro", uf: "RJ", latitude: -22.25, longitude: -42.66 },
  { name: "Rio Grande do Norte", uf: "RN", latitude: -5.81, longitude: -36.59 },
  { name: "Rio Grande do Sul", uf: "RS", latitude: -30.17, longitude: -53.5 },
  { name: "Rondônia", uf: "RO", latitude: -10.83, longitude: -63.34 },
  { name: "Roraima", uf: "RR", latitude: 1.99, longitude: -61.33 },
  { name: "Santa Catarina", uf: "SC", latitude: -27.45, longitude: -50.95 },
  { name: "São Paulo", uf: "SP", latitude: -22.19, longitude: -48.79 },
  { name: "Sergipe", uf: "SE", latitude: -10.57, longitude: -37.45 },
  { name: "Tocantins", uf: "TO", latitude: -9.46, longitude: -48.26 },
];
