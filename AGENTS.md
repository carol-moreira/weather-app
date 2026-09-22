# AGENTS.md

## Visão geral
Este workspace contém uma aplicação React + TypeScript + Vite para consulta de clima em tempo real. O objetivo do projeto é permitir busca por cidade, exibir condições atuais, previsão horária e ambientar a interface conforme o clima.

## Stack e ferramentas
- React 18
- TypeScript
- Vite
- Vitest
- CSS modular por arquivos de estilo

## Comandos principais
```bash
npm install
npm run dev
npm test
npm run build
npm run preview
```

## Estrutura do projeto
```text
weather-app/
├── public/
├── src/
│   ├── components/
│   ├── data/
│   ├── hooks/
│   ├── services/
│   ├── styles/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
├── AGENTS.md
└── .env.example
```

## Regras de trabalho para agentes
1. Preserve o padrão do projeto: React funcional, TypeScript tipado e CSS em arquivos separados.
2. Antes de alterar lógica de negócio, leia o código relevante e entenda o fluxo de dados.
3. Evite duplicação de código; reutilize utilitários e hooks já existentes.
4. Mantenha nomes de funções, props e arquivos consistentes com o restante da base.
5. Não introduza dependências novas sem necessidade clara.
6. Sempre valide mudanças com os testes relevantes e, quando apropriado, com build.

## Fluxo de desenvolvimento recomendado
- Para correções: reproduzir o problema, localizar a causa e ajustar o ponto exato.
- Para features: seguir o padrão do projeto e manter a arquitetura atual.
- Para testes: priorizar testes unitários em `services/` e `utils/` quando a mudança impactar lógica de transformação ou regras de negócio.

## Testes e validação
- Comando principal: `npm test`
- Verificação adicional: `npm run build`
- Se uma mudança afetar UI, também verificar comportamento manualmente no navegador com `npm run dev`.

## Convenções de código
- Preferir funções pequenas e claras.
- Manter componentes focados em responsabilidade única.
- Usar tipos explícitos quando a inferência não for suficiente.
- Tratar erros de rede e ausência de dados com mensagens amigáveis para o usuário.
- Ao trabalhar com geolocalização, buscar e exibir o nome oficial retornado pela API sempre que disponível.

## Observações do domínio
- A busca aceita cidades, cidades com estado e cidades com país.
- O app usa coordenadas para consultas de clima, reduzindo ambiguidades.
- Sugestões devem considerar filtro por letras iniciais, debounce e tratamento de acentos.
- A interface tem temas dinâmicos baseados no clima atual (sol, chuva, frio, ameno).

## Checklist antes de concluir uma tarefa
- [ ] Entendi o problema ou pedido.
- [ ] Ajustei somente o necessário para resolver a causa raiz.
- [ ] Mantive a base de estilos e arquitetura do projeto.
- [ ] Executei testes relevantes (`npm test`).
- [ ] Se necessário, executei `npm run build`.
- [ ] Revisei se não houve regressões visuais ou de comportamento.

## Contexto de execução
Este projeto é um app front-end local. A maioria das alterações deve focar em:
- `src/components/`
- `src/hooks/`
- `src/services/`
- `src/utils/`
- `src/styles/`

Mantenha soluções simples, legíveis e alinhadas com a experiência visual já implementada.
