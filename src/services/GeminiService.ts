import { GoogleGenerativeAI } from '@google/generative-ai';
import { Story, ProfileSettings } from '../types';

// Usamos directamente la API key
const API_KEY = 'AIzaSyBgDNygZ48Mr7dyCI-KqCtNsX57bVXm2oE';
const genAI = new GoogleGenerativeAI(API_KEY);

export class GeminiService {
  private static model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  public static async generateStory(systemPrompt: string, userPrompt: string, maxTokens?: number): Promise<string> {
    try {
      console.log('Iniciando generación de historia con Gemini...');
      console.log('System Prompt:', systemPrompt);
      console.log('User Prompt:', userPrompt);
      
      // Añadir logging detallado para verificar datos del personaje y opciones de la historia
      console.log('Detalles del prompt de usuario:');
      if (userPrompt.includes('personaje principal')) {
        const characterInfo = userPrompt.substring(
          userPrompt.indexOf('personaje principal'),
          userPrompt.indexOf('\n\n', userPrompt.indexOf('personaje principal') + 1)
        );
        console.log('Información del personaje detectada:', characterInfo);
      } else {
        console.warn('⚠️ ALERTA: No se detectó información del personaje en el prompt');
      }
      
      if (userPrompt.includes('género')) {
        console.log('Género detectado:', userPrompt.match(/género ([^\.\n]+)/)?.[1]);
      } else {
        console.warn('⚠️ ALERTA: No se detectó género en el prompt');
      }
      
      if (userPrompt.includes('enseñanza')) {
        console.log('Enseñanza moral detectada:', userPrompt.match(/enseñanza: ([^\.\n]+)/)?.[1]);
      } else {
        console.warn('⚠️ ALERTA: No se detectó enseñanza moral en el prompt');
      }
      
      console.log('Max Tokens:', maxTokens || 'No especificado');

      // Combinamos los prompts para hacer una sola llamada
      const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;
      
      console.log('Enviando prompt combinado (primeros 500 caracteres):', combinedPrompt.substring(0, 500) + '...');
      
      // Configuración de generación con límite de tokens si se especifica
      const generationConfig = maxTokens ? { maxOutputTokens: maxTokens } : undefined;
      
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: combinedPrompt }] }],
        generationConfig
      });
      console.log('Respuesta recibida, procesando...');
      
      const response = await result.response;
      const text = response.text();
      console.log('Historia generada exitosamente');
      
      // Procesamos la respuesta para eliminar el título si existe
      const cleanedText = this.removeEmbeddedTitle(text);
      return cleanedText;
    } catch (error) {
      console.error('Error detallado al generar historia con Gemini:', error);
      if (error instanceof Error) {
        console.error('Mensaje de error:', error.message);
        console.error('Stack trace:', error.stack);
      }
      
      // Si hay un error, generamos una historia de contingencia
      console.log('Generando historia de contingencia...');
      return this.removeEmbeddedTitle(this.generateFallbackStory(userPrompt));
    }
  }
  
  /**
   * Elimina el título incrustado en el contenido si existe
   */
  private static removeEmbeddedTitle(text: string): string {
    // Patrones comunes de títulos en el contenido
    const titlePatterns = [
      /^#\s+(.+?)(?:\n|\r\n|\r)/,      // Título con formato Markdown: # Título
      /^(.+?)(?:\n|\r\n|\r){2}/,      // Título seguido de línea en blanco
      /^(?:Título:|Title:)\s*(.+?)(?:\n|\r\n|\r)/ // Título explícito con prefijo
    ];
    
    for (const pattern of titlePatterns) {
      if (pattern.test(text)) {
        // Elimina el título y cualquier línea en blanco adicional
        return text.replace(pattern, '').trim();
      }
    }
    
    return text;
  }
  
  /**
   * Genera una historia de contingencia en caso de que falle la API
   */
  private static generateFallbackStory(userPrompt: string): string {
    console.log('Usando historia de contingencia con prompt:', userPrompt);
    
    // Extraemos información básica del prompt para personalizar la historia
    const characterNameMatch = userPrompt.match(/personaje.*se llama ([^\.\n]+)/i);
    const characterName = characterNameMatch ? characterNameMatch[1].trim() : "el protagonista";
    
    const genreMatch = userPrompt.match(/género ([^\.\n]+)/i);
    const genre = genreMatch ? genreMatch[1].trim() : "aventuras";
    
    const hobbiesMatch = userPrompt.match(/aficiones son ([^\.\n]+)/i);
    const hobbies = hobbiesMatch ? hobbiesMatch[1].trim() : "explorar";
    
    // Historia de contingencia personalizada
    return `Había una vez, en un pequeño pueblo rodeado de montañas y bosques, un joven llamado ${characterName}. Lo que más le gustaba en el mundo era ${hobbies}, y cada día encontraba nuevas maneras de disfrutar de su pasión.

Una mañana de verano, mientras ${characterName} practicaba ${hobbies}, notó algo extraño en el horizonte. Una luz brillante que parecía llamarlo. Sin dudarlo un segundo, decidió investigar.

El camino no fue fácil. Tuvo que atravesar el denso bosque, cruzar un río caudaloso y escalar una pequeña colina. Pero ${characterName} no se rindió, pues su curiosidad era más fuerte que cualquier obstáculo.

Al llegar a la fuente de la luz, descubrió una pequeña caja dorada. Con manos temblorosas, la abrió y de ella salió un mapa, un mapa que mostraba el camino hacia un tesoro olvidado.

Así comenzó la gran aventura de ${characterName}. Durante semanas exploró cuevas misteriosas, habló con ancianos sabios del pueblo y resolvió enigmas ancestrales. Su conocimiento de ${hobbies} resultó ser invaluable en más de una ocasión.

Finalmente, tras superar todas las pruebas, ${characterName} encontró el tesoro. Pero no era oro ni joyas lo que contenía el cofre final, sino conocimiento. Conocimiento antiguo sobre ${hobbies} que haría que su pasión fuera aún más especial.

${characterName} regresó a su pueblo, no como el mismo joven que había partido, sino como alguien que había descubierto que la verdadera aventura está en seguir tus pasiones y nunca dejar de aprender.

Y así, cada vez que alguien le preguntaba sobre su aventura, ${characterName} sonreía y decía: "La mejor aventura es la que aún no has comenzado".

Fin.`;
  }

  /**
   * Generates a challenge question based on the story
   */
  public static async generateChallengeQuestion(
    story: Story,
    category: 'language' | 'math' | 'comprehension',
    profileSettings: ProfileSettings,
    targetLanguage?: string
  ): Promise<{
    question: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
  }> {
    try {
      console.log('Iniciando generación de pregunta de desafío...');
      
      // Extraer datos relevantes del perfil y la historia
      const { childAge, specialNeed = 'Ninguna', language } = profileSettings;
      const { character, genre, moral } = story.options;
      
      // Build the system prompt based on the category
      let systemPrompt = `Eres un experto educador infantil especializado en crear preguntas educativas para niños. Tu tarea es crear una pregunta de desafío educativo basada en el siguiente contexto:

DATOS DEL OYENTE:
- Edad: ${childAge} años
- Idioma principal: ${language}
${specialNeed !== 'Ninguna' ? `- Necesidad especial: ${specialNeed}` : ''}

DATOS DE LA HISTORIA:
- Título: ${story.title}
- Género: ${genre}
- Moraleja/Enseñanza: ${moral}

PERSONAJE PRINCIPAL:
- Nombre: ${character.name}
- Profesión: ${character.profession}
- Tipo de personaje: ${character.characterType}
- Aficiones: ${character.hobbies.join(', ')}
- Personalidad: ${character.personality || 'No especificada'}

HISTORIA COMPLETA:
${story.content}

`;
      
      switch (category) {
        case 'language':
          systemPrompt += `
INSTRUCCIÓN:
Crea una pregunta para aprender el idioma ${targetLanguage} relacionada con elementos de la historia. La pregunta debe:
1. Contener una palabra o frase en ${targetLanguage} relacionada con un elemento clave de la historia (personaje, objeto, acción, etc.)
2. Ofrecer 4 opciones de respuesta (solo una correcta)
3. Ser apropiada para un niño de ${childAge} años ${specialNeed !== 'Ninguna' ? `con ${specialNeed}` : ''}
4. Incluir una explicación clara de por qué la respuesta es correcta

FORMATO DE RESPUESTA (es obligatorio usar este formato exacto):
{
  "question": "Texto de la pregunta en español incluyendo la palabra en ${targetLanguage}",
  "options": ["Opción 1", "Opción 2", "Opción 3", "Opción 4"],
  "correctOptionIndex": 0,
  "explanation": "Explicación de la respuesta correcta"
}`;
          break;
        
        case 'math':
          systemPrompt += `
INSTRUCCIÓN:
Crea un problema matemático relacionado con elementos de la historia. El problema debe:
1. Utilizar personajes, objetos o situaciones que aparecen en la historia
2. Ser apropiado para el nivel educativo de un niño de ${childAge} años ${specialNeed !== 'Ninguna' ? `con ${specialNeed}` : ''}
3. Ofrecer 4 opciones de respuesta (solo una correcta)
4. Incluir una explicación clara de cómo se resuelve el problema

FORMATO DE RESPUESTA (es obligatorio usar este formato exacto):
{
  "question": "Texto del problema matemático contextualizado en la historia",
  "options": ["Opción 1", "Opción 2", "Opción 3", "Opción 4"],
  "correctOptionIndex": 0,
  "explanation": "Explicación paso a paso de cómo resolver el problema"
}`;
          break;
        
        case 'comprehension':
          systemPrompt += `
INSTRUCCIÓN:
Crea una pregunta de comprensión lectora relacionada con la historia. La pregunta debe:
1. Evaluar la comprensión de la trama, personajes, motivaciones o enseñanza de la historia
2. Ser apropiada para un niño de ${childAge} años ${specialNeed !== 'Ninguna' ? `con ${specialNeed}` : ''}
3. Ofrecer 4 opciones de respuesta (solo una correcta)
4. Incluir una explicación clara de por qué la respuesta es correcta, citando elementos específicos de la historia

FORMATO DE RESPUESTA (es obligatorio usar este formato exacto):
{
  "question": "Texto de la pregunta de comprensión",
  "options": ["Opción 1", "Opción 2", "Opción 3", "Opción 4"],
  "correctOptionIndex": 0,
  "explanation": "Explicación detallada de la respuesta correcta con referencias a la historia"
}`;
          break;
      }
      
      // Adaptación adicional según necesidades especiales
      if (specialNeed !== 'Ninguna') {
        systemPrompt += `\n\nIMPORTANTE: La pregunta debe estar adaptada para un niño con ${specialNeed}. Asegúrate de que:`;
        
        switch (specialNeed) {
          case 'TEA':
            systemPrompt += `
- El lenguaje sea claro, directo y literal
- Las instrucciones sean explícitas
- Evita el uso de metáforas o lenguaje figurado
- Las opciones de respuesta sean concretas`;
            break;
          case 'TDAH':
            systemPrompt += `
- La pregunta sea breve y directa
- El contenido sea visualmente atractivo
- Las opciones de respuesta sean concisas
- La explicación sea dinámica y enfocada`;
            break;
          case 'Dislexia':
            systemPrompt += `
- La pregunta use vocabulario sencillo y familiar
- Las frases sean cortas y estructuradas
- Evita palabras visualmente similares
- Las opciones de respuesta sean claramente diferenciables`;
            break;
          // Puedes añadir más casos según sea necesario
        }
      }
      
      console.log('Enviando prompt para generar pregunta:', systemPrompt.substring(0, 200) + '...');
      
      const result = await this.model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        // Parse the JSON response
        // Find JSON in the text (may be surrounded by markdown code blocks)
        const jsonMatch = text.match(/```json\s*(\{[\s\S]*?\})\s*```/) || 
                          text.match(/```\s*(\{[\s\S]*?\})\s*```/) || 
                          text.match(/(\{[\s\S]*?\})/);
        
        if (jsonMatch && jsonMatch[1]) {
          const jsonResponse = JSON.parse(jsonMatch[1]);
          
          // Validate required fields
          if (!jsonResponse.question || !jsonResponse.options || 
              typeof jsonResponse.correctOptionIndex !== 'number' || !jsonResponse.explanation) {
            throw new Error('Invalid response format from AI');
          }
          
          return {
            question: jsonResponse.question,
            options: jsonResponse.options,
            correctOptionIndex: jsonResponse.correctOptionIndex,
            explanation: jsonResponse.explanation
          };
        } else {
          throw new Error('Could not extract JSON from AI response');
        }
      } catch (parseError) {
        console.error('Error parsing challenge question response:', parseError);
        
        // Fallback question if parsing fails
        return this.generateFallbackQuestion(category, targetLanguage, story);
      }
    } catch (error) {
      console.error('Error generating challenge question:', error);
      
      // Return a fallback question
      return this.generateFallbackQuestion(category, targetLanguage, story);
    }
  }

  /**
   * Generates a fallback question if the API fails
   */
  private static generateFallbackQuestion(
    category: 'language' | 'math' | 'comprehension',
    targetLanguage?: string,
    story?: Story
  ): {
    question: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
  } {
    // Extract character name if available
    const characterName = story?.options?.character?.name || "protagonista";
    
    switch (category) {
      case 'language':
        return {
          question: `¿Cómo se dice "${story ? "amigo" : "amigo"}" en ${targetLanguage || 'inglés'}?`,
          options: ['Friend', 'House', 'Book', 'Play'],
          correctOptionIndex: 0,
          explanation: `"Amigo" en ${targetLanguage || 'inglés'} se dice "Friend". Es una palabra importante para las relaciones personales.`
        };
      
      case 'math':
        return {
          question: `Si ${characterName} tiene 5 objetos y encuentra 3 más, ¿cuántos tiene en total?`,
          options: ['7', '8', '9', '10'],
          correctOptionIndex: 1,
          explanation: 'La suma de 5 + 3 = 8. Recuerda que para sumar debes combinar ambas cantidades.'
        };
      
      case 'comprehension':
        return {
          question: `¿Qué aprendemos de la historia de ${characterName}?`,
          options: [
            'Es importante ayudar a los demás',
            'Nunca debemos confiar en nadie',
            'La amistad no es importante',
            'No debemos esforzarnos'
          ],
          correctOptionIndex: 0,
          explanation: 'La historia nos enseña la importancia de ayudar a los demás. Cuando cooperamos y somos amables, todos salimos beneficiados.'
        };
    }
  }

  /**
   * Generates continuation options
   */
  public static async generateContinuationOptions(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      console.log('Iniciando generación de opciones de continuación...');
      
      // Combinamos los prompts para hacer una sola llamada
      const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;
      
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: combinedPrompt }] }],
        generationConfig: { 
          maxOutputTokens: 500,
          temperature: 0.8,
          topK: 40,
          topP: 0.95
        }
      });
      
      const response = await result.response;
      const text = response.text().trim();
      
      console.log('Respuesta de la API para opciones de continuación:', text);
      return text;
    } catch (error) {
      console.error('Error al generar opciones de continuación:', error);
      // Proporcionar un JSON de respaldo
      return JSON.stringify({
        options: [
          { summary: "Buscar el tesoro escondido en el bosque." },
          { summary: "Hablar con el misterioso anciano del pueblo." },
          { summary: "Seguir el camino hacia las montañas nevadas." }
        ]
      });
    }
  }

  /**
   * Generates title based on content
   */
  public static async generateTitle(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      console.log('Iniciando generación de título...');
      
      // Combinamos los prompts para hacer una sola llamada
      const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;
      
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: combinedPrompt }] }],
        generationConfig: { maxOutputTokens: 50 }
      });
      
      const response = await result.response;
      const text = response.text().trim();
      
      return text;
    } catch (error) {
      console.error('Error al generar título:', error);
      return "Nuevo Capítulo";
    }
  }
}
