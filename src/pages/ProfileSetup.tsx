import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Globe, User } from "lucide-react"; // Eliminado CreditCard si no se usa directamente aquí

// --- Importaciones Clave ---
import { useUserStore } from "../store/user/userStore"; // Importar hook del store
import { ProfileSettings } from "../types"; // Importar tipo ProfileSettings
// import { getProfile, updateProfile } from "../supabaseAuth.ts"; // <-- ELIMINADO

// --- Componentes UI y Hooks ---
import BackButton from "../components/BackButton.tsx";
import StoryButton from "../components/StoryButton.tsx";
import PageTransition from "../components/PageTransition.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { Slider } from "@/components/ui/slider.tsx";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast.ts";
import PaymentButtons from "../components/PaymentButtons.tsx";
import ManageSubscriptionButton from "../components/ManageSubscriptionButton.tsx";

export default function ProfileSetup() {
  const navigate = useNavigate();
  // --- Obtener datos y acciones del Store ---
  const { profileSettings: storeProfileSettings, setProfileSettings, user } = useUserStore();
  const { toast } = useToast();

  // --- Estado Local del Formulario ---
  const [language, setLanguage] = useState("Español");
  const [childAge, setChildAge] = useState(5);
  const [specialNeed, setSpecialNeed] = useState("Ninguna"); // Usar 'Ninguna' como valor base
  const [isLoading, setIsLoading] = useState(false); // Para el estado de carga general
  const [isSaving, setIsSaving] = useState(false); // Específico para el guardado

  // --- Efecto para inicializar el formulario con datos del store ---
  useEffect(() => {
    // No necesitamos llamar a getProfile aquí. Los datos ya deberían estar en el store
    // si checkAuth/loginUser funcionaron correctamente.
    setIsLoading(true); // Indicar que estamos esperando datos del store
    if (storeProfileSettings) {
      console.log("ProfileSetup: Usando datos del store", storeProfileSettings);
      setLanguage(storeProfileSettings.language || "Español");
      setChildAge(storeProfileSettings.childAge || 5);
      // Asegurarse de que specialNeed se mapee a 'Ninguna' si es null/undefined/vacío
      setSpecialNeed(storeProfileSettings.specialNeed || "Ninguna");
      setIsLoading(false); // Datos cargados
    } else if (user) {
      // Si hay usuario pero no settings (primera vez o error carga), usar defaults
      console.log("ProfileSetup: Usuario existe, pero sin settings en store. Usando defaults.");
      setLanguage("Español");
      setChildAge(5);
      setSpecialNeed("Ninguna");
      setIsLoading(false);
    } else {
      // Si no hay usuario, podríamos redirigir o esperar
      console.log("ProfileSetup: Esperando datos del usuario y perfil...");
      // setIsLoading(true) se mantiene hasta que user/storeProfileSettings cambien
    }
    // Depender de storeProfileSettings y user para reaccionar a su carga
  }, [user, storeProfileSettings]);


  // Definiciones de idiomas y necesidades especiales (sin cambios)
  const languages = [
    { value: "Español", label: "Español", flag: "🇪🇸" },
    { value: "Inglés", label: "Inglés", flag: "🇬🇧" },
    { value: "Francés", label: "Francés", flag: "🇫🇷" },
    { value: "Alemán", label: "Alemán", flag: "🇩🇪" },
    { value: "Italiano", label: "Italiano", flag: "🇮🇹" }
  ];
  const specialNeeds = [
    { value: "Ninguna", label: "Ninguna" },
    { value: "TEA", label: "Trastorno del Espectro Autista (TEA)" },
    { value: "TDAH", label: "Déficit de Atención e Hiperactividad (TDAH)" },
    { value: "Dislexia", label: "Dislexia o Dificultad en Lectura" },
    { value: "Ansiedad", label: "Ansiedad o Miedos Específicos" },
    { value: "Down", label: "Síndrome de Down" },
    { value: "Comprension", label: "Dificultades de Comprensión Auditiva o Lingüística" }
  ];

  // --- Manejador de Envío/Guardado Refactorizado ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para guardar el perfil.",
        variant: "destructive",
      });
      return;
    }

    // Crear el objeto con los datos del formulario
    // Asegurarse de que el tipo coincida con lo que espera setProfileSettings
    const profileDataToSave: ProfileSettings = {
      language,
      childAge,
      // Guardar undefined si es "Ninguna" para consistencia o mantener "Ninguna" si así lo prefieres en DB
      specialNeed: specialNeed === "Ninguna" ? undefined : specialNeed,
      // IMPORTANTE: No incluir aquí otros campos del store (Stripe, etc.)
      // setProfileSettings solo debe enviar los datos que el usuario puede editar en este form.
      // La acción setProfileSettings en el store se encargará de mergear si es necesario
      // y de llamar a syncUserProfile solo con estos campos editables.
    };

    setIsSaving(true); // Indicar estado de guardado
    try {
      // --- LLAMADA CORRECTA: Usar la acción del store ---
      await setProfileSettings(profileDataToSave);

      toast({
        title: "Perfil guardado",
        description: "Tu configuración ha sido actualizada.",
        // variant: "success", // Si tienes variante success
      });

      navigate("/home"); // O a donde deba ir después de guardar

    } catch (err) { // Capturar errores de setProfileSettings (que podría incluir error de syncUserProfile)
      console.error("Error en handleSubmit al llamar a setProfileSettings:", err);
      let errorDesc = "Ha ocurrido un error inesperado al guardar tu perfil.";
      if (err instanceof Error) {
        // Puedes intentar dar un mensaje más específico si el error de syncUserProfile se propaga
        errorDesc = `Error: ${err.message}`;
      }
      toast({
        title: "Error al guardar",
        description: errorDesc,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false); // Finalizar estado de guardado
    }
  };

  // --- Renderizado del Componente (UI sin cambios estructurales) ---
  return (
    <PageTransition>
      <div className="gradient-bg min-h-screen relative overflow-hidden">
        <BackButton />

        <div className="container max-w-md mx-auto py-20 px-6">
          {/* Icono y Título (sin cambios) */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-story-orange-400 to-story-orange-500 flex items-center justify-center mx-auto mb-6"
          >
            <User size={36} className="text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            {/* Cambiar título si es edición vs configuración inicial? */}
            Configura tu Perfil
          </h1>

          {/* Mostrar indicador de carga mientras se obtienen datos del store */}
          {isLoading && <p className="text-white text-center">Cargando perfil...</p>}

          {/* Mostrar formulario solo si no está cargando */}
          {!isLoading && user && (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Language Select */}
              <div className="space-y-2">
                <label htmlFor="language" className="story-label flex items-center gap-2">
                  <Globe size={20} className="text-story-orange-400" />
                  Idioma de la Historia:
                </label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="story-input bg-white text-black">
                    <SelectValue placeholder="Selecciona un idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        <span className="flex items-center gap-2">
                          <span className="text-lg">{lang.flag}</span> {lang.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Child Age Slider */}
              <div className="space-y-2">
                <label htmlFor="childAge" className="story-label">Edad del Niño/Oyente:</label>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
                  <Slider
                    id="childAge" min={1} max={10} step={1} value={[childAge]}
                    onValueChange={(value) => setChildAge(value[0])}
                    className="w-full py-4" aria-label="Edad del niño"
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
                  ¿Alguna necesidad especial? (Opcional)
                </label>
                <Select value={specialNeed} onValueChange={setSpecialNeed}>
                  <SelectTrigger className="story-input bg-white/10 backdrop-blur-sm border border-white/20 text-white">
                    <SelectValue placeholder="Selecciona una opción" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialNeeds.map((need) => (
                      <SelectItem key={need.value} value={need.value}>
                        {need.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Botón de Guardar */}
              <StoryButton type="submit" isFullWidth icon={<Check size={20} />} disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar Perfil"}
              </StoryButton>
            </form>
          )}

          {/* Sección Planes y Créditos (sin cambios lógicos aquí) */}
          {user && ( // Mostrar solo si el usuario está logueado
            <div className="mt-10 pt-8 border-t border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4 text-center">Planes y Créditos</h2>
              <p className="text-white/80 mb-6 text-center">
                Mejora tu experiencia o compra créditos de voz.
              </p>
              <PaymentButtons className="mt-4" />
              <div className="mt-6 flex justify-center">
                <ManageSubscriptionButton className="w-full sm:w-auto" />
              </div>
            </div>
          )}

        </div>
      </div>
    </PageTransition>
  );
}