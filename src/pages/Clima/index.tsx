import WeatherPanel from '../../components/WeatherPanel';
import PagePanel from '../../components/PagePanel';

export default function Clima() {
  return (
    <PagePanel width="min(500px, calc(100% - 32px))">
      <WeatherPanel />
    </PagePanel>
  );
}
