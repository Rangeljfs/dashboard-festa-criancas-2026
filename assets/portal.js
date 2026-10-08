// começa sempre do topo
try { history.scrollRestoration = "manual"; } catch (e) {}
scrollTo(0, 0);
(function () {
  // ordena os eventos pela data (campo "ordem" = AAAAMM), do mais recente p/ o mais antigo.
  // Sem "ordem", mantém a posição em que está na lista.
  const EV = (window.EVENTOS || []).slice().sort((a, b) => (b.ordem || 0) - (a.ordem || 0));
  const grade = document.getElementById("grade");
  const SETA = '<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const nf = (n) => Number(n).toLocaleString("pt-BR");
  const norm = (t) => String(t).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  // ícones de linha (SVG) — biblioteca Lucide (lucide.dev), desenhados por profissionais
  const ICONES = {
    // balão de festa (lucide: party-popper)
    balao:  '<svg viewBox="0 0 24 24"><path d="M5.8 11.3 2 22l10.7-3.79"/><path d="M4 3h.01"/><path d="M22 8h.01"/><path d="M15 2h.01"/><path d="M22 20h.01"/><path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L12 10"/><path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17"/><path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7"/><path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z"/></svg>',
    // bandeira triangular num mastro (lucide: flag-triangle-right) — festa junina / Arraiá
    bandeira: '<svg viewBox="0 0 24 24"><path d="M7 22V2l10 5-10 5"/></svg>',
    // sol (lucide: sun) — Colônia de Verão
    sol: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',
    // floco de neve (lucide: snowflake) — Colônia de Inverno
    floco: '<svg viewBox="0 0 24 24"><path d="m10 20-1.25-2.5L6 18"/><path d="M10 4 8.75 6.5 6 6"/><path d="m14 20 1.25-2.5L18 18"/><path d="m14 4 1.25 2.5L18 6"/><path d="m17 21-3-6h-4"/><path d="m17 3-3 6 1.5 3"/><path d="M2 12h6.5L10 9"/><path d="m20 10-1.5 2 1.5 2"/><path d="M22 12h-6.5L14 15"/><path d="m4 10 1.5 2L4 14"/><path d="m7 21 3-6-1.5-3"/><path d="m7 3 3 6h4"/></svg>',
    // criança (lucide: baby) — alternativa p/ colônia
    crianca: '<svg viewBox="0 0 24 24"><path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/></svg>',
    // eventos genéricos
    festa:  '<svg viewBox="0 0 24 24"><path d="M3 21l5.5-13 5.5 5.5L3 21z"/><path d="M14 4.5l1 1M18 3l.5 1.5M20.5 7l-1.5.5M16 8l1 1"/><path d="M8.5 8l1.5 6"/></svg>',
    evento: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/><path d="M12 13l.9 1.9 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2L9 15.2l2-.3z"/></svg>',
    grafico:'<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
    estrela:'<svg viewBox="0 0 24 24"><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.2l1-5.8L3.5 9.2l5.9-.9z"/></svg>',
  };
  // devolve o conteúdo do selo: ícone de linha (se o nome existir), senão o emoji, senão padrão
  function conteudoSelo(icone) {
    if (icone && ICONES[icone]) return '<span class="ico-linha">' + ICONES[icone] + '</span>';
    if (icone && /\p{Emoji}/u.test(icone)) return '<span class="emoji">' + icone + '</span>';
    return '<span class="ico-linha">' + ICONES.evento + '</span>';
  }

  // faixa de resumo no hero
  const totalResp = EV.reduce((a, e) => a + (Number(e.respostas) || 0), 0);
  const stats = [
    { v: nf(EV.length), r: EV.length === 1 ? "Pesquisa" : "Pesquisas" },
    { v: nf(totalResp), r: "Respostas" },
  ];
  document.getElementById("stats").innerHTML = stats.map((s) =>
    '<div class="s"><div class="v">' + s.v + '</div><div class="r">' + s.r + "</div></div>").join("");
  document.getElementById("conta").textContent = EV.length + (EV.length === 1 ? " evento" : " eventos");

  if (!EV.length) {
    grade.innerHTML = '<div class="vazio">Nenhuma pesquisa publicada ainda.</div>';
    document.getElementById("stats").style.display = "none";
  } else {
    grade.innerHTML = EV.map((e) => {
      const nome = e.titulo + (e.ano ? " " + e.ano : "");
      const mini = [];
      if (e.respostas != null) mini.push('<div class="m"><div class="v">' + Number(e.respostas).toLocaleString("pt-BR") + '</div><div class="r">Respostas</div></div>');
      if (e.media != null) mini.push('<div class="m"><div class="v">' + e.media + '</div><div class="r">Média geral</div></div>');
      const txtBusca = norm([e.titulo, e.ano, e.data].filter(Boolean).join(" "));
      return '<a class="ev-card" href="' + e.pasta + '/" data-busca="' + txtBusca + '">' +
        '<div class="ev-capa">' + (e.ano ? '<span class="ano">' + e.ano + '</span>' : "") +
          '<span class="selo">' + conteudoSelo(e.icone) + '</span></div>' +
        '<div class="ev-corpo">' +
          '<div class="tipo">Pesquisa de Satisfação</div>' +
          '<h3>' + e.titulo + '</h3>' +
          '<div class="data">' + (e.data || "") + '</div>' +
          (mini.length ? '<div class="ev-mini">' + mini.join("") + '</div>' : "") +
          '<div class="ev-abrir">Ver dashboard ' + SETA + '</div>' +
        '</div></a>';
    }).join("");
  }

  // ---- campo de busca de eventos (filtra os cards por nome, mês ou ano) ----
  const busca = document.getElementById("buscaEvento");
  const buscaWrap = document.querySelector(".busca-wrap");
  const semResultado = document.getElementById("semResultado");
  const conta = document.getElementById("conta");
  // só mostra a busca quando há 3+ eventos (com poucos não faz falta)
  if (buscaWrap) buscaWrap.style.display = EV.length >= 3 ? "" : "none";
  if (busca) {
    busca.addEventListener("input", () => {
      const q = norm(busca.value.trim());
      const cards = [...document.querySelectorAll(".ev-card")];
      let visiveis = 0;
      cards.forEach((c) => {
        const bate = !q || (c.getAttribute("data-busca") || "").includes(q);
        c.style.display = bate ? "" : "none";
        if (bate) visiveis++;
      });
      if (semResultado) semResultado.hidden = visiveis !== 0;
      if (conta) conta.textContent = q
        ? visiveis + (visiveis === 1 ? " evento" : " eventos")
        : EV.length + (EV.length === 1 ? " evento" : " eventos");
    });
  }

  // partículas flutuantes no hero (geradas uma vez)
  (function criaParticulas() {
    const box = document.getElementById("particulas");
    if (!box) return;
    const N = 18;
    let html = "";
    for (let i = 0; i < N; i++) {
      const left = Math.round(Math.random() * 100);
      const size = (Math.random() * 3 + 2).toFixed(1);     // 2–5 px
      const dur = (Math.random() * 8 + 9).toFixed(1);        // 9–17 s
      const delay = (Math.random() * 10).toFixed(1);         // 0–10 s
      const op = (Math.random() * 0.35 + 0.25).toFixed(2);   // leve
      html += '<i style="left:' + left + '%;width:' + size + 'px;height:' + size +
        'px;animation-duration:' + dur + 's;animation-delay:-' + delay + 's;opacity:' + op + '"></i>';
    }
    box.innerHTML = html;
  })();

  // entrada em sequência do hero + cards, após a cortina subir
  function revelarHero() {
    document.body.classList.add("hero-in");
    document.querySelectorAll(".ev-card").forEach((c, i) => {
      setTimeout(() => c.classList.add("entra"), 120 + i * 110);
    });
  }

  // cortina
  const cortina = document.getElementById("cortina");
  if (cortina) {
    document.body.classList.add("cortina-ativa");
    scrollTo(0, 0);
    const encerra = () => { cortina.classList.add("fim"); document.body.classList.remove("cortina-ativa"); };
    setTimeout(() => {
      scrollTo(0, 0);
      cortina.classList.add("subir");
      revelarHero();
      setTimeout(encerra, 1600);
    }, 2400);
    cortina.addEventListener("transitionend", encerra, { once: true });
  } else {
    revelarHero();
  }
})();
