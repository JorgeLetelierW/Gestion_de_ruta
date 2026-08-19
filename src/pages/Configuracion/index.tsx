import { useState } from 'react';

type ConfigSection =
  | 'obras'
  | 'dashboard'
  | 'usuario'
  | 'nueva-obra'
  | 'seleccionar-obras'
  | 'seleccionar-climas'
  | null;

export default function Configuracion() {
  const [section, setSection] = useState<ConfigSection>(null);

  const [riverAlerts, setRiverAlerts] = useState(false);

  /*
   * =========================================================
   * MENÚ PRINCIPAL
   * =========================================================
   */

  if (section === null) {
    return (
      <section className="page-card configuracion-page">
        <h1>Configuración</h1>

        <p className="config-description">
          Administra tus proyectos, preferencias del Dashboard
          y configuración de usuario.
        </p>

        <div className="config-menu">
          <button
            type="button"
            className="config-menu-button"
            onClick={() => setSection('obras')}
          >
            <div className="config-menu-icon">🏗️</div>

            <div className="config-menu-text">
              <strong>Obras de interés</strong>

              <span>
                Crear y administrar obras o actividades de interés.
              </span>
            </div>

            <div className="config-menu-arrow">›</div>
          </button>

          <button
            type="button"
            className="config-menu-button"
            onClick={() => setSection('dashboard')}
          >
            <div className="config-menu-icon">⚙️</div>

            <div className="config-menu-text">
              <strong>Preferencias Dashboard</strong>

              <span>
                Selecciona la información que deseas visualizar.
              </span>
            </div>

            <div className="config-menu-arrow">›</div>
          </button>

          <button
            type="button"
            className="config-menu-button"
            onClick={() => setSection('usuario')}
          >
            <div className="config-menu-icon">👤</div>

            <div className="config-menu-text">
              <strong>Información del usuario</strong>

              <span>
                Modificar información de tu cuenta.
              </span>
            </div>

            <div className="config-menu-status">
              Próximamente
            </div>
          </button>
        </div>
      </section>
    );
  }

  /*
   * =========================================================
   * OBRAS DE INTERÉS
   * =========================================================
   */

  if (section === 'obras') {
    return (
      <section className="page-card configuracion-page">
        <div className="config-section-header">
          <button
            type="button"
            className="config-back-button"
            onClick={() => setSection(null)}
          >
            ←
          </button>

          <div>
            <h1>Obras de interés</h1>

            <p>
              Administra tus obras y actividades de interés.
            </p>
          </div>
        </div>

        <div className="config-empty-state">
          <div className="config-empty-icon">🏗️</div>

          <strong>Aún no tienes obras creadas</strong>

          <span>
            Las obras que crees aparecerán aquí.
          </span>

          <button
            type="button"
            className="config-primary-button"
            onClick={() => setSection('nueva-obra')}
          >
            + Nueva obra
          </button>
        </div>
      </section>
    );
  }

  /*
   * =========================================================
   * NUEVA OBRA
   * =========================================================
   */

  if (section === 'nueva-obra') {
    return (
      <section className="page-card configuracion-page">
        <div className="config-section-header">
          <button
            type="button"
            className="config-back-button"
            onClick={() => setSection('obras')}
          >
            ←
          </button>

          <div>
            <h1>Nueva obra</h1>

            <p>
              Crear una nueva obra o actividad de interés.
            </p>
          </div>
        </div>

        <div className="config-empty-state">
          <div className="config-empty-icon">🏗️</div>

          <strong>Formulario de nueva obra</strong>

          <span>
            Aquí incorporaremos los datos del proyecto.
          </span>
        </div>
      </section>
    );
  }

  /*
   * =========================================================
   * PREFERENCIAS DASHBOARD
   * =========================================================
   */

  if (section === 'dashboard') {
    return (
      <section className="page-card configuracion-page">
        <div className="config-section-header">
          <button
            type="button"
            className="config-back-button"
            onClick={() => setSection(null)}
          >
            ←
          </button>

          <div>
            <h1>Preferencias Dashboard</h1>

            <p>
              Selecciona la información que deseas visualizar
              en el Dashboard.
            </p>
          </div>
        </div>

        <div className="config-preference-list">

          {/* ALERTAS DE RÍOS */}

          <div className="config-preference-item">
            <div>
              <strong>Alertas de ríos</strong>

              <span>
                Mostrar alertas relacionadas con los ríos
                monitoreados.
              </span>
            </div>

            <button
              type="button"
              className="config-toggle-placeholder"
              onClick={() =>
                setRiverAlerts((current) => !current)
              }
            >
              {riverAlerts ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* OBRAS */}

          <div className="config-preference-item">
            <div>
              <strong>Obras de interés</strong>

              <span>
                Selecciona obras propias o públicas para
                mostrar en el Dashboard.
              </span>
            </div>

            <button
              type="button"
              className="config-secondary-button"
              onClick={() => setSection('seleccionar-obras')}
            >
              Seleccionar
            </button>
          </div>

          {/* CLIMA */}

          <div className="config-preference-item">
            <div>
              <strong>Climas de interés</strong>

              <span>
                Selecciona uno o varios sectores
                meteorológicos.
              </span>
            </div>

            <button
              type="button"
              className="config-secondary-button"
              onClick={() => setSection('seleccionar-climas')}
            >
              Seleccionar
            </button>
          </div>
        </div>
      </section>
    );
  }

  /*
   * =========================================================
   * SELECCIONAR OBRAS
   * =========================================================
   */

  if (section === 'seleccionar-obras') {
    return (
      <section className="page-card configuracion-page">
        <div className="config-section-header">
          <button
            type="button"
            className="config-back-button"
            onClick={() => setSection('dashboard')}
          >
            ←
          </button>

          <div>
            <h1>Obras de interés</h1>

            <p>
              Selecciona las obras que aparecerán en tu Dashboard.
            </p>
          </div>
        </div>

        <div className="config-empty-state">
          <div className="config-empty-icon">🏗️</div>

          <strong>No hay obras disponibles todavía</strong>

          <span>
            Aquí aparecerán tus obras y las obras públicas.
          </span>
        </div>
      </section>
    );
  }

  /*
   * =========================================================
   * SELECCIONAR CLIMAS
   * =========================================================
   */

  if (section === 'seleccionar-climas') {
    return (
      <section className="page-card configuracion-page">
        <div className="config-section-header">
          <button
            type="button"
            className="config-back-button"
            onClick={() => setSection('dashboard')}
          >
            ←
          </button>

          <div>
            <h1>Climas de interés</h1>

            <p>
              Selecciona los sectores que aparecerán
              en tu Dashboard.
            </p>
          </div>
        </div>

        <div className="config-empty-state">
          <div className="config-empty-icon">🌤️</div>

          <strong>Selección de sectores</strong>

          <span>
            Aquí incorporaremos los mismos sectores utilizados
            actualmente por el módulo Clima.
          </span>
        </div>
      </section>
    );
  }

  /*
   * =========================================================
   * INFORMACIÓN USUARIO
   * =========================================================
   */

  return (
    <section className="page-card configuracion-page">
      <div className="config-section-header">
        <button
          type="button"
          className="config-back-button"
          onClick={() => setSection(null)}
        >
          ←
        </button>

        <div>
          <h1>Información del usuario</h1>

          <p>
            Administración de la información asociada
            a tu cuenta.
          </p>
        </div>
      </div>

      <div className="config-empty-state">
        <div className="config-empty-icon">👤</div>

        <strong>Función disponible próximamente</strong>

        <span>
          Este módulo será incorporado en una actualización
          posterior.
        </span>
      </div>
    </section>
  );
}
