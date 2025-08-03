import React, { useState, useEffect } from 'react';
import { reportsService } from '../../services/api';

interface ReportData {
  sales: {
    total: number;
    monthly: { month: string; amount: number }[];
    daily: { date: string; amount: number }[];
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
    monthly: { month: string; count: number }[];
  };
  products: {
    total: number;
    active: number;
    lowStock: number;
    topSelling: { id: number; name: string; sales: number }[];
  };
  users: {
    total: number;
    active: number;
    newThisMonth: number;
    monthly: { month: string; count: number }[];
  };
}

const AdminReports: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Fonction pour calculer le pourcentage de changement
  const calculateChangePercentage = (current: number, previous: number): string => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? "+" : "";
    return `${sign}${Math.round(change * 10) / 10}%`;
  };

  // Fonction pour obtenir les données de la période précédente (simulation)
  const getPreviousPeriodData = (currentData: number): number => {
    // Simulation basée sur les données actuelles
    return Math.max(0, Math.floor(currentData * 0.8)); // 20% de réduction pour simuler
  };

  // Fonction pour générer un rapport CSV
  const generateCSVReport = (): string => {
    const headers = [
      'Métrique',
      'Valeur',
      'Période',
      'Date d\'export'
    ];

    const rows = [
      ['Chiffre d\'affaires total', `${reportData?.sales.total.toLocaleString()}€`, selectedPeriod, new Date().toLocaleDateString()],
      ['Nombre total de commandes', reportData?.orders.total.toString() || '0', selectedPeriod, new Date().toLocaleDateString()],
      ['Commandes en attente', reportData?.orders.pending.toString() || '0', selectedPeriod, new Date().toLocaleDateString()],
      ['Commandes complétées', reportData?.orders.completed.toString() || '0', selectedPeriod, new Date().toLocaleDateString()],
      ['Commandes annulées', reportData?.orders.cancelled.toString() || '0', selectedPeriod, new Date().toLocaleDateString()],
      ['Utilisateurs actifs', reportData?.users.active.toString() || '0', selectedPeriod, new Date().toLocaleDateString()],
      ['Nouveaux utilisateurs ce mois', reportData?.users.newThisMonth.toString() || '0', selectedPeriod, new Date().toLocaleDateString()],
      ['Produits en stock faible', reportData?.products.lowStock.toString() || '0', selectedPeriod, new Date().toLocaleDateString()],
      ['Produits actifs', reportData?.products.active.toString() || '0', selectedPeriod, new Date().toLocaleDateString()],
    ];

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  };

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des rapports pour la période:', selectedPeriod);
      
      // Récupération des vraies données depuis l'API
      const completeReport = await reportsService.getCompleteReport(selectedPeriod);
      
      console.log('📊 Rapport complet récupéré:', completeReport);
      
      setReportData(completeReport);
    } catch (err) {
      console.error('❌ Erreur lors du chargement des rapports:', err);
      // En cas d'erreur, définir des données par défaut
      setReportData({
        sales: { total: 0, monthly: [], daily: [] },
        orders: { total: 0, pending: 0, completed: 0, cancelled: 0, monthly: [] },
        products: { total: 0, active: 0, lowStock: 0, topSelling: [] },
        users: { total: 0, active: 0, newThisMonth: 0, monthly: [] }
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon, color }: {
    title: string;
    value: string;
    change?: string;
    icon: string;
    color: string;
  }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-primary-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-primary-600">{title}</p>
          <p className="text-2xl font-bold text-primary-900">{value}</p>
          {change && (
            <p className={`text-sm ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-primary-100">
      <h3 className="text-lg font-semibold text-primary-800 mb-4">{title}</h3>
      {children}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-12">
        <div className="text-primary-400 text-lg">Aucune donnée disponible</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-800">Rapports et Analyses</h1>
          <p className="text-primary-600">Vue d'ensemble des performances de la plateforme</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">90 derniers jours</option>
            <option value="1y">1 an</option>
          </select>
          <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Exporter
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Chiffre d'affaires"
          value={`${reportData.sales.total.toLocaleString()}€`}
          change={calculateChangePercentage(reportData.sales.total, getPreviousPeriodData(reportData.sales.total))}
          icon="💰"
          color="bg-green-100"
        />
        <StatCard
          title="Commandes"
          value={reportData.orders.total.toLocaleString()}
          change={calculateChangePercentage(reportData.orders.total, getPreviousPeriodData(reportData.orders.total))}
          icon="📦"
          color="bg-blue-100"
        />
        <StatCard
          title="Utilisateurs actifs"
          value={reportData.users.active.toLocaleString()}
          change={calculateChangePercentage(reportData.users.active, getPreviousPeriodData(reportData.users.active))}
          icon="👥"
          color="bg-purple-100"
        />
        <StatCard
          title="Produits en stock faible"
          value={reportData.products.lowStock.toString()}
          change={calculateChangePercentage(reportData.products.lowStock, getPreviousPeriodData(reportData.products.lowStock))}
          icon="⚠️"
          color="bg-yellow-100"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <ChartCard title="Évolution des ventes">
          <div className="h-64 flex items-end justify-between space-x-2">
            {reportData.sales.monthly.length > 0 ? (
              reportData.sales.monthly.map((item, index) => {
                const maxAmount = Math.max(...reportData.sales.monthly.map(m => m.amount));
                const height = maxAmount > 0 ? (item.amount / maxAmount) * 200 : 0;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t transition-all duration-300 hover:from-primary-700 hover:to-primary-500"
                      style={{ height: `${height}px` }}
                      title={`${item.month}: ${item.amount.toLocaleString()}€`}
                    ></div>
                    <span className="text-xs text-primary-600 mt-2">{item.month}</span>
                    <span className="text-xs text-primary-500">{item.amount.toLocaleString()}€</span>
                  </div>
                );
              })
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-primary-400">Aucune donnée disponible</p>
              </div>
            )}
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-primary-600">
              Total: {reportData.sales.total.toLocaleString()}€
            </p>
          </div>
        </ChartCard>

        {/* Orders Chart */}
        <ChartCard title="Statut des commandes">
          <div className="h-64 flex items-center justify-center">
            {reportData.orders.total > 0 ? (
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-primary-200"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${(reportData.orders.completed / reportData.orders.total) * 352} 352`}
                    className="text-green-500"
                    style={{ transition: 'stroke-dasharray 0.5s ease-in-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-800">
                      {Math.round((reportData.orders.completed / reportData.orders.total) * 100)}%
                    </div>
                    <div className="text-sm text-primary-600">Complétées</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-400">0%</div>
                <div className="text-sm text-primary-400">Aucune commande</div>
              </div>
            )}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-600">{reportData.orders.completed}</div>
              <div className="text-xs text-primary-600">Complétées</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-yellow-600">{reportData.orders.pending}</div>
              <div className="text-xs text-primary-600">En attente</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-red-600">{reportData.orders.cancelled}</div>
              <div className="text-xs text-primary-600">Annulées</div>
            </div>
          </div>
        </ChartCard>

        {/* Top Products */}
        <ChartCard title="Produits les plus vendus">
          <div className="space-y-3">
            {reportData.products.topSelling.length > 0 ? (
              reportData.products.topSelling.map((product, index) => {
                const maxSales = Math.max(...reportData.products.topSelling.map(p => p.sales));
                const percentage = maxSales > 0 ? (product.sales / maxSales) * 100 : 0;
                return (
                  <div key={product.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary-600">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-primary-800">{product.name}</p>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-primary-100 rounded-full h-2">
                            <div 
                              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-primary-500">{product.sales} ventes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-primary-400">Aucun produit vendu</p>
              </div>
            )}
          </div>
        </ChartCard>

        {/* User Growth */}
        <ChartCard title="Croissance des utilisateurs">
          <div className="h-64 flex items-end justify-between space-x-2">
            {reportData.users.monthly.length > 0 ? (
              reportData.users.monthly.map((item, index) => {
                const maxCount = Math.max(...reportData.users.monthly.map(u => u.count));
                const height = maxCount > 0 ? (item.count / maxCount) * 200 : 0;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t transition-all duration-300 hover:from-purple-700 hover:to-purple-500"
                      style={{ height: `${height}px` }}
                      title={`${item.month}: ${item.count} utilisateurs`}
                    ></div>
                    <span className="text-xs text-primary-600 mt-2">{item.month}</span>
                    <span className="text-xs text-primary-500">{item.count}</span>
                  </div>
                );
              })
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-primary-400">Aucune donnée disponible</p>
              </div>
            )}
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-primary-600">
              +{reportData.users.newThisMonth} nouveaux ce mois
            </p>
          </div>
        </ChartCard>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-primary-100">
          <h3 className="text-lg font-semibold text-primary-800 mb-4">Activité récente</h3>
          <div className="space-y-4">
            {reportData.orders.total > 0 ? (
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary-800">
                    {reportData.orders.pending > 0 ? `${reportData.orders.pending} commande(s) en attente` : 'Aucune commande en attente'}
                  </p>
                  <p className="text-xs text-primary-500">Dernière mise à jour</p>
                </div>
                <span className="text-sm font-semibold text-green-600">
                  {reportData.sales.total > 0 ? `+${reportData.sales.total.toLocaleString()}€` : '0€'}
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary-800">Aucune commande récente</p>
                  <p className="text-xs text-primary-500">Aucune activité</p>
                </div>
              </div>
            )}
            
            {reportData.users.newThisMonth > 0 ? (
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary-800">
                    {reportData.users.newThisMonth} nouveau(x) client(s) ce mois
                  </p>
                  <p className="text-xs text-primary-500">Croissance utilisateurs</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary-800">Aucun nouveau client</p>
                  <p className="text-xs text-primary-500">Ce mois</p>
                </div>
              </div>
            )}
            
            {reportData.products.lowStock > 0 ? (
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary-800">
                    {reportData.products.lowStock} produit(s) en stock faible
                  </p>
                  <p className="text-xs text-primary-500">Attention requise</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary-800">Stock optimal</p>
                  <p className="text-xs text-primary-500">Tous les produits</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-primary-100">
          <h3 className="text-lg font-semibold text-primary-800 mb-4">Actions rapides</h3>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => {
                const dataStr = JSON.stringify(reportData, null, 2);
                const dataBlob = new Blob([dataStr], {type: 'application/json'});
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `rapport-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`;
                link.click();
                URL.revokeObjectURL(url);
              }}
              className="p-3 text-left border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
            >
              <div className="text-lg mb-1">📊</div>
              <div className="text-sm font-medium text-primary-800">Rapport détaillé</div>
              <div className="text-xs text-primary-500">Export JSON</div>
            </button>
            
            <button 
              onClick={() => {
                const csvContent = generateCSVReport();
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `rapport-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
                link.click();
                URL.revokeObjectURL(link.href);
              }}
              className="p-3 text-left border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
            >
              <div className="text-lg mb-1">📧</div>
              <div className="text-sm font-medium text-primary-800">Export CSV</div>
              <div className="text-xs text-primary-500">Télécharger</div>
            </button>
            
            <button 
              onClick={() => {
                const lowStockCount = reportData.products.lowStock;
                alert(`Alertes stock : ${lowStockCount} produit(s) en stock faible\n\nAction recommandée : Vérifier et réapprovisionner les produits concernés.`);
              }}
              className="p-3 text-left border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
            >
              <div className="text-lg mb-1">⚠️</div>
              <div className="text-sm font-medium text-primary-800">Alertes stock</div>
              <div className="text-xs text-primary-500">{reportData.products.lowStock} produit(s)</div>
            </button>
            
            <button 
              onClick={() => {
                const pendingOrders = reportData.orders.pending;
                alert(`Commandes en attente : ${pendingOrders} commande(s)\n\nAction recommandée : Traiter les commandes en attente pour améliorer la satisfaction client.`);
              }}
              className="p-3 text-left border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
            >
              <div className="text-lg mb-1">🎯</div>
              <div className="text-sm font-medium text-primary-800">Commandes</div>
              <div className="text-xs text-primary-500">{reportData.orders.pending} en attente</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports; 