/**
 * Utilitaires pour gérer les relations entre modèles
 * Système ERP La Plume Artisanale
 */

/**
 * Format Many2One : [id, name]
 * Exemple: [1, "Client ABC"] ou {id: 1, name: "Client ABC"}
 */
export interface Many2One {
  id: number;
  name: string;
}

/**
 * Convertit un Many2One en format standard
 */
export function formatMany2One(value: any): Many2One | null {
  if (!value) return null;
  
  // Si c'est déjà un objet avec id et name
  if (typeof value === 'object' && 'id' in value && 'name' in value) {
    return { id: value.id, name: value.name };
  }
  
  // Si c'est un tableau [id, name]
  if (Array.isArray(value) && value.length >= 2) {
    return { id: value[0], name: value[1] };
  }
  
  // Si c'est juste un ID, retourner null (pas de nom disponible)
  if (typeof value === 'number') {
    return { id: value, name: `ID ${value}` };
  }
  
  return null;
}

/**
 * Extrait l'ID d'un Many2One
 */
export function getMany2OneId(value: any): number | null {
  const m2o = formatMany2One(value);
  return m2o?.id || null;
}

/**
 * Extrait le nom d'un Many2One
 */
export function getMany2OneName(value: any): string {
  const m2o = formatMany2One(value);
  return m2o?.name || '';
}

/**
 * Formate un Many2One pour l'affichage
 */
export function displayMany2One(value: any): string {
  return getMany2OneName(value) || 'Non défini';
}

/**
 * Charge les relations One2Many depuis l'API
 */
export async function loadOne2Many(
  apiCall: () => Promise<any>,
  relationField: string
): Promise<any[]> {
  try {
    const response = await apiCall();
    const data = response.data?.data || response.data || [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Erreur chargement relation ${relationField}:`, error);
    return [];
  }
}

/**
 * Formate une date pour l'affichage
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * Formate un montant pour l'affichage
 */
export function formatCurrency(amount: number | null | undefined, currency: string = 'TND'): string {
  if (amount === null || amount === undefined) return '-';
  return `${amount.toFixed(2)} ${currency}`;
}

/**
 * Formate un statut pour l'affichage
 */
export function formatState(state: string | null | undefined): { label: string; color: string } {
  const states: Record<string, { label: string; color: string }> = {
    'draft': { label: 'Brouillon', color: 'draft' },
    'sent': { label: 'Envoyé', color: 'confirmed' },
    'sale': { label: 'Confirmé', color: 'done' },
    'cancel': { label: 'Annulé', color: 'cancelled' },
    'done': { label: 'Terminé', color: 'done' },
    'EN_ATTENTE': { label: 'En attente', color: 'draft' },
    'CONFIRME': { label: 'Confirmé', color: 'confirmed' },
    'LIVRE': { label: 'Livré', color: 'done' },
    'ANNULE': { label: 'Annulé', color: 'cancelled' }
  };
  
  return states[state || ''] || { label: state || 'Inconnu', color: 'draft' };
}

/**
 * Calcule le total d'une liste de lignes
 */
export function calculateTotal(lines: any[], field: string = 'price_subtotal'): number {
  if (!Array.isArray(lines)) return 0;
  return lines.reduce((sum, line) => sum + (parseFloat(line[field] || 0)), 0);
}

/**
 * Groupe les enregistrements par un champ
 */
export function groupBy<T>(array: T[], key: string | ((item: T) => string)): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : (item as any)[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Trie les enregistrements
 */
export function sortBy<T>(array: T[], key: string | ((item: T) => any), direction: 'asc' | 'desc' = 'asc'): T[] {
  const sorted = [...array].sort((a, b) => {
    const aVal = typeof key === 'function' ? key(a) : (a as any)[key];
    const bVal = typeof key === 'function' ? key(b) : (b as any)[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
  
  return sorted;
}

/**
 * Filtre les enregistrements
 */
export function filterRecords<T>(array: T[], filters: Record<string, any>): T[] {
  return array.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      const itemValue = (item as any)[key];
      
      if (value === null || value === undefined) return true;
      if (typeof value === 'string') {
        return String(itemValue).toLowerCase().includes(value.toLowerCase());
      }
      if (Array.isArray(value)) {
        return value.includes(itemValue);
      }
      return itemValue === value;
    });
  });
}

/**
 * Recherche dans les enregistrements
 */
export function searchRecords<T>(array: T[], searchTerm: string, fields: string[]): T[] {
  if (!searchTerm) return array;
  
  const term = searchTerm.toLowerCase();
  return array.filter(item => {
    return fields.some(field => {
      const value = (item as any)[field];
      return value && String(value).toLowerCase().includes(term);
    });
  });
}

export default {
  formatMany2One,
  getMany2OneId,
  getMany2OneName,
  displayMany2One,
  loadOne2Many,
  formatDate,
  formatCurrency,
  formatState,
  calculateTotal,
  groupBy,
  sortBy,
  filterRecords,
  searchRecords
};
