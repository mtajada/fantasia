import { SYSTEM_PROMPT_BASE, IMAGES_TYPE } from '@/constants/story-images.constant';
import { supabase } from '@/supabaseClient';
import OpenAI from "openai";

interface ImageGenerationOptions {
  title: string;
  content: string;
  storyId: string;
  chapterId?: string | number;
}

interface GeneratedImage {
  type: string;
  url: string;
  prompt: string;
}

interface ImageGenerationResult {
  success: boolean;
  images: GeneratedImage[];
  error?: string;
}

/**
 * Service for generating story images using OpenAI GPT-4.1-mini with image generation tools
 */
export class ImageGenerationService {
  private static readonly MODEL = 'gpt-image-1';
  private static openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPEN_AI_API_KEY,
    dangerouslyAllowBrowser: true // Solo para desarrollo, en producción usar Edge Functions
  });

  /**
   * Generates all story images (cover, scenes, character) asynchronously
   * @param options Story data for image generation
   * @returns Promise with generation results
   */
  static async generateStoryImages(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
    const { title, content, storyId, chapterId = 1 } = options;
    
    try {
      console.log('[ImageGeneration] Starting image generation for story:', storyId);
      
      // Create prompts for each image type
      const prompts = this.createImagePrompts(title, content);
      
      // Generate all images concurrently for speed
      const imagePromises = Object.entries(prompts).map(([imageType, prompt]) =>
        this.generateSingleImage(imageType, prompt, storyId, chapterId)
      );
      
      const results = await Promise.allSettled(imagePromises);
      
      // Process results
      const successfulImages: GeneratedImage[] = [];
      const errors: string[] = [];
      
      results.forEach((result, index) => {
        const imageType = Object.keys(prompts)[index];
        
        if (result.status === 'fulfilled' && result.value.success) {
          successfulImages.push(result.value.image!);
        } else if (result.status === 'rejected') {
          errors.push(`${imageType}: ${result.reason}`);
        } else if (result.status === 'fulfilled' && !result.value.success) {
          errors.push(`${imageType}: ${result.value.error}`);
        }
      });
      
      console.log(`[ImageGeneration] Generated ${successfulImages.length}/${Object.keys(prompts).length} images successfully`);
      
      return {
        success: successfulImages.length > 0,
        images: successfulImages,
        error: errors.length > 0 ? errors.join('; ') : undefined
      };
      
    } catch (error) {
      console.error('[ImageGeneration] Error generating story images:', error);
      return {
        success: false,
        images: [],
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Creates specific prompts for each image type
   * CHARACTER is generated first to establish visual consistency for scenes
   */
  private static createImagePrompts(title: string, content: string): Record<string, string> {
    const baseContext = `**Cuento:**
Título: ${title}
Cuento: ${content}`;

    return {
    [IMAGES_TYPE.COVER]: `${SYSTEM_PROMPT_BASE}

${baseContext}

Genera una imagen de PORTADA que capture la esencia del cuento. Debe incluir el título de manera artística y elementos visuales que representen la historia principal, manteniendo la misma estética del personaje principal. Estilo acuarela tradicional de cuento infantil.`,

      [IMAGES_TYPE.SCENE_1]: `${SYSTEM_PROMPT_BASE}

${baseContext}

Genera una imagen de la PRIMERA ESCENA más importante del cuento, donde el PERSONAJE PRINCIPAL debe ser el elemento central de la composición. Debe mostrar un momento clave de la historia con el protagonista en acción, manteniendo las características visuales establecidas del personaje. Estilo acuarela tradicional de cuento infantil.`,

      [IMAGES_TYPE.SCENE_2]: `${SYSTEM_PROMPT_BASE}

${baseContext}

Genera una imagen de la SEGUNDA ESCENA más importante del cuento, donde el PERSONAJE PRINCIPAL debe ser prominente en la escena. Debe representar otro momento crucial diferente al anterior, mostrando al protagonista en una situación distinta pero manteniendo continuidad visual y las características del personaje establecidas. Estilo acuarela tradicional de cuento infantil.`
    };
  }

  /**
   * Generates a single image and uploads it to Supabase
   */
  private static async generateSingleImage(
    imageType: string, 
    prompt: string, 
    storyId: string, 
    chapterId: string | number
  ): Promise<{ success: boolean; image?: GeneratedImage; error?: string }> {
    try {
      console.log(`[ImageGeneration] Generating ${imageType} image...`);
      
      // Generate image with OpenAI
      const imageBase64 = await this.callOpenAIImageGeneration(prompt);
      
      if (!imageBase64) {
        throw new Error('No image data returned from OpenAI');
      }
      
      // Upload to Supabase via Edge Function
      const uploadResult = await this.uploadImageToSupabase(imageBase64, imageType, storyId, chapterId);
      
      if (!uploadResult.success) {
        throw new Error(`Upload failed: ${uploadResult.error}`);
      }
      
      console.log(`[ImageGeneration] Successfully generated and uploaded ${imageType}`);
      
      return {
        success: true,
        image: {
          type: imageType,
          url: uploadResult.publicUrl!,
          prompt: prompt
        }
      };
      
    } catch (error) {
      console.error(`[ImageGeneration] Error generating ${imageType}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Calls OpenAI API to generate image using GPT-4.1-mini with image generation tools
   */
  private static async callOpenAIImageGeneration(prompt: string): Promise<string | null> {
    try {
      const response = await this.openai.images.generate({
        model: this.MODEL,
        prompt: prompt,
        n: 1,
        quality: "medium",
        size: "1024x1536",
        background: "opaque"
      });


      return response.data[0].b64_json;
    } catch (error) {
      console.error('[ImageGeneration] OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Uploads generated image to Supabase storage via Edge Function
   */
  private static async uploadImageToSupabase(
    imageBase64: string, 
    imageType: string, 
    storyId: string, 
    chapterId: string | number
  ): Promise<{ success: boolean; publicUrl?: string; error?: string }> {
    try {
      console.log(`[ImageGeneration] Uploading ${imageType} via Supabase invoke...`);

      const { data: functionResponse, error: functionError } = await supabase.functions.invoke(
        'upload-story-image',
        {
          body: {
            imageBase64,
            imageType,
            storyId,
            chapterId: chapterId.toString()
          }
        }
      );

      if (functionError) {
        console.error('[ImageGeneration] Function error:', functionError);
        throw new Error(`Function error: ${functionError.message}`);
      }

      if (!functionResponse?.success) {
        const errorMsg = functionResponse?.error || functionResponse?.details || 'Unknown upload error';
        throw new Error(`Upload failed: ${errorMsg}`);
      }

      console.log(`[ImageGeneration] Successfully uploaded ${imageType}:`, functionResponse.publicUrl);

      return {
        success: true,
        publicUrl: functionResponse.publicUrl
      };
      
    } catch (error) {
      console.error('[ImageGeneration] Upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de subida'
      };
    }
  }
} 