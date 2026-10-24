/**
 * IconsLaPlume — icônes métier textile tunisien
 * Phase F4 — design artisanal
 *
 * Jeu d'icônes SVG inline personnalisées pour les concepts métier
 * de l'ERP La Plume Artisanale (tissage, finition, logistique).
 *
 * Convention :
 *   - viewBox 24×24
 *   - stroke-width 1.5
 *   - stroke="currentColor" → hérite du theme (fg-primary / accent)
 *   - fill="none" sauf détails ponctuels
 *
 * Usage :
 *   <IconFouta size={18} />
 *   <IconFouta size={24} style={{ color: 'var(--accent-terracotta)' }} />
 */
import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  title?: string;
}

const base = (props: IconProps): React.SVGProps<SVGSVGElement> => {
  const { size = 24, title, ...rest } = props;
  return {
    xmlns: 'http://www.w3.org/2000/svg',
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': title ? undefined : true,
    role: title ? 'img' : undefined,
    ...rest,
  } as React.SVGProps<SVGSVGElement>;
};

/* ============================================================== */
/*  FOUTA — silhouette rectangulaire + franges                     */
/* ============================================================== */
export const IconFouta: React.FC<IconProps> = (props) => (
  <svg {...base(props)}>
    {props.title ? <title>{props.title}</title> : null}
    {/* Corps du tissu */}
    <rect x="3.5" y="5" width="17" height="12" rx="0.8" />
    {/* Rayures caractéristiques fouta */}
    <path d="M3.5 9h17" strokeOpacity="0.55" />
    <path d="M3.5 12h17" strokeOpacity="0.4" />
    <path d="M3.5 15h17" strokeOpacity="0.55" />
    {/* Franges inférieures */}
    <path d="M5 17v3M7 17v3M9 17v3M11 17v3M13 17v3M15 17v3M17 17v3M19 17v3" />
  </svg>
);

/* ============================================================== */
/*  MÉTIER À TISSER — bâti + ensouple + navette                    */
/* ============================================================== */
export const IconMetierATisser: React.FC<IconProps> = (props) => (
  <svg {...base(props)}>
    {props.title ? <title>{props.title}</title> : null}
    {/* Montants verticaux */}
    <path d="M4 3v18M20 3v18" />
    {/* Barres horizontales du bâti */}
    <path d="M4 5h16M4 19h16" />
    {/* Fils de chaîne tendus (verticaux centraux) */}
    <path d="M8 5v14M12 5v14M16 5v14" strokeOpacity="0.55" />
    {/* Navette au centre */}
    <path d="M6 11.5c2 -1 10 -1 12 0c-2 1 -10 1 -12 0z" />
  </svg>
);

/* ============================================================== */
/*  CHAÎNE — fils verticaux tendus                                 */
/* ============================================================== */
export const IconChaine: React.FC<IconProps> = (props) => (
  <svg {...base(props)}>
    {props.title ? <title>{props.title}</title> : null}
    <path d="M4 4h16" strokeOpacity="0.4" />
    <path d="M4 20h16" strokeOpacity="0.4" />
    <path d="M6 4v16M9 4v16M12 4v16M15 4v16M18 4v16" />
  </svg>
);

/* ============================================================== */
/*  TRAME — fils horizontaux                                       */
/* ============================================================== */
export const IconTrame: React.FC<IconProps> = (props) => (
  <svg {...base(props)}>
    {props.title ? <title>{props.title}</title> : null}
    <path d="M4 4v16" strokeOpacity="0.4" />
    <path d="M20 4v16" strokeOpacity="0.4" />
    <path d="M4 6h16M4 9h16M4 12h16M4 15h16M4 18h16" />
  </svg>
);

/* ============================================================== */
/*  OURDISSAGE — bobines alignées + fils vers l'ensouple           */
/* ============================================================== */
export const IconOurdissage: React.FC<IconProps> = (props) => (
  <svg {...base(props)}>
    {props.title ? <title>{props.title}</title> : null}
    {/* Trois bobines */}
    <ellipse cx="5" cy="7" rx="1.8" ry="2.4" />
    <ellipse cx="5" cy="14" rx="1.8" ry="2.4" />
    <ellipse cx="5" cy="20" rx="1.8" ry="1.6" />
    {/* Fils convergeants vers l'ensouple à droite */}
    <path d="M6.5 7l6 4M6.5 14l6 -2M6.5 20l6 -7" strokeOpacity="0.6" />
    {/* Ensouple (cylindre vertical) */}
    <path d="M14 4v16" strokeWidth="2" />
    <path d="M17 4v16" strokeWidth="2" strokeOpacity="0.55" />
  </svg>
);

/* ============================================================== */
/*  FRANGE — fils libres tombants                                  */
/* ============================================================== */
export const IconFrange: React.FC<IconProps> = (props) => (
  <svg {...base(props)}>
    {props.title ? <title>{props.title}</title> : null}
    {/* Bande de tissu haute */}
    <path d="M3 6h18" strokeWidth="2" />
    {/* Franges torsadées (lignes légèrement ondulées) */}
    <path d="M5 7c0 2 -0.5 3 0 5s0.5 3 0 5" />
    <path d="M8 7c0 2 0.5 3 0 5s-0.5 3 0 5" />
    <path d="M11 7c0 2 -0.5 3 0 5s0.5 3 0 5" />
    <path d="M14 7c0 2 0.5 3 0 5s-0.5 3 0 5" />
    <path d="M17 7c0 2 -0.5 3 0 5s0.5 3 0 5" />
    <path d="M19.5 7c0 2 0.4 3 0 5s-0.4 3 0 5" />
  </svg>
);

/* ============================================================== */
/*  NAVETTE — forme ogive/œuf allongé avec canette au centre       */
/* ============================================================== */
export const IconNavette: React.FC<IconProps> = (props) => (
  <svg {...base(props)}>
    {props.title ? <title>{props.title}</title> : null}
    {/* Corps en amande horizontal */}
    <path d="M3 12c3 -4 15 -4 18 0c-3 4 -15 4 -18 0z" />
    {/* Canette (petit cylindre central) */}
    <path d="M10 10.5v3M14 10.5v3" />
    <ellipse cx="12" cy="12" rx="2.6" ry="1" strokeOpacity="0.6" />
    {/* Fils sortants aux extrémités */}
    <path d="M3 12l-1 -1M3 12l-1 1" strokeOpacity="0.5" />
    <path d="M21 12l1 -1M21 12l1 1" strokeOpacity="0.5" />
  </svg>
);

/* ============================================================== */
/*  BOBINE — cylindre avec flasques + enroulement                  */
/* ============================================================== */
export const IconBobine: React.FC<IconProps> = (props) => (
  <svg {...base(props)}>
    {props.title ? <title>{props.title}</title> : null}
    {/* Flasques */}
    <path d="M6 4h12M6 20h12" strokeWidth="2" />
    {/* Tube central */}
    <path d="M8 4v16M16 4v16" />
    {/* Enroulement du fil (hachures) */}
    <path d="M8 7l8 1.5M8 10l8 1.5M8 13l8 1.5M8 16l8 1.5" strokeOpacity="0.55" />
  </svg>
);

/* ============================================================== */
/*  DÉCOUPE — ciseaux croisés (post-coupe fouta)                   */
/* ============================================================== */
export const IconDecoupe: React.FC<IconProps> = (props) => (
  <svg {...base(props)}>
    {props.title ? <title>{props.title}</title> : null}
    {/* Anneaux */}
    <circle cx="6" cy="7" r="2.2" />
    <circle cx="6" cy="17" r="2.2" />
    {/* Lames croisées */}
    <path d="M8 8.5l12 7" />
    <path d="M8 15.5l12 -7" />
    {/* Rivet central */}
    <circle cx="13.5" cy="12" r="0.6" fill="currentColor" stroke="none" />
  </svg>
);

/* ============================================================== */
/*  ÉTIQUETTE — tag avec œillet et ficelle                         */
/* ============================================================== */
export const IconEtiquette: React.FC<IconProps> = (props) => (
  <svg {...base(props)}>
    {props.title ? <title>{props.title}</title> : null}
    {/* Corps de l'étiquette */}
    <path d="M4 4h10l6 6v10H4z" />
    {/* Pli du coin */}
    <path d="M14 4v6h6" strokeOpacity="0.6" />
    {/* Œillet */}
    <circle cx="7.5" cy="7.5" r="1" />
    {/* Lignes de texte */}
    <path d="M11 13h6M11 16h5" strokeOpacity="0.5" />
  </svg>
);

/* ============================================================== */
/*  COLIS — paquet artisanal ficelé (pas un carton générique)      */
/* ============================================================== */
export const IconColis: React.FC<IconProps> = (props) => (
  <svg {...base(props)}>
    {props.title ? <title>{props.title}</title> : null}
    {/* Corps du paquet (toile/kraft légèrement bombé) */}
    <path d="M4 8c0 -0.5 0.5 -1 1 -1h14c0.5 0 1 0.5 1 1v11c0 0.5 -0.5 1 -1 1H5c-0.5 0 -1 -0.5 -1 -1z" />
    {/* Ficelle verticale */}
    <path d="M12 7v13" strokeWidth="1.6" />
    {/* Ficelle horizontale */}
    <path d="M4 13h16" strokeWidth="1.6" strokeOpacity="0.75" />
    {/* Nœud papillon au centre */}
    <path d="M10 5l2 2l2 -2l-1 3h-2z" />
    {/* Petites boucles du nœud */}
    <path d="M10 5c -1 -0.5 -1 1 0 0.5M14 5c 1 -0.5 1 1 0 0.5" strokeOpacity="0.65" />
  </svg>
);

/* ============================================================== */
/*  NOUAGE — fil avec nœud central (sous-traitance nouage)         */
/* ============================================================== */
export const IconNouage: React.FC<IconProps> = (props) => (
  <svg {...base(props)}>
    {props.title ? <title>{props.title}</title> : null}
    {/* Deux fils entrant en boucle */}
    <path d="M3 7c3 0 5 2 5 5s-2 5 -5 5" />
    <path d="M21 7c-3 0 -5 2 -5 5s2 5 5 5" />
    {/* Nœud central (ovale croisé) */}
    <ellipse cx="12" cy="12" rx="3.2" ry="2.2" />
    <path d="M9.5 10.5l5 3M9.5 13.5l5 -3" strokeOpacity="0.65" />
  </svg>
);

export default {
  IconFouta,
  IconMetierATisser,
  IconChaine,
  IconTrame,
  IconOurdissage,
  IconFrange,
  IconNavette,
  IconBobine,
  IconDecoupe,
  IconEtiquette,
  IconColis,
  IconNouage,
};
