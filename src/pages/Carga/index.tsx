import type { AppData } from '../../types';

import DataLoader from '../../components/DataLoader';
import PagePanel from '../../components/PagePanel';

interface CargaProps {
  data: AppData;
  setData: (data: AppData) => void;
}

export default function Carga({
  data,
  setData,
}: CargaProps) {
  return (
    <PagePanel width="min(360px, calc(100% - 32px))">
      <DataLoader
        data={data}
        setData={setData}
      />
    </PagePanel>
  );
}
