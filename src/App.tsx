import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import LoginPage from './pages/LoginPage';

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
      RUTAS FUNCIONAN
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<LoginPage />}
      />

      <Route
        path="/dashboard"
        element={<TestPage />}
      />

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
