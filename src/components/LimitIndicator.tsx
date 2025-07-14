import React, { useEffect } from 'react';
import { AlertTriangle, BookOpen, Mic, Star, TrendingUp } from 'lucide-react';
import { trackLimitReached, hasRecentLimitEvent } from '../services/analyticsService';

interface LimitIndicatorProps {
  type: 'stories' | 'voice_credits';
  current: number;
  limit: number;
  isUnlimited?: boolean;
  showUpgradePrompt?: boolean;
  compact?: boolean;
  className?: string;
}

export const LimitIndicator: React.FC<LimitIndicatorProps> = ({ 
  type, 
  current, 
  limit, 
  isUnlimited = false,
  showUpgradePrompt = false,
  compact = false,
  className = ""
}) => {
  const percentage = isUnlimited ? 0 : Math.min((current / limit) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = current >= limit;

  // Analytics tracking for limit events
  useEffect(() => {
    if (isUnlimited) return; // Don't track for unlimited users

    const trackLimitEvents = async () => {
      try {
        // Track when user reaches 100% of their limit
        if (isAtLimit) {
          const hasRecent = await hasRecentLimitEvent(type, 10); // Check last 10 minutes
          if (!hasRecent) {
            await trackLimitReached(type, current, limit, `LimitIndicator_${compact ? 'compact' : 'full'}`);
          }
        }
        // Track when user reaches 80% warning threshold
        else if (isNearLimit && percentage >= 90) { // Track at 90% to avoid too many events
          const hasRecent = await hasRecentLimitEvent(type, 30); // Check last 30 minutes for warning
          if (!hasRecent) {
            await trackLimitReached(type, current, limit, `LimitIndicator_warning_${compact ? 'compact' : 'full'}`);
          }
        }
      } catch (error) {
        console.warn('[LimitIndicator] Failed to track limit event:', error);
      }
    };

    trackLimitEvents();
  }, [isAtLimit, isNearLimit, type, current, limit, compact, isUnlimited, percentage]);

  // Handle upgrade button click with analytics
  const handleUpgradeClick = async () => {
    try {
      // Import the tracking function dynamically to avoid circular imports
      const { trackFeatureUsed } = await import('../services/analyticsService');
      await trackFeatureUsed(
        'upgrade_button_click',
        `limit_indicator_${type}_${isAtLimit ? 'at_limit' : 'near_limit'}`,
        'LimitIndicator'
      );
      
      // Navigate to plans page (you may want to customize this behavior)
      window.location.href = '/plans';
    } catch (error) {
      console.warn('[LimitIndicator] Failed to track upgrade click:', error);
      // Still navigate even if tracking fails
      window.location.href = '/plans';
    }
  };
  
  // Icon mapping
  const iconMap = {
    stories: BookOpen,
    voice_credits: Mic
  };
  
  // Label mapping
  const labelMap = {
    stories: 'Stories this month',
    voice_credits: 'Voice credits'
  };
  
  const Icon = iconMap[type];
  const label = labelMap[type];
  
  // Color classes based on state
  const getProgressColor = () => {
    if (isUnlimited) return 'bg-gradient-to-r from-violet-500 to-purple-600';
    if (isAtLimit) return 'bg-red-500';
    if (isNearLimit) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    return 'bg-gradient-to-r from-blue-500 to-violet-500';
  };
  
  const getTextColor = () => {
    if (isAtLimit) return 'text-red-400';
    if (isNearLimit) return 'text-orange-400';
    return 'text-gray-300';
  };
  
  // Compact version for navigation/headers
  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Icon className="h-4 w-4 text-violet-400" />
        <span className={`text-sm font-medium ${getTextColor()}`}>
          {isUnlimited ? '∞' : `${current}/${limit}`}
        </span>
        {isNearLimit && !isUnlimited && (
          <AlertTriangle className="h-4 w-4 text-orange-500" />
        )}
      </div>
    );
  }
  
  return (
    <div className={`bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-2xl p-4 shadow-lg ring-1 ring-gray-700/50 ${className}`}>
      {/* Header with label and current/limit */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-violet-400" />
          <span className="text-sm font-medium text-gray-50">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${getTextColor()}`}>
            {isUnlimited ? 'Unlimited ∞' : `${current}/${limit}`}
          </span>
          {isNearLimit && !isUnlimited && (
            <AlertTriangle className="h-4 w-4 text-orange-400" />
          )}
          {isUnlimited && (
            <Star className="h-4 w-4 text-violet-400" />
          )}
        </div>
      </div>
      
      {/* Progress bar */}
      {!isUnlimited && (
        <div className="w-full bg-gray-800/60 rounded-full h-2 mb-3 overflow-hidden border border-gray-700/50">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ease-out ${getProgressColor()}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
      
      {/* Status message and upgrade prompt */}
      <div className="flex justify-between items-center">
        <div>
          {isUnlimited ? (
            <span className="text-xs bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent font-medium">
              Premium benefits active ✨
            </span>
          ) : isAtLimit ? (
            <span className="text-xs text-red-400 font-medium">
              Limit reached 🚫
            </span>
          ) : isNearLimit ? (
            <span className="text-xs text-orange-400 font-medium">
              {limit - current} remaining 🔥
            </span>
          ) : (
            <span className="text-xs text-gray-300">
              {limit - current} remaining this month
            </span>
          )}
        </div>
        
        {showUpgradePrompt && (isAtLimit || isNearLimit) && !isUnlimited && (
          <button 
            onClick={handleUpgradeClick}
            className="text-xs bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent hover:from-pink-300 hover:to-violet-300 font-medium transition-all hover:scale-105 active:scale-95"
          >
            Upgrade →
          </button>
        )}
      </div>
      
      {/* Warning messages */}
      {!isUnlimited && (
        <>
          {isAtLimit && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm">
              <p className="text-xs text-red-400 leading-relaxed">
                🔒 You've reached your monthly {type === 'stories' ? 'story' : 'voice credit'} limit. 
                <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent font-medium">
                  Upgrade to premium for unlimited access 💎
                </span>
              </p>
            </div>
          )}
          
          {isNearLimit && !isAtLimit && (
            <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl backdrop-blur-sm">
              <p className="text-xs text-orange-400 leading-relaxed">
                ⚠️ You have {limit - current} {type === 'stories' ? 'stories' : 'voice credits'} left this month.
                <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent font-medium">
                  Consider upgrading to premium 🌟
                </span>
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LimitIndicator;