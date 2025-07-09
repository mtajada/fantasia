import { motion } from "framer-motion";
import { BookOpen, Sparkles, Headphones, Heart, Shield, Zap, Star, Crown, Wand2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import PageTransition from "../components/PageTransition";
import { useUserStore } from "../store/user/userStore";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

export default function Welcome() {
  const navigate = useNavigate();
  const { checkAuth, user } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const isAuthenticated = await checkAuth();
        if (isAuthenticated) {
          navigate("/home");
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, [checkAuth, navigate]);

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundColor: 'black',
        }}
      >
        <div className="w-16 h-16 rounded-full bg-gray-900/50 flex items-center justify-center p-3 backdrop-blur-sm border border-gray-800">
          <div className="animate-spin h-full w-full border-4 border-pink-500 rounded-full border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div
        className="min-h-screen flex flex-col items-center overflow-auto"
        style={{
          backgroundColor: 'black',
        }}
      >
        <header className="w-full max-w-6xl px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <img src="/logo_fantasia.png" alt="Fantasia Logo" className="h-20 md:h-24" />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/login")}
              className="py-2 px-4 rounded-xl text-gray-200 font-medium bg-gray-800/80 hover:bg-gray-700/80 transition-all duration-200 shadow-md border border-gray-700"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="py-2 px-4 rounded-xl text-white font-medium bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 transition-all duration-200 shadow-md"
            >
              Get Started
            </button>
          </div>
        </header>

        <main className="w-full max-w-6xl px-4 sm:px-6 md:px-8 py-6 md:py-8 flex flex-col items-center">
          {/* Hero Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-10 md:mb-12"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
              Intimate Stories <span className="text-pink-400">Tailored for You</span> ✨
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Personalized erotic tales crafted to your desires, featuring sensual voice narration and interactive adult experiences.
            </p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button
                onClick={() => navigate("/signup")}
                className="py-3 px-8 rounded-2xl text-white text-lg font-semibold bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 transition-all duration-200 shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2"
              >
                <Wand2 size={20} />
                <span>CREATE YOUR FIRST FANTASY</span>
              </button>
            </motion.div>
          </motion.div>

          {/* Features Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="w-full mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
              What Makes <span className="text-pink-400">Fantasia</span> Special? 🌶️
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <FeatureCard
                icon={<Heart className="w-6 h-6" />}
                title="Personalized Adult Stories"
                description="Erotic tales crafted to your unique desires, fantasies, and preferences."
                color="#ec4899"
              />
              <FeatureCard
                icon={<Headphones className="w-6 h-6" />}
                title="Sensual Voice Narration"
                description="Professional adult voice work that brings your intimate stories to life."
                color="#8b5cf6"
              />
              <FeatureCard
                icon={<Shield className="w-6 h-6" />}
                title="Privacy & Discretion"
                description="Secure, private platform designed for sophisticated adult entertainment."
                color="#a855f7"
              />
            </div>
          </motion.div>

          {/* Benefits Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
            className="w-full mb-12 bg-gray-900/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-gray-800 ring-1 ring-gray-700/50"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
              Premium Adult Experience 💎
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <BenefitItem
                icon={<Star className="text-yellow-400" size={24} />}
                title="Explore Your Fantasies"
                description="Safe space to discover and explore your deepest desires."
              />
              <BenefitItem
                icon={<BookOpen className="text-pink-400" size={24} />}
                title="Sophisticated Stories"
                description="High-quality erotic literature tailored to mature audiences."
              />
              <BenefitItem
                icon={<Crown className="text-violet-400" size={24} />}
                title="Premium Quality"
                description="Professional-grade adult content with exceptional attention to detail."
              />
              <BenefitItem
                icon={<Zap className="text-pink-500" size={24} />}
                title="Unlimited Stories"
                description="Generate endless personalized erotic tales whenever you desire."
              />
              <BenefitItem
                icon={<Heart className="text-red-400" size={24} />}
                title="Intimate Connection"
                description="Stories that resonate with your personal tastes and preferences."
              />
              <BenefitItem
                icon={<Sparkles className="text-violet-500" size={24} />}
                title="Complete Customization"
                description="Every story adapts to your unique adult interests and kinks."
              />
            </div>
          </motion.div>
        </main>
      </div>
    </PageTransition>
  );
}

function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
  return (
    <div className="bg-gray-900/90 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-gray-800 ring-1 ring-gray-700/50 h-full transition-all duration-300 hover:shadow-xl hover:transform hover:scale-105 hover:ring-2 hover:ring-violet-500/20">
      <div className="flex items-center mb-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
          style={{ backgroundColor: `${color}20` }}
        >
          <div className="text-gray-100" style={{ color }}>
            {icon}
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-100">{title}</h3>
      </div>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}

function BenefitItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start">
      <div className="mr-4 mt-1">
        {icon}
      </div>
      <div>
        <h4 className="text-lg font-semibold text-gray-100 mb-1">{title}</h4>
        <p className="text-gray-300">{description}</p>
      </div>
    </div>
  );
}
