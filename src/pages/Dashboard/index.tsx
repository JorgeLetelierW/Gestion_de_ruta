import { useRiverRiskContext } from '../../context/RiverRiskContext';
export default function Dashboard() {
  const {
  loading,
  alerts,
  highAlerts,
  warnings,
  unavailable,
} = useRiverRiskContext();
  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        left: 16,
        width: 'min(380px, calc(100% - 32px))',
        maxHeight: 'calc(100% - 32px)',
        pointerEvents: 'auto',
      }}
    >
      <section
        className="page-card"
        style={{
          overflowY: 'auto',
          maxHeight: '100%',
        }}
      >
        {/* TÍTULO */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
              }}
            >
              Dashboard
            </h1>

            <p
              style={{
                marginTop: 4,
                marginBottom: 0,
                opacity: 0.7,
              }}
            >
              Alertas activas
            </p>
          </div>

          {!loading && alerts.length > 0 ? (
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
              }}
            >
              {alerts.length}
            </div>
          ) : null}
        </div>

        {/* CARGANDO */}
        {loading ? (
          <div
            style={{
              marginTop: 20,
              padding: 14,
              borderRadius: 10,
              background: 'rgba(255,255,255,.06)',
            }}
          >
            🌊 Evaluando cuencas...
          </div>
        ) : null}

        {/* SIN ALERTAS */}
        {!loading && alerts.length === 0 ? (
          <div
            style={{
              marginTop: 20,
              padding: 14,
              borderRadius: 10,
              background: 'rgba(0,255,102,.08)',
              border: '1px solid rgba(0,255,102,.25)',
            }}
          >
            <strong>🟢 Sin alertas de ríos activas</strong>

            <div
              style={{
                marginTop: 5,
                opacity: 0.75,
                fontSize: 13,
              }}
            >
              Las cuencas evaluadas se encuentran en estado normal.
            </div>
          </div>
        ) : null}

        {/* ALERTAS ALTAS */}
        {!loading && highAlerts.length > 0 ? (
          <div
            style={{
              marginTop: 20,
            }}
          >
            <h2
              style={{
                margin: '0 0 10px',
                fontSize: 16,
              }}
            >
              🔴 Alerta alta de crecida
            </h2>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {highAlerts.map(({ river, evaluation }) => (
                <article
                  key={`${river.routeKey}-${river.km}-${river.name}`}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    background: 'rgba(255,0,0,.10)',
                    border: '1px solid rgba(255,0,0,.35)',
                  }}
                >
                  <strong>🌊 {river.name}</strong>

                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 13,
                      opacity: 0.8,
                    }}
                  >
                    {river.route} · km{' '}
                    {river.km.toLocaleString('es-CL')}
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 13,
                      lineHeight: 1.4,
                    }}
                  >
                    {evaluation?.risk.reason}
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        {/* VIGILANCIA */}
        {!loading && warnings.length > 0 ? (
          <div
            style={{
              marginTop: 20,
            }}
          >
            <h2
              style={{
                margin: '0 0 10px',
                fontSize: 16,
              }}
            >
              🟠 Vigilancia preventiva
            </h2>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {warnings.map(({ river, evaluation }) => (
                <article
                  key={`${river.routeKey}-${river.km}-${river.name}`}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    background: 'rgba(255,165,0,.10)',
                    border: '1px solid rgba(255,165,0,.35)',
                  }}
                >
                  <strong>🌊 {river.name}</strong>

                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 13,
                      opacity: 0.8,
                    }}
                  >
                    {river.route} · km{' '}
                    {river.km.toLocaleString('es-CL')}
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 13,
                      lineHeight: 1.4,
                    }}
                  >
                    {evaluation?.risk.reason}
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        {/* SIN DATOS */}
        {!loading && unavailable.length > 0 ? (
          <details
            style={{
              marginTop: 20,
            }}
          >
            <summary
              style={{
                cursor: 'pointer',
                opacity: 0.75,
              }}
            >
              ⚪ {unavailable.length} río(s) sin información
            </summary>

            <div
              style={{
                marginTop: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              {unavailable.map(({ river }) => (
                <div
                  key={`${river.routeKey}-${river.km}-${river.name}`}
                  style={{
                    fontSize: 13,
                    opacity: 0.75,
                  }}
                >
                  🌊 {river.name}
                </div>
              ))}
            </div>
          </details>
        ) : null}
      </section>
    </div>
  );
}
