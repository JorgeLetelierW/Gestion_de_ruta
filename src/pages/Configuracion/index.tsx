import { useState } from 'react';

type ConfigSection =
  | 'obras'
  | 'dashboard'
  | 'usuario'
  | null;

export default function Configuracion() {
  const [section, setSection] = useState<ConfigSection>(null);

  /*
   * ---------------------------------------------------------
   * PANTALLA PRINCIPAL
   * ---------------------------------------------------------
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
            <div className="config-menu-icon">
              🏗️
            </div>

            <div className="config-menu-text">
              <strong>
                Obras de interés
              </strong>

              <span>
                Crear y administrar obras o actividades
                de interés.
              </span>
            </div>

            <div className="config-menu-arrow">
              ›
            </div>
          </button>


          <button
            type="button"
            className="config-menu-button"
            onClick={() => setSection('dashboard')}
          >
            <div className="config-menu-icon">
              ⚙️
            </div>

            <div className="config-menu-text">
              <strong>
                Preferencias Dashboard
              </strong>

              <span>
                Selecciona la información que deseas
                visualizar.
              </span>
            </div>

            <div className="config-menu-arrow">
              ›
            </div>
          </button>


          <button
            type="button"
            className="config-menu-button"
            onClick={() => setSection('usuario')}
          >
            <div className="config-menu-icon">
              👤
            </div>

            <div className="config-menu-text">
              <strong>
                Información del usuario
              </strong>

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
   * ---------------------------------------------------------
   * OBRAS DE INTERÉS
   * ---------------------------------------------------------
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
            <h1>
              Obras de interés
            </h1>

            <p>
              Administra tus obras y actividades
              de interés.
            </p>
          </div>

        </div>


        <div className="config-empty-state">

          <div className="config-empty-icon">
            🏗️
          </div>

          <strong>
            Aún no tienes obras creadas
          </strong>

          <span>
            Las obras que crees aparecerán aquí.
          </span>

          <button
            type="button"
            className="config-primary-button"
          >
            + Nueva obra
          </button>

        </div>

      </section>
    );
  }


  /*
   * ---------------------------------------------------------
   * PREFERENCIAS DASHBOARD
   * ---------------------------------------------------------
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
            <h1>
              Preferencias Dashboard
            </h1>

            <p>
              Selecciona la información que deseas
              visualizar en el Dashboard.
            </p>
          </div>

        </div>


        <div className="config-preference-list">


          <div className="config-preference-item">

            <div>
              <strong>
                Alertas de ríos
              </strong>

              <span>
                Mostrar alertas relacionadas con
                los ríos monitoreados.
              </span>
            </div>

            <button
              type="button"
              className="config-toggle-placeholder"
            >
              OFF
            </button>

          </div>


          <div className="config-preference-item">

            <div>
              <strong>
                Obras de interés
              </strong>

              <span>
                Selecciona obras propias o públicas
                para mostrar en el Dashboard.
              </span>
            </div>

            <button
              type="button"
              className="config-secondary-button"
            >
              Seleccionar
            </button>

          </div>


          <div className="config-preference-item">

            <div>
              <strong>
                Climas de interés
              </strong>

              <span>
                Selecciona uno o varios sectores
                meteorológicos.
              </span>
            </div>

            <button
              type="button"
              className="config-secondary-button"
            >
              Seleccionar
            </button>

          </div>

        </div>

      </section>
    );
  }


  /*
   * ---------------------------------------------------------
   * INFORMACIÓN DEL USUARIO
   * ---------------------------------------------------------
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
          <h1>
            Información del usuario
          </h1>

          <p>
            Administración de la información
            asociada a tu cuenta.
          </p>
        </div>

      </div>


      <div className="config-empty-state">

        <div className="config-empty-icon">
          👤
        </div>

        <strong>
          Función disponible próximamente
        </strong>

        <span>
          Este módulo será incorporado en una
          actualización posterior.
        </span>

      </div>

    </section>
  );
}
