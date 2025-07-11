import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/supabaseClient';
import { useToast } from '@/hooks/use-toast';

export interface LimitWarning {
  type: 'stories' | 'voice_credits';
  message: string;
  severity: 'info' | 'warning' | 'error';
  showUpgrade: boolean;
  current: number;
  limit: number;
}

export interface LimitStatus {
  stories: {
    current: number;
    limit: number;
    isUnlimited: boolean;
  };
  voiceCredits: {
    current: number;
    limit: number;
    isUnlimited: boolean;
  };
  subscriptionStatus: string | null;
}

const CACHE_DURATION = 30000; // 30 seconds cache
const FREE_STORY_LIMIT = 10;
const FREE_VOICE_LIMIT = 20;

export const useLimitWarnings = () => {
  const [warnings, setWarnings] = useState<LimitWarning[]>([]);
  const [limitStatus, setLimitStatus] = useState<LimitStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Cache management
  const cacheRef = useRef<{
    data: LimitStatus | null;
    timestamp: number;
  }>({ data: null, timestamp: 0 });

  const isPremiumUser = useCallback((subscriptionStatus: string | null) => {
    return subscriptionStatus === 'active' || subscriptionStatus === 'trialing';
  }, []);

  const checkLimits = useCallback(async (showToast = false) => {
    try {
      setIsLoading(true);
      
      // Check cache first
      const now = Date.now();
      if (cacheRef.current.data && (now - cacheRef.current.timestamp) < CACHE_DURATION) {
        setLimitStatus(cacheRef.current.data);
        generateWarnings(cacheRef.current.data, showToast);
        return;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('[useLimitWarnings] No authenticated user found');
        return;
      }

      // Fetch profile data with limits
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('subscription_status, stories_generated_this_month, voice_credits')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('[useLimitWarnings] Error fetching profile:', error);
        return;
      }

      if (!profile) {
        console.warn('[useLimitWarnings] No profile found for user');
        return;
      }

      const isPremium = isPremiumUser(profile.subscription_status);
      
      const status: LimitStatus = {
        stories: {
          current: profile.stories_generated_this_month || 0,
          limit: FREE_STORY_LIMIT,
          isUnlimited: isPremium
        },
        voiceCredits: {
          current: profile.voice_credits || 0,
          limit: FREE_VOICE_LIMIT,
          isUnlimited: isPremium
        },
        subscriptionStatus: profile.subscription_status
      };

      // Update cache
      cacheRef.current = {
        data: status,
        timestamp: now
      };

      setLimitStatus(status);
      generateWarnings(status, showToast);

    } catch (error) {
      console.error('[useLimitWarnings] Error checking limits:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isPremiumUser, toast]);

  const generateWarnings = useCallback((status: LimitStatus, showToast: boolean) => {
    const newWarnings: LimitWarning[] = [];

    // Story limits warnings
    if (!status.stories.isUnlimited) {
      const storiesPercentage = (status.stories.current / status.stories.limit) * 100;
      
      if (status.stories.current >= status.stories.limit) {
        // At limit
        const warning: LimitWarning = {
          type: 'stories',
          message: `🔒 You've reached your ${status.stories.limit} story limit this month. Upgrade to premium for unlimited stories! 💎`,
          severity: 'error',
          showUpgrade: true,
          current: status.stories.current,
          limit: status.stories.limit
        };
        newWarnings.push(warning);
        
        if (showToast) {
          toast({
            title: "Story Limit Reached 🚫",
            description: "Time to upgrade for unlimited stories 🌟",
            variant: "destructive"
          });
        }
      } else if (storiesPercentage >= 80) {
        // Near limit (80%+)
        const remaining = status.stories.limit - status.stories.current;
        const warning: LimitWarning = {
          type: 'stories',
          message: `🔥 Only ${remaining} stories left this month! Consider upgrading to premium for unlimited access ✨`,
          severity: 'warning',
          showUpgrade: true,
          current: status.stories.current,
          limit: status.stories.limit
        };
        newWarnings.push(warning);
        
        if (showToast && storiesPercentage >= 90) {
          toast({
            title: "Almost at your limit! 🔥",
            description: `Only ${remaining} stories left this month`,
            variant: "default"
          });
        }
      }
    }

    // Voice credits warnings
    if (!status.voiceCredits.isUnlimited) {
      const creditsRemaining = status.voiceCredits.current;
      
      if (creditsRemaining <= 0) {
        // No credits left
        const warning: LimitWarning = {
          type: 'voice_credits',
          message: "🎤 No voice credits left! Upgrade to premium or buy more credits to hear your stories 💫",
          severity: 'error',
          showUpgrade: true,
          current: 0,
          limit: status.voiceCredits.limit
        };
        newWarnings.push(warning);
        
        if (showToast) {
          toast({
            title: "No Voice Credits Left 🎤",
            description: "Upgrade or buy credits to hear your stories",
            variant: "destructive"
          });
        }
      } else if (creditsRemaining <= 2) {
        // Low credits (2 or less)
        const warning: LimitWarning = {
          type: 'voice_credits',
          message: `⚠️ Only ${creditsRemaining} voice credits left! Consider upgrading or buying more credits 🌟`,
          severity: 'warning',
          showUpgrade: true,
          current: creditsRemaining,
          limit: status.voiceCredits.limit
        };
        newWarnings.push(warning);
        
        if (showToast && creditsRemaining === 1) {
          toast({
            title: "Last Voice Credit! ⚠️",
            description: "Consider upgrading for unlimited voices",
            variant: "default"
          });
        }
      }
    }

    setWarnings(newWarnings);
  }, [toast]);

  // Auto-check on mount
  useEffect(() => {
    checkLimits(false);
  }, [checkLimits]);

  // Clear cache when component unmounts
  useEffect(() => {
    return () => {
      cacheRef.current = { data: null, timestamp: 0 };
    };
  }, []);

  const hasWarnings = warnings.length > 0;
  const hasErrors = warnings.some(w => w.severity === 'error');
  const hasUpgradePrompts = warnings.some(w => w.showUpgrade);

  const getWarningsByType = useCallback((type: 'stories' | 'voice_credits') => {
    return warnings.filter(w => w.type === type);
  }, [warnings]);

  const triggerWarningToast = useCallback((warning: LimitWarning) => {
    const titles = {
      error: {
        stories: "Story Limit Reached 🚫",
        voice_credits: "No Voice Credits 🎤"
      },
      warning: {
        stories: "Almost at your limit! 🔥",
        voice_credits: "Low Voice Credits ⚠️"
      },
      info: {
        stories: "Story Usage Update 📊",
        voice_credits: "Voice Credits Update 🎤"
      }
    };

    toast({
      title: titles[warning.severity][warning.type],
      description: warning.message,
      variant: warning.severity === 'error' ? 'destructive' : 'default'
    });
  }, [toast]);

  return {
    warnings,
    limitStatus,
    isLoading,
    hasWarnings,
    hasErrors,
    hasUpgradePrompts,
    checkLimits,
    getWarningsByType,
    triggerWarningToast,
    clearCache: () => {
      cacheRef.current = { data: null, timestamp: 0 };
    }
  };
};