import { useState } from 'react';
import { createCheckoutSession } from '../services/stripeService';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaymentButtonsProps {
  className?: string;
  showBoth?: boolean; // Si es false, solo muestra el botón de premium
}

export default function PaymentButtons({ className = '', showBoth = true }: PaymentButtonsProps) {
  const [isLoading, setIsLoading] = useState<'premium' | 'credits' | null>(null);
  const { toast } = useToast();

  const handlePurchase = async (item: 'premium' | 'credits') => {
    setIsLoading(item);
    
    try {
      const { url, error } = await createCheckoutSession(item);
      
      if (error) {
        toast({
          title: "Error al iniciar el pago",
          description: error,
          variant: "destructive"
        });
      } else if (url) {
        // Redirigir a Stripe Checkout
        console.log(`Redirigiendo a Stripe Checkout: ${url}`);
        window.location.href = url;
      } else {
        toast({
          title: "Error",
          description: "No se recibió una URL de pago válida.",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error inesperado",
        description: "Ocurrió un error al procesar la solicitud de pago.",
        variant: "destructive"
      });
      console.error(err);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className={`flex ${showBoth ? 'flex-col sm:flex-row' : 'flex-col'} gap-3 ${className}`}>
      <Button 
        onClick={() => handlePurchase('premium')}
        disabled={isLoading !== null}
        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg shadow-md transition-all duration-300 flex items-center justify-center"
      >
        <Sparkles className="mr-2 h-5 w-5" />
        {isLoading === 'premium' ? 'Procesando...' : 'Suscripción Premium'}
      </Button>
      
      {showBoth && (
        <Button 
          onClick={() => handlePurchase('credits')}
          disabled={isLoading !== null}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium py-2 px-4 rounded-lg shadow-md transition-all duration-300 flex items-center justify-center"
        >
          <CreditCard className="mr-2 h-5 w-5" />
          {isLoading === 'credits' ? 'Procesando...' : 'Comprar Créditos de Voz'}
        </Button>
      )}
    </div>
  );
}
