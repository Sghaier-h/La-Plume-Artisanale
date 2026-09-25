#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour importer les articles depuis un fichier CSV
"""

import pandas as pd
import sys
import os

def import_articles_from_csv(csv_path):
    """Lit le CSV et génère des INSERT SQL pour les articles"""
    
    # Lire le CSV
    try:
        df = pd.read_csv(csv_path, encoding='utf-8-sig')
        print(f"[OK] Fichier CSV lu: {len(df)} lignes")
    except Exception as e:
        print(f"[ERREUR] Erreur lors de la lecture du CSV: {e}")
        return
    
    # Afficher les colonnes
    print(f"\nColonnes trouvées: {list(df.columns)}")
    
    # Normaliser les noms de colonnes
    df.columns = df.columns.str.strip()
    
    # Générer le SQL
    sql_lines = []
    sql_lines.append("-- ============================================================================")
    sql_lines.append("-- IMPORTATION DES ARTICLES AVEC COULEURS")
    sql_lines.append("-- Généré automatiquement depuis le fichier CSV")
    sql_lines.append("-- ============================================================================\n")
    
    sql_lines.append("BEGIN;\n")
    
    count_inserted = 0
    count_updated = 0
    
    for idx, row in df.iterrows():
        try:
            # Extraire les données
            ref_commercial = str(row.get('Ref Commercial', '')).strip() if pd.notna(row.get('Ref Commercial')) else None
            ref_fabrication = str(row.get('Ref Fabrication', '')).strip() if pd.notna(row.get('Ref Fabrication')) else None
            type_produit = str(row.get('Type de produit', '')).strip() if pd.notna(row.get('Type de produit')) else None
            modele = str(row.get('Modèle', '')).strip() if pd.notna(row.get('Modèle')) else None
            code_modele = str(row.get('Code Modèle', '')).strip() if pd.notna(row.get('Code Modèle')) else None
            nb_couleurs = str(row.get('Nombre de couleur', '')).strip() if pd.notna(row.get('Nombre de couleur')) else None
            code_nb_couleurs = str(row.get('Code Nombre de couleur', '')).strip() if pd.notna(row.get('Code Nombre de couleur')) else None
            tissage = str(row.get('Type de Tissage', '')).strip() if pd.notna(row.get('Type de Tissage')) else None
            dimensions = str(row.get('Dimensions', '')).strip() if pd.notna(row.get('Dimensions')) else None
            code_dimensions = str(row.get('Code Dimensions', '')).strip() if pd.notna(row.get('Code Dimensions')) else None
            finition = str(row.get('Type de Finition', '')).strip() if pd.notna(row.get('Type de Finition')) else None
            couleur_article = str(row.get('Couleur Article', '')).strip() if pd.notna(row.get('Couleur Article')) else None
            description_article = str(row.get('Description Article', '')).strip() if pd.notna(row.get('Description Article')) else None
            dans_catalogue = str(row.get('Appartient au catalogue', 'Oui')).strip().lower() == 'oui' if pd.notna(row.get('Appartient au catalogue')) else True
            qte_min_stock = int(row.get('qte minimal stock', 0)) if pd.notna(row.get('qte minimal stock')) else 0
            
            # Codes sélecteurs
            code_s01 = str(row.get('Code Selecteur 01', '')).strip() if pd.notna(row.get('Code Selecteur 01')) else None
            code_s02 = str(row.get('Code Selecteur 02', '')).strip() if pd.notna(row.get('Code Selecteur 02')) else None
            code_s03 = str(row.get('Code Selecteur 03', '')).strip() if pd.notna(row.get('Code Selecteur 03')) else None
            
            # Vérifier les champs requis
            if not ref_commercial:
                print(f"[SKIP] Ligne {idx+2}: Ref Commercial manquante")
                continue
            
            # Générer la désignation si absente
            if not description_article:
                designation_parts = [modele, type_produit, dimensions]
                if couleur_article:
                    designation_parts.append(couleur_article)
                description_article = ' - '.join([p for p in designation_parts if p])
            
            # Utiliser ref_commercial comme code_article
            code_article = ref_commercial
            
            # Convertir boolean Python en SQL
            actif_sql = 'true' if dans_catalogue else 'false'
            
            # Créer l'INSERT avec ON CONFLICT DO UPDATE
            sql = f"""
INSERT INTO articles_catalogue (
    code_article, 
    designation, 
    ref_commerciale, 
    ref_fabrication,
    actif
) VALUES (
    '{code_article.replace("'", "''")}',
    '{description_article.replace("'", "''") if description_article else code_article.replace("'", "''")}',
    '{ref_commercial.replace("'", "''")}',
    '{ref_fabrication.replace("'", "''") if ref_fabrication else ref_commercial.replace("'", "''")}',
    {actif_sql}
)
ON CONFLICT (code_article) DO UPDATE SET
    designation = EXCLUDED.designation,
    ref_commerciale = EXCLUDED.ref_commerciale,
    ref_fabrication = EXCLUDED.ref_fabrication,
    actif = EXCLUDED.actif,
    date_modification = CURRENT_TIMESTAMP
RETURNING id_article;
"""
            sql_lines.append(sql)
            count_inserted += 1
            
        except Exception as e:
            print(f"[ERREUR] Ligne {idx+2}: {e}")
            continue
    
    sql_lines.append("\nCOMMIT;")
    
    # Écrire le fichier SQL
    output_file = os.path.join(os.path.dirname(csv_path), 'import_articles_generated.sql')
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_lines))
    
    print(f"\n[OK] Script SQL généré: {output_file}")
    print(f"[INFO] {count_inserted} articles préparés pour l'import")
    print(f"\n[INFO] Pour executer le script:")
    print(f"      psql -U votre_user -d votre_db -f {output_file}")
    print(f"      OU")
    print(f"      Utilisez l'interface d'import dans Parametrage > Import/Export")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python import_articles_csv.py <chemin_vers_csv>")
        sys.exit(1)
    
    csv_path = sys.argv[1]
    if not os.path.exists(csv_path):
        print(f"[ERREUR] Fichier non trouvé: {csv_path}")
        sys.exit(1)
    
    import_articles_from_csv(csv_path)
