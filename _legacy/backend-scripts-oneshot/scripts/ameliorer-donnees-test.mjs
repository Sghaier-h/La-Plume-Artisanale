/**
 * Script pour améliorer les données de test pour les modules avec erreurs 400
 * Génère des données plus complètes selon le type de module
 */

const testDataByModule = {
  'articles': {
    name: 'Article Test',
    description: 'Description test article',
    code_article: `ART-${Date.now()}`,
    prix_vente: 100.00,
    actif: true
  },
  'articles-catalogue': {
    // Table: articles_catalogue - nécessite 'nom' (NOT NULL)
    nom: 'Article Catalogue Test',
    reference: `CAT-REF-${Date.now()}`,
    description: 'Description test catalogue',
    prix_vente: 150.00,
    prix_achat: 100.00,
    actif: true
  },
  'clients': {
    // Table: clients - nécessite 'code_client' (UNIQUE NOT NULL) et 'raison_sociale' (NOT NULL)
    code_client: `CLI-${Date.now()}`,
    raison_sociale: 'Raison Sociale Test Client',
    adresse: '123 Rue Test',
    ville: 'Tunis',
    pays: 'Tunisie',
    telephone: '+21612345678',
    email: `client${Date.now()}@test.com`,
    contact_principal: 'Contact Principal Test',
    actif: true
  },
  'fournisseurs': {
    name: 'Fournisseur Test',
    code_fournisseur: `FOU-${Date.now()}`,
    raison_sociale: 'Raison Sociale Test Fournisseur',
    email: `fournisseur${Date.now()}@test.com`,
    telephone: '+21612345679',
    adresse: '456 Rue Fournisseur',
    ville: 'Sfax',
    pays: 'Tunisie',
    actif: true
  },
  'soustraitants': {
    name: 'Sous-traitant Test',
    code_soustraitant: `SOU-${Date.now()}`,
    raison_sociale: 'Raison Sociale Test Sous-traitant',
    email: `soustraitant${Date.now()}@test.com`,
    telephone: '+21612345680',
    adresse: '789 Rue Sous-traitant',
    ville: 'Sousse',
    pays: 'Tunisie',
    actif: true
  },
  'commandes': {
    // Table: commandes_clients - nécessite 'numero_commande' (UNIQUE NOT NULL) et 'id_client' (NOT NULL)
    // Note: id_client doit exister dans la table clients
    // Pour les tests, on peut utiliser id_client: 1 si un client existe
    numero_commande: `CMD-${Date.now()}`,
    id_client: 1, // À adapter selon les données existantes
    date_commande: new Date().toISOString().split('T')[0],
    date_livraison_prevue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    statut: 'EN_ATTENTE',
    montant_ht: 1000.00,
    montant_tva: 200.00,
    montant_ttc: 1200.00,
    remise_globale: 0
  },
  'devis': {
    name: 'Devis Test',
    numero_devis: `DEV-${Date.now()}`,
    date_devis: new Date().toISOString().split('T')[0],
    statut: 'draft',
    actif: true
  },
  'of': {
    name: 'OF Test',
    description: 'Description OF test',
    actif: true
  },
  'machines': {
    name: 'Machine Test',
    description: 'Description machine test',
    actif: true
  },
  'avoirs': {
    name: 'Avoir Test',
    numero_avoir: `AVO-${Date.now()}`,
    date_avoir: new Date().toISOString().split('T')[0],
    montant: 100.00,
    actif: true
  },
  'bons-livraison': {
    name: 'Bon Livraison Test',
    numero_bl: `BL-${Date.now()}`,
    date_bl: new Date().toISOString().split('T')[0],
    statut: 'draft',
    actif: true
  },
  'bons-retour': {
    name: 'Bon Retour Test',
    numero_br: `BR-${Date.now()}`,
    date_br: new Date().toISOString().split('T')[0],
    statut: 'draft',
    actif: true
  },
  'factures': {
    name: 'Facture Test',
    numero_facture: `FAC-${Date.now()}`,
    date_facture: new Date().toISOString().split('T')[0],
    montant_ht: 100.00,
    montant_ttc: 120.00,
    statut: 'draft',
    actif: true
  },
  'purchase-requests': {
    name: 'Demande Achat Test',
    numero_demande: `DA-${Date.now()}`,
    date_demande: new Date().toISOString().split('T')[0],
    statut: 'draft',
    actif: true
  },
  'matieres-premieres': {
    name: 'Matière Première Test',
    code_mp: `MP-${Date.now()}`,
    description: 'Description matière première test',
    unite: 'kg',
    actif: true
  },
  'modeles': {
    name: 'Modèle Test',
    description: 'Description modèle test',
    actif: true
  },
  'pointage': {
    name: 'Pointage Test',
    date_pointage: new Date().toISOString().split('T')[0],
    heure_entree: '08:00:00',
    heure_sortie: '17:00:00',
    actif: true
  }
};

export function getTestData(moduleName) {
  // Normaliser le nom du module (supprimer les tirets, convertir en minuscules)
  const normalizedName = moduleName.toLowerCase().replace(/-/g, '-');
  
  // Si on a des données spécifiques pour ce module, les utiliser
  if (testDataByModule[normalizedName]) {
    const data = { ...testDataByModule[normalizedName] };
    
    // Remplacer les timestamps dans les codes pour éviter les doublons
    const timestamp = Date.now();
    Object.keys(data).forEach(key => {
      if (typeof data[key] === 'string' && data[key].includes('${Date.now()}')) {
        data[key] = data[key].replace('${Date.now()}', timestamp);
      }
    });
    
    return data;
  }
  
  // Sinon, utiliser des données génériques
  return {
    name: `Test ${moduleName} ${Date.now()}`,
    description: 'Test automatique',
    actif: true
  };
}

// Pour utilisation dans les scripts de test
if (import.meta.url === `file://${process.argv[1]}`) {
  const moduleName = process.argv[2] || 'default';
  console.log(JSON.stringify(getTestData(moduleName), null, 2));
}
