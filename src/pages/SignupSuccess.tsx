import { useNavigate } from "react-router-dom";
import { CheckCircle, Mail, Sparkles } from "lucide-react";
import PageTransition from "../components/PageTransition";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function SignupSuccess() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{
          backgroundColor: 'black',
        }}
      >
        <div className="w-full max-w-lg mx-auto">
          <Card className="bg-gray-900/90 backdrop-blur-md border border-gray-800 shadow-2xl ring-1 ring-gray-700/50">
            <CardHeader className="text-center pb-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex justify-center mb-6"
              >
                <img src="/logo_fantasia.png" alt="Fantasia Logo" className="w-48 max-w-full" />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex justify-center mb-6"
              >
                <div className="relative">
                  <CheckCircle className="h-20 w-20 text-pink-500 mb-4" />
                  <Sparkles className="h-6 w-6 text-violet-400 absolute -top-2 -right-2 animate-pulse" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <CardTitle className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
                  Account Created! ✨
                </CardTitle>
                <CardDescription className="text-gray-300 text-center text-lg">
                  Welcome to your sensual adventure
                </CardDescription>
              </motion.div>
            </CardHeader>

            <CardContent className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Alert className="bg-violet-500/10 border-violet-500/20 text-violet-100">
                  <Mail className="h-5 w-5 text-violet-400" />
                  <AlertTitle className="text-violet-200 font-semibold mb-2">
                    📧 Check Your Email - Important!
                  </AlertTitle>
                  <AlertDescription className="text-violet-100/90 space-y-2">
                    <p className="font-medium">
                      We've sent you a confirmation email. You <span className="text-pink-400 font-semibold">must verify your email</span> before you can sign in.
                    </p>
                    <p className="text-sm">
                      🔍 Check your inbox (and spam folder) for the confirmation link.
                    </p>
                    <p className="text-sm font-medium text-violet-300">
                      Once confirmed, you'll be ready to explore! 🤫
                    </p>
                  </AlertDescription>
                </Alert>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="flex justify-center"
              >
                <button
                  onClick={() => navigate("/login")}
                  className="w-full py-4 rounded-2xl text-white text-lg font-semibold shadow-lg transition-all duration-200 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 transform hover:scale-105 shadow-violet-500/25"
                >
                  Got it, let's continue
                </button>
              </motion.div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
} 