import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from './useAuth';

export interface EffectivePermission {
  id_permission?: number;
  code: string;
  libelle?: string;
  module?: string;
  description?: string;
  source_role?: string;
}

export const usePermissions = () => {
  const { user } = useAuth();
  const [perms, setPerms] = useState<string[]>([]);
  const [rows, setRows] = useState<EffectivePermission[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    setLoading(true);
    api
      .get(`/utilisateurs/${user.id}/permissions`)
      .then((r) => {
        if (cancelled) return;
        const payload = r.data?.data ?? r.data ?? {};
        const codes: string[] = Array.isArray(payload)
          ? payload
          : (payload.codes ?? []);
        const permissions: EffectivePermission[] = Array.isArray(payload)
          ? []
          : (payload.permissions ?? []);
        setPerms(codes);
        setRows(permissions);
      })
      .catch((err) => {
        console.error('Erreur chargement permissions:', err);
        if (!cancelled) {
          setPerms([]);
          setRows([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const isAdmin = user?.role === 'ADMIN';

  return {
    perms,
    rows,
    loading,
    can: (perm: string) => isAdmin || perms.includes(perm) || perms.includes('admin.all'),
    isAdmin,
  };
};

export default usePermissions;
