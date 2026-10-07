# -*- coding: utf-8 -*-
"""
EXEMPLO PREENCHIDO — este foi o script real usado para a Festa das Crianças 2026.
Serve de referência de como ficam os índices de coluna e os TEMAS preenchidos.
O template em branco é scripts/gerar_dados.py.

Planilha de origem (Microsoft Forms): "Pesquisa - Festa das Crianças 2026(1-274).xlsx"
Cabeçalho (índices 0-based) desta planilha específica:
  0 ID | 1 Start time | 2 Completion time | 3 Email | 4 Name | 5 Last modified
  6  Qualidade/quantidade de atividades (nota)
  7  comentário Atividades
  8  Vai e Vem micro-ônibus (nota)         | 9  comentário micro-ônibus
  10 Alimentação (nota)                     | 11 comentário Alimentação
  12 Cantinho Baby (nota)                   | 13 comentário Cantinho Baby
  14 Ballet (nota) | 15 Bluey e Bingo (nota) | 16 Homem Aranha/Miles (nota) | 17 comentário apresentações
  18 Bingo famílias (nota)                  | 19 comentário Bingo
  20 Prêmios do Bingo (nota)                | 21 comentário prêmios
  22 Enfrentou fila >5min? (Sim/Não)        | 23 em qual barraca / quanto tempo
  24 Recomendação 5-10 (nota)
  25 Organização Geral (nota)               | 26 elogio/crítica/sugestão
  27 Você é: (Funcionário/Dependente/Convidado)
  28 Nome completo | 29 Matrícula | 30 Celular | 31 Autorização  <- NUNCA usar (PII)
"""
import json, re, unicodedata
import openpyxl

ORIGEM = r"C:\Users\SNOT017\Documents\projetos claude\viking\Pesquisa - Festa das Crianças 2026(1-274).xlsx"
DESTINO = r"..\..\eventos\festa-criancas-2026\dados.js"
TITULO_EVENTO = "Festa das Crianças 2026"
ABA = None

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
    (7, "Atividades"), (9, "Micro-ônibus"), (11, "Alimentação"), (13, "Cantinho Baby"),
    (17, "Apresentações"), (19, "Bingo"), (21, "Prêmios do Bingo"), (23, "Filas"),
    (26, "Elogio / Crítica / Sugestão"),
]
COL_RECOMENDACAO = 24
COL_FILA = 22
COL_PERFIL = 27

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

# A lógica de processamento é idêntica à do template scripts/gerar_dados.py.
# (mantida aqui só como exemplo preenchido; para rodar, use o template ou copie a lógica)
print("Exemplo de referência. Use scripts/gerar_dados.py (template) para rodar.")
