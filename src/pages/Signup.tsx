import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
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
      confirmPassword: ""
    }
  });

  const handleSignup = async (data: { email: string; password: string; confirmPassword: string }) => {
    if (!data.email || !data.password || !data.confirmPassword) {
      toast({
        title: "Error en el registro",
        description: "Por favor, completa todos los campos",
        variant: "destructive"
      });
      return;
    }
    
    if (data.password !== data.confirmPassword) {
      toast({
        title: "Error en el registro",
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
          title: "Error en el registro",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      if (user) {
        toast({
          title: "Registro exitoso",
          description: "¡Tu cuenta ha sido creada! Por favor, revisa tu correo electrónico para confirmar tu registro.",
        });
      } else {
        toast({
          title: "Error en el registro",
          description: "No se pudo crear la cuenta",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error inesperado",
        description: "Ha ocurrido un error inesperado",
        variant: "destructive"
      });
      console.error(err);
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
          title: "Error al registrarse con Google",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error inesperado",
        description: "Ha ocurrido un error al registrarse con Google",
        variant: "destructive"
      });
      console.error(err);
    } finally {
      setIsGoogleLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);
  
  return (
    <PageTransition>
      <div className="gradient-bg min-h-screen flex flex-col items-center justify-center p-6">
        <BackButton />
        
        <div className="w-full max-w-md glass-card p-8">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            Crear Cuenta
          </h1>
          
          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(handleSignup)} 
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={20} />
                      <FormControl>
                        <Input
                          placeholder="Correo electrónico"
                          className="pl-10 story-input"
                          type="email"
                          {...field}
                          required
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={20} />
                      <FormControl>
                        <Input
                          placeholder="Contraseña"
                          className="pl-10 pr-10 story-input"
                          type={showPassword ? "text" : "password"}
                          {...field}
                          required
                        />
                      </FormControl>
                      <button 
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={20} />
                      <FormControl>
                        <Input
                          placeholder="Confirmar contraseña"
                          className="pl-10 pr-10 story-input"
                          type={showConfirmPassword ? "text" : "password"}
                          {...field}
                          required
                        />
                      </FormControl>
                      <button 
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <StoryButton
                type="submit"
                isFullWidth
                disabled={isLoading}
              >
                {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
              </StoryButton>
              
              <div className="relative flex items-center my-4">
                <div className="flex-grow border-t border-white/20"></div>
                <span className="mx-4 flex-shrink text-white/60 text-sm">O regístrate con</span>
                <div className="flex-grow border-t border-white/20"></div>
              </div>
              
              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-2 bg-white text-black rounded-md py-2 hover:bg-gray-100 transition-colors duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                </svg>
                {isGoogleLoading ? "Conectando..." : "Registrarse con Google"}
              </button>
              
              <div className="text-center">
                <span className="text-white/80 text-sm">¿Ya tienes una cuenta? </span>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-story-orange-400 text-sm hover:underline"
                >
                  Iniciar Sesión
                </button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </PageTransition>
  );
}
