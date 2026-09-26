#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour générer les INSERT SQL des articles parents depuis un fichier Excel
"""

import pandas as pd
import sys
import os

def parse_prix(prix_str):
    """Convertit un prix avec virgule en nombre"""
    if pd.isna(prix_str) or prix_str == '':
        return None
    # Remplacer virgule par vide et convertir en float
    prix_str = str(prix_str).replace(',', '').replace(' ', '').strip()
    try:
        return float(prix_str)
    except:
        return None

def generer_code_article(code_modele, code_dim, code_tissage, code_nb_couleurs, code_finition):
    """Génère un code article unique"""
    parts = [code_modele, code_dim, code_tissage, code_nb_couleurs, code_finition]
    return '-'.join([str(p) if pd.notna(p) and p != '' else '' for p in parts]).upper()

def generer_designation(modele, type_produit, tissage, nb_couleurs):
    """Génère une désignation pour l'article"""
    parts = [modele, type_produit, tissage, nb_couleurs]
    return ' - '.join([str(p) for p in parts if pd.notna(p) and p != ''])

def generer_sql_from_excel(excel_path, output_sql_path):
    """Génère un fichier SQL depuis un fichier Excel"""
    
    # Lire le fichier (Excel ou CSV)
    try:
        if excel_path.lower().endswith('.csv'):
            df = pd.read_csv(excel_path, encoding='utf-8-sig')
        else:
            df = pd.read_excel(excel_path)
        print(f"[OK] Fichier Excel lu: {len(df)} lignes")
    except Exception as e:
        print(f"[ERREUR] Erreur lors de la lecture du fichier Excel: {e}")
        return
    
    # Afficher les colonnes pour debug
    print(f"\nColonnes trouvées: {list(df.columns)}")
    
    # Normaliser les noms de colonnes (enlever espaces, accents, etc.)
    df.columns = df.columns.str.strip()
    
    # Mapping des colonnes attendues (flexible)
    colonnes_map = {
        'modèle': 'modele',
        'modele': 'modele',
        'Modèle': 'modele',
        'type de produit': 'type_produit',
        'Type de produit': 'type_produit',
        'code modèle': 'code_modele',
        'Code Modèle': 'code_modele',
        'code dimensi': 'code_dim',
        'Code Dimensi': 'code_dim',
        'dimension': 'code_dim',
        'type de tissage': 'tissage',
        'Type de Tissage': 'tissage',
        'code type de tissage': 'code_tissage',
        'Code Type de Tissage': 'code_tissage',
        'nombre de couleur': 'nb_couleurs',
        'Nombre de couleur': 'nb_couleurs',
        'code nombre de c': 'code_nb_couleurs',
        'Code Nombre de c': 'code_nb_couleurs',
        'type de fin': 'finition',
        'Type de Fin': 'finition',
        'code type': 'code_finition',
        'Code Type': 'code_finition',
        'compositio': 'composition',
        'Compositio': 'composition',
        'prix de reviens': 'prix_revient',
        'Prix de reviens': 'prix_revient',
        'prix de vente': 'prix_vente',
        'Prix de vente': 'prix_vente'
    }
    
    # Normaliser les noms de colonnes
    df_renamed = df.copy()
    for old_col, new_col in colonnes_map.items():
        if old_col in df_renamed.columns:
            df_renamed[new_col] = df_renamed[old_col]
    
    # Générer le SQL
    sql_lines = []
    sql_lines.append("-- ============================================================================")
    sql_lines.append("-- INSERTION DES MODÈLES D'ARTICLES PARENTS")
    sql_lines.append("-- Généré automatiquement depuis le fichier Excel")
    sql_lines.append("-- ============================================================================\n")
    
    sql_lines.append("-- Utiliser la fonction insert_article_parent créée dans insert_modeles_articles_parents.sql\n")
    
    count_inserted = 0
    
    for idx, row in df_renamed.iterrows():
        try:
            # Extraire les valeurs
            modele = str(row.get('modele', '')).strip() if pd.notna(row.get('modele')) else ''
            code_modele = str(row.get('code_modele', '')).strip() if pd.notna(row.get('code_modele')) else ''
            type_produit = str(row.get('type_produit', '')).strip() if pd.notna(row.get('type_produit')) else ''
            code_dim = str(row.get('code_dim', '')).strip() if pd.notna(row.get('code_dim')) else ''
            tissage = str(row.get('tissage', '')).strip() if pd.notna(row.get('tissage')) else ''
            code_tissage = str(row.get('code_tissage', '')).strip() if pd.notna(row.get('code_tissage')) else ''
            nb_couleurs = str(row.get('nb_couleurs', '')).strip() if pd.notna(row.get('nb_couleurs')) else ''
            code_nb_couleurs = str(row.get('code_nb_couleurs', '')).strip() if pd.notna(row.get('code_nb_couleurs')) else ''
            finition = str(row.get('finition', '')).strip() if pd.notna(row.get('finition')) else ''
            code_finition = str(row.get('code_finition', '')).strip() if pd.notna(row.get('code_finition')) else ''
            composition = row.get('composition', '') if pd.notna(row.get('composition')) else ''
            prix_revient = row.get('prix_revient', '') if pd.notna(row.get('prix_revient')) else ''
            prix_vente = row.get('prix_vente', '') if pd.notna(row.get('prix_vente')) else ''
            
            # Vérifier les champs obligatoires
            if not code_modele or not code_dim or not code_tissage:
                print(f"[WARN] Ligne {idx + 2}: Champs obligatoires manquants, ignoree")
                continue
            
            # Formater les prix
            prix_revient_str = str(prix_revient).replace('.', ',') if pd.notna(prix_revient) and prix_revient != '' else 'NULL'
            prix_vente_str = str(prix_vente).replace('.', ',') if pd.notna(prix_vente) and prix_vente != '' else 'NULL'
            composition_str = str(int(composition)) if pd.notna(composition) and composition != '' else 'NULL'
            
            # Échapper les apostrophes dans les chaînes
            def escape_str(s):
                if not s or s == '' or s == 'nan':
                    return 'NULL'
                return "'" + str(s).replace("'", "''") + "'"
            
            # Générer l'appel à la fonction
            sql_call = f"SELECT insert_article_parent("
            sql_call += f"{escape_str(modele)}, "  # p_modele
            sql_call += f"{escape_str(code_modele)}, "  # p_code_modele
            sql_call += f"{escape_str(type_produit)}, "  # p_type_produit
            sql_call += f"{escape_str(code_dim)}, "  # p_code_dim
            sql_call += f"{escape_str(tissage)}, "  # p_tissage
            sql_call += f"{escape_str(code_tissage)}, "  # p_code_tissage
            sql_call += f"{escape_str(nb_couleurs)}, "  # p_nb_couleurs
            sql_call += f"{escape_str(code_nb_couleurs)}, "  # p_code_nb_couleurs
            sql_call += f"{escape_str(finition)}, "  # p_finition
            sql_call += f"{escape_str(code_finition)}, "  # p_code_finition
            sql_call += f"{composition_str}, "  # p_composition
            sql_call += f"{escape_str(prix_revient_str) if prix_revient_str != 'NULL' else 'NULL'}, "  # p_prix_revient
            sql_call += f"{escape_str(prix_vente_str) if prix_vente_str != 'NULL' else 'NULL'}"  # p_prix_vente
            sql_call += ");"
            
            sql_lines.append(sql_call)
            count_inserted += 1
            
        except Exception as e:
            print(f"[WARN] Erreur ligne {idx + 2}: {e}")
            continue
    
    sql_lines.append("\n-- Message de confirmation")
    sql_lines.append("DO $$")
    sql_lines.append("DECLARE")
    sql_lines.append("  v_total INTEGER;")
    sql_lines.append("BEGIN")
    sql_lines.append(f"  SELECT COUNT(*) INTO v_total FROM articles_catalogue WHERE id_modele IS NOT NULL;")
    sql_lines.append("  RAISE NOTICE '✅ Insertion terminée: % articles créés/mis à jour', v_total;")
    sql_lines.append("END $$;")
    
    # Écrire le fichier SQL
    with open(output_sql_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_lines))
    
    print(f"\n[OK] Fichier SQL genere: {output_sql_path}")
    print(f"   - {count_inserted} lignes d'insertion générées")

if __name__ == '__main__':
    # Chemin du fichier Excel (par défaut)
    default_excel = os.path.join('..', 'Excel fab', 'Paramétrages.xlsx')
    
    if len(sys.argv) > 1:
        excel_path = sys.argv[1]
    else:
        excel_path = default_excel
    
    if len(sys.argv) > 2:
        output_path = sys.argv[2]
    else:
        output_path = os.path.join('..', 'database', 'insert_articles_parents_from_excel.sql')
    
    print(f"Lecture du fichier Excel: {excel_path}")
    print(f"Generation du fichier SQL: {output_path}\n")
    
    generer_sql_from_excel(excel_path, output_path)
