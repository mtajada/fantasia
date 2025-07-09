export const STORY_VOICES = [
    {
      id: "el-sabio",
      name: "El Sabio",
      description: "Voz grave y serena, ideal para transmitir conocimiento.",
      color: "#a5d6f6", // Indigo-600
      gradientFrom: "#6366f1", // Indigo-500
      gradientTo: "#3730a3", // Indigo-800
      speed: 0.50,
      icon: "📚",
      preview: "📚 El Sabio: “Hola, soy El Sabio, con mi voz grave y serena te acompañaré en este viaje de conocimiento.”",
      instructions: "El Sabio: Velocidad 0.50; pausa 250 ms antes y después de frases clave; entonación descendente al final de oraciones; Lee este texto con acento americano neutral; añadir susurro de hojas al 10 % de volumen; realzar 100–300 Hz y atenuar >6 kHz; inhalaciones sutiles antes de pasajes largos."
    },
  
    {
      id: "la-hada",
      name: "La Hada",
      description: "Voz suave y dulce, perfecta para historias emocionales y de aprendizaje.",
      color: "#f6a5b7", // Rose-600
      gradientFrom: "#f43f5e", // Rose-500
      gradientTo: "#be123c", // Rose-700
      speed: 1.00,
      icon: "👸",
      preview: "👸 La Hada: “Soy La Hada, mi voz suave y dulce te envolverá en cada emoción y enseñanza.”",
      instructions: "La Hada: Velocidad 1.00; pausas de 150 ms tras frases emotivas; subir tono en picos emocionales y alargar vocales 'a' y 'o'; Lee este texto con acento americano neutral; campanillas al 8 % de volumen; realzar 3–6 kHz; respiraciones antes de frases conmovedoras."
    },
  
    {
      id: "el-animado",
      name: "El Animado",
      description: "Voz aguda y caricaturesca, ideal para historias divertidas.",
      color: "#f7c59f", // Green-600
      gradientFrom: "#22c55e", // Green-500
      gradientTo: "#16a34a", // Green-700
      speed: 1.20,
      icon: "🎭",
      preview: "🎭 El Animado: “¡Ey, qué tal! Soy El Animado, con mi tono alegre y caricaturesco haré de esta historia una fiesta.”",
      instructions: "El Animado: Velocidad 1.20; pausas de 100 ms entre frases; cambios rápidos de entonación en exclamaciones y preguntas; Lee este texto con acento americano neutral; risas y aplausos al 12 % de volumen; realzar 1–2 kHz; inhalaciones cortas antes de exclamaciones."
    }
  ];
  
export const SYSTEM_PROMPT = "You are a professional narrator of adult stories in American English, with clear pronunciation and neutral American accent. Adapt your rhythm and intonation to the character";

export const CUSTOM_VOICE_MAPPING = {
  "el-sabio": "ash",
  "la-hada": "sage",
  "el-animado": "ballad",
};

export const PREVIEW_FILES: Record<string, string> = {
  "el-sabio": "/previews/sabio.mp3",
  "la-hada": "/previews/hada.mp3",
  "el-animado": "/previews/animado.mp3"
};

export const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];