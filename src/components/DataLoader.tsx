import type { AppData } from '../types';
import { parseWorkbookFile } from '../services/api';

interface DataLoaderProps {
  data: AppData;
  setData: (data: AppData) => void;
}

export default function DataLoader({
  data,
  setData,
}: DataLoaderProps) {
  const load = async (
    file: File | null,
    kind: 'classes' | 'works',
  ) => {
    if (!file) return;

    const res = await parseWorkbookFile(
      file,
      data,
      kind,
    );

    setData(res.data);

    alert(`Registros cargados: ${res.total}`);
  };

  return (
    <>
      <div className="title">
        📂 Cargar datos
      </div>

      <label className="file">
        Archivo 1: CLASES

        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(event) =>
            load(
              event.target.files?.[0] || null,
              'classes',
            )
          }
        />
      </label>

      <label className="file">
        Archivo 2: TRABAJOS

        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(event) =>
            load(
              event.target.files?.[0] || null,
              'works',
            )
          }
        />
      </label>
    </>
  );
}
