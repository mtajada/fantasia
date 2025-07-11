import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Globe, User, Heart } from "lucide-react";
import { motion } from "framer-motion";

// Imports de Supabase (SIN Zustand Store)
import { supabase } from "@/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

// UI Components
import BackButton from "@/components/BackButton";
import PageTransition from "@/components/PageTransition";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const ProfileConfigPage: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { t, changeLanguage, currentLanguage, availableLanguages, isLoading: languageLoading } = useLanguage();

    // Estado Local del Formulario (SOLO campos que existen en DB)
    const [preferences, setPreferences] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Safety check: Ensure t is a function before proceeding
    if (languageLoading || typeof t !== 'function') {
        console.warn('ProfileConfigPage: Language not ready, t is:', typeof t, t);
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-black">
                <div className="flex justify-center py-12">
                    <div className="rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent animate-spin"></div>
                </div>
                <p className="text-gray-400 mt-4">Loading language system...</p>
            </div>
        );
    }

    // Usar idiomas del contexto de idioma
    const languages = availableLanguages;

    // Cargar datos DIRECTAMENTE de Supabase (SIN Store)
    useEffect(() => {
        const loadProfileData = async () => {
            try {
                setIsLoading(true);
                
                // 1. Verificar autenticación
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                if (authError || !user) {
                    toast({
                        title: t('profileConfig.auth.authRequiredTitle'),
                        description: t('profileConfig.auth.authRequiredDescription'),
                        variant: "destructive",
                    });
                    navigate("/login");
                    return;
                }
                
                setCurrentUser(user);

                // 2. Cargar perfil DIRECTAMENTE de la tabla profiles
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('language, preferences, has_completed_setup')
                    .eq('id', user.id)
                    .single();

                if (profileError) {
                    console.error("Error loading profile:", profileError);
                    // Usar valores por defecto para nuevo usuario
                    setPreferences("");
                } else {
                    // Cargar datos existentes (idioma ya se maneja en el contexto)
                    setPreferences(profile.preferences || "");
                }

            } catch (error) {
                console.error("Error in loadProfileData:", error);
                toast({
                    title: t('profileConfig.errors.loadProfileTitle'),
                    description: t('profileConfig.errors.loadProfileDescription'),
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadProfileData();
    }, [navigate, toast]);

    // Guardar DIRECTAMENTE en Supabase (SIN Store)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!currentUser) {
            toast({
                title: t('profileConfig.auth.mustBeAuthenticatedTitle'),
                description: t('profileConfig.auth.mustBeAuthenticatedDescription'),
                variant: "destructive",
            });
            return;
        }

        setIsSaving(true);
        try {
            // Verificar si ya tenía setup completo
            const { data: currentProfile } = await supabase
                .from('profiles')
                .select('has_completed_setup')
                .eq('id', currentUser.id)
                .single();

            const wasSetupComplete = currentProfile?.has_completed_setup || false;

            // Guardar DIRECTAMENTE en Supabase
            // Cambiar de .update() a .upsert() como indica la Fase 2 del plan
            const { error: upsertError } = await supabase
                .from('profiles')
                .upsert({
                    id: currentUser.id,
                    language: currentLanguage,
                    preferences: preferences.trim() || null,
                    has_completed_setup: true
                }, {
                    onConflict: 'id'
                });

            if (upsertError) {
                throw upsertError;
            }

            // Después del upsert, verificar que se guardó correctamente
            const { data: savedProfile, error: verifyError } = await supabase
                .from('profiles')
                .select('has_completed_setup')
                .eq('id', currentUser.id)
                .single();

            if (verifyError || !savedProfile?.has_completed_setup) {
                console.error("Verification failed after upsert:", verifyError);
                throw new Error(t('profileConfig.errors.profileNotSavedError'));
            }

            // Navegación condicional
            const nextPath = wasSetupComplete ? "/home" : "/plans";
            const successDescription = wasSetupComplete
                ? t('profileConfig.success.profileUpdatedDescription')
                : t('profileConfig.success.profileSavedDescription');

            toast({
                title: t('profileConfig.success.profileUpdatedTitle'),
                description: successDescription,
            });
            
            navigate(nextPath);

        } catch (error) {
            console.error("Error saving profile:", error);
            toast({
                title: t('profileConfig.errors.saveErrorTitle'),
                description: t('profileConfig.errors.saveErrorDescription'),
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const selectedLang = languages.find(l => l.value === currentLanguage);

    return (
        <PageTransition>
            <div
                className="min-h-screen flex flex-col items-center justify-start relative"
                style={{ backgroundColor: 'black' }}
            >
                <div className="container mx-auto px-4 py-8 max-w-2xl">
                    <BackButton className="absolute top-8 left-4 md:left-8" />

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="pt-16 text-center mb-8"
                    >
                        <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-gray-800/80 border border-gray-700/50 mb-4 shadow-lg">
                            <User className="h-8 w-8 text-violet-400" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2 font-heading bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">{t('profileConfig.title')}</h1>
                        <p className="text-gray-200 text-md max-w-md mx-auto font-medium bg-gray-800/60 rounded-xl px-4 py-2 shadow-sm">
                            {t('profileConfig.subtitle')}
                        </p>
                    </motion.div>

                    {isLoading && (
                        <div className="flex justify-center py-12">
                            <div className="rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent animate-spin"></div>
                        </div>
                    )}

                    {!isLoading && currentUser && (
                        <motion.form
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            onSubmit={handleSubmit}
                            className="space-y-8 bg-gray-900/90 backdrop-blur-md rounded-2xl border border-gray-800 shadow-2xl p-6 sm:p-8"
                        >
                            {/* Language Select */}
                            <div className="space-y-2">
                                <label htmlFor="language" className="flex items-center gap-2 text-lg font-medium mb-2 font-heading text-gray-200">
                                    <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
                                        <Globe className="h-4 w-4 text-violet-400" />
                                    </div>
                                    <span>{t('profileConfig.language.label')}</span>
                                </label>

                                <Select value={currentLanguage} onValueChange={changeLanguage}>
                                    <SelectTrigger className="w-full bg-gray-900/90 border-gray-700 backdrop-blur-sm text-gray-200 hover:bg-gray-800/90 transition-colors h-12 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20">
                                        {selectedLang ? (
                                            <div className="flex items-center">
                                                <span role="img" aria-label={selectedLang.label} className="mr-2">{selectedLang.flag}</span>
                                                {selectedLang.label}
                                            </div>
                                        ) : (
                                            <SelectValue placeholder={t('profileConfig.language.placeholder')} />
                                        )}
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-900/95 border-gray-700 shadow-2xl rounded-2xl text-gray-200 backdrop-blur-md">
                                        {languages.map((lang) => (
                                            <SelectItem key={lang.value} value={lang.value} className="text-gray-200 focus:bg-violet-500/20 focus:text-gray-100 hover:bg-gray-800/50">
                                                <span className="flex items-center gap-3">
                                                    <span className="text-xl inline-block min-w-[1.5rem]">{lang.flag}</span>
                                                    <span>{lang.label}</span>
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Preferences Text Area */}
                            <div className="space-y-2 pt-2">
                                <label htmlFor="preferences" className="flex items-center gap-2 text-lg font-medium mb-2 font-heading text-gray-200">
                                    <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center">
                                        <Heart className="h-4 w-4 text-pink-400" />
                                    </div>
                                    <span>{t('profileConfig.preferences.label')}</span>
                                </label>

                                <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-700 p-4">
                                    <Textarea
                                        id="preferences"
                                        placeholder={t('profileConfig.preferences.placeholder')}
                                        value={preferences}
                                        onChange={(e) => setPreferences(e.target.value)}
                                        className="bg-transparent border-none resize-none focus:ring-0 text-gray-200 placeholder:text-gray-400 min-h-[120px]"
                                        maxLength={1000}
                                    />
                                    <div className="text-xs text-gray-400 mt-2">
                                        {t('profileConfig.preferences.charactersCount', { count: preferences.length })}
                                    </div>
                                </div>
                            </div>

                            {/* Save Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isSaving || isLoading}
                                className={`w-full mt-6 py-4 px-6 rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg transition-all ${
                                    (isSaving || isLoading)
                                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-violet-500/25'
                                }`}
                            >
                                {isSaving ? (
                                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                ) : (
                                    <Check className="h-5 w-5 text-white" />
                                )}
                                <span>{isSaving ? t('profileConfig.buttons.saving') : t('profileConfig.buttons.save')}</span>
                            </motion.button>
                        </motion.form>
                    )}
                </div>
            </div>
        </PageTransition>
    );
};

export default ProfileConfigPage;