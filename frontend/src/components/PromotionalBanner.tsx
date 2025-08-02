import React from 'react';
import { Link } from 'react-router-dom';

interface PromotionalBannerProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  bgColor?: string;
  textColor?: string;
  icon?: React.ReactNode;
}

const PromotionalBanner: React.FC<PromotionalBannerProps> = ({
  title,
  subtitle,
  ctaText,
  ctaLink,
  bgColor = 'bg-gradient-to-r from-blue-600 to-blue-800',
  textColor = 'text-white',
  icon
}) => {
  return (
    <div className={`${bgColor} ${textColor} py-12 px-6 rounded-xl shadow-lg`}>
      <div className="max-w-4xl mx-auto text-center">
        {icon && (
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              {icon}
            </div>
          </div>
        )}
        <h3 className="text-2xl md:text-3xl font-bold mb-4">{title}</h3>
        <p className="text-lg mb-6 opacity-90">{subtitle}</p>
        <Link
          to={ctaLink}
          className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          {ctaText}
        </Link>
      </div>
    </div>
  );
};

export default PromotionalBanner; 