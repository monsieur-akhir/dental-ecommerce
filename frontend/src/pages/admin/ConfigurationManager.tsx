import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

interface Configuration {
  id: number;
  key: string;
  value: string;
  valueType: string;
  label: string;
  description: string;
  category: string;
  isPublic: boolean;
  isRequired: boolean;
  sortOrder: number;
  validation?: string;
  defaultValue?: string;
  createdAt: string;
  updatedAt: string;
}

interface ConfigurationFormData {
  [key: string]: any;
}

const ConfigurationManager: React.FC = () => {
  const { user } = useAuth();
  const [configurations, setConfigurations] = useState<Configuration[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<ConfigurationFormData>({});
  const [searchTerm, setSearchTerm] = useState('');

  const fetchConfigurations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/config');
      setConfigurations(response.data);
      
      // Initialiser le formData avec les valeurs actuelles
      const initialFormData: ConfigurationFormData = {};
      response.data.forEach((config: Configuration) => {
        initialFormData[config.key] = parseValue(config.value, config.valueType);
      });
      setFormData(initialFormData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/config/categories/list');
      setCategories(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des catégories:', err);
    }
  }, []);

  useEffect(() => {
    fetchConfigurations();
    fetchCategories();
  }, [fetchConfigurations, fetchCategories]);

  const parseValue = (value: string, valueType: string): any => {
    switch (valueType) {
      case 'number':
        return parseFloat(value);
      case 'boolean':
        return value === 'true';
      case 'json':
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      default:
        return value;
    }
  };

  const formatValue = (value: any, valueType: string): string => {
    switch (valueType) {
      case 'json':
        return JSON.stringify(value, null, 2);
      case 'boolean':
        return value ? 'true' : 'false';
      default:
        return String(value);
    }
  };

  const handleInputChange = (key: string, value: any, valueType: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await api.put('/config/multiple', formData);

      setSuccess('Configurations mises à jour avec succès !');
      
      // Recharger les configurations
      await fetchConfigurations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const initialFormData: ConfigurationFormData = {};
    configurations.forEach((config) => {
      initialFormData[config.key] = parseValue(config.value, config.valueType);
    });
    setFormData(initialFormData);
    setError(null);
    setSuccess(null);
  };

  const filteredConfigurations = configurations.filter(config => {
    const matchesCategory = selectedCategory === 'all' || config.category === selectedCategory;
    const matchesSearch = config.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         config.key.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderInput = (config: Configuration) => {
    const value = formData[config.key];
    const key = config.key;

    switch (config.valueType) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id={key}
              checked={value || false}
              onChange={(e) => handleInputChange(key, e.target.checked, config.valueType)}
              className="w-4 h-4 text-accent-600 border-primary-300 rounded focus:ring-accent-500"
            />
            <label htmlFor={key} className="text-sm text-primary-600">
              {value ? 'Activé' : 'Désactivé'}
            </label>
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleInputChange(key, parseFloat(e.target.value) || 0, config.valueType)}
            className="form-input w-full"
            step={config.key.includes('PERCENTAGE') ? '0.01' : '1'}
          />
        );

      case 'json':
        return (
          <textarea
            value={formatValue(value, config.valueType)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleInputChange(key, parsed, config.valueType);
              } catch {
                // Garder la valeur brute si le JSON n'est pas valide
                handleInputChange(key, e.target.value, config.valueType);
              }
            }}
            className="form-input w-full h-24 font-mono text-sm"
            placeholder="{}"
          />
        );

      case 'image':
      case 'url':
        return (
          <input
            type="url"
            value={value || ''}
            onChange={(e) => handleInputChange(key, e.target.value, config.valueType)}
            className="form-input w-full"
            placeholder="https://..."
          />
        );

      case 'email':
        return (
          <input
            type="email"
            value={value || ''}
            onChange={(e) => handleInputChange(key, e.target.value, config.valueType)}
            className="form-input w-full"
            placeholder="email@exemple.com"
          />
        );

      case 'phone':
        return (
          <input
            type="tel"
            value={value || ''}
            onChange={(e) => handleInputChange(key, e.target.value, config.valueType)}
            className="form-input w-full"
            placeholder="+33 1 23 45 67 89"
          />
        );

      case 'color':
        return (
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={value || '#000000'}
              onChange={(e) => handleInputChange(key, e.target.value, config.valueType)}
              className="w-12 h-10 border border-primary-200 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleInputChange(key, e.target.value, config.valueType)}
              className="form-input flex-1"
              placeholder="#000000"
            />
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleInputChange(key, e.target.value, config.valueType)}
            className="form-input w-full"
          />
        );
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      general: '🏠',
      contact: '📞',
      shipping: '🚚',
      tax: '💰',
      payment: '💳',
      homepage: '🏠',
      categories: '📂',
      display: '👁️',
      stock: '📦',
      security: '🔒',
      maintenance: '🔧',
      email: '📧',
      seo: '🔍',
      social: '📱'
    };
    return icons[category] || '⚙️';
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      general: 'Général',
      contact: 'Contact',
      shipping: 'Livraison',
      tax: 'Fiscalité',
      payment: 'Paiement',
      homepage: 'Page d\'accueil',
      categories: 'Catégories',
      display: 'Affichage',
      stock: 'Stock',
      security: 'Sécurité',
      maintenance: 'Maintenance',
      email: 'Email',
      seo: 'SEO',
      social: 'Réseaux sociaux'
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="loader w-12 h-12 mx-auto mb-4"></div>
            <p className="text-primary-600">Chargement des configurations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12">
      <div className="container mx-auto px-4">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-primary-800 mb-2">
            Gestionnaire de Configuration
          </h1>
          <p className="text-primary-600">
            Configurez tous les paramètres de votre site e-commerce
          </p>
        </div>

        {/* Messages d'état */}
        {error && (
          <div className="mb-6 bg-error-50 border-l-4 border-error-400 p-4 rounded-xl">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-error-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-error-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-success-50 border-l-4 border-success-400 p-4 rounded-xl">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-success-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-success-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filtres et actions */}
        <div className="bg-white rounded-2xl shadow-soft p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Filtres */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              {/* Recherche */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher une configuration..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10 w-full sm:w-64"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Filtre par catégorie */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-select w-full sm:w-48"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {getCategoryIcon(category)} {getCategoryLabel(category)}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={handleReset}
                className="btn btn-secondary"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Réinitialiser
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? (
                  <>
                    <div className="loader w-4 h-4 mr-2"></div>
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Sauvegarder
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Liste des configurations */}
        <div className="space-y-6">
          {filteredConfigurations.map((config) => (
            <div key={config.id} className="bg-white rounded-2xl shadow-soft p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Informations */}
                <div className="lg:col-span-1">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{getCategoryIcon(config.category)}</span>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-primary-800 mb-1">
                        {config.label}
                      </h3>
                      <p className="text-sm text-primary-600 mb-2">
                        {config.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="badge badge-primary">
                          {config.category}
                        </span>
                        {config.isRequired && (
                          <span className="badge badge-error">
                            Requis
                          </span>
                        )}
                        {config.isPublic ? (
                          <span className="badge badge-success">
                            Public
                          </span>
                        ) : (
                          <span className="badge badge-secondary">
                            Privé
                          </span>
                        )}
                        <span className="badge badge-accent">
                          {config.valueType}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Valeur */}
                <div className="lg:col-span-2">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-primary-700">
                      Valeur actuelle
                    </label>
                    {renderInput(config)}
                    {config.defaultValue && (
                      <p className="text-xs text-primary-500">
                        Valeur par défaut: {config.defaultValue}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message si aucune configuration trouvée */}
        {filteredConfigurations.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-primary-800 mb-2">
              Aucune configuration trouvée
            </h3>
            <p className="text-primary-600">
              Essayez de modifier vos critères de recherche ou de filtrage.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigurationManager; 