// Tests unitaires — Formule poids fil chaîne (§7.17)
// Exécution : `node --test formule.test.js`  ou via jest.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculPoidsChaineKg,
  extraireNM,
  estSousSeuilAlerte,
  OURD_SEUIL_ALERTE_M,
  OURD_METRAGE_MAX_ENSOUPLE,
  NM_DEFAUT
} from '../formule.js';

test('formule référence : (nb_fils × m × 2) / (NM × 1000)', () => {
  // 6000 fils × 5000 m × 2 / (50 × 1000) = 1200 kg
  assert.equal(calculPoidsChaineKg({ nbFils: 6000, metres: 5000, nm: 50 }), 1200);
});

test('exemple 3200 fils × 2500 m NM 30 = 533.3333 kg', () => {
  const p = calculPoidsChaineKg({ nbFils: 3200, metres: 2500, nm: 30 });
  // (3200*2500*2) / (30*1000) = 16 000 000 / 30 000 = 533.3333...
  assert.equal(p, 533.3333);
});

test('NM défaut = 50 si absent', () => {
  const p1 = calculPoidsChaineKg({ nbFils: 1000, metres: 1000 });
  const p2 = calculPoidsChaineKg({ nbFils: 1000, metres: 1000, nm: NM_DEFAUT });
  assert.equal(p1, p2);
  assert.equal(p1, 40); // (1000*1000*2)/(50*1000) = 40
});

test('rejet nbFils invalide', () => {
  assert.throws(() => calculPoidsChaineKg({ nbFils: 0,   metres: 100, nm: 50 }));
  assert.throws(() => calculPoidsChaineKg({ nbFils: -1,  metres: 100, nm: 50 }));
  assert.throws(() => calculPoidsChaineKg({ nbFils: NaN, metres: 100, nm: 50 }));
});

test('rejet metres invalide ou > plafond ensouple', () => {
  assert.throws(() => calculPoidsChaineKg({ nbFils: 1000, metres: 0,    nm: 50 }));
  assert.throws(() => calculPoidsChaineKg({ nbFils: 1000, metres: -10,  nm: 50 }));
  assert.throws(() => calculPoidsChaineKg({
    nbFils: 1000,
    metres: OURD_METRAGE_MAX_ENSOUPLE + 1,
    nm: 50
  }));
});

test('extraireNM extrait le dernier entier du code', () => {
  assert.equal(extraireNM('NM2/50'),        50);
  assert.equal(extraireNM('COT-NM30'),      30);
  assert.equal(extraireNM('NM 60'),         60);
  // dernier entier = 0 → invalide → fallback défaut
  assert.equal(extraireNM('NM15-01.00'),    NM_DEFAUT);
  assert.equal(extraireNM('sans-chiffre',   77), 77);
  assert.equal(extraireNM('',               20), 20);
  assert.equal(extraireNM(undefined),       NM_DEFAUT);
});

test('estSousSeuilAlerte au seuil 500 m', () => {
  assert.equal(estSousSeuilAlerte(600), false);
  assert.equal(estSousSeuilAlerte(500), false);
  assert.equal(estSousSeuilAlerte(499.99), true);
  assert.equal(estSousSeuilAlerte(0),   true);
  assert.equal(OURD_SEUIL_ALERTE_M, 500);
});

test('non-régression : formule §7.21 exacte', () => {
  const cas = [
    { nbFils: 2400, metres: 4000, nm: 40, attendu: 480 },
    { nbFils: 3600, metres: 3000, nm: 60, attendu: 360 },
    { nbFils: 1800, metres: 2000, nm: 20, attendu: 360 }
  ];
  for (const c of cas) {
    assert.equal(calculPoidsChaineKg(c), c.attendu, JSON.stringify(c));
  }
});
