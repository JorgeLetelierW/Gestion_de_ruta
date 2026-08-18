import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import ProtectedRoute from './auth/ProtectedRoute';

function TestPage() {
  return (
    <div
      style={{
        background: 'white',
        color: 'black',
        padding: '50px',
        fontSize: '32px',
      }}
    >
      PROTECTED ROUTE FUNCIONA
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* LOGIN */}
      <Route
        path="/"
        element={<LoginPage />}
      />

      {/* RUTAS PROTEGIDAS */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/dashboard"
          element={<TestPage />}
        />
      </Route>

      {/* RUTA DESCONOCIDA */}
      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
}
