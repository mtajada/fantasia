import { useLocation, useNavigate } from "react-router-dom";
import { RefreshCw, Home } from "lucide-react";
import PageTransition from "../components/PageTransition";
import { useIsMobile } from "@/hooks/use-mobile";

export default function ErrorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const error = location.state?.error || "Algo salió mal";
  const isMobile = useIsMobile();

  const tryAgain = () => {
    navigate(-1);
  };

  return (
    <PageTransition>
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ backgroundColor: 'black' }}
      >
        <div className="w-full max-w-md bg-gray-900/95 backdrop-blur-md border border-gray-800 rounded-3xl shadow-2xl ring-1 ring-gray-700/50 overflow-hidden">
          <div className="p-8 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500/20 to-violet-500/20 border-2 border-violet-500/40 flex items-center justify-center mb-6">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 9V13" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 17.0195V17" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10.1708 3.61232L1.97534 17.001C1.02535 18.5413 2.17321 20.501 3.97914 20.501H20.0209C21.8268 20.501 22.9746 18.5413 22.0246 17.001L13.8292 3.61232C12.8708 2.05984 11.1292 2.05984 10.1708 3.61232Z" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 mb-4 text-center">
              ¡Oops! Algo salió mal 🤫
            </h1>

            <p className="text-gray-300 mb-10 text-center">
              Estamos teniendo problemas creando tu experiencia íntima. Intentemos de nuevo.
            </p>

            <div className="w-full">
              <button
                onClick={tryAgain}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-2xl py-4 font-semibold text-lg mb-4 shadow-lg shadow-violet-500/25 transition-all duration-300 hover:transform hover:scale-105"
              >
                <RefreshCw className="animate-spin-slow" size={20} />
                Intentar de Nuevo ✨
              </button>

              <button
                onClick={() => navigate("/home")}
                className="w-full flex items-center justify-center gap-2 bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 border border-gray-700 rounded-2xl py-4 font-semibold text-lg shadow transition-all duration-300 hover:transform hover:scale-105"
              >
                <Home size={20} />
                Volver al Inicio 🏠
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
