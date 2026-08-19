import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  AppData,
  InfraItem,
  LayerKey,
  RiverCrossing,
  Trabajo,
  WorkClass,
} from '../types';
import {
  CFG,
  COLORS,
  CURVES,
  INFRA,
  REGION_POINTS,
  RIVER_CROSSINGS,
  WORKS,
} from '../services/mockData';
import { fetchWeatherAt } from '../services/api';

const fmtKm = (k: number) =>
  Number(k).toLocaleString('es-CL', { maximumFractionDigits: 3 });

const title = (v: string) =>
  String(v || '').split(/[(),;.]/)[0].trim() || v;

const pad = (n: number) => String(n).padStart(2, '0');

const clamp = (v: number, a: number, b: number) =>
  Math.min(b, Math.max(a, v));

function now() {
  const d = new Date();

  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

type ViewState = {
  z: number;
  pan: number;
  text: number;
};

type CanvasSize = {
  width: number;
  height: number;
};

type InfraHit = {
  type: 'infra';
  cls: string;
  x: number;
  y: number;
  r: number;
  data: InfraItem;
};

type WorkHit = {
  type: 'work';
  cls: WorkClass;
  x: number;
  y: number;
  r: number;
  data: Trabajo;
};

type RiverHit = {
  type: 'river';
  x: number;
  y: number;
  r: number;
  data: RiverCrossing;
};

type ClimateHit = {
  type: 'climate';
  x: number;
  y: number;
  r: number;
  data: {
    nombre: string;
    route: string;
    km: number;
    txt: string;
  };
};

type Hit = InfraHit | WorkHit | RiverHit | ClimateHit;

type PopupState = {
  hit: Hit;
  x: number;
  y: number;
} | null;

const textForZoom = (z: number) =>
  clamp(
    CFG.textBase + Math.log2(Math.max(z, CFG.zMin)) * CFG.textStep,
    CFG.textMin,
    CFG.textMax,
  );

const makeView = (z: number, pan: number): ViewState => ({
  z,
  pan,
  text: textForZoom(z),
});

const initialView = (): ViewState => makeView(1, 0);

const dist = (
  a: { clientX: number; clientY: number },
  b: { clientX: number; clientY: number },
) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

const midpoint = (
  a: { clientX: number; clientY: number },
  b: { clientX: number; clientY: number },
) => ({
  x: (a.clientX + b.clientX) / 2,
  y: (a.clientY + b.clientY) / 2,
});

export default function RouteCanvas({
  data,
  visible,
  setData,
}: {
  data: AppData;
  visible: Record<LayerKey, boolean>;
  setData: (d: AppData) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const hits = useRef<Hit[]>([]);
  const weather = useRef<Record<string, string>>({});
  const drawRef = useRef<() => void>(() => {});

  const sizeRef = useRef<CanvasSize>({
    width: 1,
    height: 1,
  });

  const mouse = useRef({
    drag: false,
    lastX: 0,
    startX: 0,
    moved: false,
  });

  const touch = useRef({
    mode: 'none' as 'none' | 'pan' | 'pinch',
    lastX: 0,
    startX: 0,
    moved: false,
    startDistance: 0,
    startZoom: 1,
    startWorldX: 0,
  });

  const [view, setView] = useState<ViewState>(initialView);
  const [popup, setPopup] = useState<PopupState>(null);
  const [, forceResize] = useState(0);

  /*
   * ---------------------------------------------------------
   * DIMENSIONES
   * ---------------------------------------------------------
   */

  const canvasWidth = () => sizeRef.current.width;
  const canvasHeight = () => sizeRef.current.height;

  const routeWidth = () => canvasWidth() * 0.9;
  const routeLeft = () => canvasWidth() * 0.05;

  const yR5 = () => canvasHeight() * 0.7;
  const yASS = () => canvasHeight() * 0.33;

  const xWorld = (km: number) =>
    routeLeft() +
    ((km - CFG.kmMin) / (CFG.kmMax - CFG.kmMin)) * routeWidth();

  const xScreen = (km: number, state = view) =>
    xWorld(km) * state.z + state.pan;

  const yRoute = (route: string) =>
    route === 'ASS' ? yASS() : yR5();

  const routeVisible = (route: string, km: number) =>
    route === 'ASS'
      ? km >= CFG.assMin && km <= CFG.assConnectEnd
      : km >= CFG.r5Min && km <= CFG.r5Max;

  const getCanvasPoint = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;

      if (!canvas) {
        return {
          x: clientX,
          y: clientY,
        };
      }

      const rect = canvas.getBoundingClientRect();

      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    },
    [],
  );

  /*
   * ---------------------------------------------------------
   * POPUP
   * ---------------------------------------------------------
   */

  const repositionPopup = useCallback(
    (clientX: number, clientY: number) => {
      const container = containerRef.current;

      if (!container) {
        return {
          x: 12,
          y: 12,
        };
      }

      const rect = container.getBoundingClientRect();

      const localX = clientX - rect.left;
      const localY = clientY - rect.top;

      const popupWidth = Math.min(320, Math.max(220, rect.width - 24));
      const popupHeight = 220;

      const maxX = Math.max(12, rect.width - popupWidth - 12);
      const maxY = Math.max(12, rect.height - popupHeight - 12);

      return {
        x: clamp(localX + 14, 12, maxX),
        y: clamp(localY + 14, 12, maxY),
      };
    },
    [],
  );

  const openPopup = useCallback(
    (hit: Hit, clientX: number, clientY: number) => {
      setPopup({
        hit,
        ...repositionPopup(clientX, clientY),
      });
    },
    [repositionPopup],
  );

  /*
   * ---------------------------------------------------------
   * HIT DETECTION
   * ---------------------------------------------------------
   */

  const hitAt = useCallback((x: number, y: number) => {
    for (let i = hits.current.length - 1; i >= 0; i -= 1) {
      const hit = hits.current[i];

      if (Math.hypot(x - hit.x, y - hit.y) <= hit.r) {
        return hit;
      }
    }

    return null;
  }, []);

  /*
   * ---------------------------------------------------------
   * ZOOM
   * ---------------------------------------------------------
   *
   * Se mantiene el zoom con rueda del mouse y pinch.
   * Solo eliminamos los controles visuales del mapa.
   */

  const zoomAt = useCallback(
    (anchorX: number, factor: number) => {
      setView((current) => {
        const nextZoom = clamp(
          current.z * factor,
          CFG.zMin,
          CFG.zMax,
        );

        const worldX =
          (anchorX - current.pan) / current.z;

        return makeView(
          nextZoom,
          anchorX - worldX * nextZoom,
        );
      });
    },
    [],
  );

  /*
   * ---------------------------------------------------------
   * ESTADO DE TRABAJOS
   * ---------------------------------------------------------
   */

  const setWorkState = useCallback(
    (work: Trabajo) => {
      const states: Trabajo['estadoManual'][] = [
        'Programado',
        'En ejecución',
        'Terminado',
      ];

      const nextState =
        states[
          (states.indexOf(work.estadoManual) + 1) %
            states.length
        ];

      const copy: AppData = {
        ...data,
        Noche: [...data.Noche],
        Día: [...data.Día],
      };

      const works = copy[work.tipo];
      const index = works.indexOf(work);

      if (index < 0) return;

      const nextWork: Trabajo = {
        ...work,
        estadoManual: nextState,
      };

      if (
        nextState === 'En ejecución' &&
        !nextWork.horaInicioReal
      ) {
        nextWork.horaInicioReal = now();
      }

      if (
        work.estadoManual === 'En ejecución' &&
        nextState === 'Terminado'
      ) {
        nextWork.horaTerminoReal = now();
      }

      works[index] = nextWork;

      setPopup(null);
      setData(copy);
    },
    [data, setData],
  );

  /*
   * ---------------------------------------------------------
   * DIBUJADO PRINCIPAL
   * ---------------------------------------------------------
   */

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();

    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);

    sizeRef.current = {
      width,
      height,
    };

    const dpr = Math.max(
      1,
      window.devicePixelRatio || 1,
    );

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0,
    );

    ctx.clearRect(
      0,
      0,
      width,
      height,
    );

    hits.current = [];

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    /*
     * RUTA 5
     */

    ctx.strokeStyle = 'rgba(255,255,255,.96)';
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(
      xScreen(CFG.r5Min),
      yR5(),
    );
    ctx.lineTo(
      xScreen(CFG.r5Max),
      yR5(),
    );
    ctx.stroke();

    /*
     * ACCESO SUR
     */

    ctx.beginPath();

    ctx.moveTo(
      xScreen(CFG.assMin),
      yASS(),
    );

    ctx.lineTo(
      xScreen(CFG.assLineEnd),
      yASS(),
    );

    ctx.stroke();

    /*
     * CONEXIÓN ACCESO SUR / RUTA 5
     */

    ctx.beginPath();

    const x1 = xScreen(CFG.assLineEnd);
    const x2 = xScreen(CFG.assConnectEnd);

    ctx.moveTo(
      x1,
      yASS(),
    );

    ctx.bezierCurveTo(
      x1 + (x2 - x1) * 0.22,
      yASS(),

      x1 + (x2 - x1) * 0.78,
      yR5(),

      x2,
      yR5(),
    );

    ctx.stroke();

    /*
     * CURVAS
     */

    Object.entries(CURVES).forEach(
      ([route, arr]) => {
        ctx.strokeStyle = '#ffd600';
        ctx.lineWidth = 5;

        (
          arr as {
            ini: number;
            fin: number;
          }[]
        ).forEach((curve, i) => {
          const min =
            route === 'ASS'
              ? CFG.assMin
              : CFG.r5Min;

          const max =
            route === 'ASS'
              ? CFG.assConnectEnd
              : CFG.r5Max;

          const ini = Math.max(
            min,
            Math.min(
              curve.ini,
              curve.fin,
            ),
          );

          const fin = Math.min(
            max,
            Math.max(
              curve.ini,
              curve.fin,
            ),
          );

          if (fin < ini) return;

          const mid =
            (ini + fin) / 2;

          const amp =
            (i % 2 === 0 ? -1 : 1) *
            Math.min(
              10,
              Math.max(
                4,
                (fin - ini) * 9,
              ),
            );

          ctx.beginPath();

          ctx.moveTo(
            xScreen(ini),
            yRoute(route),
          );

          ctx.quadraticCurveTo(
            xScreen(mid),
            yRoute(route) + amp,
            xScreen(fin),
            yRoute(route),
          );

          ctx.stroke();
        });
      },
    );

    /*
     * MARCAS DE KILOMETRAJE
     */

    const tick = (route: string) => {
      const y = yRoute(route);

      const min =
        route === 'ASS'
          ? CFG.assMin
          : CFG.r5Min;

      const max =
        route === 'ASS'
          ? CFG.assConnectEnd
          : CFG.r5Max;

      const step =
        view.z >= 7
          ? 1
          : view.z >= 3
            ? 5
            : 10;

      const label =
        view.z >= 7
          ? 5
          : 10;

      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      ctx.font =
        `700 ${view.text}px Segoe UI,Arial`;

      for (
        let km =
          Math.ceil(min / step) *
          step;
        km <= max + 0.001;
        km += step
      ) {
        const x = xScreen(km);

        const major =
          km % 10 === 0 ||
          Math.abs(km - min) < 0.001;

        const h =
          major ? 22 : 12;

        ctx.strokeStyle =
          `rgba(255,255,255,${
            major ? 0.95 : 0.35
          })`;

        ctx.lineWidth =
          major ? 1.8 : 1;

        ctx.beginPath();

        ctx.moveTo(
          x,
          y - h / 2,
        );

        ctx.lineTo(
          x,
          y + h / 2,
        );

        ctx.stroke();

        if (
          km % label === 0 ||
          Math.abs(km - min) <
            0.001 ||
          Math.abs(km - max) <
            0.001
        ) {
          ctx.fillStyle =
            'rgba(255,255,255,.92)';

          ctx.fillText(
            `km ${fmtKm(km)}`,
            x,
            y + 18,
          );
        }
      }
    };

    tick('R5');
    tick('ASS');

    /*
     * NOMBRES DE RUTA
     */

    ctx.font =
      `900 ${view.text + 2}px Segoe UI,Arial`;

    ctx.fillStyle =
      'rgba(255,255,255,.72)';

    ctx.textAlign = 'left';

    ctx.fillText(
      'ACCESO SUR A SANTIAGO',
      xScreen(CFG.assMin),
      yASS() - 38,
    );

    ctx.fillText(
      'RUTA 5 SUR',
      xScreen(CFG.r5Min),
      yR5() - 38,
    );

    /*
     * TEXTO ROTADO
     */

    const drawRotated = (
      txt: string,
      x: number,
      y: number,
      color: string,
      align: CanvasTextAlign,
    ) => {
      ctx.save();

      ctx.translate(x, y);
      ctx.rotate(-Math.PI / 4);

      ctx.fillStyle = color;

      ctx.font =
        `800 ${view.text}px Segoe UI,Arial`;

      ctx.textAlign = align;
      ctx.textBaseline = 'middle';

      ctx.shadowColor =
        'rgba(0,0,0,.45)';

      ctx.shadowBlur = 4;

      ctx.fillText(
        txt.toUpperCase(),
        0,
        0,
      );

      ctx.restore();
    };

    /*
     * RÍOS
     */

    RIVER_CROSSINGS.forEach(
      (river) => {
        if (
          !routeVisible(
            river.routeKey,
            river.km,
          )
        ) {
          return;
        }

        const x =
          xScreen(river.km);

        const y =
          yRoute(river.routeKey);

        ctx.strokeStyle =
          'rgba(56,189,248,.92)';

        ctx.lineWidth = 5;

        ctx.beginPath();

        ctx.moveTo(
          x,
          y - 18,
        );

        ctx.lineTo(
          x,
          y + 18,
        );

        ctx.stroke();

        ctx.font =
          `900 ${Math.max(
            10,
            view.text - 2,
          )}px Segoe UI Emoji`;

        ctx.textAlign = 'center';
        ctx.fillStyle = 'white';

        ctx.fillText(
          '🌊',
          x,
          y - 24,
        );

        hits.current.push({
          type: 'river',
          x,
          y,
          r: 18,
          data: river,
        });
      },
    );

    /*
     * CLIMA
     */

    REGION_POINTS.forEach(
      (point, i) => {
        const route =
          point.lat > -33.7
            ? 'ASS'
            : 'R5';

        const km =
          route === 'ASS'
            ? Math.min(
                43.5,
                Math.max(
                  0,
                  ((point.lat + 33.617) /
                    0.084) *
                    43.5,
                ),
              )
            : Math.min(
                219,
                Math.max(
                  29,
                  29 +
                    ((-33.612 -
                      point.lat) /
                      1.818) *
                      190,
                ),
              );

        if (
          !routeVisible(
            route,
            km,
          )
        ) {
          return;
        }

        const key = `R${i}`;

        if (
          !weather.current[key]
        ) {
          weather.current[key] =
            'cargando...';

          fetchWeatherAt(
            point.lat,
            point.lon,
          ).then((txt) => {
            weather.current[key] =
              txt;

            drawRef.current();
          });
        }

        const txt =
          weather.current[key] ||
          '';

        const emoji =
          /Lluvia|Chubascos|Llovizna|Tormenta/.test(
            txt,
          )
            ? '🌧️'
            : /Nieve/.test(txt)
              ? '🌨️'
              : /Neblina/.test(
                    txt,
                  )
                ? '🌫️'
                : /Nublado/.test(
                      txt,
                    )
                  ? '☁️'
                  : '⛅️';

        const x =
          xScreen(km);

        const y =
          yRoute(route) - 24;

        ctx.font =
          '20px Segoe UI Emoji';

        ctx.textAlign =
          'center';

        ctx.fillText(
          emoji,
          x,
          y,
        );

        hits.current.push({
          type: 'climate',
          x,
          y,
          r: 16,
          data: {
            nombre: point.name,
            route,
            km,
            txt,
          },
        });
      },
    );

    /*
     * INFRAESTRUCTURA
     */

    INFRA.forEach((cls) => {
      if (!visible[cls]) return;

      data[cls].forEach(
        (item) => {
          if (
            !routeVisible(
              item.route,
              item.km,
            )
          ) {
            return;
          }

          const x =
            xScreen(item.km);

          const y =
            yRoute(item.route);

          ctx.strokeStyle =
            COLORS[cls];

          ctx.lineWidth = 3;

          ctx.beginPath();

          ctx.moveTo(
            x,
            y + 9,
          );

          ctx.lineTo(
            x,
            y + 72,
          );

          ctx.stroke();

          drawRotated(
            item.nombre,
            x,
            y + 87,
            COLORS[cls],
            'right',
          );

          hits.current.push({
            type: 'infra',
            cls,
            x,
            y: y + 35,
            r: 16,
            data: item,
          });
        },
      );
    });

    /*
     * TRABAJOS
     */

    WORKS.forEach((work) => {
      if (
        !visible[work.name]
      ) {
        return;
      }

      data[work.name].forEach(
        (item) => {
          if (
            !routeVisible(
              item.route,
              item.km,
            )
          ) {
            return;
          }

          const x =
            xScreen(item.km);

          const y =
            yRoute(item.route) -
            28;

          let color =
            COLORS[work.name];

          if (
            item.estadoManual ===
            'En ejecución'
          ) {
            ctx.strokeStyle =
              'rgba(255,0,0,.9)';

            ctx.lineWidth = 5;

            ctx.beginPath();

            ctx.arc(
              x,
              y,
              17 +
                Math.sin(
                  Date.now() /
                    180,
                ) *
                  5,
              0,
              Math.PI * 2,
            );

            ctx.stroke();
          }

          if (
            item.estadoManual ===
            'Terminado'
          ) {
            color = '#00ff66';
          }

          ctx.fillStyle = color;
          ctx.strokeStyle =
            'white';

          ctx.lineWidth = 2;

          ctx.beginPath();

          ctx.arc(
            x,
            y,
            7,
            0,
            Math.PI * 2,
          );

          ctx.fill();
          ctx.stroke();

          drawRotated(
            title(item.nombre),
            x + 9,
            y - 7,
            color,
            'left',
          );

          hits.current.push({
            type: 'work',
            cls: work.name,
            x,
            y,
            r: 16,
            data: item,
          });
        },
      );
    });
  }, [data, view, visible]);

  /*
   * ---------------------------------------------------------
   * DIBUJADO
   * ---------------------------------------------------------
   */

  useEffect(() => {
    drawRef.current = draw;
    draw();
  }, [draw]);

  /*
   * ---------------------------------------------------------
   * RESPONSIVE
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const container =
      containerRef.current;

    if (!container) return;

    const updateSize = () => {
      const rect =
        container.getBoundingClientRect();

      const nextWidth =
        Math.max(
          1,
          rect.width,
        );

      const nextHeight =
        Math.max(
          1,
          rect.height,
        );

      const changed =
        Math.abs(
          nextWidth -
            sizeRef.current.width,
        ) > 0.5 ||
        Math.abs(
          nextHeight -
            sizeRef.current.height,
        ) > 0.5;

      sizeRef.current = {
        width: nextWidth,
        height: nextHeight,
      };

      setPopup(null);

      if (changed) {
        forceResize(
          (value) => value + 1,
        );
      } else {
        drawRef.current();
      }
    };

    updateSize();

    const observer =
      new ResizeObserver(
        updateSize,
      );

    observer.observe(
      container,
    );

    window.addEventListener(
      'resize',
      updateSize,
    );

    return () => {
      observer.disconnect();

      window.removeEventListener(
        'resize',
        updateSize,
      );
    };
  }, []);

  /*
   * Mantiene la animación del estado "En ejecución".
   */

  useEffect(() => {
    const loop =
      window.setInterval(
        () =>
          drawRef.current(),
        800,
      );

    return () =>
      window.clearInterval(
        loop,
      );
  }, []);

  /*
   * ---------------------------------------------------------
   * CERRAR POPUP
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!popup) return;

    const closeOnOutside = (
      event: PointerEvent,
    ) => {
      const target =
        event.target as
          | Node
          | null;

      if (
        target &&
        tooltipRef.current?.contains(
          target,
        )
      ) {
        return;
      }

      if (
        target &&
        canvasRef.current?.contains(
          target,
        )
      ) {
        return;
      }

      setPopup(null);
    };

    document.addEventListener(
      'pointerdown',
      closeOnOutside,
    );

    return () =>
      document.removeEventListener(
        'pointerdown',
        closeOnOutside,
      );
  }, [popup]);

  /*
   * ---------------------------------------------------------
   * MOUSE
   * ---------------------------------------------------------
   */

  const handleMouseDown = (
    event: React.MouseEvent<HTMLCanvasElement>,
  ) => {
    const point =
      getCanvasPoint(
        event.clientX,
        event.clientY,
      );

    mouse.current = {
      drag: true,
      lastX: point.x,
      startX: point.x,
      moved: false,
    };
  };

  const handleMouseMove = (
    event: React.MouseEvent<HTMLCanvasElement>,
  ) => {
    const point =
      getCanvasPoint(
        event.clientX,
        event.clientY,
      );

    if (mouse.current.drag) {
      if (
        Math.abs(
          point.x -
            mouse.current.startX,
        ) > 4
      ) {
        mouse.current.moved =
          true;
      }

      const dx =
        point.x -
        mouse.current.lastX;

      mouse.current.lastX =
        point.x;

      setView((current) => ({
        ...current,
        pan:
          current.pan + dx,
      }));

      return;
    }

    const canvas =
      canvasRef.current;

    if (canvas) {
      canvas.style.cursor =
        hitAt(
          point.x,
          point.y,
        )
          ? 'pointer'
          : 'grab';
    }
  };

  const handleMouseUp = (
    event: React.MouseEvent<HTMLCanvasElement>,
  ) => {
    if (!mouse.current.drag) {
      return;
    }

    const wasClick =
      !mouse.current.moved;

    mouse.current.drag = false;

    const canvas =
      canvasRef.current;

    if (canvas) {
      canvas.style.cursor =
        'grab';
    }

    if (!wasClick) return;

    const point =
      getCanvasPoint(
        event.clientX,
        event.clientY,
      );

    const hit =
      hitAt(
        point.x,
        point.y,
      );

    if (hit) {
      openPopup(
        hit,
        event.clientX,
        event.clientY,
      );
    } else {
      setPopup(null);
    }
  };

  /*
   * ---------------------------------------------------------
   * TOUCH
   * ---------------------------------------------------------
   */

  const handleTouchStart = (
    event: React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (
      event.touches.length ===
      1
    ) {
      const touchPoint =
        event.touches[0];

      const point =
        getCanvasPoint(
          touchPoint.clientX,
          touchPoint.clientY,
        );

      touch.current = {
        mode: 'pan',
        lastX: point.x,
        startX: point.x,
        moved: false,
        startDistance: 0,
        startZoom: view.z,
        startWorldX: 0,
      };

      return;
    }

    if (
      event.touches.length ===
      2
    ) {
      const [a, b] =
        Array.from(
          event.touches,
        );

      const centerClient =
        midpoint(a, b);

      const center =
        getCanvasPoint(
          centerClient.x,
          centerClient.y,
        );

      touch.current = {
        mode: 'pinch',
        lastX: center.x,
        startX: center.x,
        moved: true,
        startDistance:
          dist(a, b),
        startZoom: view.z,
        startWorldX:
          (center.x -
            view.pan) /
          view.z,
      };

      event.preventDefault();
    }
  };

  const handleTouchMove = (
    event: React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (
      event.touches.length ===
        1 &&
      touch.current.mode ===
        'pan'
    ) {
      const touchPoint =
        event.touches[0];

      const point =
        getCanvasPoint(
          touchPoint.clientX,
          touchPoint.clientY,
        );

      if (
        Math.abs(
          point.x -
            touch.current.startX,
        ) > 6
      ) {
        touch.current.moved =
          true;
      }

      const dx =
        point.x -
        touch.current.lastX;

      touch.current.lastX =
        point.x;

      setView((current) => ({
        ...current,
        pan:
          current.pan + dx,
      }));

      event.preventDefault();

      return;
    }

    if (
      event.touches.length ===
      2
    ) {
      const [a, b] =
        Array.from(
          event.touches,
        );

      const centerClient =
        midpoint(a, b);

      const center =
        getCanvasPoint(
          centerClient.x,
          centerClient.y,
        );

      const factor =
        dist(a, b) /
        Math.max(
          touch.current
            .startDistance,
          1,
        );

      const nextZoom =
        clamp(
          touch.current
            .startZoom *
            factor,
          CFG.zMin,
          CFG.zMax,
        );

      touch.current.moved =
        true;

      setView(
        makeView(
          nextZoom,
          center.x -
            touch.current
              .startWorldX *
              nextZoom,
        ),
      );

      event.preventDefault();
    }
  };

  const handleTouchEnd = (
    event: React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (
      touch.current.mode ===
        'pinch' &&
      event.touches.length ===
        1
    ) {
      const touchPoint =
        event.touches[0];

      const point =
        getCanvasPoint(
          touchPoint.clientX,
          touchPoint.clientY,
        );

      touch.current = {
        ...touch.current,
        mode: 'pan',
        lastX: point.x,
        startX: point.x,
        moved: true,
      };

      return;
    }

    if (
      touch.current.mode ===
        'pan' &&
      event.touches.length ===
        0
    ) {
      const wasTap =
        !touch.current.moved;

      const changed =
        event.changedTouches[0];

      touch.current.mode =
        'none';

      if (
        !wasTap ||
        !changed
      ) {
        return;
      }

      const point =
        getCanvasPoint(
          changed.clientX,
          changed.clientY,
        );

      const hit =
        hitAt(
          point.x,
          point.y,
        );

      if (hit) {
        openPopup(
          hit,
          changed.clientX,
          changed.clientY,
        );
      } else {
        setPopup(null);
      }

      return;
    }

    if (
      event.touches.length ===
      0
    ) {
      touch.current.mode =
        'none';
    }
  };

  const popupContent =
    popup?.hit;

  /*
   * ---------------------------------------------------------
   * INTERFAZ
   * ---------------------------------------------------------
   */

  return (
    <div
      ref={containerRef}
      className="route-canvas-container"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          cursor: 'grab',
          touchAction: 'none',
        }}
        onWheel={(event) => {
          event.preventDefault();

          const point =
            getCanvasPoint(
              event.clientX,
              event.clientY,
            );

          zoomAt(
            point.x,
            event.deltaY < 0
              ? 1.16
              : 1 / 1.16,
          );
        }}
        onMouseDown={
          handleMouseDown
        }
        onMouseMove={
          handleMouseMove
        }
        onMouseUp={
          handleMouseUp
        }
        onMouseLeave={() => {
          mouse.current.drag =
            false;

          const canvas =
            canvasRef.current;

          if (canvas) {
            canvas.style.cursor =
              'grab';
          }
        }}
        onTouchStart={
          handleTouchStart
        }
        onTouchMove={
          handleTouchMove
        }
        onTouchEnd={
          handleTouchEnd
        }
      />

      {popupContent ? (
        <div
          ref={tooltipRef}
          className="panel map-tooltip"
          style={{
            left: popup.x,
            top: popup.y,
          }}
        >
          <button
            type="button"
            className="tooltip-close"
            onClick={() =>
              setPopup(null)
            }
            aria-label="Cerrar detalle"
          >
            ✕
          </button>

          {popupContent.type ===
          'work' ? (
            <>
              <b
                style={{
                  color:
                    COLORS[
                      popupContent
                        .cls
                    ],
                }}
              >
                {
                  popupContent.cls
                }{' '}
                ·{' '}
                {
                  popupContent
                    .data.route
                }
              </b>

              <div>
                Trabajo:{' '}
                {
                  popupContent
                    .data.trabajo
                }
              </div>

              <div>
                Km:{' '}
                {fmtKm(
                  popupContent
                    .data
                    .kmInicial,
                )}{' '}
                -{' '}
                {fmtKm(
                  popupContent
                    .data
                    .kmFinal,
                )}
              </div>

              <div>
                Pistas:{' '}
                {popupContent
                  .data.pistas ||
                  '-'}
              </div>

              <div>
                Sector:{' '}
                {popupContent
                  .data.sector ||
                  '-'}
              </div>

              <button
                type="button"
                className="execToggle"
                onClick={() =>
                  setWorkState(
                    popupContent
                      .data,
                  )
                }
              >
                {
                  popupContent
                    .data
                    .estadoManual
                }
              </button>
            </>
          ) : null}

          {popupContent.type ===
          'river' ? (
            <>
              <b>
                🌊{' '}
                {
                  popupContent
                    .data.name
                }
              </b>

              <div>
                {
                  popupContent
                    .data.route
                }{' '}
                · km{' '}
                {fmtKm(
                  popupContent
                    .data.km,
                )}
              </div>

              <div>
                {
                  popupContent
                    .data.basin
                }
              </div>
            </>
          ) : null}

          {popupContent.type ===
          'climate' ? (
            <>
              <b>
                Clima ·{' '}
                {
                  popupContent
                    .data.nombre
                }
              </b>

              <div>
                {popupContent
                  .data.txt ||
                  'cargando...'}
              </div>
            </>
          ) : null}

          {popupContent.type ===
          'infra' ? (
            <>
              <b>
                {
                  popupContent.cls
                }{' '}
                ·{' '}
                {
                  popupContent
                    .data.route
                }
              </b>

              <div>
                {
                  popupContent
                    .data.nombre
                }
              </div>

              <div>
                km{' '}
                {fmtKm(
                  popupContent
                    .data.km,
                )}
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
