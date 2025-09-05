import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, User, ChevronRight } from 'lucide-react';
import { useLimitWarnings } from '@/hooks/useLimitWarnings';
import LimitIndicator from '@/components/LimitIndicator';

interface NavigationBarProps {
  subscriptionText?: string;
  showLimitIndicators?: boolean;
  className?: string;
  position?: 'top-right' | 'top-left' | 'top-center';
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  subscriptionText = 'Free',
  showLimitIndicators = true,
  className = '',
  position = 'top-right'
}) => {
  const { limitStatus } = useLimitWarnings();

  const positionClasses = {
    'top-right': 'absolute top-6 right-6',
    'top-left': 'absolute top-6 left-6',
    'top-center': 'absolute top-6 left-1/2 transform -translate-x-1/2'
  };

  return (
    <div className={`${positionClasses[position]} flex gap-3 z-20 ${className}`}>
      {/* Indicadores de Límites Compactos */}
      {showLimitIndicators && limitStatus && (
        <div className="hidden sm:flex gap-2">
          <div className="px-3 py-2 rounded-xl bg-gray-900/90 backdrop-blur-md border border-gray-700/50 shadow-lg transition-all duration-300 hover:bg-gray-800/90">
            <LimitIndicator
              type="stories"
              current={limitStatus.stories.current}
              limit={limitStatus.stories.limit}
              isUnlimited={limitStatus.stories.isUnlimited}
              compact={true}
            />
          </div>
          <div className="px-3 py-2 rounded-xl bg-gray-900/90 backdrop-blur-md border border-gray-700/50 shadow-lg transition-all duration-300 hover:bg-gray-800/90">
            <LimitIndicator
              type="voice_credits"
              current={limitStatus.voiceCredits.current}
              limit={limitStatus.voiceCredits.limit}
              isUnlimited={limitStatus.voiceCredits.isUnlimited}
              compact={true}
            />
          </div>
        </div>
      )}
      
      {/* Enlace a Planes */}
      <Link
        to="/plans"
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl shadow-lg text-xs font-semibold transition-all duration-300 bg-gray-900/90 backdrop-blur-md border border-gray-700/50 hover:bg-gray-800/90 text-violet-400 hover:text-violet-300 hover:scale-105"
        aria-label="Ver planes y suscripción"
      >
        <img src="/logo_fantasia.png" alt="icono de estado de suscripción" className="h-5 w-5" />
        <span className="bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent font-bold">
          {subscriptionText}
        </span>
        <ChevronRight className="h-3.5 w-3.5 opacity-75" />
      </Link>
      
      {/* Enlace de Perfil */}
      <Link
        to="/profile-config"
        className="w-9 h-9 rounded-full bg-gray-900/90 backdrop-blur-md border border-gray-700/50 flex items-center justify-center text-violet-400 hover:bg-gray-800/90 hover:text-violet-300 transition-all duration-300 shadow-lg hover:scale-105"
        aria-label="Configuración de Perfil"
      >
        <User className="h-5 w-5" />
      </Link>
      
      {/* Enlace de Configuración */}
      <Link
        to="/settings"
        className="w-9 h-9 rounded-full bg-gray-900/90 backdrop-blur-md border border-gray-700/50 flex items-center justify-center text-violet-400 hover:bg-gray-800/90 hover:text-violet-300 transition-all duration-300 shadow-lg hover:scale-105"
        aria-label="Configuración"
      >
        <Settings className="h-5 w-5" />
      </Link>
    </div>
  );
};

export default NavigationBar;