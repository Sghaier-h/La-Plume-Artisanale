import React from 'react';
import type { BulletinPaie } from '../../services/rhApi';
import CachetRond from './CachetRond';

interface Props {
  bulletin: BulletinPaie;
  employeur?: {
    raison_sociale: string;
    matricule_fiscal?: string;
    cnss?: string;
    adresse?: string;
  };
  hideActions?: boolean;
}

const MOIS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const fmt = (n: number | undefined) =>
  (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

/**
 * BulletinPaiePro — bulletin de paie style artisanal chaleureux.
 *
 * Design :
 *  - fond papier crème (linear-gradient 180deg #FDFBF3 → #F7F1E2)
 *  - watermark "La Plume Artisanale" incliné -15° opacity 0.06
 *  - cachet rond SVG terracotta signé
 *  - signature calligraphique Fraunces italic indigo
 *  - perforations dotted pour talon détachable en bas
 *  - typographie serif Fraunces pour titres, monospace pour chiffres
 */
const BulletinPaiePro: React.FC<Props> = ({
  bulletin,
  employeur = {
    raison_sociale: 'La Plume Artisanale SARL',
    matricule_fiscal: '1234567/A/M/000',
    cnss: '01-234567-89',
    adresse: 'Zone industrielle Ksar Hellal, 5070 Monastir, Tunisie',
  },
  hideActions = false,
}) => {
  const b = bulletin;

  return (
    <div
      style={{
        background: 'linear-gradient(180deg, #FDFBF3 0%, #F7F1E2 100%)',
        fontFamily: "'Fraunces', Georgia, serif",
        color: '#2F1F12',
        padding: '48px 56px',
        borderRadius: 12,
        boxShadow: '0 12px 40px rgba(74, 93, 117, 0.15)',
        maxWidth: 900,
        margin: '0 auto',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Watermark */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: 'rotate(-15deg)',
          fontSize: 96,
          fontWeight: 700,
          color: '#C8663D',
          opacity: 0.06,
          letterSpacing: 8,
          pointerEvents: 'none',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          fontFamily: "'Fraunces', Georgia, serif",
        }}
      >
        La Plume Artisanale
      </div>

      {/* Header */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #C8663D', paddingBottom: 16, marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: 3, color: '#C8663D', fontWeight: 700, textTransform: 'uppercase' }}>
            Bulletin de paie
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>
            {MOIS_FR[(b.mois || 1) - 1]} {b.annee}
          </div>
          <div style={{ fontSize: 12, color: '#6B4E31', marginTop: 4 }}>
            N° {b.numero_bulletin}
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 13, color: '#6B4E31' }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#2F1F12' }}>{employeur.raison_sociale}</div>
          <div>MF : {employeur.matricule_fiscal}</div>
          <div>CNSS : {employeur.cnss}</div>
          <div style={{ maxWidth: 260, marginTop: 4 }}>{employeur.adresse}</div>
        </div>
      </div>

      {/* Bloc salarié */}
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20, fontSize: 14, background: 'rgba(255,255,255,0.5)', padding: 16, borderRadius: 8, border: '1px solid #EDE3CE' }}>
        <div>
          <div style={{ fontSize: 11, color: '#9B8874', textTransform: 'uppercase', letterSpacing: 1 }}>Salarié</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>
            {b.employe_prenom} {b.employe_nom}
          </div>
          <div style={{ fontSize: 12, color: '#6B4E31', marginTop: 2 }}>{b.fonction || '—'}</div>
          <div style={{ fontSize: 12, color: '#6B4E31' }}>Matricule : {b.matricule || '—'}</div>
          <div style={{ fontSize: 12, color: '#6B4E31' }}>CIN : {b.cin || '—'}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#9B8874', textTransform: 'uppercase', letterSpacing: 1 }}>Période & activité</div>
          <div style={{ fontSize: 12, marginTop: 6 }}>Jours travaillés : <b>{b.jours_travailles}</b></div>
          <div style={{ fontSize: 12 }}>Heures : <b>{b.heures_travaillees}</b></div>
          <div style={{ fontSize: 12 }}>N° CNSS employé : <b>{b.cnss_num || '—'}</b></div>
        </div>
      </div>

      {/* Table des lignes */}
      <div style={{ position: 'relative', background: 'rgba(255,255,255,0.65)', borderRadius: 8, overflow: 'hidden', border: '1px solid #EDE3CE' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: "'Inter', sans-serif" }}>
          <thead>
            <tr style={{ background: '#C8663D', color: '#FBF8F3' }}>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, fontSize: 11, letterSpacing: 1 }}>Code</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, fontSize: 11, letterSpacing: 1 }}>Libellé</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, fontSize: 11, letterSpacing: 1 }}>Base</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, fontSize: 11, letterSpacing: 1 }}>Taux %</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, fontSize: 11, letterSpacing: 1, color: '#EEF4F0' }}>Gain DT</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, fontSize: 11, letterSpacing: 1, color: '#FBEBE4' }}>Retenue DT</th>
            </tr>
          </thead>
          <tbody style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>
            {b.lignes?.map((l, i) => (
              <tr key={l.code + i} style={{ borderBottom: '1px solid #EDE3CE', background: i % 2 ? 'transparent' : 'rgba(200,102,61,0.03)' }}>
                <td style={{ padding: '6px 10px', color: '#9B8874' }}>{l.code}</td>
                <td style={{ padding: '6px 10px', fontFamily: "'Inter', sans-serif" }}>{l.libelle}</td>
                <td style={{ padding: '6px 10px', textAlign: 'right' }}>{l.base != null ? fmt(l.base) : '—'}</td>
                <td style={{ padding: '6px 10px', textAlign: 'right' }}>{l.taux != null ? l.taux.toFixed(2) : '—'}</td>
                <td style={{ padding: '6px 10px', textAlign: 'right', color: '#4A6C5B', fontWeight: 600 }}>
                  {l.gain != null && l.gain > 0 ? fmt(l.gain) : ''}
                </td>
                <td style={{ padding: '6px 10px', textAlign: 'right', color: '#B84A2F', fontWeight: 600 }}>
                  {l.retenue != null && l.retenue > 0 ? fmt(l.retenue) : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totaux */}
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 20, fontFamily: "'Inter', sans-serif" }}>
        {[
          { l: 'Salaire brut', v: b.salaire_brut, c: '#4A5D75' },
          { l: 'CNSS 9,18 %', v: b.cnss_9_18, c: '#B84A2F' },
          { l: 'Imposable', v: b.imposable, c: '#8A6412' },
          { l: 'IRPP', v: b.irpp, c: '#B84A2F' },
        ].map((t) => (
          <div key={t.l} style={{ background: '#FFFFFF', border: '1px solid #EDE3CE', borderRadius: 6, padding: 10 }}>
            <div style={{ fontSize: 10, color: '#9B8874', textTransform: 'uppercase', letterSpacing: 1 }}>{t.l}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 700, color: t.c, marginTop: 2 }}>
              {fmt(t.v)} DT
            </div>
          </div>
        ))}
      </div>

      {/* Perforations */}
      <div
        aria-hidden
        style={{
          position: 'relative',
          margin: '28px 0 20px',
          borderTop: '2px dashed #C4B394',
          textAlign: 'center',
          color: '#9B8874',
        }}
      >
        <span style={{ background: '#FBF8F3', padding: '0 12px', fontSize: 10, letterSpacing: 3, position: 'relative', top: -8 }}>
          ✂  TALON À DÉTACHER  ✂
        </span>
      </div>

      {/* NET À PAYER — mise en valeur */}
      <div
        style={{
          position: 'relative',
          background: 'linear-gradient(135deg, #C8663D 0%, #B85528 100%)',
          color: '#FBF8F3',
          padding: '20px 24px',
          borderRadius: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 6px 20px rgba(200,102,61,0.35)',
        }}
      >
        <div>
          <div style={{ fontSize: 11, letterSpacing: 3, opacity: 0.85 }}>NET À PAYER</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>
            {b.employe_prenom} {b.employe_nom} — {MOIS_FR[(b.mois || 1) - 1]} {b.annee}
          </div>
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 34, fontWeight: 800, letterSpacing: 1 }}>
          {fmt(b.net_a_payer)} <span style={{ fontSize: 20, opacity: 0.85 }}>DT</span>
        </div>
      </div>

      {/* Signature + cachet */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 40 }}>
        <div style={{ textAlign: 'center', width: 200 }}>
          <div style={{ borderTop: '1px solid #C4B394', paddingTop: 6, fontSize: 11, color: '#9B8874', fontFamily: "'Inter', sans-serif" }}>
            Signature salarié·e
          </div>
        </div>

        <div style={{ position: 'relative', textAlign: 'center', width: 260 }}>
          <div
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontStyle: 'italic',
              fontSize: 26,
              color: '#4A5D75',
              transform: 'rotate(-3deg)',
              marginBottom: -6,
              opacity: 0.9,
            }}
          >
            Salima Guelbi
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={{ borderTop: '1px solid #C4B394', paddingTop: 6, fontSize: 11, color: '#9B8874', flex: 1, fontFamily: "'Inter', sans-serif" }}>
              Directrice · Cachet et signature
            </div>
            <div style={{ marginTop: -16 }}>
              <CachetRond size={82} titre="LA PLUME ARTISANALE" soustitre="DIRECTION" centre="Salima G." />
            </div>
          </div>
        </div>
      </div>

      {!hideActions && (
        <div style={{ position: 'relative', marginTop: 20, fontSize: 10, color: '#9B8874', textAlign: 'center', fontFamily: "'Inter', sans-serif" }}>
          Document généré automatiquement — conforme convention JORT N°49 secteur textile & habillement · CNSS Tunisie
        </div>
      )}
    </div>
  );
};

export default BulletinPaiePro;
