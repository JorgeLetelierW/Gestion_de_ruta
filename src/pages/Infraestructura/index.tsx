import type { LayerKey } from '../../types';

import { LayerPanel } from '../../components/LayerPanel';
import ModulePanel from '../../components/ModulePanel';

interface InfraestructuraProps {
  visible: Record<LayerKey, boolean>;
  onToggle: (key: LayerKey) => void;
}

export default function Infraestructura({
  visible,
  onToggle,
}: InfraestructuraProps) {
  return (
    <ModulePanel
      title="Infraestructura"
      subtitle="Elementos de infraestructura de la ruta"
      width="380px"
    >
      <LayerPanel
        type="infra"
        visible={visible}
        onToggle={onToggle}
      />
    </ModulePanel>
  );
}
