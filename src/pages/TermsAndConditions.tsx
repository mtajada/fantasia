import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import PageTransition from "../components/PageTransition";

const TermsAndConditions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div
        className="min-h-screen flex flex-col"
        style={{
          backgroundColor: 'black',
        }}
      >
        <div className="w-full max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex-1 overflow-auto">
          <div className="w-full">
            <div className="text-center mb-8 sm:mb-12">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 mb-4 leading-tight">
                TERMS AND CONDITIONS OF USE – FANTASIA USERS
              </h1>
              <p className="text-sm sm:text-base text-gray-400 mt-2">Last updated: April 23, 2025</p>
            </div>

            <div className="space-y-8 bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl ring-1 ring-gray-700/50">
              <p className="text-gray-200 text-base sm:text-lg leading-relaxed">
                These Terms and Conditions govern access, navigation, and use of services offered through the "Fantasia" platform (hereinafter, the "Platform"), owned by Fantasia, with headquarters in Zaragoza, Spain, and contact email hola@fantasia.app.
              </p>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-violet-400 mb-4">1. PURPOSE</h2>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  These Terms establish the rights and obligations of Users and Fantasia regarding access and use of the Platform, which enables the generation of personalized adult stories through Artificial Intelligence.
                </p>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-violet-400 mb-4">2. SERVICE DESCRIPTION</h2>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  Fantasia is a web application designed to create, edit, and listen to personalized adult stories, leveraging AI technologies. Users can:
                </p>
                <p className="mt-3 text-gray-300 text-base sm:text-lg leading-relaxed">
                  Generate stories based on parameters (preferences, theme, style).
                </p>
                <p className="mt-3 text-gray-300 text-base sm:text-lg leading-relaxed">
                  Save and manage their library of stories.
                </p>
                <p className="mt-3 text-gray-300 text-base sm:text-lg leading-relaxed">
                  Receive email notifications with links to their creations.
                </p>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-violet-400 mb-4">3. ACCESS AND REGISTRATION</h2>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  User Account: To use Fantasia, registration is required by providing a valid email and password.
                </p>
                <p className="mt-3 text-gray-300 text-base sm:text-lg leading-relaxed">
                  Data Accuracy: Users guarantee that the information provided is truthful and current. In case of changes, they must update their profile data.
                </p>
                <p className="mt-3 text-gray-300 text-base sm:text-lg leading-relaxed">
                  Minimum Age: Only users 18 years and older may register. This platform contains adult content and is strictly for mature audiences.
                </p>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-violet-400 mb-4">4. LICENSE OF USE</h2>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  Fantasia grants Users a limited, revocable, non-exclusive, and non-transferable license for personal and non-commercial use of the Platform.
                  The following is prohibited:
                </p>
                <p className="mt-3 text-gray-300 text-base sm:text-lg leading-relaxed">
                  Copying, distributing, or modifying the Platform software.
                </p>
                <p className="mt-3 text-gray-300 text-base sm:text-lg leading-relaxed">
                  Decompiling, reverse engineering, or extracting code.
                </p>
                <p className="mt-3 text-gray-300 text-base sm:text-lg leading-relaxed">
                  Sharing access credentials with third parties.
                </p>
                <p className="mt-3 text-gray-300 text-base sm:text-lg leading-relaxed">
                  Commercial use of services without express written authorization.
                </p>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-violet-400 mb-4">5. ACCOUNT, PASSWORD AND SECURITY</h2>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  Users are responsible for maintaining the confidentiality of their password and all activities performed under their account. In case of unauthorized use, they must immediately notify hola@fantasia.app.
                </p>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-violet-400 mb-4">6. NOTIFICATIONS</h2>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  All communications and relevant information (updates, download links, changes to these Terms) will be sent to the registered email address. Users must keep it updated.
                </p>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-violet-400 mb-4">7. TECHNICAL REQUIREMENTS</h2>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  To access Fantasia, the following is required:
                </p>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  Device with Internet connection.
                </p>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  Updated web browser (Chrome, Firefox, Edge, Safari).
                  Fantasia does not guarantee proper functioning on incompatible browsers or devices.
                </p>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-violet-400 mb-4">8. INTELLECTUAL PROPERTY</h2>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  Generated Stories: Users retain all intellectual property rights over the stories they generate. Fantasia does not claim rights over such content.
                </p>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  Platform and Contents: The software, design, logos, trademarks, and documentation of Fantasia are the exclusive property of Fantasia and are protected by intellectual property regulations. Use without authorization is prohibited.
                </p>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-violet-400 mb-4">9. WARRANTY EXEMPTION AND LIMITATION OF LIABILITY</h2>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  Fantasia provides the Platform "as is" and "as available".
                </p>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  It does not guarantee continuity, punctuality, or absence of errors.
                </p>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  It will not be responsible for direct or indirect damages arising from the use or inability to use the Platform, nor for data loss.
                </p>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-violet-400 mb-4">10. PRIVACY POLICY</h2>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  Personal data processing is conducted in accordance with the Privacy Policy available on our website. Users can exercise their rights of access, rectification, deletion, and opposition by sending an email to hola@fantasia.app.
                </p>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-violet-400 mb-4">11. MODIFICATIONS TO THE TERMS</h2>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  Fantasia reserves the right to modify these Terms at any time. Changes will be notified by email or through notice on the Platform. If Users disagree, they may cancel their account and stop using the service.
                </p>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-violet-400 mb-4">12. APPLICABLE LAW AND JURISDICTION</h2>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  These Terms are governed by Spanish legislation. For any dispute, the parties submit to the jurisdiction of the Courts and Tribunals of Zaragoza (Spain), waiving any other jurisdiction.
                </p>
              </div>

              <p className="italic text-gray-400 text-center mt-8 text-lg">
                Thank you for choosing Fantasia! We're here to accompany you in creating unforgettable stories. ✨
              </p>
            </div>

            <div className="flex justify-center mt-8">
              <Button
                variant="default"
                onClick={() => navigate(-1)}
                className="min-w-32 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-violet-500/25 transition-all px-8 py-3"
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

export default TermsAndConditions; 