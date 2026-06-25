import type { Direction } from './types.js';

export const GRID_DIR_CONTEXT_KEY = 'grid-dir';

export type GridDirGetter = () => Direction;
