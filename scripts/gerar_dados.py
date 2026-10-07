# -*- coding: utf-8 -*-
"""
Gera o dados.js de um evento a partir da planilha da pesquisa (sem dados pessoais).

COMO USAR (para a IA/Copilot ou para você):
  1. Inspecione a planilha para descobrir o índice (0-based) de cada coluna
     (veja o HANDOFF.md, seção 3, Passo 1).
  2. Ajuste APENAS o bloco "CONFIGURAÇÃO" abaixo: caminhos, título do evento,
     e os índices de coluna de cada campo.
  3. Rode:  python scripts/gerar_dados.py
     (precisa de openpyxl:  pip install openpyxl)
  4. O arquivo dados.js é criado em DESTINO, começando com "window.DADOS = {...};".

REGRA DE PRIVACIDADE: NUNCA inclua colunas de nome, matrícula, celular ou e-mail.
Só vão para o dados.js: notas (agregadas), contagens e os TEXTOS dos comentários
com o tipo de vínculo (perfil). Nada que identifique a pessoa.
"""
import json, re, unicodedata
import openpyxl

# ============================ CONFIGURAÇÃO ============================
# >>> Ajuste tudo nesta seção para cada evento novo. <<<

ORIGEM  = r"CAMINHO\DA\PLANILHA.xlsx"                 # planilha da pesquisa (.xlsx)
DESTINO = r"..\eventos\SLUG-DO-EVENTO\dados.js"        # saída (pasta do evento)
TITULO_EVENTO = "Nome do Evento AAAA"                 # ex: "Arraiá 2026"
ABA = None   # None = primeira aba; ou o nome exato da aba (ex: "Sheet1")

# Perguntas com NOTA (0-10): (indice_coluna_0based, "Rótulo exibido no dashboard")
NOTAS = [
    # (6,  "Atividades"),
    # (8,  "Alimentação"),
    # (24, "Recomendação do evento"),
    # (25, "Organização Geral"),
]

# Campos de COMENTÁRIO (texto livre): (indice_coluna_0based, "Rótulo do campo")
COMENTARIOS = [
    # (7,  "Atividades"),
    # (26, "Elogio / Crítica / Sugestão"),
]

COL_RECOMENDACAO = None  # índice da coluna de recomendação (nota 5-10). Ex: 24
COL_FILA         = None  # índice da coluna "enfrentou fila >5min?" (Sim/Não). Ex: 22. None = sem esse KPI
COL_PERFIL       = None  # índice da coluna "Você é:" (Funcionário/Dependente/Convidado). Ex: 27

# Temas recorrentes nos comentários: ("Nome do tema", [palavras-chave sem acento, minúsculas])
# Adapte ao evento. Deixe [] para o script não agrupar temas.
TEMAS = [
    # ("Preços", ["preco", "caro", "barato", "valor"]),
    # ("Filas", ["fila", "demora", "esperar"]),
    # ("Alimentação", ["comida", "cru", "frio", "quente"]),
]
# =====================================================================


def norm(t):
    return unicodedata.normalize("NFKD", str(t).lower()).encode("ascii", "ignore").decode()

def nota(v):
    if v is None:
        return None
    try:
        x = float(str(v).replace(",", ".").strip())
        return x if 0 <= x <= 10 else None
    except ValueError:
        return None

def media(vals):
    return round(sum(vals) / len(vals), 2) if vals else 0

# ---- carregar planilha ---------------------------------------------------
wb = openpyxl.load_workbook(ORIGEM, read_only=True, data_only=True)
ws = wb[ABA] if ABA else wb.worksheets[0]
ws.reset_dimensions()  # o Forms às vezes grava dimensão errada
rows = list(ws.iter_rows(values_only=True))
data = rows[1:]  # linha 0 = cabeçalho

# ---- médias por pergunta -------------------------------------------------
perguntas = []
todas_notas = []
for col, label in NOTAS:
    vals = [nota(r[col]) for r in data]
    vals = [v for v in vals if v is not None]
    if not vals:
        continue
    todas_notas.extend(vals)
    dist = {"10": 0, "9": 0, "8": 0, "le7": 0}
    for v in vals:
        if v >= 10: dist["10"] += 1
        elif v >= 9: dist["9"] += 1
        elif v >= 8: dist["8"] += 1
        else: dist["le7"] += 1
    perguntas.append({
        "label": label,
        "media": media(vals),
        "n": len(vals),
        "dist": dist,
        "pctAtencao": round(100 * dist["le7"] / len(vals), 1),
    })

media_geral = media(todas_notas)

# ---- recomendação --------------------------------------------------------
if COL_RECOMENDACAO is not None:
    rec = [nota(r[COL_RECOMENDACAO]) for r in data]
    rec = [v for v in rec if v is not None]
    recomendacao = {
        "media": media(rec),
        "pctPromotores": round(100 * sum(1 for v in rec if v >= 9) / len(rec), 1) if rec else 0,
        "n": len(rec),
    }
else:
    recomendacao = {"media": media_geral, "pctPromotores": 0, "n": 0}

# ---- filas ---------------------------------------------------------------
if COL_FILA is not None:
    fila_sim = sum(1 for r in data if str(r[COL_FILA] or "").strip().lower().startswith("sim"))
    fila_nao = sum(1 for r in data if str(r[COL_FILA] or "").strip().lower().startswith("n"))
    total_fila = fila_sim + fila_nao
    filas = {"sim": fila_sim, "nao": fila_nao,
             "pctSemFila": round(100 * fila_nao / total_fila, 1) if total_fila else 0}
else:
    filas = {"sim": 0, "nao": 0, "pctSemFila": 0}

# ---- perfil --------------------------------------------------------------
perfil = {}
if COL_PERFIL is not None:
    for r in data:
        p = str(r[COL_PERFIL] or "").strip()
        if p:
            perfil[p] = perfil.get(p, 0) + 1

# ---- comentários + temas -------------------------------------------------
ELOGIO_CURTO = re.compile(
    r"^(nao|nenhuma?|em nenhuma|n/?a|na|-|\.|otim[oa]s?|tudo otimo|muito bom|muito boa|boa|bom|excelente|perfeit[oa]s?|"
    r"tudo perfeito|parabens|show|10|top|maravilhos[oa]s?|amamos|adoramos|amei|adorei( tudo)?|otima|tudo bom|nada|"
    r"sim|lind[oa]s?|legal|legais|bacana|nota (10|mil|1000)|td 10|tudo 10|nao (usei|utilizei|assisti|participei|vi|entrei)|"
    r"nao enfrentei( fila)?s?|sem filas?|nao teve|nao se aplica|nao pegamos? fila|nao fiquei em fila.*|nao demorou)[\s.!]*$"
)

comentarios = []
tema_count = {t[0]: 0 for t in TEMAS}

for r in data:
    perfil_resp = (str(r[COL_PERFIL] or "").strip() if COL_PERFIL is not None else "") or "Não informado"
    for col, campo in COMENTARIOS:
        v = r[col]
        if not v:
            continue
        t = str(v).strip()
        if len(t) < 3:
            continue
        ntxt = norm(t).strip()
        temas_hit = [tema for tema, kws in TEMAS if any(k in ntxt for k in kws)]
        for tema in temas_hit:
            tema_count[tema] += 1
        comentarios.append({
            "t": t.replace("\n", " "),
            "c": campo,
            "p": perfil_resp,
            "temas": temas_hit,
        })

temas_out = [{"tema": k, "n": v} for k, v in sorted(tema_count.items(), key=lambda x: -x[1]) if v > 0]

# ---- montar e gravar -----------------------------------------------------
out = {
    "titulo": TITULO_EVENTO,
    "entidade": "Associação Volvo",
    "respostas": len(data),
    "mediaGeral": media_geral,
    "perguntas": perguntas,
    "recomendacao": recomendacao,
    "filas": filas,
    "perfil": perfil,
    "temas": temas_out,
    "comentarios": comentarios,
}

with open(DESTINO, "w", encoding="utf-8") as f:
    f.write("window.DADOS = ")
    json.dump(out, f, ensure_ascii=False)
    f.write(";\n")

print("OK ->", DESTINO)
print("Respostas:", len(data), "| Perguntas:", len(perguntas), "| Média geral:", media_geral)
print("Comentários:", len(comentarios), "| Temas:", len(temas_out))
for t in temas_out:
    print("  %-38s %d" % (t["tema"], t["n"]))
