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
            <div className="min-h-screen bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 text-white">
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    {/* Back button */}
                    <BackButton className="absolute top-8 left-4 md:left-8" />

                    {/* Premium User View */}
                    {premiumUser && (
                        <div className="pt-16">
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="text-center mb-10"
                            >
                                <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-yellow-400 mb-4">
                                    <Star className="h-8 w-8 text-purple-900" />
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold mb-2">Plan Premium Activo</h1>
                                <p className="text-purple-200 text-lg">Disfruta de todas las funciones sin límites</p>
                            </motion.div>

                            <div className="grid md:grid-cols-2 gap-6 mt-8">
                                {/* Card: Buy Voice Credits */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.1 }}
                                    className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden shadow-xl border border-white/10"
                                >
                                    <div className="p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center">
                                                <Mic className="h-5 w-5 text-teal-300" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-xl">Créditos de Voz</h3>
                                                <p className="text-purple-200 text-sm">Amplía tus narraciones</p>
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-purple-200">Disponibles:</span>
                                                <span className="font-mono font-bold text-lg">{profileSettings?.voice_credits || 0}</span>
                                            </div>
                                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-teal-400 to-cyan-400"
                                                    style={{ width: `${Math.min(100, ((profileSettings?.voice_credits || 0) / 20) * 100)}%` }}></div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleCheckout('credits')}
                                            disabled={isCheckoutLoading}
                                            className="w-full py-3 px-4 bg-teal-500/30 border border-teal-400/30 hover:bg-teal-500/40 text-teal-300 rounded-lg font-medium flex justify-center items-center gap-2 shadow-lg transform transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            {isCheckoutLoading ? (
                                                <div className="h-5 w-5 border-2 border-teal-300 border-t-transparent rounded-full animate-spin"></div>
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
                                    className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden shadow-xl border border-white/10"
                                >
                                    <div className="p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                                                <Star className="h-5 w-5 text-amber-300" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-xl">Suscripción Premium</h3>
                                                <p className="text-purple-200 text-sm">Administra tu plan</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4 mb-6">
                                            <div className="bg-white/5 rounded-lg p-3 flex justify-between items-center">
                                                <span className="text-purple-200">Estado:</span>
                                                <span className="font-medium text-amber-300">Activo</span>
                                            </div>
                                            <div className="bg-white/5 rounded-lg p-3 flex justify-between items-center">
                                                <span className="text-purple-200">Beneficios:</span>
                                                <span className="font-medium">Todos los incluidos</span>
                                            </div>
                                        </div>

                                        <Link
                                            to="/settings"
                                            className="flex items-center justify-between w-full py-3 px-4 bg-amber-500/30 border border-amber-400/30 hover:bg-amber-500/40 text-amber-300 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Star className="h-4 w-4" />
                                                <span>Ver Planes Premium</span>
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
                                className="mt-8 bg-gradient-to-r from-amber-500/20 to-amber-600/20 backdrop-blur-md rounded-xl p-5 border border-amber-500/30"
                            >
                                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-amber-300" />
                                    <span>Beneficios Premium Activos</span>
                                </h3>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                                            <span className="text-sm">{feature.name}: <span className="font-medium">{feature.premium}</span></span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        </div>
                    )}

                    {/* Free User View */}
                    {!premiumUser && (
                        <div className="pt-16">
                            {/* Header */}
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="text-center mb-10"
                            >
                                <h1 className="text-3xl md:text-4xl font-bold mb-2">Desbloquea tu Creatividad</h1>
                                <p className="text-purple-200 text-lg mx-auto max-w-xl">
                                    Compara los planes y elige la mejor experiencia para tus historias
                                </p>
                            </motion.div>

                            {/* Plan Toggle */}
                            <div className="flex justify-center mb-10">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.1 }}
                                    className="bg-white/10 backdrop-blur-md rounded-full p-1 inline-flex"
                                >
                                    <button
                                        onClick={() => setActivePlan('free')}
                                        className={`py-2 px-5 md:px-8 rounded-full transition-colors flex items-center gap-2 ${activePlan === 'free'
                                            ? 'bg-white/20 text-white font-medium'
                                            : 'text-white/70 hover:text-white'
                                            }`}
                                    >
                                        <span>Free</span>
                                    </button>
                                    <button
                                        onClick={() => setActivePlan('premium')}
                                        className={`py-2 px-5 md:px-8 rounded-full transition-colors flex items-center gap-2 ${activePlan === 'premium'
                                            ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-white font-medium'
                                            : 'text-white/70 hover:text-white'
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
                                <div className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden shadow-xl border border-white/10 mb-6">
                                    {/* Plan Header */}
                                    <div className={`p-6 ${activePlan === 'premium'
                                        ? 'bg-gradient-to-r from-amber-500/30 to-amber-600/30 border-b border-amber-500/30'
                                        : 'bg-white/5 border-b border-white/10'
                                        }`}>
                                        <div className="flex justify-between items-center">
                                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                                {activePlan === 'premium' && <Star className="h-5 w-5 text-amber-300" />}
                                                Plan {activePlan === 'premium' ? 'Premium' : 'Free'}
                                            </h2>
                                            {activePlan === 'premium' && (
                                                <span className="bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-sm font-medium">
                                                    Recomendado
                                                </span>
                                            )}
                                        </div>
                                        {activePlan === 'premium' ? (
                                            <p className="text-purple-200 mt-1">Creatividad sin límites para tus historias</p>
                                        ) : (
                                            <p className="text-purple-200 mt-1">Perfecto para comenzar a explorar</p>
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
                                                            <feature.icon className="h-4 w-4 text-purple-300" />
                                                            <span className="font-medium">{feature.name}</span>
                                                        </div>
                                                        <p className="text-sm text-purple-200 mt-1">
                                                            {activePlan === 'premium' ? feature.premium : feature.free}
                                                        </p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Call to Action */}
                                    {activePlan === 'premium' && (
                                        <div className="p-6 pt-0">
                                            <button
                                                onClick={() => handleCheckout('premium')}
                                                disabled={isCheckoutLoading}
                                                className="w-full py-3 px-4 bg-amber-500/30 border border-amber-400/30 hover:bg-amber-500/40 text-amber-300 rounded-lg font-medium flex justify-center items-center gap-2 shadow-lg transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                                            >
                                                {isCheckoutLoading ? (
                                                    <div className="h-5 w-5 border-2 border-amber-300 border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <>
                                                        <Star className="h-4 w-4" />
                                                        <span>Hazte Premium Ahora</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Plan Comparison Navigation */}
                                <div className="flex justify-center">
                                    <button
                                        onClick={() => setActivePlan(activePlan === 'free' ? 'premium' : 'free')}
                                        className="flex items-center gap-2 text-sm text-purple-200 hover:text-white transition-colors py-2 px-4 rounded-full bg-white/10 backdrop-blur-sm"
                                    >
                                        {activePlan === 'free' ? (
                                            <>
                                                <span>Ver plan Premium</span>
                                                <ChevronRight className="h-4 w-4" />
                                            </>
                                        ) : (
                                            <>
                                                <ChevronLeft className="h-4 w-4" />
                                                <span>Ver plan Free</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
};

export default PlansPage; 