import {
  createContext,
  useContext,
  type ReactNode,
} from 'react';

import useRiverRisks from '../hooks/useRiverRisks';

type RiverRiskContextValue = ReturnType<typeof useRiverRisks>;

const RiverRiskContext =
  createContext<RiverRiskContextValue | null>(null);

interface RiverRiskProviderProps {
  children: ReactNode;
}

export function RiverRiskProvider({
  children,
}: RiverRiskProviderProps) {
  /*
   * useRiverRisks se ejecuta UNA vez aquí.
   *
   * Dashboard, RiverPanel y posteriormente
   * RouteCanvas consumirán estos mismos resultados.
   */
  const riverRisks = useRiverRisks();

  return (
    <RiverRiskContext.Provider value={riverRisks}>
      {children}
    </RiverRiskContext.Provider>
  );
}

export function useRiverRiskContext() {
  const context = useContext(RiverRiskContext);

  if (!context) {
    throw new Error(
      'useRiverRiskContext debe utilizarse dentro de RiverRiskProvider',
    );
  }

  return context;
}

export default RiverRiskContext;
