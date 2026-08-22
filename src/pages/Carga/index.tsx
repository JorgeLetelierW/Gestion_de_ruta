import type { AppData } from '../../types';

import DataLoader from '../../components/DataLoader';
import ModulePanel from '../../components/ModulePanel';

interface CargaProps {
  data: AppData;
  setData: (data: AppData) => void;
}

export default function Carga({
  data,
  setData,
}: CargaProps) {
  return (
    <ModulePanel
      title="Carga"
      width="360px"
    >
      <DataLoader
        data={data}
        setData={setData}
      />
    </ModulePanel>
  );
}
