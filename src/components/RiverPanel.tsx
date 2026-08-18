import { useEffect, useState } from 'react';

import { RIVER_CROSSINGS } from '../services/mockData';
import {
  evaluateRiverBasin,
  type RiverEvaluation,
} from '../services/riverRisk';

type RiverState = Record<string, RiverEvaluation | null>;

export default function RiverPanel() {
  const [evaluations, setEvaluations] = useState<RiverState>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadRiverRisks() {
      setLoading(true);

      const initialState: RiverState = {};

      RIVER_CROSSINGS.forEach((river) => {
        initialState[river.name] = null;
      });

      setEvaluations(initialState);

      await Promise.all(
        RIVER_CROSSINGS.map(async (river) => {
          const evaluation = await evaluateRiverBasin(river);

          if (cancelled) return;

          setEvaluations((current) => ({
            ...current,
            [river.name]: evaluation,
          }));
        }),
      );

      if (!cancelled) {
        setLoading(false);
      }
    }

    loadRiverRisks();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      className="page-card"
      style={{
        pointerEvents: 'auto',
        maxHeight: 'calc(100% - 32px)',
        overflowY: 'auto',
      }}
    >
      <h1>Ríos</h1>

      <p>
        Evaluación meteorológica referencial de las cuencas.
      </p>

      {loading ? (
        <p>Consultando condiciones de las cuencas...</p>
      ) : null}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginTop: '16px',
        }}
      >
        {RIVER_CROSSINGS.map((river) => {
          const evaluation = evaluations[river.name];

          const risk = evaluation?.risk;

          return (
            <article
              key={`${river.routeKey}-${river.km}-${river.name}`}
              style={{
                padding: '12px',
                border: '1px solid rgba(255,255,255,.15)',
                borderRadius: '10px',
                background: 'rgba(0,0,0,.18)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <strong>
                  🌊 {river.name}
                </strong>

                <span>
                  {risk
                    ? `${risk.emoji} ${risk.level}`
                    : '⚪ Consultando'}
                </span>
              </div>

              <div
                style={{
                  marginTop: '6px',
                  opacity: 0.8,
                }}
              >
                {river.route} · km {river.km.toLocaleString('es-CL')}
              </div>

              <div
                style={{
                  marginTop: '4px',
                  opacity: 0.8,
                }}
              >
                Cuenca: {river.basin}
              </div>

              {risk ? (
                <div
                  style={{
                    marginTop: '10px',
                    lineHeight: 1.4,
                  }}
                >
                  {risk.reason}
                </div>
              ) : null}

              {evaluation?.points?.length ? (
                <details
                  style={{
                    marginTop: '12px',
                  }}
                >
                  <summary
                    style={{
                      cursor: 'pointer',
                    }}
                  >
                    Ver puntos de evaluación
                  </summary>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      marginTop: '10px',
                    }}
                  >
                    {evaluation.points.map((point) => (
                      <div
                        key={`${river.name}-${point.name}`}
                        style={{
                          padding: '8px',
                          borderRadius: '8px',
                          background: 'rgba(255,255,255,.05)',
                        }}
                      >
                        <strong>{point.name}</strong>

                        <div>
                          Últimas 6 h: {point.last6.toFixed(1)} mm
                        </div>

                        <div>
                          Últimas 24 h: {point.last24.toFixed(1)} mm
                        </div>

                        <div>
                          Últimas 48 h: {point.last48.toFixed(1)} mm
                        </div>

                        <div>
                          Próximas 24 h: {point.next24.toFixed(1)} mm
                        </div>

                        <div>
                          Máx. horaria: {point.maxHour.toFixed(1)} mm
                        </div>

                        <div>
                          Horas húmedas 48 h: {point.wetHours48}
                        </div>

                        <div>
                          Nevada 24 h: {point.snowfall24.toFixed(1)}
                        </div>

                        <div>
                          Profundidad nieve: {point.snowDepth.toFixed(1)} cm
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
