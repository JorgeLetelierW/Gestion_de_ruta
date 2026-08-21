import { parseWorkbookFile } from './api';

import type { AppData } from '../types';

/*
 * ---------------------------------------------------------
 * GOOGLE APPS SCRIPT
 * ---------------------------------------------------------
 */

const INTERVENCIONES_API =
  'https://script.google.com/macros/s/AKfycbwOYSdfyHnMajA_DJArhiWJFG8ARk76tGbz29ViZ2pDziddBiiHVPZhzxxPisU5960Rvg/exec';

/*
 * ---------------------------------------------------------
 * RESPUESTAS DEL APPS SCRIPT
 * ---------------------------------------------------------
 */

interface IntervencionesInfoResponse {
  ok: boolean;
  nombre?: string;
  archivoId?: string;
  fechaActualizacion?: string;
  urlDescarga?: string;
  error?: string;
}

interface IntervencionesArchivoResponse {
  ok: boolean;
  nombre?: string;
  archivoId?: string;
  fechaActualizacion?: string;
  mimeType?: string;
  base64?: string;
  error?: string;
}

/*
 * ---------------------------------------------------------
 * INFORMACIÓN DE LA ÚLTIMA PLANILLA
 * ---------------------------------------------------------
 *
 * Esta consulta NO descarga el Excel.
 *
 * Solamente obtiene:
 *
 * - nombre
 * - archivoId
 * - fechaActualizacion
 *
 * Por lo tanto es una consulta muy liviana.
 */

export async function obtenerInfoIntervenciones() {
  console.log(
    '[Intervenciones] Consultando última versión...',
  );

  const response = await fetch(
    INTERVENCIONES_API,
    {
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    throw new Error(
      `Error consultando Apps Script: ${response.status}`,
    );
  }

  const data =
    (await response.json()) as IntervencionesInfoResponse;

  if (!data.ok) {
    throw new Error(
      data.error ||
        'Apps Script no encontró una planilla válida.',
    );
  }

  if (
    !data.nombre ||
    !data.archivoId ||
    !data.fechaActualizacion
  ) {
    throw new Error(
      'Apps Script entregó información incompleta.',
    );
  }

  console.log(
    '[Intervenciones] Archivo disponible:',
    data.nombre,
  );

  console.log(
    '[Intervenciones] ID:',
    data.archivoId,
  );

  console.log(
    '[Intervenciones] Actualizado:',
    data.fechaActualizacion,
  );

  return {
    nombre: data.nombre,
    archivoId: data.archivoId,
    fechaActualizacion:
      data.fechaActualizacion,
  };
}

/*
 * ---------------------------------------------------------
 * DESCARGAR XLSX DESDE APPS SCRIPT
 * ---------------------------------------------------------
 *
 * Esta función sí solicita el Base64.
 *
 * Solo debemos llamarla cuando sabemos
 * que existe una versión nueva.
 */

async function obtenerArchivoIntervenciones() {
  console.log(
    '[Intervenciones] Descargando Excel...',
  );

  const url =
    `${INTERVENCIONES_API}?archivo=1`;

  const response = await fetch(
    url,
    {
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    throw new Error(
      `Error descargando Excel desde Apps Script: ${response.status}`,
    );
  }

  const data =
    (await response.json()) as IntervencionesArchivoResponse;

  if (!data.ok) {
    throw new Error(
      data.error ||
        'Apps Script no encontró un archivo válido.',
    );
  }

  if (
    !data.nombre ||
    !data.archivoId ||
    !data.fechaActualizacion ||
    !data.base64
  ) {
    throw new Error(
      'Apps Script no entregó correctamente el Excel.',
    );
  }

  return {
    nombre: data.nombre,
    archivoId: data.archivoId,
    fechaActualizacion:
      data.fechaActualizacion,
    mimeType:
      data.mimeType ||
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    base64: data.base64,
  };
}

/*
 * ---------------------------------------------------------
 * BASE64 → FILE
 * ---------------------------------------------------------
 */

function base64ToFile(
  base64: string,
  nombre: string,
  mimeType: string,
) {
  const binaryString =
    window.atob(base64);

  const bytes =
    new Uint8Array(
      binaryString.length,
    );

  for (
    let i = 0;
    i < binaryString.length;
    i += 1
  ) {
    bytes[i] =
      binaryString.charCodeAt(i);
  }

  return new File(
    [bytes],
    nombre,
    {
      type:
        mimeType ||
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
  );
}

/*
 * ---------------------------------------------------------
 * CARGAR INTERVENCIONES
 * ---------------------------------------------------------
 *
 * Esta función descarga y procesa realmente
 * el archivo Excel.
 */

export async function cargarIntervencionesAutomaticas(
  base: AppData,
) {
  console.log(
    '[Intervenciones] Iniciando carga del Excel...',
  );

  /*
   * 1. Descargar Excel.
   */

  const info =
    await obtenerArchivoIntervenciones();

  console.log(
    '[Intervenciones] Archivo:',
    info.nombre,
  );

  console.log(
    '[Intervenciones] Fecha actualización:',
    info.fechaActualizacion,
  );

  /*
   * 2. Reconstruir XLSX.
   */

  const file =
    base64ToFile(
      info.base64,
      info.nombre,
      info.mimeType,
    );

  console.log(
    '[Intervenciones] Excel reconstruido:',
    file.name,
    file.size,
    'bytes',
  );

  /*
   * 3. Utilizar el mismo parser
   * que utiliza la carga manual.
   */

  const result =
    await parseWorkbookFile(
      file,
      base,
      'works',
    );

  console.log(
    '[Intervenciones] Registros procesados:',
    result.total,
  );

  /*
   * 4. Devolver información procesada.
   */

  return {
    ...result,

    archivo:
      info.nombre,

    archivoId:
      info.archivoId,

    fechaActualizacion:
      info.fechaActualizacion,
  };
}

/*
 * ---------------------------------------------------------
 * COMPROBAR SI EXISTE UNA VERSIÓN NUEVA
 * ---------------------------------------------------------
 *
 * Esta será utilizada posteriormente por App.tsx
 * o por un hook automático.
 *
 * No descarga el Excel.
 */

export async function hayNuevaIntervencion(
  archivoIdActual?: string | null,
) {
  const info =
    await obtenerInfoIntervenciones();

  const hayNueva =
    !archivoIdActual ||
    archivoIdActual !== info.archivoId;

  if (hayNueva) {
    console.log(
      '[Intervenciones] Nueva versión detectada:',
      info.nombre,
    );
  } else {
    console.log(
      '[Intervenciones] La planilla está actualizada.',
    );
  }

  return {
    hayNueva,
    ...info,
  };
}
