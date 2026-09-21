#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour corriger le script SQL d'import des commandes
Remplace la jointure sur ref_commerciale par code_article
"""

import re
from pathlib import Path

script_path = Path(__file__).parent.parent / "database" / "imports" / "04_commandes_data.sql"

print("Correction du script SQL...")

with open(script_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remplacer les jointures sur ref_commerciale par code_article
# Pattern: JOIN articles_catalogue a ON (a.ref_commerciale = 'XXX' OR a.code_article = 'XXX' OR a.ref_commercial = 'XXX')
# Par: JOIN articles_catalogue a ON a.code_article = 'XXX'
pattern = r"JOIN articles_catalogue a ON \(a\.ref_commerciale = '([^']+)' OR a\.code_article = '\1' OR a\.ref_commercial = '\1'\)"
replacement = r"JOIN articles_catalogue a ON a.code_article = '\1'"

content = re.sub(pattern, replacement, content)

# Sauvegarder
with open(script_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"[OK] Script corrige: {script_path}")
print("   Les jointures utilisent maintenant uniquement code_article")
