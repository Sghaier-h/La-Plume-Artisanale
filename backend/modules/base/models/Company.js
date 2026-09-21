/**
 * Company - Modèle pour la gestion des sociétés
 * Gestion complète avec tous les détails
 */

import BaseModel from '../../../src/core/BaseModel.js';

class Company extends BaseModel {
  static _name = 'res.company';
  static _description = 'Company';
  static _table = 'societes';
  static _rec_name = 'raison_sociale';

  static _fields = {
    id_societe: { string: 'ID', type: 'integer', readonly: true },
    code_societe: { string: 'Code Société', type: 'char', required: true },
    raison_sociale: { string: 'Raison Sociale', type: 'char', required: true },
    nom_commercial: { string: 'Nom Commercial', type: 'char' },
    forme_juridique: { string: 'Forme Juridique', type: 'char' },
    siret: { string: 'SIRET', type: 'char' },
    siren: { string: 'SIREN', type: 'char' },
    rcs: { string: 'RCS', type: 'char' },
    rcs_ville: { string: 'RCS Ville', type: 'char' },
    tva_intracommunautaire: { string: 'TVA Intracommunautaire', type: 'char' },
    
    // Logo et photo
    logo_path: { string: 'Chemin Logo', type: 'char' },
    photo_path: { string: 'Chemin Photo', type: 'char' },
    
    // Adresse siège
    adresse_siege: { string: 'Adresse Siège', type: 'text' },
    code_postal_siege: { string: 'Code Postal Siège', type: 'char' },
    ville_siege: { string: 'Ville Siège', type: 'char' },
    pays_siege: { string: 'Pays Siège', type: 'char' },
    telephone_siege: { string: 'Téléphone Siège', type: 'char' },
    fax_siege: { string: 'Fax Siège', type: 'char' },
    email_siege: { string: 'Email Siège', type: 'char' },
    site_web: { string: 'Site Web', type: 'char' },
    
    // Contact comptable
    comptable_nom: { string: 'Nom Comptable', type: 'char' },
    comptable_prenom: { string: 'Prénom Comptable', type: 'char' },
    comptable_societe: { string: 'Société Comptable', type: 'char' },
    comptable_email: { string: 'Email Comptable', type: 'char' },
    comptable_telephone: { string: 'Téléphone Comptable', type: 'char' },
    comptable_adresse: { string: 'Adresse Comptable', type: 'text' },
    comptable_code_postal: { string: 'Code Postal Comptable', type: 'char' },
    comptable_ville: { string: 'Ville Comptable', type: 'char' },
    
    // Informations bancaires
    banque_nom: { string: 'Nom Banque', type: 'char' },
    banque_code_guichet: { string: 'Code Guichet', type: 'char' },
    banque_numero_compte: { string: 'Numéro Compte', type: 'char' },
    banque_cle_rib: { string: 'Clé RIB', type: 'char' },
    banque_iban: { string: 'IBAN', type: 'char' },
    banque_bic: { string: 'BIC', type: 'char' },
    
    // Informations fiscales
    regime_fiscal: { string: 'Régime Fiscal', type: 'char' },
    periode_fiscale: { string: 'Période Fiscale', type: 'char' },
    date_creation_societe: { string: 'Date Création', type: 'date' },
    date_debut_exercice: { string: 'Date Début Exercice', type: 'date' },
    date_fin_exercice: { string: 'Date Fin Exercice', type: 'date' },
    capital_social: { string: 'Capital Social', type: 'float' },
    devise_capital: { string: 'Devise Capital', type: 'char' },
    
    // Statut et activité
    activite_principale: { string: 'Activité Principale', type: 'char' },
    activite_secondaire: { string: 'Activité Secondaire', type: 'text' },
    secteur_activite: { string: 'Secteur Activité', type: 'char' },
    nombre_salaries: { string: 'Nombre Salariés', type: 'integer' },
    
    // Multi-société
    societe_mere_id: { string: 'Société Mère', type: 'many2one', relation: 'res.company' },
    est_societe_mere: { string: 'Est Société Mère', type: 'boolean' },
    
    // Paramètres système
    devise_principale: { string: 'Devise Principale', type: 'char' },
    langue_principale: { string: 'Langue Principale', type: 'char' },
    fuseau_horaire: { string: 'Fuseau Horaire', type: 'char' },
    
    // Statut
    actif: { string: 'Actif', type: 'boolean' },
    date_creation: { string: 'Date Création', type: 'datetime', readonly: true },
    date_modification: { string: 'Date Modification', type: 'datetime', readonly: true },
    cree_par: { string: 'Créé par', type: 'many2one', relation: 'res.users' },
    modifie_par: { string: 'Modifié par', type: 'many2one', relation: 'res.users' },
  };

  _mapField(field) {
    const fieldMapping = {
      'id': 'id_societe',
      'code': 'code_societe',
      'name': 'raison_sociale',
      'legal_name': 'raison_sociale',
      'commercial_name': 'nom_commercial',
      'company_type': 'forme_juridique',
      'vat': 'tva_intracommunautaire',
      'street': 'adresse_siege',
      'zip': 'code_postal_siege',
      'city': 'ville_siege',
      'country_id': 'pays_siege',
      'phone': 'telephone_siege',
      'email': 'email_siege',
      'website': 'site_web',
    };
    return fieldMapping[field] || field;
  }

  _formatRow(row) {
    return {
      id: row.id_societe,
      id_societe: row.id_societe,
      code_societe: row.code_societe,
      raison_sociale: row.raison_sociale,
      nom_commercial: row.nom_commercial,
      forme_juridique: row.forme_juridique,
      siret: row.siret,
      siren: row.siren,
      rcs: row.rcs,
      rcs_ville: row.rcs_ville,
      tva_intracommunautaire: row.tva_intracommunautaire,
      logo_path: row.logo_path,
      photo_path: row.photo_path,
      adresse_siege: row.adresse_siege,
      code_postal_siege: row.code_postal_siege,
      ville_siege: row.ville_siege,
      pays_siege: row.pays_siege || 'France',
      telephone_siege: row.telephone_siege,
      fax_siege: row.fax_siege,
      email_siege: row.email_siege,
      site_web: row.site_web,
      // Contact comptable
      comptable_nom: row.comptable_nom,
      comptable_prenom: row.comptable_prenom,
      comptable_societe: row.comptable_societe,
      comptable_email: row.comptable_email,
      comptable_telephone: row.comptable_telephone,
      comptable_adresse: row.comptable_adresse,
      comptable_code_postal: row.comptable_code_postal,
      comptable_ville: row.comptable_ville,
      // Informations bancaires
      banque_nom: row.banque_nom,
      banque_code_guichet: row.banque_code_guichet,
      banque_numero_compte: row.banque_numero_compte,
      banque_cle_rib: row.banque_cle_rib,
      banque_iban: row.banque_iban,
      banque_bic: row.banque_bic,
      // Informations fiscales
      regime_fiscal: row.regime_fiscal,
      periode_fiscale: row.periode_fiscale,
      date_creation_societe: row.date_creation_societe,
      date_debut_exercice: row.date_debut_exercice,
      date_fin_exercice: row.date_fin_exercice,
      capital_social: parseFloat(row.capital_social) || 0,
      devise_capital: row.devise_capital || 'EUR',
      // Statut et activité
      activite_principale: row.activite_principale,
      activite_secondaire: row.activite_secondaire,
      secteur_activite: row.secteur_activite,
      nombre_salaries: parseInt(row.nombre_salaries) || 0,
      // Multi-société
      societe_mere_id: row.societe_mere_id,
      est_societe_mere: row.est_societe_mere || false,
      // Paramètres système
      devise_principale: row.devise_principale || 'EUR',
      langue_principale: row.langue_principale || 'fr_FR',
      fuseau_horaire: row.fuseau_horaire || 'Europe/Paris',
      // Statut
      actif: row.actif !== false,
      date_creation: row.date_creation,
      date_modification: row.date_modification,
      cree_par: row.cree_par,
      modifie_par: row.modifie_par,
    };
  }
}

export default Company;
