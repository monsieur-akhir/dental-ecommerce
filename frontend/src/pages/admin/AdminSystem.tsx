import React, { useState, useEffect } from 'react';

interface SystemLog {
  id: number;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  timestamp: string;
  source: string;
  details?: string;
}

interface SystemMetric {
  name: string;
  value: string;
  unit: string;
  status: 'good' | 'warning' | 'error';
  trend: 'up' | 'down' | 'stable';
}

interface MaintenanceTask {
  id: number;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  scheduledAt: string;
  completedAt?: string;
  duration?: number;
}

const AdminSystem: React.FC = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'maintenance' | 'backup'>('overview');
  const [logLevel, setLogLevel] = useState<string>('all');

  useEffect(() => {
    fetchSystemData();
  }, []);

  const fetchSystemData = async () => {
    try {
      setLoading(true);
      // Simuler des données système
      const mockLogs: SystemLog[] = [
        {
          id: 1,
          level: 'info',
          message: 'Système démarré avec succès',
          timestamp: '2024-01-15T10:00:00Z',
          source: 'system'
        },
        {
          id: 2,
          level: 'warning',
          message: 'Utilisation CPU élevée: 85%',
          timestamp: '2024-01-15T09:55:00Z',
          source: 'monitoring',
          details: 'CPU usage: 85%, Memory: 72%, Disk: 45%'
        },
        {
          id: 3,
          level: 'error',
          message: 'Échec de connexion à la base de données',
          timestamp: '2024-01-15T09:50:00Z',
          source: 'database',
          details: 'Connection timeout after 30 seconds'
        },
        {
          id: 4,
          level: 'info',
          message: 'Sauvegarde automatique terminée',
          timestamp: '2024-01-15T09:45:00Z',
          source: 'backup'
        },
        {
          id: 5,
          level: 'debug',
          message: 'Requête API traitée en 150ms',
          timestamp: '2024-01-15T09:40:00Z',
          source: 'api'
        }
      ];

      const mockMetrics: SystemMetric[] = [
        {
          name: 'CPU Usage',
          value: '65',
          unit: '%',
          status: 'good',
          trend: 'stable'
        },
        {
          name: 'Memory Usage',
          value: '72',
          unit: '%',
          status: 'warning',
          trend: 'up'
        },
        {
          name: 'Disk Usage',
          value: '45',
          unit: '%',
          status: 'good',
          trend: 'stable'
        },
        {
          name: 'Network I/O',
          value: '2.5',
          unit: 'MB/s',
          status: 'good',
          trend: 'down'
        },
        {
          name: 'Active Connections',
          value: '125',
          unit: '',
          status: 'good',
          trend: 'up'
        },
        {
          name: 'Response Time',
          value: '150',
          unit: 'ms',
          status: 'good',
          trend: 'stable'
        }
      ];

      const mockMaintenanceTasks: MaintenanceTask[] = [
        {
          id: 1,
          name: 'Nettoyage des logs',
          description: 'Suppression des logs anciens de plus de 30 jours',
          status: 'completed',
          scheduledAt: '2024-01-15T02:00:00Z',
          completedAt: '2024-01-15T02:05:00Z',
          duration: 300
        },
        {
          id: 2,
          name: 'Sauvegarde de la base de données',
          description: 'Sauvegarde complète de la base de données',
          status: 'running',
          scheduledAt: '2024-01-15T03:00:00Z'
        },
        {
          id: 3,
          name: 'Mise à jour des certificats SSL',
          description: 'Renouvellement des certificats SSL expirés',
          status: 'pending',
          scheduledAt: '2024-01-16T01:00:00Z'
        },
        {
          id: 4,
          name: 'Optimisation des index',
          description: 'Recréation et optimisation des index de base de données',
          status: 'failed',
          scheduledAt: '2024-01-14T04:00:00Z',
          completedAt: '2024-01-14T04:15:00Z',
          duration: 900
        }
      ];

      setLogs(mockLogs);
      setMetrics(mockMetrics);
      setMaintenanceTasks(mockMaintenanceTasks);
    } catch (err) {
      console.error('Erreur lors du chargement des données système:', err);
    } finally {
      setLoading(false);
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      case 'debug': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getMaintenanceStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'running': return 'text-blue-600 bg-blue-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredLogs = logs.filter(log => 
    logLevel === 'all' || log.level === logLevel
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-800">Système</h1>
          <p className="text-primary-600">Monitoring et maintenance du système</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            🔄 Redémarrer
          </button>
          <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            ⚠️ Mode maintenance
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-primary-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-primary-500 hover:text-primary-700'
            }`}
          >
            Vue d'ensemble
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'logs'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-primary-500 hover:text-primary-700'
            }`}
          >
            Logs système
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'maintenance'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-primary-500 hover:text-primary-700'
            }`}
          >
            Maintenance
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'backup'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-primary-500 hover:text-primary-700'
            }`}
          >
            Sauvegardes
          </button>
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* System Status */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-primary-100">
            <h3 className="text-lg font-semibold text-primary-800 mb-4">État du système</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.map((metric, index) => (
                <div key={index} className="p-4 border border-primary-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-primary-700">{metric.name}</p>
                      <p className={`text-2xl font-bold ${getMetricStatusColor(metric.status)}`}>
                        {metric.value}{metric.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm ${getMetricStatusColor(metric.status)}`}>
                        {metric.status === 'good' && '✅'}
                        {metric.status === 'warning' && '⚠️'}
                        {metric.status === 'error' && '❌'}
                      </div>
                      <div className="text-xs text-primary-500">
                        {metric.trend === 'up' && '↗️'}
                        {metric.trend === 'down' && '↘️'}
                        {metric.trend === 'stable' && '→'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-primary-100">
              <h3 className="text-lg font-semibold text-primary-800 mb-4">Actions rapides</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">🔄</span>
                    <div>
                      <p className="font-medium text-primary-800">Vider le cache</p>
                      <p className="text-sm text-primary-600">Nettoyer le cache système</p>
                    </div>
                  </div>
                </button>
                <button className="w-full text-left p-3 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">📊</span>
                    <div>
                      <p className="font-medium text-primary-800">Générer rapport</p>
                      <p className="text-sm text-primary-600">Rapport de performance</p>
                    </div>
                  </div>
                </button>
                <button className="w-full text-left p-3 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">🔍</span>
                    <div>
                      <p className="font-medium text-primary-800">Diagnostic</p>
                      <p className="text-sm text-primary-600">Vérifier l'intégrité</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-primary-100">
              <h3 className="text-lg font-semibold text-primary-800 mb-4">Informations système</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-primary-600">Version</span>
                  <span className="text-sm font-medium text-primary-800">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-primary-600">Dernière mise à jour</span>
                  <span className="text-sm font-medium text-primary-800">2024-01-15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-primary-600">Uptime</span>
                  <span className="text-sm font-medium text-primary-800">15 jours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-primary-600">Base de données</span>
                  <span className="text-sm font-medium text-green-600">Connectée</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-primary-600">SSL</span>
                  <span className="text-sm font-medium text-green-600">Actif</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-primary-100">
            <div className="flex items-center space-x-4">
              <select
                value={logLevel}
                onChange={(e) => setLogLevel(e.target.value)}
                className="px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Tous les niveaux</option>
                <option value="error">Erreurs</option>
                <option value="warning">Avertissements</option>
                <option value="info">Informations</option>
                <option value="debug">Debug</option>
              </select>
              <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Actualiser
              </button>
            </div>
          </div>

          {/* Logs List */}
          <div className="bg-white rounded-lg shadow-sm border border-primary-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-primary-200">
                <thead className="bg-primary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                      Niveau
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-primary-200">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-primary-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLogLevelColor(log.level)}`}>
                          {log.level.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-primary-900">{log.message}</div>
                        {log.details && (
                          <div className="text-sm text-primary-500 mt-1">{log.details}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600">
                        {log.source}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Tab */}
      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-primary-100">
            <h3 className="text-lg font-semibold text-primary-800 mb-4">Tâches de maintenance</h3>
            <div className="space-y-4">
              {maintenanceTasks.map((task) => (
                <div key={task.id} className="border border-primary-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-sm font-medium text-primary-800">{task.name}</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMaintenanceStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                      <p className="text-sm text-primary-600 mt-1">{task.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-primary-500">
                        <span>Programmé: {new Date(task.scheduledAt).toLocaleString()}</span>
                        {task.completedAt && (
                          <span>Terminé: {new Date(task.completedAt).toLocaleString()}</span>
                        )}
                        {task.duration && (
                          <span>Durée: {task.duration}s</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {task.status === 'pending' && (
                        <button className="text-sm text-primary-600 hover:text-primary-800">
                          Démarrer
                        </button>
                      )}
                      {task.status === 'running' && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Backup Tab */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-primary-100">
            <h3 className="text-lg font-semibold text-primary-800 mb-4">Sauvegardes</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-medium text-primary-800 mb-3">Sauvegardes automatiques</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-primary-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-primary-800">Base de données</p>
                      <p className="text-xs text-primary-500">Quotidienne à 02:00</p>
                    </div>
                    <span className="text-sm text-green-600">✅ Actif</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-primary-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-primary-800">Fichiers</p>
                      <p className="text-xs text-primary-500">Hebdomadaire</p>
                    </div>
                    <span className="text-sm text-green-600">✅ Actif</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-md font-medium text-primary-800 mb-3">Actions</h4>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">💾</span>
                      <div>
                        <p className="font-medium text-primary-800">Sauvegarde manuelle</p>
                        <p className="text-sm text-primary-600">Créer une sauvegarde maintenant</p>
                      </div>
                    </div>
                  </button>
                  <button className="w-full text-left p-3 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">📥</span>
                      <div>
                        <p className="font-medium text-primary-800">Restaurer</p>
                        <p className="text-sm text-primary-600">Restaurer depuis une sauvegarde</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSystem; 