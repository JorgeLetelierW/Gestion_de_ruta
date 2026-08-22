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
      width="520px"
    >
      <div className="river-panel-content">

        {loading && (
          <div className="river-panel-loading">
            Consultando condiciones de las cuencas...
          </div>
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
                {/* NOMBRE */}

                <strong className="river-card-name">
                  🌊 {river.name}
                </strong>

                {/* UBICACIÓN */}

                <div className="river-card-location">
                  {river.route} · km{' '}
                  {river.km.toLocaleString(
                    'es-CL',
                  )}
                </div>

                {/* DETALLES */}

                <details className="river-details">
                  <summary className="river-details-summary">
                    Detalles
                  </summary>

                  <div className="river-details-content">

                    <div className="river-detail-row">
                      <span>Cuenca</span>

                      <strong>
                        {river.basin}
                      </strong>
                    </div>

                    <div className="river-detail-row">
                      <span>Estado</span>

                      <strong>
                        {risk
                          ? `${risk.emoji} ${risk.level}`
                          : '⚪ Consultando'}
                      </strong>
                    </div>

                    {risk && (
                      <div className="river-risk-reason">
                        {risk.reason}
                      </div>
                    )}

                    {evaluation?.points?.length ? (
                      <div className="river-points">
                        <div className="river-points-title">
                          Puntos de evaluación
                        </div>

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
                    ) : null}

                  </div>
                </details>
              </article>
            );
          })}
        </div>
      </div>
    </ModulePanel>
  );
}
