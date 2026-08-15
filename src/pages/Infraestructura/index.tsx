import type { LayerKey } from '../../types';
import { LayerPanel } from '../../components/LayerPanel';

export default function Infraestructura({
  visible,
  onToggle,
}: {
  visible: Record<LayerKey, boolean>;
  onToggle: (k: LayerKey) => void;
}) {
  return <LayerPanel type="infra" visible={visible} onToggle={onToggle} />;
}
