import type { LayerKey } from '../../types';
import { LayerPanel } from '../../components/LayerPanel';

export default function Trabajos({
  visible,
  onToggle,
}: {
  visible: Record<LayerKey, boolean>;
  onToggle: (k: LayerKey) => void;
}) {
  return <LayerPanel type="works" visible={visible} onToggle={onToggle} />;
}

