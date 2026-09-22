import { useMemo, type CSSProperties } from "react";
import type { WeatherTheme } from "../utils/weatherTheme";

/**
 * ─────────────────────────────────────────────────────────────
 *  FUNDO ANIMADO (camada "sky")
 * ─────────────────────────────────────────────────────────────
 * Como funciona, em 3 camadas:
 *
 *  1. GRADIENTE — as cores do céu vêm de variáveis CSS (`--sky-top`,
 *     `--sky-bottom`) definidas por `[data-theme]` em weather-scenes.css.
 *     Como elas são registradas com @property, o navegador consegue
 *     ANIMAR a troca de cor: ao mudar de "sol" para "chuva" o céu escurece
 *     suavemente em vez de piscar.
 *
 *  2. CENA — cada tema renderiza seus próprios elementos (gotas, raios,
 *     nuvens). Usamos `key={theme}` para o React desmontar a cena antiga e
 *     montar a nova; a cena nova entra com fade-in.
 *
 *  3. ANIMAÇÃO — é 100% CSS (keyframes). O React só cria os elementos UMA
 *     vez; quem move as coisas é o navegador, na GPU, usando apenas
 *     `transform` e `opacity` (propriedades baratas, sem reflow). Por isso a
 *     tela continua fluida mesmo com dezenas de gotas.
 *
 * Acessibilidade: a camada é decorativa (`aria-hidden`, sem interação) e
 * respeita `prefers-reduced-motion` (veja o CSS).
 */
export function WeatherBackground({ theme }: { theme: WeatherTheme }) {
  return (
    <div className="sky" aria-hidden="true">
      <Scene key={theme} theme={theme} />
    </div>
  );
}

function Scene({ theme }: { theme: WeatherTheme }) {
  switch (theme) {
    case "rain":
      return <RainScene />;
    case "sun":
      return <SunScene />;
    case "cold":
      return <ColdScene />;
    default:
      return <MildScene />;
  }
}

/* ───────────────────────── helpers ───────────────────────── */

/**
 * Número pseudoaleatório DETERMINÍSTICO (0–1) a partir de um índice.
 * Precisamos de "aleatoriedade" para as gotas não caírem em fileira, mas
 * Math.random() em render mudaria a cada re-render e as gotas "pulariam".
 * Com uma função determinística o resultado é sempre o mesmo.
 */
const seeded = (i: number, salt: number) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** Permite passar variáveis CSS (`--x`) num `style` sem brigar com o TypeScript. */
type CssVars = CSSProperties & Record<`--${string}`, string | number>;

interface CloudProps {
  top: string;
  width: string;
  opacity: number;
  duration: number;
  /** Delay negativo = a animação começa "no meio", então a tela já nasce com nuvens espalhadas. */
  delay: number;
}

/**
 * Nuvem feita só com CSS (um retângulo arredondado + 2 "bolhas" em ::before/::after).
 * Sem imagens: é leve, nítida em qualquer resolução e herda cor por variável.
 */
function Cloud({ top, width, opacity, duration, delay }: CloudProps) {
  const style: CssVars = {
    "--top": top,
    "--w": width,
    "--o": opacity,
    "--dur": `${duration}s`,
    "--delay": `${delay}s`,
  };
  return <span className="cloud" style={style} />;
}

/* ───────────────────────── cenas ───────────────────────── */

/**
 * CHUVA: 70 gotas + 3 nuvens escuras.
 * Cada gota recebe posição, tamanho, velocidade e atraso diferentes; assim o
 * conjunto parece natural, e é o CSS (`@keyframes fall`) que faz a queda.
 */
function RainScene() {
  const drops = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => {
        const style: CssVars = {
          // Começa além da borda esquerda/direita porque a chuva é inclinada
          "--x": `${Math.round(seeded(i, 1) * 130 - 15)}%`,
          "--len": `${Math.round(40 + seeded(i, 2) * 50)}px`,
          "--dur": `${(0.55 + seeded(i, 3) * 0.6).toFixed(2)}s`,
          // Delay negativo: a chuva já está "caindo" no primeiro frame
          "--delay": `${(-seeded(i, 4) * 2).toFixed(2)}s`,
          "--o": (0.2 + seeded(i, 5) * 0.35).toFixed(2),
        };
        return <span key={i} className="drop" style={style} />;
      }),
    [],
  );

  return (
    <div className="scene scene-rain">
      <Cloud top="-2%" width="55vw" opacity={0.55} duration={70} delay={-10} />
      <Cloud top="6%" width="70vw" opacity={0.45} duration={95} delay={-55} />
      <Cloud top="14%" width="45vw" opacity={0.4} duration={60} delay={-30} />
      {drops}
    </div>
  );
}

/**
 * SOL: um brilho verde-claro pulsando + raios que giram bem devagar.
 * (Usei verde-claro em vez de amarelo para permanecer na paleta do projeto.)
 * Os raios são um `repeating-conic-gradient` em um elemento gigante,
 * girando 360° em 2 minutos: movimento quase imperceptível, mas "vivo".
 */
function SunScene() {
  return (
    <div className="scene scene-sun">
      <span className="sun-rays" />
      <span className="sun-glow" />
      <Cloud top="18%" width="38vw" opacity={0.09} duration={120} delay={-40} />
    </div>
  );
}

/**
 * FRIO: nuvens cinzas em 3 camadas de profundidade.
 * Efeito parallax barato: nuvens maiores e mais baixas passam MAIS DEVAGAR
 * e mais opacas; as pequenas e altas, mais rápidas e translúcidas.
 */
function ColdScene() {
  return (
    <div className="scene scene-cold">
      <Cloud top="6%" width="46vw" opacity={0.16} duration={80} delay={-20} />
      <Cloud top="16%" width="60vw" opacity={0.22} duration={110} delay={-70} />
      <Cloud top="30%" width="38vw" opacity={0.14} duration={65} delay={-45} />
      <Cloud top="52%" width="70vw" opacity={0.12} duration={140} delay={-100} />
      <Cloud top="70%" width="50vw" opacity={0.1} duration={90} delay={-15} />
    </div>
  );
}

/** AMENO (e tela inicial): brilho verde respirando + poucas nuvens claras. */
function MildScene() {
  return (
    <div className="scene scene-mild">
      <span className="mild-glow" />
      <Cloud top="12%" width="42vw" opacity={0.1} duration={130} delay={-50} />
      <Cloud top="46%" width="55vw" opacity={0.08} duration={160} delay={-110} />
    </div>
  );
}
