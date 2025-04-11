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

// Helper function to calculate the reset date
function calculateResetDate(lastResetDateStr: string | null | undefined): string {
    if (!lastResetDateStr) {
        return "Fecha no disponible";
    }
    try {
        const lastResetDate = new Date(lastResetDateStr);
        const nextResetDate = new Date(lastResetDate.setMonth(lastResetDate.getMonth() + 1));
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
        return nextResetDate.toLocaleDateString('es-ES', options);
    } catch (error) {
        console.error("Error calculating reset date:", error);
        return "Error al calcular fecha";
    }
}

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
                <div className="min-h-screen bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 flex justify-center items-center p-6">
                    <div className="rounded-full h-12 w-12 border-4 border-purple-300 border-t-transparent animate-spin"></div>
                </div>
            </PageTransition>
        );
    }

    const premiumUser = isPremium(); // Call the selector
    const nextResetDate = premiumUser ? '' : calculateResetDate(profileSettings.last_story_reset_date);

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
                        <div className="inline-flex justify-center items-center w-14 h-14 rounded-full bg-indigo-500/80 border border-indigo-400/50 mb-4 shadow-lg">
                            <Settings className="h-7 w-7 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold">Ajustes</h1>
                    </motion.div>

                    {/* Account Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-white/10 backdrop-blur-md rounded-xl border border-white/10 shadow-xl overflow-hidden mb-5"
                    >
                        <div className="p-5 border-b border-white/10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                <User className="h-5 w-5 text-indigo-300" />
                            </div>
                            <h2 className="text-xl font-semibold">Cuenta</h2>
                        </div>
                        <div className="p-5">
                            <div className="flex items-center p-2">
                                <Mail className="h-5 w-5 text-purple-300 mr-3" />
                                <div className="flex-1">
                                    <div className="text-sm text-purple-200 mb-1">Email</div>
                                    <div className="font-medium">{user.email}</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Plan & Billing Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white/10 backdrop-blur-md rounded-xl border border-white/10 shadow-xl overflow-hidden mb-5"
                    >
                        <div className="p-5 border-b border-white/10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <CreditCard className="h-5 w-5 text-blue-300" />
                            </div>
                            <h2 className="text-xl font-semibold">Plan y Facturación</h2>
                        </div>
                        <div className="p-5">
                            <div className="flex items-center justify-between p-2 border-b border-white/5 pb-4 mb-4">
                                <div className="flex items-center">
                                    <div className="text-md">Plan Actual:</div>
                                </div>
                                <div className={`px-3 py-1 rounded-full font-semibold text-sm ${premiumUser
                                    ? 'bg-gradient-to-r from-amber-400/30 to-amber-600/30 text-amber-300 border border-amber-500/30'
                                    : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                    }`}>
                                    {premiumUser ? 'Premium' : 'Free'}
                                </div>
                            </div>

                            {/* Free User Content */}
                            {!premiumUser && (
                                <div className="space-y-5">
                                    {/* Story Limits */}
                                    <div>
                                        <div className="flex items-center py-2">
                                            <BookOpen className="h-5 w-5 text-purple-300 mr-3 flex-shrink-0" />
                                            <div className="flex-1">
                                                <div className="text-sm text-purple-200 mb-1">Historias generadas este mes</div>
                                                <div className="flex justify-between items-center">
                                                    <div className="font-medium">{profileSettings.monthly_stories_generated || 0} / 10</div>
                                                    <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden ml-2">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
                                                            style={{ width: `${Math.min(100, ((profileSettings.monthly_stories_generated || 0) / 10) * 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center py-2 pl-8">
                                            <CalendarClock className="h-5 w-5 text-purple-300 mr-3 flex-shrink-0" />
                                            <div className="flex-1">
                                                <div className="text-sm text-purple-200 mb-1">Tu límite se reinicia el</div>
                                                <div className="font-medium">{nextResetDate}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Voice Credits */}
                                    <div className="border-t border-white/10 pt-4">
                                        <div className="flex items-center py-2">
                                            <Mic className="h-5 w-5 text-teal-300 mr-3 flex-shrink-0" />
                                            <div className="flex-1">
                                                <div className="text-sm text-purple-200 mb-1">Créditos de voz disponibles</div>
                                                <div className="font-medium">{profileSettings.voice_credits || 0}</div>
                                            </div>
                                        </div>
                                        {/* Botón Comprar Créditos Voz (Free user) */}
                                        <div className="pt-2">
                                            <button
                                                onClick={() => handleCheckout('credits')}
                                                disabled={isCheckoutLoading || isPortalLoading} // disable if any checkout/portal loading
                                                className="flex items-center justify-between w-full py-3 px-4 bg-teal-500/30 border border-teal-400/30 hover:bg-teal-500/40 text-teal-300 rounded-lg font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="h-4 w-4" />
                                                    <span>Comprar Créditos de Voz</span>
                                                </div>
                                                {isCheckoutLoading ? (
                                                    <div className="h-4 w-4 border-2 border-teal-300 border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <ChevronRight className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Botón Ver Planes */}
                                    <div className="border-t border-white/10 pt-4">
                                        <Link
                                            to="/plans"
                                            className="flex items-center justify-between w-full py-3 px-4 bg-amber-500/30 border border-amber-400/30 hover:bg-amber-500/40 text-amber-300 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
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
                                    <div className="flex items-center py-2">
                                        <Mic className="h-5 w-5 text-purple-300 mr-3" />
                                        <div className="flex-1">
                                            <div className="text-sm text-purple-200 mb-1">Créditos de voz restantes</div>
                                            <div className="font-medium">{profileSettings.voice_credits || 0}</div>
                                        </div>
                                    </div>

                                    <div className="pt-2 space-y-3">
                                        <Link
                                            to="/plans"
                                            className="flex items-center justify-between w-full py-3 px-4 bg-teal-500/30 border border-teal-400/30 hover:bg-teal-500/40 text-teal-300 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
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
                                                className="flex items-center justify-center w-full py-3 px-4 bg-white/10 hover:bg-white/15 text-white rounded-lg font-medium transition-all"
                                            >
                                                {isPortalLoading ? (
                                                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                        className="bg-white/10 backdrop-blur-md rounded-xl border border-white/10 shadow-xl overflow-hidden"
                    >
                        <div className="p-5 border-b border-white/10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-500/20 flex items-center justify-center">
                                <Settings className="h-5 w-5 text-gray-300" />
                            </div>
                            <h2 className="text-xl font-semibold">General</h2>
                        </div>
                        <div className="p-5">
                            <button
                                onClick={handleLogout}
                                disabled={isLogoutLoading}
                                className="flex items-center justify-center w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium gap-2 transition-colors shadow-md"
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