# 📋 Guide - Structure Enrichie pour les Clients

## 🎯 Vue d'ensemble

La structure des clients a été considérablement enrichie pour répondre aux besoins suivants :

1. **Client/Prospect** : Distinction automatique basée sur l'existence de commandes
2. **Adresses multiples** : Facturation, livraison (plusieurs possibles), possibilité de livrer à un autre client
3. **Contacts multiples** : Plusieurs contacts par client avec fonction, email, téléphone
4. **Catégories** : Professionnel/Particulier, Local/Export
5. **Attribution commercial** : Pour analyses (Commercial, E-commerce, Partenaire, Autre)
6. **Devise automatique** : Selon le pays (TND pour Tunisie, EUR pour Europe, USD pour le reste)
7. **Désactivation** : Avec raison de désactivation
8. **Fiche client complète** : Onglets pour commandes, bons de livraison, factures, etc.

## 📊 Structure de la Base de Données

### Tables créées/modifiées

#### 1. `categories_clients`
Catégories de clients :
- `PROF_LOCAL` : Professionnel Local
- `PROF_EXPORT` : Professionnel Export
- `PART_LOCAL` : Particulier Local
- `PART_EXPORT` : Particulier Export

#### 2. `types_commerciaux`
Types de commerciaux :
- `COMMERCIAL` : Client géré par un commercial
- `ECOMMERCE` : Client provenant de l'e-commerce
- `PARTENAIRE` : Client partenaire
- `AUTRE` : Autre source

#### 3. `adresses_client`
Adresses multiples par client :
- `type_adresse` : FACTURATION, LIVRAISON, AUTRE
- `principale` : Adresse principale de ce type
- Support de plusieurs lignes d'adresse (ligne1, ligne2, ligne3, ligne4)
- Possibilité de livrer à un autre client (via `id_client` dans commandes)

#### 4. `contacts_client`
Contacts multiples par client :
- `contact_principal` : Un seul contact principal par client
- `id_adresse` : Lien vers une adresse associée
- Fonction, service/bureau, email, téléphones (fixe, portable, fax)

#### 5. `clients` (modifiée)
Nouvelles colonnes ajoutées :
- `type_client` : CLIENT ou PROSPECT (mis à jour automatiquement)
- `id_categorie` : Référence à `categories_clients`
- `id_commercial` : Référence à `utilisateurs` (commercial assigné)
- `id_type_commercial` : Référence à `types_commerciaux`
- `civilite` : Pour particuliers
- `siren_siret` : Pour professionnels
- `numero_tva` : N° TVA intracommunautaire
- `site_web` : Site web du client
- `raison_desactivation` : Raison de désactivation
- `date_desactivation` : Date de désactivation

## 🔄 Fonctionnalités Automatiques

### 1. Type Client (CLIENT/PROSPECT)
- **Trigger automatique** : Lors de la création/modification d'une commande
- Si le client a au moins une commande (non annulée) → `CLIENT`
- Sinon → `PROSPECT`

### 2. Devise selon Pays
- **Fonction SQL** : `determiner_devise_par_pays(pays)`
- Tunisie → `TND`
- Europe → `EUR`
- Reste du monde → `USD`

### 3. Contraintes
- Une seule adresse de facturation principale par client
- Un seul contact principal par client
- Impossible de désactiver la seule adresse de facturation principale

## 🚀 API Backend

### Routes principales

```
GET    /api/clients                    # Liste avec filtres
GET    /api/clients/categories         # Liste des catégories
GET    /api/clients/types-commerciaux  # Liste des types commerciaux
GET    /api/clients/:id                # Détails complets (avec adresses, contacts, commandes, etc.)
POST   /api/clients                    # Créer un client
PUT    /api/clients/:id                # Modifier un client
DELETE /api/clients/:id                # Désactiver (avec raison)
```

### Routes adresses

```
GET    /api/clients/:id/adresses              # Liste des adresses
POST   /api/clients/:id/adresses              # Créer une adresse
PUT    /api/clients/:id/adresses/:id_adresse # Modifier une adresse
DELETE /api/clients/:id/adresses/:id_adresse # Désactiver une adresse
```

### Routes contacts

```
GET    /api/clients/:id/contacts              # Liste des contacts
POST   /api/clients/:id/contacts              # Créer un contact
PUT    /api/clients/:id/contacts/:id_contact  # Modifier un contact
DELETE /api/clients/:id/contacts/:id_contact  # Désactiver un contact
```

## 📝 Exécution des Scripts

### 1. Structure de base de données

```sql
-- Exécuter dans pgAdmin ou psql
\i database/imports/08_structure_clients_enrichie.sql
```

Ce script :
- ✅ Crée les tables `categories_clients`, `types_commerciaux`, `adresses_client`, `contacts_client`
- ✅ Ajoute les nouvelles colonnes à `clients`
- ✅ Crée les fonctions et triggers
- ✅ Migre les données existantes (crée des adresses et contacts à partir des anciennes colonnes)

### 2. Migration des données existantes

Le script migre automatiquement :
- Les adresses existantes → `adresses_client` (type FACTURATION)
- Les contacts existants → `contacts_client` (contact principal)
- Met à jour `type_client` selon l'existence de commandes
- Détermine la devise selon le pays

## 🎨 Frontend (À venir)

### Composants à créer/modifier

1. **Clients.tsx** (liste)
   - Filtres : Type (Client/Prospect), Catégorie, Commercial
   - Affichage des informations enrichies

2. **ClientDetails.tsx** (fiche client)
   - Onglets :
     - 📋 Informations générales
     - 📍 Adresses (facturation, livraison)
     - 👥 Contacts
     - 📦 Commandes
     - 🚚 Bons de livraison
     - 🧾 Factures
     - 📋 Listes de colisage

3. **ClientForm.tsx** (création/édition)
   - Formulaire principal avec tous les nouveaux champs
   - Gestion des adresses multiples
   - Gestion des contacts multiples

4. **AdressesList.tsx**
   - Liste des adresses avec types
   - Boutons pour ajouter/modifier/supprimer

5. **ContactsList.tsx**
   - Liste des contacts
   - Désignation du contact principal
   - Boutons pour ajouter/modifier/supprimer

## 📌 Points Importants

### Client/Prospect
- Un client devient automatiquement `CLIENT` dès qu'il a une commande
- Un `PROSPECT` n'a pas encore de commande
- Le type est mis à jour automatiquement via trigger

### Adresses de livraison
- Un client peut avoir plusieurs adresses de livraison
- Possibilité de livrer à un autre client (via `id_client_livraison` dans commandes - à implémenter)
- Chaque adresse peut être marquée comme principale

### Contacts
- Plusieurs contacts par client
- Un seul contact principal
- Chaque contact peut être associé à une adresse

### Devise
- Déterminée automatiquement selon le pays de l'adresse de facturation
- Peut être modifiée manuellement si nécessaire

### Désactivation
- Soft delete (actif = false)
- Raison de désactivation enregistrée
- Date de désactivation enregistrée

## 🔍 Exemples d'utilisation

### Créer un client avec adresse et contact

```javascript
const nouveauClient = {
  code_client: "CL00001",
  raison_sociale: "Entreprise Test",
  civilite: "SARL",
  id_categorie: 1, // PROF_LOCAL
  id_commercial: 5,
  id_type_commercial: 1, // COMMERCIAL
  siren_siret: "123456789",
  numero_tva: "FR12345678901",
  site_web: "https://example.com",
  conditions_paiement: "Chèque 60 jours",
  plafond_credit: 10000,
  taux_remise: 5,
  adresse_facturation: {
    civilite: "SARL",
    nom_adresse: "Siège social",
    adresse_ligne1: "28 RUE GAMBETTA",
    code_postal: "64500",
    ville: "ST JEAN DE LUZ",
    departement: "PYRENEES-ATLANTIQUES",
    pays: "France"
  },
  contact_principal: {
    civilite: "Monsieur",
    nom: "DUBOUQUET",
    prenom: "THIERRY",
    fonction: "GERANT",
    email: "contact@example.com",
    telephone_fixe: "06 58 86 41 46",
    telephone_portable: "06 12 34 56 78"
  }
};

await clientsService.createClient(nouveauClient);
```

### Ajouter une adresse de livraison

```javascript
const nouvelleAdresse = {
  type_adresse: "LIVRAISON",
  civilite: "BOUTIQUE",
  nom_adresse: "Intérieur et Objet",
  adresse_ligne1: "28 Rue Gambetta",
  code_postal: "64500",
  ville: "ST JEAN DE LUZ",
  pays: "France",
  principale: true
};

await clientsService.createAdresse(clientId, nouvelleAdresse);
```

### Ajouter un contact

```javascript
const nouveauContact = {
  id_adresse: 2, // Optionnel : lier à une adresse
  civilite: "Madame",
  nom: "MONTOROY",
  prenom: "Sophie",
  fonction: "Responsable",
  email: "sophie@example.com",
  telephone_fixe: "689860055",
  contact_principal: false
};

await clientsService.createContact(clientId, nouveauContact);
```

## ✅ Checklist de Déploiement

- [ ] Exécuter `08_structure_clients_enrichie.sql`
- [ ] Vérifier la migration des données existantes
- [ ] Tester les API backend
- [ ] Mettre à jour le frontend (Clients.tsx, ClientDetails.tsx, etc.)
- [ ] Tester la création/modification de clients
- [ ] Tester la gestion des adresses multiples
- [ ] Tester la gestion des contacts multiples
- [ ] Vérifier le changement automatique Client/Prospect
- [ ] Vérifier la détermination automatique de la devise

---

**Note** : Le frontend sera mis à jour dans une prochaine étape pour utiliser toutes ces nouvelles fonctionnalités.
