import {
  Challenge,
  ChallengeCategory,
  ChallengeQuestion,
  ProfileSettings,
  Story,
} from "../types";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../supabaseClient";

// Helper function to generate UUID
const generateId = () => uuidv4();

export class ChallengeService {
  /**
   * Generates a challenge question based on the story
   */
  public static async generateChallengeQuestion(
    story: Story,
    category: ChallengeCategory,
    profileSettings: ProfileSettings,
    targetLanguage?: string,
  ): Promise<ChallengeQuestion> {
    try {
      console.log(
        "Enviando solicitud a la Edge Function challenge (generateChallengeQuestion)...",
      );

      const { data, error } = await supabase.functions.invoke("challenge", {
        body: {
          action: "createChallenge",
          story,
          category,
          profileSettings,
          targetLanguage,
        },
      });

      if (error) {
        console.error("Error en Edge Function challenge:", error);
        throw error;
      }

      if (!data || !data.questions || !data.questions[0]) {
        throw new Error("La respuesta de challenge no contiene preguntas");
      }

      return data.questions[0];
    } catch (error) {
      console.error("Error generating challenge question:", error);
      throw error;
    }
  }

  /**
   * Creates a new challenge with a question
   */
  public static async createChallenge(
    story: Story,
    category: ChallengeCategory,
    profileSettings: ProfileSettings,
    targetLanguage?: string,
  ): Promise<Challenge> {
    try {
      console.log(
        "Enviando solicitud a la Edge Function challenge (createChallenge)...",
      );

      const { data, error } = await supabase.functions.invoke("challenge", {
        body: {
          action: "createChallenge",
          story,
          category,
          profileSettings,
          targetLanguage,
        },
      });

      if (error) {
        console.error("Error en Edge Function challenge:", error);
        throw error;
      }

      if (!data || !data.id || !data.questions) {
        throw new Error("La respuesta de challenge no tiene un formato válido");
      }

      return data as Challenge;
    } catch (error) {
      console.error("Error creating challenge:", error);
      throw error;
    }
  }

  /**
   * Returns list of available languages for language challenges
   */
  public static async getAvailableLanguages(
    currentLanguage: string,
  ): Promise<{ code: string; name: string }[]> {
    try {
      console.log(
        "Enviando solicitud a la Edge Function challenge (getLanguages)...",
      );

      const { data, error } = await supabase.functions.invoke("challenge", {
        body: {
          action: "getLanguages",
          profileSettings: {
            language: currentLanguage,
          },
        },
      });

      if (error) {
        console.error("Error en Edge Function challenge:", error);
        throw error;
      }

      if (!data || !data.languages) {
        throw new Error("La respuesta de challenge no contiene idiomas");
      }

      return data.languages;
    } catch (error) {
      console.error("Error getting available languages:", error);

      // Fallback languages if the API call fails
      const languages = [
        { code: "en", name: "Inglés" },
        { code: "fr", name: "Francés" },
        { code: "de", name: "Alemán" },
        { code: "it", name: "Italiano" },
        { code: "pt", name: "Portugués" },
      ];

      // Filter out the current language
      return languages.filter((lang) => lang.code !== currentLanguage);
    }
  }
}
