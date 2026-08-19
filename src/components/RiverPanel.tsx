import { RIVER_CROSSINGS } from '../services/mockData';
import { useRiverRiskContext } from '../context/RiverRiskContext';

export default function RiverPanel() {
  const {
    evaluations,
    loading,
  } = useRiverRiskContext();

  return (
    <section
      className="page-card river-panel"
      style={{
        pointerEvents: 'auto',

        /*
         * Impide que el panel supere el viewport.
         * Dejamos espacio para los márgenes del Layout.
         */
        width: '100%',
        maxWidth: '100%',
        maxHeight: 'calc(100vh - 32px)',

        /*
         * Si hay muchos ríos, el scroll ocurre
         * dentro del panel.
         */
        overflowY: 'auto',
        overflowX: 'hidden',

        /*
         * Evita problemas de cálculo de tamaño.
         */
        boxSizing: 'border-box',
      }}
    >
      <h1>Ríos</h1>

      <p>
        Evaluación meteorológica referencial de las cuencas.
      </p>

      {loading ? (
        <p>
          Consultando condiciones de las cuencas...
        </p>
      ) : null}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginTop: '16px',
          width: '100%',
          minWidth: 0,
        }}
      >
        {RIVER_CROSSINGS.map((river) => {
          const evaluation =
            evaluations[river.name];

          const risk = evaluation?.risk;

          return (
            <article
              key={`${river.routeKey}-${river.km}-${river.name}`}
              style={{
                width: '100%',
                minWidth: 0,
                boxSizing: 'border-box',
                padding: '12px',
                border:
                  '1px solid rgba(255,255,255,.15)',
                borderRadius: '10px',
                background:
                  'rgba(0,0,0,.18)',
              }}
            >
              {/* ENCABEZADO */}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent:
                    'space-between',
                  gap: '12px',
                  flexWrap: 'wrap',
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

              {/* UBICACIÓN */}

              <div
                style={{
                  marginTop: '6px',
                  opacity: 0.8,
                }}
              >
                {river.route} · km{' '}
                {river.km.toLocaleString(
                  'es-CL',
                )}
              </div>

              {/* CUENCA */}

              <div
                style={{
                  marginTop: '4px',
                  opacity: 0.8,
                }}
              >
                Cuenca: {river.basin}
              </div>

              {/* EVALUACIÓN */}

              {risk ? (
                <div
                  style={{
                    marginTop: '10px',
                    lineHeight: 1.4,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {risk.reason}
                </div>
              ) : null}

              {/* PUNTOS METEOROLÓGICOS */}

              {evaluation?.points?.length ? (
                <details
                  style={{
                    marginTop: '12px',
                    width: '100%',
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
                      width: '100%',
                    }}
                  >
                    {evaluation.points.map(
                      (point) => (
                        <div
                          key={`${river.name}-${point.name}`}
                          style={{
                            width: '100%',
                            minWidth: 0,
                            boxSizing:
                              'border-box',
                            padding: '8px',
                            borderRadius:
                              '8px',
                            background:
                              'rgba(255,255,255,.05)',
                          }}
                        >
                          <strong>
                            {point.name}
                          </strong>

                          <div>
                            Últimas 6 h:{' '}
                            {point.last6.toFixed(
                              1,
                            )}{' '}
                            mm
                          </div>

                          <div>
                            Últimas 24 h:{' '}
                            {point.last24.toFixed(
                              1,
                            )}{' '}
                            mm
                          </div>

                          <div>
                            Últimas 48 h:{' '}
                            {point.last48.toFixed(
                              1,
                            )}{' '}
                            mm
                          </div>

                          <div>
                            Próximas 24 h:{' '}
                            {point.next24.toFixed(
                              1,
                            )}{' '}
                            mm
                          </div>

                          <div>
                            Máx. horaria:{' '}
                            {point.maxHour.toFixed(
                              1,
                            )}{' '}
                            mm
                          </div>

                          <div>
                            Horas húmedas 48 h:{' '}
                            {point.wetHours48}
                          </div>

                          <div>
                            Nevada 24 h:{' '}
                            {point.snowfall24.toFixed(
                              1,
                            )}
                          </div>

                          <div>
                            Profundidad nieve:{' '}
                            {point.snowDepth.toFixed(
                              1,
                            )}{' '}
                            cm
                          </div>
                        </div>
                      ),
                    )}
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
