import React, { useState, useEffect } from 'react';
import { planningService } from '../services/api';
import { Factory, Package, GripVertical, CheckCircle, XCircle } from 'lucide-react';

interface OF {
  id_of: number;
  numero_of: string;
  article: string;
  quantite: number;
  priorite: string;
}

interface Machine {
  id_machine: number;
  numero_machine: string;
  statut: string;
  ofEnCours: any[];
  ofEnAttente: any[];
}

const PlanningDragDrop: React.FC = () => {
  const [ofEnAttente, setOfEnAttente] = useState<OF[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedOF, setDraggedOF] = useState<{ of: OF; source: string; sourceId?: number } | null>(null);
  const [dragOverZone, setDragOverZone] = useState<string | null>(null);

  useEffect(() => {
    loadPlanning();
  }, []);

  const loadPlanning = async () => {
    setLoading(true);
    try {
      const res = await planningService.getPlanning();
      setOfEnAttente(res.data.data.ofEnAttente || []);
      setMachines(res.data.data.machines || []);
    } catch (err) {
      console.error('Erreur chargement planning:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, of: OF, source: string, sourceId?: number) => {
    setDraggedOF({ of, source, sourceId });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ''); // Nécessaire pour Firefox
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (zoneId: string) => {
    setDragOverZone(zoneId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Ne pas réinitialiser si on entre dans un enfant
    if (e.currentTarget === e.target) {
      setDragOverZone(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedOF(null);
    setDragOverZone(null);
  };

  const handleDrop = async (e: React.DragEvent, machineId: number, position: 'en_cours' | 'en_attente') => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedOF) return;

    const zoneId = `machine-${machineId}-${position}`;
    setDragOverZone(null);

    try {
      await planningService.assignMachine(machineId, { 
        ofId: draggedOF.of.id_of, 
        position 
      });
      
      setDraggedOF(null);
      await loadPlanning();
    } catch (err: any) {
      console.error('Erreur assignation:', err);
      alert(err.response?.data?.error?.message || 'Erreur lors de l\'assignation');
      setDraggedOF(null);
    }
  };

  const getPriorityColor = (priorite: string) => {
    switch (priorite) {
      case 'urgente': return 'bg-red-100 border-red-300 text-red-800';
      case 'haute': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'normale': return 'bg-blue-100 border-blue-300 text-blue-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="ml-64 p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Factory className="w-8 h-8" />
            Planning de Fabrication
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Colonne OF en attente */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                OF en Attente ({ofEnAttente.length})
              </h2>
              <div 
                className="space-y-2 min-h-[200px]"
                onDragOver={handleDragOver}
                onDragEnter={() => handleDragEnter('attente')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverZone(null);
                }}
              >
                {ofEnAttente.map((of) => (
                  <div
                    key={of.id_of}
                    draggable
                    onDragStart={(e) => handleDragStart(e, of, 'attente')}
                    onDragEnd={handleDragEnd}
                    className={`p-3 border-2 rounded cursor-move transition-all hover:shadow-md ${
                      draggedOF?.of.id_of === of.id_of 
                        ? 'opacity-50' 
                        : getPriorityColor(of.priorite)
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-sm">{of.numero_of}</span>
                    </div>
                    <div className="text-xs text-gray-600">{of.article}</div>
                    <div className="text-xs text-gray-500">Qté: {of.quantite}</div>
                    <div className="text-xs mt-1">
                      <span className={`px-1.5 py-0.5 rounded text-xs ${
                        of.priorite === 'urgente' ? 'bg-red-200' :
                        of.priorite === 'haute' ? 'bg-orange-200' :
                        'bg-blue-200'
                      }`}>
                        {of.priorite}
                      </span>
                    </div>
                  </div>
                ))}
                {ofEnAttente.length === 0 && (
                  <div className="text-xs text-gray-400 text-center py-8">
                    Aucun OF en attente
                  </div>
                )}
              </div>
            </div>

            {/* Colonnes Machines */}
            {machines.map((machine) => (
              <div key={machine.id_machine} className="bg-white rounded-lg shadow p-4">
                <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Factory className="w-5 h-5" />
                  {machine.numero_machine}
                </h2>
                <div className={`text-xs mb-4 px-2 py-1 rounded inline-block ${
                  machine.statut === 'operationnel' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {machine.statut}
                </div>

                {/* OF en cours */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    En Cours ({machine.ofEnCours.length})
                  </h3>
                  <div
                    onDragOver={handleDragOver}
                    onDragEnter={() => handleDragEnter(`machine-${machine.id_machine}-en_cours`)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, machine.id_machine, 'en_cours')}
                    className={`min-h-[120px] p-2 rounded transition-all ${
                      dragOverZone === `machine-${machine.id_machine}-en_cours`
                        ? 'bg-green-100 border-2 border-green-500 border-dashed'
                        : 'bg-green-50 border-2 border-dashed border-green-300'
                    }`}
                  >
                    {machine.ofEnCours.map((of) => (
                      <div
                        key={of.id_of}
                        draggable
                        onDragStart={(e) => handleDragStart(e, { 
                          id_of: of.id_of, 
                          numero_of: of.numero_of || 'OF-' + of.id_of,
                          article: '',
                          quantite: 0,
                          priorite: 'normale'
                        }, 'machine', machine.id_machine)}
                        onDragEnd={handleDragEnd}
                        className={`p-2 bg-green-100 rounded mb-2 text-xs cursor-move hover:bg-green-200 transition-all ${
                          draggedOF?.of.id_of === of.id_of ? 'opacity-50' : ''
                        }`}
                      >
                        {of.numero_of || `OF-${of.id_of}`}
                      </div>
                    ))}
                    {machine.ofEnCours.length === 0 && (
                      <div className="text-xs text-gray-400 text-center py-4">
                        {dragOverZone === `machine-${machine.id_machine}-en_cours` 
                          ? '⬇️ Déposer ici' 
                          : 'Déposer ici'}
                      </div>
                    )}
                  </div>
                </div>

                {/* OF en attente */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <XCircle className="w-4 h-4 text-yellow-600" />
                    En Attente ({machine.ofEnAttente.length})
                  </h3>
                  <div
                    onDragOver={handleDragOver}
                    onDragEnter={() => handleDragEnter(`machine-${machine.id_machine}-en_attente`)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, machine.id_machine, 'en_attente')}
                    className={`min-h-[120px] p-2 rounded transition-all ${
                      dragOverZone === `machine-${machine.id_machine}-en_attente`
                        ? 'bg-yellow-100 border-2 border-yellow-500 border-dashed'
                        : 'bg-yellow-50 border-2 border-dashed border-yellow-300'
                    }`}
                  >
                    {machine.ofEnAttente.map((of) => (
                      <div
                        key={of.id_of}
                        draggable
                        onDragStart={(e) => handleDragStart(e, { 
                          id_of: of.id_of, 
                          numero_of: of.numero_of || 'OF-' + of.id_of,
                          article: '',
                          quantite: 0,
                          priorite: 'normale'
                        }, 'machine', machine.id_machine)}
                        onDragEnd={handleDragEnd}
                        className={`p-2 bg-yellow-100 rounded mb-2 text-xs cursor-move hover:bg-yellow-200 transition-all ${
                          draggedOF?.of.id_of === of.id_of ? 'opacity-50' : ''
                        }`}
                      >
                        {of.numero_of || `OF-${of.id_of}`}
                      </div>
                    ))}
                    {machine.ofEnAttente.length === 0 && (
                      <div className="text-xs text-gray-400 text-center py-4">
                        {dragOverZone === `machine-${machine.id_machine}-en_attente` 
                          ? '⬇️ Déposer ici' 
                          : 'Déposer ici'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanningDragDrop;
