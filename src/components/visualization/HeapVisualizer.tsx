import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useAlgoStore } from '../../lib/state/useAlgoStore';

interface HeapNodePosition {
  index: number;
  value: number;
  x: number;
  y: number;
}

interface HeapLayout {
  nodes: HeapNodePosition[];
  canvasHeight: number;
}

const HEAP_CANVAS_WIDTH = 1000;
const HEAP_TOP_PADDING = 70;
const HEAP_LEVEL_HEIGHT = 104;

function getLayout(values: number[]): HeapLayout {
  const levels = values.length === 0 ? 1 : Math.floor(Math.log2(values.length)) + 1;
  const canvasHeight = Math.max(360, HEAP_TOP_PADDING + (levels - 1) * HEAP_LEVEL_HEIGHT + 90);

  return {
    canvasHeight,
    nodes: values.map((value, index) => {
      const level = Math.floor(Math.log2(index + 1));
      const levelStart = 2 ** level - 1;
      const posInLevel = index - levelStart;
      const levelCount = 2 ** level;
      const spacing = HEAP_CANVAS_WIDTH / (levelCount + 1);

      return {
        index,
        value,
        x: spacing * (posInLevel + 1),
        y: HEAP_TOP_PADDING + level * HEAP_LEVEL_HEIGHT
      };
    })
  };
}

export function HeapVisualizer() {
  const { items, mode } = useAlgoStore(
    (state) => state.heapSession.history[state.heapSession.cursor].state
  );

  const layout = useMemo(() => getLayout(items), [items]);
  const positions = layout.nodes;

  return (
    <div className="viz-heap" aria-label="Heap visualization">
      <svg
        viewBox={`0 0 ${HEAP_CANVAS_WIDTH} ${layout.canvasHeight}`}
        preserveAspectRatio="xMidYMid meet"
        className="heap-canvas"
      >
        {positions.map((node) => {
          if (node.index === 0) {
            return null;
          }

          const parent = positions[Math.floor((node.index - 1) / 2)];
          return (
            <line
              key={`edge-${node.index}`}
              x1={parent.x}
              y1={parent.y}
              x2={node.x}
              y2={node.y}
              className="heap-edge"
            />
          );
        })}

        {positions.map((node, idx) => (
          <g key={`node-${node.index}`}>
            <motion.circle
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.24, delay: idx * 0.01, ease: [0.22, 1, 0.36, 1] }}
              cx={node.x}
              cy={node.y}
              r="24"
              className={node.index === 0 ? 'heap-node heap-root' : 'heap-node'}
            />
            <text x={node.x} y={node.y + 1} className="heap-node-text">
              {node.value}
            </text>
          </g>
        ))}
      </svg>
      <p className="viz-caption">
        {mode.toUpperCase()} heap root {items.length > 0 ? `= ${items[0]}` : '= empty'}
      </p>
    </div>
  );
}
