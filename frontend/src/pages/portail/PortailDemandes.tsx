import React, { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import PortailLayout from './PortailLayout';
import { portailData } from '../../services/portailApi';

const fmtDate = (d: any) => d ? new Date(d).toLocaleString('fr-FR') : '—';

const badge: Record<string, string> = {
  nouvelle: 'bg-blue-100 text-blue-800',
  en_cours: 'bg-amber-100 text-amber-800',
  resolue: 'bg-emerald-100 text-emerald-800',
  fermee: 'bg-stone-200 text-stone-700'
};

const PortailDemandes: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [commandes, setCommandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type_demande: 'question', sujet: '', message: '', id_commande: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [d, c] = await Promise.all([portailData.demandes(), portailData.commandes()]);
      setItems(d.data.data?.demandes || d.data.demandes || []);
      setCommandes(c.data.data?.commandes || c.data.commandes || []);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await portailData.createDemande({
        type_demande: form.type_demande, sujet: form.sujet, message: form.message,
        id_commande: form.id_commande || undefined
      });
      setOpen(false);
      setForm({ type_demande: 'question', sujet: '', message: '', id_commande: '' });
      await load();
    } catch (e: any) { alert(e?.response?.data?.error?.message || 'Erreur'); }
  };

  return (
    <PortailLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="font-serif text-2xl text-stone-800">Mes demandes</h1>
          <button onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg shadow">
            <Plus className="w-4 h-4" /> Nouvelle demande
          </button>
        </div>

        <div className="space-y-3">
          {loading ? <div className="text-stone-500">Chargement…</div> :
            items.length === 0 ? <div className="bg-white p-6 rounded-xl border border-amber-200 text-stone-500 text-center">Aucune demande</div> :
            items.map(d => (
              <div key={d.id_demande} className="bg-white rounded-xl border border-amber-200 shadow-sm p-4">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-stone-800">{d.sujet || `Demande #${d.id_demande}`}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${badge[d.statut] || 'bg-stone-100'}`}>{d.statut}</span>
                      <span className="text-xs text-stone-500 uppercase">{d.type_demande}</span>
                    </div>
                    <div className="text-xs text-stone-500 mt-1">Envoyée le {fmtDate(d.date_demande)}</div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-stone-700 whitespace-pre-wrap">{d.message}</p>
                {d.reponse && (
                  <div className="mt-3 pl-4 border-l-4 border-emerald-400 bg-emerald-50 rounded p-3">
                    <div className="text-xs text-emerald-700 mb-1">Réponse — {fmtDate(d.date_reponse)}</div>
                    <div className="text-sm text-stone-800 whitespace-pre-wrap">{d.reponse}</div>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form onSubmit={submit} className="bg-white rounded-2xl shadow-xl border border-amber-200 max-w-lg w-full p-6 space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="font-serif text-xl text-stone-800">Nouvelle demande</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-stone-400 hover:text-stone-600"><X className="w-5 h-5" /></button>
            </div>
            <div>
              <label className="text-sm text-stone-600">Type</label>
              <select value={form.type_demande} onChange={e => setForm({ ...form, type_demande: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg">
                <option value="question">Question</option>
                <option value="reclamation">Réclamation</option>
                <option value="devis">Demande de devis</option>
                <option value="commande">Question commande</option>
                <option value="retour">Retour produit</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-stone-600">Sujet</label>
              <input value={form.sujet} onChange={e => setForm({ ...form, sujet: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg" required />
            </div>
            <div>
              <label className="text-sm text-stone-600">Commande liée (optionnel)</label>
              <select value={form.id_commande} onChange={e => setForm({ ...form, id_commande: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg">
                <option value="">Aucune</option>
                {commandes.map(c => <option key={c.id_commande} value={c.id_commande}>{c.numero_commande || `CMD-${c.id_commande}`}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-stone-600">Message</label>
              <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                rows={5} className="w-full px-3 py-2 border border-stone-300 rounded-lg" required />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg text-stone-600 hover:bg-stone-100">Annuler</button>
              <button type="submit" className="px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white">Envoyer</button>
            </div>
          </form>
        </div>
      )}
    </PortailLayout>
  );
};

export default PortailDemandes;
