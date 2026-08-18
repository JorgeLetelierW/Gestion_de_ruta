import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { session, loading } = useAuth();
  const location = useLocation();

  // Esperamos mientras Supabase comprueba la sesión
  if (loading) {
    return (
      <div className="auth-loading">
        Cargando...
      </div>
    );
  }

  // Sin sesión → volver al login
  if (!session) {
    return (
      <Navigate
        to="/"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // Sesión válida → permitir acceso
  return <Outlet />;
}
