# HANDOFF — Portal de Pesquisas de Satisfação (Associação Volvo)

> **Para a IA que for assistir (GitHub Copilot ou outra):** este documento é o guia
> completo. Leia-o inteiro antes de agir. Ele explica o que é o projeto, como está
> organizado e, principalmente, **o passo a passo exato para gerar o dashboard de um
> evento novo a partir de uma planilha**. Siga os passos na ordem. Não invente
> estrutura nova: reaproveite o template.

---

## 0. Começando (primeira vez numa conta/PC novo)

### 0.1 Publicar o projeto numa conta GitHub nova
1. Crie um repositório novo na conta (ex.: `portal-pesquisas`). Pode ser público.
2. Suba todos os arquivos deste projeto para a branch `main`.
3. Em **Settings → Pages** do repositório, ative o GitHub Pages: Source = `Deploy from a branch`,
   branch `main`, pasta `/ (root)`. Salve.
4. Em 1-2 minutos o site estará em `https://<conta>.github.io/<repositorio>/`.
   Nada no código precisa mudar — os caminhos são relativos.

### 0.2 Fluxo completo para gerar o dashboard de um evento novo (passo a passo)

> O projeto já está no PC como uma **pasta local clonada do GitHub**, e o Copilot
> acessa essa pasta e está ligado ao GitHub. Para cada evento novo:

1. **Clonar o projeto** (só na primeira vez): peça ao Copilot/editor para clonar o
   repositório para uma pasta local, informando a URL
   `https://github.com/<conta>/<repositorio>`. (Ou use o GitHub Desktop → "Clone".)
   Depois de clonado, a pasta já vem com tudo: `assets/`, `eventos/`, `planilhas/`,
   `scripts/`, `HANDOFF.md` etc.
2. **Colocar a planilha** do evento dentro da pasta `planilhas/` do projeto
   (ex.: `planilhas/arraia-2026.xlsx`). Essa planilha fica **só no seu PC** — está no
   `.gitignore` e nunca vai para o GitHub.
3. **Pedir ao Copilot** para acessar a pasta do projeto e seguir o guia. Você **não
   precisa colar o HANDOFF inteiro**: ele já está na pasta. Use o prompt pronto do
   arquivo `PROMPT-COPILOT.txt` (copie, troque o nome do evento e o arquivo da
   planilha). Resumidamente, o prompt manda ele:
   referenciar o `HANDOFF.md`, ler a planilha em `planilhas/...`, gerar o
   `eventos/<slug>/dados.js` (Caminho A do Passo 2, sem Python), criar a pasta do
   evento, adicionar o card em `eventos.js` e fazer commit + push.
4. **Conferir** pelo checklist da seção 3, Passo 6. Em especial: confirme que a
   **planilha NÃO foi commitada** (só o `dados.js` e os arquivos do projeto sobem).
5. Em 1-2 minutos o GitHub Pages publica; o card novo aparece no portal (Ctrl+F5).

**Sua pergunta "colo o HANDOFF inteiro?":** não precisa; basta o Copilot ter a pasta
como contexto e você pedir para ele seguir o `HANDOFF.md`. Só cole o conteúdo inteiro
do HANDOFF no chat se a ferramenta que você usar **não** conseguir ler arquivos da
pasta do projeto.

---

## 1. O que é este projeto

Um **portal web estático** (hospedado no GitHub Pages) que reúne as pesquisas de
satisfação dos eventos da **Associação Volvo**. A página inicial lista os eventos em
cards; clicar em um card abre o **dashboard executivo** daquele evento.

- **Onde fica o site:** é publicado pelo **GitHub Pages**, no endereço
  `https://<conta>.github.io/<repositorio>/`. O endereço muda conforme a conta e o
  nome do repositório; o projeto **não depende de nenhum nome fixo** — todos os
  caminhos internos são relativos, então ele funciona em qualquer conta/repositório.
- Tudo é **HTML/CSS/JS puro** (sem build, sem framework, sem Node). O GitHub Pages
  serve os arquivos como estão. Para publicar, basta `git push` na branch `main`
  (e ter o GitHub Pages ativado nas configurações do repositório, apontando para a
  branch `main`, pasta raiz `/`).

### Identidade visual (sempre a mesma)
- Fonte: **Montserrat** (via Google Fonts).
- Cor institucional: **teal `#0c5868`** (e o tom claro `#157d93`). NÃO usar azul-marinho.
- Logo: lettering "Associação Volvo" em `assets/img/` (`logo-teal.png` para fundo claro,
  `logo-branco.png` para fundo escuro).
- Acabamento: cards arredondados (16-18px), sombra suave, hero com gradiente teal,
  cortina de abertura com o logo, animações ao rolar.

---

## 2. Estrutura de pastas

```
/  (raiz = PORTAL)
├─ index.html              Portal (página inicial com os cards). Curto: só carrega os assets.
├─ eventos.js              Lista de eventos exibidos no portal (← você edita ao adicionar evento)
├─ HANDOFF.md              Este arquivo
├─ README.md
│
├─ assets/                 Código e imagens COMPARTILHADOS por todos
│   ├─ portal.css          Estilo do portal
│   ├─ portal.js           Lógica do portal (monta os cards a partir de eventos.js)
│   ├─ dashboard.css       Estilo do dashboard (vale para TODOS os eventos)
│   ├─ dashboard.js        Lógica do dashboard (vale para TODOS os eventos)
│   └─ img/                logo-teal.png, logo-branco.png
│
├─ eventos/                Um subdiretório por evento
│   └─ festa-criancas-2026/
│       ├─ index.html      Curto: carrega assets/dashboard.css e assets/dashboard.js + dados.js
│       └─ dados.js        Dados agregados e anonimizados do evento (← gerado da planilha)
│
└─ scripts/
    └─ gerar_dados.py      Script Python que lê a planilha e gera o dados.js (← você adapta e roda)
```

**Princípio:** o visual e a lógica ficam em `assets/` (um lugar só). Cada evento novo
só adiciona uma pasta em `eventos/<slug>/` com um `index.html` curto e um `dados.js`.
Se um dia mudar o visual, muda em `assets/` e vale para todos.

---

## 3. COMO ADICIONAR UM EVENTO NOVO (o fluxo principal)

Quando o usuário colar/enviar uma **planilha de pesquisa nova** (um arquivo `.xlsx`,
normalmente exportado do Microsoft Forms) e disser o **nome do evento**, faça:

### Passo 0 — Escolher o "slug" do evento
O slug é o nome da pasta: minúsculo, sem acento, com hífens. Ex.:
"Arraiá 2026" → `arraia-2026`; "Festa de Fim de Ano 2026" → `festa-fim-ano-2026`.

### Passo 1 — Inspecionar a planilha
Abra/leia a planilha (`planilhas/<arquivo>.xlsx`) e descubra **o índice (0-based) de
cada coluna** e o que ela contém. A primeira linha é o cabeçalho; os dados começam na
linha 2. Liste os cabeçalhos com seus índices e olhe uma linha de exemplo.

(Se tiver Python à mão, dá para listar assim; se não, leia a planilha de outro jeito —
o importante é mapear as colunas:)
```python
import openpyxl
wb = openpyxl.load_workbook(r"planilhas/ARQUIVO.xlsx", read_only=True, data_only=True)
ws = wb.worksheets[0]; ws.reset_dimensions()
rows = list(ws.iter_rows(values_only=True))
print("linhas:", len(rows))
for j, h in enumerate(rows[0]): print(j, repr(h))
print("exemplo linha 2:", rows[1])
```

Identifique, pelas perguntas do cabeçalho:
- **Colunas de NOTA** (perguntas com nota de 0 a 10): ex. qualidade das atividades,
  alimentação, organização geral, recomendação etc.
- **Colunas de COMENTÁRIO** (campos de texto livre: "deixe seu comentário", filas etc.).
- A coluna de **recomendação** (nota 5-10, "o quanto recomendaria").
- A coluna de **fila** ("enfrentou fila por mais de 5 minutos?" — respostas Sim/Não).
- A coluna de **perfil** ("Você é:" — Funcionário/Dependente/Convidado etc.).
- **IGNORE e NUNCA inclua** colunas de **nome, matrícula, celular, e-mail** (dados pessoais).

### Passo 2 — Gerar o `eventos/<slug>/dados.js` (ESCOLHA UM CAMINHO)

Há dois jeitos de produzir o `dados.js`. **O Caminho A (sem Python) é o preferido** —
funciona mesmo que o PC não tenha Python instalado.

#### Caminho A — A IA lê a planilha e escreve o dados.js (SEM Python) ← preferido
Você (IA) abre/lê a planilha, calcula os agregados e **escreve o arquivo
`eventos/<slug>/dados.js`** diretamente, no formato exato da seção abaixo. Regras de
cálculo (siga exatamente, para o resultado bater com os outros eventos):

- **Notas:** para cada coluna de NOTA, considere só valores numéricos entre 0 e 10
  (troque vírgula por ponto). Para cada pergunta:
  - `media` = média dessas notas, arredondada a 2 casas.
  - `n` = quantas respostas válidas.
  - `dist` = contagem por faixa: `"10"` (nota = 10), `"9"` (9 ≤ nota < 10),
    `"8"` (8 ≤ nota < 9), `le7` (nota < 8).
  - `pctAtencao` = `100 * dist.le7 / n`, 1 casa.
- `mediaGeral` = média de **todas** as notas de **todas** as perguntas juntas, 2 casas.
- `respostas` = número de linhas de dados (total de respostas; a planilha tem 1 linha
  de cabeçalho, então é (linhas − 1)).
- **recomendacao:** da coluna de recomendação (notas 5-10): `media` (2 casas),
  `pctPromotores` = % de notas ≥ 9 (1 casa), `n` = respostas válidas. Se não houver
  coluna de recomendação, use `media` = mediaGeral, `pctPromotores` 0, `n` 0.
- **filas:** da coluna "enfrentou fila >5min?": `sim` = respostas que começam com "sim",
  `nao` = começam com "n", `pctSemFila` = `100 * nao / (sim+nao)` (1 casa). Sem a coluna,
  use `{sim:0, nao:0, pctSemFila:0}`.
- **perfil:** contagem por valor da coluna "Você é:" (ex. `{"Funcionário(a)": 110, ...}`).
  Sem a coluna, use `{}`.
- **comentarios:** para cada campo de COMENTÁRIO e cada linha com texto (≥ 3 caracteres),
  um objeto `{ t: "texto", c: "<rótulo do campo>", p: "<perfil ou 'Não informado'>",
  temas: [<temas que o texto cita>] }`. Troque quebras de linha por espaço.
  **DESCARTE comentários sem conteúdo** (não os inclua): "N/A", "n/a", "na", "nada",
  "nada a declarar", "nenhuma", "ok", "x", "-", "...", ou qualquer texto que não tenha
  letra/número. Eles não ajudam na caixa de comentários.
- **temas:** defina uma lista de temas recorrentes (nome + palavras-chave sem acento),
  adequada a ESTE evento. Para cada comentário, marque em `temas` os temas cujas
  palavras-chave aparecem no texto (comparando sem acento e em minúsculas). O array
  `temas` do dados.js é `[{tema, n}]` ordenado do mais citado para o menos, só com n>0.
  **IMPORTANTE:** crie temas só de **crítica/sugestão/assunto** (ex.: "Filas", "Alimentação",
  "Comunicação"). NÃO crie um tema de "elogios gerais" — as "Prioridades para a próxima
  edição" mostram os 3 temas mais citados como pontos a melhorar, então um tema de elogio
  viraria uma falsa prioridade.
- **titulo** = nome do evento. **entidade** = "Associação Volvo".
- **NUNCA** inclua nome, matrícula, celular ou e-mail.

> Veja `scripts/exemplos/gerar_dados_festa-criancas-2026.py` para um exemplo real de
> quais colunas viram o quê e de como foram definidos os temas.

#### Caminho B — Rodar o script Python (alternativa, se tiver Python)
1. Edite o bloco CONFIGURAÇÃO de `scripts/gerar_dados.py`: `ORIGEM`, `DESTINO`
   (`eventos/<slug>/dados.js`), `TITULO_EVENTO`, `NOTAS`, `COMENTARIOS`,
   `COL_RECOMENDACAO`, `COL_FILA`, `COL_PERFIL`, `TEMAS`.
2. `pip install openpyxl` (uma vez).
3. `python scripts/gerar_dados.py` — ele cria o `dados.js`.

Nos dois caminhos, o arquivo final começa com `window.DADOS = {...};` e contém
**só agregados + comentários anonimizados** (nunca dados pessoais).

**Formato do `dados.js`** (o `dashboard.js` espera exatamente estas chaves):
```js
window.DADOS = {
  titulo: "Nome do Evento",
  entidade: "Associação Volvo",
  respostas: <int, total de respostas>,
  mediaGeral: <float>,
  perguntas: [ { label, media, n, dist:{ "10":n, "9":n, "8":n, le7:n }, pctAtencao } , ... ],
  recomendacao: { media, pctPromotores, n },
  filas: { sim, nao, pctSemFila },           // se o evento NÃO tem pergunta de fila, use { sim:0, nao:0, pctSemFila:0 }
  satisfacao: { media, pctAlta, n },         // OPCIONAL — só quando NÃO há fila e existe uma pergunta de satisfação (ex.: Colônia). Vira o 3º KPI no lugar da fila.
  perfil: { "Funcionário(a)": n, "Dependente": n, ... },   // a "segmentação" do evento: funcionário/dependente/convidado, OU turma/faixa etária, etc.
  temas: [ { tema, n }, ... ],               // ordenado do mais citado p/ o menos
  comentarios: [ { t:"texto", c:"campo", p:"perfil", temas:[...] }, ... ]
};
```

> **3º KPI flexível:** o dashboard mostra "Sem fila acima de 5 min" quando há dados de fila
> (`filas.sim + filas.nao > 0`). Quando não há fila mas existe `satisfacao`, mostra
> "Satisfação das crianças". Quando não há nenhum dos dois, esse KPI simplesmente não aparece.
> O "Perfil dos respondentes" (donut) mostra até 4 categorias direto; com 5+ agrupa o excedente
> em "Outros". Para a Colônia, o perfil foi a **turma** (faixa etária), não funcionário/dependente.

### Passo 3 — Criar a pasta e o index.html do evento
1. Crie a pasta `eventos/<slug>/`.
2. Copie `eventos/festa-criancas-2026/index.html` para `eventos/<slug>/index.html`.
3. No novo `index.html`, ajuste só o `<title>` e o `<meta name="description">` e o
   `<h1 id="heroTitulo">` (se estiver fixo no HTML — veja; o título também vem do `dados.js`).
   **Não mexa** nos caminhos `../../assets/...` (continuam válidos porque a profundidade é a mesma).
4. Coloque o `dados.js` gerado no Passo 2 dentro dessa pasta.

### Passo 4 — Adicionar o card no portal
Edite `eventos.js` e acrescente um objeto no array `window.EVENTOS`. **A posição no
array não importa** — o portal ordena sozinho pela data (campo `ordem`), do mais
recente para o mais antigo. Objeto:
```js
{
  titulo: "Arraiá",            // nome exibido no card
  ano: "2026",
  pasta: "eventos/arraia-2026", // caminho relativo à raiz (a pasta do evento)
  data: "Junho de 2026",        // texto exibido (mês e ano)
  ordem: 202606,                // AAAAMM da data do evento (junho/2026 = 202606). Só p/ ordenar.
  respostas: 312,               // total (bate com dados.js)
  media: "9,41",                // média geral (string com vírgula)
  icone: "festa",               // ícone de linha do card: "balao" | "bandeira" | "sol" | "floco" | "festa" | "evento" | "grafico" | "estrela" (também aceita emoji)
},
```
> **ATENÇÃO ao campo `pasta`:** no portal atual o primeiro evento usa `pasta: "festa-criancas-2026"`
> porque a pasta estava na raiz. Após a reorganização os eventos ficam em `eventos/<slug>`.
> Use sempre o caminho **relativo à raiz** que realmente leva ao `index.html` do evento.
> Se os eventos estão em `eventos/`, então `pasta: "eventos/arraia-2026"`.

### Passo 5 — Publicar
```
git add -A
git commit -m "Adiciona dashboard da pesquisa: <Nome do Evento>"
git push
```
O GitHub Pages publica em 1-2 minutos. O card novo aparece no portal e abre o dashboard.

### Passo 6 — Conferir (checklist)
- [ ] O `dados.js` **não** contém nome/matrícula/celular/e-mail de ninguém.
- [ ] O portal mostra o card novo com título, ano, respostas e média corretos.
- [ ] Clicar no card abre o dashboard e ele carrega sem erro (abrir o Console do navegador).
- [ ] Os KPIs, o gráfico de média por pergunta, o donut de perfil, as prioridades,
      o termômetro e a caixa de comentários aparecem com os dados do evento.
- [ ] O botão "← Pesquisas" volta ao portal.

---

## 4. Regras importantes (não quebrar)

- **Privacidade (LGPD):** o repositório é público. NUNCA suba a planilha original nem
  qualquer coluna de dado pessoal. O `dados.js` só tem agregados e os textos dos
  comentários com o tipo de vínculo (funcionário/dependente/convidado).
- **Identidade:** manter Montserrat, teal `#0c5868`, logos de `assets/img/`. Não trocar
  por outra fonte/cor.
- **Não repetir código:** o CSS/JS do dashboard é um só (`assets/dashboard.*`). Não
  colar CSS/JS dentro do `index.html` de cada evento.
- **Caminhos relativos:** o dashboard (em `eventos/<slug>/`) referencia assets com
  `../../assets/...`. O portal (na raiz) referencia com `assets/...`. Mantenha.
- **Cortina/animações:** o site tem uma tela de abertura (cortina) com o logo e
  animações; elas tocam sempre (o código já ignora `prefers-reduced-motion` de propósito,
  a pedido do dono). Não religar essa condição.

---

## 5. Detalhes técnicos úteis (aprendidos na prática)

- **GitHub Pages tem cache:** depois do push, para ver a versão nova use Ctrl+F5 (ou
  adicione `?v=2` na URL). Leva ~1-2 min para atualizar.
- **Dimensão da planilha do Forms:** às vezes `ws.max_row` vem errado (1). Por isso o
  script usa `ws.reset_dimensions()` antes de ler as linhas.
- **Cabeçalho do Forms:** a primeira linha é o cabeçalho; os dados começam na linha 2.
  As colunas costumam ser: ID, Start time, Completion time, Email, Name, Last modified,
  depois as perguntas. Confira sempre, porque muda de formulário para formulário.
- **Paleta dos gráficos:** categórica teal/laranja/teal-claro; status vermelho para
  notas ≤ 7. Já está no `dashboard.css`; não precisa mexer.

---

## 6. Como pedir para a IA (exemplo de prompt no outro PC)

> "Aqui está a planilha da pesquisa do Arraiá 2026 [cola/anexa o .xlsx]. O nome do
> evento é 'Arraiá', ano 2026, aconteceu em junho de 2026. Gera o dashboard igual aos
> outros e adiciona o card no portal, seguindo o HANDOFF.md."

A IA deve então: ler o HANDOFF, inspecionar a planilha, adaptar e rodar
`scripts/gerar_dados.py`, criar `eventos/arraia-2026/` (index.html + dados.js), adicionar
o objeto em `eventos.js`, e fazer commit + push.
