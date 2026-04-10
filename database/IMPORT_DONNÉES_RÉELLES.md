# 📥 Import Données Réelles - Suivi

Ce document suit l'import progressif de vos données réelles.

## 📋 Structure

Les données seront importées par lots et organisées dans :
- `database/imports/` - Fichiers SQL par lot
- `database/imports/01_utilisateurs.sql`
- `database/imports/02_clients.sql`
- `database/imports/03_articles.sql`
- etc.

## 🔄 Processus

1. **Vous me donnez les données** (format Excel, CSV, ou texte)
2. **Je crée le script SQL** correspondant dans `database/imports/`
3. **Vous testez localement** avec le script
4. **On valide** ensemble
5. **À la fin**, je crée un script de déploiement unique pour le serveur

## ✅ Lots Importés

- [x] Lot 0 : **Attributs** ✅ COMPLET
  - [x] Types de Produits (15 types importés)
  - [x] Types de Tissages (5 types importés)
  - [x] Dimensions (24 dimensions importées)
  - [x] Types de Finitions (6 types importés)
  - [x] Personnalisation (2 options importées)
  - [x] Nombre de Couleurs (6 options importées)
  - [x] Couleurs (37 couleurs importées)
  - [x] Modèles (95 modèles de base importés)
- [x] Lot 0.5 : **Modèles avec Relations** ✅ COMPLET
  - [x] Structure mise à jour (colonnes id_type_produit, id_tissage, photo_url ajoutées)
  - [x] Mise à jour des modèles existants avec leurs relations Type Produit et Type Tissage
  - [x] Génération automatique des descriptions : "Type de Produit Modèle Nom du Modèle"
  - [x] Script: `database/imports/01_modeles_data.sql`
- [ ] Lot 1 : Utilisateurs
- [x] Lot 2 : **Structure Clients Enrichie** ✅ COMPLET
  - [x] Structure de base de données créée: `database/imports/08_structure_clients_enrichie.sql`
  - [x] Tables créées: `categories_clients`, `types_commerciaux`, `adresses_client`, `contacts_client`
  - [x] Colonnes ajoutées à `clients`: type_client, id_categorie, id_commercial, etc.
  - [x] Fonctions automatiques: mise à jour Client/Prospect, détermination devise par pays
  - [x] Backend API enrichi: contrôleurs pour adresses et contacts
  - [x] Routes API créées: `/api/clients/:id/adresses`, `/api/clients/:id/contacts`
  - [x] Migration automatique des données existantes
  - [ ] **À faire** : Import des données clients réelles (Excel → SQL)
  - [ ] **À faire** : Mise à jour du frontend (Clients.tsx, ClientDetails.tsx)
- [x] Lot 3 : **Articles** ✅ COMPLET
  - [x] Script d'analyse créé: `scripts/analyser_articles.py`
  - [x] Structure de la table mise à jour (colonnes ref_commerciale, ref_fabrication, description, dans_catalogue_produit, etc.)
  - [x] Import des articles avec toutes leurs relations
  - [x] Script généré: `database/imports/03_articles_data.sql` (1514 articles analysés)
  - [x] **Import exécuté avec succès : 1503 articles importés** ✅
- [x] Lot 4 : **Commandes** ✅ COMPLET
  - [x] Structure de la table mise à jour: `database/imports/04_structure_commandes.sql`
  - [x] Table `parametres_types_personnalisation` créée (Broderie, Sérigraphie, Autre)
  - [x] Colonnes ajoutées: `id_type_personnalisation`, `fichier_personnalisation` dans `articles_commande`
  - [x] Script d'analyse créé: `scripts/analyser_commandes.py`
  - [x] Frontend mis à jour avec tous les champs requis (Type de personnalisation, Fichier joint)
  - [x] Page de détails créée: `CommandeDetails.tsx`
  - [x] Backend: Endpoint `/api/parametres-catalogue/types-personnalisation` créé
  - [x] Import des commandes avec toutes leurs relations
  - [x] Script généré: `database/imports/04_commandes_data.sql` (15 commandes, 1326 lignes analysées)
  - [x] **Import exécuté avec succès : 15 commandes, 1326 lignes importées** ✅
  - [x] **Support des articles hors catalogue** : `id_article` peut être NULL pour les articles personnalisés
  - [x] **Logique de détection des doublons améliorée** : Les doublons sont détectés sur la combinaison `num_commande + ref_commercial + personnalisation + type_personnalisation + type_finition + details_personnalisation` (464 doublons supprimés sur 1782 lignes initiales)
  - [x] **Type de personnalisation automatique** : "Broderie" assigné par défaut pour toutes les personnalisations (car colonne absente dans Excel)
  - [x] **Création automatique des clients manquants** : 14 clients créés automatiquement
- [ ] Lot 5 : OF
- [ ] Lot 6 : Stock
- [ ] Lot 7 : Autres données

## 📝 Notes

- Chaque script est idempotent (peut être exécuté plusieurs fois)
- Les scripts utilisent `ON CONFLICT DO UPDATE` pour éviter les doublons
- Les relations entre tables sont gérées automatiquement

---

**Prêt à recevoir vos données !** 🚀
