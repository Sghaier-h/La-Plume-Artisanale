#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour lire le fichier Excel "Commandes 2025-2026"
"""

import sys
import os

try:
    import pandas as pd
except ImportError:
    print("Installation de pandas...")
    os.system("pip install pandas openpyxl")
    import pandas as pd

def lire_fichier_excel(chemin_fichier):
    """Lit un fichier Excel et affiche ses informations"""
    try:
        # Lire le fichier Excel
        excel_file = pd.ExcelFile(chemin_fichier)
        
        print("=" * 80)
        print(f"Fichier: {os.path.basename(chemin_fichier)}")
        print("=" * 80)
        print(f"\nNombre de feuilles: {len(excel_file.sheet_names)}")
        print(f"\nNoms des feuilles:")
        for i, sheet in enumerate(excel_file.sheet_names, 1):
            print(f"  {i}. {sheet}")
        
        # Afficher les informations de chaque feuille
        for sheet_name in excel_file.sheet_names:
            print("\n" + "=" * 80)
            print(f"FEUILLE: {sheet_name}")
            print("=" * 80)
            
            df = pd.read_excel(excel_file, sheet_name=sheet_name)
            
            print(f"\nDimensions: {df.shape[0]} lignes x {df.shape[1]} colonnes")
            print(f"\nColonnes:")
            for i, col in enumerate(df.columns, 1):
                print(f"  {i}. {col}")
            
            print(f"\nPremières lignes (5 premières):")
            print(df.head().to_string())
            
            print(f"\nTypes de données:")
            print(df.dtypes)
            
            print(f"\nValeurs nulles par colonne:")
            print(df.isnull().sum())
        
        return excel_file
        
    except FileNotFoundError:
        print(f"[ERREUR] Le fichier '{chemin_fichier}' n'existe pas")
        return None
    except Exception as e:
        print(f"[ERREUR] Erreur lors de la lecture: {e}")
        return None

if __name__ == "__main__":
    # Chemins possibles
    chemins = [
        r"D:\OneDrive - FLYING TEX\PROJET\migration-excel-dataverse\Commandes 2025-2026.xlsx",
        r"D:\OneDrive - FLYING TEX\PROJET\developpement\Commandes 2025-2026.xlsx",
    ]
    
    fichier_trouve = None
    for chemin in chemins:
        if os.path.exists(chemin):
            fichier_trouve = chemin
            break
    
    if fichier_trouve:
        print(f"[OK] Fichier trouve: {fichier_trouve}\n")
        lire_fichier_excel(fichier_trouve)
    else:
        print("[ERREUR] Aucun fichier trouve. Chemins testes:")
        for chemin in chemins:
            print(f"  - {chemin}")
