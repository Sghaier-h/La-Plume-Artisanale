/**
 * AdminEditReasonModal.tsx — §14quater.8-9
 *
 * Modal générique affiché avant d'autoriser un ADMIN à éditer un document
 * (devis, commande, facture, avoir) déjà sorti du statut 'brouillon'.
 * La raison saisie est obligatoire et sera envoyée au backend dans
 * `raison_edition_admin` (ou le header `X-Admin-Edit-Reason`) pour que
 * `wrapAdminEdit` l'écrive dans `historique_editions_admin`.
 */
import React, { useEffect, useRef, useState } from 'react';

export interface AdminEditReasonModalProps {
  open: boolean;
  docType: 'devis' | 'commande' | 'facture' | 'avoir' | 'bl';
  docLabel?: string;             // ex: numéro de facture
  onCancel: () => void;
  onConfirm: (raison: string) => void | Promise<void>;
}

const docLabels: Record<string, string> = {
  devis: 'devis',
  commande: 'commande',
  facture: 'facture',
  avoir: 'avoir',
  bl: 'bon de livraison',
};

const AdminEditReasonModal: React.FC<AdminEditReasonModalProps> = ({
  open, docType, docLabel, onCancel, onConfirm,
}) => {
  const [raison, setRaison] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (open) {
      setRaison('');
      setSubmitting(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  if (!open) return null;

  const submit = async () => {
    if (raison.trim().length < 5) return;
    try {
      setSubmitting(true);
      await onConfirm(raison.trim());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-edit-reason-title"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9000, padding: '1rem',
      }}
    >
      <div style={{
        background: 'var(--bg-card, #fff)', color: 'var(--fg-primary, #222)',
        borderRadius: 12, padding: '1.5rem', maxWidth: 520, width: '100%',
        boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
        fontFamily: 'var(--font-sans, sans-serif)',
      }}>
        <h2 id="admin-edit-reason-title" style={{ margin: 0, fontSize: '1.2rem', color: 'var(--accent-terracotta, #c75a3b)' }}>
          Édition d'un {docLabels[docType] || 'document'} validé
        </h2>
        <p style={{ marginTop: '0.6rem', lineHeight: 1.5, color: 'var(--fg-secondary, #555)' }}>
          Vous êtes sur le point de modifier {docLabel ? <strong>{docLabel}</strong> : `ce ${docLabels[docType] || 'document'}`}.
          Cette action est tracée (qui, quand, pourquoi, diff avant/après)
          dans l'historique administrateur. Merci d'indiquer la raison
          précise de la modification.
        </p>
        <label style={{ display: 'block', fontWeight: 600, marginTop: '1rem', marginBottom: '0.3rem' }}>
          Raison <span style={{ color: 'var(--accent-terracotta, #c75a3b)' }}>*</span>
        </label>
        <textarea
          ref={inputRef}
          value={raison}
          onChange={(e) => setRaison(e.target.value)}
          placeholder="Ex: correction erreur de prix, demande client validée par M. X..."
          rows={4}
          style={{
            width: '100%', padding: '0.6rem', borderRadius: 8,
            border: '1px solid var(--border, #ccc)', resize: 'vertical',
            fontFamily: 'inherit', fontSize: '0.95rem',
          }}
        />
        <div style={{ fontSize: '0.78rem', color: 'var(--fg-muted, #888)', marginTop: '0.3rem' }}>
          Minimum 5 caractères. Cette raison apparaîtra dans l'audit.
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            disabled={submitting}
            style={{
              padding: '0.6rem 1rem', minHeight: 44, borderRadius: 8,
              border: '1px solid var(--border, #ccc)', background: 'transparent',
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            Annuler
          </button>
          <button
            onClick={submit}
            disabled={submitting || raison.trim().length < 5}
            style={{
              padding: '0.6rem 1rem', minHeight: 44, borderRadius: 8,
              border: 'none', background: 'var(--accent-terracotta, #c75a3b)',
              color: '#fff', cursor: (submitting || raison.trim().length < 5) ? 'not-allowed' : 'pointer',
              fontWeight: 600, opacity: raison.trim().length < 5 ? 0.6 : 1,
            }}
          >
            {submitting ? 'Enregistrement…' : 'Confirmer l\'édition'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminEditReasonModal;
