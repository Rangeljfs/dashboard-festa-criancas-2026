# Portal de Pesquisas de Satisfação — Associação Volvo

Portal web que reúne as pesquisas de satisfação dos eventos da Associação Volvo. A página inicial lista os eventos em cards; cada card abre o dashboard executivo daquele evento.

**No ar:** https://rangeljfs.github.io/dashboard-festa-criancas-2026/

## Estrutura

```
/
├─ index.html              → PORTAL (página inicial com os cards de eventos)
├─ eventos.js              → lista de eventos exibidos no portal
├─ img/                    → logo da Associação Volvo (usado pelo portal)
└─ festa-criancas-2026/    → dashboard de um evento
   ├─ index.html           → dashboard executivo da pesquisa
   ├─ dados.js             → dados agregados e anonimizados do evento
   └─ img/                 → logo (usado pelo dashboard)
```

## Como adicionar um evento novo

1. Criar uma pasta nova para o evento (ex: `arraia-2026/`) copiando a estrutura de `festa-criancas-2026/` (index.html + dados.js + img/).
2. Gerar o `dados.js` da nova planilha com o script de agregação (anonimizado, sem dados pessoais).
3. Adicionar um objeto do evento em `eventos.js` (título, ano, pasta, data, respostas, média, ícone).
4. Commit e push: o GitHub Pages publica automaticamente e o card novo aparece no portal.

## O que cada dashboard mostra

KPIs executivos (média geral, recomendação, filas, ponto de atenção), média por pergunta com distribuição das notas, perfil dos respondentes, prioridades de ação, temas recorrentes em acordeão e a caixa completa de comentários com busca e filtros. KPIs, prioridades e termômetro são clicáveis e mostram a origem de cada número.

## Privacidade

O repositório **não contém dados pessoais**: nome, matrícula, celular e e-mail dos respondentes ficam apenas nas planilhas originais, fora do repositório. Os arquivos `dados.js` carregam somente agregados e os textos dos comentários com o tipo de vínculo (funcionário, dependente, convidado).
