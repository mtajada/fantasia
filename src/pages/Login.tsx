import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useUserStore } from "../store/user/userStore";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import PageTransition from "../components/PageTransition";
import { useToast } from "@/hooks/use-toast";
import { login, requestPasswordReset, signInWithGoogle } from "../supabaseAuth";
import { getUserProfile } from "../services/supabase";

export default function Login() {
  const navigate = useNavigate();
  const { loginUser } = useUserStore();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const handleLogin = async (data: { email: string; password: string }) => {
    try {
      setIsLoading(true);
      const { user, error } = await login(data.email, data.password);

      if (error) {
        toast({
          title: "Login Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      if (user) {
        loginUser(user);

        toast({
          title: "¡Qué bueno tenerte de vuelta, belleza! ✨",
          description: "¿Preparade para tu próxima aventura picante?",
        });

        try {
          // Check if user already has a configured profile
          const { success, profile } = await getUserProfile(user.id);

          if (success && profile) {
            // Si el usuario tiene perfil, redirigir a la página principal
            navigate("/home");
          } else {
            // If no profile, redirect to profile setup
            navigate("/profile");
          }
        } catch (profileError) {
          console.error("Error verificando perfil:", profileError);
          // En caso de error, redirigir a configuración de perfil por seguridad
          navigate("/profile");
        }
      } else {
        toast({
          title: "Hmm, algo no está bien",
          description: "Revisa tus credenciales e intenta de nuevo",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Algo salió mal",
        description: "Ocurrió un error inesperado",
        variant: "destructive"
      });
      console.error("Error en login:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      const { error } = await signInWithGoogle();

      if (error) {
        toast({
          title: "Error de inicio con Google",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Algo salió mal",
        description: "Ocurrió un error inesperado al iniciar sesión con Google",
        variant: "destructive"
      });
      console.error("Error en login con Google:", err);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = form.getValues("email");
    if (!email) {
      toast({
        title: "Email requerido",
        description: "Por favor ingresa tu dirección de email para restablecer tu contraseña",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await requestPasswordReset(email);

      if (error) {
        toast({
          title: "Error en solicitud de restablecimiento",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Revisa tu email ✨",
        description: "Te hemos enviado instrucciones para restablecer tu contraseña",
      });
    } catch (err) {
      toast({
        title: "Algo salió mal",
        description: "Ocurrió un error inesperado",
        variant: "destructive"
      });
      console.error("Error en reset de contraseña:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <PageTransition>
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{
          backgroundColor: 'black',
        }}
      >
        <div className="w-full max-w-md bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-2xl p-8 shadow-2xl ring-1 ring-gray-700/50">
          <div className="flex justify-center mb-6">
            <img src="/logo_fantasia.png" alt="Fantasia Logo" className="w-48 max-w-full" />
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleLogin)}
              className="space-y-5"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-500" size={20} />
                      <FormControl>
                        <Input
                          placeholder="Tu correo, cariño"
                          className="pl-10 py-6 rounded-xl bg-gray-900/90 border-gray-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/20 text-gray-100 placeholder-gray-400"
                          type="email"
                          {...field}
                          required
                        />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-500" size={20} />
                      <FormControl>
                        <Input
                          placeholder="Tu secreto... 🤫"
                          className="pl-10 pr-10 py-6 rounded-xl bg-gray-900/90 border-gray-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/20 text-gray-100 placeholder-gray-400"
                          type={showPassword ? "text" : "password"}
                          {...field}
                          required
                        />
                      </FormControl>
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-pink-500 hover:text-pink-400 transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberSession}
                    onChange={() => setRememberSession(!rememberSession)}
                    className="rounded text-pink-500 focus:ring-pink-500 border-gray-700 bg-gray-900/90"
                  />
                  <span className="text-sm text-gray-300">Mantenerme dentro</span>
                </label>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-pink-500 hover:text-pink-400 hover:underline transition-colors"
                >
                  ¿Un desliz con la contraseña?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-2xl text-white text-lg font-semibold shadow-lg transition-all duration-200 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105 shadow-violet-500/25"
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </button>


              <div className="relative flex items-center my-4">
                <div className="flex-grow border-t border-gray-700/50"></div>
                <span className="mx-4 flex-shrink text-gray-400 text-sm">O entra con</span>
                <div className="flex-grow border-t border-gray-700/50"></div>
              </div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-2 bg-gray-800/80 text-gray-200 rounded-xl py-3 hover:bg-gray-700/80 transition-all duration-300 border border-gray-700 shadow-md transform hover:scale-105 hover:shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                </svg>
                {isGoogleLoading ? "Conectando con placer..." : "Entrar con Google"}
              </button>

              <div className="text-center mt-5">
                <span className="text-gray-400 text-sm">¿Primera vez aquí? </span>
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="text-pink-500 font-semibold text-sm hover:underline hover:text-pink-400 transition-colors"
                >
                  Únete al placer
                </button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </PageTransition>
  );
}
