import type { LayerKey } from '../../types';
import { LayerPanel } from '../../components/LayerPanel';

export default function Infraestructura({
  visible,
  onToggle,
}: {
  visible: Record<LayerKey, boolean>;
  onToggle: (k: LayerKey) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <LayerPanel type="infra" visible={visible} onToggle={onToggle} />
      <LayerPanel type="works" visible={visible} onToggle={onToggle} />
    </div>
  );
}
