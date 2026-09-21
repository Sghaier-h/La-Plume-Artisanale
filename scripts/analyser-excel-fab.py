#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour analyser la structure des fichiers Excel dans "Excel fab"
et générer un rapport pour adapter l'import/export
"""

import sys
import os
import json
from pathlib import Path

try:
    import pandas as pd
except ImportError:
    print("Installation de pandas et openpyxl...")
    os.system("pip install pandas openpyxl")
    import pandas as pd

def analyser_fichier_excel(chemin_fichier):
    """Analyse un fichier Excel et retourne sa structure"""
    try:
        excel_file = pd.ExcelFile(chemin_fichier)
        
        result = {
            'fichier': os.path.basename(chemin_fichier),
            'chemin_complet': str(chemin_fichier),
            'nombre_feuilles': len(excel_file.sheet_names),
            'feuilles': []
        }
        
        for sheet_name in excel_file.sheet_names:
            print(f"Analyse de la feuille: {sheet_name}")
            df = pd.read_excel(excel_file, sheet_name=sheet_name, nrows=1000)  # Limiter pour les gros fichiers
            
            # Détecter si c'est une table (en-tête en première ligne)
            headers = list(df.columns)
            first_row_data = df.iloc[0].tolist() if len(df) > 0 else []
            
            # Analyser les types de données
            types_data = {}
            for col in headers:
                non_null = df[col].dropna()
                if len(non_null) > 0:
                    # Détecter le type
                    if pd.api.types.is_numeric_dtype(df[col]):
                        types_data[col] = 'number'
                    elif pd.api.types.is_datetime64_any_dtype(df[col]):
                        types_data[col] = 'date'
                    else:
                        types_data[col] = 'text'
                else:
                    types_data[col] = 'unknown'
            
            sheet_info = {
                'nom': sheet_name,
                'lignes': len(df),
                'colonnes': len(headers),
                'en_tetes': headers,
                'types_colonnes': types_data,
                'exemples_lignes': df.head(5).to_dict('records') if len(df) > 0 else [],
                'valeurs_nulles': df.isnull().sum().to_dict()
            }
            
            result['feuilles'].append(sheet_info)
        
        return result
        
    except Exception as e:
        print(f"Erreur lors de l'analyse de {chemin_fichier}: {e}")
        return None

def generer_rapport(results):
    """Génère un rapport markdown à partir des résultats"""
    rapport = "# Analyse des Fichiers Excel - Excel fab\n\n"
    rapport += "Ce rapport décrit la structure des fichiers Excel pour adapter l'import/export.\n\n"
    rapport += "---\n\n"
    
    for result in results:
        if not result:
            continue
            
        rapport += f"## 📄 {result['fichier']}\n\n"
        rapport += f"- **Chemin:** `{result['chemin_complet']}`\n"
        rapport += f"- **Nombre de feuilles:** {result['nombre_feuilles']}\n\n"
        
        for feuille in result['feuilles']:
            rapport += f"### Feuille: `{feuille['nom']}`\n\n"
            rapport += f"- **Dimensions:** {feuille['lignes']} lignes × {feuille['colonnes']} colonnes\n\n"
            
            rapport += "#### Colonnes:\n\n"
            rapport += "| # | Nom | Type | Valeurs nulles |\n"
            rapport += "|---|-----|------|----------------|\n"
            
            for i, col in enumerate(feuille['en_tetes'], 1):
                col_type = feuille['types_colonnes'].get(col, 'unknown')
                null_count = feuille['valeurs_nulles'].get(col, 0)
                rapport += f"| {i} | `{col}` | {col_type} | {null_count} |\n"
            
            rapport += "\n#### Exemples de données (premières 5 lignes):\n\n"
            if feuille['exemples_lignes']:
                # Créer un tableau avec les exemples
                exemples = feuille['exemples_lignes'][:3]  # Limiter à 3 lignes
                if exemples:
                    headers_md = "| " + " | ".join(feuille['en_tetes'][:10]) + " |\n"  # Limiter à 10 colonnes
                    rapport += headers_md
                    rapport += "|" + "|".join(["---"] * min(len(feuille['en_tetes']), 10)) + "|\n"
                    
                    for exemple in exemples:
                        row_values = [str(exemple.get(col, ''))[:30] for col in feuille['en_tetes'][:10]]
                        rapport += "| " + " | ".join(row_values) + " |\n"
            
            rapport += "\n---\n\n"
    
    return rapport

def main():
    # Chemin du dossier Excel fab (remonter depuis scripts -> La-Plume-Artisanale -> PROJET)
    script_dir = Path(__file__).resolve().parent
    base_dir = script_dir.parent.parent / "Excel fab"
    
    if not base_dir.exists():
        print(f"Le dossier {base_dir} n'existe pas!")
        return
    
    # Lister tous les fichiers Excel
    fichiers_excel = list(base_dir.glob("*.xlsx")) + list(base_dir.glob("*.xls"))
    
    if not fichiers_excel:
        print(f"Aucun fichier Excel trouvé dans {base_dir}")
        return
    
    print(f"Trouvé {len(fichiers_excel)} fichier(s) Excel à analyser\n")
    
    results = []
    
    for fichier in fichiers_excel:
        print(f"Analyse de: {fichier.name}")
        result = analyser_fichier_excel(fichier)
        if result:
            results.append(result)
        print()
    
    # Générer le rapport
    rapport = generer_rapport(results)
    
    # Sauvegarder le rapport
    rapport_path = Path(__file__).parent.parent / "docs" / "ANALYSE_EXCEL_FAB.md"
    rapport_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(rapport_path, 'w', encoding='utf-8') as f:
        f.write(rapport)
    
    print(f"\n✅ Rapport généré: {rapport_path}")
    
    # Sauvegarder aussi en JSON pour traitement ultérieur
    json_path = Path(__file__).parent.parent / "docs" / "ANALYSE_EXCEL_FAB.json"
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Données JSON générées: {json_path}")
    
    # Afficher un résumé
    print("\n" + "="*80)
    print("RÉSUMÉ")
    print("="*80)
    for result in results:
        print(f"\n📄 {result['fichier']}")
        for feuille in result['feuilles']:
            print(f"   - {feuille['nom']}: {feuille['colonnes']} colonnes, {feuille['lignes']} lignes")
            print(f"     Colonnes: {', '.join(feuille['en_tetes'][:5])}")
            if len(feuille['en_tetes']) > 5:
                print(f"     ... et {len(feuille['en_tetes']) - 5} autres colonnes")

if __name__ == "__main__":
    main()
