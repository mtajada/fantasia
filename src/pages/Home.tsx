import React, { useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { Settings, User, Star, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from '@/supabaseClient';
import { useStoriesStore } from "../store/stories/storiesStore";
import PageTransition from "../components/PageTransition";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const navigate = useNavigate();
  const { generatedStories } = useStoriesStore(); // Mantener para las historias
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(true);
  const [profile, setProfile] = React.useState<{ has_completed_setup: boolean; subscription_status: string | null; } | null>(null);

  // TODO: These values should come from the profile
  const canCreateStory = () => true; 
  const getRemainingMonthlyStories = () => 10;

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
    // TODO: canCreateStory logic should be implemented with loaded profile
    if (canCreateStory()) {
      navigate("/character-selection");
    } else {
      toast({
        title: "Story limit reached",
        description: profile?.subscription_status === 'active'
          ? "You've reached the story limit for your premium plan. Contact support for more information."
          : `You've reached your monthly free story limit. Upgrade to premium to create more stories.`,
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
        {/* Top navigation buttons */}
        <div className="absolute top-6 right-6 flex gap-4 z-10">
          <Link
            to="/plans"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl shadow-lg text-xs font-semibold transition-all duration-300 bg-gray-900/90 backdrop-blur-md border border-gray-700/50 hover:bg-gray-800/90 text-violet-400 hover:text-violet-300 hover:scale-105`}
            aria-label="View plans and subscription"
          >
            <img src="/icono_png.png" alt="icono free/premium" className="h-5 w-5" />
            <span className="bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent font-bold">{subscriptionText}</span>
            <ChevronRight className="h-3.5 w-3.5 opacity-75" />
          </Link>
          <Link
            to="/profile-config"
            className="w-9 h-9 rounded-full bg-gray-900/90 backdrop-blur-md border border-gray-700/50 flex items-center justify-center text-violet-400 hover:bg-gray-800/90 hover:text-violet-300 transition-all duration-300 shadow-lg hover:scale-105"
            aria-label="Profile Configuration"
          >
            <User className="h-5 w-5" />
          </Link>
          <Link
            to="/settings"
            className="w-9 h-9 rounded-full bg-gray-900/90 backdrop-blur-md border border-gray-700/50 flex items-center justify-center text-violet-400 hover:bg-gray-800/90 hover:text-violet-300 transition-all duration-300 shadow-lg hover:scale-105"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </div>

        {/* Logo and title */}
        <div className="flex flex-col items-center mt-16 mb-12 select-none">
          <img src="/logo_png.png" alt="Fantasia Logo" className="w-80 max-w-md mx-auto mb-6 drop-shadow-2xl filter brightness-110" />
        </div>

        {/* Main action buttons */}
        <div className="flex flex-col items-center w-full max-w-sm gap-6 -mt-6">
          <button
            className={`w-full py-5 rounded-2xl text-lg font-semibold shadow-xl transition-all duration-300 ${canCreateStory()
                ? "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105 hover:-translate-y-1"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            onClick={handleNewStory}
            // disabled={!canCreateStory()}
            title={!canCreateStory() ? `You have ${getRemainingMonthlyStories()} stories left this month` : ""}
          >
            Create New Story ✨
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
      </div>
    </PageTransition>
  );
}
