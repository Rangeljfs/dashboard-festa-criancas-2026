# Dashboard — Pesquisa Festa das Crianças 2026

Dashboard executivo da pesquisa de satisfação da **Festa das Crianças 2026** da Associação Volvo, no padrão visual institucional da Volvo Group (tipografia Volvo Novum/Noto Sans, azuis #182871 e #2A609D, layout claro com cartões de borda fina).

**Página publicada:** https://rangeljfs.github.io/dashboard-festa-criancas-2026/

## O que o painel mostra

- **KPIs executivos**: média geral (9,69), recomendação (9,77 e % de notas 9–10), % de respostas sem fila acima de 5 minutos e % de avaliações nota ≤ 7 (ponto de atenção).
- **Média por pergunta**: os 11 quesitos ordenados por média, com a distribuição das notas (10 / 9 / 8 / ≤ 7) em barras empilhadas e tabela acessível.
- **Perfil dos respondentes**: donut com funcionários, dependentes e convidados.
- **Prioridades para a próxima edição**: KPI de tomada de decisão com os 3 temas de crítica mais citados, ação sugerida e citações.
- **Críticas e sugestões recorrentes**: ranking dos 14 temas identificados nos comentários; clicar em um tema filtra a caixa de comentários.
- **Todos os comentários**: caixa aberta com busca e filtros por pergunta, tema e perfil (974 comentários).

## Arquivos

| Arquivo | Conteúdo |
|---|---|
| `index.html` | Página do dashboard (HTML único, sem dependências além de fonte Google) |
| `dados.js` | Dados agregados e anonimizados gerados da planilha de respostas |

## Privacidade

O repositório **não contém dados pessoais**: nome, matrícula, celular e e-mail dos respondentes ficam apenas na planilha original, fora do repositório. `dados.js` carrega somente agregados (médias, contagens) e os textos dos comentários com o tipo de vínculo (funcionário, dependente, convidado).

## Como atualizar

1. Exportar a planilha de respostas do formulário.
2. Rodar o script de agregação apontando para a planilha (gera `dados.js`).
3. Commit e push: o GitHub Pages publica automaticamente.
