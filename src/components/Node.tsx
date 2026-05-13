/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NodeType } from '../types';
import { motion } from 'motion/react';

interface NodeProps {
  row: number;
  col: number;
  type: NodeType;
  isVisited: boolean;
  onMouseDown: (row: number, col: number) => void;
  onMouseEnter: (row: number, col: number) => void;
  onMouseUp: () => void;
}

const Node: React.FC<NodeProps> = ({
  row,
  col,
  type,
  isVisited,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
}) => {
  const extraClassName =
    type === NodeType.START
      ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)] z-20'
      : type === NodeType.END
      ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)] z-20'
      : type === NodeType.WALL
      ? 'bg-white/20 border-transparent shadow-inner'
      : type === NodeType.PATH
      ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.3)] z-10'
      : type === NodeType.VISITED
      ? 'bg-cyan-400/20'
      : type === NodeType.CURRENT
      ? 'bg-emerald-200'
      : 'bg-white/[0.02]';

  const animations = {
    [NodeType.VISITED]: {
      scale: [0.3, 1.1, 1],
      backgroundColor: ['rgba(34, 211, 238, 0.4)', 'rgba(34, 211, 238, 0.15)'],
      borderRadius: ['50%', '0%'],
    },
    [NodeType.PATH]: {
      scale: [0.6, 1.2, 1],
      backgroundColor: ['#fef08a', '#facc15'],
      boxShadow: ['0 0 0px rgba(250,204,21,0)', '0 0 15px rgba(250,204,21,0.4)', '0 0 10px rgba(250,204,21,0.3)'],
    },
    [NodeType.WALL]: {
      scale: [0.8, 1.1, 1],
    },
  };

  return (
    <motion.div
      id={`node-${row}-${col}`}
      className={`w-full h-full border-[0.5px] border-white/[0.05] flex items-center justify-center cursor-crosshair select-none relative ${extraClassName}`}
      onMouseDown={() => onMouseDown(row, col)}
      onMouseEnter={() => onMouseEnter(row, col)}
      onMouseUp={() => onMouseUp()}
      animate={type === NodeType.VISITED ? animations[NodeType.VISITED] : type === NodeType.PATH ? animations[NodeType.PATH] : type === NodeType.WALL ? animations[NodeType.WALL] : {}}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {type === NodeType.START && (
        <span className="text-[10px] font-bold text-white uppercase tracking-tighter">S</span>
      )}
      {type === NodeType.END && (
        <span className="text-[10px] font-bold text-white uppercase tracking-tighter">E</span>
      )}
    </motion.div>
  );
};

export default React.memo(Node);
