import React, { useState, useEffect } from 'react';
import configService from '../services/configService';

interface HeaderProps {
  siteName?: string;
  freeShippingThreshold?: string;
  currencySymbol?: string;
}

const Header: React.FC<HeaderProps> = () => {
  const [config, setConfig] = useState<{
    siteName: string;
    contactEmail: string;
    contactPhone: string;
    freeShippingThreshold: string;
    currencySymbol: string;
  }>({
    siteName: 'DentalPro',
    contactEmail: 'contact@dentalpro.com',
    contactPhone: '+33 1 23 45 67 89',
    freeShippingThreshold: '50',
    currencySymbol: '€'
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const data = await configService.getPublicConfigs();
      setConfig({
        siteName: data.site_name || 'DentalPro',
        contactEmail: data.contact_email || 'contact@dentalpro.com',
        contactPhone: data.contact_phone || '+33 1 23 45 67 89',
        freeShippingThreshold: data.free_shipping_threshold || '50',
        currencySymbol: data.currency_symbol || '€'
      });
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error);
    }
  };

  return (
    <div className="bg-gradient-to-r from-primary-700 to-primary-800 text-white py-2 text-xs">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mb-1 sm:mb-0">
            <div className="flex items-center space-x-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{config.contactPhone}</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
              <span>{config.contactEmail}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span>Livraison gratuite dès {config.freeShippingThreshold}{config.currencySymbol}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header; 