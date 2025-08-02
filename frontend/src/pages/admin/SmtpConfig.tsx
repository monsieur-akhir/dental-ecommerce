import React, { useState, useEffect } from 'react';
import { smtpConfigService, SmtpConfig, CreateSmtpConfigDto, TestResult } from '../../services/smtpConfigService';

const SmtpConfigPage: React.FC = () => {
  const [configs, setConfigs] = useState<SmtpConfig[]>([]);
  const [activeConfig, setActiveConfig] = useState<SmtpConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SmtpConfig | null>(null);
  const [formData, setFormData] = useState<CreateSmtpConfigDto>({
    host: 'smtp.gmail.com',
    port: 587,
    username: '',
    password: '',
    adminEmail: '',
    secure: false,
    auth: true,
    starttls: true,
    connectionTimeout: 5000,
    timeout: 3000,
    writeTimeout: 5000,
    debug: false,
    isActive: false,
    description: ''
  });
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const [allConfigs, active] = await Promise.all([
        smtpConfigService.getAll(),
        smtpConfigService.getActive()
      ]);
      setConfigs(allConfigs);
      setActiveConfig(active);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingConfig) {
        await smtpConfigService.update(editingConfig.id, formData);
      } else {
        await smtpConfigService.create(formData);
      }
      setShowForm(false);
      setEditingConfig(null);
      resetForm();
      loadConfigs();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (config: SmtpConfig) => {
    setEditingConfig(config);
    setFormData({
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
      adminEmail: config.adminEmail || '',
      secure: config.secure,
      auth: config.auth,
      starttls: config.starttls,
      connectionTimeout: config.connectionTimeout,
      timeout: config.timeout,
      writeTimeout: config.writeTimeout,
      debug: config.debug,
      isActive: config.isActive,
      description: config.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette configuration ?')) {
      try {
        await smtpConfigService.delete(id);
        loadConfigs();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await smtpConfigService.activate(id);
      loadConfigs();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'activation');
    }
  };

  const handleTestConnection = async (id: number) => {
    try {
      const result = await smtpConfigService.testConnection(id);
      setTestResult(result);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.response?.data?.message || 'Erreur lors du test de connexion'
      });
    }
  };

  const handleTestEmail = async (id: number) => {
    if (!testEmail) {
      setError('Veuillez saisir une adresse email pour le test');
      return;
    }
    try {
      const result = await smtpConfigService.testEmail(id, testEmail);
      setTestResult(result);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.response?.data?.message || 'Erreur lors du test d\'email'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      host: 'smtp.gmail.com',
      port: 587,
      username: '',
      password: '',
      adminEmail: '',
      secure: false,
      auth: true,
      starttls: true,
      connectionTimeout: 5000,
      timeout: 3000,
      writeTimeout: 5000,
      debug: false,
      isActive: false,
      description: ''
    });
  };

  const loadPreset = (presetName: string) => {
    const presets = smtpConfigService.getPresetConfigs();
    const preset = presets[presetName as keyof typeof presets];
    if (preset) {
      setFormData(prev => ({ ...prev, ...preset }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Configuration SMTP</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Nouvelle Configuration
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {testResult && (
          <div className={`border px-4 py-3 rounded mb-4 ${
            testResult.success ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'
          }`}>
            <strong>{testResult.success ? '✅ Succès' : '❌ Erreur'}:</strong> {testResult.message}
            {testResult.details && (
              <details className="mt-2">
                <summary className="cursor-pointer">Détails</summary>
                <pre className="mt-2 text-sm bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(testResult.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Configuration Active */}
        {activeConfig && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-green-800 mb-2">Configuration Active</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Host:</span> {activeConfig.host}
              </div>
              <div>
                <span className="font-medium">Port:</span> {activeConfig.port}
              </div>
              <div>
                <span className="font-medium">Username:</span> {activeConfig.username}
              </div>
              <div>
                <span className="font-medium">Admin Email:</span> {activeConfig.adminEmail || 'Non défini'}
              </div>
            </div>
          </div>
        )}

        {/* Formulaire */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingConfig ? 'Modifier la Configuration' : 'Nouvelle Configuration'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Configurations prédéfinies */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Configurations prédéfinies
                </label>
                <div className="flex gap-2">
                  {Object.keys(smtpConfigService.getPresetConfigs()).map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => loadPreset(preset)}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      {preset.charAt(0).toUpperCase() + preset.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Host</label>
                  <input
                    type="text"
                    value={formData.host}
                    onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Port</label>
                  <input
                    type="number"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Username (Email)</label>
                  <input
                    type="email"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Admin Email</label>
                  <input
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Connection Timeout (ms)</label>
                  <input
                    type="number"
                    value={formData.connectionTimeout}
                    onChange={(e) => setFormData({ ...formData, connectionTimeout: parseInt(e.target.value) })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Timeout (ms)</label>
                  <input
                    type="number"
                    value={formData.timeout}
                    onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Write Timeout (ms)</label>
                  <input
                    type="number"
                    value={formData.writeTimeout}
                    onChange={(e) => setFormData({ ...formData, writeTimeout: parseInt(e.target.value) })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.secure}
                    onChange={(e) => setFormData({ ...formData, secure: e.target.checked })}
                    className="mr-2"
                  />
                  Secure (SSL/TLS)
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.auth}
                    onChange={(e) => setFormData({ ...formData, auth: e.target.checked })}
                    className="mr-2"
                  />
                  Authentification
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.starttls}
                    onChange={(e) => setFormData({ ...formData, starttls: e.target.checked })}
                    className="mr-2"
                  />
                  STARTTLS
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.debug}
                    onChange={(e) => setFormData({ ...formData, debug: e.target.checked })}
                    className="mr-2"
                  />
                  Debug
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  Activer
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {editingConfig ? 'Mettre à jour' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingConfig(null);
                    resetForm();
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des configurations */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Configurations SMTP</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Configuration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {configs.map((config) => (
                  <tr key={config.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {config.description || `${config.host}:${config.port}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          {config.username}
                        </div>
                        <div className="text-xs text-gray-400">
                          Créé le {new Date(config.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        config.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {config.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        <button
                          onClick={() => handleTestConnection(config.id)}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                        >
                          Test Connexion
                        </button>
                        <div className="flex gap-1">
                          <input
                            type="email"
                            placeholder="Email de test"
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1 w-32"
                          />
                          <button
                            onClick={() => handleTestEmail(config.id)}
                            className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                          >
                            Test Email
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(config)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Modifier
                        </button>
                        {!config.isActive && (
                          <button
                            onClick={() => handleActivate(config.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Activer
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(config.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Supprimer
                        </button>
                      </div>
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

export default SmtpConfigPage; 