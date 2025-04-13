import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Globe, User, Languages, Calendar, Heart } from "lucide-react";
import { motion } from "framer-motion";

// Importaciones del Store y tipos
import { useUserStore } from "@/store/user/userStore";
import { ProfileSettings } from "@/types";
import { supabase } from "@/supabaseClient";

// Componentes UI y Hooks
import BackButton from "@/components/BackButton";
import PageTransition from "@/components/PageTransition";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

const ProfileConfigPage: React.FC = () => {
    const navigate = useNavigate();
    const { profileSettings: storeProfileSettings, setProfileSettings, user, hasCompletedProfile } = useUserStore();
    const { toast } = useToast();

    // Estado Local del Formulario
    const [language, setLanguage] = useState("Español");
    const [childAge, setChildAge] = useState(5);
    const [specialNeed, setSpecialNeed] = useState("Ninguna");
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Efecto para cargar datos iniciales del perfil
    useEffect(() => {
        setIsLoading(true);
        if (storeProfileSettings) {
            console.log("ProfileConfigPage: Usando datos del store", storeProfileSettings);
            setLanguage(storeProfileSettings.language || "Español");
            setChildAge(storeProfileSettings.childAge || 5);
            setSpecialNeed(storeProfileSettings.specialNeed || "Ninguna");
            setIsLoading(false);
        } else if (user) {
            console.log("ProfileConfigPage: Usuario existe, pero sin settings en store. Usando defaults.");
            setLanguage("Español");
            setChildAge(5);
            setSpecialNeed("Ninguna");
            setIsLoading(false);
        } else {
            console.log("ProfileConfigPage: Esperando datos del usuario y perfil...");
        }
    }, [user, storeProfileSettings]);

    // Definiciones de idiomas y necesidades especiales
    const languages = [
        { value: "Español", label: "Español", flag: "" },
        { value: "Inglés", label: "Inglés", flag: "" },
        { value: "Francés", label: "Francés", flag: "" },
        { value: "Alemán", label: "Alemán", flag: "" },
        { value: "Italiano", label: "Italiano", flag: "" }
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

    // Manejador del envío del formulario
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

        const wasSetupAlreadyComplete = hasCompletedProfile();

        const profileDataToSave: Partial<ProfileSettings> = {
            language,
            childAge,
            specialNeed: specialNeed === "Ninguna" ? undefined : specialNeed,
        };

        setIsSaving(true);
        try {
            // 1. Guardar los settings editables a través del store Y marcar como completado LOCALMENTE
            const finalSettingsToSave = {
                ...profileDataToSave, // language, age, needs
                has_completed_setup: true // <<<--- AÑADIDO EXPLICITAMENTE
            };
            await setProfileSettings(finalSettingsToSave);

            // 2. Marcar setup como completado en la BD (redundante pero seguro)
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ has_completed_setup: true })
                .eq('id', user.id);

            if (updateError) {
                console.error('Error al marcar perfil como completado:', updateError);
                toast({
                    title: "Error parcial",
                    description: "Se guardó el perfil, pero hubo un problema al marcar el setup como completado.",
                    variant: "destructive",
                });
                // Considerar si detener el flujo aquí
            } else {
                // <<<--- MODIFICADO: Conditional Navigation & Toast --- */
                const nextPath = wasSetupAlreadyComplete ? "/home" : "/plans";
                const successDescription = wasSetupAlreadyComplete
                    ? "Tu configuración ha sido guardada."
                    : "Tu configuración ha sido guardada. ¡Vamos a elegir un plan!";

                toast({
                    title: "¡Perfil actualizado!",
                    description: successDescription,
                });
                navigate(nextPath);
                // <<<--- FIN MODIFICADO --- */
            }
            // --- FIN AÑADIDO ---

        } catch (err) {
            console.error("Error en handleSubmit al llamar a setProfileSettings:", err);
            let errorDesc = "Ha ocurrido un error inesperado al guardar tu perfil.";
            if (err instanceof Error) {
                errorDesc = `Error: ${err.message}`;
            }
            toast({
                title: "Error al guardar",
                description: errorDesc,
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <PageTransition>
            <div className="min-h-screen bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 text-white">
                <div className="container mx-auto px-4 py-8 max-w-2xl">
                    {/* Back button */}
                    <BackButton className="absolute top-8 left-4 md:left-8" />

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="pt-16 text-center mb-8"
                    >
                        <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-orange-500/80 border border-orange-400/50 mb-4 shadow-lg">
                            <User className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Configura tu Perfil</h1>
                        <p className="text-purple-200 text-md max-w-md mx-auto">
                            Personaliza la experiencia para adaptar las historias a tus preferencias
                        </p>
                    </motion.div>

                    {isLoading && (
                        <div className="flex justify-center py-12">
                            <div className="rounded-full h-12 w-12 border-4 border-purple-300 border-t-transparent animate-spin"></div>
                        </div>
                    )}

                    {!isLoading && user && (
                        <motion.form
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            onSubmit={handleSubmit}
                            className="space-y-8 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 shadow-xl p-6"
                        >
                            {/* Language Select */}
                            <div className="space-y-2">
                                <label htmlFor="language" className="flex items-center gap-2 text-lg font-medium mb-2">
                                    <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center">
                                        <Languages className="h-4 w-4 text-indigo-300" />
                                    </div>
                                    <span>Idioma de la Historia</span>
                                </label>

                                <Select value={language} onValueChange={setLanguage}>
                                    <SelectTrigger className="w-full bg-white/10 border-white/20 backdrop-blur-sm text-white hover:bg-white/20 transition-colors h-12">
                                        <SelectValue placeholder="Selecciona un idioma" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-purple-800/90 backdrop-blur-md border-purple-700">
                                        {languages.map((lang) => (
                                            <SelectItem key={lang.value} value={lang.value} className="text-white focus:bg-white/20 focus:text-white">
                                                <span className="flex items-center gap-2">
                                                    <span className="text-lg">{lang.flag}</span> {lang.label}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Child Age Slider */}
                            <div className="space-y-2 pt-2">
                                <label htmlFor="childAge" className="flex items-center gap-2 text-lg font-medium mb-2">
                                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                                        <Calendar className="h-4 w-4 text-amber-300" />
                                    </div>
                                    <span>Edad del Niño/Oyente</span>
                                </label>

                                <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
                                    <Slider
                                        id="childAge"
                                        min={1}
                                        max={10}
                                        step={1}
                                        value={[childAge]}
                                        onValueChange={(value) => setChildAge(value[0])}
                                        className="py-4"
                                    />
                                    <div className="flex justify-between mt-3">
                                        <span className="text-xs text-white/80">1 año</span>
                                        <div className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-400/20 to-amber-600/20 border border-amber-500/30">
                                            <span className="text-2xl font-bold text-amber-300">{childAge}</span>
                                            <span className="text-xs text-amber-200 ml-1">años</span>
                                        </div>
                                        <span className="text-xs text-white/80">10 años</span>
                                    </div>
                                </div>
                            </div>

                            {/* Special Need Select */}
                            <div className="space-y-2 pt-2">
                                <label htmlFor="specialNeed" className="flex items-center gap-2 text-lg font-medium mb-2">
                                    <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center">
                                        <Heart className="h-4 w-4 text-rose-300" />
                                    </div>
                                    <span>¿Alguna necesidad especial? (Opcional)</span>
                                </label>

                                <Select value={specialNeed} onValueChange={setSpecialNeed}>
                                    <SelectTrigger className="w-full bg-white/10 border-white/20 backdrop-blur-sm text-white hover:bg-white/20 transition-colors h-12">
                                        <SelectValue placeholder="Selecciona una opción" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-purple-800/90 backdrop-blur-md border-purple-700">
                                        {specialNeeds.map((need) => (
                                            <SelectItem key={need.value} value={need.value} className="text-white focus:bg-white/20 focus:text-white">
                                                {need.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Botón de Guardar */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isSaving}
                                className="w-full mt-6 py-4 px-6 bg-orange-500/30 border border-orange-400/30 hover:bg-orange-500/40 text-orange-300 rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg transition-all"
                            >
                                {isSaving ? (
                                    <div className="h-5 w-5 border-2 border-orange-300 border-t-transparent rounded-full animate-spin mr-2"></div>
                                ) : (
                                    <Check className="h-5 w-5" />
                                )}
                                <span>{isSaving ? "Guardando..." : "Guardar Perfil"}</span>
                            </motion.button>
                        </motion.form>
                    )}
                </div>
            </div>
        </PageTransition>
    );
};

export default ProfileConfigPage;