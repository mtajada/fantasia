// supabase/edge-functions/generate-story/prompt.ts
// v8.0 (Adult Content + Preferences): Contiene las funciones para generar los prompts de contenido adulto.
// createUserPrompt_JsonFormat ahora instruye a la IA para devolver JSON con contenido erótico.

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

// createSystemPrompt: El contenido textual de la guía para la IA ahora enfocado en contenido adulto.
export function createSystemPrompt(language: string, preferences?: string | null, spicynessLevel: number = 2): string {
    console.log(`[Adult Content v8.0] createSystemPrompt: lang=${language}, preferences=${preferences ? 'provided' : 'none'}, spiciness=${spicynessLevel}`);

    const languageName = getLanguageName(language);
    let base = `You are an expert writer creating personalized erotic stories for adults. Write always in ${languageName}, using clear and direct sensual language appropriate for mature audiences (18+).`;

    // Add spiciness level specific guidelines
    if (spicynessLevel === 1) {
        base += ` CONTENT INTENSITY: PASSIONATE (Level 1) - Create explicit but balanced sexual content. Include clear descriptions of sexual acts without excessive detail. Use direct language, focusing on emotions and physical sensations. Keep sexual scenes concise while maintaining explicitness.`;
    } else if (spicynessLevel === 2) {
        base += ` CONTENT INTENSITY: INTENSE (Level 2) - Create very explicit and graphic sexual content. Include detailed descriptions of sexual acts, positions, and physical sensations. Use direct and provocative language without euphemisms. Maintain high sexual intensity with detailed descriptions while emphasizing consent and positivity.`;
    } else if (spicynessLevel === 3) {
        base += ` CONTENT INTENSITY: EXTREME (Level 3) - Create extremely explicit and raw sexual content. Include highly detailed and graphic descriptions of all sexual acts, positions, and physical responses. Use the most direct, unfiltered, and provocative language without any euphemisms or restraint. Focus on pure physical intensity and raw desire while maintaining consent.`;
    }

    if (preferences && preferences.trim()) {
        base += ` The user has specified these preferences and interests: "${preferences.trim()}". Incorporate these elements thoughtfully and naturally into the story to create a personalized experience.`;
        base += ` Guidelines for user preferences:\n`;
        base += `   - **Respect Boundaries:** Only include elements that align with the specified preferences\n`;
        base += `   - **Natural Integration:** Weave preferences into the plot organically, don't force them\n`;
        base += `   - **Quality Focus:** Prioritize good storytelling over just including fetishes\n`;
        base += `   - **Consent & Positivity:** All interactions should be consensual and positive\n`;
        base += `   - **Character Development:** Use preferences to enhance character depth and relationships\n`;
    } else {
        base += ` Since no specific preferences were provided, create a sensual and engaging story with broad adult appeal, focusing on romance, attraction, and intimate connections.`;
    }

    base += ` The story should follow a clear and direct narrative structure: a concise beginning, focused development, and satisfying resolution. Get to the point quickly without excessive buildup.`;
    base += ` Use clear and accessible language that engages all readers equally. Focus on authentic character interactions and meaningful moments without unnecessary embellishment.`;
    base += ` Ensure all content is consensual, positive, and celebrates adult sexuality in a healthy and appealing way.`;

    return base;
}

// Definición de tipos para las opciones del prompt de usuario (actualizado para múltiples personajes)
interface CharacterOptions {
    name: string;
    gender: 'male' | 'female' | 'non-binary';
    description: string;
}

interface UserPromptOptions {
    characters: CharacterOptions[];   // Unified: array de personajes (1-4)
    genre: string;
    format?: string;
    language?: string;
}

interface CreateUserPromptParams {
    options: UserPromptOptions;
    additionalDetails?: string;
}

// createUserPrompt_JsonFormat: Anteriormente createUserPrompt_SeparatorFormat.
// Modificada para instruir a la IA a devolver un objeto JSON con contenido adulto.
export function createUserPrompt_JsonFormat({ options, additionalDetails }: CreateUserPromptParams): string {
    console.log(`[Adult Content v8.0] createUserPrompt_JsonFormat:`, options, `details=`, additionalDetails);
    const storyFormat = options.format || 'episodic';
    const language = options.language || 'en';

    // Unified character system - always use characters array (1-4 characters)
    const characters = options.characters || [];
    const isMultipleCharacters = characters.length > 1;

    // Create base request with character handling
    let request = `Create an erotic story for adults. Genre: ${options.genre}. `;
    if (isMultipleCharacters) {
        request += `Main Characters (${characters.length}): `;
        characters.forEach((char, index) => {
            request += `${index + 1}. ${char.name}`;
            request += `, gender: ${char.gender}`;
            request += `, description: ${char.description}`;
            if (index < characters.length - 1) request += '; ';
        });
        request += `.\n\n`;
        // Add specific instructions for multiple characters
        request += `**Instructions for multiple characters:**\n`;
        request += `- Ensure ALL characters have significant participation in the story\n`;
        request += `- Each character should contribute uniquely based on their gender and personal description\n`;
        request += `- Create natural and dynamic interactions between characters\n`;
        request += `- Develop romantic/erotic tension and relationships between characters as appropriate\n`;
        request += `- Keep the story focused and coherent despite multiple protagonists\n\n`;
    } else {
        const char = characters[0];
        request += `Main Character: ${char.name}`;
        request += `, gender: ${char.gender}`;
        request += `, description: ${char.description}`;
        request += `.\n\n`;
    }

    // Content and structure instructions for adult content
    request += `**Content, Length and Structure Instructions:**\n`;
    request += `1. **Story Format:** '${storyFormat}'.\n`;
    if (storyFormat === 'single') {
        request += `    * Complete Story: ~2150 tokens (~1600-1800 words).\n`;
        request += `    * This should be a complete story with clear beginning, development, climax, and satisfying conclusion.\n`;
        request += `    * Include full character development and resolve all plot elements.\n`;
    } else {
        request += `    * Episodic Chapter: ~1350 tokens (~1000-1200 words).\n`;
        request += `    * This should be the first chapter of an ongoing story with an open ending.\n`;
        request += `    * Leave room for future chapters and continuation of the adventure.\n`;
        request += `    * Focus on establishing characters, setting, and initial erotic tension.\n`;
    }

    // Additional user details (if any)
    if (additionalDetails && typeof additionalDetails === 'string' && additionalDetails.trim()) {
        request += `\n**Additional user instructions:**\n${additionalDetails.trim()}\n`;
    }

    request += `2. **Structure Guidelines:**\n`;
    if (storyFormat === 'single') {
        request += `    * Clear beginning, development, climax, and satisfying conclusion\n`;
        request += `    * Complete character arcs and resolution of conflicts\n`;
        request += `    * Full exploration of the erotic theme and relationship dynamics\n`;
    } else {
        request += `    * Engaging opening that establishes setting and characters\n`;
        request += `    * Build initial attraction and erotic tension\n`;
        request += `    * End with anticipation and desire for continuation\n`;
    }
    request += `3. **Tone and Style:** Use clear, direct language that creates engaging scenes for all readers. Write concisely and get to the point without unnecessary elaboration.\n`;
    request += `4. **Adult Content Guidelines:** All interactions must be consensual and positive. Focus on emotional connection alongside physical attraction. Build tension and desire naturally through the narrative.\n`;
    request += `5. **Character Development:** Create believable, complex characters with desires and motivations. Show their emotional journey alongside the physical story.\n`;

    // JSON format instructions - simplified title handling
    request += `\n**Response format instructions (VERY IMPORTANT!):**\n`;
    request += `* You must respond with a SINGLE JSON object.\n`;
    request += `* The JSON object must have exactly two keys: "title" and "content".\n`;
    request += `* The "title" key value should be a string containing a short, sensual title (2-4 words maximum) that captures the story's essence.\n`;
    request += `* The "content" key value should be a string with ALL the story content, starting directly with the first sentence of the story.\n`;
    request += `* Example of expected JSON format: {"title": "Story title here", "content": "Story content starts here..."}\n`;
    request += `* Do NOT include ANYTHING before the '{' character that starts the JSON object.\n`;
    request += `* Do NOT include ANYTHING after the '}' character that ends the JSON object.\n`;
    request += `* Ensure the JSON is valid and complete.\n`;
    request += `* Do NOT use markdown or any other formatting INSIDE the JSON strings unless it's part of the natural story text.\n`;

    return request;
}