/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NodeData } from "./types";

/**
 * Dijkstra's algorithm implementation specifically for the visualization.
 * Returns an array of nodes in the order they were visited.
 */
export function dijkstra(grid: NodeData[][], startNode: NodeData, endNode: NodeData): NodeData[] {
  const visitedNodesInOrder: NodeData[] = [];
  startNode.distance = 0;
  const unvisitedNodes = getAllNodes(grid);

  while (unvisitedNodes.length > 0) {
    sortNodesByDistance(unvisitedNodes);
    const closestNode = unvisitedNodes.shift();

    if (!closestNode) break;

    // If we encounter a wall, we skip it.
    if (closestNode.type === 'wall' && closestNode.weight === Infinity) continue;

    // If the closest node is at a distance of infinity,
    // we must be trapped and should stop.
    if (closestNode.distance === Infinity) break;

    closestNode.isVisited = true;
    visitedNodesInOrder.push(closestNode);

    if (closestNode === endNode) return visitedNodesInOrder;

    updateUnvisitedNeighbors(closestNode, grid);
  }

  return visitedNodesInOrder;
}

function sortNodesByDistance(unvisitedNodes: NodeData[]) {
  unvisitedNodes.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance);
}

function updateUnvisitedNeighbors(node: NodeData, grid: NodeData[][]) {
  const unvisitedNeighbors = getUnvisitedNeighbors(node, grid);
  for (const neighbor of unvisitedNeighbors) {
    neighbor.distance = node.distance + neighbor.weight;
    neighbor.previousNode = node;
  }
}

function getUnvisitedNeighbors(node: NodeData, grid: NodeData[][]): NodeData[] {
  const neighbors: NodeData[] = [];
  const { col, row } = node;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  return neighbors.filter(neighbor => !neighbor.isVisited);
}

function getAllNodes(grid: NodeData[][]): NodeData[] {
  const nodes: NodeData[] = [];
  for (const row of grid) {
    for (const node of row) {
      nodes.push(node);
    }
  }
  return nodes;
}

/**
 * Backtracks from the finishNode to find the shortest path.
 */
export function getNodesInShortestPathOrder(finishNode: NodeData): NodeData[] {
  const nodesInShortestPathOrder: NodeData[] = [];
  let currentNode: NodeData | null = finishNode;
  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return nodesInShortestPathOrder;
}
