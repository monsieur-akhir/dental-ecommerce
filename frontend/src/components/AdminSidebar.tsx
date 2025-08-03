import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface SidebarItem {
  name: string;
  href: string;
  icon: string;
  description: string;
  badge?: string;
  children?: SidebarItem[];
}

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navigation: SidebarItem[] = [
    {
      name: 'Tableau de bord',
      href: '/admin',
      icon: '📊',
      description: 'Vue d\'ensemble et statistiques'
    },
    {
      name: 'Produits',
      href: '/admin/products',
      icon: '📦',
      description: 'Gestion du catalogue',
      badge: 'Gérer'
    },
    {
      name: 'Catégories',
      href: '/admin/categories',
      icon: '🏷️',
      description: 'Organisation des produits'
    },
    {
      name: 'Commandes',
      href: '/admin/orders',
      icon: '🛒',
      description: 'Suivi des commandes',
      badge: 'Nouveau'
    },
    {
      name: 'Utilisateurs',
      href: '/admin/users',
      icon: '👥',
      description: 'Gestion des comptes'
    },
    {
      name: 'Promotions',
      href: '/admin/promotions',
      icon: '🎯',
      description: 'Codes promo et réductions'
    },
    {
      name: 'Configuration',
      href: '/admin/config',
      icon: '⚙️',
      description: 'Paramètres du site'
    },
    {
      name: 'Configuration SMTP',
      href: '/admin/smtp',
      icon: '📧',
      description: 'Paramètres d\'envoi d\'emails'
    },
    {
      name: 'Rapports',
      href: '/admin/reports',
      icon: '📈',
      description: 'Analyses et statistiques'
    },
    {
      name: 'Notifications',
      href: '/admin/notifications',
      icon: '🔔',
      description: 'Gestion des alertes'
    },
    {
      name: 'Système',
      href: '/admin/system',
      icon: '🔧',
      description: 'Maintenance et logs'
    }
  ];

  const isCurrentPath = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`bg-white shadow-lg border-r border-primary-100 transition-all duration-300 flex flex-col ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-primary-100 flex-shrink-0">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div>
              <h2 className="text-lg font-bold text-primary-800">Administration</h2>
              <p className="text-xs text-primary-500">DentalPro</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-primary-50 transition-colors"
          >
            <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* User Info */}
      {!collapsed && user && (
        <div className="p-4 border-b border-primary-100 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-primary-800">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-primary-500">Administrateur</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="p-2 flex-1 overflow-y-auto">
        <div className="space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                isCurrentPath(item.href)
                  ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                  : 'text-primary-600 hover:bg-primary-50 hover:text-primary-700'
              }`}
              title={collapsed ? item.name : undefined}
            >
              <span className="text-lg mr-3">{item.icon}</span>
              {!collapsed && (
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.name}</span>
                    {item.badge && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent-100 text-accent-800">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-primary-500 mt-0.5">{item.description}</p>
                </div>
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-primary-100 flex-shrink-0">
          <div className="text-center">
            <p className="text-xs text-primary-500">Version 1.0.0</p>
            <p className="text-xs text-primary-400">© 2024 DentalPro</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSidebar; 