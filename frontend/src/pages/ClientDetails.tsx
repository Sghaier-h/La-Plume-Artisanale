import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Trash2, User, Mail, Phone, MapPin, Building, CreditCard, 
  Percent, BarChart3, Settings, FileText, Plus, X, Package, Receipt, 
  Truck, Tag, Globe, Briefcase, UserCircle, Users, AlertCircle
} from 'lucide-react';
import { clientsService } from '../services/api';

interface Client {
  id_client?: number;
  code_client: string;
  raison_sociale: string;
  type_client?: string;
  id_categorie?: number;
  libelle_categorie?: string;
  id_commercial?: number;
  nom_commercial?: string;
  id_type_commercial?: number;
  libelle_type_commercial?: string;
  civilite?: string;
  siren_siret?: string;
  numero_tva?: string;
  site_web?: string;
  conditions_paiement?: string;
  plafond_credit?: number;
  devise: string;
  taux_remise: number;
  actif: boolean;
  raison_desactivation?: string;
  date_desactivation?: string;
  date_creation?: string;
  adresses?: Adresse[];
  contacts?: Contact[];
  commandes?: any[];
  bons_livraison?: any[];
  factures?: any[];
}

interface Adresse {
  id_adresse?: number;
  type_adresse: 'FACTURATION' | 'LIVRAISON' | 'AUTRE';
  civilite?: string;
  nom_adresse?: string;
  adresse_ligne1?: string;
  adresse_ligne2?: string;
  adresse_ligne3?: string;
  adresse_ligne4?: string;
  code_postal?: string;
  ville?: string;
  departement?: string;
  pays: string;
  site_web?: string;
  principale: boolean;
  actif: boolean;
}

interface Contact {
  id_contact?: number;
  id_adresse?: number;
  civilite?: string;
  nom: string;
  prenom?: string;
  fonction?: string;
  service_bureau?: string;
  email?: string;
  telephone_fixe?: string;
  telephone_portable?: string;
  fax?: string;
  contact_principal: boolean;
  actif: boolean;
  type_adresse?: string;
  nom_adresse_associee?: string;
}

type TabType = 'info' | 'adresses' | 'contacts' | 'commandes' | 'livraisons' | 'factures';

const ClientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [categories, setCategories] = useState<any[]>([]);
  const [typesCommerciaux, setTypesCommerciaux] = useState<any[]>([]);
  const [commerciaux, setCommerciaux] = useState<any[]>([]);
  const [showAdresseForm, setShowAdresseForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingAdresse, setEditingAdresse] = useState<Adresse | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  useEffect(() => {
    if (id) {
      loadClient();
      loadCategories();
      loadTypesCommerciaux();
      loadCommerciaux();
    }
  }, [id]);

  const loadClient = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await clientsService.getClient(parseInt(id));
      setClient(response.data.data || response.data);
    } catch (err: any) {
      console.error('Erreur chargement client:', err);
      setError('Impossible de charger le client');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await clientsService.getCategories();
      setCategories((() => {
        const _r = res.data?.data;
        if (Array.isArray(_r)) return _r;
        if (_r && Array.isArray(_r.data)) return _r.data;
        if (_r && typeof _r === 'object') {
          for (const k of Object.keys(_r)) if (Array.isArray((_r as any)[k])) return (_r as any)[k];
        }
        return [];
      })());
    } catch (err) {
      console.error('Erreur chargement catégories:', err);
    }
  };

  const loadTypesCommerciaux = async () => {
    try {
      const res = await clientsService.getTypesCommerciaux();
      setTypesCommerciaux((() => {
        const _r = res.data?.data;
        if (Array.isArray(_r)) return _r;
        if (_r && Array.isArray(_r.data)) return _r.data;
        if (_r && typeof _r === 'object') {
          for (const k of Object.keys(_r)) if (Array.isArray((_r as any)[k])) return (_r as any)[k];
        }
        return [];
      })());
    } catch (err) {
      console.error('Erreur chargement types commerciaux:', err);
    }
  };

  const loadCommerciaux = async () => {
    try {
      // TODO: Créer un service pour récupérer les commerciaux
      // Pour l'instant, on utilisera les utilisateurs avec un rôle commercial
    } catch (err) {
      console.error('Erreur chargement commerciaux:', err);
    }
  };

  const handleDelete = async () => {
    if (!client?.id_client) return;
    
    const raison = window.prompt('Raison de la désactivation :');
    if (raison === null) return;

    if (!window.confirm('Êtes-vous sûr de vouloir désactiver ce client ?')) {
      return;
    }

    try {
      await clientsService.deleteClient(client.id_client, raison);
      navigate('/clients');
    } catch (err: any) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la désactivation');
    }
  };

  const handleAdresseSubmit = async (adresse: Adresse) => {
    if (!client?.id_client) return;

    try {
      if (editingAdresse?.id_adresse) {
        await clientsService.updateAdresse(client.id_client, editingAdresse.id_adresse, adresse);
      } else {
        await clientsService.createAdresse(client.id_client, adresse);
      }
      setShowAdresseForm(false);
      setEditingAdresse(null);
      loadClient();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleContactSubmit = async (contact: Contact) => {
    if (!client?.id_client) return;

    try {
      if (editingContact?.id_contact) {
        await clientsService.updateContact(client.id_client, editingContact.id_contact, contact);
      } else {
        await clientsService.createContact(client.id_client, contact);
      }
      setShowContactForm(false);
      setEditingContact(null);
      loadClient();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteAdresse = async (idAdresse: number) => {
    if (!client?.id_client || !window.confirm('Êtes-vous sûr de vouloir supprimer cette adresse ?')) return;

    try {
      await clientsService.deleteAdresse(client.id_client, idAdresse);
      loadClient();
    } catch (err: any) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleDeleteContact = async (idContact: number) => {
    if (!client?.id_client || !window.confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) return;

    try {
      await clientsService.deleteContact(client.id_client, idContact);
      loadClient();
    } catch (err: any) {
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="ml-64 p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="ml-64 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Client non trouvé'}</p>
          <Link to="/clients" className="mt-4 inline-block text-blue-600 hover:underline">
            ← Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'info' as TabType, label: 'Informations', icon: User },
    { id: 'adresses' as TabType, label: 'Adresses', icon: MapPin },
    { id: 'contacts' as TabType, label: 'Contacts', icon: Users },
    { id: 'commandes' as TabType, label: 'Commandes', icon: Package },
    { id: 'livraisons' as TabType, label: 'Bons de livraison', icon: Truck },
    { id: 'factures' as TabType, label: 'Factures', icon: Receipt },
  ];

  return (
    <div className="ml-64 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/clients"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </Link>
          <div className="h-6 w-px bg-gray-300"></div>
          <div className="flex items-center gap-3">
            <Building className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{client.raison_sociale}</h1>
              <p className="text-sm text-gray-500 font-mono">{client.code_client}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {client.type_client === 'CLIENT' ? (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">Client</span>
            ) : (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-medium">Prospect</span>
            )}
            {client.actif ? (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">Actif</span>
            ) : (
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm">Inactif</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/clients?edit=${client.id_client}`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Edit className="w-4 h-4" />
            Modifier
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4" />
            Désactiver
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                    ${activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="p-6">
          {activeTab === 'info' && <InfoTab client={client} categories={categories} typesCommerciaux={typesCommerciaux} />}
          {activeTab === 'adresses' && (
            <AdressesTab
              client={client}
              onAdd={() => { setEditingAdresse(null); setShowAdresseForm(true); }}
              onEdit={(adresse) => { setEditingAdresse(adresse); setShowAdresseForm(true); }}
              onDelete={handleDeleteAdresse}
            />
          )}
          {activeTab === 'contacts' && (
            <ContactsTab
              client={client}
              onAdd={() => { setEditingContact(null); setShowContactForm(true); }}
              onEdit={(contact) => { setEditingContact(contact); setShowContactForm(true); }}
              onDelete={handleDeleteContact}
            />
          )}
          {activeTab === 'commandes' && <CommandesTab client={client} />}
          {activeTab === 'livraisons' && <LivraisonsTab client={client} />}
          {activeTab === 'factures' && <FacturesTab client={client} />}
        </div>
      </div>

      {/* Modals */}
      {showAdresseForm && (
        <AdresseFormModal
          client={client}
          adresse={editingAdresse}
          onClose={() => { setShowAdresseForm(false); setEditingAdresse(null); }}
          onSubmit={handleAdresseSubmit}
        />
      )}

      {showContactForm && (
        <ContactFormModal
          client={client}
          contact={editingContact}
          onClose={() => { setShowContactForm(false); setEditingContact(null); }}
          onSubmit={handleContactSubmit}
        />
      )}
    </div>
  );
};

// Composant Onglet Informations
const InfoTab: React.FC<{ client: Client; categories: any[]; typesCommerciaux: any[] }> = ({ client, categories, typesCommerciaux }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Informations générales */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Building className="w-5 h-5 text-blue-600" />
          Informations générales
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Code client</label>
              <p className="text-gray-900 font-mono">{client.code_client}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Type</label>
              <p className="text-gray-900">
                {client.type_client === 'CLIENT' ? 'Client' : 'Prospect'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Civilité</label>
              <p className="text-gray-900">{client.civilite || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Catégorie</label>
              <p className="text-gray-900">{client.libelle_categorie || '-'}</p>
            </div>
            {client.siren_siret && (
              <div>
                <label className="text-sm font-medium text-gray-500">SIREN/SIRET</label>
                <p className="text-gray-900">{client.siren_siret}</p>
              </div>
            )}
            {client.numero_tva && (
              <div>
                <label className="text-sm font-medium text-gray-500">N° TVA</label>
                <p className="text-gray-900">{client.numero_tva}</p>
              </div>
            )}
            {client.site_web && (
              <div className="col-span-2 flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400" />
                <a href={client.site_web} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {client.site_web}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Commercial */}
        {(client.id_commercial || client.id_type_commercial) && (
          <>
            <h3 className="text-lg font-semibold flex items-center gap-2 mt-6">
              <Briefcase className="w-5 h-5 text-blue-600" />
              Commercial
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              {client.nom_commercial && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Commercial assigné</label>
                  <p className="text-gray-900">{client.nom_commercial}</p>
                </div>
              )}
              {client.libelle_type_commercial && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <p className="text-gray-900">{client.libelle_type_commercial}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Conditions commerciales */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-600" />
          Conditions commerciales
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-500">Devise</label>
            <p className="text-lg font-semibold text-gray-900">{client.devise}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Percent className="w-4 h-4" />
              Taux de remise
            </label>
            <p className="text-2xl font-bold text-blue-600">{client.taux_remise || 0}%</p>
          </div>
          {client.plafond_credit && (
            <div>
              <label className="text-sm font-medium text-gray-500">Plafond de crédit</label>
              <p className="text-lg font-semibold text-gray-900">
                {client.plafond_credit.toLocaleString('fr-FR')} {client.devise}
              </p>
            </div>
          )}
          {client.conditions_paiement && (
            <div>
              <label className="text-sm font-medium text-gray-500">Conditions de paiement</label>
              <p className="text-gray-900">{client.conditions_paiement}</p>
            </div>
          )}
        </div>

        {/* Informations système */}
        <h3 className="text-lg font-semibold flex items-center gap-2 mt-6">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Informations système
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          {client.date_creation && (
            <div className="flex justify-between">
              <span className="text-gray-600">Date de création</span>
              <span className="font-medium">
                {new Date(client.date_creation).toLocaleDateString('fr-FR')}
              </span>
            </div>
          )}
          {client.date_desactivation && (
            <div className="flex justify-between">
              <span className="text-gray-600">Date de désactivation</span>
              <span className="font-medium">
                {new Date(client.date_desactivation).toLocaleDateString('fr-FR')}
              </span>
            </div>
          )}
          {client.raison_desactivation && (
            <div>
              <label className="text-sm font-medium text-gray-500">Raison de désactivation</label>
              <p className="text-gray-900">{client.raison_desactivation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Composant Onglet Adresses
const AdressesTab: React.FC<{
  client: Client;
  onAdd: () => void;
  onEdit: (adresse: Adresse) => void;
  onDelete: (id: number) => void;
}> = ({ client, onAdd, onEdit, onDelete }) => {
  const adresses = client.adresses || [];
  const adressesFacturation = adresses.filter(a => a.type_adresse === 'FACTURATION' && a.actif);
  const adressesLivraison = adresses.filter(a => a.type_adresse === 'LIVRAISON' && a.actif);
  const autresAdresses = adresses.filter(a => a.type_adresse === 'AUTRE' && a.actif);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Adresses</h3>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Ajouter une adresse
        </button>
      </div>

      {/* Adresses de facturation */}
      {adressesFacturation.length > 0 && (
        <div>
          <h4 className="text-md font-medium mb-3 text-gray-700">Adresses de facturation</h4>
          <div className="space-y-3">
            {adressesFacturation.map((adresse) => (
              <AdresseCard key={adresse.id_adresse} adresse={adresse} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        </div>
      )}

      {/* Adresses de livraison */}
      {adressesLivraison.length > 0 && (
        <div>
          <h4 className="text-md font-medium mb-3 text-gray-700">Adresses de livraison</h4>
          <div className="space-y-3">
            {adressesLivraison.map((adresse) => (
              <AdresseCard key={adresse.id_adresse} adresse={adresse} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        </div>
      )}

      {/* Autres adresses */}
      {autresAdresses.length > 0 && (
        <div>
          <h4 className="text-md font-medium mb-3 text-gray-700">Autres adresses</h4>
          <div className="space-y-3">
            {autresAdresses.map((adresse) => (
              <AdresseCard key={adresse.id_adresse} adresse={adresse} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        </div>
      )}

      {adresses.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Aucune adresse enregistrée</p>
        </div>
      )}
    </div>
  );
};

const AdresseCard: React.FC<{
  adresse: Adresse;
  onEdit: (adresse: Adresse) => void;
  onDelete: (id: number) => void;
}> = ({ adresse, onEdit, onDelete }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {adresse.principale && (
            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded mb-2">
              Principale
            </span>
          )}
          {adresse.nom_adresse && (
            <h5 className="font-medium text-gray-900 mb-2">{adresse.nom_adresse}</h5>
          )}
          <div className="text-sm text-gray-600 space-y-1">
            {adresse.adresse_ligne1 && <p>{adresse.adresse_ligne1}</p>}
            {adresse.adresse_ligne2 && <p>{adresse.adresse_ligne2}</p>}
            <p>
              {adresse.code_postal && `${adresse.code_postal} `}
              {adresse.ville}
              {adresse.departement && ` (${adresse.departement})`}
            </p>
            <p className="font-medium">{adresse.pays}</p>
            {adresse.site_web && (
              <p className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                <a href={adresse.site_web} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {adresse.site_web}
                </a>
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onEdit(adresse)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
            title="Modifier"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => adresse.id_adresse && onDelete(adresse.id_adresse)}
            className="p-2 text-red-600 hover:bg-red-50 rounded"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant Onglet Contacts
const ContactsTab: React.FC<{
  client: Client;
  onAdd: () => void;
  onEdit: (contact: Contact) => void;
  onDelete: (id: number) => void;
}> = ({ client, onAdd, onEdit, onDelete }) => {
  const contacts = client.contacts || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Contacts</h3>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Ajouter un contact
        </button>
      </div>

      {contacts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.map((contact) => (
            <ContactCard key={contact.id_contact} contact={contact} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Aucun contact enregistré</p>
        </div>
      )}
    </div>
  );
};

const ContactCard: React.FC<{
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (id: number) => void;
}> = ({ contact, onEdit, onDelete }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          {contact.contact_principal && (
            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded mb-2">
              Contact principal
            </span>
          )}
          <h5 className="font-medium text-gray-900">
            {contact.civilite && `${contact.civilite} `}
            {contact.prenom} {contact.nom}
          </h5>
          {contact.fonction && (
            <p className="text-sm text-gray-600 mt-1">{contact.fonction}</p>
          )}
          {contact.service_bureau && (
            <p className="text-xs text-gray-500">{contact.service_bureau}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(contact)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
            title="Modifier"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => contact.id_contact && onDelete(contact.id_contact)}
            className="p-2 text-red-600 hover:bg-red-50 rounded"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="space-y-2 text-sm text-gray-600">
        {contact.email && (
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <a href={`mailto:${contact.email}`} className="hover:text-blue-600">
              {contact.email}
            </a>
          </div>
        )}
        {contact.telephone_fixe && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <a href={`tel:${contact.telephone_fixe}`} className="hover:text-blue-600">
              {contact.telephone_fixe}
            </a>
          </div>
        )}
        {contact.telephone_portable && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <a href={`tel:${contact.telephone_portable}`} className="hover:text-blue-600">
              {contact.telephone_portable} (portable)
            </a>
          </div>
        )}
        {contact.nom_adresse_associee && (
          <div className="text-xs text-gray-500 mt-2">
            Adresse: {contact.nom_adresse_associee}
          </div>
        )}
      </div>
    </div>
  );
};

// Composants pour les autres onglets (à compléter)
const CommandesTab: React.FC<{ client: Client }> = ({ client }) => {
  const commandes = client.commandes || [];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Commandes</h3>
      {commandes.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numéro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {commandes.map((commande) => (
                <tr key={commande.id_commande}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{commande.numero_commande}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(commande.date_commande).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded ${
                      commande.statut === 'validee' ? 'bg-green-100 text-green-800' :
                      commande.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {commande.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {commande.montant_total?.toLocaleString('fr-FR')} {commande.devise || 'TND'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      to={`/commandes/${commande.id_commande}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Voir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Aucune commande</p>
        </div>
      )}
    </div>
  );
};

const LivraisonsTab: React.FC<{ client: Client }> = ({ client }) => {
  const livraisons = client.bons_livraison || [];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Bons de livraison</h3>
      {livraisons.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numéro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {livraisons.map((livraison) => (
                <tr key={livraison.id_bon_livraison}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{livraison.numero_bon}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(livraison.date_livraison).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded ${
                      livraison.statut === 'livre' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {livraison.statut}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Truck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Aucun bon de livraison</p>
        </div>
      )}
    </div>
  );
};

const FacturesTab: React.FC<{ client: Client }> = ({ client }) => {
  const factures = client.factures || [];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Factures</h3>
      {factures.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numéro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {factures.map((facture) => (
                <tr key={facture.id_facture}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{facture.numero_facture}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(facture.date_facture).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {facture.montant_total?.toLocaleString('fr-FR')} {client.devise}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded ${
                      facture.statut_paiement === 'paye' ? 'bg-green-100 text-green-800' :
                      facture.statut_paiement === 'partiel' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {facture.statut_paiement}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Aucune facture</p>
        </div>
      )}
    </div>
  );
};

// Modal Formulaire Adresse
const AdresseFormModal: React.FC<{
  client: Client;
  adresse?: Adresse | null;
  onClose: () => void;
  onSubmit: (adresse: Adresse) => void;
}> = ({ client, adresse, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<Adresse>({
    type_adresse: adresse?.type_adresse || 'FACTURATION',
    civilite: adresse?.civilite || '',
    nom_adresse: adresse?.nom_adresse || client.raison_sociale,
    adresse_ligne1: adresse?.adresse_ligne1 || '',
    adresse_ligne2: adresse?.adresse_ligne2 || '',
    adresse_ligne3: adresse?.adresse_ligne3 || '',
    adresse_ligne4: adresse?.adresse_ligne4 || '',
    code_postal: adresse?.code_postal || '',
    ville: adresse?.ville || '',
    departement: adresse?.departement || '',
    pays: adresse?.pays || 'Tunisie',
    site_web: adresse?.site_web || '',
    principale: adresse?.principale || false,
    actif: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">{adresse ? 'Modifier' : 'Nouvelle'} adresse</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type d'adresse *</label>
              <select
                required
                value={formData.type_adresse}
                onChange={(e) => setFormData({ ...formData, type_adresse: e.target.value as any })}
                className="w-full px-4 py-2 border rounded"
              >
                <option value="FACTURATION">Facturation</option>
                <option value="LIVRAISON">Livraison</option>
                <option value="AUTRE">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Civilité</label>
              <input
                type="text"
                value={formData.civilite}
                onChange={(e) => setFormData({ ...formData, civilite: e.target.value })}
                className="w-full px-4 py-2 border rounded"
                placeholder="SARL, BOUTIQUE, etc."
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Nom de l'adresse</label>
              <input
                type="text"
                value={formData.nom_adresse}
                onChange={(e) => setFormData({ ...formData, nom_adresse: e.target.value })}
                className="w-full px-4 py-2 border rounded"
                placeholder="Ex: Siège social, Boutique, Entrepôt..."
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Adresse ligne 1 *</label>
              <input
                type="text"
                required
                value={formData.adresse_ligne1}
                onChange={(e) => setFormData({ ...formData, adresse_ligne1: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Adresse ligne 2</label>
              <input
                type="text"
                value={formData.adresse_ligne2}
                onChange={(e) => setFormData({ ...formData, adresse_ligne2: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Code postal</label>
              <input
                type="text"
                value={formData.code_postal}
                onChange={(e) => setFormData({ ...formData, code_postal: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ville</label>
              <input
                type="text"
                value={formData.ville}
                onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Département</label>
              <input
                type="text"
                value={formData.departement}
                onChange={(e) => setFormData({ ...formData, departement: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pays *</label>
              <input
                type="text"
                required
                value={formData.pays}
                onChange={(e) => setFormData({ ...formData, pays: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Site web</label>
              <input
                type="url"
                value={formData.site_web}
                onChange={(e) => setFormData({ ...formData, site_web: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.principale}
                  onChange={(e) => setFormData({ ...formData, principale: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium">Adresse principale de ce type</span>
              </label>
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button type="submit" className="flex-1 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
              {adresse ? 'Modifier' : 'Créer'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal Formulaire Contact
const ContactFormModal: React.FC<{
  client: Client;
  contact?: Contact | null;
  onClose: () => void;
  onSubmit: (contact: Contact) => void;
}> = ({ client, contact, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<Contact>({
    id_adresse: contact?.id_adresse,
    civilite: contact?.civilite || '',
    nom: contact?.nom || '',
    prenom: contact?.prenom || '',
    fonction: contact?.fonction || '',
    service_bureau: contact?.service_bureau || '',
    email: contact?.email || '',
    telephone_fixe: contact?.telephone_fixe || '',
    telephone_portable: contact?.telephone_portable || '',
    fax: contact?.fax || '',
    contact_principal: contact?.contact_principal || false,
    actif: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom) {
      alert('Le nom est obligatoire');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">{contact ? 'Modifier' : 'Nouveau'} contact</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Civilité</label>
              <input
                type="text"
                value={formData.civilite}
                onChange={(e) => setFormData({ ...formData, civilite: e.target.value })}
                className="w-full px-4 py-2 border rounded"
                placeholder="Monsieur, Madame, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nom *</label>
              <input
                type="text"
                required
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Prénom</label>
              <input
                type="text"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fonction</label>
              <input
                type="text"
                value={formData.fonction}
                onChange={(e) => setFormData({ ...formData, fonction: e.target.value })}
                className="w-full px-4 py-2 border rounded"
                placeholder="Ex: Gérant, Responsable..."
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Service/Bureau</label>
              <input
                type="text"
                value={formData.service_bureau}
                onChange={(e) => setFormData({ ...formData, service_bureau: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Téléphone fixe</label>
              <input
                type="tel"
                value={formData.telephone_fixe}
                onChange={(e) => setFormData({ ...formData, telephone_fixe: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Téléphone portable</label>
              <input
                type="tel"
                value={formData.telephone_portable}
                onChange={(e) => setFormData({ ...formData, telephone_portable: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fax</label>
              <input
                type="tel"
                value={formData.fax}
                onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.contact_principal}
                  onChange={(e) => setFormData({ ...formData, contact_principal: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium">Contact principal</span>
              </label>
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button type="submit" className="flex-1 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
              {contact ? 'Modifier' : 'Créer'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientDetails;
