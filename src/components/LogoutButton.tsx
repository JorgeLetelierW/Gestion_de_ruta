
import { useNavigate } from "react-router-dom";
import { logout } from "../auth/auth";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <button
      onClick={handleLogout}
      className="fixed top-4 right-4 z-[9999] rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-semibold shadow-lg transition"
    >
      Cerrar sesión
    </button>
  );
}
