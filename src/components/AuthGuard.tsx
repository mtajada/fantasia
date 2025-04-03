import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUserStore } from "../store/user/userStore";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, checkAuth, hasCompletedProfile } = useUserStore();
  const [authChecked, setAuthChecked] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth();
      setAuthChecked(true);
    };

    verifyAuth();
  }, [checkAuth]);

  if (!authChecked) {
    // You could show a loading spinner here
    return <div className="gradient-bg min-h-screen flex items-center justify-center">
      <div className="animate-spin h-10 w-10 border-4 border-white rounded-full border-t-transparent"></div>
    </div>;
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, show the protected content
  return <>{children}</>;
}