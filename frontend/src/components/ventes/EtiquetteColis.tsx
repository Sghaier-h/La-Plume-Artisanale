import React from 'react';
import type { Colis } from '../../services/ventesComplementsApi';

interface Props {
  colis: Colis;
  destinataire?: {
    nom: string;
    adresse?: string;
    ville?: string;
    code_postal?: string;
    pays?: string;
    telephone?: string;
  };
}

/**
 * EtiquetteColis — étiquette colis A6 imprimable.
 * Style artisanal : fond crème, terracotta accent, mono pour codes.
 */
const EtiquetteColis: React.FC<Props> = ({
  colis,
  destinataire = {
    nom: colis.nom_client || 'Client',
    adresse: '—',
    ville: '',
    code_postal: '',
    pays: 'Tunisie',
  },
}) => {
  // Code-barres simulé avec des barres SVG (pattern basé sur le numero_colis)
  const code = colis.numero_colis || 'C000-000-000';
  const bars = Array.from(code).map((c) => (c.charCodeAt(0) % 7) + 2);

  return (
    <div
      style={{
        width: 380,
        background: 'linear-gradient(180deg, #FDFBF3 0%, #F7F1E2 100%)',
        border: '2px solid #C8663D',
        borderRadius: 8,
        padding: 14,
        fontFamily: "'Inter', sans-serif",
        color: '#2F1F12',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      }}
    >
      {/* En-tête */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #C8663D', paddingBottom: 8, marginBottom: 10 }}>
        <div>
          <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 15, color: '#C8663D' }}>
            La Plume Artisanale
          </div>
          <div style={{ fontSize: 9, color: '#6B4E31' }}>Ksar Hellal — Monastir · TN</div>
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            fontWeight: 700,
            background: '#C8663D',
            color: '#FBF8F3',
            padding: '3px 8px',
            borderRadius: 4,
          }}
        >
          {colis.statut?.toUpperCase()}
        </div>
      </div>

      {/* Destinataire */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EDE3CE', borderRadius: 6, padding: 10, marginBottom: 10 }}>
        <div style={{ fontSize: 9, color: '#9B8874', textTransform: 'uppercase', letterSpacing: 1 }}>Destinataire</div>
        <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>{destinataire.nom}</div>
        <div style={{ fontSize: 12, color: '#6B4E31' }}>{destinataire.adresse}</div>
        <div style={{ fontSize: 12, color: '#6B4E31' }}>
          {destinataire.code_postal} {destinataire.ville} — {destinataire.pays}
        </div>
        {destinataire.telephone && (
          <div style={{ fontSize: 11, color: '#4A5D75', marginTop: 2 }}>☎ {destinataire.telephone}</div>
        )}
      </div>

      {/* Infos colis */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 11, marginBottom: 10 }}>
        <div>
          <span style={{ color: '#9B8874' }}>Cde :</span> <b>{colis.numero_commande || '—'}</b>
        </div>
        <div>
          <span style={{ color: '#9B8874' }}>Poids :</span> <b>{colis.poids_kg} kg</b>
        </div>
        <div>
          <span style={{ color: '#9B8874' }}>Dim. :</span>{' '}
          <b>
            {colis.longueur_cm || '—'} × {colis.largeur_cm || '—'} × {colis.hauteur_cm || '—'} cm
          </b>
        </div>
        <div>
          <span style={{ color: '#9B8874' }}>Transp. :</span> <b>{colis.transporteur_nom || '—'}</b>
        </div>
      </div>

      {/* Code barres */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: 44, gap: 1, background: '#FFF', padding: 4, borderRadius: 4, border: '1px solid #EDE3CE' }}>
        {bars.map((w, i) => (
          <div
            key={i}
            style={{
              width: w,
              height: '100%',
              background: i % 2 ? '#2F1F12' : '#4A5D75',
            }}
          />
        ))}
      </div>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 13,
          fontWeight: 700,
          textAlign: 'center',
          marginTop: 6,
          letterSpacing: 2,
        }}
      >
        {code}
      </div>
    </div>
  );
};

export default EtiquetteColis;
