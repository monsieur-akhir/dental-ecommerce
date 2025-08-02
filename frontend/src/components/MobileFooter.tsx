import React from 'react';
import { Link } from 'react-router-dom';

const MobileFooter: React.FC = () => {
  return (
    <footer className="md:hidden bg-white border-t border-primary-100">
      {/* Navigation Mobile */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-4 gap-4">
          {/* Accueil */}
          <Link to="/" className="flex flex-col items-center space-y-1 text-primary-600 hover:text-accent-600 transition-colors duration-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">Accueil</span>
          </Link>

          {/* Produits */}
          <Link to="/products" className="flex flex-col items-center space-y-1 text-primary-600 hover:text-accent-600 transition-colors duration-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-xs font-medium">Produits</span>
          </Link>

          {/* Panier */}
          <Link to="/cart" className="flex flex-col items-center space-y-1 text-primary-600 hover:text-accent-600 transition-colors duration-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
            <span className="text-xs font-medium">Panier</span>
          </Link>

          {/* Profil */}
          <Link to="/profile" className="flex flex-col items-center space-y-1 text-primary-600 hover:text-accent-600 transition-colors duration-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs font-medium">Profil</span>
          </Link>
        </div>
      </div>

      {/* Informations de contact */}
      <div className="px-4 py-4 bg-primary-50">
        <div className="space-y-3">
          {/* Support */}
          <div className="flex items-center space-x-2 text-sm text-primary-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>Support : 01 23 45 67 89</span>
          </div>

          {/* Email */}
          <div className="flex items-center space-x-2 text-sm text-primary-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>contact@dentalpro.fr</span>
          </div>

          {/* Livraison */}
          <div className="flex items-center space-x-2 text-sm text-primary-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Livraison 24-48h</span>
          </div>
        </div>

        {/* Liens rapides */}
        <div className="mt-4 pt-4 border-t border-primary-200">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <Link to="/about" className="text-primary-600 hover:text-accent-600 transition-colors duration-200">
              À propos
            </Link>
            <Link to="/contact" className="text-primary-600 hover:text-accent-600 transition-colors duration-200">
              Contact
            </Link>
            <Link to="/terms" className="text-primary-600 hover:text-accent-600 transition-colors duration-200">
              CGV
            </Link>
            <Link to="/privacy" className="text-primary-600 hover:text-accent-600 transition-colors duration-200">
              Confidentialité
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-4 pt-4 border-t border-primary-200 text-center">
          <p className="text-xs text-primary-500">
            © 2024 DentalPro. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default MobileFooter; 