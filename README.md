# Portal de Pesquisas de Satisfação — Associação Volvo

Portal web estático que reúne as pesquisas de satisfação dos eventos da Associação Volvo. A página inicial lista os eventos em cards; cada card abre o dashboard executivo daquele evento.

**No ar:** https://rangeljfs.github.io/dashboard-festa-criancas-2026/

> **Para adicionar o dashboard de um evento novo a partir de uma planilha, leia o [HANDOFF.md](HANDOFF.md).** Ele tem o passo a passo completo.

## Estrutura

```
/  (raiz = portal)
├─ index.html              Portal (carrega assets/portal.*)
├─ eventos.js              Lista de eventos exibidos no portal
├─ HANDOFF.md              Guia para gerar o dashboard de um evento novo
├─ assets/                 Código e imagens COMPARTILHADOS
│   ├─ portal.css / portal.js
│   ├─ dashboard.css / dashboard.js
│   └─ img/                logos
├─ eventos/                Um subdiretório por evento
│   └─ festa-criancas-2026/
│       ├─ index.html      (curto: carrega assets/dashboard.* + dados.js)
│       └─ dados.js        dados agregados e anonimizados do evento
└─ scripts/
    ├─ gerar_dados.py      template do agregador de planilha → dados.js
    └─ exemplos/           exemplo preenchido (Festa das Crianças 2026)
```

O visual e a lógica ficam em `assets/` (um lugar só). Cada evento novo adiciona só uma pasta em `eventos/<slug>/` com um `index.html` curto e um `dados.js`.

## Tecnologia

HTML/CSS/JS puro, sem build nem framework. O GitHub Pages serve os arquivos como estão. Para publicar: `git push` na branch `main`. O único passo de processamento é o `scripts/gerar_dados.py` (Python + openpyxl), que transforma a planilha da pesquisa no `dados.js` anonimizado.

## Privacidade (LGPD)

O repositório é público e **não contém dados pessoais**: nome, matrícula, celular e e-mail dos respondentes ficam apenas nas planilhas originais, fora do repositório. Os arquivos `dados.js` carregam somente agregados e os textos dos comentários com o tipo de vínculo (funcionário, dependente, convidado).
