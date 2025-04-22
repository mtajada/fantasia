import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import PageTransition from "../components/PageTransition";

const PrivacyPolicy: React.FC = () => {
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
              <h1 className="text-3xl font-bold text-[#222]">POLÍTICA DE PRIVACIDAD DE TaleMe!</h1>
              <p className="text-sm text-[#555] mt-2">Última actualización: 23 de abril de 2025</p>
            </div>

            <div className="space-y-6 bg-white/80 p-8 rounded-2xl backdrop-blur-sm shadow-lg">
              <p className="font-medium">
                Resumen de privacidad: En TaleMe! valoramos tu confianza y nos comprometemos a proteger tus datos personales. Recopilamos únicamente la información imprescindible para ofrecerte nuestro servicio de generación de cuentos infantiles con Inteligencia Artificial, la almacenamos bajo estrictas medidas de seguridad y te damos control absoluto sobre su uso. A continuación, te explicamos de forma clara y transparente cómo tratamos tus datos.
              </p>

              <div>
                <h2 className="text-xl font-bold text-[#BB79D1]">1. RESPONSABLE DEL TRATAMIENTO</h2>
                <p className="mt-2">
                  TaleMe! (en adelante, "TaleMe!"), con domicilio en Zaragoza, España, y correo electrónico de contacto hola@taleme.app, es la entidad responsable del tratamiento de tus datos personales cuando utilizas la plataforma TaleMe!.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#BB79D1]">2. ¿QUÉ DATOS RECOPILAMOS Y POR QUÉ?</h2>
                <p className="mt-2 font-medium">2.1 Datos facilitados por el Usuario</p>
                <p className="mt-2">
                  Registro: nombre, dirección de correo electrónico, contraseña.
                </p>
                <p className="mt-2">
                  Perfil y preferencias: edad del niño o niña, temas favoritos, idioma y estilo de cuento.
                </p>
                <p className="mt-2">
                  Comunicación: mensajes o consultas que envíes a través de nuestro formulario o correo.
                </p>
                
                <p className="mt-4 font-medium">2.2 Datos técnicos y de uso</p>
                <p className="mt-2">
                  Dirección IP, tipo de navegador, dispositivo, sistema operativo.
                </p>
                <p className="mt-2">
                  Páginas visitadas, duración de la sesión, acciones realizadas (generación, edición, descarga de cuentos).
                </p>
                <p className="mt-2">
                  Cookies y tecnologías similares para mejorar la experiencia y personalizar contenidos.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#BB79D1]">3. FINALIDADES DEL TRATAMIENTO</h2>
                <p className="mt-2">
                  Utilizamos tus datos para:
                </p>
                <p className="mt-2">
                  Gestionar tu cuenta y acceso a TaleMe!.
                </p>
                <p className="mt-2">
                  Generar, guardar y entregar por email los cuentos infantiles que solicites.
                </p>
                <p className="mt-2">
                  Enviar notificaciones por correo electrónico sobre el estado de tus creaciones, novedades y mejoras de la plataforma.
                </p>
                <p className="mt-2">
                  Prestar soporte técnico y atención al cliente.
                </p>
                <p className="mt-2">
                  Cumplir con obligaciones legales y de seguridad.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#BB79D1]">4. COOKIES Y TECNOLOGÍAS SIMILARES</h2>
                <p className="mt-2">
                  Para optimizar tu experiencia y analizar el uso de TaleMe!, empleamos cookies propias y de terceros. Puedes gestionar o desactivar las cookies desde la configuración de tu navegador; ten en cuenta que ello podría afectar la funcionalidad del servicio. Consulta nuestra Política de Cookies para más información.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#BB79D1]">5. SEGURIDAD DE TUS DATOS</h2>
                <p className="mt-2">
                  Implementamos medidas técnicas y organizativas (cifrado HTTPS, controles de acceso, backups) para proteger tus datos contra accesos no autorizados, alteraciones o pérdida. Recomendamos cerrar sesión cuando uses dispositivos compartidos y mantener tu contraseña en un lugar seguro.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#BB79D1]">6. ENLACES A TERCEROS</h2>
                <p className="mt-2">
                  TaleMe! puede incluir enlaces a sitios web o servicios de terceros. No somos responsables de las prácticas de privacidad ni del contenido de estas webs externas, por lo que te aconsejamos leer sus propias políticas de privacidad.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#BB79D1]">7. TUS DERECHOS Y CÓMO EJERCERLOS</h2>
                <p className="mt-2">
                  Tienes derecho a:
                </p>
                <p className="mt-2">
                  Acceder a tus datos personales.
                </p>
                <p className="mt-2">
                  Rectificar datos inexactos o incompletos.
                </p>
                <p className="mt-2">
                  Eliminar tus datos (derecho al olvido).
                </p>
                <p className="mt-2">
                  Limitar u oponerte a ciertos tratamientos.
                </p>
                <p className="mt-2">
                  Portabilidad de tus datos.
                </p>
                <p className="mt-2">
                  Retirar tu consentimiento en cualquier momento, sin que ello afecte la licitud del tratamiento previo.
                </p>
                <p className="mt-4">
                  Para ejercerlos, puedes:
                </p>
                <p className="mt-2">
                  Acceder a tu perfil y modificar tus datos.
                </p>
                <p className="mt-2">
                  Enviar un email a hola@taleme.app con asunto "Protección de Datos" e indicando claramente qué derecho deseas ejercer.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#BB79D1]">8. USO DEL SERVICIO POR MENORES</h2>
                <p className="mt-2">
                  TaleMe! está pensado para la creación de cuentos infantiles a iniciativa de un adulto responsable. Los menores de 14 años deberán contar con el consentimiento de su padre, madre o tutor legal para la recogida y tratamiento de sus datos.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#BB79D1]">9. CONSERVACIÓN DE LOS DATOS</h2>
                <p className="mt-2">
                  Conservaremos tus datos mientras mantengas una cuenta activa en TaleMe! y, una vez cancelada, durante el tiempo necesario para cumplir con obligaciones legales (p. ej., fiscales), salvo que solicites su supresión antes.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#BB79D1]">10. CAMBIOS EN ESTA POLÍTICA</h2>
                <p className="mt-2">
                  Podemos actualizar esta Política de Privacidad para adaptarla a novedades legales o mejoras de servicio. Te informaremos de los cambios relevantes a través de un aviso en la plataforma o por correo electrónico antes de que entren en vigor.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#BB79D1]">11. CONTACTO Y RECLAMACIONES</h2>
                <p className="mt-2">
                  Si tienes dudas, consultas o reclamaciones sobre el tratamiento de tus datos, puedes escribirnos a hola@taleme.app. También tienes derecho a presentar una reclamación ante la Agencia Española de Protección de Datos si consideras que tus derechos no se han atendido correctamente.
                </p>
              </div>

              <p className="italic">
                Gracias por confiar en TaleMe! Tu privacidad y la de los más pequeños son nuestra máxima prioridad.
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

export default PrivacyPolicy; 