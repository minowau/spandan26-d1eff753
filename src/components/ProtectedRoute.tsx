import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useEffect, useRef } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isLoading, isAdmin } = useAuth();
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (!isLoading && !user && !hasShownToast.current) {
      toast.error('Please log in to access this page');
      hasShownToast.current = true;
    } else if (!isLoading && user && requireAdmin && !isAdmin && !hasShownToast.current) {
      toast.error('You do not have admin access');
      hasShownToast.current = true;
    }
  }, [isLoading, user, requireAdmin, isAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
