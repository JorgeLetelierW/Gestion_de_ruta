import { useNavigate, useLocation } from "react-router-dom";
import { login } from "../auth/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || "/app";

  const handleLogin = () => {
    login();
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-xl p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Gestión de Ruta</h1>
          <p className="text-slate-300 mt-2">
            Inicia sesión para acceder a la plataforma.
          </p>
        </div>

        <button
          onClick={handleLogin}
          className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 transition px-4 py-3 font-semibold"
        >
          Iniciar sesión
        </button>

        <button
          onClick={() => navigate('/')}
          className="mt-3 w-full rounded-xl border border-slate-600 hover:bg-slate-800 transition px-4 py-3 text-sm text-slate-300"
        >
          ← Volver al inicio
        </button>
      </div>
    </div>
  );
}
