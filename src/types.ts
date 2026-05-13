/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum NodeType {
  EMPTY = 'empty',
  WALL = 'wall',
  START = 'start',
  END = 'end',
  VISITED = 'visited',
  PATH = 'path',
  CURRENT = 'current',
}

export interface NodeData {
  row: number;
  col: number;
  type: NodeType;
  distance: number;
  isVisited: boolean;
  previousNode: NodeData | null;
  weight: number;
}

export interface GridDimensions {
  rows: number;
  cols: number;
}

export const INITIAL_GRID_DIMENSIONS: GridDimensions = {
  rows: 25,
  cols: 50,
};

export const START_NODE = { row: 12, col: 10 };
export const END_NODE = { row: 12, col: 40 };

export function createNode(row: number, col: number): NodeData {
  let type = NodeType.EMPTY;
  if (row === START_NODE.row && col === START_NODE.col) type = NodeType.START;
  if (row === END_NODE.row && col === END_NODE.col) type = NodeType.END;

  return {
    row,
    col,
    type,
    distance: Infinity,
    isVisited: false,
    previousNode: null,
    weight: 1,
  };
}

export function createInitialGrid(rows: number, cols: number): NodeData[][] {
  const grid: NodeData[][] = [];
  for (let row = 0; row < rows; row++) {
    const currentRow: NodeData[] = [];
    for (let col = 0; col < cols; col++) {
      currentRow.push(createNode(row, col));
    }
    grid.push(currentRow);
  }
  return grid;
}
