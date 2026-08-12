import { Outlet } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";

export default function PrivateLayout() {
  return (
    <div className="relative min-h-screen">
      <LogoutButton />
      <Outlet />
    </div>
  );
}
