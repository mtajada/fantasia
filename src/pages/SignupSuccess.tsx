import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import PageTransition from "../components/PageTransition";
import StoryButton from "../components/StoryButton";

export default function SignupSuccess() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{
          backgroundColor: 'black',
        }}
      >
        <div className="w-full max-w-md bg-white/70 rounded-3xl p-8 shadow-lg border border-[#BB79D1]/20 flex flex-col items-center">
          <div className="flex justify-center mb-6">
            <img src="/logo_png.png" alt="Fantasia Logo" className="w-48 max-w-full" />
          </div>

          <CheckCircle className="h-24 w-24 text-[#BB79D1] mb-4" />

          <h1 className="text-3xl font-bold text-[#222] mb-4 text-center">
            ¡Registro Exitoso!
          </h1>

          <p className="text-[#555] text-center mb-8">
            Tu cuenta ha sido creada correctamente. Por favor, revisa tu correo electrónico para confirmar tu registro.
          </p>

          <div className="w-full max-w-xs">
            <button
              onClick={() => navigate("/login")}
              className="w-full py-4 rounded-2xl text-white text-lg font-semibold shadow-lg transition-all duration-200 bg-[#F6A5B7] hover:bg-[#F6A5B7]/80 active:bg-[#F6A5B7]/90"
            >
              Ir a Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
} 