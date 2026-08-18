import { COLORS, INFRA, WORKS } from '../services/mockData';
import type { LayerKey } from '../types';

interface LayerPanelProps {
  type: 'infra' | 'works';
  visible: Record<LayerKey, boolean>;
  onToggle: (k: LayerKey) => void;
}

export function LayerPanel({
  type,
  visible,
  onToggle,
}: LayerPanelProps) {
  const items =
    type === 'infra'
      ? INFRA.map((name) => ({
          name,
          kind: 'line',
        }))
      : WORKS.map((w) => ({
          name: w.name,
          kind: 'circle',
        }));

  return (
    <>
      <div className="title">
        {type === 'infra'
          ? 'Infraestructura'
          : 'Trabajos'}
      </div>

      {items.map((it) => (
        <button
          type="button"
          className={`layer ${
            visible[it.name as LayerKey]
              ? 'active'
              : ''
          }`}
          key={it.name}
          onClick={() =>
            onToggle(it.name as LayerKey)
          }
        >
          <span className="left">
            <span
              className={
                it.kind === 'line'
                  ? 'line'
                  : 'circle'
              }
              style={{
                background:
                  COLORS[it.name as LayerKey],
              }}
            />

            <span>{it.name}</span>
          </span>

          <span
            className={`badge ${
              visible[it.name as LayerKey]
                ? 'on'
                : ''
            }`}
          >
            {visible[it.name as LayerKey]
              ? 'ON'
              : 'OFF'}
          </span>
        </button>
      ))}
    </>
  );
}
