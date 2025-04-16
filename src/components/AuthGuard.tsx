import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom"; 
import { useUserStore } from "../store/user/userStore";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, checkAuth, intendedRedirectPath } = useUserStore(state => ({
    user: state.user,
    checkAuth: state.checkAuth,
    intendedRedirectPath: state.intendedRedirectPath,
  }));
  const set = useUserStore.setState; 

  const [authChecked, setAuthChecked] = useState(false);
  const location = useLocation();
  const navigate = useNavigate(); 

  useEffect(() => {
    let isMounted = true; 
    const verifyAuth = async () => {
      console.log("AuthGuard Effect 1: Verifying authentication...");
      await checkAuth(); 
      console.log("AuthGuard Effect 1: Authentication check completed.");
      if (isMounted) {
        setAuthChecked(true);
      }
    };

    verifyAuth();

    return () => { isMounted = false; }; 
  }, [checkAuth]);

  useEffect(() => {
    if (!authChecked) {
      console.log("AuthGuard Effect 2: Waiting for auth check...");
      return;
    }

    console.log(`AuthGuard Effect 2: Evaluating state - User: ${!!user}, Intended: ${intendedRedirectPath}, Current: ${location.pathname}`);

    if (intendedRedirectPath && intendedRedirectPath !== location.pathname) {
      console.log(`AuthGuard Effect 2: Redirecting from ${location.pathname} to intended path: ${intendedRedirectPath}`);
      set({ intendedRedirectPath: null });
      navigate(intendedRedirectPath, { replace: true });
    } 
    else if (intendedRedirectPath && intendedRedirectPath === location.pathname) {
      console.log(`AuthGuard Effect 2: Already at intended path ${intendedRedirectPath}. Resetting flag.`);
      set({ intendedRedirectPath: null });
    } 
    else if (!user) {
      console.log(`AuthGuard Effect 2: No intended path and no user, redirecting to /login.`);
      navigate("/login", { state: { from: location }, replace: true });
    }
    else {
        console.log(`AuthGuard Effect 2: User exists, no redirect needed for ${location.pathname}. Allowing render.`);
    }

  }, [authChecked, user, intendedRedirectPath, location.pathname, navigate, set]);

  if (!authChecked || (intendedRedirectPath && intendedRedirectPath !== location.pathname)) {
    console.log(`AuthGuard Render: Auth check in progress or redirect pending (AuthChecked: ${authChecked}, Intended: ${intendedRedirectPath}, Current: ${location.pathname}). Showing loader.`);
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-white rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (user) {
    console.log(`AuthGuard Render: Auth checked, no redirect pending, user exists. Rendering children for ${location.pathname}.`);
    return <>{children}</>;
  }

  console.warn(`AuthGuard Render: Reached unexpected state (AuthChecked: ${authChecked}, User: ${!!user}, Intended: ${intendedRedirectPath}). Rendering null.`);
  return null; 
}