// supabase/edge-functions/story-continuation/prompt.ts
// Contiene las funciones para generar los prompts para la continuación de historias.

// --- Interfaces (pueden necesitar ser más detalladas según tu modelo de datos completo) ---
interface CharacterOptions {
    name: string;
    profession?: string;
    personality?: string;
}

interface StoryOptions {
    genre: string;
    moral: string;
    character: CharacterOptions;
    language?: string;
    childAge?: number;
    specialNeed?: string;
    duration?: string;
}

interface Story {
    id: string | number;
    title: string;
    content: string;
    options: StoryOptions;
    // Añade otros campos de story que puedan ser relevantes
}

interface Chapter {
    id?: string | number;
    chapterNumber?: number;
    title?: string;
    content?: string;
    // Añade otros campos de chapter
}

export interface ContinuationContextType {
    optionSummary?: string;
    userDirection?: string;
}


// --- Funciones de Generación de Prompts ---

/**
 * Crea el prompt para solicitar opciones de continuación de la historia a la IA.
 */
export function createContinuationOptionsPrompt(
    story: Story,
    chapters: Chapter[],
    language: string = 'es',
    childAge: number = 7,
    specialNeed: string | null = null,
): string {
    console.log(`[PromptHelper v1.0] createContinuationOptionsPrompt for story ${story?.id}`);

    // Validación de datos de la historia (básica, la validación más robusta estaría antes de llamar a esta función)
    if (!story || !story.id || !story.title || !story.content || !story.options) {
        // En una función pura de prompt, podríamos no lanzar error, sino devolver un prompt de error
        // o confiar en que los datos ya vienen validados. Por ahora, mantenemos la lógica original de logueo.
        console.error("[PromptHelper v1.0] Datos de historia inválidos/incompletos para generar prompt de opciones.");
        // Podrías devolver un prompt genérico o lanzar un error si lo prefieres.
        // Aquí se asume que los datos son correctos, como en el original.
    }

    const cleanOriginalTitle = story.title.replace(/^\d+\.\s+/, '').trim();
    const storyOptions = story.options;
    console.log(`[DEBUG PromptHelper v1.0] Opts Context: Story ID: ${story.id}, Title: "${cleanOriginalTitle}", Lang: ${language}, Age: ${childAge}, Chapters: ${chapters.length}`);

    let contextContent = story.content;
    if (chapters.length > 0 && chapters[chapters.length - 1]?.content) {
        contextContent = chapters[chapters.length - 1].content as string; // Asumimos que content existe si el capítulo es válido
    }
    const contextPreview = contextContent?.substring(Math.max(0, contextContent.length - 600)).trim() || '(Sin contexto)';

    let promptContext = `CONTEXTO:\n`;
    promptContext += `- Idioma del cuento: ${language}\n`;
    promptContext += `- Edad del niño: ${childAge ?? 'No especificada'}\n`;
    if (specialNeed && specialNeed !== 'Ninguna') promptContext += `- Necesidad especial: ${specialNeed}\n`;
    promptContext += `- Título Original: "${cleanOriginalTitle}"\n`;
    promptContext += `- Género: ${storyOptions.genre}\n`;
    promptContext += `- Moraleja/Tema: ${storyOptions.moral}\n`;

    if (storyOptions.character) {
        const character = storyOptions.character;
        promptContext += `- Personaje Principal: ${character.name || 'Protagonista'} `;
        if (character.profession) promptContext += `(${character.profession}) `;
        if (character.personality) promptContext += `- Personalidad: ${character.personality}`;
        promptContext += `\n`;
    }
    promptContext += `- Final del Último Capítulo/Texto:\n...${contextPreview}\n\n`;

    let baseCommonInstructions = `Sugiere 3 posibles caminos MUY CORTOS (frases concisas indicando la siguiente acción o evento) y distintos para continuar la historia, basados en el ÚLTIMO contexto y coherentes con el género, moraleja y personaje. Las opciones deben ser apropiadas para un niño de ${childAge ?? '?'} años.`;

    let specialNeedGuidanceForOptions = "";
    if (specialNeed && specialNeed !== 'Ninguna') {
        specialNeedGuidanceForOptions = `\n\n**Consideraciones Específicas para "${specialNeed}" al generar las opciones (estas deben reflejar sutilmente los siguientes puntos):**\n`;
        switch (specialNeed) {
            case 'TEA': // Trastorno del Espectro Autista
                specialNeedGuidanceForOptions += `   - **Opciones Claras y Concretas:** Las opciones deben proponer acciones o eventos directos, fáciles de entender, evitando la ambigüedad.\n`;
                specialNeedGuidanceForOptions += `   - **Resultados Predecibles (implícitos en la opción):** Las opciones deben sugerir caminos con consecuencias lógicas y no sorpresivas o caóticas.\n`;
                specialNeedGuidanceForOptions += `   - **Interacciones Sociales Sencillas:** Si una opción implica interacción social, esta debe ser simple y directa.\n`;
                break;
            case 'TDAH': // Déficit de Atención e Hiperactividad
                specialNeedGuidanceForOptions += `   - **Opciones Estimulantes y Novedosas:** Las opciones deben sonar interesantes y prometer algo de acción o novedad para captar la atención.\n`;
                specialNeedGuidanceForOptions += `   - **Brevedad y Claridad Directa:** Las opciones deben ser muy concisas y al grano.\n`;
                break;
            case 'Dislexia': // Dislexia o Dificultad en Lectura
                specialNeedGuidanceForOptions += `   - **Opciones con Lenguaje Sencillo:** Las opciones deben estar formuladas con palabras comunes y fáciles de leer/entender.\n`;
                specialNeedGuidanceForOptions += `   - **Acciones Claras:** Las opciones deben describir acciones o eventos fáciles de visualizar y comprender.\n`;
                break;
            case 'Ansiedad': // Ansiedad o Miedos Específicos
                specialNeedGuidanceForOptions += `   - **Opciones Tranquilizadoras:** Las opciones deben llevar a desarrollos que se perciban como seguros y positivos. Evita opciones que sugieran peligro, misterio excesivo o confrontaciones intensas.\n`;
                specialNeedGuidanceForOptions += `   - **Resultados Positivos Implícitos:** Las opciones deben insinuar la posibilidad de una resolución favorable.\n`;
                break;
            case 'Down': // Síndrome de Down
                specialNeedGuidanceForOptions += `   - **Opciones Concretas y Comprensibles:** Las opciones deben describir acciones o eventos muy concretos y fáciles de entender, relacionados con lo familiar si es posible.\n`;
                specialNeedGuidanceForOptions += `   - **Secuencias Simples:** Las opciones deben sugerir el siguiente paso lógico y simple en la historia.\n`;
                break;
            case 'Comprension': // Dificultades de Comprensión Auditiva o Lingüística
                specialNeedGuidanceForOptions += `   - **Opciones Explícitas y Directas:** Las opciones deben ser muy claras en lo que proponen, sin dobles sentidos ni implicaciones complejas.\n`;
                specialNeedGuidanceForOptions += `   - **Vocabulario Sencillo en Opciones:** Utiliza palabras fáciles de entender en la formulación de las opciones.\n`;
                break;
            default:
                specialNeedGuidanceForOptions += `   - Al generar opciones para "${specialNeed}", asegúrate de que sean claras, positivas y fáciles de entender.\n`;
                break;
        }
    }

    // La variable 'instructions' se construye después, así que 'specialNeedGuidanceForOptions' se puede integrar allí.
    // El prompt final se construye como: `${promptContext}${instructions}\n${example}`;
    // Modificaremos la construcción de 'instructions' para incluir 'baseCommonInstructions' y 'specialNeedGuidanceForOptions'.

    const fullInstructionsBase = `${baseCommonInstructions}${specialNeedGuidanceForOptions}`;

    const finalCommonInstructions = `${fullInstructionsBase}\nIMPORTANTE: Los resúmenes dentro del JSON deben estar escritos en ${language}.\nResponde SOLO con un JSON array válido de objetos, cada uno con una clave "summary" (string). No incluyas NADA MÁS antes o después del JSON array.`;

    let instructions = '';
    let example = '';

    if (language.toLowerCase().startsWith('en')) {
        instructions = `Based on the LAST context provided above, ${finalCommonInstructions.replace('niño', 'child').replace('años', 'years old')}`;
        example = `Example: [{"summary":"The character decided to follow the map."}, {"summary":"A mysterious sound echoed nearby."}, {"summary":"They found a hidden note."}]`;
    } else {
        instructions = `Basado en el ÚLTIMO contexto proporcionado arriba, ${finalCommonInstructions}`;
        example = `Ejemplo: [{"summary":"El personaje decidió seguir el mapa."}, {"summary":"Un sonido misterioso resonó cerca."}, {"summary":"Encontraron una nota escondida."}]`;
    }
    const prompt = `${promptContext}${instructions}\n${example}`;
    console.log(`[DEBUG PromptHelper v1.0] Prompt para generación de opciones (lang: ${language}) generado.`);
    return prompt;
}


/**
 * Crea el prompt para la continuación de una historia, solicitando título y contenido con separadores.
 */
export function createContinuationPrompt(
    mode: 'freeContinuation' | 'optionContinuation' | 'directedContinuation',
    story: Story,
    chapters: Chapter[],
    context: ContinuationContextType, // Usamos la interfaz exportada
    language: string,
    childAge: number,
    specialNeed: string | null,
    storyDuration: string
): string {
    console.log(`[PromptHelper v1.0] createContinuationPrompt (Separator Format): mode=${mode}, story=${story?.id}, duration=${storyDuration}, chapters: ${chapters?.length}`);

    if (!story || !story.title || !story.options?.character?.name || !story.content) {
        console.error("[PromptHelper v1.0] Datos esenciales de la historia faltantes para generar prompt de continuación.");
        // Podría devolver un prompt de error o lanzar una excepción.
    }

    const cleanOriginalTitle = story.title.replace(/^\d+\.\s+/, '').trim();
    let systemPrompt = `Eres un escritor experto continuando un cuento infantil en ${language} para niños de aproximadamente ${childAge} años.`;
    systemPrompt += ` El cuento original se titula "${cleanOriginalTitle}" y su protagonista es ${story.options.character.name}. Género: ${story.options.genre || 'aventura'}. Moraleja: ${story.options.moral || 'ser valiente'}.`;
    if (specialNeed && specialNeed !== 'Ninguna') {
        systemPrompt += ` La adaptación para "${specialNeed}" debe ser sutil, priorizando siempre la claridad, la comprensión y un tono positivo en la continuación de la narración.`;
        systemPrompt += ` A continuación, algunas guías específicas para "${specialNeed}" al escribir este capítulo:\n`;

        switch (specialNeed) {
            case 'TEA': // Trastorno del Espectro Autista
                systemPrompt += `   - **Lenguaje Claro y Literal:** Usa frases cortas, directas y concretas. Evita el lenguaje figurado (metáforas, ironía) y las ambigüedades. Si es necesario introducir conceptos abstractos, explícalos de forma muy sencilla dentro de la narrativa.\n`;
                systemPrompt += `   - **Estructura Predecible:** Mantén una secuencia narrativa muy clara y lógica. Puedes usar elementos o frases clave que se repitan para ayudar a anticipar eventos de forma natural.\n`;
                systemPrompt += `   - **Descripciones Explícitas de Emociones e Interacciones Sociales:** Describe las emociones de los personajes de manera explícita y sencilla (ej. 'Lucas se sintió alegre cuando...'). Las interacciones sociales deben ser claras y directas.\n`;
                systemPrompt += `   - **Enfoque en Detalles Concretos:** Céntrate en detalles observables y acciones concretas en lugar de pensamientos o intenciones internas muy complejas, a menos que se expliquen de forma simple.\n`;
                systemPrompt += `   - **Tono Positivo y Calmado:** Asegura un tono general tranquilizador y positivo.\n`;
                break;
            case 'TDAH': // Déficit de Atención e Hiperactividad
                systemPrompt += `   - **Inicio Atractivo y Trama Dinámica:** Comienza el capítulo de forma que capte el interés rápidamente. Mantén una trama con buen ritmo y elementos de sorpresa o curiosidad para sostener la atención.\n`;
                systemPrompt += `   - **Lenguaje Estimulante pero Conciso:** Utiliza un lenguaje vívido y atractivo. Alterna frases de diferentes longitudes, pero prioriza la concisión para facilitar el seguimiento. Evita descripciones excesivamente largas o pasajes muy densos sin acción.\n`;
                systemPrompt += `   - **Estructura Clara del Capítulo:** Asegura que el hilo conductor del capítulo sea fácil de seguir, con transiciones claras.\n`;
                systemPrompt += `   - **Fomentar la Conexión (a través del texto):** Incluye preguntas retóricas cortas, onomatopeyas y exclamaciones que hagan la narración más viva.\n`;
                break;
            case 'Dislexia': // Dislexia o Dificultad en Lectura
                systemPrompt += `   - **Lenguaje Sencillo y Accesible:** Opta por vocabulario común y frases cortas. Prefiere la voz activa y estructuras gramaticales directas (Sujeto-Verbo-Predicado).\n`;
                systemPrompt += `   - **Evitar Complejidad Lingüística Innecesaria:** Reduce el uso de palabras con ortografía muy compleja o poco fonéticas si existen alternativas más simples. No uses jerga ni lenguaje excesivamente formal.\n`;
                systemPrompt += `   - **Repetición Natural de Palabras Clave:** Reintroduce palabras importantes de forma sutil en diferentes contextos para facilitar su reconocimiento y afianzamiento, sin que suene forzado.\n`;
                systemPrompt += `   - **Narrativa Clara y Lineal dentro del Capítulo:** La progresión de eventos debe ser lógica y fácil de seguir.\n`;
                break;
            case 'Ansiedad': // Ansiedad o Miedos Específicos
                systemPrompt += `   - **Tono General Tranquilizador y Optimista:** Mantén un ambiente narrativo calmado, amable y consistentemente positivo.\n`;
                systemPrompt += `   - **Resolución Clara y Segura del Conflicto (si aplica al capítulo):** Si el capítulo introduce un mini-conflicto, debe resolverse de manera positiva y que refuerce la sensación de seguridad, o al menos avanzar hacia ello. Evita finales de capítulo ambiguos que puedan generar inquietud.\n`;
                systemPrompt += `   - **Evitar Ambigüedades y Elementos Perturbadores:** No incluyas elementos narrativos que puedan ser fácilmente interpretados como amenazantes. Sé cuidadoso con el suspense.\n`;
                systemPrompt += `   - **Modelado Sutil de Afrontamiento Positivo:** Si los personajes enfrentan pequeños desafíos, muéstralos manejándolos con calma.\n`;
                break;
            case 'Down': // Síndrome de Down
                systemPrompt += `   - **Lenguaje Muy Concreto y Literal:** Usa palabras que se refieran a objetos, acciones y emociones observables y concretas.\n`;
                systemPrompt += `   - **Frases Cortas y Estructura Simple:** Construye oraciones breves y con una estructura gramatical sencilla.\n`;
                systemPrompt += `   - **Repetición de Información Clave:** Incorpora la repetición natural de elementos importantes para reforzar la memoria y la comprensión.\n`;
                systemPrompt += `   - **Secuencia Narrativa Muy Clara dentro del Capítulo:** El capítulo debe seguir un orden de eventos simple y cronológico.\n`;
                systemPrompt += `   - **Temas Familiares y Relevantes:** Utiliza situaciones y temas fácilmente comprensibles.\n`;
                break;
            case 'Comprension': // Dificultades de Comprensión Auditiva o Lingüística
                systemPrompt += `   - **Frases Muy Claras y Sencillas:** Usa oraciones cortas, directas y con una estructura gramatical simple.\n`;
                systemPrompt += `   - **Vocabulario Controlado y Explícito:** Utiliza palabras comunes. Si es necesario introducir una palabra nueva, que el contexto clarifique su significado.\n`;
                systemPrompt += `   - **Repetición Estratégica de Conceptos Clave:** Reitera información importante del capítulo de manera sutil.\n`;
                systemPrompt += `   - **Conexiones Lógicas Explícitas:** Asegúrate de que las relaciones de causa-efecto y las secuencias temporales sean muy evidentes.\n`;
                systemPrompt += `   - **Lenguaje Altamente Descriptivo (Visualizable):** Usa un lenguaje que ayude a crear imágenes mentales claras.\n`;
                break;
            default:
                systemPrompt += `   - Dado que "${specialNeed}" es una necesidad específica no listada, enfócate en aplicar principios generales de adaptación: maximiza la claridad del lenguaje, asegura una estructura narrativa sencilla, y mantén un tono consistentemente positivo.\n`;
                break;
        }
    }
    systemPrompt += ` Mantén la coherencia con la trama, personajes y tono establecidos en los capítulos anteriores.\n`;

    let fullStoryContext = `\n\n--- HISTORIA COMPLETA HASTA AHORA ---\n\n`;
    fullStoryContext += `**Título Original:** ${cleanOriginalTitle}\n**Capítulo 1 (Inicio):**\n${story.content.trim()}\n\n`;

    if (chapters.length > 0) {
        const sortedChapters = [...chapters].sort((a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0));
        sortedChapters.forEach((chapter) => {
            if (chapter && chapter.chapterNumber && chapter.title && chapter.content) {
                fullStoryContext += `--- Capítulo ${chapter.chapterNumber}: ${chapter.title} ---\n${chapter.content.trim()}\n\n`;
            } else {
                console.warn(`[PromptHelper v1.0] Saltando capítulo inválido en contexto:`, chapter);
            }
        });
    }
    fullStoryContext += `--- FIN DE LA HISTORIA HASTA AHORA ---\n\n`;

    const nextChapterNumber = (chapters?.length ?? 0) + 2;
    let userInstruction = `--- INSTRUCCIONES PARA GENERAR EL PRÓXIMO CAPÍTULO (${nextChapterNumber}) (Duración objetivo: ${storyDuration}) ---\n`;

    if (storyDuration === 'short') userInstruction += `**Guía Longitud (Corta):** Escribe un capítulo breve (aprox. 5-8 párrafos).\n`;
    else if (storyDuration === 'long') userInstruction += `**Guía Longitud (Larga):** Escribe un capítulo detallado y extenso (aprox. 15+ párrafos).\n`;
    else userInstruction += `**Guía Longitud (Media):** Escribe un capítulo de longitud moderada (aprox. 10-14 párrafos).\n`;

    switch (mode) {
        case 'optionContinuation':
            userInstruction += `**Tarea:** Continúa la historia DESPUÉS del último capítulo, desarrollando la siguiente idea elegida: "${context.optionSummary}".\n`;
            break;
        case 'directedContinuation':
            userInstruction += `**Tarea:** Continúa la historia DESPUÉS del último capítulo, siguiendo esta dirección del usuario: "${context.userDirection}".\n`;
            break;
        default: // freeContinuation
            userInstruction += `**Tarea:** Continúa la historia DESPUÉS del último capítulo de forma libre, creativa y coherente con TODO lo anterior.\n`;
            break;
    }

    userInstruction += `**Importante:** El capítulo debe tener un inicio, desarrollo y un final o punto de pausa claro. ¡NO termines abruptamente!\n`;
    userInstruction += `* **Título del Capítulo:** Genera un título breve y atractivo para este capítulo (3-6 palabras). El título debe seguir el estilo "Sentence case", donde solo la primera palabra y los nombres propios comienzan con mayúscula.\n`;
    userInstruction += `* **Formato de Respuesta (¡MUY IMPORTANTE!):**\n`;
    userInstruction += `    <title_start>\n`;
    userInstruction += `    Aquí SOLAMENTE el título generado para este capítulo.\n`;
    userInstruction += `    <title_end>\n`;
    userInstruction += `    <content_start>\n`;
    userInstruction += `    Aquí TODO el contenido de este NUEVO capítulo.\n`;
    userInstruction += `    <content_end>\n`;
    userInstruction += `* **NO incluyas NADA antes de <title_start> ni después de <content_end>.**\n`;
    userInstruction += `* Asegúrate de incluir saltos de línea entre separadores y texto.\n`;
    userInstruction += `* **NO uses ningún otro formato.** Solo texto plano con estos separadores.\n`;

    const finalPrompt = `${systemPrompt}\n${fullStoryContext}\n${userInstruction}`;
    console.log(`[PromptHelper v1.0] Continuation Prompt (Separator Format) generado. Inicio: "${finalPrompt.substring(0, 200)}..."`);
    return finalPrompt;
}