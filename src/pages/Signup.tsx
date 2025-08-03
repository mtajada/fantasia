import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import StoryButton from "../components/StoryButton";
import PageTransition from "../components/PageTransition";
import { useToast } from "@/hooks/use-toast";
import BackButton from "../components/BackButton";
import { signUp, signInWithGoogle } from "../supabaseAuth";

export default function Signup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      ageVerification: false
    }
  });

  const handleSignup = async (data: { email: string; password: string; confirmPassword: string; ageVerification: boolean }) => {
    if (!data.email || !data.password || !data.confirmPassword) {
      toast({
        title: "Error de registro",
        description: "Por favor completa todos los campos",
        variant: "destructive"
      });
      return;
    }

    if (!data.ageVerification) {
      toast({
        title: "Verificación de edad requerida",
        description: "Debes confirmar que tienes 18 años o más para registrarte",
        variant: "destructive"
      });
      return;
    }

    if (data.password !== data.confirmPassword) {
      toast({
        title: "Error de registro",
        description: "Las contraseñas no coinciden",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const { user, error } = await signUp(data.email, data.password);

      if (error) {
        toast({
          title: "Error de registro",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      if (user) {
        toast({
          title: "Registro exitoso",
          description: "¡Tu cuenta ha sido creada!",
        });
        // Redirigir a la página de éxito después de un registro exitoso
        setTimeout(() => {
          navigate("/signup-success");
        }, 2000);
      } else {
        toast({
          title: "Error de registro",
          description: "No se pudo crear la cuenta",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error inesperado",
        description: "Ocurrió un error inesperado",
        variant: "destructive"
      });
      console.error("Error en registro:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setIsGoogleLoading(true);
      const { error } = await signInWithGoogle();

      if (error) {
        toast({
          title: "Error registrándose con Google",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error inesperado",
        description: "Ocurrió un error al registrarse con Google",
        variant: "destructive"
      });
      console.error("Error en registro con Google:", err);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <PageTransition>
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{
          backgroundColor: 'black',
        }}
      >
        <div className="absolute top-4 left-4 z-10">
          <BackButton />
        </div>

        <div className="w-full max-w-md bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-2xl p-8 shadow-2xl ring-1 ring-gray-700/50">
          <div className="flex justify-center mb-6">
            <img src="/logo_fantasia.png" alt="Fantasia Logo" className="w-48 max-w-full" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
            Únete a la Fantasía
          </h1>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSignup)}
              className="space-y-5"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-violet-400" size={20} />
                      <FormControl>
                        <Input
                          placeholder="Tu correo, bombón"
                          className="pl-10 py-6 rounded-xl bg-gray-900/90 border-gray-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white placeholder:text-gray-400"
                          type="email"
                          {...field}
                          required
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-violet-400" size={20} />
                      <FormControl>
                        <Input
                          placeholder="Crea tu secreto... 🤫"
                          className="pl-10 pr-10 py-6 rounded-xl bg-gray-900/90 border-gray-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white placeholder:text-gray-400"
                          type={showPassword ? "text" : "password"}
                          {...field}
                          required
                        />
                      </FormControl>
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-violet-400 hover:text-violet-300 transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-violet-400" size={20} />
                      <FormControl>
                        <Input
                          placeholder="Confirma tu secreto... 🤫"
                          className="pl-10 pr-10 py-6 rounded-xl bg-gray-900/90 border-gray-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white placeholder:text-gray-400"
                          type={showConfirmPassword ? "text" : "password"}
                          {...field}
                          required
                        />
                      </FormControl>
                      <button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-violet-400 hover:text-violet-300 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ageVerification"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-start space-x-3 py-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-1 h-5 w-5 border-violet-500 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500 focus:ring-violet-500 focus:ring-offset-2"
                        />
                      </FormControl>
                      <div className="flex-1">
                        <label
                          htmlFor="ageVerification"
                          className="text-sm font-medium text-gray-200 leading-relaxed cursor-pointer select-none"
                          onClick={() => field.onChange(!field.value)}
                        >
                          Confirmo que soy mayor de 18 años y quiero jugar
                        </label>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                          Al marcar esta casilla, declaras que tienes al menos 18 años y das tu consentimiento para entrar en un mundo de contenido para adultos. Prepárate para lo inesperado.
                        </p>
                      </div>
                    </div>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <button
                type="submit"
                disabled={isLoading || !form.watch('ageVerification')}
                className="w-full py-4 rounded-2xl text-white text-lg font-semibold shadow-lg transition-all duration-200 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-violet-500/25"
              >
                {isLoading ? "Creando tu acceso..." : "Entrar en la Fantasía"}
              </button>

              <div className="relative flex items-center my-4">
                <div className="flex-grow border-t border-gray-700"></div>
                <span className="mx-4 flex-shrink text-gray-300 text-sm">O entra con</span>
                <div className="flex-grow border-t border-gray-700"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-2 bg-gray-800/80 text-gray-300 rounded-xl py-3 hover:bg-gray-700/80 transition-colors duration-300 border border-gray-700 shadow-md backdrop-blur-8"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                </svg>
                {isGoogleLoading ? "Abriendo las puertas..." : "Registrarse con Google"}
              </button>

              <div className="text-center mt-5">
                <span className="text-gray-300 text-sm">¿Ya eres parte del juego? </span>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-violet-400 font-semibold text-sm hover:underline"
                >
                  Entra aquí
                </button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </PageTransition>
  );
}
