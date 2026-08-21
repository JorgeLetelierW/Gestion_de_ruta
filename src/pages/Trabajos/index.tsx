import type { LayerKey } from '../../types';

import { LayerPanel } from '../../components/LayerPanel';
import ModulePanel from '../../components/ModulePanel';

interface TrabajosProps {
  visible: Record<LayerKey, boolean>;
  onToggle: (key: LayerKey) => void;
}

export default function Trabajos({
  visible,
  onToggle,
}: TrabajosProps) {
  return (
    <ModulePanel
      title="Trabajos"
      width="360px"
    >
      <LayerPanel
        type="works"
        visible={visible}
        onToggle={onToggle}
      />
    </ModulePanel>
  );
}
