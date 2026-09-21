import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { excelImportService } from '../services/api';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download, Info } from 'lucide-react';

const ImportExcel: React.FC = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);

  const importTypes = [
    { value: 'commandes', label: 'Commandes', description: 'Import des commandes clients', icon: '📋' },
    { value: 'bom', label: 'Nomenclatures (BOM)', description: 'Import des nomenclatures produits', icon: '🔧' },
    { value: 'soustraitants', label: 'Sous-traitants', description: 'Import des sous-traitants', icon: '👥' },
    { value: 'matieres_premieres', label: 'Matières Premières', description: 'Import des matières premières', icon: '📦' },
    { value: 'qualite', label: 'Qualité et Rendement', description: 'Import des données qualité', icon: '✅' },
    { value: 'parametrages', label: 'Paramétrages', description: 'Import des paramétrages', icon: '⚙️' },
    { value: 'donnees_collecte', label: 'Données Collecte', description: 'Import des données collectées', icon: '📊' },
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await excelImportService.getTemplates();
      if (response.data?.data?.types) {
        setTemplates(response.data.data.types || []);
      }
    } catch (error: any) {
      console.error('Erreur chargement templates:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Seuls les fichiers Excel (.xlsx, .xls) sont acceptés');
        setSelectedFile(null);
      }
    }
  };

  const handleUpload = async () => {
    // Cette page redirige maintenant vers Paramétrage où le mapping est disponible
    navigate('/parametrage');
  };

  const getTemplateInfo = (type: string) => {
    const template = templates.find(t => t.type === type);
    return template;
  };

  return (
    <div className="ml-64 p-6 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <FileSpreadsheet className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Import de données Excel</h1>
              <p className="text-gray-600">Chargez vos données depuis des fichiers Excel</p>
            </div>
          </div>

          {/* Sélection du type d'import */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type d'import *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {importTypes.map((type) => {
                const template = getTemplateInfo(type.value);
                return (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      selectedType === type.value
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{type.icon}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{type.label}</div>
                        <div className="text-sm text-gray-600 mt-1">{type.description}</div>
                        {template && (
                          <div className="mt-2 text-xs text-gray-500">
                            <div className="font-medium">Colonnes requises:</div>
                            <div>{template.colonnes_requises.join(', ') || 'Aucune'}</div>
                          </div>
                        )}
                      </div>
                      {selectedType === type.value && (
                        <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sélection du fichier */}
          {selectedType && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fichier Excel *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  id="file-input"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor="file-input"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="h-12 w-12 text-gray-400 mb-3" />
                  <span className="text-sm font-medium text-gray-700">
                    {selectedFile ? selectedFile.name : 'Cliquez pour sélectionner un fichier Excel'}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    Formats acceptés: .xlsx, .xls (max 10MB)
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Informations sur le format */}
          {selectedType && getTemplateInfo(selectedType) && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-blue-900 mb-2">Format attendu</div>
                  {getTemplateInfo(selectedType).colonnes_requises.length > 0 && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-blue-800">Colonnes requises: </span>
                      <span className="text-sm text-blue-700">
                        {getTemplateInfo(selectedType).colonnes_requises.join(', ')}
                      </span>
                    </div>
                  )}
                  {getTemplateInfo(selectedType).colonnes_optionnelles.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-blue-800">Colonnes optionnelles: </span>
                      <span className="text-sm text-blue-700">
                        {getTemplateInfo(selectedType).colonnes_optionnelles.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bouton d'import - Redirige vers Paramétrage pour le mapping */}
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 mb-2">
              <strong>Note :</strong> L'import avec mapping des colonnes est maintenant disponible dans la section Paramétrage.
            </p>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleUpload}
              disabled={!selectedFile || !selectedType}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Aller à Paramétrage pour mapper les colonnes</span>
            </button>
          </div>

          {/* Messages d'erreur */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* Résultat de l'import */}
          {result && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-semibold text-green-900 mb-2">{result.message}</div>
                  {result.data && (
                    <div className="text-sm text-green-700 space-y-1">
                      <div>Total lignes: {result.data.total}</div>
                      <div>Enregistrements insérés: {result.data.inserted}</div>
                      {result.data.updated > 0 && (
                        <div>Enregistrements mis à jour: {result.data.updated}</div>
                      )}
                      {result.data.errors && result.data.errors.length > 0 && (
                        <div className="mt-2">
                          <div className="font-medium">Erreurs ({result.data.errors.length}):</div>
                          <ul className="list-disc list-inside text-xs space-y-1">
                            {result.data.errors.slice(0, 10).map((err: any, idx: number) => (
                              <li key={idx}>Ligne {err.ligne}: {err.erreur}</li>
                            ))}
                            {result.data.errors.length > 10 && (
                              <li>... et {result.data.errors.length - 10} autres erreurs</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Liste des fichiers disponibles dans Excel fab */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Fichiers disponibles</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div>📋 <strong>Commandes 2024-2025.xlsx</strong> - Import type: commandes</div>
            <div>📋 <strong>Commandes 2025-2026.xlsx</strong> - Import type: commandes</div>
            <div>🔧 <strong>BOM 2025-2026.xlsx</strong> - Import type: bom</div>
            <div>👥 <strong>SOUS TRAITANT.xlsx</strong> - Import type: soustraitants</div>
            <div>📦 <strong>Suivis Matière Première 2025-2026.xlsx</strong> - Import type: matieres_premieres</div>
            <div>✅ <strong>Qualite et Rendement.xlsx</strong> - Import type: qualite</div>
            <div>⚙️ <strong>Paramétrages.xlsx</strong> - Import type: parametrages</div>
            <div>📊 <strong>Donnée collecte.xlsx</strong> - Import type: donnees_collecte</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportExcel;
