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
    Mic,
    Euro
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

    // --- Voice Credits Constants ---
    const PREMIUM_MONTHLY_VOICE_ALLOWANCE = 20; // Or use correct value if different
    const VOICE_CREDITS_PACKAGE_AMOUNT = 20; // Or use correct value if different
    const VOICE_CREDITS_PACKAGE_PRICE_EUR = 10; // Or use correct value if different

    const handleLogout = async () => {
        setIsLogoutLoading(true);
        try {
            await logoutUser();
            // logoutUser should handle redirect internally, but navigate as a fallback
            navigate('/');
            toast({ title: 'Sesión Cerrada', description: 'Has cerrado sesión exitosamente, amor.' });
        } catch (error) {
            console.error("Error durante el cierre de sesión, cariño:", error);
            toast({ title: 'Error', description: 'No pude cerrar la sesión, belleza.', variant: 'destructive' });
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
                throw new Error('No se recibió URL de pago, amor.');
            }
        } catch (error: any) {
            console.error(`Error creando sesión de pago ${item}, cariño:`, error);
            toast({ title: 'Error', description: `No pude iniciar el pago, amor: ${error.message}`, variant: 'destructive' });
            setIsCheckoutLoading(false);
        }
    };

    const handleManageSubscription = async () => {
        if (!profileSettings?.stripe_customer_id) {
            toast({ title: 'Error', description: 'No encontré información del cliente para gestionar la suscripción, cariño.', variant: 'destructive' });
            return;
        }

        setIsPortalLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('create-customer-portal-session');

            if (error) throw error;

            if (data?.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No se recibió URL del portal de cliente, amor.');
            }
        } catch (error: any) {
            console.error("Error creando sesión del portal de cliente, belleza:", error);
            toast({ title: 'Error', description: `No pude redirigir a la gestión de suscripción, amor: ${error.message}`, variant: 'destructive' });
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
    let resetDateString = "Fecha no disponible"; // Por defecto, cariño

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
                console.error("Error formateando current_period_end, amor:", e);
                resetDateString = "Error formateando fecha, cariño";
            }
        } else {
            console.warn("Usuario premium sin current_period_end en profileSettings, amor.");
            resetDateString = "en el próximo ciclo de facturación";
        }
    } else {
        // Free: Static message
        resetDateString = "el 1 del próximo mes";
    }
    // --- Calculate Reset Date String --- END

    return (
        <PageTransition>
            <div
                className="min-h-screen flex flex-col items-center justify-start relative"
                style={{
                    backgroundColor: '#000000',
                }}
            >
                {/* Logo centrado arriba */}
                <div className="flex flex-col items-center mt-6 mb-2 select-none">
                    <img src="/logo_fantasia.png" alt="Fantasia Logo" className="w-48 max-w-xs mx-auto mb-2 drop-shadow-xl" />
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
                        <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-gradient-to-r from-pink-500/20 to-violet-500/20 border border-pink-500/30 mb-2 shadow-lg">
                            <Settings className="h-8 w-8 text-pink-400" />
                        </div>
                        <h1 className="text-3xl font-bold font-heading bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">Configuración Sensual</h1>
                    </motion.div>

                    {/* Account Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-gray-900/90 backdrop-blur-md rounded-2xl border border-gray-800 shadow-2xl ring-1 ring-gray-700/50 overflow-hidden mb-5"
                    >
                        <div className="p-5 border-b border-gray-700/50 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                                <User className="h-5 w-5 text-violet-400" />
                            </div>
                            <h2 className="text-xl font-semibold font-heading text-gray-200">Cuenta</h2>
                        </div>
                        <div className="p-5">
                            <div className="flex items-center p-2">
                                <Mail className="h-5 w-5 text-violet-400 mr-3" />
                                <div className="flex-1">
                                    <div className="text-sm text-gray-400 mb-1">Correo</div>
                                    <div className="font-medium text-gray-200">{user.email}</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Plan & Billing Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-gray-900/90 backdrop-blur-md rounded-2xl border border-gray-800 shadow-2xl ring-1 ring-gray-700/50 overflow-hidden mb-5"
                    >
                        <div className="p-5 border-b border-gray-700/50 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
                                <CreditCard className="h-5 w-5 text-pink-400" />
                            </div>
                            <h2 className="text-xl font-semibold font-heading text-gray-200">Plan y Facturación</h2>
                        </div>
                        <div className="p-5">
                            <div className="flex items-center justify-between p-2 border-b border-gray-700/50 pb-4 mb-4">
                                <div className="flex items-center">
                                    <div className="text-md text-gray-200">Plan Actual:</div>
                                </div>
                                <div className={`px-3 py-1 rounded-full font-semibold text-sm ${premiumUser
                                    ? 'bg-gradient-to-r from-pink-500/30 to-violet-500/40 text-gray-200 border border-pink-500/30'
                                    : 'bg-gray-700/50 text-gray-300 border border-gray-600/50'
                                    }`}>
                                    {premiumUser ? 'Premium ✨' : 'Gratis'}
                                </div>
                            </div>

                            {/* Free User Content */}
                            {!premiumUser && (
                                <div className="space-y-5">
                                    {/* Story Limits */}
                                    <div className="bg-gray-800/70 rounded-2xl p-4 mb-2 border border-gray-700/50 shadow-sm">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                                                <BookOpen className="h-5 w-5 text-violet-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-200">Historias restantes este mes</h3>
                                                <p className="text-gray-400 text-sm">Historias que puedes crear ✨</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center mb-2 px-2">
                                            <span className="text-gray-200 font-medium">Disponibles:</span>
                                            <span className="font-mono font-bold text-xl text-pink-400">{profileSettings.monthly_stories_generated !== undefined ? Math.max(0, 10 - profileSettings.monthly_stories_generated) : 'N/A'}</span>
                                        </div>
                                        <div className="text-sm text-gray-200 mt-3 flex items-center bg-gradient-to-r from-pink-500/30 to-violet-500/30 p-2 rounded-lg border border-pink-500/20">
                                            <CalendarClock className="h-4 w-4 mr-2 text-pink-400" />
                                            <span>Límite se reinicia a 10 historias {resetDateString}</span>
                                        </div>
                                    </div>

                                    {/* Voice Credits */}
                                    <div className="bg-gray-800/70 rounded-2xl p-4 border border-gray-700/50 shadow-sm">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                                                <Mic className="h-5 w-5 text-violet-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-200">Créditos de voz disponibles</h3>
                                                <p className="text-gray-400 text-sm">Para narrar tus historias 🎤</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center mb-2 px-2">
                                            <span className="text-gray-200 font-medium">Disponibles:</span>
                                            <span className="font-mono font-bold text-xl text-violet-400">{profileSettings.voice_credits || 0}</span>
                                        </div>

                                        {/* Voice Credits Purchase Button (Free user) */}
                                        <button
                                            onClick={() => handleCheckout('credits')}
                                            // disabled={isCheckoutLoading || isPortalLoading}
                                            disabled={true}
                                            className="flex items-center justify-between w-full py-3 px-4 mt-3 bg-gradient-to-r from-violet-500/30 to-purple-600/30 rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed border border-violet-500/20"
                                        >
                                            <div className="flex items-center gap-2 text-gray-200 font-bold">
                                                <CreditCard className="h-4 w-4" />
                                                <span>Consigue 20 créditos más por 10€ 💳</span>
                                            </div>
                                            {isCheckoutLoading ? (
                                                <div className="h-4 w-4 border-2 border-gray-200 border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <ChevronRight className="h-4 w-4 text-gray-200" />
                                            )}
                                        </button>
                                    </div>

                                    {/* View Plans Button */}
                                    <div className="border-t border-gray-700/50 pt-4">
                                        <Link
                                            to="/plans?tab=premium"
                                            className="flex items-center justify-between w-full py-3 px-4 bg-gradient-to-r from-pink-500/30 to-violet-500/30 border border-pink-500/30 hover:from-pink-500/40 hover:to-violet-500/40 text-gray-200 rounded-2xl font-bold transition-all shadow-md hover:shadow-lg"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Star className="h-4 w-4" />
                                                <span>Ver Plan Premium ✨</span>
                                            </div>
                                            <ChevronRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Premium User Content */}
                            {premiumUser && (
                                <div className="space-y-5">
                                    {/* Voice Credits Section Premium */}
                                    <div className="bg-gray-800/70 rounded-2xl p-4 border border-gray-700/50 shadow-sm">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                                                <Mic className="h-5 w-5 text-violet-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-200">Créditos de voz disponibles</h3>
                                                <p className="text-gray-400 text-sm">Para narrar tus historias 🎤</p>
                                            </div>
                                        </div>
                                        {/* Monthly plan credits */}
                                        <div className="flex justify-between items-center px-2">
                                            <span className="text-gray-200 font-medium">Créditos del plan este mes:</span>
                                            <span className="font-mono font-bold text-lg text-violet-400">
                                                {profileSettings.monthly_voice_generations_used !== undefined
                                                    ? Math.max(0, PREMIUM_MONTHLY_VOICE_ALLOWANCE - profileSettings.monthly_voice_generations_used)
                                                    : 'N/A'}
                                                {' / '}{PREMIUM_MONTHLY_VOICE_ALLOWANCE}
                                            </span>
                                        </div>
                                        {/* Additional purchased credits */}
                                        <div className="flex justify-between items-center mt-1 px-2 pt-2 border-t border-gray-700/30">
                                            <span className="text-gray-200 font-medium">Créditos comprados:</span>
                                            <span className="font-mono font-bold text-lg text-violet-400">
                                                {profileSettings.voice_credits ?? 0}
                                            </span>
                                        </div>
                                        {/* Informational text */}
                                        <div className="text-sm text-gray-200 mt-3 flex items-center bg-gradient-to-r from-violet-500/30 to-purple-600/30 p-2 rounded-lg border border-violet-500/20">
                                            <CalendarClock className="h-4 w-4 mr-2 text-violet-400" />
                                            <span>Recibes {PREMIUM_MONTHLY_VOICE_ALLOWANCE} narraciones con tu plan cada mes (próximo reinicio {resetDateString}). Los créditos que compres se añaden a tu cuenta, nunca expiran y se usan cuando agotas los créditos de tu plan.</span>
                                        </div>
                                        {/* Voice Credits Purchase Button (Premium user) */}
                                        <button
                                            onClick={() => handleCheckout('credits')}
                                            disabled={isCheckoutLoading}
                                            className="flex items-center justify-between w-full py-3 px-4 mt-3 bg-gradient-to-r from-violet-500/30 to-purple-600/30 rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed border border-violet-500/20"
                                        >
                                            <div className="flex items-center gap-2 text-gray-200 font-bold">
                                                <CreditCard className="h-4 w-4" />
                                                <span>Compra {VOICE_CREDITS_PACKAGE_AMOUNT} créditos más por {VOICE_CREDITS_PACKAGE_PRICE_EUR}€ 💳</span>
                                            </div>
                                            {isCheckoutLoading ? (
                                                <div className="h-4 w-4 border-2 border-gray-200 border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <ChevronRight className="h-4 w-4 text-gray-200" />
                                            )}
                                        </button>
                                    </div>
                                    {/* Manage Subscription */}
                                    {profileSettings.stripe_customer_id && (
                                        <div className="border-t border-gray-700/50 pt-4">
                                            <button
                                                onClick={handleManageSubscription}
                                                disabled={isPortalLoading}
                                                className="flex items-center justify-between w-full py-3 px-4 bg-gradient-to-r from-pink-500/30 to-violet-500/30 border border-pink-500/30 hover:from-pink-500/40 hover:to-violet-500/40 text-gray-200 rounded-2xl font-bold transition-all shadow-md hover:shadow-lg"
                                            >
                                                {isPortalLoading ? (
                                                    <div className="h-5 w-5 border-2 border-gray-200 border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <Settings className="h-4 w-4" />
                                                        <span>Gestionar Suscripción 💳</span>
                                                    </div>
                                                )}
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* General Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="bg-gray-900/90 backdrop-blur-md rounded-2xl border border-gray-800 shadow-2xl ring-1 ring-gray-700/50 overflow-hidden mb-10"
                    >
                        <div className="p-5 border-b border-gray-700/50 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
                                <Settings className="h-5 w-5 text-pink-400" />
                            </div>
                            <h2 className="text-xl font-semibold font-heading text-gray-200">General</h2>
                        </div>
                        <div className="p-5">
                            <button
                                onClick={handleLogout}
                                disabled={isLogoutLoading}
                                className="flex items-center justify-center w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white rounded-2xl font-bold gap-2 transition-all shadow-md hover:shadow-lg"
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