// Script de depuración para probar la función edge de generación de títulos
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase (usar las mismas credenciales que en el proyecto)
const supabaseUrl = 'https://vgzhkvnrutesdynrrlpm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnemhrdm5ydXRlc2R5bnJybHBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MDc4NzksImV4cCI6MjA2NzQ4Mzg3OX0.cjWfW_GdhQpiF_-hq6IcoWNEDLx2Yncqe8Bx0DqvW3E';
const supabase = createClient(supabaseUrl, supabaseKey);

// Función para probar la generación de títulos
async function testGenerateTitle() {
  console.log('Probando generación de títulos...');
  
  try {
    // Contenido de ejemplo para generar un título
    const sampleContent = `Había una vez un pequeño conejo llamado Tito que vivía en el bosque. A Tito le gustaba explorar y descubrir nuevos lugares. Un día, mientras saltaba entre los arbustos, encontró una madriguera que nunca antes había visto. Era extraña y misteriosa, con un brillo tenue que salía desde su interior.`;
    
    console.log('Enviando solicitud a la Edge Function story-continuation (generateTitle)...');
    
    const { data, error } = await supabase.functions.invoke('story-continuation', {
      body: {
        action: 'generateTitle',
        content: sampleContent
      }
    });
    
    if (error) {
      console.error('Error en Edge Function:', error);
      return;
    }
    
    // Mostrar la respuesta completa para depuración
    console.log('Respuesta completa:', JSON.stringify(data, null, 2));
    
    if (data && data.title) {
      console.log('Título generado correctamente:', data.title);
    } else {
      console.error('La respuesta no contiene un título:', data);
    }
  } catch (error) {
    console.error('Error al ejecutar la prueba:', error);
  }
}

// Ejecutar la prueba
testGenerateTitle(); 