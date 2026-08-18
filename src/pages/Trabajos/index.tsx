import type { LayerKey } from '../../types';

import { LayerPanel } from '../../components/LayerPanel';
import PagePanel from '../../components/PagePanel';

interface TrabajosProps {
  visible: Record<LayerKey, boolean>;
  onToggle: (key: LayerKey) => void;
}

export default function Trabajos({
  visible,
  onToggle,
}: TrabajosProps) {
  return (
    <PagePanel width="min(360px, calc(100% - 32px))">
      <LayerPanel
        type="works"
        visible={visible}
        onToggle={onToggle}
      />
    </PagePanel>
  );
}
