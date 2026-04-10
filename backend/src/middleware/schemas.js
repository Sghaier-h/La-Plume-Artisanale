import { z } from 'zod';

// ──────────────────────────────────────────────
// Auth
// ──────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string({ required_error: 'Email requis' })
    .email('Format email invalide'),
  password: z.string({ required_error: 'Mot de passe requis' })
    .min(1, 'Mot de passe requis'),
});

// ──────────────────────────────────────────────
// Clients
// ──────────────────────────────────────────────

export const createClientSchema = z.object({
  raison_sociale: z.string({ required_error: 'Raison sociale requise' })
    .min(1, 'Raison sociale requise'),
  code_client: z.string().optional(),
  type_client: z.string().optional(),
  email: z.string().email('Format email invalide').optional().or(z.literal('')),
  telephone: z.string().optional(),
  adresse: z.string().optional(),
  code_postal: z.string().optional(),
  ville: z.string().optional(),
  pays: z.string().optional(),
  siret: z.string().optional(),
  tva_intracommunautaire: z.string().optional(),
  contact_nom: z.string().optional(),
  contact_telephone: z.string().optional(),
  contact_email: z.string().email('Format email invalide').optional().or(z.literal('')),
  notes: z.string().optional(),
}).passthrough();

// ──────────────────────────────────────────────
// Commandes
// ──────────────────────────────────────────────

const ligneCommandeSchema = z.object({
  id_article: z.number().optional(),
  quantite: z.number().positive('La quantite doit etre positive').optional(),
  quantite_commandee: z.number().positive().optional(),
  prix_unitaire: z.number().nonnegative().optional(),
}).passthrough();

export const createCommandeSchema = z.object({
  id_client: z.number({ required_error: 'id_client requis' }),
  date_commande: z.string({ required_error: 'date_commande requise' }),
  lignes: z.array(ligneCommandeSchema).min(1, 'Au moins une ligne est requise'),
  notes: z.string().optional(),
  reference_client: z.string().optional(),
}).passthrough();

// ──────────────────────────────────────────────
// Devis
// ──────────────────────────────────────────────

const ligneDevisSchema = z.object({
  id_article: z.number().optional(),
  designation: z.string().optional(),
  quantite: z.number().positive('La quantite doit etre positive').optional(),
  prix_unitaire_ht: z.number().nonnegative().optional(),
  taux_tva: z.number().optional(),
  remise: z.number().optional(),
}).passthrough();

export const createDevisSchema = z.object({
  id_client: z.number({ required_error: 'id_client requis' }),
  date_devis: z.string({ required_error: 'date_devis requise' }),
  lignes: z.array(ligneDevisSchema).default([]),
  notes: z.string().optional(),
  validite_jours: z.number().positive().optional(),
}).passthrough();

// ──────────────────────────────────────────────
// Factures
// ──────────────────────────────────────────────

const ligneFactureSchema = z.object({
  id_article: z.number().optional(),
  designation: z.string().optional(),
  quantite: z.number().positive().optional(),
  prix_unitaire_ht: z.number().nonnegative().optional(),
  taux_tva: z.number().optional(),
  remise: z.number().optional(),
}).passthrough();

export const createFactureSchema = z.object({
  id_client: z.number({ required_error: 'id_client requis' }),
  date_facture: z.string({ required_error: 'date_facture requise' }),
  lignes: z.array(ligneFactureSchema).default([]),
  notes: z.string().optional(),
  id_commande: z.number().optional(),
  id_devis: z.number().optional(),
}).passthrough();
