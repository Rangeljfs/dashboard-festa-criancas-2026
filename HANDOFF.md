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

### 0.2 Como usar o GitHub Copilot para gerar um evento novo
Abra o repositório no VS Code (com a extensão GitHub Copilot / Copilot Chat).
No **Copilot Chat**, você **não precisa colar o HANDOFF inteiro** — ele já está no
repositório e o Copilot consegue lê-lo. Faça assim:

1. Garanta que o Copilot tem o projeto como contexto. No Copilot Chat, referencie o
   guia com **`#HANDOFF.md`** (o `#` anexa o arquivo ao contexto). Um prompt bom:

   > `#HANDOFF.md` Leia este guia por completo. Vou te enviar a planilha de uma
   > pesquisa nova e quero que você gere o dashboard do evento e adicione o card no
   > portal, seguindo exatamente os passos da seção 3. O nome do evento é "<NOME>",
   > ano <AAAA>, aconteceu em <MÊS/AAAA>. A planilha está em <caminho do .xlsx no PC>.

2. Se o Copilot não "enxergar" a planilha (ele lê arquivos do projeto, não anexos de
   chat como um .xlsx externo), **coloque o arquivo .xlsx dentro de uma pasta do
   projeto** (ex.: crie `planilhas/` e ponha lá) e aponte o caminho para ele. Assim o
   Copilot consegue abrir e inspecionar as colunas. **Importante:** essa planilha tem
   dados pessoais, então **não faça commit dela**. Adicione `planilhas/` ao `.gitignore`
   (já incluído neste projeto) ou apague a planilha depois de gerar o `dados.js`.

3. Deixe o Copilot seguir os passos da seção 3 (inspecionar colunas → adaptar e rodar
   `scripts/gerar_dados.py` → criar `eventos/<slug>/` → editar `eventos.js` →
   commit/push). Confira o resultado pelo checklist da seção 3, Passo 6.

**Resumindo a sua pergunta "colo o HANDOFF inteiro?":** não precisa colar o texto todo;
basta referenciar `#HANDOFF.md` no Copilot Chat e pedir para ele seguir o guia. Se a
ferramenta que você usar **não** conseguir ler arquivos do repositório, aí sim cole o
conteúdo do HANDOFF.md inteiro no chat antes de pedir.

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
Abra a planilha e descubra **o índice (0-based) de cada coluna** e o que ela contém.
Rode algo como (ajuste o caminho do arquivo):

```python
import openpyxl
wb = openpyxl.load_workbook(r"CAMINHO_DA_PLANILHA.xlsx", read_only=True, data_only=True)
ws = wb.worksheets[0]
ws.reset_dimensions()
rows = list(ws.iter_rows(values_only=True))
print("linhas:", len(rows))
for j, h in enumerate(rows[0]):
    print(j, repr(h))
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

### Passo 2 — Adaptar e rodar o script de agregação
1. Copie `scripts/gerar_dados.py` (ou edite direto) e ajuste no topo:
   - `ORIGEM` = caminho da planilha nova.
   - `DESTINO` = `eventos/<slug>/dados.js`.
   - `NOTAS` = lista de `(indice_coluna, "Rótulo da pergunta")` para cada pergunta de nota.
   - `COMENTARIOS` = lista de `(indice_coluna, "Rótulo do campo")` para cada campo de texto.
   - os índices de **recomendação, fila, perfil** nas funções correspondentes.
   - `TEMAS` = palavras-chave para agrupar críticas/sugestões recorrentes (adaptar ao evento).
   - no dicionário final (`out`): `titulo` = nome do evento.
2. Garanta que o Python tem `openpyxl` (`pip install openpyxl`).
3. Rode: `python scripts/gerar_dados.py`. Ele cria o `eventos/<slug>/dados.js`.
   O arquivo começa com `window.DADOS = {...};` e contém **só agregados + comentários
   anonimizados** (nunca dados pessoais).

**Formato do `dados.js`** (o `dashboard.js` espera exatamente estas chaves):
```js
window.DADOS = {
  titulo: "Nome do Evento",
  entidade: "Associação Volvo",
  respostas: <int, total de respostas>,
  mediaGeral: <float>,
  perguntas: [ { label, media, n, dist:{ "10":n, "9":n, "8":n, le7:n }, pctAtencao } , ... ],
  recomendacao: { media, pctPromotores, n },
  filas: { sim, nao, pctSemFila },
  perfil: { "Funcionário(a)": n, "Dependente": n, ... },
  temas: [ { tema, n }, ... ],               // ordenado do mais citado p/ o menos
  comentarios: [ { t:"texto", c:"campo", p:"perfil", temas:[...] }, ... ]
};
```

### Passo 3 — Criar a pasta e o index.html do evento
1. Crie a pasta `eventos/<slug>/`.
2. Copie `eventos/festa-criancas-2026/index.html` para `eventos/<slug>/index.html`.
3. No novo `index.html`, ajuste só o `<title>` e o `<meta name="description">` e o
   `<h1 id="heroTitulo">` (se estiver fixo no HTML — veja; o título também vem do `dados.js`).
   **Não mexa** nos caminhos `../../assets/...` (continuam válidos porque a profundidade é a mesma).
4. Coloque o `dados.js` gerado no Passo 2 dentro dessa pasta.

### Passo 4 — Adicionar o card no portal
Edite `eventos.js` e acrescente um objeto no array `window.EVENTOS` (coloque o mais
recente **no topo** da lista, para aparecer primeiro):
```js
{
  titulo: "Arraiá",            // nome exibido no card
  ano: "2026",
  pasta: "eventos/arraia-2026", // caminho relativo à raiz (a pasta do evento)
  data: "Junho de 2026",
  respostas: 312,               // total (bate com dados.js)
  media: "9,41",                // média geral (string com vírgula)
  icone: "🎪",                  // emoji do card (balão 🎈, fogueira 🔥, festa 🎉, etc.)
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
