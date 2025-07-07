import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import PageTransition from "../components/PageTransition";
import { Mail, MapPin, Heart } from 'lucide-react';

const Contact: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div
        className="min-h-screen flex flex-col"
        style={{
          backgroundColor: 'black',
        }}
      >
        <div className="container mx-auto py-8 px-4 flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-[#222]">Contacto</h1>
            </div>

            <div className="space-y-8 bg-white/80 p-8 rounded-2xl backdrop-blur-sm shadow-lg">
              <div className="flex flex-col items-center text-center space-y-8">
                <div className="flex flex-col items-center">
                  <Mail className="h-10 w-10 text-[#BB79D1] mb-2" />
                  <h2 className="text-xl font-bold text-[#555]">Correo electrónico</h2>
                  <a
                    href="mailto:hello@fantasia.app"
                    className="text-lg text-[#BB79D1] hover:text-[#A5D6F6] transition-colors"
                  >
                    hello@fantasia.app
                  </a>
                </div>

                <div className="flex flex-col items-center">
                  <MapPin className="h-10 w-10 text-[#BB79D1] mb-2" />
                  <h2 className="text-xl font-bold text-[#555]">Ubicación</h2>
                  <p className="text-lg">Zaragoza, España</p>
                </div>

                <div className="pt-8 border-t border-gray-200/50 w-3/4 mx-auto">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center mb-2">
                      <span className="text-xl font-bold text-[#555] mr-2">Hecho con</span>
                      <Heart className="h-6 w-6 text-[#F6A5B7] fill-[#F6A5B7]" />
                      <span className="text-xl font-bold text-[#555] ml-2">por:</span>
                    </div>
                    <p className="text-lg text-center">
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <Button
                variant="default"
                onClick={() => navigate(-1)}
                className="min-w-32"
              >
                Volver
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Contact; 