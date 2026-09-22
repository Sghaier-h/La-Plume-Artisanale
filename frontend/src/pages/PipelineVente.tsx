import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface Stage {
  id: number;
  name: string;
  ordre?: number;
  probabilite?: number;
}

interface Opportunity {
  id?: number;
  id_opportunite?: number;
  nom: string;
  client_nom?: string;
  id_client?: number | null;
  montant_prevue?: number | string | null;
  probabilite?: number | string | null;
  statut?: string;
  date_fermeture_prevue?: string | null;
}

const STAGE_STATUT_MAP: Record<string, string[]> = {
  Nouveau: ['nouveau'],
  Qualifié: ['qualification', 'qualifie', 'qualifié'],
  Proposition: ['proposition'],
  Négociation: ['negociation', 'négociation'],
  Gagné: ['gagne', 'gagné', 'gagnee'],
  Perdu: ['perdu'],
};

const normalizeList = (res: any): any[] => {
  const _r = res?.data?.data;
  if (Array.isArray(_r)) return _r;
  if (_r?.data && Array.isArray(_r.data)) return _r.data;
  if (Array.isArray(res?.data)) return res.data;
  return [];
};

const toNum = (v: any): number => {
  const n = typeof v === 'number' ? v : parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

const PipelineVente: React.FC = () => {
  const [stages, setStages] = useState<Stage[]>([]);
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [stagesRes, oppsRes] = await Promise.all([
          api.get('/crm/stages').catch(() => ({ data: { data: [] } })),
          api.get('/crm/opportunites').catch(() => ({ data: { data: [] } })),
        ]);
        setStages(normalizeList(stagesRes) as Stage[]);
        setOpps(normalizeList(oppsRes) as Opportunity[]);
      } catch (e: any) {
        setError(e?.message || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const displayedStages: Stage[] = stages.length
    ? stages
    : [
        { id: 1, name: 'Nouveau' },
        { id: 2, name: 'Qualifié' },
        { id: 3, name: 'Proposition' },
        { id: 4, name: 'Négociation' },
        { id: 5, name: 'Gagné' },
        { id: 6, name: 'Perdu' },
      ];

  const oppsByStage = (stageName: string): Opportunity[] => {
    const keys = STAGE_STATUT_MAP[stageName] || [stageName.toLowerCase()];
    return opps.filter((o) => keys.includes((o.statut || '').toLowerCase()));
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Pipeline de Vente</h1>
        <p className="text-sm text-slate-500">Vue kanban des opportunités par étape</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {opps.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500">Aucune opportunité à afficher.</p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {displayedStages.map((stage) => {
            const stageOpps = oppsByStage(stage.name);
            const total = stageOpps.reduce((s, o) => s + toNum(o.montant_prevue), 0);
            return (
              <div
                key={stage.id}
                className="flex-shrink-0 w-72 bg-slate-50 rounded-xl border border-slate-200"
              >
                <div className="px-4 py-3 border-b border-slate-200 bg-white rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800">{stage.name}</h3>
                    <span className="text-xs font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                      {stageOpps.length}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{total.toFixed(2)} TND</p>
                </div>
                <div className="p-2 space-y-2 max-h-[70vh] overflow-y-auto">
                  {stageOpps.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">Vide</p>
                  ) : (
                    stageOpps.map((o) => (
                      <div
                        key={o.id ?? o.id_opportunite}
                        className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <p className="font-medium text-sm text-slate-800 truncate">{o.nom}</p>
                        {o.client_nom && (
                          <p className="text-xs text-slate-500 truncate">{o.client_nom}</p>
                        )}
                        <div className="flex items-center justify-between mt-2 text-xs">
                          <span className="font-semibold text-emerald-700">
                            {toNum(o.montant_prevue).toFixed(2)} TND
                          </span>
                          <span className="text-slate-500">
                            {toNum(o.probabilite).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PipelineVente;
