// supabase/edge-functions/generate-story/prompt.ts
// v8.0 (Adult Content + Preferences): Contiene las funciones para generar los prompts de contenido adulto.
// createUserPrompt_JsonFormat ahora instruye a la IA para devolver JSON con contenido erótico.

// createSystemPrompt: El contenido textual de la guía para la IA ahora enfocado en contenido adulto.
export function createSystemPrompt(language: string, preferences?: string | null): string {
    console.log(`[Adult Content v8.0] createSystemPrompt: lang=${language}, preferences=${preferences ? 'provided' : 'none'}`);

    let base = `You are an expert writer creating personalized erotic stories for adults. Write always in ${language}, with sophisticated and sensual language appropriate for mature audiences (18+).`;
    
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
    
    base += ` The story should follow a clear narrative structure: an engaging beginning that sets the mood, development with building tension and desire, and a satisfying climax and resolution.`;
    base += ` Use sophisticated and evocative language that creates atmosphere and emotional connection. Focus on character development, sensual descriptions, and meaningful intimate moments.`;
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
    moral: string;
    duration?: string;
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
    const storyDuration = options.duration || 'medium';
    const language = options.language || 'en';

    // Unified character system - always use characters array (1-4 characters)
    const characters = options.characters || [];
    const isMultipleCharacters = characters.length > 1;

    // Create base request with character handling
    let request = `Create an erotic story for adults. Genre: ${options.genre}. Theme/Message: ${options.moral}. `;
    
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
    request += `1. **Target Duration:** '${storyDuration}'.\n`;
    
    if (storyDuration === 'short') request += `    * Guide (Short): ~800 tokens (~600-700 words).\n`;
    else if (storyDuration === 'long') request += `    * Guide (Long): ~2150 tokens (~1600-1800 words).\n`;
    else request += `    * Guide (Medium): ~1350 tokens (~1000-1200 words).\n`;

    // Additional user details (if any)
    if (additionalDetails && typeof additionalDetails === 'string' && additionalDetails.trim()) {
        request += `\n**Additional user instructions:**\n${additionalDetails.trim()}\n`;
    }

    request += `2. **Complete Structure:** Clear beginning, development, and satisfying conclusion.\n`;
    request += `3. **Tone and Style:** Use sophisticated, sensual language that builds atmosphere and emotional connection. Create vivid scenes that engage the reader's imagination.\n`;
    request += `4. **Adult Content Guidelines:** All interactions must be consensual and positive. Focus on emotional connection alongside physical attraction. Build tension and desire naturally through the narrative.\n`;
    request += `5. **Character Development:** Create believable, complex characters with desires and motivations. Show their emotional journey alongside the physical story.\n`;
    
    request += `6. **Title:** Generate an extraordinary title (memorable, evocative, intriguing). The title should follow "Sentence case" style. The title must be written in the same language selected for the story: ${language}.\n`;

    // JSON format instructions (unchanged)
    request += `\n**Response format instructions (VERY IMPORTANT!):**\n`;
    request += `* You must respond with a SINGLE JSON object.\n`;
    request += `* The JSON object must have exactly two keys: "title" and "content".\n`;
    request += `* The "title" key value should be a string containing ONLY the generated title (ideally 4-7 words), following the title guidelines above (${language} language, "Sentence case").\n`;
    request += `* The "content" key value should be a string with ALL the story content, starting directly with the first sentence of the story.\n`;
    request += `* Example of expected JSON format: {"title": "An extraordinary title here", "content": "Once upon a time in a distant place..."}\n`;
    request += `* Do NOT include ANYTHING before the '{' character that starts the JSON object.\n`;
    request += `* Do NOT include ANYTHING after the '}' character that ends the JSON object.\n`;
    request += `* Ensure the JSON is valid and complete.\n`;
    request += `* Do NOT use markdown or any other formatting INSIDE the JSON strings unless it's part of the natural story text.\n`;

    return request;
}