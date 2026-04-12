/**
 * CSV Service — Export / Import générique
 *
 * Porté depuis 04_Catalogue.gs :
 * - exportArticlesCSV / exportProduitsCSV
 * - importArticlesCSV (avec validation)
 */

/**
 * Échappe une valeur CSV (guillemets + retours ligne + point-virgule)
 */
function escapeCsvValue(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // Si contient guillemet, virgule, point-virgule, saut de ligne → entourer
  if (/[",;\n\r]/.test(str)) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

/**
 * Convertit un tableau d'objets en chaîne CSV
 *
 * @param {Array<Object>} rows - Lignes à exporter
 * @param {Array<{key: string, header: string, format?: Function}>} columns - Définition colonnes
 * @param {string} separator - Séparateur (';' par défaut pour Excel FR)
 * @returns {string} CSV complet avec BOM UTF-8
 */
export function toCsv(rows, columns, separator = ';') {
  const lines = [];

  // En-têtes
  lines.push(columns.map(c => escapeCsvValue(c.header)).join(separator));

  // Données
  for (const row of rows) {
    const values = columns.map(c => {
      const raw = row[c.key];
      const formatted = c.format ? c.format(raw, row) : raw;
      return escapeCsvValue(formatted);
    });
    lines.push(values.join(separator));
  }

  // BOM UTF-8 pour Excel
  return '\uFEFF' + lines.join('\r\n');
}

/**
 * Parse une ligne CSV (en gérant les guillemets)
 */
function parseCsvLine(line, separator) {
  const result = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === separator) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    i++;
  }
  result.push(current);
  return result;
}

/**
 * Parse un CSV en tableau d'objets
 *
 * @param {string} csv - Contenu CSV
 * @param {string} separator - Séparateur auto-détecté par défaut
 * @returns {Array<Object>}
 */
export function fromCsv(csv, separator = null) {
  if (!csv) return [];

  // Retirer BOM
  let content = csv.replace(/^\uFEFF/, '');

  // Auto-détection séparateur
  if (!separator) {
    const firstLine = content.split(/\r?\n/)[0] || '';
    separator = firstLine.includes(';') ? ';' : ',';
  }

  const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');
  if (lines.length === 0) return [];

  const headers = parseCsvLine(lines[0], separator);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i], separator);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] !== undefined ? values[idx] : '';
    });
    rows.push(obj);
  }

  return rows;
}

/**
 * Colonnes par défaut pour export articles catalogue
 */
export const ARTICLES_CATALOGUE_COLUMNS = [
  { key: 'code_article', header: 'Code Article' },
  { key: 'designation', header: 'Désignation' },
  { key: 'ref_commerciale', header: 'Ref Commerciale' },
  { key: 'ref_fabrication', header: 'Ref Fabrication' },
  { key: 'modele_libelle', header: 'Modèle' },
  { key: 'code_modele', header: 'Code Modèle' },
  { key: 'dimension_libelle', header: 'Dimension' },
  { key: 'code_dimension', header: 'Code Dimension' },
  { key: 'finition_libelle', header: 'Finition' },
  { key: 'tissage_libelle', header: 'Tissage' },
  { key: 'nc_libelle', header: 'Nb Couleurs' },
  { key: 'couleur_nom', header: 'Couleur' },
  { key: 'prix_vente', header: 'Prix Vente', format: v => v ? parseFloat(v).toFixed(2) : '' },
  { key: 'prix_revient', header: 'Prix Revient', format: v => v ? parseFloat(v).toFixed(2) : '' },
  { key: 'qte_minimal_stock', header: 'Stock Min' },
  { key: 'unite_vente', header: 'Unité' },
  { key: 'description', header: 'Description' },
  { key: 'actif', header: 'Actif', format: v => v ? 'Oui' : 'Non' }
];
