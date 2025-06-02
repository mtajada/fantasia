import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Loader2, Heart } from "lucide-react";
import { PdfService } from "../services/pdfService";
import { APP_CONFIG } from "../config/app";

interface StoryPdfPreviewProps {
  title: string;
  author?: string;
  content: string;
  onClose?: () => void;
  isOpen: boolean;
}

export default function StoryPdfPreview({
  title,
  author,
  content,
  onClose,
  isOpen
}: StoryPdfPreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePreview, setActivePreview] = useState<'cover' | 'content' | 'backCover'>('cover');
  
  if (!isOpen) return null;
  
  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      // Generar PDF
      const pdfBlob = await PdfService.generateStoryPdf({
        title,
        author,
        content
      });
      
      // Descargar PDF
      const safeName = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
      PdfService.downloadPdf(pdfBlob, `taleme-cuento-${safeName}.pdf`);
      
      if (onClose) onClose();
    } catch (err) {
      console.error('Error generando PDF:', err);
      setError('Ocurrió un error al generar el PDF. Por favor intenta nuevamente.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Cabecera */}
        <div className="p-4 bg-[#BB79D1] text-white">
          <h2 className="text-xl font-bold">Generar PDF del cuento</h2>
        </div>
        
        {/* Cuerpo */}
        <div className="p-6">
          {/* Selector de vista previa */}
          <div className="flex justify-center space-x-3 mb-4">
            <button 
              className={`px-4 py-1 rounded-full transition-all ${activePreview === 'cover' 
                ? 'bg-[#BB79D1] text-white' 
                : 'bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => setActivePreview('cover')}
            >
              Portada
            </button>
            <button 
              className={`px-4 py-1 rounded-full transition-all ${activePreview === 'content' 
                ? 'bg-[#BB79D1] text-white' 
                : 'bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => setActivePreview('content')}
            >
              Contenido
            </button>
            <button 
              className={`px-4 py-1 rounded-full transition-all ${activePreview === 'backCover' 
                ? 'bg-[#BB79D1] text-white' 
                : 'bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => setActivePreview('backCover')}
            >
              Contraportada
            </button>
          </div>
          
          {/* Vista previa según la selección */}
          {activePreview === 'cover' && (
            <div className="mb-6 bg-[#fff6e0] p-4 rounded-lg border border-amber-200 h-80 flex flex-col justify-center">
              <div className="text-center">
                <img 
                  src="/logo_png.png" 
                  alt={APP_CONFIG.name} 
                  className="h-16 mx-auto mb-4"
                />
                <h3 className="text-xl font-bold text-[#BB79D1] mb-1">{title}</h3>
                {author && (
                  <p className="text-gray-600 italic">por {author}</p>
                )}
              </div>
            </div>
          )}
          
          {activePreview === 'content' && (
            <div className="mb-6 bg-[#fff6e0] p-4 rounded-lg border border-amber-200">
              <p className="text-sm text-gray-600 mb-2">
                Vista previa del contenido:
              </p>
              
              <div className="max-h-64 overflow-y-auto text-base border border-amber-100 p-3 rounded bg-white">
                {content.split("\n").slice(0, 5).map((paragraph, i) => (
                  <p key={i} className="mb-2 font-bold text-[#ce9789]">
                    {paragraph || "..."}
                  </p>
                ))}
                {content.split("\n").length > 5 && (
                  <p className="text-gray-400 italic text-sm text-center mt-2">
                    (más contenido no mostrado en la vista previa)
                  </p>
                )}
              </div>
            </div>
          )}
          
          {activePreview === 'backCover' && (
            <div className="mb-6 bg-[#fff6e0] p-4 rounded-lg border border-amber-200 h-80 flex flex-col justify-center">
              <div className="text-center">
                <img 
                  src="/logo_png.png" 
                  alt={APP_CONFIG.name} 
                  className="h-16 mx-auto mb-6"
                />
                <p className="text-[#BB79D1] font-bold mb-1 text-base">
                  Generado con <Heart className="inline h-4 w-4 mx-0.5 fill-[#BB79D1]" /> por
                </p>
                <h3 className="text-2xl font-bold text-[#ce9789] mb-4">{APP_CONFIG.name}!</h3>
                <p className="text-gray-500 text-sm">{new Date().getFullYear()}</p>
              </div>
            </div>
          )}
          
          {/* Información adicional */}
          <div className="bg-blue-50 p-3 rounded-lg mb-4 text-sm text-blue-700">
            <p className="mb-1">• El PDF incluirá portada, contenido y contraportada</p>
            <p className="mb-1">• Texto en formato amigable para niños</p>
            <p className="mb-1">• Encabezados con logo y título en cada página</p>
            <p>• Optimizado para impresión en papel tamaño A4</p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isGenerating}
            >
              Cancelar
            </Button>
            
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-[#F6A5B7] hover:bg-[#F6A5B7]/90"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando PDF...
                </>
              ) : (
                <>Descargar PDF</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 