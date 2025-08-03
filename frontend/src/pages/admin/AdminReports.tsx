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
          change="+12.5%"
          icon="💰"
          color="bg-green-100"
        />
        <StatCard
          title="Commandes"
          value={reportData.orders.total.toLocaleString()}
          change="+8.3%"
          icon="📦"
          color="bg-blue-100"
        />
        <StatCard
          title="Utilisateurs actifs"
          value={reportData.users.active.toLocaleString()}
          change="+15.2%"
          icon="👥"
          color="bg-purple-100"
        />
        <StatCard
          title="Produits en stock faible"
          value={reportData.products.lowStock.toString()}
          change="-5.1%"
          icon="⚠️"
          color="bg-yellow-100"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <ChartCard title="Évolution des ventes">
          <div className="h-64 flex items-end justify-between space-x-2">
            {reportData.sales.monthly.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t"
                  style={{ height: `${(item.amount / 30000) * 200}px` }}
                ></div>
                <span className="text-xs text-primary-600 mt-2">{item.month}</span>
              </div>
            ))}
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
            {reportData.products.topSelling.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary-800">{product.name}</p>
                    <p className="text-xs text-primary-500">{product.sales} ventes</p>
                  </div>
                </div>
                <div className="text-sm font-semibold text-primary-600">
                  {product.sales}
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* User Growth */}
        <ChartCard title="Croissance des utilisateurs">
          <div className="h-64 flex items-end justify-between space-x-2">
            {reportData.users.monthly.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t"
                  style={{ height: `${(item.count / 150) * 200}px` }}
                ></div>
                <span className="text-xs text-primary-600 mt-2">{item.month}</span>
              </div>
            ))}
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
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-primary-800">Nouvelle commande #1234</p>
                <p className="text-xs text-primary-500">Il y a 5 minutes</p>
              </div>
              <span className="text-sm font-semibold text-green-600">+150€</span>
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
                <p className="text-sm font-medium text-primary-800">Stock faible - Masques</p>
                <p className="text-xs text-primary-500">Il y a 1 heure</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-primary-100">
          <h3 className="text-lg font-semibold text-primary-800 mb-4">Actions rapides</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-3 text-left border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors">
              <div className="text-lg mb-1">📊</div>
              <div className="text-sm font-medium text-primary-800">Rapport détaillé</div>
              <div className="text-xs text-primary-500">Export PDF</div>
            </button>
            <button className="p-3 text-left border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors">
              <div className="text-lg mb-1">📧</div>
              <div className="text-sm font-medium text-primary-800">Newsletter</div>
              <div className="text-xs text-primary-500">Envoyer</div>
            </button>
            <button className="p-3 text-left border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors">
              <div className="text-lg mb-1">⚠️</div>
              <div className="text-sm font-medium text-primary-800">Alertes stock</div>
              <div className="text-xs text-primary-500">Configurer</div>
            </button>
            <button className="p-3 text-left border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors">
              <div className="text-lg mb-1">🎯</div>
              <div className="text-sm font-medium text-primary-800">Promotions</div>
              <div className="text-xs text-primary-500">Créer</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports; 