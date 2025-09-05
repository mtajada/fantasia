/**
 * Analytics Service for Fantasia
 * 
 * Provides functions to track user behavior, conversions, and usage patterns.
 * All events are stored in the usage_events table with appropriate metadata.
 * 
 * Features:
 * - Limit tracking (stories, voice credits)
 * - Conversion tracking (upgrade events)
 * - Generic event tracking
 * - Usage statistics queries
 * - Privacy-compliant data collection
 */

import { supabase } from '../supabaseClient';

// --- Types and Interfaces ---

export type EventType = 
  | 'limit_reached'
  | 'upgrade_conversion'
  | 'feature_used'
  | 'story_generated'
  | 'audio_generated'
  | 'character_created'
  | 'payment_attempted'
  | 'payment_completed'
  | 'subscription_cancelled'
  | 'error_occurred';

export type LimitType = 'stories' | 'voice_credits';

export interface UsageEvent {
  id?: string;
  user_id: string;
  event_type: EventType;
  event_data?: Record<string, any>;
  metadata?: Record<string, any>;
  source?: string;
  created_at?: string;
}

export interface LimitReachedEvent {
  limit_type: LimitType;
  current_usage: number;
  limit_value: number;
  subscription_type: string;
}

export interface UpgradeConversionEvent {
  from_plan: string;
  to_plan: string;
  conversion_source: string;
  limit_that_triggered?: LimitType;
  credits_purchased?: number;
}

export interface FeatureUsedEvent {
  feature_name: string;
  feature_context?: string;
  user_subscription_type: string;
}

export interface UsageStats {
  total_events: number;
  limit_reached_events: number;
  upgrade_conversions: number;
  most_common_limit: LimitType | null;
  conversion_rate?: number;
}

// --- Core Analytics Functions ---

/**
 * Generic function to track any usage event
 */
export async function trackUsageEvent(
  eventType: EventType,
  eventData?: Record<string, any>,
  source?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.warn('[Analytics] No se puede rastrear evento - usuario no autenticado');
      return { success: false, error: 'Usuario no autenticado' };
    }

    // Get user profile for additional metadata
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status, language')
      .eq('id', user.id)
      .single();

    // Prepare metadata
    const metadata = {
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      subscription_type: profile?.subscription_status || 'free',
      language: profile?.language || 'en',
      ...(eventData?.metadata || {})
    };

    // Insert event
    const { error: insertError } = await supabase
      .from('usage_events')
      .insert({
        user_id: user.id,
        event_type: eventType,
        event_data: eventData,
        metadata,
        source: source || 'unknown'
      });

    if (insertError) {
      console.error('[Analytics] Error al rastrear evento:', insertError);
      return { success: false, error: insertError.message };
    }

    console.log(`[Analytics] Evento rastreado: ${eventType} desde ${source || 'desconocido'}`);
    return { success: true };

  } catch (error) {
    console.error('[Analytics] Excepción rastreando evento:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
}

/**
 * Track when a user reaches their usage limits
 */
export async function trackLimitReached(
  limitType: LimitType,
  currentUsage: number,
  limitValue: number,
  source: string = 'limit_check'
): Promise<{ success: boolean; error?: string }> {
  
  // Get user subscription type for context
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('id', user.id)
    .single();

  const eventData: LimitReachedEvent = {
    limit_type: limitType,
    current_usage: currentUsage,
    limit_value: limitValue,
    subscription_type: profile?.subscription_status || 'free'
  };

  return await trackUsageEvent('limit_reached', eventData, source);
}

/**
 * Track when a user upgrades their subscription or purchases credits
 */
export async function trackUpgradeConversion(
  fromPlan: string,
  toPlan: string,
  conversionSource: string,
  additionalData?: {
    limitThatTriggered?: LimitType;
    creditsPurchased?: number;
  }
): Promise<{ success: boolean; error?: string }> {

  const eventData: UpgradeConversionEvent = {
    from_plan: fromPlan,
    to_plan: toPlan,
    conversion_source: conversionSource,
    ...additionalData
  };

  return await trackUsageEvent('upgrade_conversion', eventData, conversionSource);
}

/**
 * Track feature usage for understanding user behavior
 */
export async function trackFeatureUsed(
  featureName: string,
  featureContext?: string,
  source: string = 'feature_usage'
): Promise<{ success: boolean; error?: string }> {

  // Get user subscription type
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('id', user.id)
    .single();

  const eventData: FeatureUsedEvent = {
    feature_name: featureName,
    feature_context: featureContext,
    user_subscription_type: profile?.subscription_status || 'free'
  };

  return await trackUsageEvent('feature_used', eventData, source);
}

/**
 * Track story generation events
 */
export async function trackStoryGenerated(
  storyId: string,
  genre: string,
  storyFormat: 'single' | 'episodic',
  source: string = 'story_generation'
): Promise<{ success: boolean; error?: string }> {

  const eventData = {
    story_id: storyId,
    genre: genre,
    story_format: storyFormat,
    generation_timestamp: new Date().toISOString()
  };

  return await trackUsageEvent('story_generated', eventData, source);
}

/**
 * Track audio generation events
 */
export async function trackAudioGenerated(
  storyId: string,
  voiceId: string,
  durationSeconds?: number,
  source: string = 'audio_generation'
): Promise<{ success: boolean; error?: string }> {

  const eventData = {
    story_id: storyId,
    voice_id: voiceId,
    duration_seconds: durationSeconds,
    generation_timestamp: new Date().toISOString()
  };

  return await trackUsageEvent('audio_generated', eventData, source);
}

/**
 * Track payment-related events
 */
export async function trackPaymentEvent(
  eventType: 'payment_attempted' | 'payment_completed',
  paymentData: {
    amount?: number;
    currency?: string;
    product_type: 'subscription' | 'credits';
    stripe_session_id?: string;
  },
  source: string = 'payment_flow'
): Promise<{ success: boolean; error?: string }> {

  return await trackUsageEvent(eventType, paymentData, source);
}

/**
 * Track errors for debugging and improvement
 */
export async function trackError(
  errorType: string,
  errorMessage: string,
  errorContext?: Record<string, any>,
  source: string = 'error_handler'
): Promise<{ success: boolean; error?: string }> {

  const eventData = {
    error_type: errorType,
    error_message: errorMessage,
    error_context: errorContext,
    timestamp: new Date().toISOString(),
    user_agent: navigator.userAgent
  };

  return await trackUsageEvent('error_occurred', eventData, source);
}

// --- Analytics Query Functions ---

/**
 * Get usage statistics for the current user (for dashboard/profile display)
 */
export async function getUserUsageStats(
  timeframeDays: number = 30
): Promise<{ success: boolean; data?: UsageStats; error?: string }> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeframeDays);

    const { data: events, error: queryError } = await supabase
      .from('usage_events')
      .select('event_type, event_data, created_at')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (queryError) {
      return { success: false, error: queryError.message };
    }

    // Calculate stats
    const totalEvents = events?.length || 0;
    const limitReachedEvents = events?.filter(e => e.event_type === 'limit_reached').length || 0;
    const upgradeConversions = events?.filter(e => e.event_type === 'upgrade_conversion').length || 0;

    // Find most common limit type
    const limitEvents = events?.filter(e => e.event_type === 'limit_reached') || [];
    const limitCounts = limitEvents.reduce((acc, event) => {
      const limitType = event.event_data?.limit_type;
      if (limitType) {
        acc[limitType] = (acc[limitType] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const mostCommonLimit = Object.keys(limitCounts).length > 0 
      ? Object.keys(limitCounts).reduce((a, b) => limitCounts[a] > limitCounts[b] ? a : b) as LimitType
      : null;

    const stats: UsageStats = {
      total_events: totalEvents,
      limit_reached_events: limitReachedEvents,
      upgrade_conversions: upgradeConversions,
      most_common_limit: mostCommonLimit
    };

    return { success: true, data: stats };

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
}

/**
 * Check if user has recently hit a specific limit (to avoid spam tracking)
 */
export async function hasRecentLimitEvent(
  limitType: LimitType,
  withinMinutes: number = 5
): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - withinMinutes);

    const { data: recentEvents } = await supabase
      .from('usage_events')
      .select('id')
      .eq('user_id', user.id)
      .eq('event_type', 'limit_reached')
      .gte('created_at', cutoffTime.toISOString())
      .filter('event_data->>limit_type', 'eq', limitType)
      .limit(1);

    return (recentEvents?.length || 0) > 0;

  } catch (error) {
    console.error('[Analytics] Error checking recent limit events:', error);
    return false;
  }
}

// --- Utility Functions ---

/**
 * Batch track multiple events (useful for complex user flows)
 */
export async function trackEventBatch(
  events: Array<{
    eventType: EventType;
    eventData?: Record<string, any>;
    source?: string;
  }>
): Promise<{ success: boolean; error?: string; processed: number }> {
  let processed = 0;
  
  for (const event of events) {
    const result = await trackUsageEvent(event.eventType, event.eventData, event.source);
    if (result.success) {
      processed++;
    } else {
      console.warn(`[Analytics] Error al rastrear evento en lote: ${event.eventType}`);
    }
  }

  return {
    success: processed === events.length,
    processed,
    ...(processed < events.length && { error: `Only ${processed}/${events.length} events processed` })
  };
}

/**
 * Clear old usage events (for privacy compliance)
 * Note: This should typically be done server-side with a scheduled function
 */
export async function clearOldEvents(
  olderThanDays: number = 365
): Promise<{ success: boolean; error?: string; deleted?: number }> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const { error: deleteError, count } = await supabase
      .from('usage_events')
      .delete()
      .eq('user_id', user.id)
      .lt('created_at', cutoffDate.toISOString());

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    return { success: true, deleted: count || 0 };

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
}

// --- Export all functions ---
export default {
  // Core tracking
  trackUsageEvent,
  trackLimitReached,
  trackUpgradeConversion,
  trackFeatureUsed,
  
  // Specific event tracking
  trackStoryGenerated,
  trackAudioGenerated,
  trackPaymentEvent,
  trackError,
  
  // Analytics queries
  getUserUsageStats,
  hasRecentLimitEvent,
  
  // Utilities
  trackEventBatch,
  clearOldEvents
};