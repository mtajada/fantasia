import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useUserStore } from "../store/user/userStore";
import { User } from "../types";

interface AuthGuardProps {
  children: React.ReactNode;
}

type AuthStatus = 'pending' | 'authenticated' | 'unauthenticated';

export default function AuthGuard({ children }: AuthGuardProps) {
  const { checkAuth, intendedRedirectPath } = useUserStore(state => ({
    checkAuth: state.checkAuth,
    intendedRedirectPath: state.intendedRedirectPath,
  }));
  const set = useUserStore.setState;

  const [authStatus, setAuthStatus] = useState<AuthStatus>('pending');
  const [checkedUser, setCheckedUser] = useState<User | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const verifyAuth = async () => {
      console.log("AuthGuard: Verificando autenticación...");
      const userResult = await checkAuth();
      console.log("AuthGuard: Verificación de autenticación completada. Usuario:", userResult ? userResult.id : 'null');
      if (isMounted) {
        setCheckedUser(userResult);
        setAuthStatus(userResult ? 'authenticated' : 'unauthenticated');
      }
    };

    verifyAuth();

    return () => { isMounted = false; };
  }, [checkAuth]);

  useEffect(() => {
    if (authStatus === 'pending') {
      console.log("AuthGuard Redirect Effect: Esperando a que complete la verificación de autenticación...");
      return;
    }

    console.log(`AuthGuard Redirect Effect: Evaluando estado - Estado: ${authStatus}, Destino previsto: ${intendedRedirectPath}, Actual: ${location.pathname}`);

    if (intendedRedirectPath && intendedRedirectPath !== location.pathname) {
      console.log(`AuthGuard Redirect Effect: Redirigiendo desde ${location.pathname} a la ruta prevista: ${intendedRedirectPath}`);
      set({ intendedRedirectPath: null });
      navigate(intendedRedirectPath, { replace: true });
    }
    else if (intendedRedirectPath && intendedRedirectPath === location.pathname) {
      console.log(`AuthGuard Redirect Effect: Ya en la ruta prevista ${intendedRedirectPath}. Reiniciando bandera.`);
      set({ intendedRedirectPath: null });
    }
  }, [authStatus, intendedRedirectPath, location.pathname, navigate, set]);

  if (authStatus === 'pending') {
    console.log(`AuthGuard Render: Verificación de autenticación en progreso. Mostrando cargador.`);
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-white rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (intendedRedirectPath && intendedRedirectPath !== location.pathname) {
    console.log(`AuthGuard Render: Redirección pendiente a ${intendedRedirectPath}. Esperando navegación.`);
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-white rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (authStatus === 'authenticated' && checkedUser) {
    console.log(`AuthGuard Render: Autenticación verificada, el usuario ${checkedUser.id} existe. Renderizando componentes hijos para ${location.pathname}.`);
    return <>{children}</>;
  }

  if (authStatus === 'unauthenticated') {
    console.log(`AuthGuard Render: Autenticación verificada, usuario no autenticado. Redirigiendo a /login.`);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.warn(`AuthGuard Render: Estado inesperado alcanzado (Estado: ${authStatus}, Usuario verificado: ${!!checkedUser}, Destino previsto: ${intendedRedirectPath}). Renderizando null o redirigiendo a error.`);
  return <Navigate to="/error" replace />;
}