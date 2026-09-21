#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour analyser les données de commandes depuis Excel
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

def analyser_commandes(fichier_excel=None):
    """
    Analyse les données de commandes depuis un fichier Excel
    """
    print("=" * 80)
    print("ANALYSE DES COMMANDES")
    print("=" * 80)
    print()
    
    # Si aucun fichier n'est spécifié, chercher dans Excel fab
    if fichier_excel is None:
        fichiers_possibles = [
            EXCEL_FAB_DIR / "Commandes 2025-2026.xlsx",
            EXCEL_FAB_DIR / "Commandes 2024-2025.xlsx",
            EXCEL_FAB_DIR / "Commandes.xlsx",
        ]
        
        for fichier in fichiers_possibles:
            if fichier.exists():
                try:
                    # Tester si le fichier est accessible
                    test_file = open(fichier, 'rb')
                    test_file.close()
                    fichier_excel = fichier
                    print(f"[OK] Fichier trouve: {fichier_excel.name}")
                    break
                except PermissionError:
                    print(f"[ATTENTION] Fichier {fichier.name} est ouvert, essai du suivant...")
                    continue
    
    if fichier_excel is None or not Path(fichier_excel).exists():
        print("[ERREUR] Aucun fichier Excel trouve.")
        print("[INFO] Veuillez specifier le chemin du fichier Excel contenant les commandes")
        print("   ou placez-le dans le dossier 'Excel fab'")
        return None
    
    try:
        # Lire le fichier Excel
        print(f"\n[LECTURE] Lecture du fichier: {fichier_excel}")
        xls = pd.ExcelFile(fichier_excel)
        
        print(f"\n[FEUILLES] Feuilles disponibles: {', '.join(xls.sheet_names)}")
        print()
        
        # Lire la première feuille (ou chercher une feuille avec "Commande")
        feuille_commandes = None
        for sheet_name in xls.sheet_names:
            if 'commande' in sheet_name.lower():
                feuille_commandes = sheet_name
                break
        
        if feuille_commandes is None:
            feuille_commandes = xls.sheet_names[0]
        
        print(f"[OK] Feuille utilisee: '{feuille_commandes}'")
        
        # Lire les données
        df = pd.read_excel(xls, sheet_name=feuille_commandes)
        
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
            'etat': ['etat', 'statut', 'status'],
            'date_envoie': ['date d\'envoie', 'date envoie', 'date_envoie', 'date_envoi'],
            'num_commande': ['num commande', 'numero commande', 'num_commande', 'numero_commande', 'num comm', 'num commande client'],
            'num_client': ['num client', 'numero client', 'num_client', 'numero_client', 'id client', 'id_client'],
            'ref_client': ['ref client', 'ref_client', 'reference client', 'reference_client'],
            'ref_commercial': ['ref commercial', 'ref_commercial', 'ref commerciale', 'ref_commerciale'],
            'modele': ['modèle', 'modele', 'libelle'],
            'code_modele': ['code model', 'code_modele', 'code modele', 'code modèle'],
            'type_tissage': ['type de tissag', 'type tissage', 'type_tissage', 'tissage'],
            'code_dimension': ['code dimension', 'code_dimension', 'dimension code'],
            'type_finition': ['type de finitio', 'type finition', 'type_finition', 'finition'],
            'qte_commandee': ['qte commandée', 'qte commandee', 'qte commandé', 'qte commande', 'quantite commandee', 'quantite commandée', 'qte_commande', 'quantite'],
            'personnalisation': ['personnalisatio', 'personnalisation'],
            'type_personnalisation': ['type de personnalisatio', 'type personnalisation', 'type_personnalisation', 'type personnal'],
            'details_personnalisation': ['détails personnalisatio', 'details personnalisation', 'details_personnalisation', 'detail personnalisation'],
            'ordre_fabrication': ['ordre de fabricatio', 'ordre fabrication', 'ordre_fabrication', 'of']
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
        
        # Vérifier les valeurs uniques pour certaines colonnes
        if 'num_commande' in mapping_colonnes:
            col = mapping_colonnes['num_commande']
            num_commandes = df[col].dropna().unique()
            print(f"[NUM COMMANDES] Numéros de commandes trouves ({len(num_commandes)}):")
            for nc in sorted(num_commandes)[:10]:
                print(f"   - {nc}")
            if len(num_commandes) > 10:
                print(f"   ... et {len(num_commandes) - 10} autres")
            print()
        
        if 'num_client' in mapping_colonnes:
            col = mapping_colonnes['num_client']
            num_clients = df[col].dropna().unique()
            print(f"[NUM CLIENTS] Numéros de clients trouves ({len(num_clients)}):")
            for nc in sorted(num_clients)[:10]:
                print(f"   - {nc}")
            if len(num_clients) > 10:
                print(f"   ... et {len(num_clients) - 10} autres")
            print()
        
        # Vérifier les doublons : une ligne est un doublon si elle a la même combinaison de:
        # - num_commande + ref_commercial + personnalisation + type_personnalisation + type_finition + details_personnalisation
        # On peut avoir la même commande et ref commerciale mais avec des personnalisations ou finitions différentes
        # Note: Si type_personnalisation n'existe pas dans le fichier, on l'ajoutera après avec "Broderie" par défaut
        colonnes_unicite = []
        if 'num_commande' in mapping_colonnes:
            colonnes_unicite.append(mapping_colonnes['num_commande'])
        if 'ref_commercial' in mapping_colonnes:
            colonnes_unicite.append(mapping_colonnes['ref_commercial'])
        if 'personnalisation' in mapping_colonnes:
            colonnes_unicite.append(mapping_colonnes['personnalisation'])
        # type_personnalisation sera ajouté après traitement si la colonne n'existe pas
        if 'type_personnalisation' in mapping_colonnes:
            colonnes_unicite.append(mapping_colonnes['type_personnalisation'])
        if 'type_finition' in mapping_colonnes:
            colonnes_unicite.append(mapping_colonnes['type_finition'])
        if 'details_personnalisation' in mapping_colonnes:
            colonnes_unicite.append(mapping_colonnes['details_personnalisation'])
        
        if len(colonnes_unicite) >= 2:  # Au minimum num_commande + ref_commercial
            # Remplacer les valeurs NaN par des chaînes vides pour la comparaison
            df_clean = df[colonnes_unicite].fillna('')
            doublons = df[df_clean.duplicated(subset=colonnes_unicite, keep=False)]
            if len(doublons) > 0:
                colonnes_str = ' + '.join(['num_commande', 'ref_commercial', 'personnalisation', 'type_personnalisation', 'type_finition', 'details_personnalisation'])
                print(f"[ATTENTION] {len(doublons)} lignes en doublon (meme combinaison: {colonnes_str})")
                print(f"[ACTION] Suppression des doublons (conservation de la premiere occurrence)")
                df = df.drop_duplicates(subset=colonnes_unicite, keep='first')
                print(f"[OK] {len(df)} lignes restantes apres suppression des doublons")
                print()
            else:
                print("[OK] Aucun doublon trouve")
                print()
        else:
            print("[ATTENTION] Impossible de detecter les doublons (colonnes manquantes)")
            print()
        
        # Afficher un message si type_personnalisation n'est pas trouvé
        if 'type_personnalisation' not in mapping_colonnes:
            print("[INFO] Colonne 'Type de personnalisation' non trouvee - Utilisation de 'Broderie' par defaut pour les personnalisations")
            print()
        
        return {
            'dataframe': df,
            'mapping': mapping_colonnes,
            'feuille': feuille_commandes
        }
        
    except Exception as e:
        print(f"[ERREUR] Erreur lors de l'analyse: {e}")
        import traceback
        traceback.print_exc()
        return None


def generer_sql_commandes(analyse_result):
    """
    Génère le script SQL d'import des commandes
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
    colonnes_requises = ['num_commande', 'ref_commercial']
    colonnes_manquantes = [c for c in colonnes_requises if c not in mapping]
    
    if colonnes_manquantes:
        print(f"[ERREUR] Colonnes manquantes: {', '.join(colonnes_manquantes)}")
        return None
    
    # Préparer les données
    print("[TRAITEMENT] Traitement des donnees...")
    print()
    
    # Grouper par numéro de commande
    commandes_dict = {}
    lignes_commande = []
    
    for idx, row in df.iterrows():
        num_commande = str(row[mapping['num_commande']]).strip() if pd.notna(row[mapping['num_commande']]) else None
        ref_commercial = str(row[mapping['ref_commercial']]).strip() if pd.notna(row[mapping['ref_commercial']]) else None
        
        if not num_commande or not ref_commercial:
            continue
        
        # Extraire les autres champs
        etat = str(row[mapping.get('etat', '')]).strip() if mapping.get('etat') and pd.notna(row[mapping.get('etat', '')]) else 'en_attente'
        date_envoie = row[mapping.get('date_envoie', '')] if mapping.get('date_envoie') and pd.notna(row[mapping.get('date_envoie', '')]) else None
        num_client = str(row[mapping.get('num_client', '')]).strip() if mapping.get('num_client') and pd.notna(row[mapping.get('num_client', '')]) else None
        ref_client = str(row[mapping.get('ref_client', '')]).strip() if mapping.get('ref_client') and pd.notna(row[mapping.get('ref_client', '')]) else None
        modele = str(row[mapping.get('modele', '')]).strip() if mapping.get('modele') and pd.notna(row[mapping.get('modele', '')]) else None
        code_modele = str(row[mapping.get('code_modele', '')]).strip() if mapping.get('code_modele') and pd.notna(row[mapping.get('code_modele', '')]) else None
        type_tissage = str(row[mapping.get('type_tissage', '')]).strip() if mapping.get('type_tissage') and pd.notna(row[mapping.get('type_tissage', '')]) else None
        code_dimension = str(row[mapping.get('code_dimension', '')]).strip() if mapping.get('code_dimension') and pd.notna(row[mapping.get('code_dimension', '')]) else None
        type_finition = str(row[mapping.get('type_finition', '')]).strip() if mapping.get('type_finition') and pd.notna(row[mapping.get('type_finition', '')]) else None
        # Essayer plusieurs variantes pour la quantité
        qte_col = mapping.get('qte_commandee') or mapping.get('qte_commandé') or mapping.get('qte commandé')
        qte_commandee = row[qte_col] if qte_col and pd.notna(row[qte_col]) else None
        personnalisation = str(row[mapping.get('personnalisation', '')]).strip() if mapping.get('personnalisation') and pd.notna(row[mapping.get('personnalisation', '')]) else None
        # Si pas de colonne type_personnalisation et personnalisation = Oui, assigner "Broderie" par défaut
        if mapping.get('type_personnalisation'):
            type_personnalisation = str(row[mapping.get('type_personnalisation', '')]).strip() if pd.notna(row[mapping.get('type_personnalisation', '')]) else None
        else:
            # Si personnalisation = Oui et pas de colonne type, assigner "Broderie" par défaut
            if personnalisation and personnalisation.lower() in ['oui', 'yes', 'true', '1', 'o']:
                type_personnalisation = 'Broderie'
            else:
                type_personnalisation = None
        details_personnalisation = str(row[mapping.get('details_personnalisation', '')]).strip() if mapping.get('details_personnalisation') and pd.notna(row[mapping.get('details_personnalisation', '')]) else None
        ordre_fabrication = str(row[mapping.get('ordre_fabrication', '')]).strip() if mapping.get('ordre_fabrication') and pd.notna(row[mapping.get('ordre_fabrication', '')]) else None
        
        # Créer ou mettre à jour la commande
        if num_commande not in commandes_dict:
            # Convertir date_envoie en date si c'est une chaîne
            date_commande = None
            if date_envoie:
                try:
                    if isinstance(date_envoie, str):
                        # Essayer différents formats de date
                        from datetime import datetime
                        for fmt in ['%d/%m/%Y', '%Y-%m-%d', '%d-%m-%Y']:
                            try:
                                date_commande = datetime.strptime(date_envoie, fmt).date()
                                break
                            except:
                                continue
                    else:
                        date_commande = pd.to_datetime(date_envoie).date() if pd.notna(date_envoie) else None
                except:
                    date_commande = None
            
            commandes_dict[num_commande] = {
                'numero_commande': num_commande,
                'num_client': num_client,
                'ref_client': ref_client,
                'date_commande': date_commande or pd.Timestamp.now().date(),
                'date_envoie': date_envoie,
                'etat': etat,
                'lignes': []
            }
        
        # Ajouter la ligne de commande
        lignes_commande.append({
            'num_commande': num_commande,
            'ref_commercial': ref_commercial,
            'modele': modele,
            'code_modele': code_modele,
            'type_tissage': type_tissage,
            'code_dimension': code_dimension,
            'type_finition': type_finition,
            'qte_commandee': qte_commandee,
            'personnalisation': personnalisation,
            'type_personnalisation': type_personnalisation,
            'details_personnalisation': details_personnalisation,
            'ordre_fabrication': ordre_fabrication
        })
    
    print(f"[OK] {len(commandes_dict)} commandes uniques trouvees")
    print(f"[OK] {len(lignes_commande)} lignes de commande trouvees")
    print()
    
    # Générer le script SQL
    sql_lines = []
    sql_lines.append("-- ============================================================================")
    sql_lines.append("-- IMPORT DES COMMANDES - DONNEES REELLES")
    sql_lines.append("-- ============================================================================")
    sql_lines.append(f"-- Script genere automatiquement le {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}")
    sql_lines.append(f"-- Nombre de commandes: {len(commandes_dict)}")
    sql_lines.append(f"-- Nombre de lignes: {len(lignes_commande)}")
    sql_lines.append("-- ============================================================================")
    sql_lines.append("")
    sql_lines.append("BEGIN;")
    sql_lines.append("")
    sql_lines.append("-- ============================================================================")
    sql_lines.append("-- 0. CREATION DES CLIENTS MANQUANTS")
    sql_lines.append("-- ============================================================================")
    sql_lines.append("")
    
    # Collecter tous les codes clients uniques
    codes_clients = set()
    for num_commande, commande in commandes_dict.items():
        if commande.get('num_client'):
            codes_clients.add(commande['num_client'])
    
    # Créer les clients manquants
    for code_client in sorted(codes_clients):
        code_client_escaped = code_client.replace("'", "''")
        sql_lines.append(f"-- Créer le client {code_client} s'il n'existe pas")
        # Utiliser raison_sociale (colonne qui existe dans la table clients)
        sql_lines.append(f"INSERT INTO clients (code_client, raison_sociale, actif)")
        sql_lines.append(f"SELECT")
        sql_lines.append(f"    '{code_client_escaped}',")
        sql_lines.append(f"    'Client {code_client_escaped}',")
        sql_lines.append(f"    true")
        sql_lines.append(f"WHERE NOT EXISTS (SELECT 1 FROM clients WHERE code_client = '{code_client_escaped}');")
        sql_lines.append("")
    
    sql_lines.append("-- ============================================================================")
    sql_lines.append("-- 1. INSERTION DES COMMANDES")
    sql_lines.append("-- ============================================================================")
    sql_lines.append("")
    
    # Générer les INSERT pour les commandes
    for num_commande, commande in commandes_dict.items():
        date_commande_str = f"'{commande['date_commande']}'" if commande['date_commande'] else 'CURRENT_DATE'
        etat_str = commande['etat'].replace("'", "''")
        
        num_client_escaped = (commande['num_client'] or '').replace("'", "''")
        ref_client_escaped = (commande.get('ref_client') or '').replace("'", "''") if commande.get('ref_client') else 'NULL'
        num_commande_client_escaped = (commande.get('num_commande_client') or '').replace("'", "''") if commande.get('num_commande_client') else 'NULL'
        date_envoie_str = f"'{commande['date_envoie']}'" if commande.get('date_envoie') else 'NULL'
        
        sql_lines.append(f"-- Commande: {num_commande}")
        sql_lines.append(f"INSERT INTO commandes (")
        sql_lines.append(f"    numero_commande, id_client, ref_client, num_commande_client,")
        sql_lines.append(f"    date_commande, date_livraison_prevue, date_envoie, statut")
        sql_lines.append(f")")
        sql_lines.append(f"SELECT")
        sql_lines.append(f"    '{num_commande}',")
        sql_lines.append(f"    (SELECT id_client FROM clients WHERE code_client = '{num_client_escaped}' LIMIT 1),")
        sql_lines.append(f"    {'NULL' if ref_client_escaped == 'NULL' else f"'{ref_client_escaped}'"},")
        sql_lines.append(f"    {'NULL' if num_commande_client_escaped == 'NULL' else f"'{num_commande_client_escaped}'"},")
        sql_lines.append(f"    {date_commande_str},")
        sql_lines.append(f"    {date_commande_str},")
        sql_lines.append(f"    {date_envoie_str},")
        sql_lines.append(f"    '{etat_str}'")
        sql_lines.append(f"ON CONFLICT (numero_commande) DO UPDATE SET")
        sql_lines.append(f"    ref_client = EXCLUDED.ref_client,")
        sql_lines.append(f"    num_commande_client = EXCLUDED.num_commande_client,")
        sql_lines.append(f"    date_envoie = EXCLUDED.date_envoie,")
        sql_lines.append(f"    statut = EXCLUDED.statut,")
        sql_lines.append(f"    date_modification = CURRENT_TIMESTAMP;")
        sql_lines.append("")
    
    sql_lines.append("-- ============================================================================")
    sql_lines.append("-- 2. INSERTION DES LIGNES DE COMMANDE")
    sql_lines.append("-- ============================================================================")
    sql_lines.append("")
    
    # Générer les INSERT pour les lignes de commande
    for idx, ligne in enumerate(lignes_commande, 1):
        ref_commercial = ligne['ref_commercial'].replace("'", "''")
        qte = ligne['qte_commandee'] if ligne['qte_commandee'] is not None else 0
        
        ref_commercial_escaped = ref_commercial.replace("'", "''")
        qte = ligne['qte_commandee'] if ligne['qte_commandee'] is not None else 0
        personnalisation = ligne.get('personnalisation', '').lower() in ['oui', 'yes', 'true', '1'] if ligne.get('personnalisation') else False
        type_personnalisation = ligne.get('type_personnalisation', '').strip() if ligne.get('type_personnalisation') else None
        details_personnalisation = ligne.get('details_personnalisation', '').replace("'", "''") if ligne.get('details_personnalisation') else None
        type_finition = ligne.get('type_finition', '').replace("'", "''") if ligne.get('type_finition') else None
        dimensions = ligne.get('code_dimension', '').replace("'", "''") if ligne.get('code_dimension') else None
        
        # Mapper le type de personnalisation vers l'ID (Broderie, Sérigraphie, Autre)
        # Si personnalisation = true mais pas de type, utiliser "Broderie" par défaut
        type_perso_id = 'NULL'
        if personnalisation:
            if type_personnalisation:
                type_perso_lower = type_personnalisation.lower()
                if 'broderie' in type_perso_lower or 'bro' in type_perso_lower:
                    type_perso_id = "(SELECT id FROM parametres_types_personnalisation WHERE code = 'BRO' LIMIT 1)"
                elif 'sérigraphie' in type_perso_lower or 'serigraphie' in type_perso_lower or 'ser' in type_perso_lower:
                    type_perso_id = "(SELECT id FROM parametres_types_personnalisation WHERE code = 'SER' LIMIT 1)"
                elif 'autre' in type_perso_lower or 'aut' in type_perso_lower:
                    type_perso_id = "(SELECT id FROM parametres_types_personnalisation WHERE code = 'AUT' LIMIT 1)"
            else:
                # Par défaut, utiliser "Broderie" si personnalisation = true mais pas de type spécifié
                type_perso_id = "(SELECT id FROM parametres_types_personnalisation WHERE code = 'BRO' LIMIT 1)"
        
        sql_lines.append(f"-- Ligne {idx}: {ligne['num_commande']} - {ref_commercial}")
        sql_lines.append(f"INSERT INTO articles_commande (")
        sql_lines.append(f"    id_commande, numero_ligne, id_article, ref_commerciale,")
        sql_lines.append(f"    description_article, dimensions, type_finition,")
        sql_lines.append(f"    quantite_commandee, prix_unitaire, prix_total_ht,")
        sql_lines.append(f"    personnalisation, id_type_personnalisation, details_personnalisation, date_livraison_prevue")
        sql_lines.append(f")")
        sql_lines.append(f"SELECT")
        sql_lines.append(f"    cmd.id_commande,")
        sql_lines.append(f"    {idx},")
        sql_lines.append(f"    COALESCE(a.id_article, NULL),")
        sql_lines.append(f"    '{ref_commercial_escaped}',")
        sql_lines.append(f"    COALESCE(a.designation, ''),")
        sql_lines.append(f"    COALESCE('{dimensions}', ''),")
        sql_lines.append(f"    COALESCE('{type_finition}', ''),")
        sql_lines.append(f"    {qte},")
        sql_lines.append(f"    COALESCE(a.prix_unitaire_base, 0),")
        sql_lines.append(f"    COALESCE(a.prix_unitaire_base, 0) * {qte},")
        sql_lines.append(f"    {str(personnalisation).upper()},")
        sql_lines.append(f"    {type_perso_id},")
        sql_lines.append(f"    {'NULL' if not details_personnalisation else f"'{details_personnalisation}'"},")
        sql_lines.append(f"    cmd.date_livraison_prevue")
        sql_lines.append(f"FROM commandes cmd")
        sql_lines.append(f"LEFT JOIN articles_catalogue a ON a.code_article = '{ref_commercial_escaped}'")
        sql_lines.append(f"WHERE cmd.numero_commande = '{ligne['num_commande']}'")
        sql_lines.append(f"ON CONFLICT (id_commande, numero_ligne) DO UPDATE SET")
        sql_lines.append(f"    ref_commerciale = EXCLUDED.ref_commerciale,")
        sql_lines.append(f"    description_article = EXCLUDED.description_article,")
        sql_lines.append(f"    dimensions = EXCLUDED.dimensions,")
        sql_lines.append(f"    type_finition = EXCLUDED.type_finition,")
        sql_lines.append(f"    quantite_commandee = EXCLUDED.quantite_commandee,")
        sql_lines.append(f"    prix_unitaire = EXCLUDED.prix_unitaire,")
        sql_lines.append(f"    prix_total_ht = EXCLUDED.prix_total_ht,")
        sql_lines.append(f"    personnalisation = EXCLUDED.personnalisation,")
        sql_lines.append(f"    id_type_personnalisation = EXCLUDED.id_type_personnalisation,")
        sql_lines.append(f"    details_personnalisation = EXCLUDED.details_personnalisation;")
        sql_lines.append("")
    
    sql_lines.append("-- ============================================================================")
    sql_lines.append("-- VERIFICATION")
    sql_lines.append("-- ============================================================================")
    sql_lines.append("")
    sql_lines.append("DO $$")
    sql_lines.append("DECLARE")
    sql_lines.append("    v_count_cmd INTEGER;")
    sql_lines.append("    v_count_lignes INTEGER;")
    sql_lines.append("BEGIN")
    sql_lines.append("    SELECT COUNT(*) INTO v_count_cmd FROM commandes;")
    sql_lines.append("    SELECT COUNT(*) INTO v_count_lignes FROM articles_commande;")
    sql_lines.append("    RAISE NOTICE 'Commandes importees: %', v_count_cmd;")
    sql_lines.append("    RAISE NOTICE 'Lignes de commande importees: %', v_count_lignes;")
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
    result = analyser_commandes()
    
    if result:
        # Générer automatiquement le script SQL
        print("=" * 80)
        print("Generation automatique du script SQL...")
        print("=" * 80)
        print()
        
        sql = generer_sql_commandes(result)
        if sql:
            # Sauvegarder le script
            script_path = Path(__file__).parent.parent / "database" / "imports" / "04_commandes_data.sql"
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
            print("   1. Examiner le script complet dans database/imports/04_commandes_data.sql")
            print("   2. Tester l'import avec: cd backend && node scripts/executer-import.js database/imports/04_commandes_data.sql")
            print()
