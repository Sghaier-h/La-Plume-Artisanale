/**
 * CompaniesERP - Sociétés
 * Version complète avec design ERP moderne
 */

import React, { useEffect, useState } from 'react';
import { companiesService } from '../../services/api';
import { ERPHeader, ERPStatusbar, ERPNotebook, ERPChatter, ERPButtonBox, useNotifications } from '../../components/erp';
import { displayMany2One, formatDate, formatCurrency, formatState } from '../../utils/relations';
import { Plus, Edit, Trash2, Eye, Building2, Search } from 'lucide-react';
import { validateForm, commonRules } from '../../utils/validation';

interface Company {
  id_societe: number;
  code_societe: string;
  raison_sociale: string;
  nom_commercial?: string;
  forme_juridique?: string;
  siret?: string;
  siren?: string;
  rcs?: string;
  rcs_ville?: string;
  tva_intracommunautaire?: string;
  logo_path?: string;
  photo_path?: string;
  adresse_siege?: string;
  code_postal_siege?: string;
  ville_siege?: string;
  pays_siege?: string;
  telephone_siege?: string;
  fax_siege?: string;
  email_siege?: string;
  site_web?: string;
  comptable_nom?: string;
  comptable_prenom?: string;
  comptable_societe?: string;
  comptable_email?: string;
  comptable_telephone?: string;
  comptable_adresse?: string;
  comptable_code_postal?: string;
  comptable_ville?: string;
  banque_nom?: string;
  banque_code_guichet?: string;
  banque_numero_compte?: string;
  banque_cle_rib?: string;
  banque_iban?: string;
  banque_bic?: string;
  regime_fiscal?: string;
  periode_fiscale?: string;
  date_creation_societe?: string;
  date_debut_exercice?: string;
  date_fin_exercice?: string;
  capital_social?: number;
  devise_capital?: string;
  activite_principale?: string;
  activite_secondaire?: string;
  secteur_activite?: string;
  nombre_salaries?: number;
  societe_mere_id?: number;
  est_societe_mere?: boolean;
  devise_principale?: string;
  langue_principale?: string;
  fuseau_horaire?: string;
  actif?: boolean;
  date_creation?: string;
  date_modification?: string;
  cree_par?: number;
  modifie_par?: number;
  // Alias pour compatibilité
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
}

const CompaniesERP: React.FC = () => {
  const { success, error } = useNotifications();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'list' | 'form'>('list');
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, [search]);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const params: any = { loadRelations: true };
      if (search) params.search = search;
      const response = await companiesService.getCompanies(params);
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setCompanies(data);
    } catch (error) {
      console.error('Erreur chargement sociétés:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedCompany(null);
    setShowForm(true);
    setViewType('form');
  };

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    setShowForm(true);
    setViewType('form');
  };

  const handleSave = async (formData: any) => {
    try {
      const companyId = selectedCompany?.id_societe || selectedCompany?.id;
      if (companyId) {
        await companiesService.updateCompany(companyId, formData);
        success('Société mise à jour avec succès');
      } else {
        await companiesService.createCompany(formData);
        success('Société créée avec succès');
      }
      setShowForm(false);
      setSelectedCompany(null);
      setViewType('list');
      loadCompanies();
    } catch (err: any) {
      error('Erreur enregistrement', err.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (company: Company) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette société ?')) {
      try {
        const companyId = company.id_societe || company.id;
        if (companyId) {
          await companiesService.deleteCompany(companyId);
          success('Société supprimée avec succès');
          loadCompanies();
        }
      } catch (err: any) {
        error('Erreur suppression', err.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };

  if (showForm) {
    return (
      <CompanyForm
        company={selectedCompany}
        onClose={() => {
          setShowForm(false);
          setSelectedCompany(null);
          setViewType('list');
          loadCompanies();
        }}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Sociétés"
        breadcrumb={[
          { label: 'Paramètres' },
          { label: 'Sociétés' }
        ]}
        actions={
          <button onClick={handleCreate} className="erp-btn erp-btn-primary">
            <Plus size={16} style={{ marginRight: '4px' }} />
            Nouvelle Société
          </button>
        }
      />

      <div className="erp-content">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
            <Search size={20} style={{ color: 'var(--erp-text-muted)' }} />
            <input
              type="text"
              placeholder="Rechercher une société..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="erp-field-input"
              style={{ flex: 1 }}
            />
          </div>
        </div>

        <div className="erp-tree-view">
          <table className="erp-tree-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Raison Sociale</th>
                <th>Nom Commercial</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Ville</th>
                <th>Actif</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px' }}>
                    Chargement...
                  </td>
                </tr>
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                    Aucune société
                  </td>
                </tr>
              ) : (
                companies.map(company => {
                  const companyId = company.id_societe || company.id || 0;
                  const raisonSociale = company.raison_sociale || company.name || '-';
                  const nomCommercial = company.nom_commercial || '-';
                  const email = company.email_siege || company.email || '-';
                  const phone = company.telephone_siege || company.phone || '-';
                  const city = company.ville_siege || company.city || '-';
                  const actif = company.actif !== false;
                  
                  return (
                    <tr key={companyId}>
                      <td>{company.code_societe || '-'}</td>
                      <td>{raisonSociale}</td>
                      <td>{nomCommercial}</td>
                      <td>{email}</td>
                      <td>{phone}</td>
                      <td>{city}</td>
                      <td>
                        {actif ? (
                        <span className="erp-status-badge done">Oui</span>
                      ) : (
                        <span className="erp-status-badge cancelled">Non</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleEdit(company)}
                          className="erp-btn erp-btn-outline"
                          style={{ padding: '4px 8px' }}
                            title="Voir/Modifier"
                        >
                          <Eye size={14} />
                        </button>
                          <button
                            onClick={() => handleDelete(company)}
                            className="erp-btn erp-btn-danger"
                            style={{ padding: '4px 8px' }}
                            title="Supprimer"
                          >
                            <Trash2 size={14} />
                          </button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Composant Formulaire
const CompanyForm: React.FC<{
  company: Company | null;
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ company, onClose, onSave }) => {
  const { success, error } = useNotifications();
  const [formData, setFormData] = useState({
    code_societe: company?.code_societe || '',
    raison_sociale: company?.raison_sociale || company?.name || '',
    nom_commercial: company?.nom_commercial || '',
    forme_juridique: company?.forme_juridique || '',
    siret: company?.siret || '',
    siren: company?.siren || '',
    rcs: company?.rcs || '',
    rcs_ville: company?.rcs_ville || '',
    tva_intracommunautaire: company?.tva_intracommunautaire || '',
    adresse_siege: company?.adresse_siege || '',
    code_postal_siege: company?.code_postal_siege || '',
    ville_siege: company?.ville_siege || '',
    pays_siege: company?.pays_siege || 'Tunisie',
    telephone_siege: company?.telephone_siege || company?.phone || '',
    fax_siege: company?.fax_siege || '',
    email_siege: company?.email_siege || company?.email || '',
    site_web: company?.site_web || '',
    comptable_nom: company?.comptable_nom || '',
    comptable_prenom: company?.comptable_prenom || '',
    comptable_societe: company?.comptable_societe || '',
    comptable_email: company?.comptable_email || '',
    comptable_telephone: company?.comptable_telephone || '',
    comptable_adresse: company?.comptable_adresse || '',
    comptable_code_postal: company?.comptable_code_postal || '',
    comptable_ville: company?.comptable_ville || '',
    banque_nom: company?.banque_nom || '',
    banque_code_guichet: company?.banque_code_guichet || '',
    banque_numero_compte: company?.banque_numero_compte || '',
    banque_cle_rib: company?.banque_cle_rib || '',
    banque_iban: company?.banque_iban || '',
    banque_bic: company?.banque_bic || '',
    regime_fiscal: company?.regime_fiscal || '',
    periode_fiscale: company?.periode_fiscale || '',
    date_creation_societe: company?.date_creation_societe || '',
    date_debut_exercice: company?.date_debut_exercice || '',
    date_fin_exercice: company?.date_fin_exercice || '',
    capital_social: company?.capital_social || 0,
    devise_capital: company?.devise_capital || 'TND',
    activite_principale: company?.activite_principale || '',
    activite_secondaire: company?.activite_secondaire || '',
    secteur_activite: company?.secteur_activite || '',
    nombre_salaries: company?.nombre_salaries || 0,
    devise_principale: company?.devise_principale || 'TND',
    langue_principale: company?.langue_principale || 'fr_FR',
    fuseau_horaire: company?.fuseau_horaire || 'Africa/Tunis',
    actif: company?.actif !== false
  });

  const handleSaveClick = () => {
    // Validation
    if (!formData.code_societe || !formData.raison_sociale) {
      error('Erreur validation', 'Le code société et la raison sociale sont obligatoires');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="erp-layout">
      <ERPHeader
        title={company ? `Société ${company.raison_sociale || company.name || ''}` : 'Nouvelle Société'}
        breadcrumb={[
          { label: 'Paramètres' },
          { label: 'Sociétés' },
          { label: company ? (company.raison_sociale || company.name || 'Nouvelle') : 'Nouvelle' }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onClose} className="erp-btn erp-btn-outline">
              Annuler
            </button>
            <button onClick={handleSaveClick} className="erp-btn erp-btn-primary">
              Enregistrer
            </button>
          </div>
        }
      />

      <div className="erp-content">
        <div className="erp-form-view">
          <ERPNotebook
            tabs={[
              {
                label: 'Informations Générales',
                content: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="erp-field">
                        <label className="erp-field-label erp-field-required">Code Société</label>
                        <input
                          type="text"
                          value={formData.code_societe}
                          onChange={(e) => setFormData({ ...formData, code_societe: e.target.value })}
                          className="erp-field-input"
                          placeholder="SOC001"
                          maxLength={20}
                        />
                      </div>
                      <div className="erp-field">
                        <label className="erp-field-label erp-field-required">Raison Sociale</label>
                        <input
                          type="text"
                          value={formData.raison_sociale}
                          onChange={(e) => setFormData({ ...formData, raison_sociale: e.target.value })}
                          className="erp-field-input"
                          placeholder="Raison sociale..."
                        />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="erp-field">
                        <label className="erp-field-label">Nom Commercial</label>
                        <input
                          type="text"
                          value={formData.nom_commercial}
                          onChange={(e) => setFormData({ ...formData, nom_commercial: e.target.value })}
                          className="erp-field-input"
                          placeholder="Nom commercial..."
                        />
                      </div>
                      <div className="erp-field">
                        <label className="erp-field-label">Forme Juridique</label>
                        <input
                          type="text"
                          value={formData.forme_juridique}
                          onChange={(e) => setFormData({ ...formData, forme_juridique: e.target.value })}
                          className="erp-field-input"
                          placeholder="SARL, SA, etc."
                        />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                      <div className="erp-field">
                        <label className="erp-field-label">SIRET</label>
                        <input
                          type="text"
                          value={formData.siret}
                          onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                          className="erp-field-input"
                          placeholder="12345678901234"
                          maxLength={20}
                        />
                      </div>
                      <div className="erp-field">
                        <label className="erp-field-label">SIREN</label>
                        <input
                          type="text"
                          value={formData.siren}
                          onChange={(e) => setFormData({ ...formData, siren: e.target.value })}
                          className="erp-field-input"
                          placeholder="123456789"
                          maxLength={20}
                        />
                      </div>
                      <div className="erp-field">
                        <label className="erp-field-label">TVA Intracommunautaire</label>
                        <input
                          type="text"
                          value={formData.tva_intracommunautaire}
                          onChange={(e) => setFormData({ ...formData, tva_intracommunautaire: e.target.value })}
                          className="erp-field-input"
                          placeholder="FR12345678901"
                          maxLength={50}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="erp-field">
                        <label className="erp-field-label">RCS</label>
                        <input
                          type="text"
                          value={formData.rcs}
                          onChange={(e) => setFormData({ ...formData, rcs: e.target.value })}
                          className="erp-field-input"
                          placeholder="RCS..."
                          maxLength={50}
                        />
                      </div>
                      <div className="erp-field">
                        <label className="erp-field-label">Ville RCS</label>
                        <input
                          type="text"
                          value={formData.rcs_ville}
                          onChange={(e) => setFormData({ ...formData, rcs_ville: e.target.value })}
                          className="erp-field-input"
                          placeholder="Ville du RCS..."
                          maxLength={100}
                        />
                      </div>
                    </div>
                    <div className="erp-field">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={formData.actif}
                          onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                        />
                        Actif
                      </label>
                    </div>
                  </div>
                )
              },
              {
                label: 'Siège Social',
                content: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="erp-field">
                      <label className="erp-field-label">Adresse</label>
                      <textarea
                        value={formData.adresse_siege}
                        onChange={(e) => setFormData({ ...formData, adresse_siege: e.target.value })}
                        className="erp-field-input"
                        placeholder="Adresse complète..."
                        rows={3}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                      <div className="erp-field">
                        <label className="erp-field-label">Code Postal</label>
                        <input
                          type="text"
                          value={formData.code_postal_siege}
                          onChange={(e) => setFormData({ ...formData, code_postal_siege: e.target.value })}
                          className="erp-field-input"
                          placeholder="1000"
                          maxLength={10}
                        />
                      </div>
                      <div className="erp-field">
                        <label className="erp-field-label">Ville</label>
                        <input
                          type="text"
                          value={formData.ville_siege}
                          onChange={(e) => setFormData({ ...formData, ville_siege: e.target.value })}
                          className="erp-field-input"
                          placeholder="Tunis"
                          maxLength={100}
                        />
                      </div>
                      <div className="erp-field">
                        <label className="erp-field-label">Pays</label>
                        <input
                          type="text"
                          value={formData.pays_siege}
                          onChange={(e) => setFormData({ ...formData, pays_siege: e.target.value })}
                          className="erp-field-input"
                          placeholder="Tunisie"
                          maxLength={100}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                      <div className="erp-field">
                        <label className="erp-field-label">Téléphone</label>
                        <input
                          type="tel"
                          value={formData.telephone_siege}
                          onChange={(e) => setFormData({ ...formData, telephone_siege: e.target.value })}
                          className="erp-field-input"
                          placeholder="+216 XX XXX XXX"
                          maxLength={20}
                        />
                      </div>
                      <div className="erp-field">
                        <label className="erp-field-label">Fax</label>
                        <input
                          type="tel"
                          value={formData.fax_siege}
                          onChange={(e) => setFormData({ ...formData, fax_siege: e.target.value })}
                          className="erp-field-input"
                          placeholder="+216 XX XXX XXX"
                          maxLength={20}
                        />
                      </div>
                      <div className="erp-field">
                        <label className="erp-field-label">Email</label>
                        <input
                          type="email"
                          value={formData.email_siege}
                          onChange={(e) => setFormData({ ...formData, email_siege: e.target.value })}
                          className="erp-field-input"
                          placeholder="contact@company.com"
                          maxLength={255}
                        />
                      </div>
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Site Web</label>
                      <input
                        type="url"
                        value={formData.site_web}
                        onChange={(e) => setFormData({ ...formData, site_web: e.target.value })}
                        className="erp-field-input"
                        placeholder="https://www.company.com"
                        maxLength={255}
                      />
                    </div>
                  </div>
                )
              },
              {
                label: 'Contact Comptable',
                content: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="erp-field">
                        <label className="erp-field-label">Nom</label>
                        <input
                          type="text"
                          value={formData.comptable_nom}
                          onChange={(e) => setFormData({ ...formData, comptable_nom: e.target.value })}
                          className="erp-field-input"
                          placeholder="Nom du comptable..."
                          maxLength={255}
                        />
                      </div>
                      <div className="erp-field">
                        <label className="erp-field-label">Prénom</label>
                        <input
                          type="text"
                          value={formData.comptable_prenom}
                          onChange={(e) => setFormData({ ...formData, comptable_prenom: e.target.value })}
                          className="erp-field-input"
                          placeholder="Prénom du comptable..."
                          maxLength={255}
                        />
                      </div>
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Société</label>
                      <input
                        type="text"
                        value={formData.comptable_societe}
                        onChange={(e) => setFormData({ ...formData, comptable_societe: e.target.value })}
                        className="erp-field-input"
                        placeholder="Nom de la société comptable..."
                        maxLength={255}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="erp-field">
                        <label className="erp-field-label">Email</label>
                        <input
                          type="email"
                          value={formData.comptable_email}
                          onChange={(e) => setFormData({ ...formData, comptable_email: e.target.value })}
                          className="erp-field-input"
                          placeholder="comptable@company.com"
                          maxLength={255}
                        />
                      </div>
                      <div className="erp-field">
                        <label className="erp-field-label">Téléphone</label>
                        <input
                          type="tel"
                          value={formData.comptable_telephone}
                          onChange={(e) => setFormData({ ...formData, comptable_telephone: e.target.value })}
                          className="erp-field-input"
                          placeholder="+216 XX XXX XXX"
                          maxLength={20}
                        />
                      </div>
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Adresse</label>
                      <textarea
                        value={formData.comptable_adresse}
                        onChange={(e) => setFormData({ ...formData, comptable_adresse: e.target.value })}
                        className="erp-field-input"
                        placeholder="Adresse du comptable..."
                        rows={3}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                      <div className="erp-field">
                        <label className="erp-field-label">Code Postal</label>
                      <input
                        type="text"
                          value={formData.comptable_code_postal}
                          onChange={(e) => setFormData({ ...formData, comptable_code_postal: e.target.value })}
                        className="erp-field-input"
                          placeholder="1000"
                          maxLength={10}
                      />
                    </div>
                    <div className="erp-field">
                        <label className="erp-field-label">Ville</label>
                        <input
                          type="text"
                          value={formData.comptable_ville}
                          onChange={(e) => setFormData({ ...formData, comptable_ville: e.target.value })}
                          className="erp-field-input"
                          placeholder="Tunis"
                          maxLength={100}
                        />
                      </div>
                    </div>
                  </div>
                )
              },
              {
                label: 'Informations Bancaires',
                content: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="erp-field">
                      <label className="erp-field-label">Nom de la Banque</label>
                      <input
                        type="text"
                        value={formData.banque_nom}
                        onChange={(e) => setFormData({ ...formData, banque_nom: e.target.value })}
                        className="erp-field-input"
                        placeholder="Nom de la banque..."
                        maxLength={255}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="erp-field">
                        <label className="erp-field-label">Code Guichet</label>
                        <input
                          type="text"
                          value={formData.banque_code_guichet}
                          onChange={(e) => setFormData({ ...formData, banque_code_guichet: e.target.value })}
                          className="erp-field-input"
                          placeholder="12345"
                          maxLength={10}
                        />
                      </div>
                      <div className="erp-field">
                        <label className="erp-field-label">Numéro de Compte</label>
                        <input
                          type="text"
                          value={formData.banque_numero_compte}
                          onChange={(e) => setFormData({ ...formData, banque_numero_compte: e.target.value })}
                          className="erp-field-input"
                          placeholder="1234567890"
                          maxLength={50}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                      <div className="erp-field">
                        <label className="erp-field-label">Clé RIB</label>
                        <input
                          type="text"
                          value={formData.banque_cle_rib}
                          onChange={(e) => setFormData({ ...formData, banque_cle_rib: e.target.value })}
                          className="erp-field-input"
                          placeholder="12"
                          maxLength={5}
                        />
                      </div>
                      <div className="erp-field">
                        <label className="erp-field-label">IBAN</label>
                        <input
                          type="text"
                          value={formData.banque_iban}
                          onChange={(e) => setFormData({ ...formData, banque_iban: e.target.value })}
                          className="erp-field-input"
                          placeholder="TN59 12 345 678 9012345678901"
                          maxLength={50}
                        />
                      </div>
                      <div className="erp-field">
                        <label className="erp-field-label">BIC</label>
                        <input
                          type="text"
                          value={formData.banque_bic}
                          onChange={(e) => setFormData({ ...formData, banque_bic: e.target.value })}
                          className="erp-field-input"
                          placeholder="BFTNTNTT"
                          maxLength={20}
                        />
                      </div>
                    </div>
                  </div>
                )
              },
              {
                label: 'Informations Fiscales',
                content: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="erp-field">
                        <label className="erp-field-label">Régime Fiscal</label>
                        <input
                          type="text"
                          value={formData.regime_fiscal}
                          onChange={(e) => setFormData({ ...formData, regime_fiscal: e.target.value })}
                          className="erp-field-input"
                          placeholder="Régime fiscal..."
                          maxLength={100}
                        />
                      </div>
                      <div className="erp-field">
                        <label className="erp-field-label">Période Fiscale</label>
                        <input
                          type="text"
                          value={formData.periode_fiscale}
                          onChange={(e) => setFormData({ ...formData, periode_fiscale: e.target.value })}
                          className="erp-field-input"
                          placeholder="Annuelle, Trimestrielle..."
                          maxLength={50}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                      <div className="erp-field">
                        <label className="erp-field-label">Date Création Société</label>
                        <input
                          type="date"
                          value={formData.date_creation_societe}
                          onChange={(e) => setFormData({ ...formData, date_creation_societe: e.target.value })}
                          className="erp-field-input"
                        />
                      </div>
                      <div className="erp-field">
                        <label className="erp-field-label">Date Début Exercice</label>
                        <input
                          type="date"
                          value={formData.date_debut_exercice}
                          onChange={(e) => setFormData({ ...formData, date_debut_exercice: e.target.value })}
                          className="erp-field-input"
                        />
                      </div>
                      <div className="erp-field">
                        <label className="erp-field-label">Date Fin Exercice</label>
                        <input
                          type="date"
                          value={formData.date_fin_exercice}
                          onChange={(e) => setFormData({ ...formData, date_fin_exercice: e.target.value })}
                          className="erp-field-input"
                        />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="erp-field">
                        <label className="erp-field-label">Capital Social</label>
                        <input
                          type="number"
                          value={formData.capital_social}
                          onChange={(e) => setFormData({ ...formData, capital_social: parseFloat(e.target.value) || 0 })}
                          className="erp-field-input"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <div className="erp-field">
                        <label className="erp-field-label">Devise Capital</label>
                        <input
                          type="text"
                          value={formData.devise_capital}
                          onChange={(e) => setFormData({ ...formData, devise_capital: e.target.value })}
                          className="erp-field-input"
                          placeholder="TND"
                          maxLength={10}
                        />
                      </div>
                    </div>
                  </div>
                )
              },
              {
                label: 'Activité',
                content: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="erp-field">
                      <label className="erp-field-label">Activité Principale</label>
                        <input
                          type="text"
                        value={formData.activite_principale}
                        onChange={(e) => setFormData({ ...formData, activite_principale: e.target.value })}
                        className="erp-field-input"
                        placeholder="Activité principale..."
                        maxLength={255}
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Activité Secondaire</label>
                      <textarea
                        value={formData.activite_secondaire}
                        onChange={(e) => setFormData({ ...formData, activite_secondaire: e.target.value })}
                          className="erp-field-input"
                        placeholder="Activités secondaires..."
                        rows={3}
                        />
                      </div>
                      <div className="erp-field">
                      <label className="erp-field-label">Secteur d'Activité</label>
                        <input
                          type="text"
                        value={formData.secteur_activite}
                        onChange={(e) => setFormData({ ...formData, secteur_activite: e.target.value })}
                        className="erp-field-input"
                        placeholder="Secteur d'activité..."
                        maxLength={100}
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Nombre de Salariés</label>
                      <input
                        type="number"
                        value={formData.nombre_salaries}
                        onChange={(e) => setFormData({ ...formData, nombre_salaries: parseInt(e.target.value) || 0 })}
                          className="erp-field-input"
                        placeholder="0"
                        min="0"
                        />
                      </div>
                  </div>
                )
              },
              {
                label: 'Paramètres Système',
                content: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                      <div className="erp-field">
                        <label className="erp-field-label">Devise Principale</label>
                        <input
                          type="text"
                          value={formData.devise_principale}
                          onChange={(e) => setFormData({ ...formData, devise_principale: e.target.value })}
                          className="erp-field-input"
                          placeholder="TND"
                          maxLength={10}
                        />
                      </div>
                      <div className="erp-field">
                        <label className="erp-field-label">Langue Principale</label>
                        <input
                          type="text"
                          value={formData.langue_principale}
                          onChange={(e) => setFormData({ ...formData, langue_principale: e.target.value })}
                          className="erp-field-input"
                          placeholder="fr_FR"
                          maxLength={10}
                        />
                    </div>
                    <div className="erp-field">
                        <label className="erp-field-label">Fuseau Horaire</label>
                        <input
                          type="text"
                          value={formData.fuseau_horaire}
                          onChange={(e) => setFormData({ ...formData, fuseau_horaire: e.target.value })}
                          className="erp-field-input"
                          placeholder="Africa/Tunis"
                          maxLength={50}
                        />
                      </div>
                    </div>
                  </div>
                )
              },
              {
                label: 'Notes',
                content: (
                  <ERPChatter
                    messages={[]}
                    onSendMessage={(content, type) => {
                      console.log('Message:', content, type);
                    }}
                  />
                )
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default CompaniesERP;
