import React from 'react';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  totalAmount: number;
  email: string;
}

const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  isOpen,
  onClose,
  orderNumber,
  totalAmount,
  email
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
          {/* Success Icon */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="pt-8 pb-6 px-6 text-center">
            <h3 className="text-2xl font-bold text-primary-800 mb-2">
              Commande confirmée !
            </h3>
            <p className="text-primary-600 mb-6">
              Votre commande a été enregistrée avec succès
            </p>

            {/* Order Details */}
            <div className="bg-primary-50 rounded-xl p-4 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-primary-600">Numéro de commande :</span>
                  <span className="font-semibold text-primary-800">{orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-600">Montant total :</span>
                  <span className="font-semibold text-primary-800">{Number(totalAmount).toFixed(2)} €</span>
                </div>
              </div>
            </div>

            {/* Email Confirmation */}
            <div className="bg-success-50 border border-success-200 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div className="text-left">
                  <p className="text-sm font-medium text-success-800">
                    Email de confirmation envoyé
                  </p>
                  <p className="text-xs text-success-700">
                    {email}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={onClose}
                className="w-full btn btn-primary"
              >
                Continuer mes achats
              </button>
              <button
                onClick={() => window.location.href = '/orders'}
                className="w-full btn btn-outline"
              >
                Voir mes commandes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationModal; 