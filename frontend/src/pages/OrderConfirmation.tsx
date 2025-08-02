import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { orderService } from '../services/api';
import { Order, OrderStatus, PaymentStatus } from '../types';
import { formatPrice } from '../utils/priceUtils';
import { useAuth } from '../contexts/AuthContext';
import { getImageUrl, handleImageError } from '../utils/imageUtils';

const OrderConfirmation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      
      try {
        const orderData = await orderService.getById(parseInt(id));
        setOrder(orderData);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erreur lors du chargement de la commande');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de votre commande...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">{error || 'Commande introuvable'}</p>
          <Link
            to="/products"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour aux produits
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.CONFIRMED:
        return 'bg-blue-100 text-blue-800';
      case OrderStatus.PROCESSING:
        return 'bg-purple-100 text-purple-800';
      case OrderStatus.SHIPPED:
        return 'bg-indigo-100 text-indigo-800';
      case OrderStatus.DELIVERED:
        return 'bg-green-100 text-green-800';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return 'bg-green-100 text-green-800';
      case PaymentStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case PaymentStatus.FAILED:
        return 'bg-red-100 text-red-800';
      case PaymentStatus.REFUNDED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Message de succès */}
          {location.state?.message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-8">
              {location.state.message}
            </div>
          )}

          {/* En-tête */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Confirmation de commande</h1>
                <p className="text-gray-600 mt-2">Commande #{order.orderNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Passée le</p>
                <p className="font-semibold">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Statut de la commande</h3>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status === OrderStatus.PENDING && 'En attente'}
                  {order.status === OrderStatus.CONFIRMED && 'Confirmée'}
                  {order.status === OrderStatus.PROCESSING && 'En traitement'}
                  {order.status === OrderStatus.SHIPPED && 'Expédiée'}
                  {order.status === OrderStatus.DELIVERED && 'Livrée'}
                  {order.status === OrderStatus.CANCELLED && 'Annulée'}
                </span>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Paiement</h3>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                  {order.paymentStatus === PaymentStatus.PAID && 'Payé'}
                  {order.paymentStatus === PaymentStatus.PENDING && 'En attente'}
                  {order.paymentStatus === PaymentStatus.FAILED && 'Échoué'}
                  {order.paymentStatus === PaymentStatus.REFUNDED && 'Remboursé'}
                </span>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Total</h3>
                <p className="text-2xl font-bold text-blue-600">{formatPrice(order.totalAmount)} €</p>
              </div>
            </div>
          </div>

          {/* Détails de la commande */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Articles commandés */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Articles commandés</h2>
              
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <img
                      src={(() => {
                        if (!item.product.images || item.product.images.length === 0) {
                          return '/images/no-image.svg';
                        }
                        const primaryImage = item.product.images.find((img: any) => img.isPrimary);
                        const imageToUse = primaryImage || item.product.images[0];
                        return getImageUrl(imageToUse.url);
                      })()}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => handleImageError(e.nativeEvent)}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                      <p className="text-sm text-gray-500">Quantité: {item.quantity}</p>
                      <p className="text-sm text-gray-500">Prix unitaire: {formatPrice(item.unitPrice)} €</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatPrice(item.totalPrice)} €</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Informations de livraison */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Adresse de livraison</h2>
                <div className="space-y-2">
                  <p className="text-gray-900">{order.shippingAddress}</p>
                  <p className="text-gray-900">{order.shippingCity}, {order.shippingPostalCode}</p>
                  <p className="text-gray-900">{order.shippingCountry}</p>
                </div>
              </div>

              {order.billingAddress && (
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Adresse de facturation</h2>
                  <div className="space-y-2">
                    <p className="text-gray-900">{order.billingAddress}</p>
                    <p className="text-gray-900">{order.billingCity}, {order.billingPostalCode}</p>
                    <p className="text-gray-900">{order.billingCountry}</p>
                  </div>
                </div>
              )}

              {/* Résumé des coûts */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Résumé des coûts</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sous-total</span>
                    <span className="font-medium">{formatPrice(order.subtotal)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">TVA (20%)</span>
                    <span className="font-medium">{formatPrice(order.taxAmount)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Livraison</span>
                    <span className="font-medium">{formatPrice(order.shippingCost)} €</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-blue-600">{formatPrice(order.totalAmount)} €</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
            >
              Continuer mes achats
            </Link>
            <Link
              to="/orders"
              className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors text-center font-medium"
            >
              Voir mes commandes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation; 