import React, { useState, useEffect } from 'react';
import { orderService, userService } from '../../services/api';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalUsers: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Appels réels aux APIs pour récupérer les statistiques
      const [orderStats, userStats] = await Promise.all([
        orderService.getStats(),
        userService.getStats()
      ]);
      
      setStats({
        totalOrders: orderStats?.totalOrders || 0,
        totalRevenue: orderStats?.totalRevenue || 0,
        pendingOrders: orderStats?.pendingOrders || 0,
        completedOrders: orderStats?.completedOrders || 0,
        totalUsers: userStats?.totalUsers || 0,
        activeUsers: userStats?.activeUsers || 0,
      });
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary-800">Tableau de bord</h1>
        <p className="text-primary-600 mt-2">Vue d'ensemble de votre boutique</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">💰</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-primary-600">Chiffre d'affaires</p>
              <p className="text-2xl font-bold text-primary-800">
                {Number(stats.totalRevenue).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">📦</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-primary-600">Commandes totales</p>
              <p className="text-2xl font-bold text-primary-800">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">⏳</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-primary-600">Commandes en attente</p>
              <p className="text-2xl font-bold text-primary-800">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">👥</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-primary-600">Utilisateurs actifs</p>
              <p className="text-2xl font-bold text-primary-800">{stats.activeUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques et activités récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h3 className="text-lg font-semibold text-primary-800 mb-4">Activité récente</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-primary-800">Nouvelle commande #1234</p>
                <p className="text-xs text-primary-500">Il y a 5 minutes</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-primary-800">Nouveau client inscrit</p>
                <p className="text-xs text-primary-500">Il y a 15 minutes</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-primary-800">Commande expédiée #1230</p>
                <p className="text-xs text-primary-500">Il y a 1 heure</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <h3 className="text-lg font-semibold text-primary-800 mb-4">Statistiques rapides</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-primary-600">Taux de conversion</span>
              <span className="text-sm font-semibold text-primary-800">3.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-primary-600">Panier moyen</span>
              <span className="text-sm font-semibold text-primary-800">36.50 €</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-primary-600">Produits vendus</span>
              <span className="text-sm font-semibold text-primary-800">2,450</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

