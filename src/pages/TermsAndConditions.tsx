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
          backgroundImage: 'url(/fondo_png.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="container mx-auto py-8 px-4 flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-[#222]">TÉRMINOS Y CONDICIONES DE USO – USUARIOS DE TALEME!</h1>
              <p className="text-sm text-[#555] mt-2">Última actualización: 23 de abril de 2025</p>
            </div>

            <div className="space-y-6 bg-white/80 p-8 rounded-2xl backdrop-blur-sm shadow-lg">
              <p>
                Estos Términos y Condiciones regulan el acceso, la navegación y el uso de los servicios ofrecidos a través de la plataforma "TaleMe!" (en adelante, la "Plataforma"), titularidad de TaleMe!, con domicilio en Zaragoza, España, y correo electrónico de contacto hola@taleme.app.
              </p>

              <div>
                <h2 className="text-xl font-bold text-[#BB79D1]">1. OBJETO</h2>
                <p className="mt-2">
                  Estos Términos establecen los derechos y obligaciones de los Usuarios y de TaleMe! respecto al acceso y uso de la Plataforma, que permite la generación de cuentos infantiles mediante Inteligencia Artificial.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#BB79D1]">2. DESCRIPCIÓN DEL SERVICIO</h2>
                <p className="mt-2">
                  TaleMe! es una aplicación web diseñada para crear, editar y escuchar cuentos infantiles personalizados, aprovechando tecnologías de IA. El Usuario puede:
                </p>
                <p className="mt-2">
                  Generar relatos a partir de parámetros (edad, tema, estilo).
                </p>
                <p className="mt-2">
                  Guardar y gestionar su biblioteca de historias.
                </p>
                <p className="mt-2">
                  Recibir notificaciones por correo electrónico con enlaces a sus creaciones.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#BB79D1]">3. ACCESO Y REGISTRO</h2>
                <p className="mt-2">
                  Cuenta de Usuario: Para utilizar TaleMe! es necesario registrarse facilitando un email válido y una contraseña.
                </p>
                <p className="mt-2">
                  Veracidad de los Datos: El Usuario garantiza que la información proporcionada es veraz y actual. En caso de modificación, deberá actualizar sus datos en su perfil.
                </p>
                <p className="mt-2">
                  Edad Mínima: Solo pueden registrarse mayores de 14 años. Los menores deberán contar con el consentimiento de su padre, madre o tutor legal.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#BB79D1]">4. LICENCIA DE USO</h2>
                <p className="mt-2">
                  TaleMe! otorga al Usuario una licencia limitada, revocable, no exclusiva e intransferible para uso personal y no comercial de la Plataforma.
                  Queda prohibido:
                </p>
                <p className="mt-2">
                  Copiar, distribuir o modificar el software de la Plataforma.
                </p>
                <p className="mt-2">
                  Descompilar, realizar ingeniería inversa o extraer código.
                </p>
                <p className="mt-2">
                  Compartir credenciales de acceso con terceros.
                </p>
                <p className="mt-2">
                  Hacer un uso comercial de los servicios sin autorización expresa por escrito.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#BB79D1]">5. CUENTA, CONTRASEÑA Y SEGURIDAD</h2>
                <p className="mt-2">
                  El Usuario es responsable de mantener la confidencialidad de su contraseña y de todas las actividades que se realicen bajo su cuenta. En caso de uso no autorizado, deberá notificarlo de inmediato a hola@taleme.app.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#BB79D1]">6. NOTIFICACIONES</h2>
                <p className="mt-2">
                  Todas las comunicaciones e información relevante (novedades, enlaces de descarga, cambios en estos Términos) se enviarán al correo electrónico registrado. El Usuario debe mantenerlo actualizado.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#BB79D1]">7. REQUISITOS TÉCNICOS</h2>
                <p className="mt-2">
                  Para acceder a TaleMe! se requiere:
                </p>
                <p className="mt-2">
                  Dispositivo con conexión a Internet.
                </p>
                <p className="mt-2">
                  Navegador web actualizado (Chrome, Firefox, Edge, Safari).
                  TaleMe! no garantiza el correcto funcionamiento en navegadores o dispositivos no compatibles.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#BB79D1]">8. PROPIEDAD INTELECTUAL</h2>
                <p className="mt-2">
                  Relatos Generados: El Usuario conservará todos los derechos de propiedad intelectual sobre los cuentos que genere. TaleMe! no reivindica derechos sobre dichos contenidos.
                </p>
                <p className="mt-2">
                  Plataforma y Contenidos: El software, diseño, logos, marcas y documentación de TaleMe! son propiedad exclusiva de TaleMe! y están protegidos por la normativa de propiedad intelectual. Queda prohibido su uso sin autorización.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#BB79D1]">9. EXENCIÓN DE GARANTÍAS Y LIMITACIÓN DE RESPONSABILIDAD</h2>
                <p className="mt-2">
                  TaleMe! proporciona la Plataforma "tal cual" y "según disponibilidad".
                </p>
                <p className="mt-2">
                  No garantiza la continuidad, puntualidad o ausencia de errores.
                </p>
                <p className="mt-2">
                  No será responsable de daños directos o indirectos derivados del uso o imposibilidad de uso de la Plataforma, ni de la pérdida de datos.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#BB79D1]">10. POLÍTICA DE PRIVACIDAD</h2>
                <p className="mt-2">
                  El tratamiento de datos personales se realiza conforme a la Política de Privacidad disponible en nuestra web. El Usuario puede ejercer sus derechos de acceso, rectificación, supresión y oposición enviando un email a hola@taleme.app.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#BB79D1]">11. MODIFICACIONES DE LOS TÉRMINOS</h2>
                <p className="mt-2">
                  TaleMe! se reserva el derecho de modificar estos Términos en cualquier momento. Los cambios se notificarán por correo electrónico o mediante aviso en la Plataforma. Si el Usuario no está de acuerdo, podrá cancelar su cuenta y dejar de usar el servicio.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#BB79D1]">12. LEY APLICABLE Y JURISDICCIÓN</h2>
                <p className="mt-2">
                  Estos Términos se rigen por la legislación española. Para cualquier controversia, las partes se someten a la jurisdicción de los Juzgados y Tribunales de Zaragoza (España), con renuncia a cualquier otro fuero.
                </p>
              </div>

              <p className="italic">
                Gracias por elegir TaleMe! Estamos aquí para acompañarte en la creación de historias inolvidables.
              </p>
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

export default TermsAndConditions; 