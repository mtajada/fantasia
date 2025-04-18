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
      console.log("AuthGuard: Verifying authentication...");
      const userResult = await checkAuth();
      console.log("AuthGuard: Authentication check completed. User:", userResult ? userResult.id : 'null');
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
      console.log("AuthGuard Redirect Effect: Waiting for auth check to complete...");
      return;
    }

    console.log(`AuthGuard Redirect Effect: Evaluating state - Status: ${authStatus}, Intended: ${intendedRedirectPath}, Current: ${location.pathname}`);

    if (intendedRedirectPath && intendedRedirectPath !== location.pathname) {
      console.log(`AuthGuard Redirect Effect: Redirecting from ${location.pathname} to intended path: ${intendedRedirectPath}`);
      set({ intendedRedirectPath: null });
      navigate(intendedRedirectPath, { replace: true });
    }
    else if (intendedRedirectPath && intendedRedirectPath === location.pathname) {
      console.log(`AuthGuard Redirect Effect: Already at intended path ${intendedRedirectPath}. Resetting flag.`);
      set({ intendedRedirectPath: null });
    }
  }, [authStatus, intendedRedirectPath, location.pathname, navigate, set]);

  if (authStatus === 'pending') {
    console.log(`AuthGuard Render: Auth check in progress. Showing loader.`);
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-white rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (intendedRedirectPath && intendedRedirectPath !== location.pathname) {
    console.log(`AuthGuard Render: Redirect pending to ${intendedRedirectPath}. Waiting for navigation.`);
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-white rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (authStatus === 'authenticated' && checkedUser) {
    console.log(`AuthGuard Render: Auth checked, user ${checkedUser.id} exists. Rendering children for ${location.pathname}.`);
    return <>{children}</>;
  }

  if (authStatus === 'unauthenticated') {
    console.log(`AuthGuard Render: Auth checked, user not authenticated. Redirecting to /login.`);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.warn(`AuthGuard Render: Reached unexpected state (Status: ${authStatus}, CheckedUser: ${!!checkedUser}, Intended: ${intendedRedirectPath}). Rendering null or redirecting to error.`);
  return <Navigate to="/error" replace />;
}