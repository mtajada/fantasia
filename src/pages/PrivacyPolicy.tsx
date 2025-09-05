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
                POLÍTICA DE PRIVACIDAD
              </h1>
              <p className="text-sm text-gray-400 mt-2">Última actualización: 9 de enero, 2025</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6 bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-2xl ring-1 ring-gray-700/50"
            >
              <p className="font-medium text-gray-200 text-lg leading-relaxed">
                Resumen de Privacidad: En Fantasia, valoramos tu confianza y estamos comprometidos en proteger tus datos personales, cariño. Recopilamos únicamente la información esencial necesaria para brindarte nuestro servicio de historias sensuales impulsado por IA, la almacenamos bajo estrictas medidas de seguridad, y te damos control completo sobre su uso. A continuación, te explicamos clara y transparentemente cómo manejamos tu información.
              </p>

              <div>
                <h2 className="text-xl font-bold text-violet-400 mb-3">1. RESPONSABLE DEL TRATAMIENTO</h2>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Fantasia (en adelante, "Fantasia"), con domicilio en San Francisco, CA, y correo de contacto hello@fantasia.app, es la entidad responsable del tratamiento de tus datos personales cuando usas la plataforma Fantasia, amor.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-violet-400 mb-3">2. ¿QUÉ DATOS RECOPILAMOS Y POR QUÉ?</h2>
                <p className="mt-2 font-medium text-gray-200">2.1 Datos Proporcionados por Usuaries</p>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Registro: nombre, dirección de correo electrónico, contraseña.
                </p>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Perfil y preferencias: preferencias de contenido adulto, temas favoritos, idioma y estilo de historias sensuales.
                </p>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Comunicación: mensajes o consultas enviadas a través de nuestros formularios o correo electrónico.
                </p>
                
                <p className="mt-4 font-medium text-gray-200">2.2 Datos Técnicos y de Uso</p>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Dirección IP, tipo de navegador, dispositivo, sistema operativo.
                </p>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Páginas visitadas, duración de la sesión, acciones realizadas (generación de historias, edición, reproducción de audio).
                </p>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Cookies y tecnologías similares para mejorar la experiencia y personalizar el contenido.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-violet-400 mb-3">3. FINALIDADES DEL TRATAMIENTO DE DATOS</h2>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Usamos tus datos para:
                </p>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Gestionar tu cuenta y acceso a Fantasia.
                </p>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Generar, guardar y entregarte las historias sensuales que solicitas a través de nuestra plataforma.
                </p>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Enviar notificaciones por correo sobre tus creaciones, actualizaciones de la plataforma y nuevas funciones tentadoras.
                </p>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Brindar soporte técnico y atención al cliente.
                </p>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Cumplir con obligaciones legales y de seguridad.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-violet-400 mb-3">4. COOKIES Y TECNOLOGÍAS SIMILARES</h2>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Para optimizar tu experiencia y analizar el uso de Fantasia, utilizamos cookies propias y de terceros. Puedes gestionar o desactivar las cookies a través de la configuración de tu navegador; ten en cuenta que esto puede afectar la funcionalidad del servicio. Consulta nuestra Política de Cookies para más información, cariño.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-violet-400 mb-3">5. SEGURIDAD DE DATOS</h2>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Implementamos medidas técnicas y organizativas (cifrado HTTPS, controles de acceso, copias de seguridad) para proteger tus datos contra accesos no autorizados, alteraciones o pérdidas. Te recomendamos cerrar sesión al usar dispositivos compartidos y mantener tu contraseña segura. Dada la naturaleza sensual de nuestro contenido, aplicamos protecciones de privacidad mejoradas para tu discreción, amor.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-violet-400 mb-3">6. ENLACES A TERCEROS</h2>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Fantasia puede incluir enlaces a sitios web o servicios de terceros. No somos responsables de las prácticas de privacidad o contenido de estos sitios externos, por lo que te aconsejamos leer sus propias políticas de privacidad, cariño.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-violet-400 mb-3">7. TUS DERECHOS Y CÓMO EJERCERLOS</h2>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Tienes derecho a:
                </p>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Acceder a tus datos personales.
                </p>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Rectificar datos inexactos o incompletos.
                </p>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Eliminar tus datos (derecho al olvido).
                </p>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Limitar u oponerte a ciertas actividades de tratamiento.
                </p>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Portabilidad de datos.
                </p>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Retirar tu consentimiento en cualquier momento, sin afectar la legalidad del tratamiento previo.
                </p>
                <p className="mt-4 text-gray-300 leading-relaxed">
                  Para ejercer estos derechos, puedes:
                </p>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Acceder a tu perfil y modificar tus datos.
                </p>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Enviar un correo a hello@fantasia.app con asunto "Protección de Datos" indicando claramente qué derecho deseas ejercer.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-violet-400 mb-3">8. RESTRICCIONES DE EDAD</h2>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Fantasia está diseñada exclusivamente para adultos de 18 años en adelante. Nuestra plataforma contiene contenido sensual y no es apropiada para menores. Al usar nuestro servicio, confirmas que tienes al menos 18 años y puedes acceder legalmente a contenido adulto en tu jurisdicción, amor.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-violet-400 mb-3">9. RETENCIÓN DE DATOS</h2>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Conservaremos tus datos mientras mantengas una cuenta activa en Fantasia y, una vez cancelada, por el tiempo necesario para cumplir con obligaciones legales (ej. fiscales, requisitos legales), a menos que solicites su eliminación antes, cariño.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-violet-400 mb-3">10. CAMBIOS A ESTA POLÍTICA</h2>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Podemos actualizar esta Política de Privacidad para adaptarnos a cambios legales o mejoras del servicio. Te informaremos de cambios relevantes a través de un aviso en la plataforma o por correo antes de que entren en vigor.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-violet-400 mb-3">11. CONTACTO Y QUEJAS</h2>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Si tienes preguntas, consultas o quejas sobre el tratamiento de datos, puedes escribirnos a hello@fantasia.app. También tienes derecho a presentar una queja ante la Oficina de Privacidad del Fiscal General de California si consideras que tus derechos no han sido atendidos adecuadamente.
                </p>
              </div>

              <p className="italic text-gray-400 text-center mt-8">
                Gracias por confiar en Fantasia, cariño. Tu privacidad y discreción son nuestras máximas prioridades.
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
                Volver
              </Button>
            </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default PrivacyPolicy; 