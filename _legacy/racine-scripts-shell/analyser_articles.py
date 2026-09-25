#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour analyser les données d'articles depuis Excel
et générer le script SQL d'import
"""

import os
import sys
import pandas as pd
from pathlib import Path

# Configurer l'encodage pour Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Chemin vers le dossier Excel fab
EXCEL_FAB_DIR = Path(__file__).parent.parent.parent / "Excel fab"

def analyser_articles(fichier_excel=None):
    """
    Analyse les données d'articles depuis un fichier Excel
    """
    print("=" * 80)
    print("ANALYSE DES ARTICLES")
    print("=" * 80)
    print()
    
    # Si aucun fichier n'est spécifié, chercher dans Excel fab
    if fichier_excel is None:
        fichiers_possibles = [
            EXCEL_FAB_DIR / "Article.xlsx",
            EXCEL_FAB_DIR / "Articles.xlsx",
        ]
        
        for fichier in fichiers_possibles:
            if fichier.exists():
                fichier_excel = fichier
                print(f"[OK] Fichier trouve: {fichier_excel.name}")
                break
    
    if fichier_excel is None or not Path(fichier_excel).exists():
        print("[ERREUR] Aucun fichier Excel trouve.")
        print("[INFO] Veuillez specifier le chemin du fichier Excel contenant les articles")
        print("   ou placez-le dans le dossier 'Excel fab'")
        return None
    
    try:
        # Lire le fichier Excel
        print(f"\n[LECTURE] Lecture du fichier: {fichier_excel}")
        xls = pd.ExcelFile(fichier_excel)
        
        print(f"\n[FEUILLES] Feuilles disponibles: {', '.join(xls.sheet_names)}")
        print()
        
        # Lire la première feuille (ou chercher une feuille avec "Article")
        feuille_articles = None
        for sheet_name in xls.sheet_names:
            if 'article' in sheet_name.lower():
                feuille_articles = sheet_name
                break
        
        if feuille_articles is None:
            feuille_articles = xls.sheet_names[0]
        
        print(f"[OK] Feuille utilisee: '{feuille_articles}'")
        
        # Lire les données
        df = pd.read_excel(xls, sheet_name=feuille_articles)
        
        print("=" * 80)
        print("DONNEES TROUVEES")
        print("=" * 80)
        print()
        print(f"Nombre de lignes: {len(df)}")
        print(f"Colonnes: {', '.join(df.columns.tolist())}")
        print()
        
        # Afficher un aperçu
        print("=" * 80)
        print("APERCU DES DONNEES (5 premieres lignes)")
        print("=" * 80)
        print()
        print(df.head(5).to_string())
        print()
        
        # Analyser les colonnes
        print("=" * 80)
        print("ANALYSE DES COLONNES")
        print("=" * 80)
        print()
        
        colonnes_attendues = {
            'ref_commercial': ['ref article commerci', 'ref commercial', 'ref_commercial', 'ref commerciale'],
            'ref_fabrication': ['ref article fabricatio', 'ref fabrication', 'ref_fabrication'],
            'type_produit': ['type de produ', 'type produit', 'type_produit', 'produit'],
            'modele': ['modèle', 'modele', 'libelle'],
            'code_modele': ['code model', 'code_modele', 'code modele', 'code modèle'],
            'nombre_couleur': ['nombre de couleu', 'nombre couleur', 'nombre_couleur'],
            'code_nombre_couleur': ['code nombre de couleu', 'code nombre couleur', 'code_nombre_couleur'],
            'type_tissage': ['type de tissag', 'type tissage', 'type_tissage', 'tissage'],
            'dimension': ['dimension'],
            'code_dimension': ['code dimension', 'code_dimension'],
            'type_finition': ['type de finitio', 'type finition', 'type_finition', 'finition'],
            'code_type_finition': ['code type de finitio', 'code type finition', 'code_type_finition'],
            'personnalisation': ['personnalisatio', 'personnalisation'],
            'code_couleur_article': ['code couleur articl', 'code couleur article', 'code_couleur_article'],
            'couleur_article': ['couleur articl', 'couleur article', 'couleur_article'],
            'description_article': ['description articl', 'description article', 'description_article'],
            'prix_revient': ['prix de revien', 'prix revient', 'prix_revient'],
            'prix_vente': ['prix de vent', 'prix vente', 'prix_vente'],
            'categorie': ['categorie', 'category'],
            'qte_minimal_stock': ['qte minimal stoc', 'qte minimal stock', 'qte_minimal_stock'],
            'vente_ecommerce': ['vente ecommerc', 'vente ecommerce', 'vente_ecommerce']
        }
        
        mapping_colonnes = {}
        for champ, variantes in colonnes_attendues.items():
            for col in df.columns:
                if any(var.lower() in col.lower() for var in variantes):
                    mapping_colonnes[champ] = col
                    print(f"[OK] {champ}: '{col}'")
                    break
            if champ not in mapping_colonnes:
                print(f"[ATTENTION] {champ}: NON TROUVE")
        
        # Chercher les colonnes Code Selecteur
        selecteurs_colonnes = []
        for col in df.columns:
            if 'code selecteur' in col.lower() or 'selecteur' in col.lower():
                selecteurs_colonnes.append(col)
                if 'selecteurs' not in mapping_colonnes:
                    mapping_colonnes['selecteurs'] = []
                mapping_colonnes['selecteurs'].append(col)
        
        if selecteurs_colonnes:
            print(f"[OK] Code Selecteurs trouves ({len(selecteurs_colonnes)}): {', '.join(selecteurs_colonnes)}")
        
        print()
        
        # Vérifier les valeurs uniques pour certaines colonnes
        if 'type_produit' in mapping_colonnes:
            col = mapping_colonnes['type_produit']
            types_produits = df[col].dropna().unique()
            print(f"[TYPES PRODUITS] Types de Produits trouves ({len(types_produits)}):")
            for tp in sorted(types_produits):
                print(f"   - {tp}")
            print()
        
        if 'code_modele' in mapping_colonnes:
            col = mapping_colonnes['code_modele']
            codes_modeles = df[col].dropna().unique()
            print(f"[CODES MODELES] Codes Modeles trouves ({len(codes_modeles)}):")
            for cm in sorted(codes_modeles):
                print(f"   - {cm}")
            print()
        
        # Vérifier et supprimer les doublons de ref_commercial
        if 'ref_commercial' in mapping_colonnes:
            col = mapping_colonnes['ref_commercial']
            doublons = df[df.duplicated(subset=[col], keep=False)]
            if len(doublons) > 0:
                print(f"[ATTENTION] {len(doublons)} references commerciales en doublon trouvees")
                print(f"[ACTION] Suppression des doublons (conservation de la premiere occurrence)")
                # Supprimer les doublons en gardant la première occurrence
                df = df.drop_duplicates(subset=[col], keep='first')
                print(f"[OK] {len(df)} lignes restantes apres suppression des doublons")
                print()
            else:
                print("[OK] Aucun doublon de reference commerciale trouve")
                print()
        
        return {
            'dataframe': df,
            'mapping': mapping_colonnes,
            'feuille': feuille_articles
        }
        
    except Exception as e:
        print(f"[ERREUR] Erreur lors de l'analyse: {e}")
        import traceback
        traceback.print_exc()
        return None


def generer_sql_articles(analyse_result):
    """
    Génère le script SQL d'import des articles
    """
    if analyse_result is None:
        return None
    
    df = analyse_result['dataframe']
    mapping = analyse_result['mapping']
    
    print("=" * 80)
    print("GENERATION DU SCRIPT SQL")
    print("=" * 80)
    print()
    
    # Vérifier que les colonnes nécessaires sont présentes
    colonnes_requises = ['ref_commercial', 'ref_fabrication']
    colonnes_manquantes = [c for c in colonnes_requises if c not in mapping]
    
    if colonnes_manquantes:
        print(f"[ERREUR] Colonnes manquantes: {', '.join(colonnes_manquantes)}")
        return None
    
    # Préparer les données
    print("[TRAITEMENT] Traitement des donnees...")
    print()
    
    articles = []
    for idx, row in df.iterrows():
        ref_commercial = str(row[mapping['ref_commercial']]).strip() if pd.notna(row[mapping['ref_commercial']]) else None
        ref_fabrication = str(row[mapping['ref_fabrication']]).strip() if pd.notna(row[mapping['ref_fabrication']]) else None
        
        if not ref_commercial or not ref_fabrication:
            continue
        
        # Extraire les autres champs
        type_produit = str(row[mapping.get('type_produit', '')]).strip() if mapping.get('type_produit') and pd.notna(row[mapping.get('type_produit', '')]) else None
        modele = str(row[mapping.get('modele', '')]).strip() if mapping.get('modele') and pd.notna(row[mapping.get('modele', '')]) else None
        code_modele = str(row[mapping.get('code_modele', '')]).strip() if mapping.get('code_modele') and pd.notna(row[mapping.get('code_modele', '')]) else None
        nombre_couleur = str(row[mapping.get('nombre_couleur', '')]).strip() if mapping.get('nombre_couleur') and pd.notna(row[mapping.get('nombre_couleur', '')]) else None
        code_nombre_couleur = str(row[mapping.get('code_nombre_couleur', '')]).strip() if mapping.get('code_nombre_couleur') and pd.notna(row[mapping.get('code_nombre_couleur', '')]) else None
        type_tissage = str(row[mapping.get('type_tissage', '')]).strip() if mapping.get('type_tissage') and pd.notna(row[mapping.get('type_tissage', '')]) else None
        dimension = str(row[mapping.get('dimension', '')]).strip() if mapping.get('dimension') and pd.notna(row[mapping.get('dimension', '')]) else None
        code_dimension = str(row[mapping.get('code_dimension', '')]).strip() if mapping.get('code_dimension') and pd.notna(row[mapping.get('code_dimension', '')]) else None
        type_finition = str(row[mapping.get('type_finition', '')]).strip() if mapping.get('type_finition') and pd.notna(row[mapping.get('type_finition', '')]) else None
        code_type_finition = str(row[mapping.get('code_type_finition', '')]).strip() if mapping.get('code_type_finition') and pd.notna(row[mapping.get('code_type_finition', '')]) else None
        personnalisation = str(row[mapping.get('personnalisation', '')]).strip() if mapping.get('personnalisation') and pd.notna(row[mapping.get('personnalisation', '')]) else None
        code_couleur_article = str(row[mapping.get('code_couleur_article', '')]).strip() if mapping.get('code_couleur_article') and pd.notna(row[mapping.get('code_couleur_article', '')]) else None
        couleur_article = str(row[mapping.get('couleur_article', '')]).strip() if mapping.get('couleur_article') and pd.notna(row[mapping.get('couleur_article', '')]) else None
        description_article = str(row[mapping.get('description_article', '')]).strip() if mapping.get('description_article') and pd.notna(row[mapping.get('description_article', '')]) else None
        prix_revient = row[mapping.get('prix_revient', '')] if mapping.get('prix_revient') and pd.notna(row[mapping.get('prix_revient', '')]) else None
        prix_vente = row[mapping.get('prix_vente', '')] if mapping.get('prix_vente') and pd.notna(row[mapping.get('prix_vente', '')]) else None
        categorie = str(row[mapping.get('categorie', '')]).strip() if mapping.get('categorie') and pd.notna(row[mapping.get('categorie', '')]) else None
        qte_minimal_stock = row[mapping.get('qte_minimal_stock', '')] if mapping.get('qte_minimal_stock') and pd.notna(row[mapping.get('qte_minimal_stock', '')]) else None
        vente_ecommerce = str(row[mapping.get('vente_ecommerce', '')]).strip() if mapping.get('vente_ecommerce') and pd.notna(row[mapping.get('vente_ecommerce', '')]) else None
        
        # Extraire les codes selecteurs
        codes_selecteurs = []
        if 'selecteurs' in mapping and isinstance(mapping['selecteurs'], list):
            for col_selecteur in mapping['selecteurs']:
                code_sel = str(row[col_selecteur]).strip() if pd.notna(row[col_selecteur]) else None
                if code_sel and code_sel and code_sel != 'nan':
                    codes_selecteurs.append(code_sel)
        
        articles.append({
            'ref_commercial': ref_commercial,
            'ref_fabrication': ref_fabrication,
            'type_produit': type_produit,
            'modele': modele,
            'code_modele': code_modele,
            'nombre_couleur': nombre_couleur,
            'code_nombre_couleur': code_nombre_couleur,
            'type_tissage': type_tissage,
            'dimension': dimension,
            'code_dimension': code_dimension,
            'type_finition': type_finition,
            'code_type_finition': code_type_finition,
            'personnalisation': personnalisation,
            'code_couleur_article': code_couleur_article,
            'couleur_article': couleur_article,
            'description_article': description_article,
            'prix_revient': prix_revient,
            'prix_vente': prix_vente,
            'categorie': categorie,
            'qte_minimal_stock': qte_minimal_stock,
            'vente_ecommerce': vente_ecommerce,
            'codes_selecteurs': codes_selecteurs
        })
    
    print(f"[OK] {len(articles)} articles prepares pour l'import")
    print()
    
    # Générer le script SQL
    sql_lines = []
    sql_lines.append("-- ============================================================================")
    sql_lines.append("-- IMPORT DES ARTICLES - DONNEES REELLES")
    sql_lines.append("-- ============================================================================")
    sql_lines.append(f"-- Script genere automatiquement le {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}")
    sql_lines.append(f"-- Nombre d'articles: {len(articles)}")
    sql_lines.append("-- ============================================================================")
    sql_lines.append("")
    sql_lines.append("BEGIN;")
    sql_lines.append("")
    sql_lines.append("-- ============================================================================")
    sql_lines.append("-- 1. MISE A JOUR DE LA STRUCTURE DE LA TABLE")
    sql_lines.append("-- ============================================================================")
    sql_lines.append("")
    sql_lines.append("-- Ajouter les colonnes si elles n'existent pas")
    sql_lines.append("DO $$")
    sql_lines.append("BEGIN")
    sql_lines.append("    -- Colonnes pour les relations")
    sql_lines.append("    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles_catalogue' AND column_name = 'id_nombre_couleurs') THEN")
    sql_lines.append("        ALTER TABLE articles_catalogue ADD COLUMN id_nombre_couleurs INTEGER REFERENCES parametres_nombre_couleurs(id);")
    sql_lines.append("    END IF;")
    sql_lines.append("    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles_catalogue' AND column_name = 'id_couleur') THEN")
    sql_lines.append("        ALTER TABLE articles_catalogue ADD COLUMN id_couleur INTEGER REFERENCES parametres_couleurs(id);")
    sql_lines.append("    END IF;")
    sql_lines.append("    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles_catalogue' AND column_name = 'id_personnalisation') THEN")
    sql_lines.append("        ALTER TABLE articles_catalogue ADD COLUMN id_personnalisation INTEGER REFERENCES parametres_personnalisations(id);")
    sql_lines.append("    END IF;")
    sql_lines.append("    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles_catalogue' AND column_name = 'qte_minimal_stock') THEN")
    sql_lines.append("        ALTER TABLE articles_catalogue ADD COLUMN qte_minimal_stock INTEGER DEFAULT 0;")
    sql_lines.append("    END IF;")
    sql_lines.append("    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles_catalogue' AND column_name = 'prix_vente') THEN")
    sql_lines.append("        ALTER TABLE articles_catalogue ADD COLUMN prix_vente DECIMAL(10,2);")
    sql_lines.append("    END IF;")
    sql_lines.append("END $$;")
    sql_lines.append("")
    sql_lines.append("-- ============================================================================")
    sql_lines.append("-- 2. INSERTION DES ARTICLES")
    sql_lines.append("-- ============================================================================")
    sql_lines.append("")
    
    # Générer les INSERT
    for article in articles:
        # Échapper les apostrophes
        ref_commercial = article['ref_commercial'].replace("'", "''")
        ref_fabrication = article['ref_fabrication'].replace("'", "''")
        description = (article['description_article'] or '').replace("'", "''")
        couleur = (article['couleur_article'] or '').replace("'", "''")
        
        # Construire la ligne INSERT avec gestion des valeurs NULL
        type_produit_val = article['type_produit'] or ''
        type_tissage_val = article['type_tissage'] or ''
        code_dimension_val = article['code_dimension'] or ''
        code_finition_val = article['code_type_finition'] or ''
        code_nombre_couleur_val = article['code_nombre_couleur'] or ''
        code_couleur_val = article['code_couleur_article'] or ''
        personnalisation_val = article['personnalisation'] or ''
        code_modele_val = article['code_modele'] or ''
        
        # Échapper les valeurs pour SQL
        type_produit_val = type_produit_val.replace("'", "''")
        type_tissage_val = type_tissage_val.replace("'", "''")
        
        prix_revient_val = article['prix_revient'] if article['prix_revient'] is not None else 'NULL'
        prix_vente_val = article['prix_vente'] if article['prix_vente'] is not None else 'NULL'
        qte_minimal_val = article['qte_minimal_stock'] if article['qte_minimal_stock'] is not None else '0'
        dans_catalogue = 'true' if article['categorie'] and 'catalogue' in str(article['categorie']).lower() else 'false'
        
        sql_lines.append(f"-- Article: {ref_commercial}")
        sql_lines.append(f"INSERT INTO articles_catalogue (")
        sql_lines.append(f"    ref_commerciale, ref_fabrication, designation, description,")
        sql_lines.append(f"    code_article, id_modele, id_dimension, id_finition,")
        sql_lines.append(f"    id_tissage, id_nombre_couleurs, id_couleur, id_personnalisation,")
        sql_lines.append(f"    prix_revient, prix_vente, qte_minimal_stock, dans_catalogue_produit, actif")
        sql_lines.append(f")")
        sql_lines.append(f"SELECT")
        sql_lines.append(f"    '{ref_commercial}', '{ref_fabrication}', '{description or ref_commercial}', '{description}',")
        sql_lines.append(f"    '{ref_commercial}' as code_article,")
        sql_lines.append(f"    pm.id as id_modele,")
        sql_lines.append(f"    pd.id as id_dimension,")
        sql_lines.append(f"    pf.id as id_finition,")
        sql_lines.append(f"    t.id as id_tissage,")
        sql_lines.append(f"    pnp.id as id_nombre_couleurs,")
        sql_lines.append(f"    pc.id as id_couleur,")
        sql_lines.append(f"    pp.id as id_personnalisation,")
        sql_lines.append(f"    {prix_revient_val},")
        sql_lines.append(f"    {prix_vente_val},")
        sql_lines.append(f"    {qte_minimal_val},")
        sql_lines.append(f"    {dans_catalogue},")
        sql_lines.append(f"    true")
        sql_lines.append(f"FROM parametres_modeles pm")
        sql_lines.append(f"LEFT JOIN parametres_dimensions pd ON pd.code = '{code_dimension_val}'")
        sql_lines.append(f"LEFT JOIN parametres_finitions pf ON pf.code = '{code_finition_val}'")
        sql_lines.append(f"LEFT JOIN parametres_tissages t ON t.code = '{type_tissage_val}' OR t.libelle ILIKE '%{type_tissage_val}%'")
        sql_lines.append(f"LEFT JOIN parametres_nombre_couleurs pnp ON pnp.code = '{code_nombre_couleur_val}'")
        sql_lines.append(f"LEFT JOIN parametres_couleurs pc ON pc.code_commercial = '{code_couleur_val}'")
        sql_lines.append(f"LEFT JOIN parametres_personnalisations pp ON pp.code = '{personnalisation_val}' OR pp.libelle ILIKE '%{personnalisation_val}%'")
        sql_lines.append(f"WHERE pm.code_modele = '{code_modele_val}'")
        sql_lines.append(f"ON CONFLICT (code_article) DO UPDATE SET")
        sql_lines.append(f"    ref_commerciale = EXCLUDED.ref_commerciale,")
        sql_lines.append(f"    ref_fabrication = EXCLUDED.ref_fabrication,")
        sql_lines.append(f"    designation = EXCLUDED.designation,")
        sql_lines.append(f"    description = EXCLUDED.description,")
        sql_lines.append(f"    id_modele = EXCLUDED.id_modele,")
        sql_lines.append(f"    id_dimension = EXCLUDED.id_dimension,")
        sql_lines.append(f"    id_finition = EXCLUDED.id_finition,")
        sql_lines.append(f"    id_tissage = EXCLUDED.id_tissage,")
        sql_lines.append(f"    id_nombre_couleurs = EXCLUDED.id_nombre_couleurs,")
        sql_lines.append(f"    id_couleur = EXCLUDED.id_couleur,")
        sql_lines.append(f"    id_personnalisation = EXCLUDED.id_personnalisation,")
        sql_lines.append(f"    prix_revient = EXCLUDED.prix_revient,")
        sql_lines.append(f"    prix_vente = EXCLUDED.prix_vente,")
        sql_lines.append(f"    prix_unitaire_base = EXCLUDED.prix_vente,")
        sql_lines.append(f"    qte_minimal_stock = EXCLUDED.qte_minimal_stock,")
        sql_lines.append(f"    dans_catalogue_produit = EXCLUDED.dans_catalogue_produit,")
        sql_lines.append(f"    date_modification = CURRENT_TIMESTAMP;")
        sql_lines.append("")
    
    sql_lines.append("-- ============================================================================")
    sql_lines.append("-- VERIFICATION")
    sql_lines.append("-- ============================================================================")
    sql_lines.append("")
    sql_lines.append("DO $$")
    sql_lines.append("DECLARE")
    sql_lines.append("    v_count INTEGER;")
    sql_lines.append("BEGIN")
    sql_lines.append("    SELECT COUNT(*) INTO v_count FROM articles_catalogue;")
    sql_lines.append("    RAISE NOTICE 'Articles importes: %', v_count;")
    sql_lines.append("END $$;")
    sql_lines.append("")
    sql_lines.append("COMMIT;")
    sql_lines.append("")
    sql_lines.append("-- ============================================================================")
    sql_lines.append("-- FIN DU SCRIPT")
    sql_lines.append("-- ============================================================================")
    
    return '\n'.join(sql_lines)


if __name__ == "__main__":
    # Analyser les données
    result = analyser_articles()
    
    if result:
        # Générer automatiquement le script SQL
        print("=" * 80)
        print("Generation automatique du script SQL...")
        print("=" * 80)
        print()
        
        sql = generer_sql_articles(result)
        if sql:
            # Sauvegarder le script
            script_path = Path(__file__).parent.parent / "database" / "imports" / "03_articles_data.sql"
            with open(script_path, 'w', encoding='utf-8') as f:
                f.write(sql)
            
            print()
            print(f"[OK] Script SQL genere: {script_path}")
            print()
            print("[APERCU] Apercu du script (50 premieres lignes):")
            print("=" * 80)
            print('\n'.join(sql.split('\n')[:50]))
            print("...")
            print()
            print("[INFO] Vous pouvez maintenant:")
            print("   1. Examiner le script complet dans database/imports/03_articles_data.sql")
            print("   2. Tester l'import avec: cd backend && node scripts/executer-import.js database/imports/03_articles_data.sql")
            print()
