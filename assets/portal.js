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

  // ícones de linha (SVG) para a capa do card — sóbrios e modernos
  const ICONES = {
    balao:  '<svg viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 1 6 6c0 3.6-3 6.4-5.3 7.5-.4.2-.9.2-1.3 0C9 15.4 6 12.6 6 9a6 6 0 0 1 6-6z"/><path d="M12 16.5v2.2"/><path d="M11 20.7c.4.5 1.6.5 2 0"/></svg>',
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
      return '<a class="ev-card" href="' + e.pasta + '/">' +
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
