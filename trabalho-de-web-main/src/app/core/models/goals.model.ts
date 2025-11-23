export type GoalType =
  | 'POUPANCA'
  | 'DIVIDA'
  | 'COMPRA'
  | 'ORCAMENTO'
  | 'INVESTIMENTO';

export interface Goal {
  id: number;
  name: string;
  type: GoalType;
  currentValue: number;
  targetValue: number;
  startDate: string;
  endDate: string;
  progress?: number;
  status?: string;
}
