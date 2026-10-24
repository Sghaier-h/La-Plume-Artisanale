/**
 * Tests unitaires NumeroSequenceService — templating pur (sans DB).
 *
 * Exécuter :   node --test backend/modules-v2/params/numerotation/__tests__/numeroSequence.test.js
 * (aucune dépendance externe, Node 18+ built-in test runner)
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderTemplate } from '../service.js';

test('renderTemplate — format OF simple', () => {
  const cfg = { prefixe: 'OF', suffixe: '', separateur: '', format_annee: 'aucune',
                format_mois: 'aucun', longueur_sequence: 6, template: '{prefixe}{seq:6}' };
  assert.equal(renderTemplate(cfg, 249780), 'OF249780');
});

test('renderTemplate — facture avec année + mois', () => {
  const cfg = { prefixe: 'FA-', separateur: '', format_annee: 'AAAA', format_mois: 'MM',
                longueur_sequence: 5, template: '{prefixe}{AAAA}{MM}{seq:5}' };
  const out = renderTemplate(cfg, 123, { date: '2026-09-15T10:00:00Z' });
  assert.equal(out, 'FA-20260900123');
});

test('renderTemplate — palette AA + sep', () => {
  const cfg = { prefixe: 'PAL', separateur: '-', format_annee: 'AA', format_mois: 'aucun',
                longueur_sequence: 3, template: '{prefixe}{AA}{sep}{seq:3}' };
  const out = renderTemplate(cfg, 42, { date: '2026-01-10' });
  assert.equal(out, 'PAL26-042');
});

test('renderTemplate — écriture comptable avec {JOURNAL} custom', () => {
  const cfg = { prefixe: '', separateur: '-', format_annee: 'AAAA', format_mois: 'aucun',
                longueur_sequence: 5, template: '{JOURNAL}{sep}{AAAA}{seq:5}' };
  const out = renderTemplate(cfg, 523, { JOURNAL: 'VE', date: '2026-06-01' });
  assert.equal(out, 'VE-202600523');
});

test('renderTemplate — reconstruction quand template vide', () => {
  const cfg = { prefixe: 'CL', suffixe: '', separateur: '', format_annee: 'aucune',
                format_mois: 'aucun', longueur_sequence: 4, template: null };
  assert.equal(renderTemplate(cfg, 184), 'CL0184');
});

test('renderTemplate — colis {ordre:3}', () => {
  const cfg = { prefixe: 'C', suffixe: '', separateur: '-', format_annee: 'aucune',
                format_mois: 'aucun', longueur_sequence: 3,
                template: '{prefixe}{seq:3}{sep}{parent}{sep}{ordre:3}' };
  const out = renderTemplate(cfg, 42, { parent: 'BL0005', ordre: 1 });
  assert.equal(out, 'C042-BL0005-001');
});
