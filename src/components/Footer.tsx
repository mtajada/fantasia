import { Link } from "react-router-dom";
import { APP_CONFIG } from "../config/app";

export default function Footer() {
  return (
    <footer className="w-full bg-white/80 py-3 md:py-4 backdrop-blur-sm mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-2 md:mb-0">
          <img src="/logo_png.png" alt="TaleMe Logo" className="h-12 md:h-14" />
        </div>
        
        <div className="text-[#555] text-xs text-center md:text-left mb-2 md:mb-0">
          <div>
            &copy; {new Date().getFullYear()} TaleMe!. Todos los derechos reservados.
          </div>
          <div className="text-[#777] text-xs mt-1 text-center">
            v{APP_CONFIG.version}
          </div>
        </div>
        
        <div className="mt-2 md:mt-0 flex gap-4">
          <Link to={APP_CONFIG.footerLinks.terms} className="text-[#BB79D1] hover:text-[#A5D6F6] transition-colors text-sm">Términos</Link>
          <Link to={APP_CONFIG.footerLinks.privacy} className="text-[#BB79D1] hover:text-[#A5D6F6] transition-colors text-sm">Privacidad</Link>
          <Link to={APP_CONFIG.footerLinks.contact} className="text-[#BB79D1] hover:text-[#A5D6F6] transition-colors text-sm">Contacto</Link>
          <Link to={APP_CONFIG.footerLinks.changelog} className="text-[#BB79D1] hover:text-[#A5D6F6] transition-colors text-sm">Changelog</Link>
        </div>
      </div>
    </footer>
  );
} 