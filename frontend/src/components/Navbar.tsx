import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { categoryService } from '../services/api';
import { Category } from '../types';

const Navbar: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Charger les catégories depuis la BD
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const categoriesData = await categoryService.getAll();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-menu')) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Top Bar - Informations professionnelles (uniquement sur la page d'accueil) */}
      {isHomePage && (
        <div className="bg-gradient-to-r from-primary-700 to-primary-800 text-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between py-2 text-sm">
              <div className="flex items-center space-x-6">
                <span className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Support technique : 01 23 45 67 89</span>
                </span>
                <span className="hidden md:flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Livraison 24-48h pour les professionnels</span>
                </span>
              </div>
              <div className="flex items-center space-x-4">
                {user ? (
                  <span className="text-primary-100">Bienvenue, {user.firstName}</span>
                ) : (
                  <Link to="/login" className="text-primary-100 hover:text-white transition-colors duration-200">
                    Espace professionnel
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className={`hidden md:block sticky top-0 z-40 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-lg border-b border-primary-100' : 'bg-white'
      }`}>
        <div className="container mx-auto px-4">
          {/* Header Principal */}
          <div className={`flex items-center justify-between transition-all duration-300 ${
            isScrolled ? 'py-2' : 'py-4'
          }`}>
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-primary-800">DentalPro</h1>
                <p className="text-xs text-primary-600">Équipements dentaires</p>
              </div>
            </Link>

            {/* Barre de recherche - Toujours visible */}
            <div className="flex-1 max-w-2xl mx-4 hidden md:block">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className={`w-full px-4 py-2 pl-10 pr-4 border rounded-xl transition-all duration-200 ${
                    isSearchFocused
                      ? 'border-accent-500 shadow-lg shadow-accent-500/20'
                      : 'border-primary-200 hover:border-primary-300'
                  } focus:outline-none focus:ring-2 focus:ring-accent-500/20`}
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </form>
            </div>

            {/* Actions utilisateur */}
            <div className="flex items-center space-x-4">
              {/* Panier */}
              <Link to="/cart" className="relative p-2 text-primary-600 hover:text-accent-600 transition-colors duration-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </Link>

              {/* Favoris */}
              <Link to="/wishlist" className="relative p-2 text-primary-600 hover:text-accent-600 transition-colors duration-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Menu utilisateur */}
              {user ? (
                <div className="relative user-menu">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 text-primary-600 hover:text-accent-600 transition-colors duration-200 rounded-lg hover:bg-primary-50"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {user.firstName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-primary-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-primary-100">
                        <p className="text-sm font-semibold text-primary-800">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-primary-600">{user.email}</p>
                      </div>
                      <Link to="/profile" className="block px-4 py-2 text-sm text-primary-700 hover:bg-primary-50">
                        Mon profil
                      </Link>
                      <Link to="/orders" className="block px-4 py-2 text-sm text-primary-700 hover:bg-primary-50">
                        Mes commandes
                      </Link>
                      {user.role?.name === 'admin' && (
                        <Link to="/admin" className="block px-4 py-2 text-sm text-primary-700 hover:bg-primary-50">
                          Administration
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Se déconnecter
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="btn btn-primary btn-sm">
                  Connexion
                </Link>
              )}

              {/* Menu mobile */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-primary-600 hover:text-accent-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Barre de recherche mobile */}
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={`w-full px-4 py-2 pl-10 pr-4 border rounded-xl transition-all duration-200 ${
                  isSearchFocused
                    ? 'border-accent-500 shadow-lg shadow-accent-500/20'
                    : 'border-primary-200 hover:border-primary-300'
                } focus:outline-none focus:ring-2 focus:ring-accent-500/20`}
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </form>
          </div>
        </div>
      </nav>

      {/* Categories Bar - Compact sur les autres pages */}
      <div className="hidden md:block bg-gradient-to-r from-primary-50 to-secondary-50 border-t border-primary-100">
        <div className="container mx-auto px-4">
          {/* Desktop Categories - Grid layout */}
          <div className={`grid ${isHomePage ? 'grid-cols-6 gap-4 py-4' : 'grid-cols-6 gap-2 py-2'}`}>
            {!categoriesLoading && categories.slice(0, 6).map((category) => (
              <Link 
                key={category.id}
                to={`/products?categoryId=${category.id}`} 
                className={`text-primary-700 hover:text-accent-700 font-semibold transition-colors duration-200 text-center ${isHomePage ? 'py-3 px-4' : 'py-2 px-2'} rounded-xl hover:bg-white hover:shadow-soft text-sm`}
              >
                {category.name}
              </Link>
            ))}
          </div>

          {/* Mobile/Tablet Categories - Horizontal scroll */}
          <div className={`lg:hidden flex items-center space-x-4 ${isHomePage ? 'py-3' : 'py-2'} overflow-x-auto scrollbar-hide`}>
            {!categoriesLoading && categories.slice(0, 6).map((category) => (
              <Link 
                key={category.id}
                to={`/products?categoryId=${category.id}`} 
                className={`text-primary-700 hover:text-accent-700 font-semibold transition-colors duration-200 whitespace-nowrap ${isHomePage ? 'px-4 py-2' : 'px-3 py-1'} rounded-xl hover:bg-white hover:shadow-soft flex-shrink-0 text-sm`}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Mobile Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setIsMenuOpen(false)}>
          <div className="absolute top-0 right-0 w-80 h-full bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-primary-900">Menu</h3>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-primary-500 hover:text-primary-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <nav className="space-y-4 mb-6">
                <Link
                  to="/products"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-primary-50 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span className="text-primary-700 font-medium">Produits</span>
                </Link>
                <Link
                  to="/contact"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-primary-50 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-primary-700 font-medium">Contact</span>
                </Link>
              </nav>

              {/* Mobile User Actions */}
              {user && (
                <div className="space-y-3 mb-6">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-primary-50 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-primary-700 font-medium">Mon Profil</span>
                  </Link>
                  
                  <Link
                    to="/orders"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-primary-50 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-primary-700 font-medium">Mes Commandes</span>
                  </Link>
                  
                  <Link
                    to="/wishlist"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-primary-50 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-primary-700 font-medium">Ma liste de souhaits</span>
                    {wishlistCount > 0 && (
                      <span className="ml-auto bg-accent-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/cart"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-primary-50 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
                    </svg>
                    <span className="text-primary-700 font-medium">Panier</span>
                    {getTotalItems() > 0 && (
                      <span className="ml-auto bg-accent-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {getTotalItems()}
                      </span>
                    )}
                  </Link>
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 transition-colors duration-200 w-full text-left"
                  >
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-red-600 font-medium">Déconnexion</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

