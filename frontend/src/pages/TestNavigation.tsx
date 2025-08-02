import React from 'react';
import { Link } from 'react-router-dom';

const TestNavigation: React.FC = () => {
  const routes = [
    { path: '/', name: 'Accueil', description: 'Page d\'accueil' },
    { path: '/login', name: 'Connexion', description: 'Page de connexion' },
    { path: '/register', name: 'Inscription', description: 'Page d\'inscription' },
    { path: '/products', name: 'Produits', description: 'Catalogue des produits' },
    { path: '/catalog', name: 'Catalogue', description: 'Catalogue (alias de /products)' },
    { path: '/contact', name: 'Contact', description: 'Page de contact' },
    { path: '/cart', name: 'Panier', description: 'Panier d\'achat (protégé)' },
    { path: '/wishlist', name: 'Liste de souhaits', description: 'Liste de souhaits (protégé)' },
    { path: '/checkout', name: 'Commande', description: 'Page de commande (protégé)' },
    { path: '/change-password', name: 'Changer mot de passe', description: 'Changement de mot de passe (protégé)' },
    { path: '/forgot-password', name: 'Mot de passe oublié', description: 'Récupération de mot de passe' },
    { path: '/reset-password', name: 'Réinitialiser mot de passe', description: 'Réinitialisation de mot de passe' },
    { path: '/admin', name: 'Dashboard Admin', description: 'Tableau de bord admin (protégé)' },
    { path: '/admin/products', name: 'Gestion Produits', description: 'Gestion des produits (admin)' },
    { path: '/admin/categories', name: 'Gestion Catégories', description: 'Gestion des catégories (admin)' },
    { path: '/admin/orders', name: 'Gestion Commandes', description: 'Gestion des commandes (admin)' },
    { path: '/admin/users', name: 'Gestion Utilisateurs', description: 'Gestion des utilisateurs (admin)' },
    { path: '/admin/config', name: 'Configuration', description: 'Gestionnaire de configuration (admin)' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-primary-800 mb-4">
            Test de Navigation
          </h1>
          <p className="text-xl text-primary-600">
            Vérification de l'accessibilité de toutes les pages
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map((route) => (
            <div key={route.path} className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-large transition-all duration-200">
              <h3 className="text-lg font-semibold text-primary-800 mb-2">
                {route.name}
              </h3>
              <p className="text-primary-600 text-sm mb-4">
                {route.description}
              </p>
              <div className="text-xs text-primary-500 mb-4">
                <code className="bg-primary-100 px-2 py-1 rounded">
                  {route.path}
                </code>
              </div>
              <Link
                to={route.path}
                className="inline-block bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Tester cette page
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TestNavigation; 