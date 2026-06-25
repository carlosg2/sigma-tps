import { getContext, setContext } from 'svelte';

export interface TableContext {
  bleed: boolean;
  dense: boolean;
  grid: boolean;
  striped: boolean;
}

const TABLE_CONTEXT_KEY = 'TABLE_CONTEXT_KEY';

export function createTableContext(initialValues: Partial<TableContext> = {}): TableContext {
  const context: TableContext = {
    bleed: false,
    dense: false,
    grid: false,
    striped: false,
    ...initialValues,
  };
  
  setContext(TABLE_CONTEXT_KEY, context);
  return context;
}

export function getTableContext(): TableContext | undefined {
  return getContext(TABLE_CONTEXT_KEY);
}
