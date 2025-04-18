import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserStore } from '@/store/user/userStore'; // Adjust path if needed
import { supabase } from '@/supabaseClient'; // Adjust path if needed
import { useToast } from '@/hooks/use-toast'; // Adjust path if needed
import PageTransition from '@/components/PageTransition'; // Adjust path if needed
import BackButton from '@/components/BackButton';
import { motion } from 'framer-motion';
import {
    Star,
    BookOpen,
    TrendingUp,
    Mic,
    CheckCircle,
    XCircle,
    ChevronRight,
    ChevronLeft,
    Sparkles,
    CreditCard,
    Settings
} from 'lucide-react';

const PlansPage: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { profileSettings, isPremium } = useUserStore(
        (state) => ({
            profileSettings: state.profileSettings,
            isPremium: state.isPremium,
        })
    );

    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'comparison' | 'details'>(isPremium() ? 'details' : 'comparison');
    const [activePlan, setActivePlan] = useState<'free' | 'premium'>(isPremium() ? 'premium' : 'free');

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
        } // No finally needed as page redirects on success
    };

    const premiumUser = isPremium();

    // Define features for comparison table (updated per requirements)
    const features = [
        { name: 'Historias Generadas', free: '10 / mes', premium: 'Ilimitadas', icon: BookOpen },
        { name: 'Continuaciones por Historia', free: '1', premium: 'Ilimitadas', icon: TrendingUp },
        { name: 'Narración con Voz (IA)', free: 'No', premium: 'Sí (20/mes incl.)', icon: Mic },
        { name: 'Retos Creativos', free: 'Sí', premium: 'Sí', icon: CheckCircle }, // Both marked as available
    ];

    return (
        <PageTransition>
            <div
                className="relative min-h-screen flex flex-col items-center justify-start p-0"
                style={{
                    backgroundImage: 'url(/fondo_png.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                {/* Logo y cabecera - Reducido espacio */}
                <div className="flex flex-col items-center mt-4 mb-0 select-none">
                    <img src="/logo_png.png" alt="TaleMe Logo" className="w-60 max-w-xs mx-auto mb-0 drop-shadow-xl" />
                </div>
                <div className="container mx-auto px-4 py-0 max-w-4xl">
                    {/* Back button */}
                    <BackButton className="absolute top-8 left-4 md:left-8" />
                    {/* Premium User View */}
                    {premiumUser && (
                        <div className="pt-0">
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="text-center mb-6"
                            >
                                <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-[#F9DA60] mb-2">
                                    <Star className="h-8 w-8 text-[#BB79D1]" />
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold mb-2 font-heading text-[#BB79D1]">Plan Premium Activo</h1>
                                <p className="text-[#7DC4E0] text-lg">Disfruta de todas las funciones sin límites</p>
                            </motion.div>
                            <div className="grid md:grid-cols-2 gap-6 mt-8">
                                {/* Card: Buy Voice Credits */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.1 }}
                                    className="bg-white/40 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl border border-[#A5D6F6]/30"
                                >
                                    <div className="p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-[#A5D6F6]/40 flex items-center justify-center">
                                                <Mic className="h-5 w-5 text-[#7DC4E0]" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-xl font-heading text-[#BB79D1]">Créditos de Voz</h3>
                                                <p className="text-[#7DC4E0] text-sm">Amplía tus narraciones</p>
                                            </div>
                                        </div>
                                        <div className="mb-6">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[#BB79D1]">Disponibles:</span>
                                                <span className="font-mono font-bold text-lg text-[#7DC4E0]">{profileSettings?.voice_credits || 0}</span>
                                            </div>
                                            <div className="h-2 bg-[#E6B7D9]/40 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-[#7DC4E0] to-[#BB79D1]"
                                                    style={{ width: `${Math.min(100, ((profileSettings?.voice_credits || 0) / 20) * 100)}%` }}></div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleCheckout('credits')}
                                            disabled={isCheckoutLoading}
                                            className="w-full py-3 px-4 bg-[#A5D6F6]/70 border border-[#A5D6F6]/60 hover:bg-[#A5D6F6] text-white rounded-2xl font-medium flex justify-center items-center gap-2 shadow-lg transform transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            {isCheckoutLoading ? (
                                                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <>
                                                    <CreditCard className="h-4 w-4" />
                                                    <span>Comprar Créditos</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                                {/* Card: Manage Subscription */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className="bg-white/40 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl border border-[#F9DA60]/30"
                                >
                                    <div className="p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-[#F9DA60]/40 flex items-center justify-center">
                                                <Star className="h-5 w-5 text-[#F9DA60]" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-xl font-heading text-[#BB79D1]">Suscripción Premium</h3>
                                                <p className="text-[#7DC4E0] text-sm">Administra tu plan</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4 mb-6">
                                            <div className="bg-[#F6A5B7]/10 rounded-lg p-3 flex justify-between items-center">
                                                <span className="text-[#BB79D1]">Estado:</span>
                                                <span className="font-medium text-[#F9DA60]">Activo</span>
                                            </div>
                                            <div className="bg-[#F6A5B7]/10 rounded-lg p-3 flex justify-between items-center">
                                                <span className="text-[#BB79D1]">Beneficios:</span>
                                                <span className="font-medium text-[#BB79D1]">Todos los incluidos</span>
                                            </div>
                                        </div>
                                        <Link
                                            to="/settings"
                                            className="flex items-center justify-between w-full py-3 px-4 bg-[#F9DA60]/60 border border-[#F9DA60]/40 hover:bg-[#F9DA60]/80 text-[#BB79D1] rounded-2xl font-medium transition-all shadow-md hover:shadow-lg"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Settings className="h-4 w-4" />
                                                <span>Gestionar Suscripción</span>
                                            </div>
                                            <ChevronRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </motion.div>
                            </div>
                            {/* Bottom Premium Features Reminder */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="mt-8 bg-gradient-to-r from-[#F9DA60]/20 to-[#F9DA60]/30 backdrop-blur-md rounded-3xl p-5 border border-[#F9DA60]/30"
                            >
                                <h3 className="font-bold text-lg mb-2 flex items-center gap-2 font-heading text-[#BB79D1]">
                                    <Sparkles className="h-5 w-5 text-[#F9DA60]" />
                                    <span>Beneficios Premium Activos</span>
                                </h3>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                                            <span className="text-sm text-[#7DC4E0]">{feature.name}: <span className="font-medium text-[#BB79D1]">{feature.premium}</span></span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                            {/* Botón para ir a la app */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="mt-8 text-center"
                            >
                                <Link
                                    to="/home"
                                    className="inline-block py-3 px-6 bg-[#BB79D1] hover:bg-[#A37AC2] text-white rounded-2xl font-medium flex items-center justify-center gap-2 shadow-lg transform transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] mx-auto"
                                >
                                    <BookOpen className="h-5 w-5" />
                                    <span>Ir a la aplicación</span>
                                </Link>
                            </motion.div>
                        </div>
                    )}
                    {/* Free User View */}
                    {!premiumUser && (
                        <div className="pt-0 flex flex-col min-h-[80vh] justify-between">
                            <div>
                                {/* Header */}
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="text-center mb-4"
                                >
                                    <h1 className="text-3xl md:text-4xl font-bold mb-1 font-heading text-[#BB79D1]">Desbloquea tu Creatividad</h1>
                                    <p className="text-[#7DC4E0] text-lg mx-auto max-w-xl">
                                        Compara los planes y elige la mejor experiencia para tus historias
                                    </p>
                                </motion.div>
                                {/* Plan Toggle */}
                                <div className="flex justify-center mb-4">
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.1 }}
                                        className="bg-white/40 backdrop-blur-md rounded-full p-1 inline-flex"
                                    >
                                        <button
                                            onClick={() => setActivePlan('free')}
                                            className={`py-2 px-5 md:px-8 rounded-full transition-colors flex items-center gap-2 ${activePlan === 'free'
                                                ? 'bg-[#F6A5B7]/60 text-white font-medium'
                                                : 'text-[#BB79D1] hover:text-white'
                                                }`}
                                        >
                                            <span>Free</span>
                                        </button>
                                        <button
                                            onClick={() => setActivePlan('premium')}
                                            className={`py-2 px-5 md:px-8 rounded-full transition-colors flex items-center gap-2 ${activePlan === 'premium'
                                                ? 'bg-gradient-to-r from-[#F9DA60] to-[#F9DA60]/80 text-white font-medium'
                                                : 'text-[#BB79D1] hover:text-white'
                                                }`}
                                        >
                                            <Star className="h-4 w-4" />
                                            <span>Premium</span>
                                        </button>
                                    </motion.div>
                                </div>
                                {/* Features by Plan */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className="max-w-2xl mx-auto"
                                >
                                    {/* Active Plan Card */}
                                    <div className="bg-white/40 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl border border-[#BB79D1]/20 mb-6">
                                        {/* Plan Header - Mejorada legibilidad */}
                                        <div className={`p-6 ${activePlan === 'premium'
                                            ? 'bg-gradient-to-r from-[#F9DA60]/40 to-[#F9DA60]/50 border-b border-[#F9DA60]/40'
                                            : 'bg-[#F6A5B7]/20 border-b border-[#BB79D1]/20'
                                            }`}>
                                            <div className="flex justify-between items-center">
                                                <h2 className="text-2xl font-bold flex items-center gap-2 font-heading text-[#BB79D1]">
                                                    {activePlan === 'premium' && <Star className="h-5 w-5 text-[#F9DA60]" />}
                                                    Plan {activePlan === 'premium' ? 'Premium' : 'Free'}
                                                </h2>
                                                {activePlan === 'premium' && (
                                                    <span className="bg-[#F9DA60]/30 text-[#BB79D1] px-3 py-1 rounded-full text-sm font-bold">
                                                        Recomendado
                                                    </span>
                                                )}
                                            </div>
                                            {activePlan === 'premium' ? (
                                                <p className="text-[#BB79D1] mt-1 font-medium">Creatividad sin límites para tus historias</p>
                                            ) : (
                                                <p className="text-[#7DC4E0] mt-1">Perfecto para comenzar a explorar</p>
                                            )}
                                        </div>
                                        {/* Features List */}
                                        <div className="p-6">
                                            <ul className="space-y-4">
                                                {features.map((feature, index) => (
                                                    <li key={index} className="flex items-start gap-3">
                                                        <div className="mt-0.5">
                                                            {activePlan === 'premium' ? (
                                                                feature.premium === 'No' ? (
                                                                    <XCircle className="h-5 w-5 text-red-400" />
                                                                ) : (
                                                                    <CheckCircle className="h-5 w-5 text-green-400" />
                                                                )
                                                            ) : (
                                                                feature.free === 'No' ? (
                                                                    <XCircle className="h-5 w-5 text-red-400" />
                                                                ) : (
                                                                    <CheckCircle className="h-5 w-5 text-green-400" />
                                                                )
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <feature.icon className="h-4 w-4 text-[#7DC4E0]" />
                                                                <span className="font-bold text-[#BB79D1]">{feature.name}</span>
                                                            </div>
                                                            <div className="text-sm font-medium text-[#7DC4E0]">
                                                                {activePlan === 'premium' ? feature.premium : feature.free}
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                            {/* Botones de navegación entre planes - Con espacio abajo */}
                            <div className="flex flex-col md:flex-row justify-center gap-4 mb-10">
                                {activePlan === 'free' && (
                                    <button
                                        onClick={() => setActivePlan('premium')}
                                        className="py-3 px-8 bg-gradient-to-r from-[#F6A5B7] to-[#BB79D1] text-white rounded-2xl font-bold shadow-lg flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:bg-[#BB79D1]/90"
                                    >
                                        <Star className="h-5 w-5" />
                                        <span>Ver plan Premium</span>
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                )}
                                {activePlan === 'premium' && (
                                    <button
                                        onClick={() => setActivePlan('free')}
                                        className="py-3 px-8 bg-[#A5D6F6]/70 text-[#BB79D1] rounded-2xl font-bold shadow-lg flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:bg-[#BB79D1]/20"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        <span>Ver plan Free</span>
                                    </button>
                                )}
                                {/* Botón para continuar gratis */}
                                {activePlan === 'free' && (
                                    <Link
                                        to="/home"
                                        className="py-3 px-8 bg-transparent border border-[#BB79D1]/50 hover:bg-[#BB79D1]/10 text-[#BB79D1] rounded-2xl font-bold transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                                    >
                                        Continuar con el plan gratuito
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
};

export default PlansPage;