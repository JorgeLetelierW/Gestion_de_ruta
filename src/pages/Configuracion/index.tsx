import { useMemo, useState } from 'react';

import ModulePanel from '../../components/ModulePanel';
import actividadesCsv from '../../data/actividades.csv?raw';

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

interface ActividadCsv {
  tipoObra: string;
  actividad: string;
}

/* =========================================================
   CSV DE ACTIVIDADES
   ========================================================= */

function limpiarValor(value: string) {
  return value
    .replace(/^\uFEFF/, '')
    .replace(/^"|"$/g, '')
    .trim();
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];

  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        insideQuotes = !insideQuotes;
      }

      continue;
    }

    if (char === ',' && !insideQuotes) {
      values.push(limpiarValor(current));
      current = '';
      continue;
    }

    current += char;
  }

  values.push(limpiarValor(current));

  return values;
}

function loadActivities(csv: string): ActividadCsv[] {
  const cleanCsv = csv
    .replace(/^\uFEFF/, '')
    .replace(/\r/g, '');

  const lines = cleanCsv
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    console.error(
      'actividades.csv no contiene suficientes filas.',
    );

    return [];
  }

  const headers = parseCsvLine(lines[0]).map(
    (header) => header.toLowerCase().trim(),
  );

  console.log(
    'Encabezados actividades.csv:',
    headers,
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

  console.log('Columnas CSV:', {
    tipoIndex,
    actividadIndex,
  });

  if (
    tipoIndex === -1 ||
    actividadIndex === -1
  ) {
    console.error(
      'No fue posible encontrar Tipo de obra o Actividad.',
      headers,
    );

    return [];
  }

  const actividades = lines
    .slice(1)
    .map((line) => {
      const columns = parseCsvLine(line);

      return {
        tipoObra: limpiarValor(
          columns[tipoIndex] ?? '',
        ),
        actividad: limpiarValor(
          columns[actividadIndex] ?? '',
        ),
      };
    })
    .filter(
      (item) =>
        item.tipoObra !== '' &&
        item.actividad !== '',
    );

  console.log(
    'Actividades cargadas:',
    actividades.length,
  );

  console.log(
    'Primeras actividades:',
    actividades.slice(0, 5),
  );

  return actividades;
}

const ACTIVIDADES =
  loadActivities(actividadesCsv);

/* =========================================================
   OBRA VACÍA
   ========================================================= */

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

/* =========================================================
   COMPONENTE
   ========================================================= */

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

  /* =======================================================
     ANCHO DEL PANEL
     ======================================================= */

  const panelWidth = (() => {
    switch (section) {
      case 'nueva-obra':
        return '640px';

      case 'dashboard':
        return '600px';

      case 'usuario':
        return '520px';

      case 'obras':
        return '560px';

      default:
        return '560px';
    }
  })();

  /* =======================================================
     TIPOS DE OBRA
     ======================================================= */

  const tiposObra = useMemo(() => {
    const tipos = Array.from(
      new Set(
        ACTIVIDADES.map(
          (item) => item.tipoObra,
        ),
      ),
    );

    return tipos.sort((a, b) =>
      a.localeCompare(b, 'es'),
    );
  }, []);

  /* =======================================================
     ACTIVIDADES SEGÚN TIPO
     ======================================================= */

  const actividadesDisponibles =
    useMemo(() => {
      if (!obra.tipoObra) {
        return [];
      }

      const actividades =
        ACTIVIDADES
          .filter(
            (item) =>
              item.tipoObra ===
              obra.tipoObra,
          )
          .map(
            (item) =>
              item.actividad,
          );

      return Array.from(
        new Set(actividades),
      ).sort((a, b) =>
        a.localeCompare(b, 'es'),
      );
    }, [obra.tipoObra]);

  /* =======================================================
     CAMBIAR EJE
     ======================================================= */

  const setEje = (eje: Eje) => {
    setObra((current) => ({
      ...current,
      eje,
      km: '',
    }));

    setError('');
  };

  /* =======================================================
     VALIDAR KM
     ======================================================= */

  const validateKm = () => {
    const value = obra.km
      .trim()
      .replace(',', '.');

    const km = Number(value);

    if (
      value === '' ||
      Number.isNaN(km)
    ) {
      return 'Debes ingresar un punto kilométrico válido.';
    }

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

  /* =======================================================
     GUARDAR
     ======================================================= */

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
     * Todavía no se guarda en base de datos.
     */
    console.log(
      'Nueva obra preparada:',
      obra,
    );

    setMensaje(
      'Formulario válido. La obra está preparada para guardar.',
    );
  };

  /* =======================================================
     CONFIGURACIÓN PRINCIPAL
     ======================================================= */

  if (section === null) {
    return (
      <ModulePanel
        title="Configuración"
        width={panelWidth}
      >
        <div className="configuracion-page">
          <p className="config-description">
            Administra tus proyectos, preferencias del Dashboard
            y configuración de usuario.
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
                  Crear y administrar obras o actividades de interés.
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
                  Selecciona la información que deseas visualizar.
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
                  Modificar información de tu cuenta.
                </span>
              </div>

              <div className="config-menu-status">
                Próximamente
              </div>
            </button>
          </div>
        </div>
      </ModulePanel>
    );
  }

  /* =======================================================
     OBRAS DE INTERÉS
     ======================================================= */

  if (section === 'obras') {
    return (
      <ModulePanel
        title="Obras de interés"
        width={panelWidth}
      >
        <div className="configuracion-page">
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
              <p>
                Administra tus obras y actividades de interés.
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
        </div>
      </ModulePanel>
    );
  }

  /* =======================================================
     NUEVA OBRA
     ======================================================= */

  if (section === 'nueva-obra') {
    return (
      <ModulePanel
        title="Nueva obra"
        width={panelWidth}
      >
        <div className="configuracion-page">
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
              <p>
                Ingresa la información básica de la obra o actividad.
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
                  setObra((current) => ({
                    ...current,
                    nombre:
                      event.target.value,
                  }))
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
                  setObra((current) => ({
                    ...current,
                    contratista:
                      event.target.value,
                  }))
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
                  setObra((current) => ({
                    ...current,
                    responsable:
                      event.target.value,
                  }))
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
                  setObra((current) => ({
                    ...current,
                    km:
                      event.target.value,
                  }))
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
                onChange={(event) => {
                  const tipoSeleccionado =
                    event.target.value;

                  setObra((current) => ({
                    ...current,
                    tipoObra:
                      tipoSeleccionado,
                    actividad: '',
                  }));
                }}
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
                  setObra((current) => ({
                    ...current,
                    actividad:
                      event.target.value,
                  }))
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
                    setObra((current) => ({
                      ...current,
                      visibilidad:
                        'Privado',
                    }))
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
                    setObra((current) => ({
                      ...current,
                      visibilidad:
                        'Publico',
                    }))
                  }
                >
                  🌐 Público
                </button>
              </div>
            </div>

            {error && (
              <div className="config-form-error">
                {error}
              </div>
            )}

            {mensaje && (
              <div className="config-form-success">
                {mensaje}
              </div>
            )}

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
        </div>
      </ModulePanel>
    );
  }

  /* =======================================================
     PREFERENCIAS DASHBOARD
     ======================================================= */

  if (section === 'dashboard') {
    return (
      <ModulePanel
        title="Preferencias Dashboard"
        width={panelWidth}
      >
        <div className="configuracion-page">
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
              <p>
                Selecciona la información que deseas visualizar
                en el Dashboard.
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
                  Mostrar alertas relacionadas con los ríos monitoreados.
                </span>
              </div>

              <button
                type="button"
                className="config-toggle-placeholder"
                onClick={() =>
                  setRiverAlerts(
                    (current) =>
                      !current,
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
                  Selecciona obras propias o públicas.
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
                  Selecciona uno o varios sectores meteorológicos.
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
        </div>
      </ModulePanel>
    );
  }

  /* =======================================================
     INFORMACIÓN DEL USUARIO
     ======================================================= */

  return (
    <ModulePanel
      title="Información del usuario"
      width={panelWidth}
    >
      <div className="configuracion-page">
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
            <p>
              Administración de la información asociada a tu cuenta.
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
            Este módulo será incorporado en una actualización posterior.
          </span>
        </div>
      </div>
    </ModulePanel>
  );
}
