import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PageTransition from "../components/PageTransition";

export default function PaymentCancel() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    // Redirigir automáticamente después de 5 segundos
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      navigate("/profile");
    }
  }, [timeLeft, navigate]);

  return (
    <PageTransition>
      <div
        className="min-h-screen flex flex-col items-center justify-center p-4"
        style={{
          backgroundColor: 'black',
        }}
      >
        <div className="w-full max-w-md bg-gray-900/95 backdrop-blur-md border border-gray-800 rounded-3xl shadow-2xl ring-1 ring-gray-700/50 overflow-hidden">
          <div className="p-8 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500/20 to-violet-500/20 border-2 border-pink-500/40 flex items-center justify-center mb-6">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 8V12" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 16H12.01" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 mb-4 text-center">
              Pago Cancelado 💔
            </h1>

            <p className="text-gray-300 text-center mb-4">
              No te preocupes, cariño. Tu pago fue cancelado y no se realizaron cargos a tu cuenta.
            </p>

            <p className="text-gray-300 mb-8 text-center">
              Te redirigiremos a tu perfil en <span className="font-bold text-pink-400">{timeLeft}</span> segundos.
            </p>

            <button
              onClick={() => navigate("/profile")}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-2xl py-4 font-semibold text-lg shadow-lg shadow-violet-500/25 transition-all duration-300 hover:transform hover:scale-105"
            >
              <ArrowLeft size={20} />
              Volver al Perfil ✨
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
