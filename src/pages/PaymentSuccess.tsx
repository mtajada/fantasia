import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import { motion } from "framer-motion";
import PageTransition from "../components/PageTransition";

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Extraer session_id de la URL
    const queryParams = new URLSearchParams(location.search);
    const sessionIdParam = queryParams.get('session_id');

    if (sessionIdParam) {
      console.log("Stripe session ID:", sessionIdParam);
      setSessionId(sessionIdParam);
    }
  }, [location]);

  return (
    <PageTransition>
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{
          backgroundColor: 'black',
        }}
      >
        <div className="w-full max-w-md bg-gray-900/95 backdrop-blur-md border border-gray-800 rounded-3xl shadow-2xl ring-1 ring-gray-700/50 overflow-hidden">
          <div className="p-8 flex flex-col items-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-pink-500/20 to-violet-500/20 border-2 border-violet-500/40 flex items-center justify-center mb-6">
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M30 5C16.2 5 5 16.2 5 30C5 43.8 16.2 55 30 55C43.8 55 55 43.8 55 30C55 16.2 43.8 5 30 5ZM30 50C18.95 50 10 41.05 10 30C10 18.95 18.95 10 30 10C41.05 10 50 18.95 50 30C50 41.05 41.05 50 30 50ZM42.5 20L27.5 35L20 27.5L16.25 31.25L27.5 42.5L46.25 23.75L42.5 20Z" fill="#8b5cf6" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 mb-4 text-center">
              Payment Successful! 💎
            </h1>

            <p className="text-gray-300 text-lg mb-12 text-center">
              Perfect! Your purchase was completed successfully. Your account will be updated shortly.
            </p>

            <button
              onClick={() => navigate('/home')}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-2xl py-4 font-semibold text-lg shadow-lg shadow-violet-500/25 transition-all duration-300 hover:transform hover:scale-105"
            >
              <Home size={20} />
              Continue Your Journey ✨
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
