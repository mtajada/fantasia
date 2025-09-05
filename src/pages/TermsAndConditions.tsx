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
                TÉRMINOS Y CONDICIONES DE USO – USUARIOS DE FANTASIA
              </h1>
              <p className="text-sm sm:text-base text-gray-400 mt-2">Última actualización: 23 de abril, 2025</p>
            </div>

            <div className="space-y-8 bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl ring-1 ring-gray-700/50">
              <p className="text-gray-200 text-base sm:text-lg leading-relaxed">
                Estos Términos y Condiciones rigen el acceso, navegación y uso de los servicios ofrecidos a través de la plataforma "Fantasia" (en adelante, la "Plataforma"), propiedad de Fantasia, con sede en San Francisco, CA, y correo de contacto hola@fantasia.app.
              </p>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-violet-400 mb-4">1. PROPÓSITO</h2>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  Estos Términos establecen los derechos y obligaciones de los Usuarios y Fantasia respecto al acceso y uso de la Plataforma, que permite la generación de historias personalizadas para adultos a través de Inteligencia Artificial.
                </p>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-violet-400 mb-4">2. DESCRIPCIÓN DEL SERVICIO</h2>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  Fantasia es una aplicación web diseñada para crear, editar y escuchar historias personalizadas para adultos, aprovechando tecnologías de IA. Los usuarios pueden:
                </p>
                <p className="mt-3 text-gray-300 text-base sm:text-lg leading-relaxed">
                  Generar historias basadas en parámetros (preferencias, tema, estilo).
                </p>
                <p className="mt-3 text-gray-300 text-base sm:text-lg leading-relaxed">
                  Guardar y gestionar su biblioteca de historias.
                </p>
                <p className="mt-3 text-gray-300 text-base sm:text-lg leading-relaxed">
                  Recibir notificaciones por correo con enlaces a sus creaciones.
                </p>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-violet-400 mb-4">3. ACCESO Y REGISTRO</h2>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  Cuenta de Usuario: Para usar Fantasia, se requiere registro proporcionando un correo válido y contraseña.
                </p>
                <p className="mt-3 text-gray-300 text-base sm:text-lg leading-relaxed">
                  Veracidad de Datos: Los usuarios garantizan que la información proporcionada es verídica y actual. En caso de cambios, deben actualizar los datos de su perfil.
                </p>
                <p className="mt-3 text-gray-300 text-base sm:text-lg leading-relaxed">
                  Edad Mínima: Solo usuarios de 18 años o más pueden registrarse. Esta plataforma contiene contenido para adultos y es estrictamente para audiencias maduras.
                </p>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-violet-400 mb-4">4. LICENCIA DE USO</h2>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  Fantasia otorga a los Usuarios una licencia limitada, revocable, no exclusiva y no transferible para uso personal y no comercial de la Plataforma.
                  Está prohibido lo siguiente:
                </p>
                <p className="mt-3 text-gray-300 text-base sm:text-lg leading-relaxed">
                  Copiar, distribuir o modificar el software de la Plataforma.
                </p>
                <p className="mt-3 text-gray-300 text-base sm:text-lg leading-relaxed">
                  Descompilar, realizar ingeniería inversa o extraer código.
                </p>
                <p className="mt-3 text-gray-300 text-base sm:text-lg leading-relaxed">
                  Compartir credenciales de acceso con terceros.
                </p>
                <p className="mt-3 text-gray-300 text-base sm:text-lg leading-relaxed">
                  Uso comercial de los servicios sin autorización expresa por escrito.
                </p>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-violet-400 mb-4">5. CUENTA, CONTRASEÑA Y SEGURIDAD</h2>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  Los usuarios son responsables de mantener la confidencialidad de su contraseña y todas las actividades realizadas bajo su cuenta. En caso de uso no autorizado, deben notificar inmediatamente a hola@fantasia.app.
                </p>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-violet-400 mb-4">6. NOTIFICACIONES</h2>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  Todas las comunicaciones e información relevante (actualizaciones, enlaces de descarga, cambios a estos Términos) serán enviados a la dirección de correo registrada. Los usuarios deben mantenerla actualizada.
                </p>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-violet-400 mb-4">7. REQUISITOS TÉCNICOS</h2>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  Para acceder a Fantasia, se requiere lo siguiente:
                </p>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  Dispositivo con conexión a Internet.
                </p>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  Navegador web actualizado (Chrome, Firefox, Edge, Safari).
                  Fantasia no garantiza el funcionamiento adecuado en navegadores o dispositivos incompatibles.
                </p>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-violet-400 mb-4">8. PROPIEDAD INTELECTUAL</h2>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  Historias Generadas: Los usuarios conservan todos los derechos de propiedad intelectual sobre las historias que generen. Fantasia no reclama derechos sobre dicho contenido.
                </p>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  Plataforma y Contenidos: El software, diseño, logos, marcas comerciales y documentación de Fantasia son propiedad exclusiva de Fantasia y están protegidos por regulaciones de propiedad intelectual. Su uso sin autorización está prohibido.
                </p>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-violet-400 mb-4">9. EXENCIÓN DE GARANTÍA Y LIMITACIÓN DE RESPONSABILIDAD</h2>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  Fantasia proporciona la Plataforma "tal como está" y "según disponibilidad".
                </p>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  No garantiza continuidad, puntualidad o ausencia de errores.
                </p>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  No será responsable por daños directos o indirectos derivados del uso o imposibilidad de uso de la Plataforma, ni por pérdida de datos.
                </p>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-violet-400 mb-4">10. POLÍTICA DE PRIVACIDAD</h2>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  El procesamiento de datos personales se realiza de acuerdo con la Política de Privacidad disponible en nuestro sitio web. Los usuarios pueden ejercer sus derechos de acceso, rectificación, eliminación y oposición enviando un correo a hola@fantasia.app.
                </p>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-violet-400 mb-4">11. MODIFICACIONES A LOS TÉRMINOS</h2>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  Fantasia se reserva el derecho de modificar estos Términos en cualquier momento. Los cambios serán notificados por correo o mediante aviso en la Plataforma. Si los Usuarios no están de acuerdo, pueden cancelar su cuenta y dejar de usar el servicio.
                </p>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-violet-400 mb-4">12. LEY APLICABLE Y JURISDICCIÓN</h2>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  Estos Términos se rigen por la ley del estado de California. Para cualquier disputa, las partes se someten a la jurisdicción de los Tribunales de San Francisco, California, renunciando a cualquier otra jurisdicción.
                </p>
              </div>

              <p className="italic text-gray-400 text-center mt-8 text-lg">
                ¡Gracias por elegir Fantasia! Estamos aquí para acompañarte en la creación de historias inolvidables. ✨
              </p>
            </div>

            <div className="flex justify-center mt-8">
              <Button
                variant="default"
                onClick={() => navigate(-1)}
                className="min-w-32 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-violet-500/25 transition-all px-8 py-3"
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

export default TermsAndConditions; 