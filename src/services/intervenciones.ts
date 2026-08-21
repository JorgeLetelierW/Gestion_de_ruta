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
  urlDescarga: string;
}

/*
 * ---------------------------------------------------------
 * OBTENER INFORMACIÓN DEL ÚLTIMO ARCHIVO
 * ---------------------------------------------------------
 */

export async function obtenerUltimaIntervencion() {
  const response = await fetch(
    INTERVENCIONES_API,
    {
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    throw new Error(
      `Error consultando intervenciones: ${response.status}`,
    );
  }

  const data =
    (await response.json()) as IntervencionesApiResponse;

  if (!data.ok) {
    throw new Error(
      'Apps Script no encontró un archivo válido.',
    );
  }

  if (!data.urlDescarga) {
    throw new Error(
      'Apps Script no entregó una URL de descarga.',
    );
  }

  return data;
}

/*
 * ---------------------------------------------------------
 * DESCARGAR XLSX
 * ---------------------------------------------------------
 */

async function descargarArchivoIntervenciones(
  info: IntervencionesApiResponse,
) {
  const response = await fetch(
    info.urlDescarga,
    {
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    throw new Error(
      `No fue posible descargar el Excel: ${response.status}`,
    );
  }

  const blob = await response.blob();

  return new File(
    [blob],
    info.nombre || 'intervenciones.xlsx',
    {
      type:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
  );
}

/*
 * ---------------------------------------------------------
 * CARGAR INTERVENCIONES EN LA APP
 * ---------------------------------------------------------
 */

export async function cargarIntervencionesAutomaticas(
  base: AppData,
) {
  console.log(
    'Consultando última planilla de intervenciones...',
  );

  const info =
    await obtenerUltimaIntervencion();

  console.log(
    'Archivo disponible:',
    info.nombre,
  );

  console.log(
    'Actualizado:',
    info.fechaActualizacion,
  );

  const file =
    await descargarArchivoIntervenciones(info);

  console.log(
    'Excel descargado:',
    file.name,
    file.size,
    'bytes',
  );

  const result =
    await parseWorkbookFile(
      file,
      base,
      'works',
    );

  console.log(
    'Intervenciones procesadas:',
    result.total,
  );

  return {
    ...result,
    archivo: info.nombre,
    archivoId: info.archivoId,
    fechaActualizacion:
      info.fechaActualizacion,
  };
}
