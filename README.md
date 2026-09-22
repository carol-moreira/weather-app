# Clima Agora

Aplicação de consulta de clima (React + TypeScript + Vite) que consome a API Visual Crossing.

## Como rodar

```bash
npm install
cp .env.example .env      # depois edite o .env e coloque sua chave da API
npm run dev               # http://localhost:5173
```

Outros comandos: `npm test` (Vitest), `npm run build` (type-check + build de produção), `npm run preview`.

## Estrutura

```
weather-app/
├── public/                    # arquivos estáticos (favicon)
├── src/
│   ├── components/            # interface
│   │   ├── SearchForm.tsx         # HEADER: busca flutuante + sugestões
│   │   ├── CurrentConditions.tsx  # HERO: temperatura gigante + cards de apoio
│   │   ├── HourlyForecast.tsx     # BASE: previsão hora a hora
│   │   ├── WeatherBackground.tsx  # céu animado (chuva, sol, frio, ameno)
│   │   ├── Feedback.tsx           # skeleton de loading e mensagem de erro
│   │   └── Icon.tsx               # ícones SVG próprios (currentColor)
│   ├── data/                  # brazilStates: lista local dos 27 estados (sigla e ponto de referência)
│   ├── hooks/
│   │   ├── useWeather.ts          # estado da consulta, refresh e cancelamento
│   │   └── usePlaceSuggestions.ts # sugestões com debounce (300 ms) e cancelamento
│   ├── services/
│   │   ├── weatherService.ts      # Visual Crossing: fetch, erros e mapeamento
│   │   ├── geocodingService.ts    # Open-Meteo Geocoding: sugestões, busca sem acento, ranking
│   │   └── locationResolver.ts    # texto digitado → lugar/coordenadas (com fallback)
│   ├── styles/
│   │   ├── global.css             # paleta (tokens), base e animações utilitárias
│   │   ├── components.css         # estilos dos componentes (glassmorphism, botões, cards)
│   │   └── weather-scenes.css     # keyframes das cenas de clima
│   ├── types/                 # tipos do domínio e da API
│   ├── utils/                 # weatherTheme, weatherIcon, text (normalizeText, toTitleCase)
│   ├── App.tsx                # composição da tela e escolha do tema
│   ├── main.tsx               # ponto de entrada
│   └── vite-env.d.ts          # tipos do Vite e das variáveis de ambiente
├── .env.example               # modelo de configuração da chave
├── index.html
├── package.json
├── tsconfig.json              # referencia tsconfig.app.json e tsconfig.node.json
└── vite.config.ts
```

## Busca, sugestões e estados

- **Sugestões** aparecem a partir de 3 letras, com 300 ms de debounce. A busca ignora acentos e maiúsculas (`sao paulo` = `São Paulo`) e aceita qualificadores (`Campinas, SP`, `Rio de Janeiro, Brasil`).
- **Nome exibido** vem da geocodificação (`São Bernardo do Campo, São Paulo, Brasil`), nunca do texto digitado. Se a geocodificação estiver fora do ar, o app usa o texto cru e formata o endereço devolvido pela API (`toTitleCase`).
- **Estados**: ao escolher um estado, a tela mostra o selo "Média do estado" e um aviso. O clima é consultado no ponto de referência do estado (`data/brazilStates.ts`); é uma estimativa regional, não a média calculada entre as cidades.
- A consulta de clima usa **coordenadas**, o que elimina ambiguidade (cidade x estado com o mesmo nome).

## Responsividade

Mobile-first, com breakpoints em 360, 600 e 900 px:

| Largura | Layout |
|---|---|
| até 360 px | cards de apoio em 1 coluna |
| celular | header empilhado, cards em 2 colunas |
| ≥ 600 px | marca e busca lado a lado, cards em 3 colunas |
| ≥ 900 px | hero à esquerda, cards de apoio à direita, previsão por hora embaixo |

Também: hover apenas em dispositivos com mouse, alvos de toque ≥ 44 px, `100dvh`, áreas seguras (`env(safe-area-inset-*)`) e ajuste para celular deitado.

## Tema visual dinâmico

`utils/weatherTheme.ts` transforma o clima atual em um tema; o `App.tsx` o coloca em `data-theme` e o CSS troca cores e animações.

| Tema | Regra (em ordem de prioridade) | Animação |
|---|---|---|
| `rain` | condição de chuva/trovoada **ou** chance de chuva ≥ 60% | gotas caindo + nuvens escuras |
| `sun` | céu aberto de dia **e** temperatura ≥ 25 °C | brilho verde-claro pulsando + raios girando |
| `cold` | temperatura < 18 °C | nuvens cinzas passando em camadas |
| `mild` | qualquer outro caso (e tela inicial) | brilho suave + poucas nuvens claras |

## Requisitos atendidos

- **RF01** busca por cidade, cidade e estado, ou cidade e país (`SearchForm`)
- **RF02** condições atuais do dia (`CurrentConditions`)
- **RF03** previsão hora a hora (`HourlyForecast`)
- **RF04** botão Atualizar, que repete a última consulta (`useWeather.refresh`)
- **RF05** erros amigáveis: campo vazio, cidade não encontrada e falha de comunicação
