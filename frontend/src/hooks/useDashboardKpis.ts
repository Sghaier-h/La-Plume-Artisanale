import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/api';

export interface DashboardKpis {
  clients: {
    total_actifs: string;
    clients: string;
    prospects: string;
  };
  commandes: {
    total: string;
    en_attente: string;
    validees: string;
    livrees: string;
    ca_30j: string;
  };
  devis: {
    total: string;
    brouillons: string;
    transformes: string;
    montant_30j: string;
  };
  factures: {
    total: string;
    brouillons: string;
    payees: string;
    ca_total: string;
    montant_regle: string;
    montant_restant: string;
  };
  ordres_fabrication: {
    total: string;
    planifies: string;
    en_cours: string;
    termines: string;
  };
  machines: {
    total_actives: string;
    operationnelles: string;
    maintenance: string;
  };
  timestamp: string;
}

interface UseDashboardKpisResult {
  kpis: DashboardKpis | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook pour charger les KPIs du dashboard depuis l'API
 *
 * @param autoRefreshInterval Intervalle en ms pour rafraîchissement auto (0 = désactivé)
 */
export function useDashboardKpis(autoRefreshInterval = 0): UseDashboardKpisResult {
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKpis = useCallback(async () => {
    try {
      setError(null);
      const response = await dashboardService.getKpisAdmin();
      const data = response.data?.data || response.data;
      setKpis(data);
    } catch (err: any) {
      console.error('[useDashboardKpis] Erreur chargement KPIs:', err);
      setError(err?.response?.data?.error?.message || err?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKpis();

    if (autoRefreshInterval > 0) {
      const interval = setInterval(fetchKpis, autoRefreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchKpis, autoRefreshInterval]);

  return { kpis, loading, error, refresh: fetchKpis };
}
