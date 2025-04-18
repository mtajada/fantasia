import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserStore } from '@/store/user/userStore'; // Adjust path if needed
import { supabase } from '@/supabaseClient'; // Adjust path if needed
import { useToast } from '@/hooks/use-toast'; // Adjust path if needed
import PageTransition from '@/components/PageTransition'; // Adjust path if needed
import BackButton from '@/components/BackButton';
import { motion } from 'framer-motion';
import {
    Settings,
    User,
    CreditCard,
    LogOut,
    BookOpen,
    CalendarClock,
    AlertTriangle,
    Star,
    ChevronRight,
    Mail,
    Mic
} from 'lucide-react';

const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user, profileSettings, logoutUser, isPremium } = useUserStore(
        (state) => ({
            user: state.user,
            profileSettings: state.profileSettings,
            logoutUser: state.logoutUser,
            isPremium: state.isPremium, // Assuming isPremium selector exists
        })
    );

    const [isPortalLoading, setIsPortalLoading] = useState(false);
    const [isLogoutLoading, setIsLogoutLoading] = useState(false);
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

    const handleLogout = async () => {
        setIsLogoutLoading(true);
        try {
            await logoutUser();
            // logoutUser should handle redirect internally, but navigate as a fallback
            navigate('/');
            toast({ title: 'Sesión cerrada', description: 'Has cerrado sesión correctamente.' });
        } catch (error) {
            console.error("Error during logout:", error);
            toast({ title: 'Error', description: 'No se pudo cerrar sesión.', variant: 'destructive' });
            setIsLogoutLoading(false);
        }
    };

    const handleCheckout = async (item: 'premium' | 'credits') => {
        setIsCheckoutLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('create-checkout-session', {
                body: JSON.stringify({ item }),
            });

            if (error) throw error;

            if (data?.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No se recibió URL de checkout.');
            }
        } catch (error: any) {
            console.error(`Error creating ${item} checkout session:`, error);
            toast({ title: 'Error', description: `No se pudo iniciar el pago: ${error.message}`, variant: 'destructive' });
            setIsCheckoutLoading(false);
        }
    };

    const handleManageSubscription = async () => {
        if (!profileSettings?.stripe_customer_id) {
            toast({ title: 'Error', description: 'No se encontró información de cliente para gestionar la suscripción.', variant: 'destructive' });
            return;
        }

        setIsPortalLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('create-customer-portal-session');

            if (error) throw error;

            if (data?.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No se recibió URL del portal de cliente.');
            }
        } catch (error: any) {
            console.error("Error creating customer portal session:", error);
            toast({ title: 'Error', description: `No se pudo redirigir a la gestión de suscripción: ${error.message}`, variant: 'destructive' });
            setIsPortalLoading(false);
        } // No finally block needed for isLoading as page redirects on success
    };

    if (!user || !profileSettings) {
        // Optional: Show a loading state or redirect if data isn't ready
        return (
            <PageTransition>
                <div className="min-h-screen gradient-bg flex justify-center items-center p-6">
                    <div className="rounded-full h-12 w-12 border-4 border-brand-blue border-t-transparent animate-spin"></div>
                </div>
            </PageTransition>
        );
    }

    const premiumUser = isPremium(); // Call the selector

    // --- Calculate Reset Date String --- BEGIN
    let resetDateString = "Fecha no disponible"; // Default
    let resetInfoPrefix = premiumUser ? "Tu límite de voz premium se reinicia" : "Tu límite de historias gratuitas se reinicia";

    if (premiumUser) {
        // Premium: Use current_period_end
        const endDateISO = profileSettings?.current_period_end;
        if (endDateISO) {
            try {
                const endDate = new Date(endDateISO);
                resetDateString = new Intl.DateTimeFormat('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    // year: 'numeric' // Optional: add year if needed
                }).format(endDate);
                resetDateString = `el ${resetDateString}`;
            } catch (e) {
                console.error("Error formateando current_period_end:", e);
                resetDateString = "Error al formatear fecha";
            }
        } else {
            console.warn("Usuario premium sin current_period_end en profileSettings.");
            resetDateString = "en el próximo ciclo de facturación";
        }
    } else {
        // Free: Static message
        resetDateString = "el día 1 del próximo mes";
    }
    // --- Calculate Reset Date String --- END

    return (
        <PageTransition>
            <div
                className="min-h-screen flex flex-col items-center justify-start bg-[#FFF6FA] relative"
                style={{
                    backgroundImage: 'url(/fondo_png.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                {/* Logo centrado arriba */}
                <div className="flex flex-col items-center mt-6 mb-2 select-none">
                    <img src="/logo_png.png" alt="TaleMe Logo" className="w-48 max-w-xs mx-auto mb-2 drop-shadow-xl" />
                </div>
                <div className="container mx-auto px-4 py-2 max-w-2xl">
                    {/* Back button */}
                    <BackButton className="absolute top-8 left-4 md:left-8" />

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-6"
                    >
                        <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-[#BB79D1]/80 border border-[#BB79D1]/50 mb-2 shadow-lg">
                            <Settings className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold font-heading text-[#BB79D1]">Ajustes</h1>
                    </motion.div>

                    {/* Account Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-white/40 backdrop-blur-md rounded-3xl border border-[#BB79D1]/20 shadow-xl overflow-hidden mb-5"
                    >
                        <div className="p-5 border-b border-[#BB79D1]/10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#A5D6F6]/20 flex items-center justify-center">
                                <User className="h-5 w-5 text-[#A5D6F6]" />
                            </div>
                            <h2 className="text-xl font-semibold font-heading text-[#BB79D1]">Cuenta</h2>
                        </div>
                        <div className="p-5">
                            <div className="flex items-center p-2">
                                <Mail className="h-5 w-5 text-[#BB79D1]/80 mr-3" />
                                <div className="flex-1">
                                    <div className="text-sm text-[#BB79D1]/80 mb-1">Email</div>
                                    <div className="font-medium text-[#BB79D1]">{user.email}</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Plan & Billing Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white/40 backdrop-blur-md rounded-3xl border border-[#F9DA60]/20 shadow-xl overflow-hidden mb-5"
                    >
                        <div className="p-5 border-b border-[#F9DA60]/10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#F9DA60]/20 flex items-center justify-center">
                                <CreditCard className="h-5 w-5 text-[#F9DA60]" />
                            </div>
                            <h2 className="text-xl font-semibold font-heading text-[#BB79D1]">Plan y Facturación</h2>
                        </div>
                        <div className="p-5">
                            <div className="flex items-center justify-between p-2 border-b border-[#BB79D1]/10 pb-4 mb-4">
                                <div className="flex items-center">
                                    <div className="text-md text-[#BB79D1]">Plan Actual:</div>
                                </div>
                                <div className={`px-3 py-1 rounded-full font-semibold text-sm ${premiumUser
                                    ? 'bg-gradient-to-r from-[#F9DA60]/30 to-[#F9DA60]/40 text-[#BB79D1] border border-[#F9DA60]/30'
                                    : 'bg-[#BB79D1]/20 text-[#BB79D1] border border-[#BB79D1]/30'
                                    }`}>
                                    {premiumUser ? 'Premium' : 'Free'}
                                </div>
                            </div>

                            {/* Free User Content */}
                            {!premiumUser && (
                                <div className="space-y-5">
                                    {/* Story Limits */}
                                    <div className="flex items-center bg-white/70 border border-[#BB79D1]/20 rounded-2xl p-4 mb-2">
                                        <BookOpen className="h-6 w-6 text-[#BB79D1] mr-3 flex-shrink-0" />
                                        <div className="flex-1">
                                            <div className="text-lg font-bold text-[#222] flex items-center gap-2">
                                                Historias restantes este mes:
                                                <span className="text-[#F6A5B7] font-bold">{profileSettings.monthly_stories_generated !== undefined ? Math.max(0, 10 - profileSettings.monthly_stories_generated) : 'N/A'} / 10</span>
                                            </div>
                                            <div className="text-sm text-[#7DC4E0] mt-1 flex items-center">
                                                <CalendarClock className="mr-1" /> {resetInfoPrefix} {resetDateString}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Voice Credits */}
                                    <div className="border-t border-[#BB79D1]/10 pt-4">
                                        <div className="flex items-center py-2">
                                            <Mic className="h-5 w-5 text-[#A5D6F6] mr-3 flex-shrink-0" />
                                            <div className="flex-1">
                                                <div className="text-sm text-[#BB79D1]/80 mb-1">Créditos de voz disponibles</div>
                                                <div className="font-medium text-[#BB79D1]">{profileSettings.voice_credits || 0}</div>
                                            </div>
                                        </div>
                                        {/* Botón Comprar Créditos Voz (Free user) */}
                                        <div className="pt-2">
                                            <button
                                                onClick={() => handleCheckout('credits')}
                                                disabled={isCheckoutLoading || isPortalLoading}
                                                className="flex items-center justify-between w-full py-3 px-4 bg-[#A5D6F6]/60 border border-[#A5D6F6]/30 hover:bg-[#A5D6F6]/80 text-[#BB79D1] rounded-2xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="h-4 w-4" />
                                                    <span>Comprar Créditos de Voz</span>
                                                </div>
                                                {isCheckoutLoading ? (
                                                    <div className="h-4 w-4 border-2 border-[#BB79D1] border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <ChevronRight className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Botón Ver Planes */}
                                    <div className="border-t border-[#BB79D1]/10 pt-4">
                                        <Link
                                            to="/plans"
                                            className="flex items-center justify-between w-full py-3 px-4 bg-[#F9DA60]/40 border border-[#F9DA60]/30 hover:bg-[#F9DA60]/60 text-[#BB79D1] rounded-2xl font-bold transition-all shadow-md hover:shadow-lg"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Star className="h-4 w-4" />
                                                <span>Ver Planes Premium</span>
                                            </div>
                                            <ChevronRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Premium User Content */}
                            {premiumUser && (
                                <div className="space-y-4">
                                    {/* Voice Generation Limits */}
                                    <div className="flex items-center p-2 bg-[#F9DA60]/20 rounded-lg border border-[#F9DA60]/20">
                                        <Mic className="h-5 w-5 text-[#F9DA60] mr-3 flex-shrink-0" />
                                        <div className="flex-1">
                                            <div className="font-medium text-[#BB79D1]">Generaciones de voz este ciclo: <span className="text-lg font-bold text-[#F9DA60]">{profileSettings.monthly_voice_generations_used !== undefined ? Math.max(0, 20 - profileSettings.monthly_voice_generations_used) : 'N/A'} / 20</span></div>
                                            <div className="text-xs text-[#7DC4E0] mt-1 flex items-center">
                                                <CalendarClock size={14} className="mr-1" />
                                                {resetInfoPrefix} {resetDateString}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2 space-y-3">
                                        <Link
                                            to="/plans"
                                            className="flex items-center justify-between w-full py-3 px-4 bg-[#A5D6F6]/60 border border-[#A5D6F6]/30 hover:bg-[#A5D6F6]/80 text-[#BB79D1] rounded-2xl font-bold transition-all shadow-md hover:shadow-lg"
                                        >
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="h-4 w-4" />
                                                <span>Comprar más créditos</span>
                                            </div>
                                            <ChevronRight className="h-4 w-4" />
                                        </Link>

                                        {profileSettings.stripe_customer_id && (
                                            <button
                                                onClick={handleManageSubscription}
                                                disabled={isPortalLoading}
                                                className="flex items-center justify-center w-full py-3 px-4 bg-white/20 hover:bg-white/30 text-[#BB79D1] rounded-2xl font-bold transition-all"
                                            >
                                                {isPortalLoading ? (
                                                    <div className="h-5 w-5 border-2 border-[#BB79D1] border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <span>Gestionar Suscripción</span>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* General Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="bg-white/40 backdrop-blur-md rounded-3xl border border-[#BB79D1]/20 shadow-xl overflow-hidden mb-10"
                    >
                        <div className="p-5 border-b border-[#BB79D1]/10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#BB79D1]/20 flex items-center justify-center">
                                <Settings className="h-5 w-5 text-[#BB79D1]" />
                            </div>
                            <h2 className="text-xl font-semibold font-heading text-[#BB79D1]">General</h2>
                        </div>
                        <div className="p-5">
                            <button
                                onClick={handleLogout}
                                disabled={isLogoutLoading}
                                className="flex items-center justify-center w-full py-3 px-4 bg-[#F6A5B7] hover:bg-[#BB79D1] text-white rounded-2xl font-bold gap-2 transition-colors shadow-md"
                            >
                                {isLogoutLoading ? (
                                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <LogOut className="h-4 w-4" />
                                        <span>Cerrar Sesión</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </PageTransition>
    );
};

export default SettingsPage;