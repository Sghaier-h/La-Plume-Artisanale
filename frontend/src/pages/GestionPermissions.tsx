import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Shield, Search, UserPlus, X, Save, CheckCircle2 } from 'lucide-react';
import { DashboardShell, SectionCard, ThemeToggle } from '../components/dashboard';
import { utilisateursService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------
interface Permission {
  id_permission: number;
  code: string;
  libelle: string;
  module: string;
  description?: string;
}
interface Role {
  id_role: number;
  code_role: string;
  nom?: string;
  description?: string;
}
interface Utilisateur {
  id_utilisateur: number;
  email: string;
  nom?: string;
  prenom?: string;
  actif?: boolean;
}
interface EffectivePermRow {
  code: string;
  libelle?: string;
  module?: string;
  source_role?: string;
}

// ------------------------------------------------------------
// Utils
// ------------------------------------------------------------
const asArray = (x: any): any[] =>
  Array.isArray(x) ? x : (x?.data?.items || x?.data?.data || x?.data || x?.items || []);

const groupByModule = <T extends { module?: string }>(items: T[]) => {
  const out: Record<string, T[]> = {};
  for (const it of items) {
    const key = it.module || 'autres';
    if (!out[key]) out[key] = [];
    out[key].push(it);
  }
  return out;
};

const MODULE_LABEL: Record<string, string> = {
  clients: 'Clients',
  commandes: 'Commandes',
  production: 'Production',
  stock: 'Stock',
  finance: 'Finance',
  rh: 'Ressources humaines',
  admin: 'Administration',
  autres: 'Autres',
};

// ------------------------------------------------------------
// Small UI atoms
// ------------------------------------------------------------
const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '6px 10px', background: 'transparent',
  border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
  color: 'var(--fg-primary)', fontSize: 'var(--text-sm)', cursor: 'pointer',
};
const btnPrimary: React.CSSProperties = {
  ...btnGhost, background: 'var(--accent-terracotta)', color: '#fff',
  borderColor: 'var(--accent-terracotta)',
};
const inputStyle: React.CSSProperties = {
  padding: '8px 10px', background: 'var(--bg-elevated)',
  border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
  color: 'var(--fg-primary)', fontSize: 'var(--text-sm)', width: '100%',
};

const RoleBadge: React.FC<{ label: string; onRemove?: () => void }> = ({ label, onRemove }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '2px 8px', fontSize: 11, fontWeight: 600,
    borderRadius: 999, background: 'var(--bg-hover)',
    border: '1px solid var(--border-subtle)', color: 'var(--fg-primary)',
  }}>
    {label}
    {onRemove && (
      <button onClick={onRemove} title="Retirer" style={{
        background: 'transparent', border: 'none', cursor: 'pointer',
        color: 'var(--fg-muted)', padding: 0, display: 'flex',
      }}>
        <X size={12} />
      </button>
    )}
  </span>
);

const Toast: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 2000,
      background: 'var(--accent-sage)', color: '#fff',
      padding: '10px 16px', borderRadius: 'var(--radius-sm)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <CheckCircle2 size={16} /> {message}
    </div>
  );
};

// Rounded checkbox
const Checkbox: React.FC<{ checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }> = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={() => onChange(!checked)}
    style={{
      width: 20, height: 20, borderRadius: 6, cursor: disabled ? 'not-allowed' : 'pointer',
      background: checked ? 'var(--accent-terracotta)' : 'var(--bg-elevated)',
      border: `1.5px solid ${checked ? 'var(--accent-terracotta)' : 'var(--border-subtle)'}`,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', padding: 0, opacity: disabled ? 0.5 : 1,
    }}
  >
    {checked && <CheckCircle2 size={12} />}
  </button>
);

// ------------------------------------------------------------
// Main page
// ------------------------------------------------------------
type Tab = 'user' | 'role' | 'matrix';

const GestionPermissions: React.FC = () => {
  useAuth();
  const [tab, setTab] = useState<Tab>('user');
  const [toast, setToast] = useState<string | null>(null);

  // shared state
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [matrixByRole, setMatrixByRole] = useState<Record<number, Set<string>>>({});
  const [loading, setLoading] = useState(true);

  // per-user tab state
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [userRoles, setUserRoles] = useState<Role[]>([]);
  const [userPerms, setUserPerms] = useState<EffectivePermRow[]>([]);
  const [addRoleOpen, setAddRoleOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  // per-role tab state
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [rolePermCodes, setRolePermCodes] = useState<Set<string>>(new Set());
  const [dirtyRolePerms, setDirtyRolePerms] = useState(false);
  const [savingRole, setSavingRole] = useState(false);

  // ------------------------------------------------------------
  // Loaders
  // ------------------------------------------------------------
  const loadStatic = useCallback(async () => {
    setLoading(true);
    try {
      const [permsRes, rolesRes, usersRes] = await Promise.all([
        utilisateursService.getPermissions(),
        utilisateursService.getRoles(),
        utilisateursService.getUtilisateurs(),
      ]);
      const permsList: Permission[] = asArray(permsRes.data);
      const rolesList: Role[] = asArray(rolesRes.data);
      const usersList: Utilisateur[] = asArray(usersRes.data);
      setPermissions(permsList);
      setRoles(rolesList);
      setUtilisateurs(usersList);
      // Build matrix
      const matrix: Record<number, Set<string>> = {};
      await Promise.all(rolesList.map(async (r) => {
        if (!r?.id_role) return;
        try {
          const rp = await utilisateursService.getRolePermissions(r.id_role);
          const codes = asArray(rp.data).map((p: Permission) => p.code);
          matrix[r.id_role] = new Set(codes);
        } catch (_) { matrix[r.id_role] = new Set(); }
      }));
      setMatrixByRole(matrix);
    } catch (e) {
      console.error('Erreur chargement RBAC:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStatic(); }, [loadStatic]);

  const loadUserDetail = useCallback(async (id: number) => {
    try {
      const [r1, r2] = await Promise.all([
        utilisateursService.getRolesUtilisateur(id),
        utilisateursService.getUserPermissions(id),
      ]);
      setUserRoles(asArray(r1.data));
      const payload = r2.data?.data ?? r2.data ?? {};
      setUserPerms(payload.permissions ?? []);
    } catch (e) {
      console.error('Erreur détail utilisateur:', e);
    }
  }, []);

  useEffect(() => {
    if (selectedUserId) loadUserDetail(selectedUserId);
  }, [selectedUserId, loadUserDetail]);

  const loadRolePerms = useCallback(async (id_role: number) => {
    try {
      const r = await utilisateursService.getRolePermissions(id_role);
      const codes = asArray(r.data).map((p: Permission) => p.code);
      setRolePermCodes(new Set(codes));
      setDirtyRolePerms(false);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    if (selectedRoleId) loadRolePerms(selectedRoleId);
  }, [selectedRoleId, loadRolePerms]);

  // ------------------------------------------------------------
  // Actions
  // ------------------------------------------------------------
  const addUserRole = async (id_role: number) => {
    if (!selectedUserId) return;
    try {
      await utilisateursService.addRoleUtilisateur(selectedUserId, id_role);
      setAddRoleOpen(false);
      await loadUserDetail(selectedUserId);
      setToast('Rôle ajouté');
    } catch (e) { console.error(e); }
  };

  const removeUserRole = async (id_role: number) => {
    if (!selectedUserId) return;
    if (!window.confirm('Retirer ce rôle ?')) return;
    try {
      await utilisateursService.removeRoleUtilisateur(selectedUserId, id_role);
      await loadUserDetail(selectedUserId);
      setToast('Rôle retiré');
    } catch (e) { console.error(e); }
  };

  const toggleRolePerm = (code: string) => {
    setRolePermCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code); else next.add(code);
      return next;
    });
    setDirtyRolePerms(true);
  };

  const saveRolePerms = async () => {
    if (!selectedRoleId) return;
    setSavingRole(true);
    try {
      const codes = Array.from(rolePermCodes);
      await utilisateursService.updateRolePermissions(selectedRoleId, codes);
      setMatrixByRole((prev) => ({ ...prev, [selectedRoleId]: new Set(codes) }));
      setDirtyRolePerms(false);
      setToast('Permissions enregistrées');
    } catch (e) {
      console.error(e);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setSavingRole(false);
    }
  };

  // ------------------------------------------------------------
  // Derived
  // ------------------------------------------------------------
  const permsByModule = useMemo(() => groupByModule(permissions), [permissions]);
  const modules = useMemo(() => Object.keys(permsByModule), [permsByModule]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return utilisateurs;
    return utilisateurs.filter((u) => {
      const s = `${u.email || ''} ${u.nom || ''} ${u.prenom || ''}`.toLowerCase();
      return s.includes(q);
    });
  }, [userSearch, utilisateurs]);

  const availableRolesForUser = useMemo(() => {
    const owned = new Set(userRoles.map((r) => r.id_role));
    return roles.filter((r) => !owned.has(r.id_role));
  }, [roles, userRoles]);

  const selectedRole = useMemo(
    () => roles.find((r) => r.id_role === selectedRoleId) || null,
    [roles, selectedRoleId]
  );

  const selectedUser = useMemo(
    () => utilisateurs.find((u) => u.id_utilisateur === selectedUserId) || null,
    [utilisateurs, selectedUserId]
  );

  // ------------------------------------------------------------
  // Render helpers
  // ------------------------------------------------------------
  const TabBtn: React.FC<{ id: Tab; label: string }> = ({ id, label }) => (
    <button
      onClick={() => setTab(id)}
      style={{
        ...btnGhost,
        borderColor: tab === id ? 'var(--accent-terracotta)' : 'var(--border-subtle)',
        color: tab === id ? 'var(--accent-terracotta)' : 'var(--fg-primary)',
        fontWeight: tab === id ? 600 : 400,
      }}
    >
      {label}
    </button>
  );

  const ModuleLabel = (m: string) => MODULE_LABEL[m] || m;

  // ------------------------------------------------------------
  // Tabs
  // ------------------------------------------------------------

  const renderUserTab = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16 }}>
      <SectionCard title="Utilisateurs" subtitle={`${filteredUsers.length} au total`} icon={<Search size={16} />}>
        <div style={{ marginBottom: 10 }}>
          <input
            placeholder="Rechercher (email, nom)…"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div style={{ maxHeight: 500, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {filteredUsers.map((u) => {
            const active = selectedUserId === u.id_utilisateur;
            return (
              <button
                key={u.id_utilisateur}
                onClick={() => setSelectedUserId(u.id_utilisateur)}
                style={{
                  ...btnGhost, justifyContent: 'flex-start', width: '100%', textAlign: 'left',
                  background: active ? 'var(--bg-hover)' : 'transparent',
                  borderColor: active ? 'var(--accent-terracotta)' : 'var(--border-subtle)',
                  flexDirection: 'column', alignItems: 'flex-start', gap: 2, padding: '8px 10px',
                }}
              >
                <span style={{ fontWeight: 600 }}>{u.prenom || ''} {u.nom || u.email}</span>
                <span style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{u.email}</span>
              </button>
            );
          })}
          {filteredUsers.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--fg-muted)', fontSize: 12 }}>
              Aucun utilisateur
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard
        title={selectedUser ? `${selectedUser.prenom || ''} ${selectedUser.nom || selectedUser.email}` : 'Sélectionnez un utilisateur'}
        subtitle={selectedUser?.email || 'Aucun utilisateur sélectionné'}
        icon={<Shield size={16} />}
      >
        {!selectedUser ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--fg-muted)' }}>
            Choisissez un utilisateur dans la colonne de gauche pour voir ses rôles et droits.
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginBottom: 6 }}>Rôles actuels</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                {userRoles.map((r) => (
                  <RoleBadge key={r.id_role} label={r.code_role || r.nom || `#${r.id_role}`} onRemove={() => removeUserRole(r.id_role)} />
                ))}
                {userRoles.length === 0 && <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>Aucun rôle.</span>}
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setAddRoleOpen((v) => !v)} style={btnPrimary}>
                    <UserPlus size={14} /> Ajouter un rôle
                  </button>
                  {addRoleOpen && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 10,
                      background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-sm)', minWidth: 200, padding: 4,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    }}>
                      {availableRolesForUser.length === 0 ? (
                        <div style={{ padding: 8, fontSize: 12, color: 'var(--fg-muted)' }}>Tous les rôles sont attribués.</div>
                      ) : availableRolesForUser.map((r) => (
                        <button key={r.id_role} onClick={() => addUserRole(r.id_role)}
                          style={{ ...btnGhost, width: '100%', border: 'none', justifyContent: 'flex-start' }}>
                          {r.code_role} — {r.nom || ''}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginBottom: 6 }}>Permissions effectives</div>
              {userPerms.length === 0 ? (
                <div style={{ padding: 16, textAlign: 'center', color: 'var(--fg-muted)', fontSize: 12 }}>
                  Aucune permission (ajoutez un rôle).
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 10 }}>
                  {Object.entries(groupByModule(userPerms as any)).map(([mod, list]) => (
                    <div key={mod} style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                      <div style={{ background: 'var(--bg-hover)', padding: '6px 10px', fontSize: 12, fontWeight: 600 }}>
                        {ModuleLabel(mod)} <span style={{ color: 'var(--fg-muted)', fontWeight: 400 }}>({(list as any[]).length})</span>
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead>
                          <tr style={{ background: 'var(--bg-elevated)', color: 'var(--fg-muted)' }}>
                            <th style={{ textAlign: 'left', padding: '6px 10px' }}>Code</th>
                            <th style={{ textAlign: 'left', padding: '6px 10px' }}>Libellé</th>
                            <th style={{ textAlign: 'left', padding: '6px 10px' }}>Source (rôle)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(list as EffectivePermRow[]).map((p) => (
                            <tr key={p.code} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                              <td style={{ padding: '6px 10px', fontFamily: 'monospace' }}>{p.code}</td>
                              <td style={{ padding: '6px 10px' }}>{p.libelle}</td>
                              <td style={{ padding: '6px 10px', color: 'var(--fg-muted)' }}>{p.source_role || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </SectionCard>
    </div>
  );

  const renderRoleTab = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16 }}>
      <SectionCard title="Rôles" subtitle={`${roles.length}`} icon={<Shield size={16} />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {roles.map((r) => {
            const active = selectedRoleId === r.id_role;
            return (
              <button
                key={r.id_role}
                onClick={() => setSelectedRoleId(r.id_role)}
                style={{
                  ...btnGhost, justifyContent: 'flex-start', width: '100%',
                  background: active ? 'var(--bg-hover)' : 'transparent',
                  borderColor: active ? 'var(--accent-terracotta)' : 'var(--border-subtle)',
                  flexDirection: 'column', alignItems: 'flex-start', padding: '8px 10px',
                }}
              >
                <span style={{ fontWeight: 600 }}>{r.code_role}</span>
                <span style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{r.nom || ''}</span>
              </button>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard
        title={selectedRole ? `Permissions du rôle ${selectedRole.code_role}` : 'Sélectionnez un rôle'}
        subtitle={selectedRole?.nom || ''}
        icon={<Shield size={16} />}
        actions={selectedRole ? (
          <button
            onClick={saveRolePerms}
            disabled={!dirtyRolePerms || savingRole}
            style={{ ...btnPrimary, opacity: (!dirtyRolePerms || savingRole) ? 0.5 : 1 }}
          >
            <Save size={14} /> {savingRole ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        ) : undefined}
      >
        {!selectedRole ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--fg-muted)' }}>
            Choisissez un rôle pour éditer ses permissions.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {modules.map((mod) => (
              <div key={mod} style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <div style={{ background: 'var(--bg-hover)', padding: '8px 12px', fontSize: 13, fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{ModuleLabel(mod)}</span>
                  <span style={{ fontSize: 11, color: 'var(--fg-muted)', fontWeight: 400 }}>
                    {permsByModule[mod].filter((p) => rolePermCodes.has(p.code)).length} / {permsByModule[mod].length}
                  </span>
                </div>
                <div style={{ padding: 8, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 6 }}>
                  {permsByModule[mod].map((p) => (
                    <label key={p.code} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px',
                      cursor: 'pointer', borderRadius: 4,
                    }}>
                      <Checkbox
                        checked={rolePermCodes.has(p.code)}
                        onChange={() => toggleRolePerm(p.code)}
                      />
                      <div>
                        <div style={{ fontSize: 13, color: 'var(--fg-primary)' }}>{p.libelle}</div>
                        <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--fg-muted)' }}>{p.code}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );

  const renderMatrixTab = () => (
    <SectionCard title="Matrice complète" subtitle="Rôles × permissions (lecture seule)" icon={<Shield size={16} />}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: 'var(--bg-hover)' }}>
              <th style={{ textAlign: 'left', padding: '8px 10px', position: 'sticky', left: 0, background: 'var(--bg-hover)' }}>Module</th>
              <th style={{ textAlign: 'left', padding: '8px 10px' }}>Permission</th>
              {roles.map((r) => (
                <th key={r.id_role} style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 600 }}>
                  {r.code_role}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modules.map((mod) => (
              <React.Fragment key={mod}>
                <tr>
                  <td colSpan={2 + roles.length} style={{ background: 'var(--bg-elevated)', padding: '6px 10px', fontWeight: 600, color: 'var(--fg-muted)' }}>
                    {ModuleLabel(mod)}
                  </td>
                </tr>
                {permsByModule[mod].map((p) => (
                  <tr key={p.code} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '6px 10px', fontFamily: 'monospace', color: 'var(--fg-muted)' }}>{p.module}</td>
                    <td style={{ padding: '6px 10px' }}>
                      <div>{p.libelle}</div>
                      <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--fg-muted)' }}>{p.code}</div>
                    </td>
                    {roles.map((r) => {
                      const has = matrixByRole[r.id_role]?.has(p.code);
                      return (
                        <td key={r.id_role} style={{ padding: '6px 10px', textAlign: 'center' }}>
                          {has ? (
                            <span style={{ color: 'var(--accent-sage)', fontWeight: 700 }}>✓</span>
                          ) : (
                            <span style={{ color: 'var(--fg-muted)' }}>—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );

  return (
    <>
      <DashboardShell
        eyebrow="Paramètres avancés — RBAC"
        title="Gestion des droits"
        subtitle="Gérez les rôles, les permissions et leur attribution aux utilisateurs."
        headerRight={<ThemeToggle />}
      >
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <TabBtn id="user" label="Par utilisateur" />
          <TabBtn id="role" label="Par rôle" />
          <TabBtn id="matrix" label="Matrice complète" />
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--fg-muted)' }}>Chargement…</div>
        ) : (
          <>
            {tab === 'user' && renderUserTab()}
            {tab === 'role' && renderRoleTab()}
            {tab === 'matrix' && renderMatrixTab()}
          </>
        )}

        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </DashboardShell>
    </>
  );
};

export default GestionPermissions;
