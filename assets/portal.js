// começa sempre do topo
try { history.scrollRestoration = "manual"; } catch (e) {}
scrollTo(0, 0);
(function () {
  const EV = window.EVENTOS || [];
  const grade = document.getElementById("grade");
  const SETA = '<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const nf = (n) => Number(n).toLocaleString("pt-BR");

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
          '<span class="selo"><span class="emoji">' + (e.icone || "📊") + '</span></span></div>' +
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
