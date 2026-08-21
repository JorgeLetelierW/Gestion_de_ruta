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
 * RESPUESTA DEL APPS SCRIPT
 * ---------------------------------------------------------
 */

interface IntervencionesApiResponse {
  ok: boolean;
  nombre: string;
  archivoId: string;
  fechaActualizacion: string;
  mimeType: string;
  base64: string;
  error?: string;
}

/*
 * ---------------------------------------------------------
 * OBTENER XLSX DESDE APPS SCRIPT
 * ---------------------------------------------------------
 */

async function obtenerArchivoIntervenciones() {
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
      `Error consultando Apps Script: ${response.status}`,
    );
  }

  const data =
    (await response.json()) as IntervencionesApiResponse;

  if (!data.ok) {
    throw new Error(
      data.error ||
        'Apps Script no encontró un archivo válido.',
    );
  }

  if (!data.base64) {
    throw new Error(
      'Apps Script no entregó el contenido del Excel.',
    );
  }

  return data;
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
  /*
   * Convertimos el texto Base64 nuevamente
   * a bytes binarios.
   */

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

  /*
   * Reconstruimos el XLSX como File.
   */

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
 * CARGAR INTERVENCIONES AUTOMÁTICAMENTE
 * ---------------------------------------------------------
 */

export async function cargarIntervencionesAutomaticas(
  base: AppData,
) {
  console.log(
    '[Intervenciones] Consultando Apps Script...',
  );

  /*
   * 1. Obtener Excel codificado en Base64.
   */

  const info =
    await obtenerArchivoIntervenciones();

  console.log(
    '[Intervenciones] Archivo disponible:',
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
   * 3. Utilizar exactamente el mismo parser
   *    que utiliza la carga manual.
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
   * 4. Devolver AppData actualizado.
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
