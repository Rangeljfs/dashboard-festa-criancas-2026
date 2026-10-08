// Ao ATUALIZAR (F5) dentro de um dashboard, volta sempre para o portal (tela inicial).
// Quando se chega pelo clique no card (navegação normal), o dashboard abre normal.
(function () {
  try {
    var nav = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
    var tipo = nav ? nav.type : (performance.navigation && performance.navigation.type === 1 ? "reload" : "");
    if (tipo === "reload") {
      location.replace("../../");  // volta ao portal
    }
  } catch (e) {}
})();

// começa sempre do topo, mesmo que o navegador tente restaurar o scroll anterior
try { history.scrollRestoration = "manual"; } catch (e) {}
scrollTo(0, 0);
addEventListener("load", () => scrollTo(0, 0));
(function () {
  const D = window.DADOS;
  const $ = (s) => document.querySelector(s);
  const fmt = (x, c) => x.toLocaleString("pt-BR", { minimumFractionDigits: c, maximumFractionDigits: c });

  /* ---------- tooltip ---------- */
  const tip = $("#tip");
  function tipOn(el, texto) {
    el.addEventListener("mousemove", (e) => {
      tip.style.display = "block";
      tip.textContent = texto;
      tip.style.left = Math.min(e.clientX + 14, innerWidth - 270) + "px";
      tip.style.top = (e.clientY + 14) + "px";
    });
    el.addEventListener("mouseleave", () => { tip.style.display = "none"; });
  }

  /* ---------- hero + rodapé ---------- */
  $("#heroSub").textContent = D.respostas + " respostas · média geral " + fmt(D.mediaGeral, 2) +
    " · " + D.entidade;

  /* ---------- KPIs ---------- */
  const totalAval = D.perguntas.reduce((a, p) => a + p.n, 0);
  const totalAtencao = D.perguntas.reduce((a, p) => a + p.dist.le7, 0);
  const ICO = {
    estrela: '<svg viewBox="0 0 24 24"><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.2l1-5.8L3.5 9.2l5.9-.9z" stroke-linejoin="round"/></svg>',
    polegar: '<svg viewBox="0 0 24 24"><path d="M7 10v10H4V10zM7 10l4-7c1.3 0 2 .9 2 2l-.7 4H19c1.1 0 2 .9 2 2l-1.6 6.5c-.2.9-1 1.5-1.9 1.5H7" stroke-linejoin="round"/></svg>',
    relogio: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2" stroke-linecap="round"/></svg>',
    alerta: '<svg viewBox="0 0 24 24"><path d="M12 3l9 16H3z" stroke-linejoin="round"/><path d="M12 10v4M12 17v.5" stroke-linecap="round"/></svg>',
    sorriso: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8.5 14c.8 1.2 2 2 3.5 2s2.7-.8 3.5-2" stroke-linecap="round"/><path d="M9 9.5v.01M15 9.5v.01" stroke-linecap="round"/></svg>',
  };
  const poLinhas = (pares) => '<div class="po-lista">' +
    pares.map(([rot, val]) => '<div class="po-linha"><span>' + rot + "</span><b>" + val + "</b></div>").join("") + "</div>";
  const perguntasOrd = [...D.perguntas].sort((a, b) => b.media - a.media);
  const origemMediaGeral = '<div class="po-tit">Média de cada quesito</div>' +
    poLinhas(perguntasOrd.map((p) => [p.label, fmt(p.media, 2)]));
  const origemRecomendacao = '<div class="po-tit">Como se calcula a recomendação</div>' +
    poLinhas([["Média das notas (5 a 10)", fmt(D.recomendacao.media, 2)], ["Deram nota 9 ou 10", fmt(D.recomendacao.pctPromotores, 1) + "%"], ["Total de respostas", D.recomendacao.n]]);
  const origemAtencao = '<div class="po-tit">Avaliações nota ≤ 7 por quesito</div>' +
    poLinhas(perguntasOrd.filter((p) => p.dist.le7 > 0).sort((a, b) => b.dist.le7 - a.dist.le7).map((p) => [p.label, p.dist.le7]));

  const kpis = [
    { rotulo: "Média geral", valor: fmt(D.mediaGeral, 2), apoio: totalAval.toLocaleString("pt-BR") + " avaliações em " + D.perguntas.length + " quesitos", acc: "var(--navy)", ico: ICO.estrela, origem: origemMediaGeral },
    { rotulo: "Recomendação", valor: fmt(D.recomendacao.media, 2), apoio: fmt(D.recomendacao.pctPromotores, 1) + "% deram nota 9 ou 10", acc: "var(--s2)", ico: ICO.polegar, origem: origemRecomendacao },
  ];

  // 3º KPI é flexível conforme o evento:
  // - se houver dados de fila -> "Sem fila acima de 5 min"
  // - senão, se houver satisfação (ex.: Colônia) -> "Satisfação das crianças"
  const temFila = D.filas && (D.filas.sim + D.filas.nao) > 0;
  if (temFila) {
    const origemFila = '<div class="po-tit">Enfrentou fila acima de 5 minutos?</div>' +
      poLinhas([["Não enfrentou fila", D.filas.nao + " (" + fmt(D.filas.pctSemFila, 1) + "%)"], ["Enfrentou fila", D.filas.sim + " (" + fmt(100 * D.filas.sim / (D.filas.sim + D.filas.nao), 1) + "%)"]]);
    kpis.push({ rotulo: "Sem fila acima de 5 min", valor: fmt(D.filas.pctSemFila, 1) + "%", apoio: D.filas.sim + " relatos de fila em " + (D.filas.sim + D.filas.nao) + " respostas", acc: "var(--good)", ico: ICO.relogio, origem: origemFila });
  } else if (D.satisfacao && D.satisfacao.n) {
    const origemSat = '<div class="po-tit">Satisfação das crianças</div>' +
      poLinhas([["Nota média", fmt(D.satisfacao.media, 2)], ["Deram nota 9 ou 10", fmt(D.satisfacao.pctAlta, 1) + "%"], ["Total de respostas", D.satisfacao.n]]);
    kpis.push({ rotulo: "Satisfação das crianças", valor: fmt(D.satisfacao.media, 2), apoio: fmt(D.satisfacao.pctAlta, 1) + "% com nota 9 ou 10", acc: "var(--good)", ico: ICO.sorriso, origem: origemSat });
  }

  kpis.push({ rotulo: "Avaliações nota ≤ 7", valor: fmt(100 * totalAtencao / totalAval, 1) + "%", apoio: totalAtencao + " avaliações: o ponto de atenção da edição", classe: "k-atencao", ico: ICO.alerta, origem: origemAtencao });
  const SETAK = '<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
  $("#kpis").innerHTML = kpis.map((k, i) =>
    '<div class="kpi ' + (k.classe || "") + '" style="--i:' + i + ';' + (k.acc ? "--acc:" + k.acc : "") + '">' +
    '<div class="ico">' + k.ico + '</div><div class="rotulo">' + k.rotulo +
    '</div><div class="valor">' + k.valor + '</div><div class="apoio">' + k.apoio + "</div>" +
    '<div class="ver-kpi">De onde vem ' + SETAK + "</div>" +
    '<div class="painel-origem"><div class="painel-origem-in-wrap"><div class="painel-origem-in">' + k.origem + "</div></div></div>" +
    "</div>").join("");
  function alternaCard(card, grupoSel) {
    const abrindo = !card.classList.contains("aberto");
    document.querySelectorAll(grupoSel + ".aberto").forEach((o) => {
      if (o !== card) { o.classList.remove("aberto"); const p = o.querySelector(".painel-origem"); if (p) p.classList.remove("escancara"); }
    });
    card.classList.toggle("aberto", abrindo);
    const painel = card.querySelector(".painel-origem");
    if (painel) painel.classList.toggle("escancara", abrindo);
  }
  document.querySelectorAll("#kpis .kpi").forEach((card) => {
    card.addEventListener("click", () => alternaCard(card, "#kpis .kpi"));
  });

  /* ---------- médias por pergunta (barras 100% empilhadas) ---------- */
  const ordenadas = [...D.perguntas].sort((a, b) => b.media - a.media);
  const boxP = $("#perguntas");
  ordenadas.forEach((p) => {
    const row = document.createElement("div");
    row.className = "qrow";
    const partes = [["s10", "10", p.dist["10"]], ["s9", "9", p.dist["9"]], ["s8", "8", p.dist["8"]], ["s7", "≤ 7", p.dist.le7]];
    row.innerHTML = '<div class="qlabel">' + p.label + "<small>" + p.n + ' respostas</small></div>' +
      '<div class="qbar-wrap"><div class="qbar"></div></div><div class="qmedia">' + fmt(p.media, 2) + "</div>";
    const bar = row.querySelector(".qbar");
    partes.forEach(([cls, nome, n]) => {
      if (!n) return;
      const seg = document.createElement("div");
      seg.className = "seg " + cls;
      seg.style.flex = String(n);
      tipOn(seg, p.label + " · nota " + nome + ": " + n + " respostas (" + fmt(100 * n / p.n, 0) + "%)");
      bar.appendChild(seg);
    });
    boxP.appendChild(row);
  });
  $("#tabelaPerguntas").innerHTML =
    "<tr><th>Pergunta</th><th class='num'>Média</th><th class='num'>Respostas</th><th class='num'>Nota 10</th><th class='num'>Nota 9</th><th class='num'>Nota 8</th><th class='num'>≤ 7</th></tr>" +
    ordenadas.map((p) => "<tr><td>" + p.label + "</td><td class='num'>" + fmt(p.media, 2) + "</td><td class='num'>" + p.n +
      "</td><td class='num'>" + p.dist["10"] + "</td><td class='num'>" + p.dist["9"] + "</td><td class='num'>" + p.dist["8"] +
      "</td><td class='num'>" + p.dist.le7 + "</td></tr>").join("");

  /* ---------- donut perfil ---------- */
  const paleta = ["var(--s1)", "var(--s2)", "var(--s3)", "var(--d9)", "var(--s-neutro)"];
  const perfilPares = Object.entries(D.perfil).sort((a, b) => b[1] - a[1]);
  // mostra até 4 categorias direto; só agrupa em "Outros" se houver 5+ ou respostas sem perfil
  const nDiretas = perfilPares.length <= 4 ? perfilPares.length : 3;
  const principais = perfilPares.slice(0, nDiretas);
  const resto = perfilPares.slice(nDiretas).reduce((a, p) => a + p[1], 0);
  const semPerfil = D.respostas - perfilPares.reduce((a, p) => a + p[1], 0);
  const fatias = [...principais];
  if (resto + semPerfil > 0) fatias.push(["Outros / não informado", resto + semPerfil]);
  const totalPerfil = fatias.reduce((a, f) => a + f[1], 0);
  const svg = $("#donut");
  const R = 15.9155; const C = 100;
  let acum = 0;
  fatias.forEach(([nome, n], i) => {
    const frac = 100 * n / totalPerfil;
    const visivel = Math.max(frac - 1.4, 0.5);
    const el = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    el.setAttribute("cx", 21); el.setAttribute("cy", 21); el.setAttribute("r", R);
    el.setAttribute("fill", "transparent");
    el.setAttribute("stroke", paleta[i]);
    el.setAttribute("stroke-width", 5.4);
    el.setAttribute("stroke-dashoffset", String(25 - acum));
    el.style.transition = "stroke-dasharray .9s cubic-bezier(.22,1,.36,1) " + (0.15 + i * 0.12) + "s";
    el.setAttribute("stroke-dasharray", "0 " + C); // começa vazio
    el.style.transition = "stroke-dasharray 1.2s cubic-bezier(.22,1,.36,1) " + (0.2 + i * 0.18) + "s";
    tipOn(el, nome + ": " + n + " respostas (" + fmt(frac, 1) + "%)");
    svg.appendChild(el);
    // anima quando o card do donut aparece na tela (ao rolar)
    const aplica = () => el.setAttribute("stroke-dasharray", visivel + " " + (C - visivel));
    const cardDonut = svg.closest(".reveal") || document.body;
    const checar = () => { if (cardDonut.classList.contains("visivel")) { aplica(); return true; } return false; };
    if (!checar()) {
      const obs = new MutationObserver(() => { if (checar()) obs.disconnect(); });
      obs.observe(cardDonut, { attributes: true, attributeFilter: ["class"] });
    }
    acum += frac;
  });
  $("#donutTotal").textContent = totalPerfil;
  $("#donutLeg").innerHTML = fatias.map(([nome, n], i) =>
    '<div class="item"><i class="chip" style="background:' + paleta[i] + '"></i> ' + nome +
    " <b>" + n + "</b>&nbsp;<small>(" + fmt(100 * n / totalPerfil, 1) + "%)</small></div>").join("");

  /* ---------- prioridades (KPI de decisão) ---------- */
  const citas = {
    "Fila no açaí / caixa": "“Açaí, meia hora.” · “Caixa, 20 minutos.”",
    "Preços (comidas, jogos, bingo)": "“Poderia ser mais em conta as comidas.”",
    "Personagens e fotos": "“Homem Aranha abaixo da expectativa.” · “Faltou princesa pras meninas.”",
    "Assentos, mesas e sombra": "“Mais cadeiras e mesas na área externa.”",
    "Playlist / músicas inadequadas": "“As músicas estavam inadequadas. Crianças cantando funk.”",
    "Comida fria / crua / porção": "“O espetinho estava cru.” · “Churros muito pequeno.”",
  };
  const acoes = {
    "Fila no açaí / caixa": "Reforçar o atendimento do açaí e abrir um caixa extra nos horários de pico.",
    "Preços (comidas, jogos, bingo)": "Rever a tabela de preços de alimentação, jogos pagos e cartela do bingo.",
    "Personagens e fotos": "Elevar o padrão dos personagens, incluir princesas e garantir foto para todas as crianças.",
    "Assentos, mesas e sombra": "Ampliar mesas, cadeiras e pontos de sombra, inclusive perto do campo.",
    "Playlist / músicas inadequadas": "Definir playlist infantil curada previamente e controlar o volume dos graves.",
    "Comida fria / crua / porção": "Controlar ponto e temperatura dos espetinhos e padronizar porções.",
  };
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const SETA = '<svg class="seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
  const SETA2 = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';

  $("#prioridades").innerHTML = D.temas.slice(0, 3).map((t, i) => {
    const comentariosTema = D.comentarios.filter((c) => c.temas.includes(t.tema));
    return '<div class="pcard p' + (i + 1) + '"><div class="rank">' + (i + 1) + "</div>" +
    '<div class="tema">' + t.tema + "</div>" +
    '<div class="mencoes">' + t.n + " menções nos comentários</div>" +
    '<div class="acao-rot">Ação recomendada</div>' +
    '<div class="acao">' + (acoes[t.tema] || "Tema recorrente nos comentários abertos.") + "</div>" +
    (citas[t.tema] ? '<div class="cita">' + citas[t.tema].replace(/^“/, "").replace(/”/g, "").replace(/“/g, "") + "</div>" : "") +
    '<div class="ver">De onde vem este dado ' + SETA2 + "</div>" +
    '<div class="painel-origem"><div class="painel-origem-in-wrap"><div class="painel-origem-in">' +
      '<div class="po-tit">' + comentariosTema.length + " comentários que citam este tema</div>" +
      '<div class="po-lista">' +
        comentariosTema.slice(0, 30).map((c) => '<div class="po-c">' + esc(c.t) + "<em>" + c.c + " · " + c.p + "</em></div>").join("") +
      "</div></div></div></div>" +
    "</div>";
  }).join("");
  // clique abre/fecha o painel de origem de cada prioridade
  document.querySelectorAll("#prioridades .pcard").forEach((card) => {
    card.addEventListener("click", () => alternaCard(card, "#prioridades .pcard"));
  });

  /* ---------- temas recorrentes (acordeão com comentários) ---------- */
  const maxTema = Math.max(...D.temas.map((t) => t.n));
  const boxT = $("#temas");
  D.temas.forEach((t) => {
    const comentariosTema = D.comentarios.filter((c) => c.temas.includes(t.tema));
    const item = document.createElement("div");
    item.className = "tema-item";
    item.innerHTML =
      '<div class="tema-row">' +
        '<div class="tlabel">' + t.tema + "</div>" +
        '<div class="tbar-out"><div class="tbar" style="width:' + (100 * t.n / maxTema) + '%"></div></div>' +
        '<div class="tn">' + t.n + "</div>" + SETA +
      "</div>" +
      '<div class="tema-painel"><div class="tema-painel-in">' +
        '<div class="resumo">' + comentariosTema.length + " comentário(s) citam este tema. " +
          '<a data-tema="' + t.tema + '">Ver na lista completa ↓</a></div>' +
        '<div class="tema-coment">' +
          comentariosTema.slice(0, 40).map((c) =>
            '<div class="tc">' + esc(c.t) + "<span>" + c.c + " · " + c.p + "</span></div>").join("") +
        "</div>" +
      "</div></div>";
    const row = item.querySelector(".tema-row");
    row.addEventListener("click", () => {
      const abrindo = !item.classList.contains("aberto");
      document.querySelectorAll(".tema-item.aberto").forEach((o) => { if (o !== item) o.classList.remove("aberto"); });
      item.classList.toggle("aberto", abrindo);
    });
    item.querySelector(".resumo a").addEventListener("click", (ev) => {
      ev.stopPropagation();
      fTema.value = t.tema; filtra();
      $("#comentarios").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    boxT.appendChild(item);
  });

  /* ---------- termômetro (limpo, clicável) ---------- */
  const melhor = ordenadas[0]; const pior = ordenadas[ordenadas.length - 1];
  const icoBom = '<svg viewBox="0 0 24 24" stroke="currentColor"><path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const icoBaixo = '<svg viewBox="0 0 24 24" stroke="currentColor"><path d="M12 3l9 16H3z" stroke-linejoin="round"/><path d="M12 10v4M12 17v.5" stroke-linecap="round"/></svg>';
  const icoComent = '<svg viewBox="0 0 24 24" stroke="currentColor"><path d="M21 12a8 8 0 01-11.5 7.2L3 21l1.8-6.5A8 8 0 1121 12z" stroke-linejoin="round"/></svg>';
  const totalMencoes = D.temas.reduce((a, t) => a + t.n, 0);

  // origem de um quesito: distribuição das notas
  const origemQuesito = (p) => {
    const linhas = [["Nota 10", p.dist["10"]], ["Nota 9", p.dist["9"]], ["Nota 8", p.dist["8"]], ["Nota ≤ 7", p.dist.le7]];
    return '<div class="po-tit">Distribuição das ' + p.n + " notas de " + p.label + "</div><div class='po-lista'>" +
      linhas.map(([rot, n]) => '<div class="po-linha"><span>' + rot + "</span><b>" + n + " (" + fmt(100 * n / p.n, 0) + "%)</b></div>").join("") +
      "</div>";
  };
  // origem dos comentários: ranking de temas
  const origemComentarios = '<div class="po-tit">Menções por tema de melhoria</div><div class="po-lista">' +
    D.temas.map((t) => '<div class="po-linha"><span>' + t.tema + "</span><b>" + t.n + "</b></div>").join("") + "</div>";

  function termoItem(cls, ico, rot, nome, det, val, origem) {
    return '<div class="termo-item"><div class="termo-ico ' + cls + '">' + ico + "</div>" +
      '<div class="termo-txt"><div class="rot">' + rot + '</div><div class="nome">' + nome +
      '</div><div class="det">' + det + "</div></div>" +
      (val !== null ? '<div class="termo-val">' + val + "</div>" : "") +
      '<svg class="termo-seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>' +
      '<div class="painel-origem" style="flex-basis:100%"><div class="painel-origem-in-wrap"><div class="painel-origem-in">' + origem + "</div></div></div></div>";
  }
  $("#termometro").innerHTML =
    termoItem("bom", icoBom, "Mais bem avaliado", melhor.label, "o quesito de maior aprovação", fmt(melhor.media, 2), origemQuesito(melhor)) +
    termoItem("baixo", icoBaixo, "Menor média da edição", pior.label, fmt(pior.pctAtencao, 1) + "% das notas ≤ 7", fmt(pior.media, 2), origemQuesito(pior)) +
    termoItem("coment", icoComent, "Comentários registrados", D.comentarios.length + " respostas de texto", totalMencoes + " menções a temas de melhoria", null, origemComentarios);
  document.querySelectorAll("#termometro .termo-item").forEach((it) => {
    it.addEventListener("click", () => alternaCard(it, "#termometro .termo-item"));
  });

  /* ---------- caixa de comentários ---------- */
  const fBusca = $("#fBusca"), fCampo = $("#fCampo"), fTema = $("#fTema"), fPerfil = $("#fPerfil");
  const campos = [...new Set(D.comentarios.map((c) => c.c))];
  const perfis = [...new Set(D.comentarios.map((c) => c.p))];
  fCampo.innerHTML = '<option value="">Todas as perguntas</option>' + campos.map((c) => "<option>" + c + "</option>").join("");
  fTema.innerHTML = '<option value="">Todos os temas</option>' + D.temas.map((t) => "<option>" + t.tema + "</option>").join("");
  fPerfil.innerHTML = '<option value="">Todos os perfis</option>' + perfis.map((p) => "<option>" + p + "</option>").join("");

  const LOTE = 120;
  let visiveis = LOTE;
  let filtrados = D.comentarios;

  function normaliza(t) { return t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }

  function filtra() {
    const q = normaliza(fBusca.value.trim());
    filtrados = D.comentarios.filter((c) =>
      (!fCampo.value || c.c === fCampo.value) &&
      (!fTema.value || c.temas.includes(fTema.value)) &&
      (!fPerfil.value || c.p === fPerfil.value) &&
      (!q || normaliza(c.t).includes(q)));
    visiveis = LOTE;
    pinta();
  }

  function pinta() {
    $("#fContagem").textContent = filtrados.length === D.comentarios.length
      ? D.comentarios.length + " comentários"
      : filtrados.length + " de " + D.comentarios.length + " comentários";
    $("#comentarios").innerHTML = filtrados.slice(0, visiveis).map((c) =>
      '<div class="com-item"><div class="texto">' + c.t.replace(/&/g, "&amp;").replace(/</g, "&lt;") +
      '</div><div class="meta"><span class="tagz">' + c.c + '</span><span class="tagz">' + c.p + "</span>" +
      c.temas.map((t) => '<span class="tagz tt">' + t + "</span>").join("") + "</div></div>").join("") ||
      '<div class="contagem">Nenhum comentário encontrado com esses filtros.</div>';
    $("#btnMais").style.display = filtrados.length > visiveis ? "block" : "none";
  }

  [fCampo, fTema, fPerfil].forEach((el) => el.addEventListener("change", () => {
    if (el === fTema) document.querySelectorAll(".tema-row").forEach((r) => r.classList.remove("ativo"));
    filtra();
  }));
  fBusca.addEventListener("input", filtra);
  $("#btnMais").addEventListener("click", () => { visiveis += LOTE; pinta(); });

  filtra();

  /* ---------- count-up de um número (mais devagar) ---------- */
  function countUpEl(el) {
    if (el.dataset.feito) return;
    el.dataset.feito = "1";
    const txt = el.textContent.trim();
    const m = txt.match(/^([\d.,]+)(%?)$/);
    if (!m) return;
    const casas = (m[1].split(",")[1] || "").length;
    const alvo = parseFloat(m[1].replace(/\./g, "").replace(",", "."));
    const suf = m[2];
    const dur = 1400; const t0 = performance.now();
    function step(t) {
      const p = Math.min((t - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(alvo * e, casas) + suf;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = fmt(alvo, casas) + suf;
    }
    requestAnimationFrame(step);
  }

  /* ---------- animar cada bloco quando entra na tela (ao rolar) ---------- */
  const animaveis = document.querySelectorAll(".reveal, .kpis");
  let ioRef = null;
  function ativar(el) {
    if (el.classList.contains("visivel")) return;
    el.classList.add("visivel");
    if (el.classList.contains("kpis")) el.querySelectorAll(".kpi .valor").forEach(countUpEl);
    if (ioRef) ioRef.unobserve(el);
  }
  if ("IntersectionObserver" in window) {
    ioRef = new IntersectionObserver((entradas) => {
      entradas.forEach((ent) => { if (ent.isIntersecting) ativar(ent.target); });
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
  }
  // revela o que já está na viewport (primeira dobra) e só então liga o observer para o resto
  let animacaoIniciada = false;
  function revelarPrimeiraDobra() {
    if (animacaoIniciada) return;
    animacaoIniciada = true;
    animaveis.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight * 0.92 && r.bottom > 0) ativar(el);
    });
    if (ioRef) animaveis.forEach((el) => { if (!el.classList.contains("visivel")) ioRef.observe(el); });
    else animaveis.forEach(ativar);
  }

  /* ---------- cortina de abertura ---------- */
  const cortina = $("#cortina");
  if (cortina) {
    // garante que a página sempre comece do topo (o navegador restaura o scroll ao atualizar)
    try { history.scrollRestoration = "manual"; } catch (e) {}
    document.body.classList.add("cortina-ativa");  // trava o scroll enquanto a cortina cobre a tela
    scrollTo(0, 0);
    const encerra = () => {
      cortina.classList.add("fim");
      document.body.classList.remove("cortina-ativa");  // libera o scroll
    };
    // mostra o logo (~2,4s) e depois sobe a cortina revelando o painel
    setTimeout(() => {
      scrollTo(0, 0);
      cortina.classList.add("subir");
      // os KPIs e seções da primeira dobra animam agora, junto com a cortina subindo
      revelarPrimeiraDobra();
      // garante o encerramento mesmo se transitionend não disparar (1,3s da transição + folga)
      setTimeout(encerra, 1600);
    }, 2400);
    cortina.addEventListener("transitionend", encerra, { once: true });
  } else {
    revelarPrimeiraDobra();
  }

  /* ---------- botão voltar ao topo ---------- */
  const aoTopo = $("#aoTopo");
  if (aoTopo) {
    addEventListener("scroll", () => {
      aoTopo.classList.toggle("mostra", scrollY > 400);
    }, { passive: true });
    aoTopo.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
  }
})();
