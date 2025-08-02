import React, { useState, useEffect } from 'react';

interface Notification {
  id: number;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  category: 'stock' | 'order' | 'user' | 'system' | 'promotion';
  isRead: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
  actionRequired?: boolean;
  actionUrl?: string;
}

interface NotificationTemplate {
  id: number;
  name: string;
  type: 'email' | 'sms' | 'push' | 'in-app';
  subject: string;
  content: string;
  isActive: boolean;
  triggers: string[];
}

const AdminNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'notifications' | 'templates' | 'settings'>('notifications');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'read' | 'unread'>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Simuler des données de notifications
      const mockNotifications: Notification[] = [
        {
          id: 1,
          type: 'warning',
          title: 'Stock faible',
          message: 'Le produit "Masques de protection" est en stock faible (5 unités restantes)',
          category: 'stock',
          isRead: false,
          createdAt: '2024-01-15T10:30:00Z',
          priority: 'high',
          actionRequired: true,
          actionUrl: '/admin/products'
        },
        {
          id: 2,
          type: 'success',
          title: 'Nouvelle commande',
          message: 'Commande #1234 reçue pour un montant de 150€',
          category: 'order',
          isRead: false,
          createdAt: '2024-01-15T09:15:00Z',
          priority: 'medium'
        },
        {
          id: 3,
          type: 'info',
          title: 'Nouveau client',
          message: 'Dr. Martin Dupont s\'est inscrit sur la plateforme',
          category: 'user',
          isRead: true,
          createdAt: '2024-01-15T08:45:00Z',
          priority: 'low'
        },
        {
          id: 4,
          type: 'error',
          title: 'Erreur système',
          message: 'Échec de synchronisation avec le système de paiement',
          category: 'system',
          isRead: false,
          createdAt: '2024-01-15T07:30:00Z',
          priority: 'high',
          actionRequired: true
        },
        {
          id: 5,
          type: 'info',
          title: 'Promotion expirée',
          message: 'La promotion "ÉTÉ2024" a expiré',
          category: 'promotion',
          isRead: true,
          createdAt: '2024-01-14T23:59:00Z',
          priority: 'medium'
        }
      ];

      const mockTemplates: NotificationTemplate[] = [
        {
          id: 1,
          name: 'Bienvenue client',
          type: 'email',
          subject: 'Bienvenue sur DentalPro',
          content: 'Bonjour {{firstName}}, bienvenue sur notre plateforme...',
          isActive: true,
          triggers: ['user_registration']
        },
        {
          id: 2,
          name: 'Commande confirmée',
          type: 'email',
          subject: 'Votre commande a été confirmée',
          content: 'Votre commande #{{orderNumber}} a été confirmée...',
          isActive: true,
          triggers: ['order_confirmed']
        },
        {
          id: 3,
          name: 'Stock faible',
          type: 'in-app',
          subject: 'Alerte stock',
          content: 'Le produit {{productName}} est en stock faible...',
          isActive: true,
          triggers: ['low_stock']
        }
      ];

      setNotifications(mockNotifications);
      setTemplates(mockTemplates);
    } catch (err) {
      console.error('Erreur lors du chargement des notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'success': return '✅';
      default: return '📢';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    const matchesCategory = filterCategory === 'all' || notif.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'read' && notif.isRead) ||
                         (filterStatus === 'unread' && !notif.isRead);
    return matchesCategory && matchesStatus;
  });

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
          <h1 className="text-2xl font-bold text-primary-800">Notifications</h1>
          <p className="text-primary-600">Gérez les alertes et notifications du système</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={markAllAsRead}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Tout marquer comme lu
          </button>
          <button className="bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            + Nouveau template
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-primary-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'notifications'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-primary-500 hover:text-primary-700'
            }`}
          >
            Notifications ({notifications.filter(n => !n.isRead).length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-primary-500 hover:text-primary-700'
            }`}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-primary-500 hover:text-primary-700'
            }`}
          >
            Paramètres
          </button>
        </nav>
      </div>

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-primary-100">
            <div className="flex items-center space-x-4">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Toutes les catégories</option>
                <option value="stock">Stock</option>
                <option value="order">Commandes</option>
                <option value="user">Utilisateurs</option>
                <option value="system">Système</option>
                <option value="promotion">Promotions</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="unread">Non lues</option>
                <option value="read">Lues</option>
              </select>
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white p-4 rounded-lg shadow-sm border border-primary-100 ${
                  !notification.isRead ? 'border-l-4 border-l-primary-500' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">{getTypeIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-primary-900">{notification.title}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </span>
                        {notification.actionRequired && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Action requise
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-primary-600 mt-1">{notification.message}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-primary-500">
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                      <div className="flex items-center space-x-2">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs text-primary-600 hover:text-primary-800"
                          >
                            Marquer comme lu
                          </button>
                        )}
                        {notification.actionUrl && (
                          <button className="text-xs text-accent-600 hover:text-accent-800">
                            Voir détails
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredNotifications.length === 0 && (
              <div className="text-center py-12">
                <div className="text-primary-400 text-lg">Aucune notification trouvée</div>
                <p className="text-primary-500 mt-2">Toutes les notifications sont à jour</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {templates.map((template) => (
              <div key={template.id} className="bg-white p-6 rounded-lg shadow-sm border border-primary-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-primary-800">{template.name}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {template.isActive ? 'Actif' : 'Inactif'}
                    </span>
                    <button className="text-primary-600 hover:text-primary-800">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-primary-700">Type</label>
                    <span className="text-sm text-primary-600 capitalize">{template.type}</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700">Sujet</label>
                    <span className="text-sm text-primary-600">{template.subject}</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700">Déclencheurs</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {template.triggers.map((trigger, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {trigger}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-primary-100">
                  <div className="flex items-center justify-between">
                    <button className="text-sm text-primary-600 hover:text-primary-800">
                      Prévisualiser
                    </button>
                    <button className="text-sm text-red-600 hover:text-red-800">
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-primary-100">
            <h3 className="text-lg font-semibold text-primary-800 mb-4">Paramètres de notifications</h3>
            
            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="rounded border-primary-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-primary-700">Activer les notifications par email</span>
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="rounded border-primary-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-primary-700">Activer les notifications push</span>
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-primary-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-primary-700">Activer les notifications SMS</span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-primary-100">
            <h3 className="text-lg font-semibold text-primary-800 mb-4">Alertes automatiques</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Seuil d'alerte stock faible
                </label>
                <input
                  type="number"
                  defaultValue={10}
                  className="w-32 px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-primary-600">unités</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Fréquence des rapports
                </label>
                <select className="px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option>Quotidien</option>
                  <option>Hebdomadaire</option>
                  <option>Mensuel</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications; 