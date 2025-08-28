import React, { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { supabase } from '@/supabaseClient';
import { useStoriesStore } from "../store/stories/storiesStore";
import PageTransition from "../components/PageTransition";

import { useLimitWarnings } from "@/hooks/useLimitWarnings";
import NavigationBar from "@/components/NavigationBar";
import { navigationUtils } from "@/lib/utils";
import { trackFeatureUsed, trackLimitReached } from "@/services/analyticsService";

export default function Home() {
  const navigate = useNavigate();
  const { generatedStories } = useStoriesStore(); // Mantener para las historias
  const { limitStatus } = useLimitWarnings();
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
        console.error('Error al obtener el perfil, redirigiendo a la configuración:', error);
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


  const handleNewStory = async () => {
    try {
      // Track that user attempted to create a story
      await trackFeatureUsed(
        'create_story_button',
        `stories_remaining_${getRemainingMonthlyStories()}`,
        'Home'
      );

      if (canCreateStory()) {
        // Track successful story creation initiation
        await trackFeatureUsed(
          'story_creation_started',
          `premium_user_${isPremiumUser()}`,
          'Home'
        );
        navigate("/character-selection");
      } else {
        // Track limit reached event
        const currentStories = limitStatus?.stories.current || 0;
        const limitValue = limitStatus?.stories.limit || 10;

        await trackLimitReached('stories', currentStories, limitValue, 'Home_create_button');

        // Track that user was redirected to upgrade
        await trackFeatureUsed(
          'upgrade_redirect_from_limit',
          'stories_limit_reached',
          'Home'
        );

        // Redirect to premium plans instead of showing toast
        navigationUtils.redirectToUpgradePremium();
      }
    } catch (analyticsError) {
      console.warn('[Home] Seguimiento de analíticas falló:', analyticsError);
      // Continue with navigation even if analytics fails
      if (canCreateStory()) {
        navigate("/character-selection");
      } else {
        navigationUtils.redirectToUpgradePremium();
      }
    }
  };

  const premiumUser = profile?.subscription_status === 'active';
  const subscriptionText = premiumUser ? 'Premium 💎' : 'Gratis';

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



        {/* Main action buttons */}
        <div className="flex flex-col items-center w-full max-w-sm gap-6 mt-4">
          <button
            className={`w-full py-5 rounded-2xl text-lg font-semibold shadow-xl transition-all duration-300 ${canCreateStory()
              ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/25 hover:shadow-red-500/40 hover:scale-105 hover:-translate-y-1"
              : "bg-gray-700 text-gray-400 cursor-pointer hover:bg-gray-600"
              }`}
            onClick={handleNewStory}
            aria-disabled={!canCreateStory()}
            title={!canCreateStory() ? "Has alcanzado tu límite de historias mensual. ¡Hazte premium para desatar tu imaginación sin límites!" : ""}
          >
            {canCreateStory() ? "Crear nueva fantasía 🔥" : "🔒 Límite Alcanzado - ¿Más placer?"}
          </button>
          <button
            className="w-full py-5 rounded-2xl text-white text-lg font-semibold shadow-xl transition-all duration-300 bg-orange-500 hover:bg-orange-600 shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 hover:-translate-y-1"
            onClick={() => navigate("/characters-management")}
          >
            Tus Creaciones
          </button>
          {generatedStories.length > 0 && (
            <button
              className="w-full py-5 rounded-2xl text-white text-lg font-semibold shadow-xl transition-all duration-300 bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/25 hover:shadow-yellow-500/40 hover:scale-105 hover:-translate-y-1"
              onClick={() => navigate("/stories")}
            >
              Tus Aventuras
            </button>
          )}
        </div>

      </div>
    </PageTransition>
  );
}
