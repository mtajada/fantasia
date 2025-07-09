import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import PageTransition from "../components/PageTransition";
import { motion } from 'framer-motion';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div 
        className="min-h-screen relative pb-24 flex flex-col items-center justify-start"
        style={{
          backgroundColor: 'black',
        }}
      >
        <div className="w-full max-w-4xl mx-auto pt-8 px-4 sm:px-6 flex-1 flex flex-col">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
                PRIVACY POLICY
              </h1>
              <p className="text-sm text-gray-400 mt-2">Last updated: January 9, 2025</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6 bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-2xl ring-1 ring-gray-700/50"
            >
              <p className="font-medium text-gray-200 text-lg leading-relaxed">
                Privacy Summary: At Fantasia, we value your trust and are committed to protecting your personal data. We collect only the essential information needed to provide our AI-powered adult storytelling service, store it under strict security measures, and give you complete control over its use. Below, we explain clearly and transparently how we handle your data.
              </p>

              <div>
                <h2 className="text-xl font-bold text-violet-400 mb-3">1. DATA CONTROLLER</h2>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Fantasia (hereinafter, "Fantasia"), with address in San Francisco, CA, and contact email hello@fantasia.app, is the entity responsible for processing your personal data when you use the Fantasia platform.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-violet-400 mb-3">2. WHAT DATA DO WE COLLECT AND WHY?</h2>
                <p className="mt-2 font-medium text-gray-200">2.1 Data Provided by Users</p>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Registration: name, email address, password.
                </p>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Profile and preferences: adult content preferences, favorite themes, language, and story style.
                </p>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Communication: messages or inquiries sent through our forms or email.
                </p>
                
                <p className="mt-4 font-medium text-gray-200">2.2 Technical and Usage Data</p>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  IP address, browser type, device, operating system.
                </p>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Pages visited, session duration, actions performed (story generation, editing, audio playback).
                </p>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Cookies and similar technologies to improve experience and personalize content.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-violet-400 mb-3">3. PURPOSES OF DATA PROCESSING</h2>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  We use your data to:
                </p>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Manage your account and access to Fantasia.
                </p>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Generate, save, and deliver the adult stories you request through our platform.
                </p>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Send email notifications about your creations, platform updates, and new features.
                </p>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Provide technical support and customer service.
                </p>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Comply with legal and security obligations.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-violet-400 mb-3">4. COOKIES AND SIMILAR TECHNOLOGIES</h2>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  To optimize your experience and analyze Fantasia usage, we use our own and third-party cookies. You can manage or disable cookies through your browser settings; please note this may affect service functionality. Check our Cookie Policy for more information.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-violet-400 mb-3">5. DATA SECURITY</h2>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  We implement technical and organizational measures (HTTPS encryption, access controls, backups) to protect your data against unauthorized access, alterations, or loss. We recommend logging out when using shared devices and keeping your password secure. Given the sensitive nature of adult content, we apply enhanced privacy protections.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-violet-400 mb-3">6. THIRD-PARTY LINKS</h2>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Fantasia may include links to third-party websites or services. We are not responsible for the privacy practices or content of these external sites, so we advise you to read their own privacy policies.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-violet-400 mb-3">7. YOUR RIGHTS AND HOW TO EXERCISE THEM</h2>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  You have the right to:
                </p>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Access your personal data.
                </p>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Rectify inaccurate or incomplete data.
                </p>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Delete your data (right to be forgotten).
                </p>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Limit or object to certain processing activities.
                </p>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Data portability.
                </p>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Withdraw your consent at any time, without affecting the lawfulness of previous processing.
                </p>
                <p className="mt-4 text-gray-300 leading-relaxed">
                  To exercise these rights, you can:
                </p>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Access your profile and modify your data.
                </p>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Send an email to hello@fantasia.app with subject "Data Protection" clearly indicating which right you wish to exercise.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-violet-400 mb-3">8. AGE RESTRICTIONS</h2>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Fantasia is designed exclusively for adults aged 18 and over. Our platform contains adult content and is not suitable for minors. By using our service, you confirm that you are at least 18 years old and legally able to access adult content in your jurisdiction.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-violet-400 mb-3">9. DATA RETENTION</h2>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  We will retain your data while you maintain an active account on Fantasia and, once cancelled, for the time necessary to comply with legal obligations (e.g., tax, legal requirements), unless you request deletion earlier.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-violet-400 mb-3">10. CHANGES TO THIS POLICY</h2>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  We may update this Privacy Policy to adapt to legal changes or service improvements. We will inform you of relevant changes through a notice on the platform or by email before they take effect.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-violet-400 mb-3">11. CONTACT AND COMPLAINTS</h2>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  If you have questions, inquiries, or complaints about data processing, you can write to us at hello@fantasia.app. You also have the right to file a complaint with the California Attorney General's Privacy Office if you believe your rights have not been properly addressed.
                </p>
              </div>

              <p className="italic text-gray-400 text-center mt-8">
                Thank you for trusting Fantasia. Your privacy and discretion are our highest priorities.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex justify-center mt-8"
            >
              <Button 
                variant="default" 
                onClick={() => navigate(-1)}
                className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:scale-105"
              >
                Back
              </Button>
            </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default PrivacyPolicy; 