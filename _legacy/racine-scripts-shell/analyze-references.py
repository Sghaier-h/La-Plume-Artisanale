#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour analyser les références commerciales et de production
"""

import pandas as pd
import os

def analyser_references():
    """Analyse les références commerciales et de production"""
    chemin_fichier = r"D:\OneDrive - FLYING TEX\PROJET\migration-excel-dataverse\Commandes 2025-2026.xlsx"
    
    if not os.path.exists(chemin_fichier):
        print(f"[ERREUR] Fichier non trouve: {chemin_fichier}")
        return
    
    # Lire la feuille Base Article
    df_articles = pd.read_excel(chemin_fichier, sheet_name='Base Article')
    
    print("=" * 80)
    print("ANALYSE DES REFERENCES COMMERCIALES ET DE PRODUCTION")
    print("=" * 80)
    
    # Statistiques générales
    print(f"\nNombre total d'articles: {len(df_articles)}")
    print(f"Articles avec Ref Commercial: {df_articles['Ref Commercial'].notna().sum()}")
    print(f"Articles avec Ref Fabrication: {df_articles['Ref Fabrication'].notna().sum()}")
    
    # Vérifier les différences entre Ref Commercial et Ref Fabrication
    df_articles['Refs_Identiques'] = df_articles['Ref Commercial'] == df_articles['Ref Fabrication']
    identiques = df_articles['Refs_Identiques'].sum()
    differentes = (~df_articles['Refs_Identiques']).sum()
    
    print(f"\nReferences identiques: {identiques}")
    print(f"References differentes: {differentes}")
    
    # Afficher des exemples de références différentes
    if differentes > 0:
        print("\n" + "=" * 80)
        print("EXEMPLES D'ARTICLES AVEC REFERENCES DIFFERENTES")
        print("=" * 80)
        df_diff = df_articles[~df_articles['Refs_Identiques']][
            ['Ref Commercial', 'Ref Fabrication', 'Produit', 'Modèle', 'Code Modèle']
        ].head(20)
        print(df_diff.to_string(index=False))
    
    # Analyser la structure des références
    print("\n" + "=" * 80)
    print("STRUCTURE DES REFERENCES COMMERCIALES")
    print("=" * 80)
    
    # Extraire les préfixes (premiers caractères)
    df_articles['Prefixe_Commercial'] = df_articles['Ref Commercial'].astype(str).str[:3]
    prefixes_com = df_articles['Prefixe_Commercial'].value_counts().head(20)
    print("\nTop 20 prefixes de references commerciales:")
    print(prefixes_com.to_string())
    
    # Analyser la longueur des références
    df_articles['Longueur_Commercial'] = df_articles['Ref Commercial'].astype(str).str.len()
    print(f"\nLongueur moyenne Ref Commercial: {df_articles['Longueur_Commercial'].mean():.1f} caracteres")
    print(f"Longueur min: {df_articles['Longueur_Commercial'].min()}")
    print(f"Longueur max: {df_articles['Longueur_Commercial'].max()}")
    
    print("\n" + "=" * 80)
    print("STRUCTURE DES REFERENCES DE PRODUCTION")
    print("=" * 80)
    
    df_articles['Prefixe_Fabrication'] = df_articles['Ref Fabrication'].astype(str).str[:3]
    prefixes_fab = df_articles['Prefixe_Fabrication'].value_counts().head(20)
    print("\nTop 20 prefixes de references de production:")
    print(prefixes_fab.to_string())
    
    df_articles['Longueur_Fabrication'] = df_articles['Ref Fabrication'].astype(str).str.len()
    print(f"\nLongueur moyenne Ref Fabrication: {df_articles['Longueur_Fabrication'].mean():.1f} caracteres")
    print(f"Longueur min: {df_articles['Longueur_Fabrication'].min()}")
    print(f"Longueur max: {df_articles['Longueur_Fabrication'].max()}")
    
    # Exemples détaillés
    print("\n" + "=" * 80)
    print("EXEMPLES D'ARTICLES AVEC LEURS REFERENCES")
    print("=" * 80)
    
    colonnes_afficher = [
        'Ref Commercial', 'Ref Fabrication', 'Produit', 'Modèle', 
        'Code Modèle', 'Dimensions', 'Type de Finition', 'Couleur Article'
    ]
    
    df_exemples = df_articles[colonnes_afficher].head(30)
    print(df_exemples.to_string(index=False))
    
    # Analyser les patterns dans les références
    print("\n" + "=" * 80)
    print("ANALYSE DES PATTERNS DANS LES REFERENCES")
    print("=" * 80)
    
    # Compter les références qui contiennent des tirets
    avec_tirets_com = df_articles['Ref Commercial'].astype(str).str.contains('-').sum()
    avec_tirets_fab = df_articles['Ref Fabrication'].astype(str).str.contains('-').sum()
    
    print(f"\nReferences commerciales avec tirets: {avec_tirets_com}")
    print(f"References de production avec tirets: {avec_tirets_fab}")
    
    # Analyser les références par modèle
    print("\n" + "=" * 80)
    print("REFERENCES PAR MODELE")
    print("=" * 80)
    
    refs_par_modele = df_articles.groupby('Modèle').agg({
        'Ref Commercial': 'count',
        'Ref Fabrication': 'count'
    }).sort_values('Ref Commercial', ascending=False).head(20)
    
    refs_par_modele.columns = ['Nb Ref Commercial', 'Nb Ref Fabrication']
    print(refs_par_modele.to_string())
    
    # Sauvegarder un échantillon dans un fichier CSV pour analyse
    output_file = r"D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\references_articles.csv"
    df_articles[['Ref Commercial', 'Ref Fabrication', 'Produit', 'Modèle', 'Code Modèle', 
                 'Dimensions', 'Type de Finition', 'Couleur Article', 'Description Article']].to_csv(
        output_file, index=False, encoding='utf-8-sig'
    )
    print(f"\n[OK] Echantillon sauvegarde dans: {output_file}")

if __name__ == "__main__":
    analyser_references()
