// Lista de eventos do portal de Pesquisas de Satisfação da Associação Volvo.
// O portal ORDENA SOZINHO pela data (campo "ordem"), do mais recente para o mais antigo.
// Então você pode adicionar um evento novo em qualquer posição da lista.
//
// Campos de cada evento:
//   titulo, ano, pasta, data (texto exibido), respostas, media, icone
//   ordem: número AAAAMM da data do evento (ex.: outubro/2026 = 202610). Serve só p/ ordenar.
// Ícone do card: nome de ícone de LINHA (sóbrio). Opções:
//   "balao" (festa das crianças) | "bandeira" (arraiá/junina) | "sol" (verão) |
//   "floco" (inverno) | "festa" | "evento" | "grafico" | "estrela"
// (também aceita um emoji, mas o padrão do portal são os ícones de linha).
window.EVENTOS = [
  {
    titulo: "Festa das Crianças",
    ano: "2026",
    pasta: "eventos/festa-criancas-2026",
    data: "Outubro de 2026",
    ordem: 202610,
    respostas: 274,
    media: "9,69",
    icone: "balao",
  },
  {
    titulo: "Arraiá AV",
    ano: "2026",
    pasta: "eventos/arraia-2026",
    data: "Agosto de 2026",
    ordem: 202608,
    respostas: 317,
    media: "9,49",
    icone: "bandeira",
  },
  {
    titulo: "Colônia de Férias Inverno",
    ano: "2026",
    pasta: "eventos/colonia-ferias-inverno-2026",
    data: "Julho de 2026",
    ordem: 202607,
    respostas: 71,
    media: "9,66",
    icone: "floco",
  },
  {
    titulo: "Colônia de Férias Verão",
    ano: "2026",
    pasta: "eventos/colonia-ferias-verao-2026",
    data: "Janeiro de 2026",
    ordem: 202601,
    respostas: 132,
    media: "9,53",
    icone: "sol",
  },
];
