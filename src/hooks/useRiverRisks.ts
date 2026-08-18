import { useEffect, useMemo, useState } from 'react';

import { RIVER_CROSSINGS } from '../services/mockData';
import {
  evaluateRiverBasin,
  type RiverEvaluation,
} from '../services/riverRisk';

export type RiverEvaluations = Record<
  string,
  RiverEvaluation | null
>;

export function useRiverRisks() {
  const [evaluations, setEvaluations] =
    useState<RiverEvaluations>({});

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadRiverRisks() {
      setLoading(true);

      /*
       * Inicializamos todos los ríos como null.
       *
       * null = todavía consultando
       */
      const initialState: RiverEvaluations = {};

      RIVER_CROSSINGS.forEach((river) => {
        initialState[river.name] = null;
      });

      setEvaluations(initialState);

      /*
       * Evaluamos todos los ríos.
       *
       * Cada río utiliza los puntos meteorológicos
       * definidos en RIVER_CROSSINGS.
       */
      await Promise.all(
        RIVER_CROSSINGS.map(async (river) => {
          const evaluation =
            await evaluateRiverBasin(river);

          if (cancelled) return;

          /*
           * Actualizamos cada río apenas termina
           * su consulta.
           *
           * No necesitamos esperar que terminen
           * todos para mostrar resultados.
           */
          setEvaluations((current) => ({
            ...current,
            [river.name]: evaluation,
          }));
        }),
      );

      if (!cancelled) {
        setLoading(false);
      }
    }

    loadRiverRisks();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Generamos listas útiles para los componentes.
   *
   * De esta manera Dashboard no necesita conocer
   * cómo funciona classifyBasinRisk().
   */

  const rivers = useMemo(() => {
    return RIVER_CROSSINGS.map((river) => ({
      river,
      evaluation:
        evaluations[river.name] ?? null,
    }));
  }, [evaluations]);

  /*
   * ALERTAS ALTAS
   */

  const highAlerts = useMemo(() => {
    return rivers.filter(
      ({ evaluation }) =>
        evaluation?.risk.level ===
        'Alerta alta de crecida',
    );
  }, [rivers]);

  /*
   * VIGILANCIA PREVENTIVA
   */

  const warnings = useMemo(() => {
    return rivers.filter(
      ({ evaluation }) =>
        evaluation?.risk.level ===
        'Vigilancia preventiva',
    );
  }, [rivers]);

  /*
   * RÍOS NORMALES
   */

  const normal = useMemo(() => {
    return rivers.filter(
      ({ evaluation }) =>
        evaluation?.risk.level === 'Normal',
    );
  }, [rivers]);

  /*
   * RÍOS SIN INFORMACIÓN
   */

  const unavailable = useMemo(() => {
    return rivers.filter(
      ({ evaluation }) =>
        evaluation?.risk.level === 'Sin dato',
    );
  }, [rivers]);

  /*
   * Todas las alertas que deberían aparecer
   * en Dashboard.
   *
   * No incluimos estados normales.
   */

  const alerts = useMemo(() => {
    return [
      ...highAlerts,
      ...warnings,
    ];
  }, [highAlerts, warnings]);

  return {
    loading,

    evaluations,

    rivers,

    alerts,

    highAlerts,

    warnings,

    normal,

    unavailable,
  };
}

export default useRiverRisks;
