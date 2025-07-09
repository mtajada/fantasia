import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import PageTransition from "../components/PageTransition";
import { Mail, MapPin, Heart, AlertTriangle } from 'lucide-react';

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
            {/* Warning Note */}
            <div className="mb-6 bg-yellow-900/20 border border-yellow-600/40 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-yellow-400">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Note: We need to update this with a real email address</span>
              </div>
            </div>
            
            <div className="text-center mb-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">Contact</h1>
            </div>

            <div className="space-y-8 bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-2xl p-8 shadow-2xl ring-1 ring-gray-700/50">
              <div className="flex flex-col items-center text-center space-y-8">
                <div className="flex flex-col items-center">
                  <Mail className="h-10 w-10 text-violet-500 mb-2" />
                  <h2 className="text-xl font-bold text-gray-200">Email</h2>
                  <a
                    href="mailto:hello@fantasia.app"
                    className="text-lg text-violet-400 hover:text-pink-400 transition-colors"
                  >
                    hello@fantasia.app
                  </a>
                </div>

                <div className="flex flex-col items-center">
                  <MapPin className="h-10 w-10 text-pink-500 mb-2" />
                  <h2 className="text-xl font-bold text-gray-200">Location</h2>
                  <p className="text-lg text-gray-300">San Francisco, CA</p>
                </div>

                <div className="pt-8 border-t border-gray-700/50 w-3/4 mx-auto">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center mb-2">
                      <span className="text-xl font-bold text-gray-200 mr-2">Made with</span>
                      <Heart className="h-6 w-6 text-pink-500 fill-pink-500" />
                      <span className="text-xl font-bold text-gray-200 ml-2">by:</span>
                    </div>
                    <p className="text-lg text-center text-gray-300">
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <Button
                variant="default"
                onClick={() => navigate(-1)}
                className="min-w-32 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-violet-500/25 transition-all hover:scale-105"
              >
                Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Contact; 