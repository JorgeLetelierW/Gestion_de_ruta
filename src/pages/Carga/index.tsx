import type { AppData } from '../../types';
import DataLoader from '../../components/DataLoader';

export default function Carga({ data, setData }: { data: AppData; setData: (d: AppData) => void }) {
  return <DataLoader data={data} setData={setData} />;
}
