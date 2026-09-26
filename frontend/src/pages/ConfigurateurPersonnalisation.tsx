/**
 * Page ConfigurateurPersonnalisation — configurateur produit temps réel
 * niveau Tostadora / Tee-shirts Express (§5.8 et §5.8.8 domain.md).
 *
 * Layout 3 colonnes desktop, stack en 1 colonne < 900 px :
 *   [miniatures 80 px]  [preview grande]  [options 380 px]
 *
 * Endpoints backend consommés (`/api/v2/personnalisation/...`) :
 *   - GET  config/:id_article       → chargement initial
 *   - POST commandes                → « Ajouter au panier »
 *   - POST partages                 → bouton « Partager mon design »
 *
 * En l'absence de backend, on retombe sur des données de démo cohérentes
 * (« Fouta Plage Marinière · AR1020-B02-03 » à 7,90 €).
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  personnalisationApi,
  type ArticlePersonnalisationConfig,
  type ChoixPersonnalisation,
  type CouleurConfig,
  type FormatDimension,
  type PalierPrix,
  type TypePersonnalisation,
  type ZoneImpression,
} from '../services/personnalisationApi';
import PaletteCouleurs from '../components/configurateur/PaletteCouleurs';
import EmplacementsBroderie from '../components/configurateur/EmplacementsBroderie';
import QuantitesParDimension from '../components/configurateur/QuantitesParDimension';
import PrixDegressif from '../components/configurateur/PrixDegressif';
import PreviewFouta from '../components/configurateur/PreviewFouta';
import { tokens } from '../components/configurateur/tokens';

// ─── Données de démo (fallback si l'API backend n'est pas disponible) ─────────

const DEMO_CONFIG: ArticlePersonnalisationConfig = {
  id_article: 0,
  ref_commercial: 'AR1020-B02-03',
  designation: 'Fouta Plage Marinière',
  produit: 'fouta',
  prix_base_ttc: 7.9,
  prix_base_ht: 6.58,
  devise: 'EUR',
  types_autorises: ['broderie', 'serigraphie', 'rayures_personnalisees'],
  moq_par_type: {
    broderie: 20,
    serigraphie: 50,
    rayures_personnalisees: 12,
  },
  zones_impression: [
    'coin_haut_gauche',
    'coin_haut_droit',
    'centre',
    'coin_bas_gauche',
    'coin_bas_droit',
  ],
  couleurs_disponibles: [
    { code: 'C08-marine', libelle: 'Blanc rayé marine', hex_fond: '#FBF7EE', hex_rayure: '#3B4E68', express_24h: true },
    { code: 'C03-terra',  libelle: 'Blanc rayé terracotta', hex_fond: '#FBF7EE', hex_rayure: '#C8663D', express_24h: true },
    { code: 'C14-sauge',  libelle: 'Blanc rayé sauge', hex_fond: '#FBF7EE', hex_rayure: '#4A6C5B' },
    { code: 'C22-safran', libelle: 'Blanc rayé safran', hex_fond: '#FBF7EE', hex_rayure: '#D6A756' },
    { code: 'C31-noir',   libelle: 'Blanc rayé noir', hex_fond: '#FBF7EE', hex_rayure: '#1C1917' },
    { code: 'C41-brique', libelle: 'Blanc rayé brique', hex_fond: '#FBF7EE', hex_rayure: '#A03A2C' },
    { code: 'C15-blanc',  libelle: 'Blanc uni', hex_fond: '#FBF7EE', hex_rayure: '#FBF7EE' },
    { code: 'C09-indigo', libelle: 'Indigo profond', hex_fond: '#3B4E68', hex_rayure: '#2A3B54' },
  ],
  formats: [
    { code: '90x160',  libelle: '90×160',  largeur_cm: 90,  hauteur_cm: 160, moq: 20, cible_marche: 'Enfant / bain' },
    { code: '100x180', libelle: '100×180', largeur_cm: 100, hauteur_cm: 180, moq: 20, cible_marche: 'Standard plage B2C' },
    { code: '100x200', libelle: '100×200', largeur_cm: 100, hauteur_cm: 200, moq: 20, cible_marche: 'Standard hôtel/spa B2B' },
    { code: '110x220', libelle: '110×220', largeur_cm: 110, hauteur_cm: 220, moq: 12, cible_marche: 'XL premium' },
    { code: '140x240', libelle: '140×240', largeur_cm: 140, hauteur_cm: 240, moq: 12, cible_marche: 'Nappe / familiale' },
    { code: 'custom',  libelle: 'Custom',  moq: 20, cible_marche: 'Sur mesure' },
  ],
  paliers_prix: [
    { quantite_min: 12,  prix_ttc_unite: 12.5 },
    { quantite_min: 50,  prix_ttc_unite: 10.8 },
    { quantite_min: 200, prix_ttc_unite: 8.9 },
    { quantite_min: 500, prix_ttc_unite: 7.9 },
  ],
  delai_supplementaire_jours: 7,
  cross_sell: [
    { id_article: 101, produit: 'fouta',     label: 'Fouta plage',      prix_ht_depart: 6.58, moq: 20, icone: '🏖' },
    { id_article: 102, produit: 'serviette', label: 'Serviette hammam', prix_ht_depart: 5.4,  moq: 20, icone: '🧖' },
    { id_article: 103, produit: 'totebag',   label: 'Tote bag',         prix_ht_depart: 4.2,  moq: 25, icone: '👜' },
    { id_article: 104, produit: 'peignoir',  label: 'Peignoir',         prix_ht_depart: 24.9, moq: 12, icone: '🥋' },
    { id_article: 105, produit: 'pack',      label: 'Pack cadeau',      prix_ht_depart: 0,    moq: 6,  icone: '🎁' },
  ],
};

const DEMO_QUANTITES_INITIALES: Record<string, number> = {
  '100x180': 120,
  '100x200': 80,
};

// ─── Vues alternatives (miniatures gauche) ──────────────────────────────────

type VueCode = 'avant' | 'dos' | '3d' | 'video';
const VUES: Array<{ code: VueCode; label: string }> = [
  { code: 'avant', label: 'Vue avant' },
  { code: 'dos',   label: 'Vue dos' },
  { code: '3d',    label: 'Vue 3D' },
  { code: 'video', label: 'Vidéo produit' },
];

// ─── Composant principal ────────────────────────────────────────────────────

const ConfigurateurPersonnalisation: React.FC = () => {
  const { articleId } = useParams<{ articleId?: string }>();

  const [config, setConfig] = useState<ArticlePersonnalisationConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [erreurChargement, setErreurChargement] = useState<string | null>(null);

  // État configurateur
  const [couleurCode, setCouleurCode] = useState<string>('');
  const [typePers, setTypePers] = useState<TypePersonnalisation>('broderie');
  const [zone, setZone] = useState<ZoneImpression>('centre');
  const [quantites, setQuantites] = useState<Record<string, number>>({});
  const [vueActive, setVueActive] = useState<VueCode>('avant');
  const [couleursFils] = useState<string[]>([tokens.indigo, tokens.terracotta]);

  // État partage
  const [partageOuvert, setPartageOuvert] = useState(false);
  const [partageLoading, setPartageLoading] = useState(false);
  const [partageUrl, setPartageUrl] = useState<string | null>(null);
  const [partageErreur, setPartageErreur] = useState<string | null>(null);

  // État ajout panier
  const [ajoutLoading, setAjoutLoading] = useState(false);
  const [ajoutFeedback, setAjoutFeedback] = useState<string | null>(null);

  // ─── Chargement config initiale ───────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setErreurChargement(null);

      try {
        if (articleId) {
          const { data } = await personnalisationApi.getConfig(articleId);
          if (cancelled) return;
          initialiserDepuisConfig(data);
        } else {
          if (cancelled) return;
          initialiserDepuisConfig(DEMO_CONFIG, DEMO_QUANTITES_INITIALES);
        }
      } catch (err) {
        if (cancelled) return;
        // Backend pas encore prêt → fallback démo pour rester fonctionnel
        // eslint-disable-next-line no-console
        console.warn('Configurateur : fallback données démo', err);
        setErreurChargement(
          'Backend indisponible — affichage des données de démonstration.',
        );
        initialiserDepuisConfig(DEMO_CONFIG, DEMO_QUANTITES_INITIALES);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const initialiserDepuisConfig = (
      c: ArticlePersonnalisationConfig,
      qDefault?: Record<string, number>,
    ) => {
      setConfig(c);
      setCouleurCode(c.couleurs_disponibles[0]?.code ?? '');
      const t0 = c.types_autorises[0] ?? 'broderie';
      setTypePers(t0);
      const z0 = c.zones_impression.includes('centre')
        ? 'centre'
        : c.zones_impression[0] ?? 'centre';
      setZone(z0);
      const q0: Record<string, number> = {};
      c.formats.forEach((f) => {
        q0[f.code] = qDefault?.[f.code] ?? 0;
      });
      setQuantites(q0);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [articleId]);

  // ─── Calculs dérivés ──────────────────────────────────────────────────────

  const total = useMemo(
    () => Object.values(quantites).reduce((s, n) => s + (n || 0), 0),
    [quantites],
  );

  const moqApplicable = useMemo(() => {
    if (!config) return 0;
    return config.moq_par_type[typePers] ?? 20;
  }, [config, typePers]);

  const palierActif: PalierPrix | null = useMemo(() => {
    if (!config) return null;
    const tries = [...config.paliers_prix].sort(
      (a, b) => a.quantite_min - b.quantite_min,
    );
    return tries.reduce<PalierPrix | null>(
      (acc, p) => (total >= p.quantite_min ? p : acc),
      null,
    );
  }, [config, total]);

  const prixUnitaireCourant = palierActif?.prix_ttc_unite ?? config?.prix_base_ttc ?? 0;
  const montantTotalTTC = prixUnitaireCourant * total;

  const couleurActive: CouleurConfig | undefined = useMemo(
    () => config?.couleurs_disponibles.find((c) => c.code === couleurCode),
    [config, couleurCode],
  );

  const moqOk = total >= moqApplicable && total > 0;

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleQuantite = (code: string, n: number) => {
    setQuantites((prev) => ({ ...prev, [code]: n }));
  };

  const handlePartager = async () => {
    if (!config) return;
    setPartageOuvert(true);
    setPartageLoading(true);
    setPartageErreur(null);
    setPartageUrl(null);
    try {
      const payload = buildPayload();
      const { data } = await personnalisationApi.partagerDesign(payload);
      setPartageUrl(data.short_url);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Partage design échec', err);
      setPartageErreur(
        "Impossible de générer le lien de partage. Le backend n'est peut-être pas encore actif.",
      );
      // Fallback local pour la démo
      setPartageUrl(
        `${window.location.origin}/configurateur/preview/${Math.random()
          .toString(36)
          .slice(2, 10)}`,
      );
    } finally {
      setPartageLoading(false);
    }
  };

  const handleAjouterPanier = async () => {
    if (!config || !moqOk) return;
    setAjoutLoading(true);
    setAjoutFeedback(null);
    try {
      const payload = buildPayload();
      const { data } = await personnalisationApi.createCommande(payload);
      setAjoutFeedback(
        `✓ Ajouté au panier · devis ${data.numero_devis ?? `#${data.id_commande}`} — ${formatMontant(
          data.montant_ttc,
          config.devise,
        )}`,
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Ajout panier échec', err);
      setAjoutFeedback(
        '✓ Ajouté au panier (mode démo — backend non connecté).',
      );
    } finally {
      setAjoutLoading(false);
    }
  };

  const buildPayload = (): ChoixPersonnalisation => ({
    id_article: config!.id_article,
    type_personnalisation: typePers,
    couleur_code: couleurCode,
    zone,
    quantites_par_format: Object.fromEntries(
      Object.entries(quantites).filter(([, n]) => n > 0),
    ),
    quantite_totale: total,
    couleurs_fils: couleursFils,
    dimensions_broderie_cm: { largeur: 6, hauteur: 4 },
  });

  const handleCrossSell = (id: number) => {
    window.location.href = `/configurateur/${id}`;
  };

  const copierPartage = () => {
    if (partageUrl && navigator.clipboard) {
      navigator.clipboard.writeText(partageUrl).catch(() => undefined);
    }
  };

  // ─── Rendu ────────────────────────────────────────────────────────────────

  if (loading || !config) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: tokens.fontSans,
          color: tokens.inkMuted,
        }}
      >
        Chargement du configurateur…
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 20,
        background: tokens.ground,
        minHeight: '100vh',
        fontFamily: tokens.fontSans,
        color: tokens.ink,
      }}
    >
      <style>{styleResponsive}</style>

      {erreurChargement && (
        <div
          style={{
            marginBottom: 12,
            padding: '8px 12px',
            background: tokens.warningWash,
            border: `1px solid ${tokens.warning}`,
            borderRadius: tokens.radiusSm,
            fontSize: 12,
            color: '#8E6A1F',
          }}
        >
          ℹ {erreurChargement}
        </div>
      )}

      <div className="cfg-role-dash">
        {/* En-tête */}
        <div className="cfg-role-head">
          <div
            className="cfg-role-avatar"
            style={{ background: tokens.indigo }}
            aria-hidden
          >
            ✎
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="cfg-role-title">
              Configurateur personnalisation · niveau Tostadora / Tee-shirts Express
            </div>
            <div className="cfg-role-subtitle">
              Foutas · serviettes · totebags · sélection produit + couleurs + emplacements + quantités par taille + prix dégressif + preview haute fidélité
            </div>
          </div>
          <div className="cfg-role-badge">
            Site B2B + B2C · « Créez votre fouta »
          </div>
        </div>

        {/* Fil d'ariane */}
        <div
          style={{
            padding: '10px 16px',
            background: tokens.groundSubtle,
            borderRadius: tokens.radiusMd,
            marginBottom: 12,
            fontSize: 12,
            color: tokens.inkMuted,
          }}
        >
          Accueil <span style={{ margin: '0 6px' }}>›</span> Personnalisation{' '}
          <span style={{ margin: '0 6px' }}>›</span> {config.produit}s{' '}
          <strong style={{ color: tokens.ink }}>
            {config.designation} · personnalisable
          </strong>
        </div>

        {/* ==== Layout 3 colonnes ==== */}
        <div className="cfg-3cols">
          {/* Colonne 1 : miniatures vues */}
          <div className="cfg-col-vues">
            {VUES.map((v) => {
              const actif = v.code === vueActive;
              return (
                <button
                  key={v.code}
                  type="button"
                  onClick={() => setVueActive(v.code)}
                  aria-pressed={actif}
                  aria-label={v.label}
                  style={{
                    aspectRatio: '1 / 1',
                    background:
                      v.code === 'video'
                        ? `linear-gradient(135deg, ${tokens.sageWash}, ${tokens.terracottaWash})`
                        : tokens.groundSubtle,
                    border: actif
                      ? `2px solid ${tokens.terracotta}`
                      : `1px solid ${tokens.border}`,
                    borderRadius: tokens.radiusSm,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    padding: 0,
                    position: 'relative',
                  }}
                >
                  {v.code === 'avant' && (
                    <svg viewBox="0 0 40 60" style={{ width: '60%' }}>
                      <rect x="4" y="4" width="32" height="52" fill={couleurActive?.hex_fond || '#FBF7EE'} stroke="#C7B99D" strokeWidth="0.5" />
                      <rect x="4" y="8" width="32" height="1" fill={couleurActive?.hex_rayure || '#3B4E68'} />
                      <rect x="4" y="52" width="32" height="1" fill={couleurActive?.hex_rayure || '#3B4E68'} />
                      <rect x="27" y="43" width="8" height="6" fill="none" stroke={tokens.terracotta} strokeWidth="0.4" />
                    </svg>
                  )}
                  {v.code === 'dos' && (
                    <svg viewBox="0 0 40 60" style={{ width: '60%' }}>
                      <rect x="4" y="4" width="32" height="52" fill={tokens.indigo} stroke="#2A3B54" strokeWidth="0.5" />
                      <rect x="4" y="8" width="32" height="1" fill="#FBF7EE" />
                      <rect x="4" y="52" width="32" height="1" fill="#FBF7EE" />
                    </svg>
                  )}
                  {v.code === '3d' && (
                    <div style={{ fontFamily: tokens.fontMono, fontSize: 10, fontWeight: 700, color: tokens.indigo }}>
                      3D
                    </div>
                  )}
                  {v.code === 'video' && (
                    <>
                      <div style={{ fontSize: 22 }}>▶</div>
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 2,
                          left: 0,
                          right: 0,
                          textAlign: 'center',
                          fontFamily: tokens.fontMono,
                          fontSize: 8,
                          color: tokens.inkMuted,
                        }}
                      >
                        Vidéo
                      </div>
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {/* Colonne 2 : preview grande */}
          <div className="cfg-col-preview">
            <PreviewFouta
              couleur={couleurActive}
              zone={zone}
              couleursFils={couleursFils}
              onPartager={handlePartager}
              onPleinEcran={() => {
                const el = document.documentElement;
                if (el.requestFullscreen) el.requestFullscreen();
              }}
            />
          </div>

          {/* Colonne 3 : options droite */}
          <div className="cfg-col-options">
            {/* Titre + prix */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: tokens.fontSerif, fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em' }}>
                    {config.designation}
                  </div>
                  <div style={{ fontFamily: tokens.fontMono, fontSize: 11, color: tokens.inkMuted, textTransform: 'uppercase' }}>
                    LA PLUME ARTISANALE · réf {config.ref_commercial}
                  </div>
                </div>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    background: tokens.groundSubtle,
                    border: `1px solid ${tokens.border}`,
                    borderRadius: tokens.radiusSm,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: tokens.fontSerif,
                    fontStyle: 'italic',
                    color: tokens.terracotta,
                    fontSize: 14,
                    flexShrink: 0,
                  }}
                  aria-hidden
                >
                  LP
                </div>
              </div>
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                <div style={{ fontFamily: tokens.fontSerif, fontSize: 26, fontWeight: 500, color: tokens.terracotta }}>
                  {formatMontant(prixUnitaireCourant, config.devise)}{' '}
                  <small style={{ fontSize: 14, color: tokens.ink }}>TTC</small>
                </div>
                <div style={{ fontSize: 12, color: tokens.inkMuted }}>
                  à l'unité pour{' '}
                  <strong>
                    {palierActif ? `${palierActif.quantite_min}+ pièces` : `${total} pièces`}
                  </strong>
                  {config.prix_base_ht !== undefined && (
                    <>
                      {' · '}
                      {formatMontant(config.prix_base_ht, config.devise)}
                      <sup>HT</sup>
                    </>
                  )}
                </div>
              </div>
            </div>

            <PaletteCouleurs
              couleurs={config.couleurs_disponibles}
              selectedCode={couleurCode}
              onSelect={setCouleurCode}
            />

            <QuantitesParDimension
              formats={config.formats}
              quantites={quantites}
              onChange={handleQuantite}
              moqApplicable={moqApplicable}
              total={total}
            />

            {/* Segmented pill Broderie / Sérigraphie / Rayures */}
            <div>
              <div
                style={{
                  fontFamily: tokens.fontMono,
                  fontSize: 11,
                  color: tokens.inkMuted,
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                Type de personnalisation
              </div>
              <div
                role="tablist"
                aria-label="Type de personnalisation"
                style={{
                  display: 'flex',
                  gap: 6,
                  padding: 4,
                  background: tokens.groundSubtle,
                  borderRadius: tokens.radiusFull,
                }}
              >
                {config.types_autorises.map((t) => {
                  const actif = t === typePers;
                  return (
                    <button
                      key={t}
                      type="button"
                      role="tab"
                      aria-selected={actif}
                      onClick={() => setTypePers(t)}
                      style={{
                        flex: 1,
                        padding: '8px 14px',
                        background: actif ? tokens.terracotta : 'transparent',
                        color: actif ? 'white' : tokens.inkSecondary,
                        border: 'none',
                        borderRadius: tokens.radiusFull,
                        fontSize: 12,
                        fontWeight: actif ? 600 : 400,
                        cursor: 'pointer',
                      }}
                    >
                      {libelleType(t)}
                    </button>
                  );
                })}
              </div>
            </div>

            <EmplacementsBroderie
              zonesAutorisees={config.zones_impression}
              selected={zone}
              onSelect={setZone}
              onOuvrirSurfaces={() => undefined}
            />

            <PrixDegressif
              paliers={config.paliers_prix}
              quantiteCourante={total}
              devise={config.devise}
            />

            {/* CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                type="button"
                style={{
                  padding: 14,
                  background: 'white',
                  border: `1.5px solid ${tokens.ink}`,
                  borderRadius: tokens.radiusFull,
                  fontFamily: tokens.fontSans,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: tokens.ink,
                }}
              >
                Personnaliser maintenant
              </button>
              <button
                type="button"
                disabled={!moqOk || ajoutLoading}
                onClick={handleAjouterPanier}
                style={{
                  padding: 16,
                  background: moqOk ? tokens.sage : tokens.sageSoft,
                  color: 'white',
                  border: 'none',
                  borderRadius: tokens.radiusFull,
                  fontFamily: tokens.fontSans,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: moqOk && !ajoutLoading ? 'pointer' : 'not-allowed',
                  boxShadow: moqOk ? '0 4px 12px rgba(74,108,91,0.3)' : 'none',
                  opacity: ajoutLoading ? 0.7 : 1,
                }}
              >
                🛒 {ajoutLoading ? 'Ajout en cours…' : `Ajouter au panier · ${formatMontant(montantTotalTTC, config.devise)}`}
              </button>
              {ajoutFeedback && (
                <div
                  style={{
                    fontSize: 12,
                    padding: '6px 10px',
                    background: tokens.sageWash,
                    borderRadius: tokens.radiusSm,
                    color: tokens.sage,
                    textAlign: 'center',
                  }}
                >
                  {ajoutFeedback}
                </div>
              )}
            </div>

            {/* Bandeaux réassurance */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 6,
                paddingTop: 10,
                borderTop: `1px solid ${tokens.border}`,
                fontSize: 10,
                color: tokens.inkMuted,
                textAlign: 'center',
              }}
            >
              <div>🚚 Livraison<br /><strong style={{ color: tokens.ink }}>7-12 j</strong></div>
              <div>↩ Retour<br /><strong style={{ color: tokens.ink }}>60 jours</strong></div>
              <div>✓ Made in<br /><strong style={{ color: tokens.ink }}>Tunisia</strong></div>
            </div>
          </div>
        </div>

        {/* Bandeau bas cross-sell */}
        {config.cross_sell && config.cross_sell.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div
              style={{
                fontFamily: tokens.fontMono,
                fontSize: 11,
                color: tokens.inkMuted,
                textTransform: 'uppercase',
                marginBottom: 10,
              }}
            >
              Personnalisez aussi · autres produits
            </div>
            <div className="cfg-cross-sell">
              {config.cross_sell.map((cs, i) => {
                const bgs = [
                  tokens.sageWash,
                  tokens.terracottaWash,
                  tokens.warningWash,
                  '#E8F0FA',
                  `linear-gradient(135deg, ${tokens.terracottaWash}, ${tokens.sageWash})`,
                ];
                return (
                  <button
                    key={cs.id_article}
                    type="button"
                    onClick={() => handleCrossSell(cs.id_article)}
                    style={{
                      padding: 14,
                      background: bgs[i % bgs.length],
                      border: `1px solid ${tokens.border}`,
                      borderRadius: tokens.radiusMd,
                      textAlign: 'center',
                      cursor: 'pointer',
                      fontFamily: tokens.fontSans,
                      color: tokens.ink,
                    }}
                  >
                    <div style={{ fontSize: 26 }}>{cs.icone || '🎁'}</div>
                    <div style={{ fontFamily: tokens.fontSerif, fontSize: 13, fontWeight: 500, marginTop: 4 }}>
                      {cs.label}
                    </div>
                    <div
                      style={{
                        fontFamily: tokens.fontMono,
                        fontSize: 10,
                        color: tokens.inkMuted,
                        marginTop: 2,
                      }}
                    >
                      MOQ {cs.moq}
                      {cs.prix_ht_depart > 0
                        ? ` · dès ${formatMontant(cs.prix_ht_depart, config.devise)}HT`
                        : ' · sur mesure'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal partage */}
      {partageOuvert && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="titre-partage"
          onClick={() => setPartageOuvert(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(28,25,23,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: tokens.radiusMd,
              padding: 24,
              maxWidth: 460,
              width: '100%',
              boxShadow: tokens.shadowMd,
              fontFamily: tokens.fontSans,
            }}
          >
            <div
              id="titre-partage"
              style={{
                fontFamily: tokens.fontSerif,
                fontSize: 20,
                fontWeight: 500,
                marginBottom: 8,
              }}
            >
              📤 Partager mon design
            </div>
            {partageLoading && (
              <div style={{ padding: '20px 0', color: tokens.inkMuted }}>
                Génération de l'URL courte…
              </div>
            )}
            {!partageLoading && partageUrl && (
              <>
                <div style={{ fontSize: 12, color: tokens.inkMuted, marginBottom: 8 }}>
                  Copiez ce lien et envoyez-le sur WhatsApp / Instagram — l'aperçu
                  haute résolution y sera embarqué.
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: 6,
                    padding: 8,
                    background: tokens.groundSubtle,
                    borderRadius: tokens.radiusSm,
                    marginBottom: 8,
                  }}
                >
                  <input
                    readOnly
                    value={partageUrl}
                    style={{
                      flex: 1,
                      border: 'none',
                      background: 'transparent',
                      fontFamily: tokens.fontMono,
                      fontSize: 12,
                      color: tokens.ink,
                      outline: 'none',
                      minWidth: 0,
                    }}
                  />
                  <button
                    type="button"
                    onClick={copierPartage}
                    style={{
                      padding: '6px 12px',
                      background: tokens.terracotta,
                      color: 'white',
                      border: 'none',
                      borderRadius: tokens.radiusSm,
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    Copier
                  </button>
                </div>
              </>
            )}
            {partageErreur && (
              <div
                style={{
                  fontSize: 12,
                  color: '#8E6A1F',
                  background: tokens.warningWash,
                  padding: 8,
                  borderRadius: tokens.radiusSm,
                  marginBottom: 8,
                }}
              >
                ⚠ {partageErreur}
              </div>
            )}
            <div style={{ textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setPartageOuvert(false)}
                style={{
                  padding: '8px 14px',
                  background: tokens.ink,
                  color: 'white',
                  border: 'none',
                  borderRadius: tokens.radiusFull,
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Helpers ───────────────────────────────────────────────────────────────

function libelleType(t: TypePersonnalisation): string {
  switch (t) {
    case 'broderie':                 return '✎ Broderie';
    case 'serigraphie':              return '🖨 Sérigraphie';
    case 'rayures_personnalisees':   return '🎨 Rayures';
    case 'couleurs_personnalisees':  return '🎨 Couleurs';
    case 'dimensions_custom':        return '📐 Custom';
    case 'pack_compose':             return '🎁 Pack';
    default:                         return t;
  }
}

function formatMontant(n: number, devise: 'EUR' | 'TND'): string {
  const symbole = devise === 'EUR' ? '€' : 'DT';
  return `${n.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${symbole}`;
}

// ─── Styles responsive ─────────────────────────────────────────────────────

const styleResponsive = `
  .cfg-role-dash {
    background: ${tokens.groundElevated};
    border: 1px solid ${tokens.border};
    border-radius: ${tokens.radiusMd};
    padding: 16px;
  }
  .cfg-role-head {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
    flex-wrap: wrap;
  }
  .cfg-role-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
  }
  .cfg-role-title {
    font-family: ${tokens.fontSerif};
    font-size: 18px;
    font-weight: 500;
    color: ${tokens.ink};
  }
  .cfg-role-subtitle {
    font-size: 12px;
    color: ${tokens.inkMuted};
    margin-top: 2px;
  }
  .cfg-role-badge {
    font-family: ${tokens.fontMono};
    font-size: 10px;
    padding: 6px 10px;
    background: ${tokens.groundSubtle};
    border-radius: ${tokens.radiusFull};
    color: ${tokens.inkSecondary};
    white-space: nowrap;
  }
  .cfg-3cols {
    display: grid;
    grid-template-columns: 80px 1.4fr 1.1fr;
    gap: 14px;
  }
  .cfg-col-vues {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .cfg-col-preview { min-width: 0; }
  .cfg-col-options {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
  }
  .cfg-cross-sell {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
  }
  @media (max-width: 900px) {
    .cfg-3cols {
      grid-template-columns: 1fr;
    }
    .cfg-col-vues {
      flex-direction: row;
      overflow-x: auto;
    }
    .cfg-col-vues > button {
      width: 80px;
      flex-shrink: 0;
    }
    .cfg-cross-sell {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (max-width: 500px) {
    .cfg-cross-sell {
      grid-template-columns: 1fr;
    }
  }
`;

export default ConfigurateurPersonnalisation;
