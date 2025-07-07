import { useLocation, useNavigate } from "react-router-dom";
import { RefreshCw, Home } from "lucide-react";
import PageTransition from "../components/PageTransition";

export default function ErrorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const error = location.state?.error || "Algo salió mal";

  const tryAgain = () => {
    navigate(-1);
  };

  return (
    <PageTransition>
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{
          backgroundColor: 'black',
        }}
      >
        <div className="w-full max-w-md bg-white/90 rounded-3xl shadow-lg overflow-hidden">
          <div className="p-8 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-[#F9DA60]/20 flex items-center justify-center mb-6">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 9V13" stroke="#F9DA60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 17.0195V17" stroke="#F9DA60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10.1708 3.61232L1.97534 17.001C1.02535 18.5413 2.17321 20.501 3.97914 20.501H20.0209C21.8268 20.501 22.9746 18.5413 22.0246 17.001L13.8292 3.61232C12.8708 2.05984 11.1292 2.05984 10.1708 3.61232Z" stroke="#F9DA60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-[#222] mb-4 text-center">
              ¡Ups! Ocurrió un error
            </h1>

            <p className="text-[#333] mb-10 text-center">
              Nuestros asistentes de Fantasia! están teniendo problemas para crear tu historia. Por favor, inténtalo de nuevo.
            </p>

            <div className="w-full">
              <button
                onClick={tryAgain}
                className="w-full flex items-center justify-center gap-2 bg-[#BB79D1] hover:bg-[#BB79D1]/90 text-white rounded-full py-4 font-semibold text-lg mb-4"
              >
                <RefreshCw className="animate-spin-slow" size={20} />
                Intentar nuevamente
              </button>

              <button
                onClick={() => navigate("/home")}
                className="w-full flex items-center justify-center gap-2 bg-[#BB79D1] hover:bg-[#BB79D1]/90 text-white rounded-full py-4 font-semibold text-lg"
              >
                <Home size={20} />
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
