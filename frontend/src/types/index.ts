// Types TypeScript pour l'application

export interface User {
  id: number;
  nom_utilisateur: string;
  email: string;
  fonction: string;
  roles: string[];
}

export interface Machine {
  id_machine: number;
  numero_machine: string;
  type: string;
  statut: 'operationnel' | 'en_maintenance' | 'arret';
  vitesse_nominale: number;
  largeur_utile: number;
}

export interface OrdreFabrication {
  id_of: number;
  numero_of: string;
  id_article: number;
  quantite_a_produire: number;
  quantite_produite: number;
  statut: string;
  priorite: 'normale' | 'urgente' | 'critique';
  date_debut_prevue: Date;
  date_fin_prevue: Date;
  id_machine?: number;
  couleurs?: string[];
}

export interface Article {
  id_article: number;
  code_article: string;
  designation: string;
  prix_unitaire_base: number;
  poids_net_unitaire: number;
}

export interface StockMP {
  id_stock_mp: number;
  id_mp: number;
  numero_lot: string;
  quantite_disponible: number;
  quantite_reservee: number;
  emplacement: string;
  statut: string;
}

export interface Client {
  id_client: number;
  code_client: string;
  raison_sociale: string;
  email: string;
  telephone: string;
}

export interface Commande {
  id_commande: number;
  numero_commande: string;
  id_client: number;
  date_commande: Date;
  date_livraison_prevue: Date;
  statut: string;
  montant_total: number;
}

export interface Alerte {
  id_alerte: number;
  code_alerte: string;
  libelle: string;
  message: string;
  priorite: string;
  date_creation: Date;
  statut: string;
}

