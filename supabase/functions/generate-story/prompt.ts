// supabase/edge-functions/generate-story/prompt.ts
// Contiene las funciones para generar los prompts del sistema y del usuario.

// createSystemPrompt
export function createSystemPrompt(language: string, childAge?: number, specialNeed?: string): string {
    console.log(`[Helper v6.1] createSystemPrompt: lang=${language}, age=${childAge}, need=${specialNeed}`);

    let base = `Eres un escritor experto en crear cuentos infantiles educativos y creativos. Escribe siempre en ${language}, con un estilo adecuado para niños de ${childAge ?? 7} años.`;
    if (specialNeed && specialNeed !== 'Ninguna') {
        base += ` La adaptación para "${specialNeed}" debe ser sutil, priorizando siempre la claridad, la comprensión y un tono positivo en la narración.`;
        base += ` A continuación, algunas guías específicas para "${specialNeed}":\n`;

        switch (specialNeed) {
            case 'TEA': // Trastorno del Espectro Autista
                base += `   - **Lenguaje Claro y Literal:** Usa frases cortas, directas y concretas. Evita el lenguaje figurado (metáforas, ironía) y las ambigüedades. Si es necesario introducir conceptos abstractos, explícalos de forma muy sencilla dentro de la narrativa.\n`;
                base += `   - **Estructura Predecible:** Mantén una secuencia narrativa muy clara y lógica (inicio, desarrollo con un problema claro, final con resolución). Puedes usar elementos o frases clave que se repitan para ayudar a anticipar eventos de forma natural.\n`;
                base += `   - **Descripciones Explícitas de Emociones e Interacciones Sociales:** Describe las emociones de los personajes de manera explícita y sencilla (ej. 'Lucas se sintió alegre cuando...'). Las interacciones sociales deben ser claras y directas.\n`;
                base += `   - **Enfoque en Detalles Concretos:** Céntrate en detalles observables y acciones concretas en lugar de pensamientos o intenciones internas muy complejas, a menos que se expliquen de forma simple.\n`;
                base += `   - **Tono Positivo y Calmado:** Asegura un tono general tranquilizador y positivo.\n`;
                break;
            case 'TDAH': // Déficit de Atención e Hiperactividad
                base += `   - **Inicio Atractivo y Trama Dinámica:** Comienza la historia de forma que capte el interés rápidamente. Mantén una trama con buen ritmo y elementos de sorpresa o curiosidad para sostener la atención.\n`;
                base += `   - **Lenguaje Estimulante pero Conciso:** Utiliza un lenguaje vívido y atractivo. Alterna frases de diferentes longitudes, pero prioriza la concisión para facilitar el seguimiento. Evita descripciones excesivamente largas o pasajes muy densos sin acción.\n`;
                base += `   - **Estructura Clara:** Asegura que el hilo conductor de la historia sea fácil de seguir, con transiciones claras entre las partes.\n`;
                base += `   - **Fomentar la Conexión (a través del texto):** Incluye preguntas retóricas cortas (ej. '¿Adivinas qué pasó después?'), onomatopeyas y exclamaciones que hagan la narración más viva.\n`;
                break;
            case 'Dislexia': // Dislexia o Dificultad en Lectura
                base += `   - **Lenguaje Sencillo y Accesible:** Opta por vocabulario común y frases cortas. Prefiere la voz activa y estructuras gramaticales directas (Sujeto-Verbo-Predicado).\n`;
                base += `   - **Evitar Complejidad Lingüística Innecesaria:** Reduce el uso de palabras con ortografía muy compleja o poco fonéticas si existen alternativas más simples. No uses jerga ni lenguaje excesivamente formal.\n`;
                base += `   - **Repetición Natural de Palabras Clave:** Reintroduce palabras importantes de forma sutil en diferentes contextos para facilitar su reconocimiento y afianzamiento, sin que suene forzado.\n`;
                base += `   - **Narrativa Clara y Lineal:** La progresión de eventos debe ser lógica y fácil de seguir, sin saltos temporales o argumentales confusos.\n`;
                break;
            case 'Ansiedad': // Ansiedad o Miedos Específicos
                base += `   - **Tono General Tranquilizador y Optimista:** Mantén un ambiente narrativo calmado, amable y consistentemente positivo durante toda la historia.\n`;
                base += `   - **Resolución Clara y Segura del Conflicto:** El problema central debe resolverse de manera completa, positiva y que refuerce la sensación de seguridad. Evita finales ambiguos o abiertos que puedan generar inquietud.\n`;
                base += `   - **Evitar Ambigüedades y Elementos Perturbadores:** No incluyas elementos narrativos que puedan ser fácilmente interpretados como amenazantes. Sé cuidadoso con el suspense; si lo usas, que sea leve y se resuelva rápidamente de forma positiva.\n`;
                base += `   - **Modelado Sutil de Afrontamiento Positivo:** Si los personajes enfrentan pequeños desafíos o preocupaciones (comunes, no miedos intensos a menos que el usuario lo especifique), muéstralos manejándolos con calma, buscando ayuda de forma constructiva o encontrando soluciones prácticas y positivas.\n`;
                base += `   - **Previsibilidad Reconfortante:** Una estructura narrativa clara y con cierta previsibilidad en cuanto a su tono y resolución puede ser beneficiosa.\n`;
                break;
            case 'Down': // Síndrome de Down
                base += `   - **Lenguaje Muy Concreto y Literal:** Usa palabras que se refieran a objetos, acciones y emociones observables y concretas. Evita abstracciones y lenguaje figurado.\n`;
                base += `   - **Frases Cortas y Estructura Simple:** Construye oraciones breves y con una estructura gramatical sencilla (Sujeto-Verbo-Objeto).\n`;
                base += `   - **Repetición de Información Clave:** Incorpora la repetición natural de nombres de personajes, lugares importantes, acciones clave o frases pegadizas para reforzar la memoria y la comprensión.\n`;
                base += `   - **Secuencia Narrativa Muy Clara y Lineal:** La historia debe seguir un orden de eventos simple, cronológico y fácil de anticipar. Divide la historia en partes claras si es posible (ej. primero pasó esto, luego esto otro, y al final...). \n`;
                base += `   - **Temas Familiares y Relevantes:** Utiliza situaciones, personajes y temas que puedan ser fácilmente relacionados con experiencias cotidianas o intereses comunes de los niños.\n`;
                break;
            case 'Comprension': // Dificultades de Comprensión Auditiva o Lingüística
                base += `   - **Frases Muy Claras y Sencillas:** Usa oraciones cortas, directas y con una estructura gramatical simple. Evita la voz pasiva y las oraciones subordinadas complejas.\n`;
                base += `   - **Vocabulario Controlado y Explícito:** Utiliza palabras comunes y de alta frecuencia. Si es necesario introducir una palabra nueva, intenta que el contexto inmediato clarifique su significado de forma natural o usa una breve paráfrasis sencilla.\n`;
                base += `   - **Repetición Estratégica de Conceptos Clave:** Reitera información importante (nombres, lugares, ideas principales) de manera sutil y en diferentes momentos para facilitar su asimilación.\n`;
                base += `   - **Conexiones Lógicas Explícitas:** Asegúrate de que las relaciones de causa-efecto y las secuencias temporales sean muy evidentes. Puedes usar conectores sencillos y claros (ej. 'porque', 'entonces', 'después').\n`;
                base += `   - **Lenguaje Altamente Descriptivo (Visualizable):** Aunque la salida es texto, usa un lenguaje que ayude a crear imágenes mentales claras y vívidas de los personajes, escenarios y acciones.\n`;
                break;
            default:
                base += `   - Dado que "${specialNeed}" es una necesidad específica no listada en las guías detalladas, enfócate en aplicar principios generales de adaptación: maximiza la claridad del lenguaje, asegura una estructura narrativa sencilla y comprensible, y mantén un tono consistentemente positivo y alentador.\n`;
                break;
        }
    }
    base += ` La historia debe seguir una estructura narrativa clara: un inicio que capte la atención, un desarrollo con un conflicto claro y un final que resuelva el problema de manera positiva y educativa.`;

    base += ` Sé creativo, asegurándote de que la trama sea coherente y atractiva. Utiliza un lenguaje sencillo, pero emocionalmente resonante.`;
    base += ` Recuerda, la historia debe ser adecuada para su edad y debe ofrecer un aprendizaje valioso al final, manteniendo siempre un enfoque amigable y accesible para los niños.`;
    return base;
}

// Definición de tipos para las opciones del prompt de usuario
interface CharacterOptions {
    name: string;
    profession?: string;
    hobbies?: string[];
    personality?: string;
}

interface UserPromptOptions {
    character: CharacterOptions;
    genre: string;
    moral: string;
    duration?: string;
}

interface CreateUserPromptParams {
    options: UserPromptOptions;
    additionalDetails?: string;
}

// createUserPrompt_SeparatorFormat: Mejorada con instrucciones adicionales
export function createUserPrompt_SeparatorFormat({ options, additionalDetails }: CreateUserPromptParams): string {
    console.log(`[Helper v6.1] createUserPrompt_SeparatorFormat: options=`, options, `details=`, additionalDetails);
    const char = options.character;
    const storyDuration = options.duration || 'medium';

    // Create base request
    let request = `Crea un cuento infantil. Género: ${options.genre}. Moraleja: ${options.moral}. Personaje principal: ${char.name}`;
    if (char.profession) request += `, profesión: ${char.profession}`;
    if (char.hobbies?.length) request += `, hobbies: ${char.hobbies.join(', ')}`;
    if (char.personality) request += `, personalidad: ${char.personality}`;
    request += `.\n\n`;

    // Content, length and structure instructions
    request += `**Instrucciones de Contenido, Longitud y Estructura:**\n`;
    request += `1. **Duración objetivo:** '${storyDuration}'.\n`;

    // Determine length based on duration
    if (storyDuration === 'short') request += `    * Guía (Corta): ~800 tokens.\n`;
    else if (storyDuration === 'long') request += `    * Guía (Larga): ~2150 tokens.\n`;
    else request += `    * Guía (Media): ~1350 tokens.\n`;

    // Additional user details (if any)
    if (additionalDetails && typeof additionalDetails === 'string' && additionalDetails.trim()) {
        request += `\n**Instrucciones adicionales del usuario:**\n${additionalDetails.trim()}\n`;
    }

    // Story structure instructions
    request += `2. **Estructura completa:** Inicio, desarrollo y final claros.\n`;

    // Tone and style
    request += `3. **Tono y estilo:** Emplea onomatopeyas o pequeñas preguntas como: “¿Te imaginas…?”, “¡Splash!”, etc., para mantener la atención de los niños.\n`;
    request += `   Además, usa ocasionalmente la estructura de fábula, especialmente si el género lo permite (aventura, fantasía, etc.).\n`;

    // **Inspiration**
    request += `4. **Inspiración:** Toma elementos de la tradición oral y de los clásicos de Disney (magia, amistad, humor inocente), pero crea personajes y situaciones originales. Evita copiar y busca innovar con ideas frescas y emocionantes.\n`;

    // Title request
    request += `5. **Título:** Genera un título extraordinario (memorable, original, etc.). El título debe seguir el estilo "Sentence case", donde solo la primera palabra y los nombres propios comienzan con mayúscula.\n`;

    // Response format instructions
    request += `\n**Instrucciones de formato de respuesta (¡MUY IMPORTANTE!):**\n`;
    request += `* Responde usando **exactamente** los siguientes separadores:\n`;
    request += `    <title_start>\n`;
    request += `    Aquí SOLO el título generado (4-7 palabras).\n`;
    request += `    <title_end>\n`;
    request += `    <content_start>\n`;
    request += `    Aquí TODO el contenido del cuento, comenzando directamente con la primera frase.\n`;
    request += `    <content_end>\n`;

    // Format rules
    request += `* **NO incluyas NADA antes de <title_start>.**\n`;
    request += `* **NO incluyas NADA después de <content_end>.**\n`;
    request += `* Asegúrate de incluir saltos de línea **exactamente** como se muestra entre los separadores y el texto.\n`;
    request += `* **NO uses ningún otro formato** (como markdown, JSON, etc.). Solo texto plano con estos separadores.\n`;

    return request;
}