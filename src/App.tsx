import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import LoginPage from './pages/LoginPage';
import ProtectedRoute from './auth/ProtectedRoute';

import Layout from './components/Layout';

import Dashboard from './pages/Dashboard';
import Carga from './pages/Carga';
import Infraestructura from './pages/Infraestructura';
import Trabajos from './pages/Trabajos';
import Clima from './pages/Clima';
import Rios from './pages/Rios';
import Configuracion from './pages/Configuracion';

import { RiverRiskProvider } from './context/RiverRiskContext';

import { emptyData } from './services/mockData';

import {
  cargarIntervencionesAutomaticas,
  obtenerInfoIntervenciones,
} from './services/intervenciones';

import type {
  AppData,
  LayerKey,
} from './types';

/*
 * ---------------------------------------------------------
 * CONFIGURACIÓN DE ACTUALIZACIÓN
 * ---------------------------------------------------------
 *
 * Cada 5 minutos consultamos solamente los metadatos
 * del último archivo.
 *
 * El Excel completo se descarga únicamente cuando cambia
 * el archivoId.
 */

const INTERVALO_INTERVENCIONES =
  5 * 60 * 1000;

/*
 * ---------------------------------------------------------
 * CAPAS VISIBLES INICIALMENTE
 * ---------------------------------------------------------
 */

const initVisible: Record<LayerKey, boolean> = {
  Troncal: false,
  Enlace: false,
  Pasarela: false,
  PMV: false,
  'Peaje lateral': false,
  Atravieso: false,
  Puente: false,
  Noche: false,
  Día: false,
};

/*
 * ---------------------------------------------------------
 * APP
 * ---------------------------------------------------------
 */

export default function App() {
  const [data, setData] =
    useState<AppData>(emptyData());

  const [visible, setVisible] =
    useState<Record<LayerKey, boolean>>(
      initVisible,
    );

  /*
   * -------------------------------------------------------
   * REFERENCIAS INTERNAS
   * -------------------------------------------------------
   *
   * archivoIdRef:
   * Guarda el ID del Excel que actualmente utiliza la app.
   *
   * cargandoRef:
   * Evita que dos comprobaciones se ejecuten
   * simultáneamente.
   */

  const archivoIdRef =
    useRef<string | null>(null);

  const cargandoRef =
    useRef(false);

  /*
   * -------------------------------------------------------
   * CARGA INICIAL + ACTUALIZACIÓN AUTOMÁTICA
   * -------------------------------------------------------
   */

  useEffect(() => {
    let cancelled = false;

    /*
     * -----------------------------------------------------
     * CARGAR EL XLSX
     * -----------------------------------------------------
     */

    const cargarArchivo = async () => {
      if (cargandoRef.current) {
        console.log(
          '[Intervenciones] Ya existe una carga en proceso.',
        );

        return;
      }

      cargandoRef.current = true;

      try {
        console.log(
          '[Intervenciones] Descargando planilla...',
        );

        /*
         * Usamos una base limpia.
         *
         * De esta forma los trabajos de la planilla anterior
         * son reemplazados por los de la nueva planilla.
         */

        const base =
          emptyData();

        const resultado =
          await cargarIntervencionesAutomaticas(
            base,
          );

        if (cancelled) {
          return;
        }

        /*
         * Actualizamos los datos utilizados
         * por toda la aplicación.
         */

        setData(
          resultado.data,
        );

        /*
         * Guardamos el ID de la versión
         * actualmente cargada.
         */

        archivoIdRef.current =
          resultado.archivoId;

        console.log(
          '[Intervenciones] Carga completada.',
        );

        console.log(
          '[Intervenciones] Archivo:',
          resultado.archivo,
        );

        console.log(
          '[Intervenciones] ID:',
          resultado.archivoId,
        );

        console.log(
          '[Intervenciones] Fecha actualización:',
          resultado.fechaActualizacion,
        );

        console.log(
          '[Intervenciones] Registros procesados:',
          resultado.total,
        );
      } catch (error) {
        console.error(
          '[Intervenciones] Error cargando planilla:',
          error,
        );
      } finally {
        cargandoRef.current =
          false;
      }
    };

    /*
     * -----------------------------------------------------
     * COMPROBAR SI EXISTE UNA VERSIÓN NUEVA
     * -----------------------------------------------------
     *
     * Esta función NO descarga el Excel.
     *
     * Solo consulta:
     *
     * - nombre
     * - archivoId
     * - fechaActualizacion
     */

    const comprobarActualizacion =
      async () => {
        /*
         * Si todavía estamos procesando un Excel,
         * no hacemos otra consulta.
         */

        if (cargandoRef.current) {
          return;
        }

        try {
          console.log(
            '[Intervenciones] Comprobando actualización...',
          );

          const info =
            await obtenerInfoIntervenciones();

          if (cancelled) {
            return;
          }

          /*
           * Si el ID es exactamente el mismo,
           * no descargamos nada.
           */

          if (
            archivoIdRef.current ===
            info.archivoId
          ) {
            console.log(
              '[Intervenciones] Sin cambios.',
            );

            return;
          }

          /*
           * Tenemos una versión diferente.
           */

          console.log(
            '[Intervenciones] Nueva versión detectada.',
          );

          console.log(
            '[Intervenciones] ID actual:',
            archivoIdRef.current,
          );

          console.log(
            '[Intervenciones] ID nuevo:',
            info.archivoId,
          );

          /*
           * Descargamos y procesamos
           * el nuevo XLSX.
           */

          await cargarArchivo();
        } catch (error) {
          /*
           * Si Apps Script falla temporalmente,
           * la aplicación conserva los datos
           * actualmente cargados.
           */

          console.error(
            '[Intervenciones] Error comprobando actualización:',
            error,
          );
        }
      };

    /*
     * -----------------------------------------------------
     * CARGA INICIAL
     * -----------------------------------------------------
     */

    cargarArchivo();

    /*
     * -----------------------------------------------------
     * TEMPORIZADOR
     * -----------------------------------------------------
     */

    const intervalId =
      window.setInterval(
        comprobarActualizacion,
        INTERVALO_INTERVENCIONES,
      );

    /*
     * -----------------------------------------------------
     * LIMPIEZA
     * -----------------------------------------------------
     */

    return () => {
      cancelled = true;

      window.clearInterval(
        intervalId,
      );
    };
  }, []);

  /*
   * -------------------------------------------------------
   * ACTIVAR / DESACTIVAR CAPAS
   * -------------------------------------------------------
   */

  const toggle = (key: LayerKey) => {
    setVisible((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  return (
    <Routes>

      {/* ===================================================
          LOGIN
          =================================================== */}

      <Route
        path="/"
        element={<LoginPage />}
      />

      {/* ===================================================
          APLICACIÓN PROTEGIDA
          =================================================== */}

      <Route element={<ProtectedRoute />}>

        <Route
          element={
            <RiverRiskProvider>
              <Layout
                data={data}
                visible={visible}
                setData={setData}
              />
            </RiverRiskProvider>
          }
        >

          {/* ===============================================
              MAPA SIN PANEL
              =============================================== */}

          <Route
            path="/mapa"
            element={null}
          />

          {/* ===============================================
              DASHBOARD
              =============================================== */}

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* ===============================================
              CARGA
              =============================================== */}

          <Route
            path="/carga"
            element={
              <Carga
                data={data}
                setData={setData}
              />
            }
          />

          {/* ===============================================
              INFRAESTRUCTURA
              =============================================== */}

          <Route
            path="/infraestructura"
            element={
              <Infraestructura
                visible={visible}
                onToggle={toggle}
              />
            }
          />

          {/* ===============================================
              TRABAJOS
              =============================================== */}

          <Route
            path="/trabajos"
            element={
              <Trabajos
                visible={visible}
                onToggle={toggle}
              />
            }
          />

          {/* ===============================================
              CLIMA
              =============================================== */}

          <Route
            path="/clima"
            element={<Clima />}
          />

          {/* ===============================================
              RÍOS
              =============================================== */}

          <Route
            path="/rios"
            element={<Rios />}
          />

          {/* ===============================================
              CONFIGURACIÓN
              =============================================== */}

          <Route
            path="/configuracion"
            element={<Configuracion />}
          />

        </Route>

      </Route>

      {/* ===================================================
          RUTA DESCONOCIDA
          =================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

    </Routes>
  );
}
