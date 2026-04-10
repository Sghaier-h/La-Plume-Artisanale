#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour analyser les données de modèles depuis Excel
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

def analyser_modeles(fichier_excel=None):
    """
    Analyse les données de modèles depuis un fichier Excel
    """
    print("=" * 80)
    print("ANALYSE DES MODELES")
    print("=" * 80)
    print()
    
    # Si aucun fichier n'est spécifié, chercher dans Excel fab
    if fichier_excel is None:
        fichiers_possibles = [
            EXCEL_FAB_DIR / "Paramétrages.xlsx",
            EXCEL_FAB_DIR / "Attribue.xlsx",
            EXCEL_FAB_DIR / "Produit.xlsx",
        ]
        
        for fichier in fichiers_possibles:
            if fichier.exists():
                fichier_excel = fichier
                print(f"[OK] Fichier trouve: {fichier_excel.name}")
                break
    
    if fichier_excel is None or not Path(fichier_excel).exists():
        print("[ERREUR] Aucun fichier Excel trouve.")
        print("[INFO] Veuillez specifier le chemin du fichier Excel contenant les modeles")
        print("   ou placez-le dans le dossier 'Excel fab'")
        return None
    
    try:
        # Lire le fichier Excel
        print(f"\n[LECTURE] Lecture du fichier: {fichier_excel}")
        xls = pd.ExcelFile(fichier_excel)
        
        print(f"\n[FEUILLES] Feuilles disponibles: {', '.join(xls.sheet_names)}")
        print()
        
        # Chercher la feuille avec les modèles
        feuille_modeles = None
        for sheet_name in xls.sheet_names:
            df = pd.read_excel(xls, sheet_name=sheet_name)
            
            # Vérifier si cette feuille contient des colonnes de modèles
            colonnes = [col.lower() for col in df.columns]
            if any(keyword in ' '.join(colonnes) for keyword in ['modèle', 'modele', 'code', 'type produit', 'tissage']):
                print(f"[OK] Feuille trouvee: '{sheet_name}'")
                print(f"   Colonnes: {', '.join(df.columns.tolist())}")
                print()
                feuille_modeles = sheet_name
                break
        
        if feuille_modeles is None:
            print("[ATTENTION] Aucune feuille avec des donnees de modeles trouvee.")
            print("   Affichage de toutes les feuilles pour inspection:")
            print()
            for sheet_name in xls.sheet_names:
                df = pd.read_excel(xls, sheet_name=sheet_name)
                print(f"[FEUILLE] Feuille: '{sheet_name}'")
                print(f"   Colonnes: {', '.join(df.columns.tolist()[:10])}")
                if len(df.columns) > 10:
                    print(f"   ... et {len(df.columns) - 10} autres colonnes")
                print(f"   Lignes: {len(df)}")
                print()
            return None
        
        # Lire les données de modèles
        df = pd.read_excel(xls, sheet_name=feuille_modeles)
        
        print("=" * 80)
        print("DONNEES TROUVEES")
        print("=" * 80)
        print()
        print(f"Nombre de lignes: {len(df)}")
        print(f"Colonnes: {', '.join(df.columns.tolist())}")
        print()
        
        # Afficher un aperçu
        print("=" * 80)
        print("APERCU DES DONNEES (10 premieres lignes)")
        print("=" * 80)
        print()
        print(df.head(10).to_string())
        print()
        
        # Analyser les colonnes
        print("=" * 80)
        print("ANALYSE DES COLONNES")
        print("=" * 80)
        print()
        
        colonnes_attendues = {
            'code_modele': ['code', 'code modèle', 'code_modele', 'code modele'],
            'libelle': ['modèle', 'modele', 'libelle', 'libellé', 'nom'],
            'description': ['description', 'desc'],
            'type_produit': ['type de produit', 'type produit', 'type_produit', 'produit'],
            'type_tissage': ['type de tissage', 'type tissage', 'type_tissage', 'tissage'],
            'code_type_tissage': ['code type de tissage', 'code type tissage', 'code_type_tissage', 'code tissage']
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
        
        print()
        
        # Vérifier les valeurs uniques pour type_produit et type_tissage
        if 'type_produit' in mapping_colonnes:
            col = mapping_colonnes['type_produit']
            types_produits = df[col].dropna().unique()
            print(f"[TYPES PRODUITS] Types de Produits trouves ({len(types_produits)}):")
            for tp in sorted(types_produits):
                print(f"   - {tp}")
            print()
        
        if 'type_tissage' in mapping_colonnes:
            col = mapping_colonnes['type_tissage']
            types_tissages = df[col].dropna().unique()
            print(f"[TYPES TISSAGES] Types de Tissages trouves ({len(types_tissages)}):")
            for tt in sorted(types_tissages):
                print(f"   - {tt}")
            print()
        
        # Vérifier les doublons de code_modele
        if 'code_modele' in mapping_colonnes:
            col = mapping_colonnes['code_modele']
            doublons = df[df.duplicated(subset=[col], keep=False)]
            if len(doublons) > 0:
                print(f"[ATTENTION] {len(doublons)} codes modeles en doublon trouves:")
                print(doublons[[col, mapping_colonnes.get('libelle', '')]].to_string())
                print()
            else:
                print("[OK] Aucun doublon de code modele trouve")
                print()
        
        return {
            'dataframe': df,
            'mapping': mapping_colonnes,
            'feuille': feuille_modeles
        }
        
    except Exception as e:
        print(f"[ERREUR] Erreur lors de l'analyse: {e}")
        import traceback
        traceback.print_exc()
        return None


def generer_sql_modeles(analyse_result):
    """
    Génère le script SQL d'import des modèles
    - Génère automatiquement la description : "Type Produit Modèle Nom Modèle"
    - Enlève les doublons basés sur (code_modele, type_produit, type_tissage)
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
    colonnes_requises = ['code_modele', 'libelle']
    colonnes_manquantes = [c for c in colonnes_requises if c not in mapping]
    
    if colonnes_manquantes:
        print(f"[ERREUR] Colonnes manquantes: {', '.join(colonnes_manquantes)}")
        return None
    
    # Préparer les données et enlever les doublons
    print("[TRAITEMENT] Traitement des donnees et suppression des doublons...")
    print()
    
    modeles_dict = {}  # Clé: (code_modele, type_produit_code, type_tissage_code)
    
    for idx, row in df.iterrows():
        code_modele = str(row[mapping['code_modele']]).strip() if pd.notna(row[mapping['code_modele']]) else None
        libelle = str(row[mapping['libelle']]).strip() if pd.notna(row[mapping['libelle']]) else None
        
        if not code_modele or not libelle:
            continue
        
        type_produit = str(row[mapping.get('type_produit', '')]).strip() if mapping.get('type_produit') and pd.notna(row[mapping.get('type_produit', '')]) else None
        type_tissage = str(row[mapping.get('type_tissage', '')]).strip() if mapping.get('type_tissage') and pd.notna(row[mapping.get('type_tissage', '')]) else None
        
        # Chercher le code correspondant pour type_produit et type_tissage
        type_produit_code = None
        type_tissage_code = None
        
        # D'abord, vérifier s'il y a une colonne avec le code de type de tissage
        if 'code_type_tissage' in mapping:
            col_code_tissage = mapping['code_type_tissage']
            if pd.notna(row[col_code_tissage]):
                type_tissage_code = str(row[col_code_tissage]).strip()
        
        # Si pas de code direct, mapper depuis le libellé
        if not type_tissage_code and type_tissage:
            # Mapping des types de tissages vers leurs codes
            # Exemples: "Tissage Plat" -> "PL", "Tissage Jacquard" -> "JA", etc.
            type_tissage_lower = type_tissage.lower()
            if 'plat' in type_tissage_lower:
                type_tissage_code = 'PL'
            elif 'jacquard' in type_tissage_lower:
                type_tissage_code = 'JA'
            elif 'éponge' in type_tissage_lower or 'eponge' in type_tissage_lower:
                type_tissage_code = 'EP'
            elif 'nid' in type_tissage_lower or 'abeille' in type_tissage_lower:
                type_tissage_code = 'ND'
            elif 'mixte' in type_tissage_lower:
                type_tissage_code = 'MIX'
        
        # Pour le type de produit, on cherchera le code dans la base via le libellé
        # On utilisera le libellé tel quel dans le SQL et la jointure trouvera le code
        if type_produit:
            # Mapping des types de produits vers leurs codes (basé sur les codes dans 00_attributs.sql)
            type_produit_lower = type_produit.lower()
            if 'coussin sac' in type_produit_lower:
                type_produit_code = 'CS'
            elif 'echarpe' in type_produit_lower:
                type_produit_code = 'ECH'
            elif 'fouta' in type_produit_lower and 'enfant' in type_produit_lower:
                type_produit_code = 'FE'
            elif 'fouta' in type_produit_lower and 'éponge' in type_produit_lower or 'eponge' in type_produit_lower:
                type_produit_code = 'FEP'
            elif 'fouta' in type_produit_lower and 'personnalis' in type_produit_lower:
                type_produit_code = 'FP'
            elif 'fouta' in type_produit_lower:
                type_produit_code = 'FOU'
            elif 'housse' in type_produit_lower and 'coussin' in type_produit_lower:
                type_produit_code = 'HC'
            elif 'jeté' in type_produit_lower or 'jete' in type_produit_lower:
                type_produit_code = 'JET'
            elif 'pack' in type_produit_lower and 'torchon' in type_produit_lower:
                type_produit_code = 'PT'
            elif 'pochette' in type_produit_lower:
                type_produit_code = 'POC'
            elif 'poncho' in type_produit_lower and 'enfant' in type_produit_lower:
                type_produit_code = 'PONE'
            elif 'poncho' in type_produit_lower:
                type_produit_code = 'PON'
            elif 'sac fouta' in type_produit_lower:
                type_produit_code = 'SF'
            elif 'serviette' in type_produit_lower:
                type_produit_code = 'SER'
            elif 'tote bag' in type_produit_lower or 'tote' in type_produit_lower:
                type_produit_code = 'TB'
            elif 'tunique' in type_produit_lower:
                type_produit_code = 'TUNIQUE'  # À vérifier si ce code existe
            elif 'sac de plage' in type_produit_lower:
                type_produit_code = 'SACPLAGE'  # À vérifier si ce code existe
        
        # Clé unique pour identifier les doublons
        # IMPORTANT: Le code_modele est UNIQUE dans la table parametres_modeles
        # Mais le libelle (nom du modèle) peut avoir des doublons
        # Donc on utilise seulement le code_modele comme clé
        # Si le même code apparaît plusieurs fois dans les données source, on garde la première occurrence
        cle = code_modele
        
        # Si ce code_modele n'existe pas encore, l'ajouter
        if cle not in modeles_dict:
            # Générer la description : "Type Produit Modèle Nom Modèle"
            if type_produit:
                description = f"{type_produit} Modèle {libelle}"
            else:
                description = f"Modèle {libelle}"
            
            modeles_dict[cle] = {
                'code_modele': code_modele,
                'libelle': libelle,
                'description': description,
                'type_produit': type_produit,
                'type_produit_code': type_produit_code,
                'type_tissage_code': type_tissage_code
            }
        else:
            # Si le code existe déjà, on affiche un avertissement
            # Le code_modele est unique, donc on garde la première occurrence
            existing = modeles_dict[cle]
            if existing['libelle'] != libelle or existing['type_produit'] != type_produit:
                print(f"[ATTENTION] Code modele '{code_modele}' deja present avec des valeurs differentes:")
                print(f"   Existant: {existing['libelle']} / {existing['type_produit']}")
                print(f"   Nouveau: {libelle} / {type_produit}")
                print(f"   -> On garde la premiere occurrence")
    
    # Compter les codes uniques dans les données source
    codes_uniques_source = df[mapping['code_modele']].dropna().nunique()
    
    print(f"[OK] {len(modeles_dict)} modeles uniques trouves (sur {len(df)} lignes initiales)")
    print(f"   {codes_uniques_source} codes modeles uniques dans les donnees source")
    if len(df) > codes_uniques_source:
        print(f"   {len(df) - codes_uniques_source} lignes avec codes dupliques supprimees (code_modele est unique)")
    print()
    
    # Générer les INSERT
    inserts = []
    for cle, modele in sorted(modeles_dict.items()):
        code_modele = modele['code_modele']
        libelle = modele['libelle']
        description = modele['description']
        type_produit = modele['type_produit']
        type_produit_code = modele['type_produit_code']
        type_tissage_code = modele['type_tissage_code']
        
        # Échapper les apostrophes dans les chaînes
        description = description.replace("'", "''")
        libelle = libelle.replace("'", "''")
        if type_produit:
            type_produit = type_produit.replace("'", "''")
        
        # Construire la ligne INSERT
        # Format: (code_modele, libelle, description, code_type_produit, libelle_type_produit, code_tissage, actif)
        ligne = f"    ('{code_modele}', '{libelle}', '{description}'"
        
        # Code type produit (ou NULL)
        if type_produit_code:
            ligne += f", '{type_produit_code}'"
        else:
            ligne += ", NULL"
        
        # Libellé type produit (pour jointure alternative si code non trouvé)
        if type_produit:
            ligne += f", '{type_produit}'"
        else:
            ligne += ", NULL"
        
        # Code type tissage (ou NULL)
        if type_tissage_code:
            ligne += f", '{type_tissage_code}'"
        else:
            ligne += ", NULL"
        
        ligne += ", true)"
        
        inserts.append(ligne)
    
    # Générer le script SQL complet
    sql = f"""-- ============================================================================
-- IMPORT DES MODÈLES - DONNÉES RÉELLES
-- ============================================================================
-- Script généré automatiquement le {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}
-- Nombre de modèles: {len(inserts)}
-- ============================================================================

BEGIN;

-- Mise à jour de la structure (déjà fait dans 01_modeles.sql)
-- Les colonnes id_type_produit et id_tissage doivent exister

-- Insertion des modèles avec relations
INSERT INTO parametres_modeles (code_modele, libelle, description, id_type_produit, id_tissage, actif)
SELECT 
    m.code_modele,
    m.libelle,
    m.description,
    COALESCE(tp_code.id, tp_libelle.id) as id_type_produit,
    t.id as id_tissage,
    m.actif
FROM (VALUES
{',\n'.join(inserts)}
) AS m(code_modele, libelle, description, code_type_produit, libelle_type_produit, code_tissage, actif)
LEFT JOIN parametres_types_produits tp_code ON tp_code.code = m.code_type_produit
LEFT JOIN parametres_types_produits tp_libelle ON tp_libelle.libelle = m.libelle_type_produit AND m.code_type_produit IS NULL
LEFT JOIN parametres_tissages t ON t.code = m.code_tissage
ON CONFLICT (code_modele) DO UPDATE SET
    libelle = EXCLUDED.libelle,
    description = EXCLUDED.description,
    id_type_produit = EXCLUDED.id_type_produit,
    id_tissage = EXCLUDED.id_tissage,
    actif = EXCLUDED.actif;

-- Vérification
DO $$
DECLARE
    v_count INTEGER;
    v_avec_type_produit INTEGER;
    v_avec_tissage INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM parametres_modeles;
    SELECT COUNT(*) INTO v_avec_type_produit FROM parametres_modeles WHERE id_type_produit IS NOT NULL;
    SELECT COUNT(*) INTO v_avec_tissage FROM parametres_modeles WHERE id_tissage IS NOT NULL;
    RAISE NOTICE '✅ Modèles importés: %', v_count;
    RAISE NOTICE '✅ Modèles avec type produit: %', v_avec_type_produit;
    RAISE NOTICE '✅ Modèles avec type tissage: %', v_avec_tissage;
END $$;

COMMIT;
"""
    
    return sql


if __name__ == "__main__":
    # Analyser les données
    result = analyser_modeles()
    
    if result:
        # Demander confirmation avant de générer le SQL
        print("=" * 80)
        print("Voulez-vous generer le script SQL maintenant ?")
        print("=" * 80)
        print()
        reponse = input("Appuyez sur Entree pour generer le script SQL, ou 'q' pour quitter: ").strip().lower()
        
        if reponse != 'q':
            sql = generer_sql_modeles(result)
            if sql:
                # Sauvegarder le script
                script_path = Path(__file__).parent.parent / "database" / "imports" / "01_modeles_data.sql"
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
                print("   1. Examiner le script complet dans database/imports/01_modeles_data.sql")
                print("   2. Tester l'import avec: cd backend && node scripts/executer-import.js database/imports/01_modeles_data.sql")
                print()
