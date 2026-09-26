// Test unitaire — calcul TVA + timbre fiscal (§13.1)
// Exécuter: node --test service.test.js  (ou via jest si framework présent)
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculerTotaux } from './service.js';

describe('factures.calculerTotaux', () => {
  it('TVA 19% + timbre 1DT sur une ligne simple', () => {
    const r = calculerTotaux([
      { quantite: 10, prix_unitaire_ht: 100, taux_tva: 19 }
    ]);
    assert.equal(r.montant_ht, 1000);
    assert.equal(r.montant_tva, 190);
    assert.equal(r.timbre_fiscal, 1);
    assert.equal(r.montant_ttc, 1191);
  });

  it('remise 10% appliquée par ligne', () => {
    const r = calculerTotaux([
      { quantite: 5, prix_unitaire_ht: 100, remise_pct: 10, taux_tva: 19 }
    ]);
    assert.equal(r.montant_ht, 450);          // 5*100*0.9
    assert.equal(r.montant_tva, 85.5);
    assert.equal(r.montant_ttc, 536.5);       // 450 + 85.5 + 1
  });

  it('multi-taux : mélange 19% et 7%', () => {
    const r = calculerTotaux([
      { quantite: 1, prix_unitaire_ht: 200, taux_tva: 19 },
      { quantite: 1, prix_unitaire_ht: 100, taux_tva: 7  }
    ]);
    assert.equal(r.montant_ht, 300);
    assert.equal(r.montant_tva, 45);          // 38 + 7
    assert.equal(r.montant_ttc, 346);
  });

  it('devise étrangère : pas de timbre', () => {
    const r = calculerTotaux(
      [{ quantite: 1, prix_unitaire_ht: 1000, taux_tva: 19 }],
      { devise: 'EUR' }
    );
    assert.equal(r.timbre_fiscal, 0);
    assert.equal(r.montant_ttc, 1190);
  });

  it('applique_timbre=false désactive le timbre', () => {
    const r = calculerTotaux(
      [{ quantite: 1, prix_unitaire_ht: 100, taux_tva: 19 }],
      { applique_timbre: false }
    );
    assert.equal(r.timbre_fiscal, 0);
    assert.equal(r.montant_ttc, 119);
  });
});
