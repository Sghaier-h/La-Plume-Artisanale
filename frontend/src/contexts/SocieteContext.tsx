/**
 * SocieteContext (§14quater.1 · Phase E1)
 *
 * Fournit la société active côté UI (sélecteur UserBar) et pose un
 * intercepteur axios qui ajoute `x-societe-id` à toutes les requêtes.
 *
 * Clés de persistance :
 *   localStorage.laplume_societe_active   → société courante (objet Societe)
 *   localStorage.laplume_societe_consolide → '1' si vue consolidée (admin)
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import api from '../services/api';

export interface Societe {
  id_societe: number;
  code_societe: string;
  raison_sociale: string;
  nom_commercial?: string;
  logo_url?: string;
  type_societe?: string;
  est_consolidation?: boolean;
  actif?: boolean;
}

interface SocieteContextValue {
  societe: Societe | null;
  societes: Societe[];
  isConsolide: boolean;
  loading: boolean;
  error: string | null;
  /** Change société courante. Si null → vue consolidée (admin). */
  setSociete: (next: Societe | null) => void;
  setConsolide: (on: boolean) => void;
  reloadSocietes: () => Promise<void>;
}

const LS_KEY_SOCIETE = 'laplume_societe_active';
const LS_KEY_CONSOLIDE = 'laplume_societe_consolide';

const SocieteContext = createContext<SocieteContextValue | undefined>(undefined);

export function useSociete(): SocieteContextValue {
  const ctx = useContext(SocieteContext);
  if (!ctx) {
    throw new Error('useSociete() doit être utilisé dans <SocieteProvider>');
  }
  return ctx;
}

function readFromLS(): { societe: Societe | null; isConsolide: boolean } {
  try {
    const raw = localStorage.getItem(LS_KEY_SOCIETE);
    const consolide = localStorage.getItem(LS_KEY_CONSOLIDE) === '1';
    const societe = raw ? (JSON.parse(raw) as Societe) : null;
    return { societe, isConsolide: consolide };
  } catch {
    return { societe: null, isConsolide: false };
  }
}

interface SocieteProviderProps {
  children: ReactNode;
}

export const SocieteProvider: React.FC<SocieteProviderProps> = ({ children }) => {
  const init = readFromLS();
  const [societe, setSocieteState] = useState<Societe | null>(init.societe);
  const [isConsolide, setIsConsolideState] = useState<boolean>(init.isConsolide);
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Intercepteur axios : injecte `x-societe-id` sur toutes les requêtes
  useEffect(() => {
    const id = api.interceptors.request.use((config) => {
      try {
        const h: any = config.headers || {};
        const val = isConsolide
          ? 'ALL'
          : societe?.id_societe
            ? String(societe.id_societe)
            : null;
        if (val !== null) {
          if (typeof h.set === 'function') h.set('x-societe-id', val);
          else h['x-societe-id'] = val;
        }
      } catch {
        // headers peut être figé selon la version d'axios : no-op
      }
      return config;
    });
    return () => {
      api.interceptors.request.eject(id);
    };
  }, [societe, isConsolide]);

  const setSocieteStatePersist = useCallback((next: Societe | null, consolide: boolean) => {
    setSocieteState(next);
    setIsConsolideState(consolide);
    try {
      if (next) localStorage.setItem(LS_KEY_SOCIETE, JSON.stringify(next));
      else localStorage.removeItem(LS_KEY_SOCIETE);
      if (consolide) localStorage.setItem(LS_KEY_CONSOLIDE, '1');
      else localStorage.removeItem(LS_KEY_CONSOLIDE);
    } catch {
      /* storage indisponible : no-op */
    }
  }, []);

  const reloadSocietes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/v2/societes');
      const list: Societe[] = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data?.data?.rows)
          ? res.data.data.rows
          : [];
      setSocietes(list);

      // Résolution de la société active : si non définie ou plus présente,
      // on prend la première disponible.
      if (!isConsolide) {
        const current = societe;
        const stillThere =
          current && list.some((s) => s.id_societe === current.id_societe);
        if (!stillThere && list.length > 0) {
          const first = list.find((s) => !s.est_consolidation) || list[0];
          setSocieteStatePersist(first, false);
        }
      }
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || e?.message || 'Erreur chargement sociétés');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setSocieteStatePersist]);

  useEffect(() => {
    // Chargement initial : uniquement si l'utilisateur a un token
    // (le backend v2 exige un auth).
    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
      reloadSocietes();
    }
  }, [reloadSocietes]);

  const setSociete = useCallback(
    (next: Societe | null) => {
      // Appeler le backend pour mettre à jour `societe_courante` + token raf
      if (next?.id_societe) {
        api
          .post(`/v2/societes/${next.id_societe}/basculer`)
          .then((res) => {
            const token = res?.data?.data?.token;
            if (token) {
              try { localStorage.setItem('token', token); } catch { /* no-op */ }
            }
          })
          .catch(() => {
            /* L'erreur est non bloquante : on garde la bascule locale */
          });
      }
      setSocieteStatePersist(next, false);
    },
    [setSocieteStatePersist]
  );

  const setConsolide = useCallback(
    (on: boolean) => {
      // Mode consolidé : societe = null, header = ALL
      setSocieteStatePersist(on ? null : societe, on);
    },
    [setSocieteStatePersist, societe]
  );

  const value = useMemo<SocieteContextValue>(
    () => ({
      societe,
      societes,
      isConsolide,
      loading,
      error,
      setSociete,
      setConsolide,
      reloadSocietes,
    }),
    [societe, societes, isConsolide, loading, error, setSociete, setConsolide, reloadSocietes]
  );

  return <SocieteContext.Provider value={value}>{children}</SocieteContext.Provider>;
};

export default SocieteContext;
