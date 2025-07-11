import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import PageTransition from '@/components/PageTransition';
import BackButton from '@/components/BackButton';
import { getUserProfile } from '@/services/supabase';
import { getCurrentUser } from '@/supabaseAuth';
import { ProfileSettings } from '@/types';
import { useLimitWarnings } from '@/hooks/useLimitWarnings';
import LimitIndicator from '@/components/LimitIndicator';
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
    Settings,
    AlertTriangle,
    Euro
} from 'lucide-react';

const PlansPage: React.FC = () => {
    const location = useLocation();
    const { toast } = useToast();
    const { limitStatus, warnings, hasWarnings } = useLimitWarnings();
    const [profileSettings, setProfileSettings] = useState<ProfileSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    
    // Premium check function
    const isPremium = () => {
        const status = profileSettings?.subscription_status;
        return status === 'active' || status === 'trialing';
    };

    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
    const [isPortalLoading, setIsPortalLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'comparison' | 'details'>('comparison');
    const [activePlan, setActivePlan] = useState<'free' | 'premium'>('free');

    // Load user data and handle tab query parameter
    useEffect(() => {
        const loadUserData = async () => {
            try {
                setIsLoading(true);
                const { user: currentUser } = await getCurrentUser();
                
                if (currentUser) {
                    setUser(currentUser);
                    const { success, profile } = await getUserProfile(currentUser.id);
                    
                    if (success && profile) {
                        setProfileSettings(profile);
                        const premium = profile.subscription_status === 'active' || profile.subscription_status === 'trialing';
                        setActiveTab(premium ? 'details' : 'comparison');
                        setActivePlan(premium ? 'premium' : 'free');
                    }
                }
            } catch (error) {
                console.error('Error loading user data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        loadUserData();
        
        // Handle tab query parameter
        const queryParams = new URLSearchParams(location.search);
        const tabParam = queryParams.get('tab');
        if (tabParam === 'premium') {
            setActivePlan('premium');
        } else if (tabParam === 'free') {
            setActivePlan('free');
        }
    }, [location.search]);

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
                throw new Error('No checkout URL received.');
            }
        } catch (error: Error | unknown) {
            console.error(`Error creating ${item} checkout session:`, error);
            toast({ title: 'Error', description: `Could not start payment: ${error instanceof Error ? error.message : 'Unknown error'}`, variant: 'destructive' });
            setIsCheckoutLoading(false);
        } // No finally needed as page redirects on success
    };

    const handleManageSubscription = async () => {
        if (!profileSettings?.stripe_customer_id) {
            toast({ title: 'Error', description: 'No customer information found to manage subscription.', variant: 'destructive' });
            return;
        }

        setIsPortalLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('create-customer-portal-session');

            if (error) throw error;

            if (data?.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No customer portal URL received.');
            }
        } catch (error: Error | unknown) {
            console.error("Error creating customer portal session:", error);
            toast({ title: 'Error', description: `Could not redirect to subscription management: ${error instanceof Error ? error.message : 'Unknown error'}`, variant: 'destructive' });
            setIsPortalLoading(false);
        } // No finally block needed for isLoading as page redirects on success
    };

    const premiumUser = isPremium();
    
    if (isLoading) {
        return (
            <PageTransition>
                <div className="relative min-h-screen flex flex-col items-center justify-center p-0" style={{ backgroundColor: 'black' }}>
                    <div className="text-white text-lg sm:text-xl px-4">Loading...</div>
                </div>
            </PageTransition>
        );
    }

    // Define features for comparison table (updated per requirements)
    const features = [
        { name: 'Stories Generated', free: '10 / month', premium: 'Unlimited', icon: BookOpen, limited: true },
        { name: 'Story Continuations', free: '1', premium: 'Unlimited', icon: TrendingUp, limited: true },
        { name: 'Voice Narration (AI)', free: 'Yes (2 / month)', premium: 'Yes (20/month incl.)', icon: Mic, limited: true },
        { name: 'Creative Challenges', free: 'Unlimited', premium: 'Unlimited', icon: CheckCircle, limited: false },
    ];

    return (
        <PageTransition>
            <div
                className="relative min-h-screen flex flex-col items-center justify-start p-0"
                style={{
                    backgroundColor: 'black',
                }}
            >
                {/* Logo and header - Reduced space */}
                <div className="flex flex-col items-center mt-4 mb-0 select-none">
                    <img src="/logo_fantasia.png" alt="Fantasia Logo" className="w-60 max-w-xs mx-auto mb-0 drop-shadow-xl" />
                </div>
                <div className="container mx-auto px-2 sm:px-4 py-0 max-w-4xl">
                    {/* Back button */}
                    <BackButton className="absolute top-6 left-4 md:top-8 md:left-8" />
                    {/* Premium User View */}
                    {premiumUser && (
                        <div className="pt-0 flex flex-col min-h-[80vh] justify-between">
                            <div>
                                <div className="text-center mb-6 transition-all duration-300">
                                    <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 mb-2">
                                        <Star className="h-8 w-8 text-white" />
                                    </div>
                                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 font-heading bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">Premium Unleashed ✨</h1>
                                    <p className="text-gray-300 text-base sm:text-lg px-4 sm:px-0">Enjoy all features without limits</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8 px-4 sm:px-0">
                                    {/* Card: Buy Voice Credits */}
                                    <div className="bg-gray-900/90 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl border border-gray-800 transition-all duration-300">
                                        <div className="p-6">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-full bg-violet-500/40 flex items-center justify-center">
                                                    <Mic className="h-5 w-5 text-violet-400" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg sm:text-xl font-heading text-gray-50">Voice Credits 🎤</h3>
                                                    <p className="text-gray-300 text-sm">Enhance your stories</p>
                                                </div>
                                            </div>
                                            <div className="mb-6">
                                                {limitStatus ? (
                                                    <LimitIndicator
                                                        type="voice_credits"
                                                        current={limitStatus.voiceCredits.current}
                                                        limit={limitStatus.voiceCredits.limit}
                                                        isUnlimited={limitStatus.voiceCredits.isUnlimited}
                                                        showUpgradePrompt={false}
                                                        className="p-0 bg-transparent border-0 shadow-none ring-0"
                                                    />
                                                ) : (
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-gray-300">Available:</span>
                                                        <span className="font-mono font-bold text-lg text-violet-400">{profileSettings?.voice_credits || 0}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleCheckout('credits')}
                                                disabled={isCheckoutLoading}
                                                className="w-full py-4 px-4 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-2xl font-medium flex justify-center items-center gap-2 shadow-lg transition-all duration-200 min-h-[44px] text-base sm:text-sm"
                                            >
                                                {isCheckoutLoading ? (
                                                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <>
                                                        <CreditCard className="h-4 w-4" />
                                                        <span>Buy More Credits</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    {/* Card: Manage Subscription */}
                                    <div className="bg-gray-900/90 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl border border-gray-800 transition-all duration-300">
                                        <div className="p-6">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-full bg-pink-500/40 flex items-center justify-center">
                                                    <Star className="h-5 w-5 text-pink-400" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg sm:text-xl font-heading text-gray-50">Premium Subscription 💎</h3>
                                                    <p className="text-gray-300 text-sm">Manage your plan</p>
                                                </div>
                                            </div>
                                            <div className="space-y-4 mb-6">
                                                <div className="bg-gray-800/70 rounded-lg p-3 flex justify-between items-center border border-pink-500/30">
                                                    <span className="text-gray-300 font-medium">Status:</span>
                                                    <span className="font-bold text-pink-400 bg-pink-500/20 px-3 py-1 rounded-full border border-pink-500/30">Active</span>
                                                </div>
                                                <div className="bg-violet-500/10 rounded-lg p-3 flex justify-between items-center">
                                                    <span className="text-gray-300">Benefits:</span>
                                                    <span className="font-medium text-violet-400">All included</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleManageSubscription}
                                                disabled={isPortalLoading}
                                                className="flex items-center justify-between w-full py-4 px-4 bg-gradient-to-r from-pink-500/60 to-violet-500/60 hover:from-pink-500/80 hover:to-violet-500/80 text-white rounded-2xl font-medium transition-all min-h-[44px] text-base sm:text-sm"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Settings className="h-4 w-4" />
                                                    <span>Manage Subscription</span>
                                                </div>
                                                {isPortalLoading ? (
                                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <ChevronRight className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {/* Premium Usage Statistics */}
                                {limitStatus && (
                                    <div className="mt-8 bg-gray-900/80 backdrop-blur-md rounded-3xl p-5 border border-gray-800 shadow-lg transition-all duration-300">
                                        <h3 className="font-bold text-xl mb-4 flex items-center gap-2 font-heading text-gray-50">
                                            <TrendingUp className="h-6 w-6 text-violet-400" />
                                            <span>Usage This Month</span>
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                            <LimitIndicator
                                                type="stories"
                                                current={limitStatus.stories.current}
                                                limit={limitStatus.stories.limit}
                                                isUnlimited={limitStatus.stories.isUnlimited}
                                                showUpgradePrompt={false}
                                                className="p-3 bg-gray-800/60 border border-gray-700 shadow-sm ring-0"
                                            />
                                            <LimitIndicator
                                                type="voice_credits"
                                                current={limitStatus.voiceCredits.current}
                                                limit={limitStatus.voiceCredits.limit}
                                                isUnlimited={limitStatus.voiceCredits.isUnlimited}
                                                showUpgradePrompt={false}
                                                className="p-3 bg-gray-800/60 border border-gray-700 shadow-sm ring-0"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Bottom Premium Features Reminder */}
                                <div className="mt-8 bg-gray-900/80 backdrop-blur-md rounded-3xl p-5 border border-gray-800 shadow-lg transition-all duration-300">
                                    <h3 className="font-bold text-xl mb-4 flex items-center gap-2 font-heading text-gray-50">
                                        <Sparkles className="h-6 w-6 text-pink-400" />
                                        <span>Active Premium Benefits</span>
                                    </h3>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {features.map((feature, i) => (
                                            <li key={i} className="flex items-center gap-3 bg-gray-800/70 p-3 rounded-xl border border-gray-700/50 shadow-sm">
                                                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <feature.icon className="h-4 w-4 text-violet-400" />
                                                        <span className="font-bold text-gray-50">{feature.name}</span>
                                                    </div>
                                                    <span className="text-sm font-medium text-violet-400">{feature.premium}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                {/* Go to app button */}
                                <div className="mt-8 mb-14 text-center transition-all duration-300">
                                    <Link
                                        to="/home"
                                        className="inline-block py-4 px-6 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-2xl font-medium flex items-center justify-center gap-2 shadow-lg transition-all duration-200 mx-auto min-h-[44px] text-base sm:text-sm"
                                    >
                                        <BookOpen className="h-5 w-5" />
                                        <span>Go to App</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Free User View */}
                    {!premiumUser && (
                        <div className="pt-0 flex flex-col min-h-[80vh] justify-between">
                            <div>
                                {/* Header */}
                                <div className="text-center mb-4 transition-all duration-300">
                                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 font-heading bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent px-4 sm:px-0">Unlock Your Desires 🔥</h1>
                                    <p className="text-gray-300 text-base sm:text-lg mx-auto max-w-xl px-4 sm:px-0">
                                        Compare plans and choose the best experience for your stories
                                    </p>
                                </div>
                                {/* Plan Toggle */}
                                <div className="flex justify-center mb-4 px-4 sm:px-0">
                                    <div className="bg-gray-900/80 backdrop-blur-md rounded-full p-1 inline-flex border border-gray-800 transition-all duration-300 w-full sm:w-auto">
                                        <button
                                            onClick={() => setActivePlan('free')}
                                            className={`py-3 px-4 sm:px-5 md:px-8 rounded-full transition-colors flex items-center justify-center gap-2 flex-1 sm:flex-initial min-h-[44px] ${activePlan === 'free'
                                                ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white font-medium'
                                                : 'text-gray-300 hover:text-white'
                                                }`}
                                        >
                                            <span>Free</span>
                                        </button>
                                        <button
                                            onClick={() => setActivePlan('premium')}
                                            className={`py-3 px-4 sm:px-5 md:px-8 rounded-full transition-colors flex items-center justify-center gap-2 relative flex-1 sm:flex-initial min-h-[44px] ${activePlan === 'premium'
                                                ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium'
                                                : 'text-gray-300 hover:text-white'
                                                }`}
                                        >
                                            <Star className="h-4 w-4" />
                                            <span>Premium</span>
                                        </button>
                                    </div>
                                </div>
                                {/* Features by Plan */}
                                <div className="max-w-2xl mx-auto transition-all duration-300 px-4 sm:px-0">
                                    {/* Active Plan Card */}
                                    <div className="bg-gray-900/90 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl border border-gray-800 mb-6">
                                        {/* Plan Header - Improved readability */}
                                        <div className={`p-6 ${activePlan === 'premium'
                                            ? 'bg-violet-500/20 border-b border-violet-500/40'
                                            : 'bg-pink-500/20 border-b border-pink-500/40'
                                            }`}>
                                            <div className="flex justify-between items-center">
                                                <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 font-heading text-gray-50">
                                                    {activePlan === 'premium' && <Star className="h-5 w-5 text-pink-400" />}
                                                    Plan {activePlan === 'premium' ? 'Premium' : 'Free'}
                                                </h2>
                                            </div>
                                            {activePlan === 'premium' ? (
                                                <>
                                                    <p className="text-gray-300 mt-1 font-medium">Limitless creativity for your stories</p>
                                                    <div className="flex items-center mt-3 bg-gray-800/70 p-3 rounded-xl justify-between border border-violet-500">
                                                        <div className="flex items-center gap-2">
                                                            <Euro className="h-5 w-5 text-violet-400" />
                                                            <span className="text-gray-300 font-medium">Price:</span>
                                                        </div>
                                                        <div className="font-bold text-xl text-violet-400 flex items-center gap-1">
                                                            <span>10€</span>
                                                            <span className="text-sm font-normal text-gray-300 opacity-80">/month</span>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <p className="text-gray-300 mt-1">Perfect to start exploring</p>
                                            )}
                                        </div>

                                        {/* Premium "Get Premium" button - Only shown on premium tab */}
                                        {activePlan === 'premium' && (
                                            <div className="p-6 pt-4 pb-0">
                                                <button
                                                    onClick={() => handleCheckout('premium')}
                                                    disabled={isCheckoutLoading}
                                                    className="w-full py-4 px-6 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-2xl font-bold flex justify-center items-center gap-2 shadow-lg transition-all duration-200 min-h-[44px] text-base sm:text-sm"
                                                >
                                                    {isCheckoutLoading ? (
                                                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        <>
                                                            <Star className="h-5 w-5" />
                                                            <span>Get Premium Now 🌟</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}

                                        {/* Limit Indicators for Free Users */}
                                        {activePlan === 'free' && limitStatus && (
                                            <div className="p-6 pt-4 pb-0">
                                                <h3 className="font-bold text-base sm:text-lg mb-4 flex items-center gap-2 font-heading text-gray-50">
                                                    <TrendingUp className="h-5 w-5 text-orange-400" />
                                                    <span>Your Current Usage</span>
                                                </h3>
                                                <div className="space-y-4 mb-6">
                                                    <LimitIndicator
                                                        type="stories"
                                                        current={limitStatus.stories.current}
                                                        limit={limitStatus.stories.limit}
                                                        isUnlimited={limitStatus.stories.isUnlimited}
                                                        showUpgradePrompt={true}
                                                        className="p-3 bg-gray-800/60 border border-gray-700 shadow-sm ring-0"
                                                    />
                                                    <LimitIndicator
                                                        type="voice_credits"
                                                        current={limitStatus.voiceCredits.current}
                                                        limit={limitStatus.voiceCredits.limit}
                                                        isUnlimited={limitStatus.voiceCredits.isUnlimited}
                                                        showUpgradePrompt={true}
                                                        className="p-3 bg-gray-800/60 border border-gray-700 shadow-sm ring-0"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Features List - Consistent style for both tabs */}
                                        <div className="p-6">
                                            <h3 className="font-bold text-base sm:text-lg mb-4 flex items-center gap-2 font-heading text-gray-50">
                                                <Sparkles className="h-5 w-5 text-pink-400" />
                                                <span>{activePlan === 'premium' ? 'Premium Benefits' : 'Plan Features'}</span>
                                            </h3>

                                            <ul className="space-y-3">
                                                {features.map((feature, index) => (
                                                    <li key={index} className="bg-gray-800/60 p-3 rounded-lg border border-gray-700/50 shadow-sm">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-shrink-0">
                                                                {activePlan === 'premium' ? (
                                                                    feature.premium === 'No' ? (
                                                                        <XCircle className="h-5 w-5 text-red-400" />
                                                                    ) : (
                                                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                                                    )
                                                                ) : (
                                                                    feature.free === 'No' ? (
                                                                        <XCircle className="h-5 w-5 text-red-400" />
                                                                    ) : (
                                                                        feature.limited ? (
                                                                            <AlertTriangle className="h-5 w-5 text-pink-400" />
                                                                        ) : (
                                                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                                                        )
                                                                    )
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <feature.icon className="h-4 w-4 text-violet-400" />
                                                                    <span className="font-bold text-gray-50">{feature.name}</span>
                                                                </div>
                                                                <div className="text-sm font-medium text-gray-300">
                                                                    {activePlan === 'premium' ? feature.premium : feature.free}
                                                                    {activePlan === 'free' && feature.limited && (
                                                                        <span className="text-xs text-violet-400 ml-1 font-bold">(limited)</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Plan navigation buttons - With space below */}
                            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10 px-4 sm:px-0">
                                {activePlan === 'free' && (
                                    <button
                                        onClick={() => setActivePlan('premium')}
                                        className="py-4 px-6 sm:px-8 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all duration-200 hover:from-pink-600 hover:to-violet-600 min-h-[44px] text-base sm:text-sm"
                                    >
                                        <Star className="h-5 w-5" />
                                        <span>View Premium Plan</span>
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                )}
                                {activePlan === 'premium' && (
                                    <button
                                        onClick={() => setActivePlan('free')}
                                        className="py-4 px-6 sm:px-8 bg-gray-800/70 text-gray-300 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all duration-200 hover:bg-gray-700/70 min-h-[44px] text-base sm:text-sm"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        <span>View Free Plan</span>
                                    </button>
                                )}
                                {/* Continue with free plan button */}
                                {activePlan === 'free' && (
                                    <Link
                                        to="/home"
                                        className="py-4 px-6 sm:px-8 bg-transparent border border-gray-600/50 hover:bg-gray-800/20 text-gray-300 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 min-h-[44px] text-base sm:text-sm"
                                    >
                                        Continue with free plan
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