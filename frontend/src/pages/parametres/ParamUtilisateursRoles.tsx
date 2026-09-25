import React, { useEffect, useState } from 'react';
import { Users, Shield, Plus, Trash2, Pencil, X, Key, Check } from 'lucide-react';
import api from '../../services/api';

// §15 — Paramètres Utilisateurs & Rôles (§2.4 + §2bis.8 ABAC)

interface Utilisateur {
  id: number;
  email: string;
  nom: string;
  role: string;
  actif: boolean;
  derniere_connexion: string | null;
  permissions_speciales: string[];
}

interface Role {
  code: string;
  libelle: string;
  description: string;
  nb_permissions: number;
}

interface Permission {
  code: string;
  libelle: string;
  domaine: string;
  actions: string[];
}

const ROLES: Role[] = [
  { code: 'ADMIN', libelle: 'Administrateur système', description: 'Accès complet toutes fonctionnalités', nb_permissions: 78 },
  { code: 'DG', libelle: 'Direction générale', description: 'Vision globale + décisions stratégiques', nb_permissions: 72 },
  { code: 'DAF', libelle: 'Directeur financier', description: 'Comptabilité, trésorerie, budgets', nb_permissions: 58 },
  { code: 'RESP_COMM', libelle: 'Responsable commercial', description: 'CRM, ventes, forecasts', nb_permissions: 42 },
  { code: 'COMMERCIAL', libelle: 'Commercial', description: 'Portefeuille client, devis, commandes', nb_permissions: 28 },
  { code: 'RESP_PROD', libelle: 'Responsable production', description: 'OF, planification, qualité', nb_permissions: 48 },
  { code: 'CHEF_ATELIER', libelle: 'Chef d\'atelier', description: 'Supervision atelier + équipes', nb_permissions: 38 },
  { code: 'TISSEUR', libelle: 'Tisseur', description: 'Tablette tissage', nb_permissions: 12 },
  { code: 'COUPEUR', libelle: 'Coupeur', description: 'Tablette coupe', nb_permissions: 12 },
  { code: 'CTRL_QUAL', libelle: 'Contrôleur qualité', description: 'Contrôles 4-points, retours', nb_permissions: 18 },
  { code: 'MAGASINIER_MP', libelle: 'Magasinier MP', description: 'Réception MP + stock', nb_permissions: 22 },
  { code: 'MAGASINIER_PF', libelle: 'Magasinier PF', description: 'Expéditions + stock PF', nb_permissions: 22 },
  { code: 'ACHETEUR', libelle: 'Acheteur', description: 'Achats, fournisseurs', nb_permissions: 26 },
  { code: 'COMPTABLE', libelle: 'Comptable', description: 'Saisie compta + rapprochements', nb_permissions: 34 },
  { code: 'RH', libelle: 'Ressources humaines', description: 'Paie, contrats, formations', nb_permissions: 30 },
  { code: 'MAINTENANCE', libelle: 'Maintenance', description: 'Suivi machines + interventions', nb_permissions: 16 },
  { code: 'CLIENT_B2B', libelle: 'Client B2B (portail)', description: 'Portail client B2B lecture seule', nb_permissions: 8 },
  { code: 'FOURNISSEUR', libelle: 'Fournisseur (portail)', description: 'Portail fournisseur — commandes', nb_permissions: 6 },
];

const PERMISSIONS_ABAC: Permission[] = [
  { code: 'articles', libelle: 'Articles catalogue', domaine: 'Catalogue', actions: ['read', 'create', 'update', 'delete'] },
  { code: 'clients', libelle: 'Fiches clients', domaine: 'CRM', actions: ['read', 'create', 'update', 'delete', 'export'] },
  { code: 'commandes', libelle: 'Commandes', domaine: 'Ventes', actions: ['read', 'create', 'update', 'validate', 'cancel'] },
  { code: 'factures', libelle: 'Factures', domaine: 'Comptabilité', actions: ['read', 'create', 'validate', 'send'] },
  { code: 'of', libelle: 'Ordres fabrication', domaine: 'Production', actions: ['read', 'create', 'update', 'validate', 'close'] },
  { code: 'paie', libelle: 'Bulletins paie', domaine: 'RH', actions: ['read', 'generate', 'validate'] },
  { code: 'stock', libelle: 'Stock', domaine: 'Stock', actions: ['read', 'adjust', 'inventory'] },
];

const MOCK_USERS: Utilisateur[] = [
  { id: 1, email: 'h.sghaier@laplumeartisanale.tn', nom: 'Hedi Sghaier', role: 'ADMIN', actif: true, derniere_connexion: new Date(Date.now() - 3600_000).toISOString(), permissions_speciales: [] },
  { id: 2, email: 'f.bensalah@laplumeartisanale.tn', nom: 'Fatma Ben Salah', role: 'COMPTABLE', actif: true, derniere_connexion: new Date(Date.now() - 3600_000 * 3).toISOString(), permissions_speciales: ['clients.export'] },
  { id: 3, email: 'a.karray@laplumeartisanale.tn', nom: 'Ahmed Karray', role: 'RESP_COMM', actif: true, derniere_connexion: new Date(Date.now() - 3600_000 * 2).toISOString(), permissions_speciales: [] },
  { id: 4, email: 'i.jelassi@laplumeartisanale.tn', nom: 'Ines Jelassi', role: 'RESP_PROD', actif: true, derniere_connexion: new Date(Date.now() - 3600_000 * 5).toISOString(), permissions_speciales: [] },
  { id: 5, email: 'm.ferjani@laplumeartisanale.tn', nom: 'Mohamed Ferjani', role: 'CTRL_QUAL', actif: true, derniere_connexion: new Date(Date.now() - 86400_000).toISOString(), permissions_speciales: [] },
  { id: 6, email: 'n.bouazizi@laplumeartisanale.tn', nom: 'Nadia Bouazizi', role: 'RH', actif: true, derniere_connexion: new Date(Date.now() - 3600_000 * 4).toISOString(), permissions_speciales: [] },
  { id: 7, email: 'anis.tisseur@laplumeartisanale.tn', nom: 'Anis Trabelsi', role: 'TISSEUR', actif: true, derniere_connexion: new Date(Date.now() - 3600_000 * 6).toISOString(), permissions_speciales: [] },
  { id: 8, email: 'old.user@laplumeartisanale.tn', nom: 'Compte désactivé', role: 'COMMERCIAL', actif: false, derniere_connexion: new Date(Date.now() - 86400_000 * 90).toISOString(), permissions_speciales: [] },
];

const ParamUtilisateursRoles: React.FC = () => {
  const [users, setUsers] = useState<Utilisateur[]>(MOCK_USERS);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'users' | 'roles' | 'permissions'>('users');
  const [editing, setEditing] = useState<Utilisateur | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const r = await Promise.allSettled([api.get('/api/v2/parametres/utilisateurs')]);
      if (cancelled) return;
      const pick = <T,>(res: PromiseSettledResult<any>, fb: T[]): T[] => {
        if (res.status !== 'fulfilled') return fb;
        const d = res.value?.data?.data ?? res.value?.data;
        return Array.isArray(d) ? d : fb;
      };
      setUsers(pick(r[0], MOCK_USERS));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const saveUser = () => {
    if (!editing) return;
    if (editing.id === 0) {
      setUsers([...users, { ...editing, id: Date.now() }]);
    } else {
      setUsers(users.map(u => u.id === editing.id ? editing : u));
    }
    setEditing(null);
  };

  if (loading) {
    return (
      <div className="ml-72 p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8663D]" />
      </div>
    );
  }

  const inputStyle: React.CSSProperties = { borderColor: '#E8DCC8', backgroundColor: 'var(--bg-app, #FBF8F3)' };
  const h2Style: React.CSSProperties = { fontFamily: 'var(--font-serif, Fraunces, serif)', fontWeight: 500, color: 'var(--fg-primary, #2F2A26)' };
  const thStyle: React.CSSProperties = { color: 'var(--fg-muted, #8A6E4A)' };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-app, #FBF8F3)' }}>
      <div className="ml-72 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest font-mono mb-2" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>§15 · Paramètres</div>
              <h1 className="text-3xl italic mb-1" style={h2Style}>Utilisateurs & Rôles</h1>
              <p className="text-sm" style={{ color: 'var(--fg-secondary, #5D4E42)' }}>18 rôles §2.4, permissions granulaires ABAC §2bis.8</p>
            </div>
            {tab === 'users' && (
              <button
                onClick={() => setEditing({ id: 0, email: '', nom: '', role: 'COMMERCIAL', actif: true, derniere_connexion: null, permissions_speciales: [] })}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-white"
                style={{ backgroundColor: '#C8663D' }}
              >
                <Plus className="w-4 h-4" /> Nouvel utilisateur
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {([
              { k: 'users', label: 'Utilisateurs', icon: <Users className="w-4 h-4" /> },
              { k: 'roles', label: 'Rôles (18)', icon: <Shield className="w-4 h-4" /> },
              { k: 'permissions', label: 'Permissions ABAC', icon: <Key className="w-4 h-4" /> },
            ] as const).map(t => (
              <button
                key={t.k}
                onClick={() => setTab(t.k)}
                className={`px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 ${
                  tab === t.k ? 'text-white shadow-sm' : 'border'
                }`}
                style={tab === t.k
                  ? { backgroundColor: '#C8663D' }
                  : { backgroundColor: 'white', borderColor: '#E8DCC8', color: 'var(--fg-secondary, #5D4E42)' }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {tab === 'users' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-[#E8DCC8]">
              <table className="min-w-full text-sm divide-y divide-[#E8DCC8]">
                <thead style={{ backgroundColor: 'var(--bg-subtle, #F5EFE4)' }}>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-mono uppercase" style={thStyle}>Nom</th>
                    <th className="px-4 py-3 text-left text-xs font-mono uppercase" style={thStyle}>Email</th>
                    <th className="px-4 py-3 text-left text-xs font-mono uppercase" style={thStyle}>Rôle</th>
                    <th className="px-4 py-3 text-left text-xs font-mono uppercase" style={thStyle}>Permissions spé.</th>
                    <th className="px-4 py-3 text-left text-xs font-mono uppercase" style={thStyle}>Dernière conn.</th>
                    <th className="px-4 py-3 text-center text-xs font-mono uppercase" style={thStyle}>Statut</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E7D4]">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-[#FDF2ED]/40">
                      <td className="px-4 py-3 font-semibold">{u.nom}</td>
                      <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--fg-secondary, #5D4E42)' }}>{u.email}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded uppercase" style={{ backgroundColor: '#FDF2ED', color: '#C8663D' }}>
                          {ROLES.find(r => r.code === u.role)?.libelle || u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {u.permissions_speciales.length > 0 ? (
                          <span className="text-xs font-mono">{u.permissions_speciales.length} spécifique(s)</span>
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>
                        {u.derniere_connexion ? new Date(u.derniere_connexion).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${u.actif ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                          {u.actif ? 'Actif' : 'Désactivé'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setEditing(u)} className="p-1 rounded hover:bg-[#FDF2ED]" style={{ color: 'var(--fg-secondary, #5D4E42)' }}><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setUsers(users.filter(x => x.id !== u.id))} className="p-1 rounded hover:bg-red-50" style={{ color: '#B84A4A' }}><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'roles' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {ROLES.map(r => (
                <div key={r.code} className="bg-white rounded-xl p-4 shadow-sm border border-[#E8DCC8]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2 py-0.5 rounded" style={{ backgroundColor: '#FDF2ED', color: '#C8663D' }}>
                      <Shield className="w-3 h-3" /> {r.code}
                    </span>
                    <span className="text-[10px] font-mono" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>{r.nb_permissions} perms</span>
                  </div>
                  <div className="font-semibold mb-1" style={{ color: 'var(--fg-primary, #2F2A26)' }}>{r.libelle}</div>
                  <div className="text-xs italic" style={{ color: 'var(--fg-secondary, #5D4E42)' }}>{r.description}</div>
                </div>
              ))}
            </div>
          )}

          {tab === 'permissions' && (
            <div className="bg-white rounded-xl shadow-sm p-5 border border-[#E8DCC8]">
              <div className="text-xs italic mb-4" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>
                Modèle ABAC §2bis.8 : chaque permission = ressource × action. Une matrice complète existe côté backend.
              </div>
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left pb-2 text-xs font-mono uppercase" style={thStyle}>Ressource</th>
                    <th className="text-left pb-2 text-xs font-mono uppercase" style={thStyle}>Domaine</th>
                    <th className="text-left pb-2 text-xs font-mono uppercase" style={thStyle}>Actions disponibles</th>
                  </tr>
                </thead>
                <tbody>
                  {PERMISSIONS_ABAC.map(p => (
                    <tr key={p.code} className="border-t" style={{ borderColor: '#F0E7D4' }}>
                      <td className="py-2 font-mono text-xs">{p.code}</td>
                      <td className="py-2 text-xs">{p.domaine}</td>
                      <td className="py-2">
                        <div className="flex flex-wrap gap-1">
                          {p.actions.map(a => (
                            <span key={a} className="inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2 py-0.5 rounded" style={{ backgroundColor: '#F5EFE4', color: 'var(--fg-secondary, #5D4E42)' }}>
                              <Check className="w-3 h-3" /> {a}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="rounded-xl shadow-2xl max-w-lg w-full" onClick={e => e.stopPropagation()} style={{ backgroundColor: 'var(--bg-app, #FBF8F3)' }}>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl italic" style={h2Style}>{editing.id === 0 ? 'Nouvel utilisateur' : 'Modifier utilisateur'}</h3>
                <button onClick={() => setEditing(null)}><X className="w-5 h-5" style={{ color: 'var(--fg-muted, #8A6E4A)' }} /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-mono uppercase mb-1 block" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Nom complet</label>
                  <input value={editing.nom} onChange={e => setEditing({ ...editing, nom: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" style={inputStyle} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-mono uppercase mb-1 block" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Email</label>
                  <input type="email" value={editing.email} onChange={e => setEditing({ ...editing, email: e.target.value })} className="w-full border rounded px-3 py-2 text-sm font-mono" style={inputStyle} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-mono uppercase mb-1 block" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Rôle</label>
                  <select value={editing.role} onChange={e => setEditing({ ...editing, role: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" style={inputStyle}>
                    {ROLES.map(r => <option key={r.code} value={r.code}>{r.libelle} ({r.code})</option>)}
                  </select>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input type="checkbox" id="uactif" checked={editing.actif} onChange={e => setEditing({ ...editing, actif: e.target.checked })} className="w-4 h-4" />
                  <label htmlFor="uactif" className="text-sm">Compte actif</label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: '#E8DCC8' }}>
                <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg text-sm border" style={{ backgroundColor: 'var(--bg-app, #FBF8F3)', borderColor: '#E8DCC8', color: 'var(--fg-secondary, #5D4E42)' }}>Annuler</button>
                <button onClick={saveUser} className="px-4 py-2 rounded-lg text-sm text-white" style={{ backgroundColor: '#C8663D' }}>Enregistrer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParamUtilisateursRoles;
