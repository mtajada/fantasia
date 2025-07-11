import React, { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from '@/supabaseClient';
import { useStoriesStore } from "../store/stories/storiesStore";
import PageTransition from "../components/PageTransition";
import { useToast } from "@/hooks/use-toast";
import { useLimitWarnings } from "@/hooks/useLimitWarnings";
import LimitIndicator from "@/components/LimitIndicator";
import NavigationBar from "@/components/NavigationBar";

export default function Home() {
  const navigate = useNavigate();
  const { generatedStories } = useStoriesStore(); // Mantener para las historias
  const { toast } = useToast();
  const { limitStatus, warnings, hasErrors, checkLimits } = useLimitWarnings();
  const [isLoading, setIsLoading] = React.useState(true);
  const [profile, setProfile] = React.useState<{ has_completed_setup: boolean; subscription_status: string | null; } | null>(null);

  // Real limit logic replacing TODOs
  const canCreateStory = () => {
    if (!limitStatus) return true; // Allow if data hasn't loaded yet
    return limitStatus.stories.isUnlimited || limitStatus.stories.current < limitStatus.stories.limit;
  };
  
  const getRemainingMonthlyStories = () => {
    if (!limitStatus) return 10;
    if (limitStatus.stories.isUnlimited) return Infinity;
    return Math.max(0, limitStatus.stories.limit - limitStatus.stories.current);
  };

  const isPremiumUser = () => {
    return profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing';
  };

  useEffect(() => {
    const checkProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      const { data: userProfile, error } = await supabase
        .from('profiles')
        .select('has_completed_setup, subscription_status')
        .eq('id', user.id)
        .single();

      if (error || !userProfile) {
        console.error('Error fetching profile, redirecting to config:', error);
        navigate("/profile-config", { replace: true });
        return;
      }

      if (!userProfile.has_completed_setup) {
        navigate("/profile-config", { replace: true });
        return;
      }

      setProfile(userProfile);
      setIsLoading(false);
    };

    checkProfile();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-white rounded-full border-t-transparent"></div>
      </div>
    );
  }


  const handleNewStory = () => {
    if (canCreateStory()) {
      navigate("/character-selection");
    } else {
      const remaining = getRemainingMonthlyStories();
      const isPremium = isPremiumUser();
      
      toast({
        title: isPremium ? "Premium Limit Reached 💎" : "Story Limit Reached 🚫",
        description: isPremium
          ? "You've reached your premium story limit. Contact support for more information 📞"
          : `🔒 You've used all ${limitStatus?.stories.limit || 10} stories this month! Upgrade to premium for unlimited stories ✨`,
        variant: "destructive",
      });
    }
  };

  const premiumUser = profile?.subscription_status === 'active';
  const subscriptionText = premiumUser ? 'Premium' : 'Free';

  return (
    <PageTransition>
      <div
        className="relative min-h-screen flex flex-col items-center justify-center p-0"
        style={{
          backgroundColor: 'black',
        }}
      >
        {/* Top navigation with limit indicators */}
        <NavigationBar 
          subscriptionText={subscriptionText}
          showLimitIndicators={true}
        />

        {/* Logo and title */}
        <div className="flex flex-col items-center mt-16 mb-12 select-none">
          <img src="/logo_fantasia.png" alt="Fantasia Logo" className="w-80 max-w-md mx-auto mb-6 drop-shadow-2xl filter brightness-110" />
        </div>

        {/* Limit Indicators */}
        {limitStatus && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="w-full max-w-sm space-y-4 -mt-2"
          >
            <LimitIndicator
              type="stories"
              current={limitStatus.stories.current}
              limit={limitStatus.stories.limit}
              isUnlimited={limitStatus.stories.isUnlimited}
              showUpgradePrompt={!limitStatus.stories.isUnlimited}
            />
            <LimitIndicator
              type="voice_credits"
              current={limitStatus.voiceCredits.current}
              limit={limitStatus.voiceCredits.limit}
              isUnlimited={limitStatus.voiceCredits.isUnlimited}
              showUpgradePrompt={!limitStatus.voiceCredits.isUnlimited}
            />
          </motion.div>
        )}

        {/* Main action buttons */}
        <div className="flex flex-col items-center w-full max-w-sm gap-6 mt-4">
          <button
            className={`w-full py-5 rounded-2xl text-lg font-semibold shadow-xl transition-all duration-300 ${canCreateStory()
              ? "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105 hover:-translate-y-1"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            onClick={handleNewStory}
            disabled={!canCreateStory()}
            title={!canCreateStory() ? `You have ${getRemainingMonthlyStories()} stories left this month` : ""}
          >
            {canCreateStory() ? "Create New Story ✨" : "🔒 Limit Reached - Upgrade?"}
          </button>
          <button
            className="w-full py-5 rounded-2xl text-white text-lg font-semibold shadow-xl transition-all duration-300 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-105 hover:-translate-y-1"
            onClick={() => navigate("/characters-management")}
          >
            My Characters
          </button>
          {generatedStories.length > 0 && (
            <button
              className="w-full py-5 rounded-2xl text-white text-lg font-semibold shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 hover:-translate-y-1"
              onClick={() => navigate("/stories")}
            >
              My Stories
            </button>
          )}
        </div>

        {/* AI Content Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-8 mx-4 max-w-sm bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-2xl p-4 shadow-lg ring-1 ring-gray-700/50"
        >
          <p className="text-sm text-center bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent font-medium leading-relaxed">
            AI-powered fantasies tailored just for you 🪄 - 100% generated content, 100% your pleasure
          </p>
        </motion.div>
      </div>
    </PageTransition>
  );
}
