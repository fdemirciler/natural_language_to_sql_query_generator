export interface TableColumn {
  name: string;
  data_type: string;
  format?: string;
  is_nullable?: boolean;
}

export interface TableSchema {
  name: string;
  schema: string;
  columns: TableColumn[];
}

export interface HistoryItem {
  id: string;
  prompt: string;
  sql: string;
  rowCount?: number;
  timestamp: number;
}

export interface QueryResult {
  data: Record<string, any>[];
  rowCount?: number;
}

export enum LoadingState {
  IDLE = 'IDLE',
  GENERATING_SQL = 'GENERATING_SQL',
  EXECUTING_QUERY = 'EXECUTING_QUERY',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export type ColorMode = 'light' | 'dark';
