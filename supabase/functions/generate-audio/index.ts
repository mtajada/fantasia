import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { OpenAI } from "https://esm.sh/openai@4.0.0";

serve(async (req: Request) => {
  try {
    // Configurar headers CORS para permitir solicitudes desde cualquier origen
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }

    // Manejar solicitudes de preflight OPTIONS
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers })
    }

    // Obtener datos de la solicitud
    const { text, voice, model, instructions } = await req.json()
    
    // Validar entrada
    if (!text) {
      return new Response(
        JSON.stringify({ error: 'El texto es requerido' }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
    }
    
    // Inicializar cliente OpenAI con la clave segura de entorno
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })
    
    // Llamar a la API de OpenAI
    const response = await openai.audio.speech.create({
      model: model || 'gpt-4o-mini-tts',
      voice: voice || 'nova',
      input: text,
      instructions: instructions || 'Narra con un ritmo adecuado para niños',
    })
    
    // Obtener el audio como ArrayBuffer
    const audioBuffer = await response.arrayBuffer()
    
    // Devolver el audio al cliente
    return new Response(audioBuffer, {
      headers: { ...headers, 'Content-Type': 'audio/mpeg' }
    })
  } catch (error: unknown) {
    console.error(error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Error desconocido' }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        } 
      }
    )
  }
}) 