import { useMemo, useState } from 'react';

type ConfigSection =
  | 'obras'
  | 'nueva-obra'
  | 'dashboard'
  | 'usuario'
  | null;

type Eje = 'R5' | 'ASS';
type Visibilidad = 'Privado' | 'Publico';

interface NuevaObra {
  nombre: string;
  contratista: string;
  responsable: string;
  eje: Eje;
  km: string;
  tipoObra: string;
  actividad: string;
  visibilidad: Visibilidad;
}

/*
 * ---------------------------------------------------------
 * ACTIVIDADES
 * ---------------------------------------------------------
 *
 * Por ahora cargamos el CSV directamente desde src/data.
 * Vite permite importar el contenido del archivo como texto
 * utilizando ?raw.
 */

import actividadesCsv from '../../data/actividades.csv?raw';

function parseCsvLine(line: string) {
  const values: string[] = [];

  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (
        insideQuotes &&
        line[i + 1] === '"'
      ) {
        current += '"';
        i += 1;
      } else {
        insideQuotes = !insideQuotes;
      }

      continue;
    }

    if (char === ';' && !insideQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current.trim());

  return values;
}

function loadActivities(csv: string) {
  const lines = csv
    .replace(/\r/g, '')
    .split('\n')
    .filter((line) => line.trim());

  if (lines.length < 2) {
    return [];
  }

  const headers = parseCsvLine(lines[0]).map(
    (value) => value.toLowerCase().trim(),
  );

  const tipoIndex = headers.findIndex(
    (header) =>
      header.includes('tipo') &&
      header.includes('obra'),
  );

  const actividadIndex = headers.findIndex(
    (header) =>
      header.includes('actividad'),
  );

  if (
    tipoIndex === -1 ||
    actividadIndex === -1
  ) {
    return [];
  }

  return lines
    .slice(1)
    .map((line) => {
      const columns = parseCsvLine(line);

      return {
        tipoObra:
          columns[tipoIndex]?.trim() || '',
        actividad:
          columns[actividadIndex]?.trim() || '',
      };
    })
    .filter(
      (item) =>
        item.tipoObra &&
        item.actividad,
    );
}

const ACTIVIDADES = loadActivities(actividadesCsv);

const emptyWork = (): NuevaObra => ({
  nombre: '',
  contratista: '',
  responsable: '',
  eje: 'R5',
  km: '',
  tipoObra: '',
  actividad: '',
  visibilidad: 'Privado',
});

export default function Configuracion() {
  const [section, setSection] =
    useState<ConfigSection>(null);

  const [riverAlerts, setRiverAlerts] =
    useState(false);

  const [obra, setObra] =
    useState<NuevaObra>(emptyWork());

  const [error, setError] =
    useState('');

  const [mensaje, setMensaje] =
    useState('');

  /*
   * ---------------------------------------------------------
   * TIPOS DE OBRA
   * ---------------------------------------------------------
   */

  const tiposObra = useMemo(() => {
    return Array.from(
      new Set(
        ACTIVIDADES.map(
          (item) => item.tipoObra,
        ),
      ),
    ).sort((a, b) =>
      a.localeCompare(b, 'es'),
    );
  }, []);

  /*
   * ---------------------------------------------------------
   * ACTIVIDADES SEGÚN TIPO DE OBRA
   * ---------------------------------------------------------
   */

  const actividadesDisponibles =
    useMemo(() => {
      if (!obra.tipoObra) {
        return [];
      }

      return Array.from(
        new Set(
          ACTIVIDADES
            .filter(
              (item) =>
                item.tipoObra ===
                obra.tipoObra,
            )
            .map(
              (item) =>
                item.actividad,
            ),
        ),
      ).sort((a, b) =>
        a.localeCompare(b, 'es'),
      );
    }, [obra.tipoObra]);

  /*
   * ---------------------------------------------------------
   * CAMBIO DE EJE
   * ---------------------------------------------------------
   */

  const setEje = (eje: Eje) => {
    setObra((current) => ({
      ...current,
      eje,
      km: '',
    }));

    setError('');
  };

  /*
   * ---------------------------------------------------------
   * VALIDACIÓN KM
   * ---------------------------------------------------------
   */

  const validateKm = () => {
    const km = Number(
      obra.km.replace(',', '.'),
    );

    if (
      obra.km.trim() === '' ||
      Number.isNaN(km)
    ) {
      return 'Debes ingresar un punto kilométrico válido.';
    }

    /*
     * Rangos actualmente utilizados
     * por el visor.
     */

    if (
      obra.eje === 'R5' &&
      (km < 29 || km > 219)
    ) {
      return 'Para Ruta 5 Sur el km debe estar entre 29 y 219.';
    }

    if (
      obra.eje === 'ASS' &&
      (km < 0 || km > 43.5)
    ) {
      return 'Para Acceso Sur el km debe estar entre 0 y 43,5.';
    }

    return '';
  };

  /*
   * ---------------------------------------------------------
   * GUARDAR
   * ---------------------------------------------------------
   */

  const handleSave = () => {
    setError('');
    setMensaje('');

    if (!obra.nombre.trim()) {
      setError(
        'Debes ingresar el nombre del proyecto.',
      );
      return;
    }

    if (!obra.contratista.trim()) {
      setError(
        'Debes ingresar el contratista.',
      );
      return;
    }

    if (!obra.responsable.trim()) {
      setError(
        'Debes ingresar el Responsable RDM.',
      );
      return;
    }

    const kmError = validateKm();

    if (kmError) {
      setError(kmError);
      return;
    }

    if (!obra.tipoObra) {
      setError(
        'Debes seleccionar un tipo de obra.',
      );
      return;
    }

    if (!obra.actividad) {
      setError(
        'Debes seleccionar una actividad.',
      );
      return;
    }

    /*
     * TODAVÍA NO GUARDAMOS EN SUPABASE.
     */

    console.log(
      'Nueva obra:',
      obra,
    );

    setMensaje(
      'Formulario válido. La obra está preparada para guardar.',
    );
  };

  /*
   * ---------------------------------------------------------
   * MENÚ PRINCIPAL
   * ---------------------------------------------------------
   */

  if (section === null) {
    return (
      <section className="page-card configuracion-page">
        <h1>Configuración</h1>

        <p className="config-description">
          Administra tus proyectos, preferencias
          del Dashboard y configuración de usuario.
        </p>

        <div className="config-menu">
          <button
            type="button"
            className="config-menu-button"
            onClick={() =>
              setSection('obras')
            }
          >
            <div className="config-menu-icon">
              🏗️
            </div>

            <div className="config-menu-text">
              <strong>
                Obras de interés
              </strong>

              <span>
                Crear y administrar obras o
                actividades de interés.
              </span>
            </div>

            <div className="config-menu-arrow">
              ›
            </div>
          </button>

          <button
            type="button"
            className="config-menu-button"
            onClick={() =>
              setSection('dashboard')
            }
          >
            <div className="config-menu-icon">
              ⚙️
            </div>

            <div className="config-menu-text">
              <strong>
                Preferencias Dashboard
              </strong>

              <span>
                Selecciona la información que
                deseas visualizar.
              </span>
            </div>

            <div className="config-menu-arrow">
              ›
            </div>
          </button>

          <button
            type="button"
            className="config-menu-button"
            onClick={() =>
              setSection('usuario')
            }
          >
            <div className="config-menu-icon">
              👤
            </div>

            <div className="config-menu-text">
              <strong>
                Información del usuario
              </strong>

              <span>
                Modificar información de tu
                cuenta.
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
            onClick={() =>
              setSection(null)
            }
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
            onClick={() => {
              setObra(emptyWork());
              setError('');
              setMensaje('');
              setSection('nueva-obra');
            }}
          >
            + Nueva obra
          </button>
        </div>
      </section>
    );
  }

  /*
   * ---------------------------------------------------------
   * NUEVA OBRA
   * ---------------------------------------------------------
   */

  if (section === 'nueva-obra') {
    return (
      <section className="page-card configuracion-page">
        <div className="config-section-header">
          <button
            type="button"
            className="config-back-button"
            onClick={() =>
              setSection('obras')
            }
          >
            ←
          </button>

          <div>
            <h1>
              Nueva obra
            </h1>

            <p>
              Ingresa la información básica
              de la obra o actividad.
            </p>
          </div>
        </div>

        <div className="config-form">
          <label className="config-field">
            <span>
              Nombre del proyecto *
            </span>

            <input
              type="text"
              value={obra.nombre}
              onChange={(event) =>
                setObra({
                  ...obra,
                  nombre:
                    event.target.value,
                })
              }
              placeholder="Ej: Mejoramiento enlace..."
            />
          </label>

          <label className="config-field">
            <span>
              Contratista *
            </span>

            <input
              type="text"
              value={obra.contratista}
              onChange={(event) =>
                setObra({
                  ...obra,
                  contratista:
                    event.target.value,
                })
              }
              placeholder="Nombre del contratista"
            />
          </label>

          <label className="config-field">
            <span>
              Responsable RDM *
            </span>

            <input
              type="text"
              value={obra.responsable}
              onChange={(event) =>
                setObra({
                  ...obra,
                  responsable:
                    event.target.value,
                })
              }
              placeholder="Nombre del responsable"
            />
          </label>

          <div className="config-field">
            <span>
              Eje *
            </span>

            <div className="config-choice-row">
              <button
                type="button"
                className={
                  obra.eje === 'R5'
                    ? 'config-choice active'
                    : 'config-choice'
                }
                onClick={() =>
                  setEje('R5')
                }
              >
                Ruta 5 Sur
              </button>

              <button
                type="button"
                className={
                  obra.eje === 'ASS'
                    ? 'config-choice active'
                    : 'config-choice'
                }
                onClick={() =>
                  setEje('ASS')
                }
              >
                Acceso Sur
              </button>
            </div>
          </div>

          <label className="config-field">
            <span>
              Ubicación aprox. (km) *
            </span>

            <input
              type="text"
              inputMode="decimal"
              value={obra.km}
              onChange={(event) =>
                setObra({
                  ...obra,
                  km: event.target.value,
                })
              }
              placeholder={
                obra.eje === 'R5'
                  ? 'Ej: 182,700'
                  : 'Ej: 24,500'
              }
            />

            <small>
              {obra.eje === 'R5'
                ? 'Rango permitido: km 29 a 219.'
                : 'Rango permitido: km 0 a 43,5.'}
            </small>
          </label>

          <label className="config-field">
            <span>
              Tipo de obra *
            </span>

            <select
              value={obra.tipoObra}
              onChange={(event) =>
                setObra({
                  ...obra,
                  tipoObra:
                    event.target.value,
                  actividad: '',
                })
              }
            >
              <option value="">
                Seleccionar...
              </option>

              {tiposObra.map(
                (tipo) => (
                  <option
                    key={tipo}
                    value={tipo}
                  >
                    {tipo}
                  </option>
                ),
              )}
            </select>
          </label>

          <label className="config-field">
            <span>
              Actividad *
            </span>

            <select
              value={obra.actividad}
              disabled={!obra.tipoObra}
              onChange={(event) =>
                setObra({
                  ...obra,
                  actividad:
                    event.target.value,
                })
              }
            >
              <option value="">
                {obra.tipoObra
                  ? 'Seleccionar...'
                  : 'Selecciona primero el tipo de obra'}
              </option>

              {actividadesDisponibles.map(
                (actividad) => (
                  <option
                    key={actividad}
                    value={actividad}
                  >
                    {actividad}
                  </option>
                ),
              )}
            </select>
          </label>

          <div className="config-field">
            <span>
              Visibilidad *
            </span>

            <div className="config-choice-row">
              <button
                type="button"
                className={
                  obra.visibilidad ===
                  'Privado'
                    ? 'config-choice active'
                    : 'config-choice'
                }
                onClick={() =>
                  setObra({
                    ...obra,
                    visibilidad:
                      'Privado',
                  })
                }
              >
                🔒 Privado
              </button>

              <button
                type="button"
                className={
                  obra.visibilidad ===
                  'Publico'
                    ? 'config-choice active'
                    : 'config-choice'
                }
                onClick={() =>
                  setObra({
                    ...obra,
                    visibilidad:
                      'Publico',
                  })
                }
              >
                🌐 Público
              </button>
            </div>
          </div>

          {error ? (
            <div className="config-form-error">
              {error}
            </div>
          ) : null}

          {mensaje ? (
            <div className="config-form-success">
              {mensaje}
            </div>
          ) : null}

          <div className="config-form-actions">
            <button
              type="button"
              className="config-secondary-button"
              onClick={() =>
                setSection('obras')
              }
            >
              Cancelar
            </button>

            <button
              type="button"
              className="config-primary-button"
              onClick={handleSave}
            >
              Guardar obra
            </button>
          </div>
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
            onClick={() =>
              setSection(null)
            }
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
              onClick={() =>
                setRiverAlerts(
                  (current) => !current,
                )
              }
            >
              {riverAlerts
                ? 'ON'
                : 'OFF'}
            </button>
          </div>

          <div className="config-preference-item">
            <div>
              <strong>
                Obras de interés
              </strong>

              <span>
                Selecciona obras propias o
                públicas.
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
   * INFORMACIÓN USUARIO
   * ---------------------------------------------------------
   */

  return (
    <section className="page-card configuracion-page">
      <div className="config-section-header">
        <button
          type="button"
          className="config-back-button"
          onClick={() =>
            setSection(null)
          }
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
