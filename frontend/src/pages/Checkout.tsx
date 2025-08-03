import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { orderService, emailService } from '../services/api';
import { PaymentMethod } from '../types';
import configService from '../services/configService';
import OrderConfirmationModal from '../components/OrderConfirmationModal';

const Checkout: React.FC = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkoutConfig, setCheckoutConfig] = useState({
    taxRate: 20,
    taxName: 'TVA',
    currencySymbol: '€'
  });

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState({
    orderNumber: '',
    totalAmount: 0,
    email: ''
  });

  const [formData, setFormData] = useState({
    paymentMethod: 'cash_on_delivery' as PaymentMethod,
    shippingAddress: user?.address || '',
    shippingCity: user?.city || '',
    shippingPostalCode: user?.postalCode || '',
    shippingCountry: user?.country || 'France',
    billingAddress: '',
    billingCity: '',
    billingPostalCode: '',
    billingCountry: '',
    notes: '',
    useSameAddress: true,
  });

  // Charger la configuration du checkout
  useEffect(() => {
    const loadCheckoutConfig = async () => {
      try {
        const config = await configService.getPublicConfigs();
        setCheckoutConfig({
          taxRate: parseFloat(config.tax_rate) || 20,
          taxName: config.tax_name || 'TVA',
          currencySymbol: config.currency_symbol || '€'
        });
      } catch (error) {
        console.error('Erreur lors du chargement de la configuration du checkout:', error);
      }
    };

    loadCheckoutConfig();
  }, []);

  // Afficher le message de bienvenue si l'utilisateur vient de se connecter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const fromLogin = searchParams.get('fromLogin');
    if (fromLogin === 'true') {
      setShowWelcomeMessage(true);
      // Masquer le message après 5 secondes
      setTimeout(() => setShowWelcomeMessage(false), 5000);
    }
  }, [location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const orderData = {
        paymentMethod: formData.paymentMethod,
        shippingAddress: formData.shippingAddress,
        shippingCity: formData.shippingCity,
        shippingPostalCode: formData.shippingPostalCode,
        shippingCountry: formData.shippingCountry,
        billingAddress: formData.useSameAddress ? formData.shippingAddress : formData.billingAddress,
        billingCity: formData.useSameAddress ? formData.shippingCity : formData.billingCity,
        billingPostalCode: formData.useSameAddress ? formData.shippingPostalCode : formData.billingPostalCode,
        billingCountry: formData.useSameAddress ? formData.shippingCountry : formData.billingCountry,
        notes: formData.notes,
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.product.price,
        })),
      };

      const order = await orderService.create(orderData);
      
      // Vider le panier seulement après la création réussie de la commande
      if (order && order.id) {
        clearCart();
        
        // Envoyer l'email de confirmation
        if (user?.email && user?.firstName) {
          try {
            await emailService.sendOrderConfirmation(
              user.email,
              user.firstName,
              order.orderNumber || `CMD-${order.id}`,
              Number(order.totalAmount || total)
            );
          } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email de confirmation:', error);
            // Ne pas bloquer l'affichage de la popup même si l'email échoue
          }
        }
        
        // Afficher la popup de confirmation
        setOrderConfirmation({
          orderNumber: order.orderNumber || `CMD-${order.id}`,
          totalAmount: Number(order.totalAmount || total),
          email: user?.email || ''
        });
        setShowConfirmationModal(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création de la commande');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseConfirmationModal = () => {
    setShowConfirmationModal(false);
    // Rediriger vers la page d'accueil après fermeture de la popup
    navigate('/');
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const subtotal = getTotalPrice();
  const tax = subtotal * (checkoutConfig.taxRate / 100);
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-display font-bold text-primary-800 mb-8">Finaliser la commande</h1>
          
          {showWelcomeMessage && (
            <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-xl">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-success-800">
                    Bienvenue ! Votre panier a été synchronisé
                  </p>
                  <p className="text-xs text-success-700">
                    Vous pouvez maintenant finaliser votre commande
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Formulaire */}
              <div className="lg:col-span-2 space-y-6">
                {error && (
                  <div className="bg-error-50 border border-error-200 text-error-600 px-4 py-3 rounded-xl">
                    {error}
                  </div>
                )}

                {/* Informations de livraison */}
                <div className="bg-white rounded-2xl shadow-soft p-6">
                  <h2 className="text-lg font-semibold text-primary-800 mb-4">Adresse de livraison</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-primary-700 mb-2">
                        Adresse *
                      </label>
                      <input
                        type="text"
                        name="shippingAddress"
                        required
                        value={formData.shippingAddress}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-primary-700 mb-2">
                        Ville *
                      </label>
                      <input
                        type="text"
                        name="shippingCity"
                        required
                        value={formData.shippingCity}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-primary-700 mb-2">
                        Code postal *
                      </label>
                      <input
                        type="text"
                        name="shippingPostalCode"
                        required
                        value={formData.shippingPostalCode}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-primary-700 mb-2">
                        Pays *
                      </label>
                      <input
                        type="text"
                        name="shippingCountry"
                        required
                        value={formData.shippingCountry}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Adresse de facturation */}
                <div className="bg-white rounded-2xl shadow-soft p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-primary-800">Adresse de facturation</h2>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="useSameAddress"
                        checked={formData.useSameAddress}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span className="text-sm">Identique à l'adresse de livraison</span>
                    </label>
                  </div>

                  {!formData.useSameAddress && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Adresse *
                        </label>
                        <input
                          type="text"
                          name="billingAddress"
                          required={!formData.useSameAddress}
                          value={formData.billingAddress}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ville *
                        </label>
                        <input
                          type="text"
                          name="billingCity"
                          required={!formData.useSameAddress}
                          value={formData.billingCity}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Code postal *
                        </label>
                        <input
                          type="text"
                          name="billingPostalCode"
                          required={!formData.useSameAddress}
                          value={formData.billingPostalCode}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pays *
                        </label>
                        <input
                          type="text"
                          name="billingCountry"
                          required={!formData.useSameAddress}
                          value={formData.billingCountry}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Mode de paiement */}
                <div className="bg-white rounded-2xl shadow-soft p-6">
                  <h2 className="text-lg font-semibold text-primary-800 mb-4">Mode de paiement</h2>
                  
                  <div className="space-y-3">
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash_on_delivery"
                        checked={formData.paymentMethod === 'cash_on_delivery'}
                        onChange={handleChange}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">Paiement à la livraison</div>
                        <div className="text-sm text-gray-600">Payez en espèces ou par carte lors de la livraison</div>
                      </div>
                    </label>

                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="credit_card"
                        checked={formData.paymentMethod === 'credit_card'}
                        onChange={handleChange}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">Carte bancaire</div>
                        <div className="text-sm text-gray-600">Paiement sécurisé par carte (simulation)</div>
                      </div>
                    </label>

                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank_transfer"
                        checked={formData.paymentMethod === 'bank_transfer'}
                        onChange={handleChange}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">Virement bancaire</div>
                        <div className="text-sm text-gray-600">Paiement par virement bancaire</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-white rounded-2xl shadow-soft p-6">
                  <h2 className="text-lg font-semibold text-primary-800 mb-4">Notes de commande (optionnel)</h2>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Instructions spéciales pour la livraison..."
                    className="w-full px-4 py-3 border border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  />
                </div>
              </div>

              {/* Résumé de commande */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-soft p-6 sticky top-4">
                  <h2 className="text-lg font-semibold text-primary-800 mb-4">Résumé de commande</h2>

                  {/* Articles */}
                  <div className="space-y-3 mb-6">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex justify-between text-sm">
                        <div className="flex-1">
                          <div className="font-medium">{item.product.name}</div>
                          <div className="text-gray-600">Qté: {item.quantity}</div>
                        </div>
                        <div className="font-medium">
                          {(Number(item.product.price || 0) * item.quantity).toFixed(2)} {checkoutConfig.currencySymbol}
                        </div>
                      </div>
                    ))}
                  </div>

                  <hr className="mb-4" />

                  {/* Totaux */}
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between">
                      <span>Sous-total</span>
                      <span>{Number(subtotal || 0).toFixed(2)} {checkoutConfig.currencySymbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Livraison</span>
                      <span className="text-green-600">Gratuite</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{checkoutConfig.taxName} ({checkoutConfig.taxRate}%)</span>
                      <span>{Number(tax || 0).toFixed(2)} {checkoutConfig.currencySymbol}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>{Number(total || 0).toFixed(2)} {checkoutConfig.currencySymbol}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Traitement...
                      </div>
                    ) : (
                      'Confirmer la commande'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de confirmation de commande */}
      <OrderConfirmationModal
        isOpen={showConfirmationModal}
        onClose={handleCloseConfirmationModal}
        orderNumber={orderConfirmation.orderNumber}
        totalAmount={orderConfirmation.totalAmount}
        email={orderConfirmation.email}
      />
    </div>
  );
};

export default Checkout;

