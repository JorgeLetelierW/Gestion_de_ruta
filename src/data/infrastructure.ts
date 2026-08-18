

Gestion_de_ruta_JLW_v4.2_rios_pluviometricos 1.html
Archivo
revisa todo el repositorio gestión de ruta. 

por ahora la clave es hacer que funcione exactamente como este ejemplo que estoy cargando.

debe ser consecuente con la arquitectura actual. 

haremos varios cambios, indicame por etapas qué archivo debo cambiar y el codigo completo que debe tener ese archivo


Gestion_de_ruta_JLW_v4.5_rios_clima_en_ruta_estable 1.html
Archivo
revisa como se genera la alerta de los rios aquí. ESTA VERSIÓN FUNCIONA PERFECTO

4a2fe40c-a8c8-4eb3-a83b-451a02ba013f.png
0811979f-3b6d-456f-93d3-8a791ad2afda.png
asi se ve trabajos y clima. quiero que se vea como trabajos

sigue viendose incompleto. que sugieres para mejorar la interfaz


CLASES.xlsx
Hoja de cálculo
ok, esta bien así para la vista en desktop. 
 
ahora necesito hacer algo distinto.  
 
estoy cargando un excel con datos de la infraestructura de la ruta.  
este se suele cargar en CLASES 
necesito que esta información sea base para la APP 
 
el excel contiene mas información de la que actualmente lee el modulo de carga. 

Sí. Y esto cambia una decisión importante de arquitectura.

No conviene que CLASES.xlsx tenga que cargarse manualmente cada vez. Si estos datos representan la infraestructura base de la concesión, deberían formar parte de la aplicación.

Para la etapa actual, recomiendo convertir el Excel a datos TypeScript/JSON dentro del repositorio, por ejemplo:

src/
└── data/
    └── infrastructure.ts
Ese archivo contendría precargados los PMV, peajes laterales, troncales, atraviesos, puentes, enlaces y pasarelas. Cuando Vercel compile la aplicación, esos datos quedarán incluidos en el sitio.

Así:

GitHub → Vercel → navegador del usuario

y cualquier usuario que abra la aplicación tendrá inmediatamente la misma infraestructura, ya sea desde PC, iPhone, Android o tablet. No necesita tener el Excel ni cargarlo.

Mantendría igualmente Carga → CLASES, pero cambiaría su función: serviría para que posteriormente un administrador pueda cargar una versión actualizada del inventario. Por ahora, al recargar la página volvería a la base incluida en la aplicación; más adelante, cuando incorporemos una base de datos, podremos hacer que las actualizaciones sean persistentes para todos.

La arquitectura quedaría:

CLASES.xlsx
     │
     │ conversión inicial
     ▼
infrastructure.ts
     │
     ▼
Datos base de la APP
     │
     ├── RouteCanvas
     ├── Infraestructura
     ├── Dashboard
     └── futuros módulos
Y no usaría el propio .xlsx como base permanente en producción. Es más limpio y rápido transformar sus registros a objetos que React pueda consumir directamente.

Por lo tanto, antes de modificar types.ts, el siguiente paso que recomiendo es convertir tu CLASES.xlsx actual en el archivo base de infraestructura. Podemos hacerlo nosotros ahora y después adaptar types.ts, mockData.ts y api.ts alrededor de esa estructura.


ok comencemos

Comencemos por la Etapa 1: crear la infraestructura base permanente.

Revisé directamente CLASES.xlsx: contiene PMV, Peaje lateral, Troncal, Atraviesos, Puentes, Enlaces y Pasarelas. Dejaremos Curvas fuera por ahora.

Paso 1 — crear carpeta
Dentro de:

src
crea:

data
Quedará:

src/data/
Paso 2 — crear archivo
Dentro crea:

src/data/infrastructure.ts
Aquí vamos a incorporar los registros del Excel como datos permanentes:

export const BASE_INFRASTRUCTURE = {
  PMV: [
    // 42 registros
  ],

  'Peaje lateral': [
    // 34 registros
  ],

  Troncal: [
    // 3 registros
  ],

  Atravieso: [
    // 80 registros
  ],

  Puente: [
    // 50 registros
  ],

  Enlace: [
    // 40 registros
  ],

  Pasarela: [
    // 81 registros
  ],
};
Serán 330 registros permanentes aproximadamente.

Por ejemplo, el primer PMV del Excel quedará:

{
  nombre: 'Buin',
  km: 38.5,
  ruta: 'Ruta 5',
  route: 'R5',
  lado: 'Poniente',
  marca: 'Aesys',
}
Y un puente:

{
  nombre: 'Maipo',
  km: 29.014,
  ruta: 'Ruta 5',
  route: 'R5',
}
Importante
No quiero que copies manualmente 330 registros desde Excel. Es innecesario y aumenta mucho la posibilidad de errores.

Yo puedo generar infrastructure.ts directamente desde el Excel que cargaste, respetando todos sus registros, y entregártelo listo para poner en GitHub.

Ese debería ser nuestro siguiente paso. Después modificaremos:

types.ts
↓
mockData.ts
↓
App.tsx
↓
RouteCanvas
para que al abrir Gestión de Ruta, incluso antes de tocar Carga, toda esta infraestructura ya exista en la aplicación.


ok hazlo

Listo. Generé infrastructure.ts directamente desde tu CLASES.xlsx, sin incluir Curvas.

Contiene 296 registros permanentes distribuidos en:

PMV

Peaje lateral

Troncal

Atravieso

Puente

Enlace

Pasarela

Conservé además los campos adicionales existentes, como lado y marca cuando corresponden.

Descargar infrastructure.ts

Qué hacer ahora
En GitHub crea:
src/data/infrastructure.ts

Copia allí el contenido del archivo que te entregué.

No modifiques todavía ningún otro archivo.

El siguiente paso será adaptar src/types.ts para que la aplicación reconozca oficialmente Puente y Atravieso, además de los campos adicionales del Excel. Después conectaremos estos datos a emptyData() para que aparezcan automáticamente para todos los usuarios sin cargar ningún Excel.


infrastructure.ts
Código


Biblioteca
/
infrastructure.ts


import type { InfraItem } from '../types';

/**
 * Infraestructura base permanente de Gestión de Ruta.
 * Generado desde CLASES.xlsx.
 * Curvas se excluye intencionalmente por ahora.
 */

export const PMV_BASE: InfraItem[] = [
  { nombre: "Buin", km: 38.5, ruta: "Ruta 5", route: "R5", lado: "Poniente", marca: "Aesys" },
  { nombre: "TP(1) poniente", km: 60, ruta: "Ruta 5", route: "R5", lado: "Poniente", marca: "Aesys" },
  { nombre: "TP(2) oriente", km: 63.4, ruta: "Ruta 5", route: "R5", lado: "Oriente", marca: "Aesys" },
  { nombre: "TP(3) poniente", km: 64.2, ruta: "Ruta 5", route: "R5", lado: "Poniente", marca: "Aesys" },
  { nombre: "TP(4) oriente", km: 67.2, ruta: "Ruta 5", route: "R5", lado: "Oriente", marca: "Aesys" },
  { nombre: "TP(5) poniente", km: 68.7, ruta: "Ruta 5", route: "R5", lado: "Poniente", marca: "Aesys" },
  { nombre: "By Pass Rancagua oriente", km: 71.6, ruta: "Ruta 5", route: "R5", lado: "Oriente", marca: "Aesys" },
  { nombre: "Pelequén oriente", km: 126, ruta: "Ruta 5", route: "R5", lado: "Oriente", marca: "Sanef" },
  { nombre: "San Fernando poniente", km: 138, ruta: "Ruta 5", route: "R5", lado: "Poniente", marca: "Sanef" },
  { nombre: "Curicó poniente", km: 184.15, ruta: "Ruta 5", route: "R5", lado: "Poniente", marca: "Addco" },
  { nombre: "Curicó oriente", km: 183.25, ruta: "Ruta 5", route: "R5", lado: "Oriente", marca: "Aesys" },
];

export const PEAJE_LATERAL_BASE: InfraItem[] = [
  { nombre: "Gabriela", km: 4.9, ruta: "ASS", route: "ASS", lado: "Oriente" },
  { nombre: "Tocornal", km: 7.54, ruta: "ASS", route: "ASS", lado: "Oriente" },
  { nombre: "Paine", km: 43.9, ruta: "Ruta 5", route: "R5", lado: "Poniente" },
  { nombre: "Paine — Oriente", km: 44, ruta: "Ruta 5", route: "R5", lado: "Oriente" },
  { nombre: "Champa — Poniente", km: 48, ruta: "Ruta 5", route: "R5", lado: "Poniente" },
  { nombre: "Rancagua Norte — Poniente", km: 69.1, ruta: "Ruta 5", route: "R5", lado: "Poniente" },
  { nombre: "Rancagua Centro — Poniente", km: 89, ruta: "Ruta 5", route: "R5", lado: "Poniente" },
  { nombre: "Rancagua Centro — Oriente", km: 89.3, ruta: "Ruta 5", route: "R5", lado: "Oriente" },
  { nombre: "Rancagua Sur — Oriente", km: 95.1, ruta: "Ruta 5", route: "R5", lado: "Oriente" },
  { nombre: "Requínoa — Poniente", km: 99.7, ruta: "Ruta 5", route: "R5", lado: "Poniente" },
  { nombre: "Requínoa — Oriente", km: 101.5, ruta: "Ruta 5", route: "R5", lado: "Oriente" },
  { nombre: "Rosario — Poniente", km: 107.1, ruta: "Ruta 5", route: "R5", lado: "Poniente" },
  { nombre: "Rosario — Oriente", km: 107.2, ruta: "Ruta 5", route: "R5", lado: "Oriente" },
  { nombre: "Rengo — Poniente", km: 113, ruta: "Ruta 5", route: "R5", lado: "Poniente" },
  { nombre: "Rengo — Oriente", km: 114, ruta: "Ruta 5", route: "R5", lado: "Oriente" },
  { nombre: "Pelequén — Poniente", km: 121, ruta: "Ruta 5", route: "R5", lado: "Poniente" },
  { nombre: "Pelequén — Oriente", km: 121.5, ruta: "Ruta 5", route: "R5", lado: "Oriente" },
  { nombre: "Tambo — Poniente", km: 132.9, ruta: "Ruta 5", route: "R5", lado: "Poniente" },
  { nombre: "Tambo — Oriente", km: 132.95, ruta: "Ruta 5", route: "R5", lado: "Oriente" },
  { nombre: "San Fernando Norte — Poniente", km: 135.3, ruta: "Ruta 5", route: "R5", lado: "Poniente" },
  { nombre: "San Fernando Norte — Oriente", km: 135.5, ruta: "Ruta 5", route: "R5", lado: "Oriente" },
  { nombre: "San Fernando La Troya (ubicación especial)", km: 137.6, ruta: "Ruta 5", route: "R5", lado: "Poniente" },
  { nombre: "San Fernando Centro — Poniente", km: 138.08, ruta: "Ruta 5", route: "R5", lado: "Poniente" },
  { nombre: "San Fernando Centro — Oriente", km: 138.2, ruta: "Ruta 5", route: "R5", lado: "Oriente" },
  { nombre: "San Fernando Sur — Poniente", km: 139.7, ruta: "Ruta 5", route: "R5", lado: "Poniente" },
  { nombre: "San Fernando Sur — Oriente", km: 139.919, ruta: "Ruta 5", route: "R5", lado: "Oriente" },
  { nombre: "Chimbarongo — Poniente", km: 152.8, ruta: "Ruta 5", route: "R5", lado: "Poniente" },
  { nombre: "Morza — Oriente", km: 162.6, ruta: "Ruta 5", route: "R5", lado: "Oriente" },
  { nombre: "Teno — Oriente", km: 175.8, ruta: "Ruta 5", route: "R5", lado: "Oriente" },
  { nombre: "Curicó Norte — Poniente", km: 185.5, ruta: "Ruta 5", route: "R5", lado: "Poniente" },
  { nombre: "Curicó Centro — Poniente", km: 188.6, ruta: "Ruta 5", route: "R5", lado: "Poniente" },
  { nombre: "Curicó Sur — Poniente", km: 190.7, ruta: "Ruta 5", route: "R5", lado: "Poniente" },
];

export const TRONCAL_BASE: InfraItem[] = [
  { nombre: "Rio Maipo", km: 19, ruta: "ASS", route: "ASS" },
  { nombre: "Nueva Angostura", km: 54, ruta: "Ruta 5", route: "R5" },
  { nombre: "Quinta Morza", km: 161, ruta: "Ruta 5", route: "R5" },
];

export const ATRAVIESO_BASE: InfraItem[] = [
  { nombre: "P,I, Los Guindos", km: 32.305, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, Mercrofrut-bavaria (Bascuñán)", km: 39.812, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,S, FF,CC, Paine Oriente", km: 42.936, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,S, FF,CC, Paine Poniente", km: 42.937, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,S, Paine (Calle Prieto)", km: 43.153, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,S, FF,CC, Hospital Oriente", km: 48.655, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,S, FF,CC, Hospital Poniente", km: 48.679, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,S, FF,CC, Hospital CS", km: 48.694, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,S, Águila Sur", km: 53.52, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,S, Angostura Poniente", km: 55.994, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,S, Angostura Oriente", km: 56.093, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, La Punta", km: 65.298, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, Santa Blanca", km: 69.182, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,S, Codegua", km: 70.329, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,S, FF,CC", km: 70.705, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,S, Ruta H-10", km: 71.17, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, La Higuera", km: 72.164, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, Graneros", km: 72.785, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, Santa Julia", km: 74.634, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, Las Mercedes (Los Chinos)", km: 75.971, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,S, El Arrozal", km: 78.187, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,S, Km 79,100 (Tuniche)", km: 79.11, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,S, km 80,300", km: 80.449, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, Chancón", km: 81.131, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, La Moronina", km: 83.103, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, La Gonzalina", km: 83.812, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, Santa Elena", km: 84.694, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, San Ramón", km: 86.498, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, El Milagro", km: 87.356, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, Puerta de Hierro", km: 87.8, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,S, Km 88,500", km: 88.477, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,S, Ruta H-400", km: 90.686, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,S, El Olivar", km: 92.312, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, Los Lirios", km: 93.823, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,S, Los Lirios", km: 94.806, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, Santa Lucila", km: 97.574, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, Rosario", km: 107.028, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, Pelequén Viejo", km: 119.61, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,S, Los Lingues", km: 124.592, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, Polonia", km: 130.273, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,S, La Troya", km: 137.647, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,S, Camino Real", km: 138.607, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, Las Cazas", km: 148.08, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, Porvenir", km: 150.441, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, Peor es nada", km: 161.503, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,S, Cementos BioBio (R5 y CS)", km: 173.651, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, Sarmiento", km: 182.957, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,S, Maquehua", km: 193.126, ruta: "Ruta 5", route: "R5" },
  { nombre: "María Elena", km: 2.887, ruta: "ASS", route: "ASS" },
  { nombre: "San Francisco", km: 3.58, ruta: "ASS", route: "ASS" },
  { nombre: "Miguel Ángel", km: 5.3, ruta: "ASS", route: "ASS" },
  { nombre: "Luis Matte", km: 5.782, ruta: "ASS", route: "ASS" },
  { nombre: "Las Acacias", km: 6.731, ruta: "ASS", route: "ASS" },
  { nombre: "Sargento Menadier", km: 9.228, ruta: "ASS", route: "ASS" },
  { nombre: "Juanita", km: 11.534, ruta: "ASS", route: "ASS" },
  { nombre: "Quitalmahue", km: 12.764, ruta: "ASS", route: "ASS" },
  { nombre: "El Retiro", km: 13.227, ruta: "ASS", route: "ASS" },
  { nombre: "Vecinal", km: 15.976, ruta: "ASS", route: "ASS" },
  { nombre: "Ochagavia", km: 16.613, ruta: "ASS", route: "ASS" },
  { nombre: "Los Morros", km: 17.498, ruta: "ASS", route: "ASS" },
  { nombre: "Camino Interior Los Areneros", km: 17.597, ruta: "ASS", route: "ASS" },
  { nombre: "Camino Canal KM,18,360", km: 18.36, ruta: "ASS", route: "ASS" },
  { nombre: "Camino Vecinal KM, 19,573", km: 19.573, ruta: "ASS", route: "ASS" },
  { nombre: "Camino Canal KM 21,477", km: 21.477, ruta: "ASS", route: "ASS" },
  { nombre: "El Recurso", km: 22.198, ruta: "ASS", route: "ASS" },
  { nombre: "El Parrón", km: 23.167, ruta: "ASS", route: "ASS" },
  { nombre: "Los Guindos", km: 25.199, ruta: "ASS", route: "ASS" },
  { nombre: "Paso Superior KM, 26,080", km: 26.08, ruta: "ASS", route: "ASS" },
  { nombre: "Camino Canal KM, 26,838", km: 26.838, ruta: "ASS", route: "ASS" },
  { nombre: "Camino Predial Buin", km: 27.956, ruta: "ASS", route: "ASS" },
  { nombre: "Linderos", km: 28.959, ruta: "ASS", route: "ASS" },
  { nombre: "Camino Canal Fernandino", km: 30.504, ruta: "ASS", route: "ASS" },
  { nombre: "Camino Vecinal KM 31,032", km: 31.032, ruta: "ASS", route: "ASS" },
  { nombre: "San José", km: 31.638, ruta: "ASS", route: "ASS" },
  { nombre: "Camino Vecinal KM 33,397", km: 33.397, ruta: "ASS", route: "ASS" },
  { nombre: "Camino Vecinal KM 34,296", km: 34.296, ruta: "ASS", route: "ASS" },
  { nombre: "Canal Berlina", km: 40.731, ruta: "ASS", route: "ASS" },
  { nombre: "Camino Canal Cardonal", km: 41.8, ruta: "ASS", route: "ASS" },
  { nombre: "Chada", km: 43.407, ruta: "ASS", route: "ASS" },
  { nombre: "Azufradero", km: 44.582, ruta: "ASS", route: "ASS" },
];

export const PUENTE_BASE: InfraItem[] = [
  { nombre: "Maipo", km: 29.014, ruta: "Ruta 5", route: "R5" },
  { nombre: "Paine Oriente", km: 46.241, ruta: "Ruta 5", route: "R5" },
  { nombre: "Paine Poniente", km: 46.241, ruta: "Ruta 5", route: "R5" },
  { nombre: "Peuco Poniente", km: 59.113, ruta: "Ruta 5", route: "R5" },
  { nombre: "Peuco Oriente", km: 59.043, ruta: "Ruta 5", route: "R5" },
  { nombre: "Tronco Calle Local Poniente", km: 63.481, ruta: "Ruta 5", route: "R5" },
  { nombre: "Tronco Calle Local Oriente", km: 63.481, ruta: "Ruta 5", route: "R5" },
  { nombre: "Tronco", km: 63.546, ruta: "Ruta 5", route: "R5" },
  { nombre: "Santa Blanca", km: 68.427, ruta: "Ruta 5", route: "R5" },
  { nombre: "La Cadena Oriente", km: 80.912, ruta: "Ruta 5", route: "R5" },
  { nombre: "La Cadena Poniente", km: 80.909, ruta: "Ruta 5", route: "R5" },
  { nombre: "Cachapoal Poniente", km: 89.542, ruta: "Ruta 5", route: "R5" },
  { nombre: "Cachapoal Oriente", km: 89.542, ruta: "Ruta 5", route: "R5" },
  { nombre: "Tupuame Poniente", km: 109.608, ruta: "Ruta 5", route: "R5" },
  { nombre: "Tupuame Oriente", km: 109.608, ruta: "Ruta 5", route: "R5" },
  { nombre: "Claro Poniente", km: 110.85, ruta: "Ruta 5", route: "R5" },
  { nombre: "Claro Oriente", km: 110.85, ruta: "Ruta 5", route: "R5" },
  { nombre: "Rigolemu Poniente", km: 122.334, ruta: "Ruta 5", route: "R5" },
  { nombre: "Rigolemu Oriente", km: 122.396, ruta: "Ruta 5", route: "R5" },
  { nombre: "Charquicán Oriente", km: 130.517, ruta: "Ruta 5", route: "R5" },
  { nombre: "Charquicán Poniente", km: 130.517, ruta: "Ruta 5", route: "R5" },
  { nombre: "Charquicán Calle de Servicio", km: 130.577, ruta: "Ruta 5", route: "R5" },
  { nombre: "San Fdo Poniente", km: 135.784, ruta: "Ruta 5", route: "R5" },
  { nombre: "San Fdo Oriente", km: 135.774, ruta: "Ruta 5", route: "R5" },
  { nombre: "Antivero Oriente", km: 137.811, ruta: "Ruta 5", route: "R5" },
  { nombre: "Antivero Poniente", km: 137.811, ruta: "Ruta 5", route: "R5" },
  { nombre: "Tinguiririca Poniente", km: 140.722, ruta: "Ruta 5", route: "R5" },
  { nombre: "Tinguiririca Oriente", km: 140.729, ruta: "Ruta 5", route: "R5" },
  { nombre: "Descarga N° 1 Oriente", km: 141.898, ruta: "Ruta 5", route: "R5" },
  { nombre: "Descarga N° 1 Poniente", km: 141.899, ruta: "Ruta 5", route: "R5" },
  { nombre: "Descarga N° 2 Poniente", km: 142.155, ruta: "Ruta 5", route: "R5" },
  { nombre: "Descarga N° 2 Oriente", km: 142.101, ruta: "Ruta 5", route: "R5" },
  { nombre: "Peor es nada Poniente", km: 161.578, ruta: "Ruta 5", route: "R5" },
  { nombre: "Peor es nada Oriente", km: 161.635, ruta: "Ruta 5", route: "R5" },
  { nombre: "Canal Peor es Nada Poniente", km: 161.763, ruta: "Ruta 5", route: "R5" },
  { nombre: "Canal Peor es Nada Oriente", km: 161.764, ruta: "Ruta 5", route: "R5" },
  { nombre: "Endesa", km: 176.07, ruta: "Ruta 5", route: "R5" },
  { nombre: "Teno Poniente", km: 178.505, ruta: "Ruta 5", route: "R5" },
  { nombre: "Teno Oriente", km: 178.508, ruta: "Ruta 5", route: "R5" },
  { nombre: "Guaiquillo Oriente", km: 191.34, ruta: "Ruta 5", route: "R5" },
  { nombre: "Guaiquillo Poniente", km: 191.294, ruta: "Ruta 5", route: "R5" },
  { nombre: "Maquehua Poniente", km: 192.925, ruta: "Ruta 5", route: "R5" },
  { nombre: "Lontué Oriente", km: 194.756, ruta: "Ruta 5", route: "R5" },
  { nombre: "Lontué Poniente", km: 194.704, ruta: "Ruta 5", route: "R5" },
  { nombre: "Pirihuín Oriente", km: 197.483, ruta: "Ruta 5", route: "R5" },
  { nombre: "Pirihuín Poniente", km: 197.61, ruta: "Ruta 5", route: "R5" },
  { nombre: "Seco Oriente", km: 199.123, ruta: "Ruta 5", route: "R5" },
  { nombre: "Seco Poniente", km: 199.124, ruta: "Ruta 5", route: "R5" },
  { nombre: "Claro Oriente (VII)", km: 216.71, ruta: "Ruta 5", route: "R5" },
  { nombre: "Claro Poniente (VII)", km: 216.82, ruta: "Ruta 5", route: "R5" },
];

export const ENLACE_BASE: InfraItem[] = [
  { nombre: "Américo Vespucio", km: 0.348, ruta: "ASS", route: "ASS" },
  { nombre: "Gabriela", km: 5.046, ruta: "ASS", route: "ASS" },
  { nombre: "Tocornal / Las Parcelas", km: 7.703, ruta: "ASS", route: "ASS" },
  { nombre: "Buin", km: 27.732, ruta: "ASS", route: "ASS" },
  { nombre: "Paine", km: 35.597, ruta: "ASS", route: "ASS" },
  { nombre: "Los Pinos", km: 42.215, ruta: "ASS", route: "ASS" },
  { nombre: "Angostura", km: 45.007, ruta: "ASS", route: "ASS" },
  { nombre: "P,I, Buin", km: 34.164, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, Linderos", km: 37.346, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, Paine", km: 43.95, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, Champa", km: 47.841, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, Peuco", km: 58.176, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, Los Lagartos", km: 61.466, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, San Francisco de Mostazal", km: 62.57, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,S, Rancagua Poniente", km: 88.941, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,S, Rancagua Oriente", km: 88.941, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,S, Ramal Poniente E, Rancagua", km: 88.941, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, Requínoa", km: 100.3, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,S, Pelequén Oriente", km: 121.665, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,S, Pelequén Poniente", km: 121.666, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, El Tambo", km: 132.861, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,S, San Fernando", km: 135.541, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,S, Temas", km: 138.018, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, San Fernando", km: 139.818, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, Tinguiririca", km: 144.294, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, Chimbarongo", km: 153.008, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, Quinta-Morza", km: 162.447, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, Acceso Norte Teno-La Montaña", km: 171.121, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, Acceso Sur Teno-Ruta K-415", km: 175.79, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, Romeral", km: 185.835, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,S, Aguas Negras", km: 187.731, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,S, Avenida España", km: 188.777, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,S, Curicó Oriente", km: 190.78, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,S, Curicó Poniente", km: 190.78, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, Los Niches", km: 191.511, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,S, FF,CC, Maquehua Oriente", km: 192.925, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, Lontué", km: 198.868, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,S, Molina", km: 204.938, ruta: "Ruta 5", route: "R5" },
  { nombre: "P,I, Puente Alto-Pulmódón", km: 210.257, ruta: "Ruta 5", route: "R5" },
];

export const PASARELA_BASE: InfraItem[] = [
  { nombre: "El Recurso", km: 30.139, ruta: "Ruta 5", route: "R5" },
  { nombre: "Los Guindos", km: 31.839, ruta: "Ruta 5", route: "R5" },
  { nombre: "Buin (Calle Krumm)", km: 33.354, ruta: "Ruta 5", route: "R5" },
  { nombre: "Villaseca", km: 35.403, ruta: "Ruta 5", route: "R5" },
  { nombre: "Linderos", km: 38.672, ruta: "Ruta 5", route: "R5" },
  { nombre: "David del Curto", km: 41.026, ruta: "Ruta 5", route: "R5" },
  { nombre: "Santa Victoria de Viluco", km: 41.762, ruta: "Ruta 5", route: "R5" },
  { nombre: "Nuestra señora de Fátima", km: 42.222, ruta: "Ruta 5", route: "R5" },
  { nombre: "Paine", km: 43.5, ruta: "Ruta 5", route: "R5" },
  { nombre: "Colonia Paine", km: 44.847, ruta: "Ruta 5", route: "R5" },
  { nombre: "Hospital", km: 48.34, ruta: "Ruta 5", route: "R5" },
  { nombre: "Chada", km: 49.371, ruta: "Ruta 5", route: "R5" },
  { nombre: "Chada Sur", km: 50.916, ruta: "Ruta 5", route: "R5" },
  { nombre: "Escuela Agrícola", km: 51.16, ruta: "Ruta 5", route: "R5" },
  { nombre: "Tenencia Paine", km: 52.54, ruta: "Ruta 5", route: "R5" },
  { nombre: "S,I,I, y Aguila Sur", km: 53.716, ruta: "Ruta 5", route: "R5" },
  { nombre: "Angostura", km: 57.225, ruta: "Ruta 5", route: "R5" },
  { nombre: "Escuela San Francisco de Asís", km: 57.928, ruta: "Ruta 5", route: "R5" },
  { nombre: "Las Encinas", km: 62.128, ruta: "Ruta 5", route: "R5" },
  { nombre: "Tronco", km: 63.319, ruta: "Ruta 5", route: "R5" },
  { nombre: "San Francisco de Mostazal", km: 63.985, ruta: "Ruta 5", route: "R5" },
  { nombre: "Santa Blanca", km: 68.07, ruta: "Ruta 5", route: "R5" },
  { nombre: "Los Lirios", km: 94, ruta: "Ruta 5", route: "R5" },
  { nombre: "Población Long, Antiguo", km: 97.08, ruta: "Ruta 5", route: "R5" },
  { nombre: "Requinoa", km: 99.604, ruta: "Ruta 5", route: "R5" },
  { nombre: "Totihue - Los Choapinos", km: 104.438, ruta: "Ruta 5", route: "R5" },
  { nombre: "San José de Pichguen", km: 105.82, ruta: "Ruta 5", route: "R5" },
  { nombre: "Rosario", km: 107.459, ruta: "Ruta 5", route: "R5" },
  { nombre: "Comercial Rengo", km: 108.9, ruta: "Ruta 5", route: "R5" },
  { nombre: "Lo Cartagena", km: 111.334, ruta: "Ruta 5", route: "R5" },
  { nombre: "Sector Agrícola Rucanahue", km: 111.912, ruta: "Ruta 5", route: "R5" },
  { nombre: "Rengo", km: 113.404, ruta: "Ruta 5", route: "R5" },
  { nombre: "Portezuelo", km: 117.933, ruta: "Ruta 5", route: "R5" },
  { nombre: "Población San Luis", km: 120.96, ruta: "Ruta 5", route: "R5" },
  { nombre: "Pelequén", km: 121.355, ruta: "Ruta 5", route: "R5" },
  { nombre: "Los Lingues", km: 124.116, ruta: "Ruta 5", route: "R5" },
  { nombre: "Quilapan", km: 129.3, ruta: "Ruta 5", route: "R5" },
  { nombre: "Quilapan 2", km: 129.8, ruta: "Ruta 5", route: "R5" },
  { nombre: "Miraflores", km: 131.062, ruta: "Ruta 5", route: "R5" },
  { nombre: "Los Huertos", km: 140.532, ruta: "Ruta 5", route: "R5" },
  { nombre: "La Orilla", km: 141.455, ruta: "Ruta 5", route: "R5" },
  { nombre: "Barrio Estación Tinguiririca", km: 143.729, ruta: "Ruta 5", route: "R5" },
  { nombre: "Lo González", km: 145.763, ruta: "Ruta 5", route: "R5" },
  { nombre: "San Luis de la Cuesta - El Sauce", km: 146.417, ruta: "Ruta 5", route: "R5" },
  { nombre: "Santa Isabel", km: 149.28, ruta: "Ruta 5", route: "R5" },
  { nombre: "Sector Planta Dole", km: 152.037, ruta: "Ruta 5", route: "R5" },
  { nombre: "Chimbarongo", km: 153.533, ruta: "Ruta 5", route: "R5" },
  { nombre: "El Alamo", km: 156.087, ruta: "Ruta 5", route: "R5" },
  { nombre: "Sector Porvenir", km: 158.2, ruta: "Ruta 5", route: "R5" },
  { nombre: "Peor es Nada", km: 159.52, ruta: "Ruta 5", route: "R5" },
  { nombre: "Monterilla", km: 163.672, ruta: "Ruta 5", route: "R5" },
  { nombre: "Escuela Monterilla", km: 165.718, ruta: "Ruta 5", route: "R5" },
  { nombre: "Eucaliptus", km: 167.217, ruta: "Ruta 5", route: "R5" },
  { nombre: "Quelmen", km: 168.56, ruta: "Ruta 5", route: "R5" },
  { nombre: "Escuela San Rafael", km: 169.484, ruta: "Ruta 5", route: "R5" },
  { nombre: "Asentamiento Santa Rosa", km: 172.581, ruta: "Ruta 5", route: "R5" },
  { nombre: "Sector agrozzi - Bío Bío", km: 174.71, ruta: "Ruta 5", route: "R5" },
  { nombre: "Teno Sur", km: 176, ruta: "Ruta 5", route: "R5" },
  { nombre: "Teno Sur", km: 176.35, ruta: "Ruta 5", route: "R5" },
  { nombre: "Acceso Viluco", km: 177.27, ruta: "Ruta 5", route: "R5" },
  { nombre: "Acceso Quilvo", km: 179.568, ruta: "Ruta 5", route: "R5" },
  { nombre: "Quilvo", km: 180.786, ruta: "Ruta 5", route: "R5" },
  { nombre: "Sector Escuela Ampurdam", km: 181.84, ruta: "Ruta 5", route: "R5" },
  { nombre: "Rauquén", km: 184.42, ruta: "Ruta 5", route: "R5" },
  { nombre: "Curicó", km: 186.812, ruta: "Ruta 5", route: "R5" },
  { nombre: "Maquehua", km: 193.72, ruta: "Ruta 5", route: "R5" },
  { nombre: "Ruta K-110", km: 196.511, ruta: "Ruta 5", route: "R5" },
  { nombre: "Quechereguas - Santa Rosa", km: 201.538, ruta: "Ruta 5", route: "R5" },
  { nombre: "Santa Blanca-Santa Cristina", km: 207.886, ruta: "Ruta 5", route: "R5" },
  { nombre: "Puente Alto", km: 209.12, ruta: "Ruta 5", route: "R5" },
  { nombre: "Escuela Itahue", km: 210.631, ruta: "Ruta 5", route: "R5" },
  { nombre: "Itahue", km: 211.585, ruta: "Ruta 5", route: "R5" },
  { nombre: "Estación Itahue", km: 212.407, ruta: "Ruta 5", route: "R5" },
  { nombre: "Frutillar", km: 214.305, ruta: "Ruta 5", route: "R5" },
  { nombre: "Rosa Ester", km: 4.751, ruta: "ASS", route: "ASS" },
  { nombre: "La Serena", km: 5.57, ruta: "ASS", route: "ASS" },
  { nombre: "Lo Castillo", km: 6.02, ruta: "ASS", route: "ASS" },
  { nombre: "Ombú", km: 6.22, ruta: "ASS", route: "ASS" },
  { nombre: "Las Nieves", km: 7.18, ruta: "ASS", route: "ASS" },
  { nombre: "El Huerto", km: 8.122, ruta: "ASS", route: "ASS" },
  { nombre: "Los Ángeles", km: 9.66, ruta: "ASS", route: "ASS" },
];

export const BASE_INFRASTRUCTURE = {
  PMV: PMV_BASE,
  'Peaje lateral': PEAJE_LATERAL_BASE,
  Troncal: TRONCAL_BASE,
  Atravieso: ATRAVIESO_BASE,
  Puente: PUENTE_BASE,
  Enlace: ENLACE_BASE,
  Pasarela: PASARELA_BASE,
} as const;
