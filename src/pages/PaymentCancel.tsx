import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PageTransition from "../components/PageTransition";

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
      <div
        className="min-h-screen flex flex-col items-center justify-center p-4"
        style={{
          backgroundColor: 'black',
        }}
      >
        <div className="w-full max-w-md bg-white/90 rounded-3xl shadow-lg overflow-hidden">
          <div className="p-8 flex flex-col items-center">
            <div className="p-3 bg-[#F6A5B7]/20 rounded-full mb-6">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#F6A5B7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 8V12" stroke="#F6A5B7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 16H12.01" stroke="#F6A5B7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-[#222] mb-4 text-center">Pago Cancelado</h1>

            <p className="text-[#333] text-center mb-4">
              Has cancelado el proceso de pago. No se ha realizado ningún cargo a tu cuenta.
            </p>

            <p className="text-[#333] mb-8 text-center">
              Serás redirigido a tu perfil en <span className="font-bold text-[#F6A5B7]">{timeLeft}</span> segundos.
            </p>

            <button
              onClick={() => navigate("/profile")}
              className="w-full flex items-center justify-center gap-2 bg-[#BB79D1] hover:bg-[#BB79D1]/90 text-white rounded-full py-4 font-semibold text-lg"
            >
              <ArrowLeft size={20} />
              Volver a mi Perfil
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
