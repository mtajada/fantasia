// supabase/edge-functions/story-continuation/prompt.ts
// v8.0 (Adult Content + Preferences): Prompts para la continuación de historias adultas.
// Ahora incluye el contenido COMPLETO de los capítulos anteriores en el contexto.

// Language mapping function to convert language codes to explicit language names
function getLanguageName(languageCode: string): string {
    const languageMap: Record<string, string> = {
        'es': 'Spanish',
        'en': 'English',
        'fr': 'French',
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese',
        'ru': 'Russian',
        'ja': 'Japanese',
        'ko': 'Korean',
        'zh': 'Chinese'
    };
    
    return languageMap[languageCode] || 'English';
}

// --- Tipos (asumidos/definidos según el uso en index.ts) ---
export interface CharacterOptions {
    name: string;
    gender: 'male' | 'female' | 'non-binary';
    description: string;
}

export interface StoryOptions {
    characters: CharacterOptions[];   // Unified: array de personajes (1-4)
    genre: string;
    format?: string; // 'single', 'episodic'
    language?: string;
}

export interface Story {
    id: string;
    title: string; // Título general de la historia
    content: string; // Contenido del capítulo inicial (o la historia base si no hay capítulos)
    options: StoryOptions;
}

export interface Chapter {
    id: string;
    chapter_number: number;
    title: string;
    content: string;
}

export interface ContinuationContextType {
    optionSummary?: string;
    userDirection?: string;
}

// --- Funciones de Prompt ---

/**
 * Crea el prompt para generar opciones de continuación para contenido adulto.
 * Ahora incluye el contenido completo de la historia y capítulos anteriores.
 */
export function createContinuationOptionsPrompt(
    story: Story,
    chapters: Chapter[],
    language: string = 'en',
    preferences: string | null = null,
): string {
    const functionVersion = "v8.0 (Adult Content + Preferences)";
    console.log(`[Prompt Helper ${functionVersion}] createContinuationOptionsPrompt for story ID: ${story.id}, lang: ${language}`);

    const languageName = getLanguageName(language);
    let prompt = `You are a creative assistant expert in generating interesting and coherent continuations for erotic stories for adults.
  Primary Story Language: ${languageName}. Target Audience: Adults (18+).`;

    if (preferences && preferences.trim()) {
        prompt += `\nConsider the user's preferences when suggesting continuations: "${preferences.trim()}". Incorporate these elements naturally and appropriately.`;
    }

    prompt += `\n\n--- COMPLETE STORY CONTEXT SO FAR ---`;
    prompt += `\n\n**Original Story (General Title: "${story.title}")**`;
    
    // Character handling (unchanged)
    const characters = story.options.characters || [];
    
    if (characters.length > 1) {
        prompt += `\nMain Characters (${characters.length}): `;
        characters.forEach((char, index) => {
            prompt += `${index + 1}. ${char.name}`;
            prompt += ` (${char.gender}, ${char.description})`;
            if (index < characters.length - 1) prompt += ', ';
        });
        prompt += `.`;
    } else if (characters.length === 1) {
        prompt += `\nMain Character: ${characters[0].name} (${characters[0].gender}, ${characters[0].description}).`;
    }
    
    prompt += `\n\n**Story Beginning:**\n${story.content}\n`;

    if (chapters && chapters.length > 0) {
        prompt += `\n\n**Previous Chapters:**`;
        chapters.forEach((chap) => {
            prompt += `\n\n**Chapter ${chap.chapter_number}: "${chap.title}"**\n${chap.content}\n`;
        });
    }
    prompt += `\n--- END OF COMPLETE CONTEXT ---\n`;

    prompt += `\n\nBased on the current state of the story (considering ALL the context provided above), generate 3 concise and attractive options to continue the erotic story. Each option should be a brief summary (10-20 words) of a possible next step in the adult adventure.`;
    prompt += `\nThe options should be varied, offering different paths or approaches for continuation that maintain the erotic/romantic tension.`;
    prompt += `\nEnsure the options explore clearly distinct themes or actions (for example: one option about exploring a new location, another about the introduction of a new character or element, and another about deepening intimacy or trying something new).`;
    prompt += `\nThey must be written in ${languageName}.`;

    // JSON format instructions (unchanged)
    prompt += `\n\n**Response format instructions (VERY IMPORTANT!):**`;
    prompt += `\n* You must respond with a SINGLE JSON object.`;
    prompt += `\n* The JSON object must have a single key called "options".`;
    prompt += `\n* The value of the "options" key must be an array (list) of exactly 3 objects.`;
    prompt += `\n* Each object within the "options" array must have a single key called "summary".`;
    prompt += `\n* The value of the "summary" key should be a text string with the continuation option summary (10-20 words in ${languageName}).`;
    prompt += `\n* Example of expected JSON format:`;
    prompt += `\n{`;
    prompt += `\n  "options": [`;
    prompt += `\n    { "summary": "The character decides to explore the mysterious bedroom." },`;
    prompt += `\n    { "summary": "A new romantic interest appears unexpectedly." },`;
    prompt += `\n    { "summary": "The character remembers a secret fantasy to explore." }`;
    prompt += `\n  ]`;
    prompt += `\n}`;
    prompt += `\n* Do NOT include ANYTHING before the '{' character that starts the JSON object.`;
    prompt += `\n* Do NOT include ANYTHING after the '}' character that ends the JSON object.`;
    prompt += `\n* Ensure the JSON is valid and complete.`;

    return prompt;
}

/**
 * Crea el prompt para generar la continuación de un capítulo para contenido adulto.
 * Ahora incluye el contenido completo de la historia y capítulos anteriores.
 */
export function createContinuationPrompt(
    action: 'freeContinuation' | 'optionContinuation' | 'directedContinuation',
    story: Story,
    chapters: Chapter[],
    context: ContinuationContextType,
    language: string = 'en',
    preferences: string | null = null,
    storyFormat: string = 'episodic'
): string {
    const functionVersion = "v8.0 (Adult Content + Preferences)";
    console.log(`[Prompt Helper ${functionVersion}] createContinuationPrompt for story ID: ${story.id}, action: ${action}, lang: ${language}`);

    const languageName = getLanguageName(language);
    let prompt = `You are an expert writer continuing erotic stories for adults.
  Write always in ${languageName}, with sophisticated and sensual language appropriate for mature audiences (18+).
  The original story has a genre of '${story.options.genre}'.`;

    // Chapter length guidance based on story format
    prompt += `\n\n**Chapter length guide based on story format:**`;
    if (storyFormat === 'single') {
        prompt += `\n* Complete Story: ~2150 tokens (approx. 1600-1800 words).`;
        prompt += `\n* This should conclude the story with a satisfying ending.`;
    } else {
        prompt += `\n* Episodic Chapter: ~1350 tokens (approx. 1000-1200 words).`;
        prompt += `\n* This should continue the story with room for future chapters.`;
    }
    prompt += `\nThese figures are approximate and serve as reference for the expected length.`;

    if (preferences && preferences.trim()) {
        prompt += `\nIncorporate the user's preferences naturally into the continuation: "${preferences.trim()}". Ensure all content remains consensual and positive while exploring these interests.`;
        prompt += ` Guidelines for preferences:\n`;
        prompt += `   - **Natural Integration:** Weave preferences into the plot organically\n`;
        prompt += `   - **Consensual Content:** All interactions must be consensual and positive\n`;
        prompt += `   - **Character Consistency:** Maintain character personalities while exploring preferences\n`;
        prompt += `   - **Quality Storytelling:** Prioritize good narrative flow over just including elements\n`;
    }

    // Complete context (unchanged structure, but content focus is now adult)
    prompt += `\n\n--- COMPLETE STORY CONTEXT SO FAR ---`;
    prompt += `\n\n**Original Story (General Title: "${story.title}")**`;
    
    const characters = story.options.characters || [];
    
    if (characters.length > 1) {
        prompt += `\nMain Characters (${characters.length}): `;
        characters.forEach((char, index) => {
            prompt += `${index + 1}. ${char.name}`;
            prompt += `, Gender: ${char.gender}`;
            prompt += `, Description: ${char.description}`;
            if (index < characters.length - 1) prompt += '; ';
        });
        prompt += `.`;
        
        prompt += `\n\n**IMPORTANT for multiple characters:** In this chapter, ensure all characters maintain their consistency and that each has relevant participation according to the story development and their established relationships.`;
    } else if (characters.length === 1) {
        const char = characters[0];
        prompt += `\nMain Character: ${char.name}`;
        prompt += `, Gender: ${char.gender}`;
        prompt += `, Description: ${char.description}`;
        prompt += `.`;
    }
    
    prompt += `\n\n**Story Beginning:**\n${story.content}\n`;

    if (chapters && chapters.length > 0) {
        prompt += `\n\n**Previous Chapters:**`;
        chapters.forEach((chap) => {
            prompt += `\n\n**Chapter ${chap.chapter_number}: "${chap.title}"**\n${chap.content}\n`;
        });
    }
    prompt += `\n--- END OF COMPLETE CONTEXT ---\n`;

    prompt += `\n\n--- YOUR TASK ---`;
    prompt += `\nConsidering ALL the context provided above, write the NEXT CHAPTER of this adult story.`;

    if (action === 'optionContinuation' && context.optionSummary) {
        prompt += `\nThe continuation should be based on the following option chosen by the user: "${context.optionSummary}"`;
    } else if (action === 'directedContinuation' && context.userDirection) {
        prompt += `\nThe continuation should follow this specific direction provided by the user: "${context.userDirection}"`;
    } else {
        prompt += `\nContinue the story freely and creatively, maintaining coherence with previous events and characters.`;
    }

    prompt += `\n\nGuides for the New Chapter:`;
    prompt += `\n1. **Chapter Content:** Aim for '${storyFormat}' format.`;
    if (storyFormat === 'single') {
        prompt += ` (approximately 1600-1800 words) - Complete the story with a satisfying conclusion.`;
    } else {
        prompt += ` (approximately 1000-1200 words) - Continue the story with room for future development.`;
    }

    prompt += `\n2. **Chapter Structure:** Should have clear narrative flow, connecting with the previous chapter and advancing the overall plot. Can introduce new erotic elements or deepen existing relationships.`;
    prompt += `\n3. **Tone and Style:** Maintain the tone and style of the original story. Use sophisticated, sensual language that creates atmosphere and emotional connection. Build tension and desire naturally.`;
    prompt += `\n4. **Coherence:** Ensure characters behave consistently and that new events fit logically in the story while maintaining the erotic tension.`;
    prompt += `\n5. **Chapter Title:** Generate a brief, attractive and relevant title for the content of this new chapter. Must be in ${languageName} and in "Sentence case".`;
    prompt += `\n6. **Adult Content:** All interactions must be consensual and positive. Focus on emotional connection alongside physical attraction. Create engaging, erotic content that celebrates adult sexuality healthily.`;

    // JSON format instructions (unchanged)
    prompt += `\n\n**Response format instructions (VERY IMPORTANT!):**`;
    prompt += `\n* You must respond with a SINGLE JSON object.`;
    prompt += `\n* The JSON object must have exactly two keys: "title" and "content".`;
    prompt += `\n* The "title" key value should be a text string containing ONLY the generated title for this new chapter, following the guidelines in point 5 of the "Guides for the New Chapter".`;
    prompt += `\n* The "content" key value should be a text string with ALL the content of this new chapter, starting directly with the first sentence.`;
    const exampleCharacterName = characters.length > 0 ? characters[0].name : 'the protagonist';
    prompt += `\n* Example of expected JSON format: {"title": "The Unexpected Encounter", "content": "The next morning, ${exampleCharacterName} woke up feeling a strange energy in the air..."}`;
    prompt += `\n* Do NOT include ANYTHING before the '{' character that starts the JSON object.`;
    prompt += `\n* Do NOT include ANYTHING after the '}' character that ends the JSON object.`;
    prompt += `\n* Ensure the JSON is valid and complete.`;
    prompt += `\n* Do NOT use markdown or any other formatting INSIDE the JSON strings unless it's part of the natural story text.`;

    return prompt;
}