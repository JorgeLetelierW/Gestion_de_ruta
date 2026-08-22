import { RIVER_CROSSINGS } from '../services/mockData';
import { useRiverRiskContext } from '../context/RiverRiskContext';

import ModulePanel from './ModulePanel';

export default function RiverPanel() {
  const {
    evaluations,
    loading,
  } = useRiverRiskContext();

  return (
    <ModulePanel
      title="Ríos"
      width="620px"
    >
      <div className="river-panel-content">
        <p className="river-panel-description">
          Evaluación meteorológica referencial de las cuencas.
        </p>

        {loading && (
          <p className="river-panel-loading">
            Consultando condiciones de las cuencas...
          </p>
        )}

        <div className="river-list">
          {RIVER_CROSSINGS.map((river) => {
            const evaluation =
              evaluations[river.name];

            const risk =
              evaluation?.risk;

            return (
              <article
                key={`${river.routeKey}-${river.km}-${river.name}`}
                className="river-card"
              >
                {/* ENCABEZADO */}

                <div className="river-card-header">
                  <strong className="river-card-name">
                    🌊 {river.name}
                  </strong>

                  <span className="river-risk">
                    {risk
                      ? `${risk.emoji} ${risk.level}`
                      : '⚪ Consultando'}
                  </span>
                </div>

                {/* UBICACIÓN */}

                <div className="river-card-meta">
                  {river.route} · km{' '}
                  {river.km.toLocaleString(
                    'es-CL',
                  )}
                </div>

                {/* CUENCA */}

                <div className="river-card-meta">
                  Cuenca: {river.basin}
                </div>

                {/* EVALUACIÓN */}

                {risk && (
                  <div className="river-risk-reason">
                    {risk.reason}
                  </div>
                )}

                {/* PUNTOS METEOROLÓGICOS */}

                {evaluation?.points?.length ? (
                  <details className="river-details">
                    <summary className="river-details-summary">
                      Ver puntos de evaluación
                    </summary>

                    <div className="river-points">
                      {evaluation.points.map(
                        (point) => (
                          <div
                            key={`${river.name}-${point.name}`}
                            className="river-point"
                          >
                            <strong className="river-point-name">
                              {point.name}
                            </strong>

                            <div className="river-point-data">
                              <span>
                                Últimas 6 h
                              </span>

                              <strong>
                                {point.last6.toFixed(1)} mm
                              </strong>
                            </div>

                            <div className="river-point-data">
                              <span>
                                Últimas 24 h
                              </span>

                              <strong>
                                {point.last24.toFixed(1)} mm
                              </strong>
                            </div>

                            <div className="river-point-data">
                              <span>
                                Últimas 48 h
                              </span>

                              <strong>
                                {point.last48.toFixed(1)} mm
                              </strong>
                            </div>

                            <div className="river-point-data">
                              <span>
                                Próximas 24 h
                              </span>

                              <strong>
                                {point.next24.toFixed(1)} mm
                              </strong>
                            </div>

                            <div className="river-point-data">
                              <span>
                                Máx. horaria
                              </span>

                              <strong>
                                {point.maxHour.toFixed(1)} mm
                              </strong>
                            </div>

                            <div className="river-point-data">
                              <span>
                                Horas húmedas 48 h
                              </span>

                              <strong>
                                {point.wetHours48}
                              </strong>
                            </div>

                            <div className="river-point-data">
                              <span>
                                Nevada 24 h
                              </span>

                              <strong>
                                {point.snowfall24.toFixed(1)}
                              </strong>
                            </div>

                            <div className="river-point-data">
                              <span>
                                Profundidad nieve
                              </span>

                              <strong>
                                {point.snowDepth.toFixed(1)} cm
                              </strong>
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
      </div>
    </ModulePanel>
  );
}
