import { ReactNode } from "react";
import Footer from "./Footer";

interface MainLayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
}

export default function MainLayout({ children, hideFooter = false }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {children}
      </main>
      
      {!hideFooter && <Footer />}
    </div>
  );
} 