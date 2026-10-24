/**
 * useAdminEdit — §14quater.8-9
 *
 * Hook utilitaire pour les pages Devis / Commandes / Factures / Avoirs :
 * si l'utilisateur courant est ADMIN ET que le document est déjà sorti
 * du statut 'brouillon', on demande une raison obligatoire avant tout
 * PUT. La raison est injectée dans le payload sous `raison_edition_admin`
 * (le backend `wrapAdminEdit` l'extrait, le stocke dans
 * `historique_editions_admin` puis la retire du corps avant l'UPDATE).
 *
 * Usage côté page :
 *   const { needsReason, requestReason, Modal } = useAdminEdit('facture', {
 *     statut: facture.statut, docLabel: facture.numero_facture,
 *   });
 *   const onSave = async (payload) => {
 *     if (needsReason) {
 *       requestReason(async (raison) => {
 *         await facturesService.updateFacture(id, { ...payload, raison_edition_admin: raison });
 *       });
 *     } else {
 *       await facturesService.updateFacture(id, payload);
 *     }
 *   };
 *   return <>...{Modal}</>;
 */
import React, { useCallback, useMemo, useState } from 'react';
import AdminEditReasonModal from '../components/AdminEditReasonModal';
import { useAuth } from './useAuth';

export type AdminEditDocType = 'devis' | 'commande' | 'facture' | 'avoir' | 'bl';

export interface UseAdminEditOptions {
  /** Statut courant du document (ex: 'brouillon', 'validee', 'envoye'...) */
  statut?: string | null;
  /** Label affiché dans la modal (numéro de pièce, titre, etc.) */
  docLabel?: string;
}

function isDraft(statut?: string | null): boolean {
  const s = String(statut || '').toLowerCase();
  return s === '' || s === 'brouillon' || s === 'draft';
}

export function useAdminEdit(docType: AdminEditDocType, { statut, docLabel }: UseAdminEditOptions = {}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<((raison: string) => void | Promise<void>) | null>(null);

  const isAdmin = useMemo(
    () => String((user as any)?.role || '').toUpperCase() === 'ADMIN'
       || String((user as any)?.role_principal || '').toUpperCase() === 'ADMIN',
    [user],
  );

  const draft = isDraft(statut);
  const needsReason = !draft && isAdmin;
  const canEdit = draft || isAdmin;

  /**
   * Demande la raison et exécute `action(raison)` seulement si l'édition
   * est bien soumise à `wrapAdminEdit`. Si doc = brouillon, lance l'action
   * sans modal (raison vide → wrapper backend l'autorise).
   */
  const requestReason = useCallback(
    (action: (raison: string) => void | Promise<void>) => {
      if (!canEdit) return;
      if (!needsReason) {
        void action('');
        return;
      }
      setPendingAction(() => action);
      setOpen(true);
    },
    [canEdit, needsReason],
  );

  const Modal = (
    <AdminEditReasonModal
      open={open}
      docType={docType}
      docLabel={docLabel}
      onCancel={() => { setOpen(false); setPendingAction(null); }}
      onConfirm={async (raison) => {
        try {
          if (pendingAction) await pendingAction(raison);
        } finally {
          setOpen(false);
          setPendingAction(null);
        }
      }}
    />
  );

  return { isAdmin, draft, needsReason, canEdit, requestReason, Modal };
}

export default useAdminEdit;
