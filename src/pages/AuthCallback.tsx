import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../store/user/userStore";
import { supabase } from "../supabaseClient";
import { getUserProfile } from "../services/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { loginUser, hasCompletedProfile } = useUserStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Obtener datos de la redirección de OAuth
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error en el callback de autenticación:", error.message);
          setError(error.message);
          setTimeout(() => navigate("/login"), 3000);
          return;
        }

        if (data?.session?.user) {
          // Usuario autenticado correctamente
          const userId = data.session.user.id;
          
          loginUser({
            id: userId,
            email: data.session.user.email || "",
          });
          
          try {
            // Verificar si el usuario ya tiene un perfil configurado
            const { success, profile } = await getUserProfile(userId);
            
            if (success && profile) {
              // Si ya tiene perfil, redirigir a la página principal
              navigate("/home");
            } else {
              // Si no tiene perfil, redirigir a la configuración de perfil
              navigate("/profile");
            }
          } catch (profileError) {
            console.error("Error al verificar perfil:", profileError);
            // En caso de error, mandamos a la configuración por seguridad
            navigate("/profile");
          }
        } else {
          // No hay sesión, redirigir al login
          navigate("/login");
        }
      } catch (err) {
        console.error("Error inesperado en callback:", err);
        setError("Ocurrió un error inesperado");
        setTimeout(() => navigate("/login"), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate, loginUser]);

  return (
    <div className="gradient-bg min-h-screen flex flex-col items-center justify-center p-6">
      <div className="glass-card p-8 w-full max-w-md text-center">
        {error ? (
          <>
            <h2 className="text-2xl font-bold text-white mb-4">Error de autenticación</h2>
            <p className="text-white/80 mb-4">{error}</p>
            <p className="text-white/60">Redirigiendo al inicio de sesión...</p>
          </>
        ) : (
          <>
            <div className="animate-spin h-12 w-12 border-4 border-white rounded-full border-t-transparent mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-white mb-4">Autenticando...</h2>
            <p className="text-white/80">Estamos verificando tu información</p>
          </>
        )}
      </div>
    </div>
  );
} 