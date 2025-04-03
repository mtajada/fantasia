import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Globe, User, CreditCard } from "lucide-react";
import { useUserStore } from "../store/user/userStore.ts";
import BackButton from "../components/BackButton.tsx";
import StoryButton from "../components/StoryButton.tsx";
import PageTransition from "../components/PageTransition.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { Slider } from "@/components/ui/slider.tsx";
import { motion } from "framer-motion";
import { getProfile, updateProfile } from "../supabaseAuth.ts";
import { useToast } from "@/hooks/use-toast.ts";
import PaymentButtons from "../components/PaymentButtons.tsx";
import ManageSubscriptionButton from "../components/ManageSubscriptionButton.tsx";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { setProfileSettings, user } = useUserStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [language, setLanguage] = useState("Español");
  const [childAge, setChildAge] = useState(5);
  const [specialNeed, setSpecialNeed] = useState("Ninguna");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const { profile, error } = await getProfile();

        if (error) {
          console.error("Error fetching profile:", error);
          // Considera mostrar un toast aquí si es un error crítico
          return;
        }

        if (profile) {
          if (profile.profile_settings) {
            const settings = profile.profile_settings;
            setLanguage(settings.language || "Español");
            setChildAge(settings.childAge || 5);
            setSpecialNeed(settings.specialNeed || "Ninguna");
            setProfileSettings(settings); // Actualizar el store
          }
        }
      } catch (err) { // err es 'unknown'
        console.error("Error fetching profile catch block:", err); // Loguear el error original
        // Podrías mostrar un toast aquí también
        // let errorMessage = "Error inesperado al cargar el perfil.";
        // if (err instanceof Error) { errorMessage = err.message; }
        // toast({ title: "Error", description: errorMessage, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user, setProfileSettings]);

  const languages = [
    // ... (sin cambios aquí) ...
    { value: "Español", label: "Español", flag: "🇪🇸" },
    { value: "Inglés", label: "Inglés", flag: "🇬🇧" },
    { value: "Francés", label: "Francés", flag: "🇫🇷" },
    { value: "Alemán", label: "Alemán", flag: "🇩🇪" },
    { value: "Italiano", label: "Italiano", flag: "🇮🇹" }
  ];

  const specialNeeds = [
    // ... (sin cambios aquí) ...
    { value: "Ninguna", label: "Ninguna" },
    { value: "TEA", label: "Trastorno del Espectro Autista (TEA)" },
    { value: "TDAH", label: "Déficit de Atención e Hiperactividad (TDAH)" },
    { value: "Dislexia", label: "Dislexia o Dificultad en Lectura" },
    { value: "Ansiedad", label: "Ansiedad o Miedos Específicos" },
    { value: "Down", label: "Síndrome de Down" },
    { value: "Comprension", label: "Dificultades de Comprensión Auditiva o Lingüística" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const profileSettings = {
      language,
      childAge,
      specialNeed
    };

    try {
      setIsLoading(true);

      const { error } = await updateProfile(profileSettings);

      if (error) {
        toast({
          title: "Error al guardar perfil",
          description: error.message, // Asume que el error de Supabase tiene .message
          variant: "destructive"
        });
        return;
      }

      setProfileSettings(profileSettings);

      toast({
        title: "Perfil guardado",
        description: "Tu perfil ha sido actualizado correctamente",
      });

      navigate("/home");
    } catch (err) { // err es 'unknown'
      console.error("Error in handleSubmit catch block:", err); // Loguea el error original
      let errorDesc = "Ha ocurrido un error inesperado al guardar tu perfil";
      // Opcional: if (err instanceof Error) { errorDesc = err.message; }
      toast({
        title: "Error inesperado",
        description: errorDesc,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="gradient-bg min-h-screen relative overflow-hidden">
        <BackButton />

        <div className="container max-w-md mx-auto py-20 px-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-story-orange-400 to-story-orange-500 flex items-center justify-center mx-auto mb-6"
          >
            <User size={36} className="text-white" />
          </motion.div>

          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            Configura tu Perfil
          </h1>

          {/* --- Formulario sin cambios --- */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Language Select */}
            <div className="space-y-2">
              <label htmlFor="language" className="story-label flex items-center gap-2">
                <Globe size={20} className="text-story-orange-400" />
                Idioma de la Historia:
              </label>
              <Select
                value={language}
                onValueChange={setLanguage}
              >
                <SelectTrigger className="story-input bg-white text-black">
                  <SelectValue placeholder="Selecciona un idioma" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem
                      key={lang.value}
                      value={lang.value}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-lg">{lang.flag}</span>
                        {lang.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Child Age Slider */}
            <div className="space-y-2">
              <label htmlFor="childAge" className="story-label">
                Edad del Niño/Oyente:
              </label>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
                <Slider
                  id="childAge"
                  min={1}
                  max={10}
                  step={1}
                  value={[childAge]}
                  onValueChange={(value) => setChildAge(value[0])}
                  className="w-full py-4"
                  aria-label="Edad del niño"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-white/80">1</span>
                  <span className="text-2xl font-bold text-white">{childAge}</span>
                  <span className="text-xs text-white/80">10</span>
                </div>
              </div>
            </div>

             {/* Special Need Select */}
             <div className="space-y-2">
              <label htmlFor="specialNeed" className="story-label">
                ¿El oyente tiene alguna necesidad especial? (Opcional)
              </label>
              <Select
                value={specialNeed}
                onValueChange={setSpecialNeed}
              >
                <SelectTrigger className="story-input bg-white/10 backdrop-blur-sm border border-white/20 text-white">
                  <SelectValue placeholder="Selecciona una opción" />
                </SelectTrigger>
                <SelectContent>
                  {specialNeeds.map((need) => (
                    <SelectItem
                      key={need.value}
                      value={need.value}
                    >
                      {need.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <StoryButton
              type="submit"
              isFullWidth
              icon={<Check size={20} />}
              disabled={isLoading}
            >
              {isLoading ? "Guardando..." : "Guardar Perfil"}
            </StoryButton>
          </form>
          {/* --- Fin Formulario --- */}


          {/* --- Sección Planes y Créditos --- */}
          <div className="mt-10 pt-8 border-t border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              Planes y Créditos
            </h2>
            <p className="text-white/80 mb-6 text-center">
              Mejora tu experiencia con una suscripción premium o compra créditos de voz para tus historias.
            </p>
            {/* Asegúrate que PaymentButtons esté correctamente implementado */}
            <PaymentButtons className="mt-4" />

            <div className="mt-6 flex justify-center">
              {/* ManageSubscriptionButton ya tiene su propia lógica */}
              <ManageSubscriptionButton className="w-full sm:w-auto" />
            </div>
          </div>
          {/* --- Fin Sección Planes --- */}

        </div>
      </div>
    </PageTransition>
  );
}