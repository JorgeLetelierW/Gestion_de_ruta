import { COLORS, INFRA, WORKS } from '../services/mockData';
import type { LayerKey } from '../types';

interface LayerPanelProps {
  type: 'infra' | 'works';
  visible: Record<LayerKey, boolean>;
  onToggle: (key: LayerKey) => void;
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
          kind: 'line' as const,
        }))
      : WORKS.map((work) => ({
          name: work.name,
          kind: 'circle' as const,
        }));

  return (
    <>
      <div className="title">
        {type === 'infra'
          ? 'Infraestructura'
          : 'Trabajos'}
      </div>

      {items.map((item) => {
        const key = item.name as LayerKey;
        const active = visible[key];

        return (
          <button
            type="button"
            className={`layer ${active ? 'active' : ''}`}
            key={item.name}
            onClick={() => onToggle(key)}
          >
            <span className="left">
              <span
                className={
                  item.kind === 'line'
                    ? 'line'
                    : 'circle'
                }
                style={{
                  background: COLORS[key],
                }}
              />

              <span>{item.name}</span>
            </span>

            <span
              className={`badge ${
                active ? 'on' : ''
              }`}
            >
              {active ? 'ON' : 'OFF'}
            </span>
          </button>
        );
      })}
    </>
  );
}
