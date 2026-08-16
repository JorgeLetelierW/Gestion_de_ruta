import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <span className="text-xl font-bold tracking-tight">Gestión de Ruta</span>
        <button
          onClick={() => navigate('/login')}
          className="rounded-lg bg-blue-600 hover:bg-blue-700 transition px-5 py-2 text-sm font-semibold"
        >
          Iniciar sesión
        </button>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 gap-8">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            Plataforma de{' '}
            <span className="text-blue-400">Gestión de Ruta</span>
          </h1>
          <p className="text-slate-300 text-lg mb-8">
            Visualiza, gestiona y monitorea tu red de infraestructura vial en tiempo real.
            Accede a mapas interactivos, estado de trabajos y condiciones climáticas desde
            un solo lugar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 transition px-8 py-3 font-semibold text-base"
            >
              Acceder a la plataforma
            </button>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-3xl w-full">
          {[
            { icon: '🗺️', title: 'Mapa Interactivo', desc: 'Visualiza troncales, enlaces y pasarelas en tiempo real.' },
            { icon: '🔧', title: 'Gestión de Trabajos', desc: 'Seguimiento y estado de trabajos por zona y equipo.' },
            { icon: '🌦️', title: 'Condiciones Climáticas', desc: 'Monitorea el clima para planificar operaciones de ruta.' },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl bg-slate-900 border border-slate-700 p-5 text-left">
              <div className="text-3xl mb-2">{f.icon}</div>
              <h3 className="font-semibold text-base mb-1">{f.title}</h3>
              <p className="text-slate-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center text-slate-600 text-xs py-4">
        © {new Date().getFullYear()} Gestión de Ruta · JLW
      </footer>
    </div>
  );
}
