/**
 * Script pour mettre à jour toutes les interfaces TypeScript et les composants
 * pour utiliser les bons noms de champs correspondant aux tables de la base de données
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendPath = path.join(__dirname, '../src/pages/erp');

// Mappings des champs par composant
const fieldMappings = {
  'Products.tsx': {
    interface: {
      'id': 'id_article',
      'name': 'nom',
      'default_code': 'reference',
      'categ_id': 'id_categorie',
      'list_price': 'prix_vente',
      'active': 'actif',
      'description': 'description'
    },
    display: {
      'product.id': 'product.id_article || product.id',
      'product.name': 'product.nom || product.name',
      'product.default_code': 'product.reference || product.default_code',
      'product.categ_id': 'product.id_categorie || product.categ_id',
      'product.list_price': 'product.prix_vente || product.list_price',
      'product.active': 'product.actif !== false',
      'product.description': 'product.description'
    }
  },
  'SaleOrders.tsx': {
    interface: {
      'id': 'id_commande',
      'name': 'numero_commande',
      'partner_id': 'id_client',
      'date_order': 'date_commande',
      'amount_total': 'montant_total',
      'state': 'statut',
      'order_lines': 'lignes_commande'
    },
    display: {
      'order.id': 'order.id_commande || order.id',
      'order.name': 'order.numero_commande || order.name',
      'order.partner_id': 'order.id_client || order.partner_id',
      'order.date_order': 'order.date_commande || order.date_order',
      'order.amount_total': 'order.montant_total || order.amount_total',
      'order.state': 'order.statut || order.state',
      'order.order_lines': 'order.lignes_commande || order.order_lines'
    }
  },
  'PurchaseOrders.tsx': {
    interface: {
      'id': 'id_commande_fournisseur',
      'name': 'numero_commande',
      'partner_id': 'id_fournisseur',
      'date_order': 'date_commande',
      'amount_total': 'montant_total',
      'state': 'statut',
      'order_line': 'lignes_commande'
    },
    display: {
      'order.id': 'order.id_commande_fournisseur || order.id',
      'order.name': 'order.numero_commande || order.name',
      'order.partner_id': 'order.id_fournisseur || order.partner_id',
      'order.date_order': 'order.date_commande || order.date_order',
      'order.amount_total': 'order.montant_total || order.amount_total',
      'order.state': 'order.statut || order.state',
      'order.order_line': 'order.lignes_commande || order.order_line'
    }
  },
  'CRMLeads.tsx': {
    interface: {
      'id': 'id_piste',
      'name': 'nom',
      'email': 'email',
      'phone': 'telephone',
      'expected_revenue': 'revenu_attendu',
      'probability': 'probabilite',
      'stage_id': 'id_stade',
      'user_id': 'id_utilisateur'
    },
    display: {
      'lead.id': 'lead.id_piste || lead.id',
      'lead.name': 'lead.nom || lead.name',
      'lead.email': 'lead.email',
      'lead.phone': 'lead.telephone || lead.phone',
      'lead.expected_revenue': 'lead.revenu_attendu || lead.expected_revenue',
      'lead.probability': 'lead.probabilite || lead.probability',
      'lead.stage_id': 'lead.id_stade || lead.stage_id',
      'lead.user_id': 'lead.id_utilisateur || lead.user_id'
    }
  },
  'Partners.tsx': {
    interface: {
      'id_partner': 'id_client',
      'name': 'raison_sociale',
      'ref': 'code_client',
      'email': 'email',
      'phone': 'telephone',
      'customer': 'est_client',
      'customer_rank': 'rang_client',
      'credit_limit': 'limite_credit',
      'active': 'actif'
    },
    display: {
      'partner.id_partner': 'partner.id_client || partner.id_partner',
      'partner.name': 'partner.raison_sociale || partner.name',
      'partner.ref': 'partner.code_client || partner.ref',
      'partner.email': 'partner.email',
      'partner.phone': 'partner.telephone || partner.phone',
      'partner.customer': 'partner.est_client !== false',
      'partner.customer_rank': 'partner.rang_client || partner.customer_rank',
      'partner.credit_limit': 'partner.limite_credit || partner.credit_limit',
      'partner.active': 'partner.actif !== false'
    }
  }
};

console.log('🔄 Mise à jour des interfaces et composants...\n');

for (const [fileName, mappings] of Object.entries(fieldMappings)) {
  const filePath = path.join(frontendPath, fileName);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Fichier non trouvé: ${fileName}`);
    continue;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;
  
  // Mettre à jour l'interface
  for (const [oldField, newField] of Object.entries(mappings.interface)) {
    // Mettre à jour dans l'interface
    const interfaceRegex = new RegExp(`(\\s+)${oldField}(\\s*:\\s*[^;]+;)`, 'g');
    if (interfaceRegex.test(content)) {
      content = content.replace(interfaceRegex, `$1${newField}$2`);
      changes++;
    }
    
    // Ajouter l'alias pour compatibilité
    const aliasRegex = new RegExp(`(\\s+)${newField}(\\s*:\\s*[^;]+;)`, 'g');
    if (!aliasRegex.test(content)) {
      // Ajouter l'alias après la nouvelle définition
      content = content.replace(
        new RegExp(`(\\s+)${newField}(\\s*:\\s*[^;]+;)`, 'g'),
        `$1${newField}$2\n  // Alias pour compatibilité\n  ${oldField}?: any;`
      );
    }
  }
  
  // Mettre à jour les références dans le code
  for (const [oldRef, newRef] of Object.entries(mappings.display)) {
    const refRegex = new RegExp(oldRef.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    if (refRegex.test(content)) {
      content = content.replace(refRegex, newRef);
      changes++;
    }
  }
  
  if (changes > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${fileName}: ${changes} modification(s)`);
  } else {
    console.log(`ℹ️  ${fileName}: Aucune modification nécessaire`);
  }
}

console.log('\n✅ Mise à jour terminée');
