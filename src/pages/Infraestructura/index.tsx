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
      width="360px"
    >
      <LayerPanel
        type="infra"
        visible={visible}
        onToggle={onToggle}
      />
    </ModulePanel>
  );
}
