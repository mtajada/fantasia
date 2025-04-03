import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import PageTransition from "../components/PageTransition";
import StoryButton from "../components/StoryButton";

export default function PaymentCancel() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    // Automatically redirect after 5 seconds
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
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="w-full max-w-md p-8 space-y-6 bg-slate-800 rounded-xl shadow-lg border border-red-500/20">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-red-500/10 rounded-full">
              <AlertCircle size={48} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white">Pago Cancelado</h1>
            <p className="text-white/70">
              Has cancelado el proceso de pago. No se ha realizado ningún cargo a tu cuenta.
            </p>
            <p className="text-white/70 mt-4">
              Serás redirigido a tu perfil en <span className="font-bold text-white">{timeLeft}</span> segundos.
            </p>
          </div>

          <div className="flex flex-col space-y-3 pt-4">
            <StoryButton
              onClick={() => navigate("/profile")}
              isFullWidth
              icon={<ArrowLeft size={20} />}
            >
              Volver a mi Perfil
            </StoryButton>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
