// supabase/functions/_shared/cors.ts

export const corsHeaders = {
  // For development: include localhost
  'Access-Control-Allow-Origin': '*',
  
  // If you need to support multiple origins, you can use this instead
  // and add logic in your function to set the appropriate origin
  // 'Access-Control-Allow-Origin': '*', 
  
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',  // 24 hours caching for preflight requests
};