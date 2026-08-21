import WeatherPanel from '../../components/WeatherPanel';
import ModulePanel from '../../components/ModulePanel';

export default function Clima() {
  return (
    <ModulePanel
      title="Clima"
      subtitle="Condiciones meteorológicas de la ruta"
      fullScreen
    >
      <WeatherPanel />
    </ModulePanel>
  );
}
