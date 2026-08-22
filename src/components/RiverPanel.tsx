import { useState } from 'react';

import { RIVER_CROSSINGS } from '../services/mockData';
import { useRiverRiskContext } from '../context/RiverRiskContext';
import ModulePanel from './ModulePanel';

export default function RiverPanel() {
  const {
    evaluations,
    loading,
  } = useRiverRiskContext();

  const [openRiver, setOpenRiver] =
    useState<string | null>(null);

  const hasOpenRiver =
    openRiver !== null;

  return (
    <ModulePanel
      title="Ríos"
      width={
        hasOpenRiver
          ? '520px'
          : '360px'
      }
    >
      <div className="river-panel-content">

        {loading && (
          <div className="river-panel-loading">
            Consultando condiciones...
          </div>
        )}

        <div className="river-list">
          {RIVER_CROSSINGS.map((river) => {
            const evaluation =
              evaluations[river.name];

            const risk =
              evaluation?.risk;

            const riverKey =
              `${river.routeKey}-${river.km}-${river.name}`;

            const isOpen =
              openRiver === riverKey;

            return (
              <article
                key={riverKey}
                className="river-card"
              >
                {/* CABECERA */}

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

                {/* UBICACION */}

                <div className="river-card-location">
                  {river.route} · km{' '}
                  {river.km.toLocaleString(
                    'es-CL',
                  )}
                </div>

                {/* DETALLES */}

                <button
                  type="button"
                  className="river-details-button"
                  onClick={() =>
                    setOpenRiver(
                      isOpen
                        ? null
                        : riverKey,
                    )
                  }
                >
                  <span>
                    {isOpen
                      ? 'Ocultar detalles'
                      : 'Detalles'}
                  </span>

                  <span>
                    {isOpen ? '▲' : '▼'}
                  </span>
                </button>

                {/* CONTENIDO EXPANDIDO */}

                {isOpen && (
                  <div className="river-details-content">

                    <div className="river-detail-row">
                      <span>Cuenca</span>

                      <strong>
                        {river.basin}
                      </strong>
                    </div>

                    <div className="river-detail-row">
                      <span>Estado actual</span>

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
                                <span>Últimas 6 h</span>
                                <strong>
                                  {point.last6.toFixed(1)} mm
                                </strong>
                              </div>

                              <div className="river-point-data">
                                <span>Últimas 24 h</span>
                                <strong>
                                  {point.last24.toFixed(1)} mm
                                </strong>
                              </div>

                              <div className="river-point-data">
                                <span>Últimas 48 h</span>
                                <strong>
                                  {point.last48.toFixed(1)} mm
                                </strong>
                              </div>

                              <div className="river-point-data">
                                <span>Próximas 24 h</span>
                                <strong>
                                  {point.next24.toFixed(1)} mm
                                </strong>
                              </div>

                              <div className="river-point-data">
                                <span>Máx. horaria</span>
                                <strong>
                                  {point.maxHour.toFixed(1)} mm
                                </strong>
                              </div>

                              <div className="river-point-data">
                                <span>Horas húmedas 48 h</span>
                                <strong>
                                  {point.wetHours48}
                                </strong>
                              </div>

                              <div className="river-point-data">
                                <span>Nevada 24 h</span>
                                <strong>
                                  {point.snowfall24.toFixed(1)}
                                </strong>
                              </div>

                              <div className="river-point-data">
                                <span>Profundidad nieve</span>
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
                )}

              </article>
            );
          })}
        </div>

      </div>
    </ModulePanel>
  );
}
