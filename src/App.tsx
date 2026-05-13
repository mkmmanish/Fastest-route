/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NodeData, NodeType, INITIAL_GRID_DIMENSIONS, createInitialGrid, START_NODE, END_NODE } from './types';
import { dijkstra, getNodesInShortestPathOrder } from './algorithms';
import Node from './components/Node';
import { Play, RotateCcw, Trash2, FastForward, Info, Settings2 } from 'lucide-react';

export default function App() {
  const [grid, setGrid] = useState<NodeData[][]>([]);
  const [mouseIsPressed, setMouseIsPressed] = useState(false);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [speed, setSpeed] = useState(10);
  const [stats, setStats] = useState({ visited: 0, pathLength: 0, time: 0 });
  const [activeTab, setActiveTab] = useState<'visualizer' | 'how-it-works'>('visualizer');

  const gridRef = useRef<NodeData[][]>([]);

  useEffect(() => {
    const initialGrid = createInitialGrid(INITIAL_GRID_DIMENSIONS.rows, INITIAL_GRID_DIMENSIONS.cols);
    setGrid(initialGrid);
    gridRef.current = initialGrid;
  }, []);

  const handleMouseDown = (row: number, col: number) => {
    if (isVisualizing) return;
    const node = grid[row][col];
    if (node.type === NodeType.START || node.type === NodeType.END) return;
    
    const newGrid = getNewGridWithWallToggled(grid, row, col);
    setGrid(newGrid);
    gridRef.current = newGrid;
    setMouseIsPressed(true);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (!mouseIsPressed || isVisualizing) return;
    const node = grid[row][col];
    if (node.type === NodeType.START || node.type === NodeType.END) return;
    
    const newGrid = getNewGridWithWallToggled(grid, row, col);
    setGrid(newGrid);
    gridRef.current = newGrid;
  };

  const handleMouseUp = () => {
    setMouseIsPressed(false);
  };

  const getNewGridWithWallToggled = (grid: NodeData[][], row: number, col: number) => {
    const newGrid = grid.slice();
    const node = newGrid[row][col];
    const newNode = {
      ...node,
      type: node.type === NodeType.WALL ? NodeType.EMPTY : NodeType.WALL,
      weight: node.type === NodeType.WALL ? 1 : Infinity,
    };
    newGrid[row][col] = newNode;
    return newGrid;
  };

  const visualizeDijkstra = async () => {
    if (isVisualizing) return;
    setIsVisualizing(true);
    
    // Reset grid visualization state but keep walls
    const cleanGrid = grid.map(row => 
      row.map(node => ({
        ...node,
        distance: Infinity,
        isVisited: false,
        previousNode: null,
        type: node.type === NodeType.VISITED || node.type === NodeType.PATH ? NodeType.EMPTY : node.type
      }))
    );
    
    const startNode = cleanGrid[START_NODE.row][START_NODE.col];
    const endNode = cleanGrid[END_NODE.row][END_NODE.col];
    
    const visitedNodesInOrder = dijkstra(cleanGrid, startNode, endNode);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(endNode);
    
    await animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder);
  };

  const animateDijkstra = async (visitedNodesInOrder: NodeData[], nodesInShortestPathOrder: NodeData[]) => {
    const startTime = performance.now();
    
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        if (nodesInShortestPathOrder.length > 1) {
          await animateShortestPath(nodesInShortestPathOrder);
        } else {
          setIsVisualizing(false);
        }
        setStats(prev => ({
          ...prev, 
          visited: visitedNodesInOrder.length, 
          time: Math.round(performance.now() - startTime)
        }));
        return;
      }

      const node = visitedNodesInOrder[i];
      if (node.type !== NodeType.START && node.type !== NodeType.END) {
        setGrid(prevGrid => {
          const newGrid = [...prevGrid];
          newGrid[node.row][node.col] = { ...node, type: NodeType.VISITED };
          return newGrid;
        });
        await new Promise(resolve => setTimeout(resolve, speed));
      }
    }
  };

  const animateShortestPath = async (nodesInShortestPathOrder: NodeData[]) => {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      const node = nodesInShortestPathOrder[i];
      if (node.type !== NodeType.START && node.type !== NodeType.END) {
        setGrid(prevGrid => {
          const newGrid = [...prevGrid];
          newGrid[node.row][node.col] = { ...node, type: NodeType.PATH };
          return newGrid;
        });
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    setStats(prev => ({ ...prev, pathLength: nodesInShortestPathOrder.length }));
    setIsVisualizing(false);
  };

  const resetGrid = () => {
    if (isVisualizing) return;
    const initialGrid = createInitialGrid(INITIAL_GRID_DIMENSIONS.rows, INITIAL_GRID_DIMENSIONS.cols);
    setGrid(initialGrid);
    setStats({ visited: 0, pathLength: 0, time: 0 });
  };

  const clearPath = () => {
    if (isVisualizing) return;
    const clearedGrid = grid.map(row => 
      row.map(node => ({
        ...node,
        distance: Infinity,
        isVisited: false,
        previousNode: null,
        type: node.type === NodeType.VISITED || node.type === NodeType.PATH ? NodeType.EMPTY : node.type
      }))
    );
    setGrid(clearedGrid);
    setStats({ visited: 0, pathLength: 0, time: 0 });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-300 font-sans p-6 flex flex-col gap-6 overflow-x-hidden selection:bg-emerald-500 selection:text-black">
      {/* Header Navigation */}
      <header className="flex items-center justify-between border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-500/20 p-2.5 rounded-xl border border-emerald-500/30">
            <Play className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl tracking-tight uppercase">PATHFINDER / DIJKSTRA_V1</h1>
            <p className="text-[10px] text-slate-500 font-mono tracking-widest">NETWORK OPTIMIZATION ENGINE • SESSION_ID: AI-STUDIO-489</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md">
            <button 
              onClick={() => setActiveTab('visualizer')}
              className={`px-6 py-2 text-[10px] font-bold rounded-lg uppercase tracking-widest transition-all duration-200 ${activeTab === 'visualizer' ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-slate-400 hover:text-white'}`}
            >
              Visualizer
            </button>
            <button 
              onClick={() => setActiveTab('how-it-works')}
              className={`px-6 py-2 text-[10px] font-bold rounded-lg uppercase tracking-widest transition-all duration-200 ${activeTab === 'how-it-works' ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-slate-400 hover:text-white'}`}
            >
              Documentation
            </button>
          </div>
        </div>
      </header>

      {activeTab === 'visualizer' ? (
        <main className="grid grid-cols-12 gap-6 flex-grow auto-rows-fr">
          {/* Graph Visualization (Large Center) */}
          <section className="col-span-12 lg:col-span-8 lg:row-span-4 bento-card relative overflow-hidden group">
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Viewport // Real-time Graph Topology</span>
            </div>
            
            <div className="h-full flex items-center justify-center p-4">
              <div 
                className="grid gap-0 select-none w-full max-w-full"
                style={{ 
                  gridTemplateColumns: `repeat(${INITIAL_GRID_DIMENSIONS.cols}, minmax(0, 1fr))`,
                  aspectRatio: `${INITIAL_GRID_DIMENSIONS.cols} / ${INITIAL_GRID_DIMENSIONS.rows}`
                }}
              >
                {grid.map((row, rowIdx) => (
                  row.map((node, nodeIdx) => (
                    <Node
                      key={`${rowIdx}-${nodeIdx}`}
                      row={node.row}
                      col={node.col}
                      type={node.type}
                      isVisited={node.isVisited}
                      onMouseDown={handleMouseDown}
                      onMouseEnter={handleMouseEnter}
                      onMouseUp={handleMouseUp}
                    />
                  ))
                ))}
              </div>
            </div>

            {/* Background Grid Accent */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
          </section>

          {/* Controls / Settings (Top Right) */}
          <section className="col-span-12 lg:col-span-4 lg:row-span-2 bento-card flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">System Parameters</span>
              <Settings2 size={14} className="text-slate-500" />
            </div>

            <div className="space-y-5">
              <button 
                onClick={visualizeDijkstra}
                disabled={isVisualizing}
                className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              >
                <Play size={16} fill="currentColor" /> Initiate Optimization
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={clearPath}
                  disabled={isVisualizing}
                  className="bg-white/5 border border-white/10 py-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={14} /> Clear Path
                </button>
                <button 
                  onClick={resetGrid}
                  disabled={isVisualizing}
                  className="bg-white/5 border border-white/10 py-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  <RotateCcw size={14} /> Full Reset
                </button>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Execution Speed</label>
                  <span className="font-mono text-[10px] text-emerald-400">{speed}ms / step</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="50" 
                  step="1"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>
          </section>

          {/* Live Metrics (Middle Right) */}
          <section className="col-span-12 lg:col-span-4 lg:row-span-2 bento-card flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Live Telemetry</span>
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 pt-4">
              <div>
                <div className="text-4xl font-mono text-white tracking-tighter mb-1">
                  {stats.time.toString().padStart(4, '0')}<span className="text-xs text-slate-500 ml-1 italic font-sans uppercase">ms</span>
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Process Time</p>
              </div>

              <div className="space-y-4 border-t border-white/5 pt-6">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Nodes Visited</span>
                  <span className="font-mono text-lg text-emerald-400">{stats.visited}</span>
                </div>
                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                    style={{ width: `${Math.min((stats.visited / (INITIAL_GRID_DIMENSIONS.rows * INITIAL_GRID_DIMENSIONS.cols)) * 100, 100)}%` }} 
                  />
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Optimized Path</span>
                  <span className="font-mono text-lg text-blue-400">{stats.pathLength}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Legend (Bottom Left) */}
          <section className="col-span-12 lg:col-span-3 lg:row-span-2 bento-card flex flex-col justify-between">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-4">Topology Legend</span>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Origin', color: 'bg-emerald-500' },
                { label: 'Target', color: 'bg-rose-500' },
                { label: 'Obstacle', color: 'bg-slate-800' },
                { label: 'Resolved', color: 'bg-cyan-400/50' },
                { label: 'Min Path', color: 'bg-yellow-400' },
                { label: 'Neutral', color: 'bg-white/10' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className={`w-3.5 h-3.5 rounded-sm ${item.color} border border-white/10 shadow-sm`} />
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider font-mono">{item.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
              <p className="text-[9px] text-blue-400 uppercase font-black tracking-widest mb-1.5">Note</p>
              <p className="text-[10px] text-slate-500 leading-relaxed italic">Obstacles create infinite weight edges for non-traversable nodes.</p>
            </div>
          </section>

          {/* Execution Log (Bottom Right) */}
          <section className="col-span-12 lg:col-span-9 lg:row-span-2 bento-card flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Algorithm Console // stdout</span>
              <div className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-mono text-slate-500">REALTIME_STREAM_v0.4</div>
            </div>
            <div className="flex-grow font-mono text-[10px] text-slate-500 space-y-1.5 overflow-y-auto max-h-[120px] scrollbar-hide">
              <p className="flex gap-4">
                <span className="text-emerald-500/50">[READY]</span>
                <span>SYSTEM_INITIALIZED: ALL_NODES_RESET</span>
              </p>
              <p className="flex gap-4">
                <span className="text-emerald-500/50">[OK]</span>
                <span>GRAPH_DIMENSIONS: {INITIAL_GRID_DIMENSIONS.rows}x{INITIAL_GRID_DIMENSIONS.cols} (Total {INITIAL_GRID_DIMENSIONS.rows * INITIAL_GRID_DIMENSIONS.cols} vertices)</span>
              </p>
              {stats.visited > 0 && (
                <>
                  <p className="flex gap-4">
                    <span className="text-blue-500/50">[EXEC]</span>
                    <span>DIJKSTRA_SEQUENCE_IN_PROGRESS...</span>
                  </p>
                  <p className="flex gap-4">
                    <span className="text-yellow-500/50">[STAT]</span>
                    <span>CURRENT_NODES_RELAXED: {stats.visited}</span>
                  </p>
                </>
              )}
              {stats.pathLength > 0 && (
                <p className="flex gap-4">
                  <span className="text-emerald-400 font-bold">[COMPLETE]</span>
                  <span className="text-white">SHORTEST_PATH_RESOLVED: {stats.pathLength} NODES</span>
                </p>
              )}
              <p className="flex gap-4 animate-pulse">
                <span className="text-slate-700">_</span>
              </p>
            </div>
          </section>
        </main>
      ) : (
        <div className="max-w-4xl mx-auto py-12 space-y-10">
          <div className="bento-card p-12">
            <h2 className="text-white text-4xl font-bold tracking-tighter uppercase mb-6">Foundations of Shortest Path</h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              Edsger W. Dijkstra\'s algorithm (1956) remains a fundamental cornerstone of network graph theory. It provides a mathematically guaranteed solution for finding the shortest paths between nodes in a graph with non-negative edge weights.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
                <span className="text-emerald-400 font-mono text-xl">01</span>
                <h3 className="text-white font-bold uppercase text-xs tracking-widest">Initialization</h3>
                <p className="text-xs text-slate-500 leading-normal">Sets initial node distance to 0 and all others to infinity. All nodes added to unvisited set.</p>
              </div>
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
                <span className="text-emerald-400 font-mono text-xl">02</span>
                <h3 className="text-white font-bold uppercase text-xs tracking-widest">Edge Relaxation</h3>
                <p className="text-xs text-slate-500 leading-normal">Visit nearest neighbor and update tentative distances based on path weight from start.</p>
              </div>
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
                <span className="text-emerald-400 font-mono text-xl">03</span>
                <h3 className="text-white font-bold uppercase text-xs tracking-widest">Termination</h3>
                <p className="text-xs text-slate-500 leading-normal">Process ends when destination is reached or all reachable nodes are processed.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bento-card p-8">
              <h3 className="text-white font-bold uppercase text-xs tracking-widest mb-6">Performance Metrics</h3>
              <div className="space-y-6 font-mono text-sm">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-500">Complexity (Time)</span>
                  <span className="text-emerald-400">O(E + V log V)</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-500">Complexity (Space)</span>
                  <span className="text-emerald-400">O(V)</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-500">Graph Type</span>
                  <span className="text-slate-300">Weighted / Directed</span>
                </div>
              </div>
            </div>
            <div className="bg-emerald-500 p-8 rounded-2xl text-black flex flex-col justify-between">
              <h3 className="font-black uppercase text-xs tracking-[0.3em] mb-4 text-black/50">Historical Note</h3>
              <p className="font-serif italic text-2xl leading-tight">
                “Computer Science is no more about computers than astronomy is about telescopes.”
              </p>
              <div className="mt-8">
                <p className="font-bold uppercase tracking-widest text-[10px]">Edsger W. Dijkstra</p>
                <div className="w-12 h-1 bg-black/10 mt-2" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Bar */}
      <footer className="mt-auto flex justify-between items-center text-[10px] text-slate-600 font-mono border-t border-white/10 pt-6">
        <div className="flex items-center gap-8 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Core: <span className="text-emerald-400">Ready</span></span>
          </div>
          <span>Environment: <span className="text-slate-400">Deterministic</span></span>
          <span>Buffer: <span className="text-slate-400">0.0ms</span></span>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-white/5 px-3 py-1 rounded-lg border border-white/10">SHORTEST_PATH_V1.0</span>
          <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-lg border border-emerald-500/20 font-bold">60 FPS</span>
        </div>
      </footer>
    </div>
  );
}
