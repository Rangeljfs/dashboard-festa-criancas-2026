# -*- coding: utf-8 -*-
"""Agrega a pesquisa Festa das Crianças 2026 em dados.js (sem PII).

TEMPLATE / REFERÊNCIA: cada pesquisa nova tem colunas diferentes na planilha.
Para um evento novo: copiar este arquivo, ajustar ORIGEM/DESTINO e os índices de
coluna em NOTAS, COMENTARIOS, perfil/fila/recomendação e os TEMAS, conforme o
cabeçalho real da planilha do evento. A saída (dados.js) vai para a pasta do evento.
NUNCA incluir colunas de nome, matrícula, celular ou e-mail no dados.js.
"""
import json, re, unicodedata
import openpyxl

ORIGEM = r"C:\Users\SNOT017\Documents\projetos claude\viking\Pesquisa - Festa das Crianças 2026(1-274).xlsx"
DESTINO = r"C:\Users\SNOT017\Documents\projetos claude\viking\dashboard-pesquisa\festa-criancas-2026\dados.js"

wb = openpyxl.load_workbook(ORIGEM, read_only=True, data_only=True)
ws = wb["Sheet1"]
ws.reset_dimensions()
rows = list(ws.iter_rows(values_only=True))
data = rows[1:]

NOTAS = [
    (6,  "Atividades para as crianças"),
    (8,  "Vai e Vem (micro-ônibus)"),
    (10, "Alimentação"),
    (12, "Cantinho Baby"),
    (14, "Apresentação: Ballet"),
    (15, "Apresentação: Bluey e Bingo"),
    (16, "Apresentação: Homem Aranha e Miles"),
    (18, "Bingo para as famílias"),
    (20, "Prêmios do Bingo"),
    (24, "Recomendação do evento"),
    (25, "Organização Geral"),
]
COMENTARIOS = [
    (7,  "Atividades"),
    (9,  "Micro-ônibus"),
    (11, "Alimentação"),
    (13, "Cantinho Baby"),
    (17, "Apresentações"),
    (19, "Bingo"),
    (21, "Prêmios do Bingo"),
    (23, "Filas"),
    (26, "Elogio / Crítica / Sugestão"),
]

def norm(t):
    return unicodedata.normalize("NFKD", t.lower()).encode("ascii", "ignore").decode()

def nota(v):
    if v is None:
        return None
    try:
        x = float(str(v).replace(",", ".").strip())
        return x if 0 <= x <= 10 else None
    except ValueError:
        return None

# ---- médias por pergunta -------------------------------------------------
perguntas = []
todas_notas = []
for col, label in NOTAS:
    vals = [nota(r[col]) for r in data]
    vals = [v for v in vals if v is not None]
    todas_notas.extend(vals)
    dist = {"10": 0, "9": 0, "8": 0, "le7": 0}
    for v in vals:
        if v >= 10: dist["10"] += 1
        elif v >= 9: dist["9"] += 1
        elif v >= 8: dist["8"] += 1
        else: dist["le7"] += 1
    perguntas.append({
        "label": label,
        "media": round(sum(vals) / len(vals), 2),
        "n": len(vals),
        "dist": dist,
        "pctAtencao": round(100 * dist["le7"] / len(vals), 1),
    })

media_geral = round(sum(todas_notas) / len(todas_notas), 2)

# ---- recomendação / filas / perfil --------------------------------------
rec = [nota(r[24]) for r in data]
rec = [v for v in rec if v is not None]
pct_promotores = round(100 * sum(1 for v in rec if v >= 9) / len(rec), 1)

fila_sim = sum(1 for r in data if str(r[22] or "").strip().lower().startswith("sim"))
fila_nao = sum(1 for r in data if str(r[22] or "").strip().lower().startswith("n"))
pct_sem_fila = round(100 * fila_nao / (fila_sim + fila_nao), 1)

perfil = {}
for r in data:
    p = str(r[27] or "").strip()
    if p:
        perfil[p] = perfil.get(p, 0) + 1

# ---- temas recorrentes (críticas e sugestões) ----------------------------
TEMAS = [
    ("Playlist / músicas inadequadas", ["funk", "playlist", "musica", "musicas", "grave", "baixo calao", "letras"]),
    ("Preços (comidas, jogos, bingo)", ["preco", "caro", "barat", "valor muito alto", "em conta", "custo", "pago", "pagos", "cobrar", "cartela"]),
    ("Assentos, mesas e sombra", ["sentar", "cadeira", "mesa", "arquibancada", "assento", "tenda", "sombra", "tapume"]),
    ("Kit alimentação flexível", ["kit"]),
    ("Comida fria / crua / porção", ["cru", "frio", "fria", "pequeno", "mesma coisa"]),
    ("Trenzinho de volta", ["trenzinho"]),
    ("Acessibilidade e banheiros", ["acessibilidade", "escada", "banheiro", "papel", "limpeza"]),
    ("Personagens e fotos", ["princesa", "personagen", "meia boca", "abaixo da expectativa", "foto", "acrobacia", "pirueta"]),
    ("Caixa perto dos brinquedos", ["caixa proximo", "caixa perto", "um caixa"]),
    ("Fila no açaí / caixa", ["acai", "20 minutos", "meia hora"]),
    ("Mistura de idades nos infláveis", ["grandes com as pequenas", "pequenas e grandes", "questao de idade", "muito grandes"]),
    ("Café à venda", ["cafe"]),
    ("Mais lixeiras", ["lixeira"]),
    ("Mais infláveis / brinquedos", ["mais inflav", "mais brinquedo", "mais pintura", "pouca distribuicao", "mais personagens"]),
]

ELOGIO_CURTO = re.compile(
    r"^(nao|nenhuma?|em nenhuma|n/?a|na|-|\.|otim[oa]s?|tudo otimo|muito bom|muito boa|boa|bom|excelente|perfeit[oa]s?|"
    r"tudo perfeito|parabens|show|10|top|maravilhos[oa]s?|amamos|adoramos|amei|adorei( tudo)?|otima|tudo bom|nada|"
    r"sim|lind[oa]s?|legal|legais|bacana|nota (10|mil|1000)|td 10|tudo 10|nao (usei|utilizei|assisti|participei|vi|entrei)|"
    r"nao enfrentei( fila)?s?|sem filas?|nao teve|nao se aplica|nao pegamos? fila|nao fiquei em fila.*|nao demorou)[\s.!]*$"
)

comentarios = []
tema_count = {t[0]: 0 for t in TEMAS}

for r in data:
    perfil_resp = str(r[27] or "").strip() or "Não informado"
    for col, campo in COMENTARIOS:
        v = r[col]
        if not v:
            continue
        t = str(v).strip()
        if len(t) < 3:
            continue
        ntxt = norm(t).strip()
        temas_hit = []
        for tema, kws in TEMAS:
            if any(k in ntxt for k in kws):
                temas_hit.append(tema)
        eh_curto = bool(ELOGIO_CURTO.match(ntxt))
        if eh_curto and not temas_hit:
            tipo = "elogio"
        elif temas_hit:
            tipo = "tema"
            for tema in temas_hit:
                tema_count[tema] += 1
        else:
            tipo = "geral"
        comentarios.append({
            "t": t.replace("\n", " "),
            "c": campo,
            "p": perfil_resp,
            "temas": temas_hit,
        })

temas_out = [{"tema": k, "n": v} for k, v in sorted(tema_count.items(), key=lambda x: -x[1]) if v > 0]

out = {
    "titulo": "Festa das Crianças 2026",
    "entidade": "Associação Volvo",
    "respostas": len(data),
    "mediaGeral": media_geral,
    "perguntas": perguntas,
    "recomendacao": {"media": round(sum(rec) / len(rec), 2), "pctPromotores": pct_promotores, "n": len(rec)},
    "filas": {"sim": fila_sim, "nao": fila_nao, "pctSemFila": pct_sem_fila},
    "perfil": perfil,
    "temas": temas_out,
    "comentarios": comentarios,
}

with open(DESTINO, "w", encoding="utf-8") as f:
    f.write("window.DADOS = ")
    json.dump(out, f, ensure_ascii=False)
    f.write(";\n")

print("Comentários:", len(comentarios))
print("Temas:")
for t in temas_out:
    print("  %-38s %d" % (t["tema"], t["n"]))
print("Média geral:", media_geral, "| Promotores:", pct_promotores, "% | Sem fila:", pct_sem_fila, "%")
