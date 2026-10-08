#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour créer/mettre à jour les utilisateurs avec leurs groupes et photos/emojis
"""

import os
import sys
from pathlib import Path

# Configurer l'encodage pour Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Données des utilisateurs depuis Timoto
utilisateurs_data = [
    {'prenom': 'AY Amel', 'nom': 'yaakoubi', 'numero_employe': '', 'groupe': 'FAB', 'emoji': '👩'},
    {'prenom': 'CM CHAFIA', 'nom': 'MAKHZOUG', 'numero_employe': '', 'groupe': 'FAB', 'emoji': '👩'},
    {'prenom': 'EN EL JMEL', 'nom': 'NAIMA', 'numero_employe': '', 'groupe': 'FAB', 'emoji': '👩'},
    {'prenom': 'HE HABIB', 'nom': 'ECHAARI', 'numero_employe': '011', 'groupe': 'FAB', 'emoji': '👨'},
    {'prenom': 'HS HAMDI', 'nom': 'SGHAIER', 'numero_employe': '', 'groupe': 'COM', 'emoji': '👨‍💼', 'admin': True, 'email': 'responsable@laplume-artisanale.tn', 'password': 'Allbyfouta#007'},
    {'prenom': 'HD Hanen', 'nom': 'Douiri', 'numero_employe': '', 'groupe': 'COM', 'emoji': '👩‍💼'},
    {'prenom': 'IL Ikram', 'nom': 'latrache', 'numero_employe': '', 'groupe': 'FAB', 'emoji': '👩'},
    {'prenom': 'KA KARIM', 'nom': 'ABED', 'numero_employe': '002', 'groupe': 'FAB', 'emoji': '👨'},
    {'prenom': 'MA MAATALAH', 'nom': 'AHMED', 'numero_employe': '', 'groupe': 'FAB', 'emoji': '👨'},
    {'prenom': 'MM MAHBOUBA', 'nom': 'MSEKNI', 'numero_employe': '004', 'groupe': 'FAB', 'emoji': '👩'},
    {'prenom': 'MH MAHBOUBA', 'nom': 'HSEN', 'numero_employe': '', 'groupe': 'FAB', 'emoji': '👩'},
    {'prenom': 'MN Manel', 'nom': 'Ngur', 'numero_employe': '', 'groupe': 'FAB', 'emoji': '👩'},
    {'prenom': 'MA MOHAMED', 'nom': 'AOUINET', 'numero_employe': '007', 'groupe': 'FAB', 'emoji': '👨'},
    {'prenom': 'NC Nafaa', 'nom': 'chhaibi', 'numero_employe': '', 'groupe': 'FAB', 'emoji': '👨'},
    {'prenom': 'NT NAWRES', 'nom': 'TOUIL', 'numero_employe': '003', 'groupe': 'FAB', 'emoji': '👩'},
    {'prenom': 'NL NIDHAL', 'nom': 'LACHHEB', 'numero_employe': '', 'groupe': 'FAB', 'emoji': '👨'},
    {'prenom': 'SC SAID', 'nom': 'CHARFEDDINE', 'numero_employe': '', 'groupe': 'ATL', 'emoji': '👨'},
    {'prenom': 'SZ SAIDA', 'nom': 'ZENTENI', 'numero_employe': '', 'groupe': 'FAB', 'emoji': '👩'},
    {'prenom': 'SN SANDID', 'nom': 'NAZIHA', 'numero_employe': '', 'groupe': 'FAB', 'emoji': '👩'},
]

def generer_email(prenom, nom):
    """Génère un email à partir du prénom et nom"""
    prenom_clean = prenom.split()[-1].lower().replace(' ', '')
    nom_clean = nom.lower().replace(' ', '')
    return f"{prenom_clean}.{nom_clean}@laplume-artisanale.tn"

def generer_nom_utilisateur(prenom, nom):
    """Génère un nom d'utilisateur"""
    return f"{prenom} {nom}".strip()

def generer_sql():
    """Génère le script SQL pour créer/mettre à jour les utilisateurs"""
    
    sql_lines = []
    sql_lines.append("-- ============================================================================")
    sql_lines.append("-- CREATION/MISE A JOUR DES UTILISATEURS AVEC GROUPES")
    sql_lines.append("-- ============================================================================")
    sql_lines.append("-- Script généré automatiquement")
    sql_lines.append("-- ============================================================================")
    sql_lines.append("")
    sql_lines.append("BEGIN;")
    sql_lines.append("")
    
    for user in utilisateurs_data:
        prenom = user['prenom']
        nom = user['nom']
        numero_employe = user.get('numero_employe', '') or 'NULL'
        groupe_code = user['groupe']
        emoji = user.get('emoji', '👤')
        is_admin = user.get('admin', False)
        email = user.get('email') or generer_email(prenom, nom)
        password = user.get('password', '')
        nom_utilisateur = generer_nom_utilisateur(prenom, nom)
        
        # Échapper les apostrophes
        prenom_escaped = prenom.replace("'", "''")
        nom_escaped = nom.replace("'", "''")
        email_escaped = email.replace("'", "''")
        nom_utilisateur_escaped = nom_utilisateur.replace("'", "''")
        
        # Hash bcrypt pour "TempPass123!" (mot de passe temporaire par défaut)
        # Les utilisateurs devront changer ce mot de passe lors de leur première connexion
        temp_password_hash = "$2b$10$HqZARIM2fODYUydfGdS66.qtyPc4LMmncM0ekFvtwmVGCxW4UCFJa"
        
        # Si c'est l'admin avec un mot de passe spécifique, on utilisera un placeholder
        # qui sera mis à jour par le script update-admin-password.js
        if is_admin and password:
            temp_password_hash = "$2b$10$placeholder_hash_will_be_updated_by_backend"
        
        sql_lines.append(f"-- Utilisateur: {prenom} {nom}")
        sql_lines.append(f"INSERT INTO utilisateurs (")
        sql_lines.append(f"    nom_utilisateur, email, prenom, nom, numero_employe, photo_emoji, id_groupe, actif, mot_de_passe_hash")
        sql_lines.append(f")")
        sql_lines.append(f"SELECT")
        sql_lines.append(f"    '{nom_utilisateur_escaped}',")
        sql_lines.append(f"    '{email_escaped}',")
        sql_lines.append(f"    '{prenom_escaped}',")
        sql_lines.append(f"    '{nom_escaped}',")
        sql_lines.append(f"    {'NULL' if numero_employe == 'NULL' or not numero_employe else f"'{numero_employe}'"},")
        sql_lines.append(f"    '{emoji}',")
        sql_lines.append(f"    (SELECT id_groupe FROM groupes WHERE code_groupe = '{groupe_code}' LIMIT 1),")
        sql_lines.append(f"    true,")
        sql_lines.append(f"    '{temp_password_hash}'")
        sql_lines.append(f"ON CONFLICT (email) DO UPDATE SET")
        sql_lines.append(f"    nom_utilisateur = EXCLUDED.nom_utilisateur,")
        sql_lines.append(f"    prenom = EXCLUDED.prenom,")
        sql_lines.append(f"    nom = EXCLUDED.nom,")
        sql_lines.append(f"    numero_employe = EXCLUDED.numero_employe,")
        sql_lines.append(f"    photo_emoji = EXCLUDED.photo_emoji,")
        sql_lines.append(f"    id_groupe = EXCLUDED.id_groupe,")
        sql_lines.append(f"    actif = EXCLUDED.actif,")
        sql_lines.append(f"    mot_de_passe_hash = COALESCE(EXCLUDED.mot_de_passe_hash, utilisateurs.mot_de_passe_hash),")
        sql_lines.append(f"    date_modification = CURRENT_TIMESTAMP;")
        sql_lines.append("")
        
        # Si c'est l'admin, mettre à jour le mot de passe (sera hashé par le backend)
        if is_admin and password:
            sql_lines.append(f"-- Mettre à jour le mot de passe pour l'admin (sera hashé par le backend)")
            sql_lines.append(f"-- Note: Le mot de passe doit être mis à jour via l'API ou le backend")
            sql_lines.append("")
    
    # Attribuer le rôle ADMIN à Hamdi Sghaier
    sql_lines.append("-- Attribuer le rôle ADMIN à Hamdi Sghaier")
    sql_lines.append("DO $$")
    sql_lines.append("DECLARE")
    sql_lines.append("    v_user_id INTEGER;")
    sql_lines.append("    v_role_id INTEGER;")
    sql_lines.append("BEGIN")
    sql_lines.append("    SELECT id_utilisateur INTO v_user_id")
    sql_lines.append("    FROM utilisateurs")
    sql_lines.append("    WHERE email = 'responsable@laplume-artisanale.tn';")
    sql_lines.append("    ")
    sql_lines.append("    SELECT id_role INTO v_role_id")
    sql_lines.append("    FROM roles")
    sql_lines.append("    WHERE code_role = 'ADMIN' OR nom_role ILIKE '%admin%'")
    sql_lines.append("    LIMIT 1;")
    sql_lines.append("    ")
    sql_lines.append("    IF v_user_id IS NOT NULL AND v_role_id IS NOT NULL THEN")
    sql_lines.append("        INSERT INTO utilisateurs_roles (id_utilisateur, id_role)")
    sql_lines.append("        VALUES (v_user_id, v_role_id)")
    sql_lines.append("        ON CONFLICT (id_utilisateur, id_role) DO NOTHING;")
    sql_lines.append("        RAISE NOTICE 'Role ADMIN attribue a Hamdi Sghaier';")
    sql_lines.append("    END IF;")
    sql_lines.append("END $$;")
    sql_lines.append("")
    
    sql_lines.append("-- ============================================================================")
    sql_lines.append("-- VERIFICATION")
    sql_lines.append("-- ============================================================================")
    sql_lines.append("")
    sql_lines.append("DO $$")
    sql_lines.append("DECLARE")
    sql_lines.append("    v_count INTEGER;")
    sql_lines.append("BEGIN")
    sql_lines.append("    SELECT COUNT(*) INTO v_count FROM utilisateurs WHERE actif = true;")
    sql_lines.append("    RAISE NOTICE 'Utilisateurs actifs: %', v_count;")
    sql_lines.append("END $$;")
    sql_lines.append("")
    sql_lines.append("COMMIT;")
    sql_lines.append("")
    
    return '\n'.join(sql_lines)

if __name__ == "__main__":
    print("=" * 80)
    print("GENERATION DU SCRIPT SQL POUR LES UTILISATEURS")
    print("=" * 80)
    print()
    
    sql = generer_sql()
    
    # Sauvegarder le script
    script_path = Path(__file__).parent.parent / "database" / "imports" / "05_utilisateurs_data.sql"
    with open(script_path, 'w', encoding='utf-8') as f:
        f.write(sql)
    
    print(f"[OK] Script SQL genere: {script_path}")
    print()
    print(f"[INFO] Nombre d'utilisateurs: {len(utilisateurs_data)}")
    print(f"[INFO] Groupes: Fabrication, Atelier, Commercial")
    print(f"[INFO] Admin: Hamdi Sghaier (responsable@laplume-artisanale.tn)")
    print()
    print("[APERCU] Apercu du script (30 premieres lignes):")
    print("=" * 80)
    print('\n'.join(sql.split('\n')[:30]))
    print("...")
    print()
