import type { LayerKey } from '../../types';

import { LayerPanel } from '../../components/LayerPanel';
import PagePanel from '../../components/PagePanel';

interface InfraestructuraProps {
  visible: Record<LayerKey, boolean>;
  onToggle: (key: LayerKey) => void;
}

export default function Infraestructura({
  visible,
  onToggle,
}: InfraestructuraProps) {
  return (
    <PagePanel width="min(360px, calc(100% - 32px))">
      <LayerPanel
        type="infra"
        visible={visible}
        onToggle={onToggle}
      />
    </PagePanel>
  );
}
