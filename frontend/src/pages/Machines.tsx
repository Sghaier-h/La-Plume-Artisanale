import React, { useEffect, useState } from 'react';
import { machinesService } from '../services/api';

const Machines: React.FC = () => {
  const [machines, setMachines] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMachine, setEditingMachine] = useState<any>(null);
  const [selectedMachine, setSelectedMachine] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ type: '', statut: '' });

  const [formData, setFormData] = useState({
    numero_machine: '',
    id_type_machine: '',
    marque: '',
    modele: '',
    numero_serie: '',
    annee_fabrication: '',
    date_mise_service: '',
    statut: 'operationnel',
    vitesse_nominale: '',
    largeur_utile: '',
    capacite_production: '',
    emplacement: '',
    actif: true
  });

  useEffect(() => {
    loadData();
  }, [filters, search]);

  const loadData = async () => {
    try {
      const [machinesRes, typesRes] = await Promise.all([
        machinesService.getMachines({ ...filters, search }),
        machinesService.getTypesMachines()
      ]);
      setMachines(machinesRes.data.data);
      setTypes(typesRes.data.data);
    } catch (error) {
      console.error('Erreur chargement machines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMachine) {
        await machinesService.updateMachine(editingMachine.id_machine, formData);
      } else {
        await machinesService.createMachine(formData);
      }
      setShowForm(false);
      setEditingMachine(null);
      resetForm();
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Erreur');
    }
  };

  const handleEdit = (machine: any) => {
    setEditingMachine(machine);
    setFormData({
      numero_machine: machine.numero_machine,
      id_type_machine: machine.id_type_machine || '',
      marque: machine.marque || '',
      modele: machine.modele || '',
      numero_serie: machine.numero_serie || '',
      annee_fabrication: machine.annee_fabrication || '',
      date_mise_service: machine.date_mise_service ? machine.date_mise_service.split('T')[0] : '',
      statut: machine.statut || 'operationnel',
      vitesse_nominale: machine.vitesse_nominale || '',
      largeur_utile: machine.largeur_utile || '',
      capacite_production: machine.capacite_production || '',
      emplacement: machine.emplacement || '',
      actif: machine.actif
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      numero_machine: '',
      id_type_machine: '',
      marque: '',
      modele: '',
      numero_serie: '',
      annee_fabrication: '',
      date_mise_service: '',
      statut: 'operationnel',
      vitesse_nominale: '',
      largeur_utile: '',
      capacite_production: '',
      emplacement: '',
      actif: true
    });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="ml-64 p-6">
        <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">⚙️ Machines</h1>
          <button
            onClick={() => { setShowForm(true); setEditingMachine(null); resetForm(); }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Nouvelle Machine
          </button>
        </div>

        {/* Filtres */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border rounded"
            />
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-4 py-2 border rounded"
            >
              <option value="">Tous les types</option>
              {types.map((type) => (
                <option key={type.id_type_machine} value={type.id_type_machine}>{type.libelle}</option>
              ))}
            </select>
            <select
              value={filters.statut}
              onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
              className="px-4 py-2 border rounded"
            >
              <option value="">Tous les statuts</option>
              <option value="operationnel">Opérationnel</option>
              <option value="en_panne">En panne</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">{editingMachine ? 'Modifier' : 'Nouvelle'} Machine</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Numéro Machine *</label>
                  <input
                    type="text"
                    required
                    value={formData.numero_machine}
                    onChange={(e) => setFormData({ ...formData, numero_machine: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type Machine *</label>
                  <select
                    required
                    value={formData.id_type_machine}
                    onChange={(e) => setFormData({ ...formData, id_type_machine: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  >
                    <option value="">Sélectionner...</option>
                    {types.map((type) => (
                      <option key={type.id_type_machine} value={type.id_type_machine}>{type.libelle}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Marque</label>
                  <input
                    type="text"
                    value={formData.marque}
                    onChange={(e) => setFormData({ ...formData, marque: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Modèle</label>
                  <input
                    type="text"
                    value={formData.modele}
                    onChange={(e) => setFormData({ ...formData, modele: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Statut</label>
                  <select
                    value={formData.statut}
                    onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  >
                    <option value="operationnel">Opérationnel</option>
                    <option value="en_panne">En panne</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Emplacement</label>
                  <input
                    type="text"
                    value={formData.emplacement}
                    onChange={(e) => setFormData({ ...formData, emplacement: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                  {editingMachine ? 'Modifier' : 'Créer'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingMachine(null); resetForm(); }} className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numéro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marque/Modèle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Emplacement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {machines.map((machine) => (
                <tr key={machine.id_machine}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{machine.numero_machine}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{machine.type_machine || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{machine.marque} {machine.modele}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded ${
                      machine.statut === 'operationnel' ? 'bg-green-100 text-green-800' :
                      machine.statut === 'en_panne' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {machine.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{machine.emplacement || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button onClick={() => setSelectedMachine(machine)} className="text-blue-600 hover:text-blue-900 mr-3">Voir</button>
                    <button onClick={() => handleEdit(machine)} className="text-blue-600 hover:text-blue-900">Modifier</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Machines;
