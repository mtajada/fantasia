import { Link } from "react-router-dom";
import { APP_CONFIG } from "../config/app";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-900/90 py-3 md:py-4 backdrop-blur-sm mt-auto border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-2 md:mb-0">
          <img src="/logo_fantasia.png" alt="Fantasia Logo" className="h-12 md:h-14" />
        </div>

        <div className="text-gray-400 text-xs text-center md:text-left mb-2 md:mb-0">
          <div>
            &copy; {new Date().getFullYear()} Fantasia. Todos los derechos reservados.
          </div>
          <div className="text-gray-500 text-xs mt-1 text-center">
            v{APP_CONFIG.version}
          </div>
        </div>

        <div className="mt-2 md:mt-0 flex gap-4">
          <Link to={APP_CONFIG.footerLinks.terms} className="text-violet-400 hover:text-gray-50 transition-colors text-sm">Términos</Link>
          <Link to={APP_CONFIG.footerLinks.privacy} className="text-violet-400 hover:text-gray-50 transition-colors text-sm">Privacidad</Link>
          <Link to={APP_CONFIG.footerLinks.contact} className="text-violet-400 hover:text-gray-50 transition-colors text-sm">Contacto</Link>
          <Link to={APP_CONFIG.footerLinks.changelog} className="text-violet-400 hover:text-gray-50 transition-colors text-sm">Cambios</Link>
        </div>
      </div>
    </footer>
  );
} 