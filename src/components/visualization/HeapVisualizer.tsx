import { AnimatePresence, motion } from 'framer-motion';
import { useMemo } from 'react';
import { useAlgoStore } from '../../lib/state/useAlgoStore';

interface HeapNodePosition {
  id: string;
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
const HEAP_NODE_RADIUS = 24;

interface EdgeSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function getEdgeSegment(parent: HeapNodePosition, child: HeapNodePosition): EdgeSegment {
  const dx = child.x - parent.x;
  const dy = child.y - parent.y;
  const distance = Math.hypot(dx, dy);

  if (distance <= HEAP_NODE_RADIUS * 2) {
    return {
      x1: parent.x,
      y1: parent.y,
      x2: child.x,
      y2: child.y
    };
  }

  const nx = dx / distance;
  const ny = dy / distance;

  return {
    x1: parent.x + nx * HEAP_NODE_RADIUS,
    y1: parent.y + ny * HEAP_NODE_RADIUS,
    x2: child.x - nx * HEAP_NODE_RADIUS,
    y2: child.y - ny * HEAP_NODE_RADIUS
  };
}

function getLayout(values: number[]): HeapLayout {
  const levels = values.length === 0 ? 1 : Math.floor(Math.log2(values.length)) + 1;
  const canvasHeight = Math.max(360, HEAP_TOP_PADDING + (levels - 1) * HEAP_LEVEL_HEIGHT + 90);
  const seenByValue = new Map<number, number>();

  return {
    canvasHeight,
    nodes: values.map((value, index) => {
      const level = Math.floor(Math.log2(index + 1));
      const levelStart = 2 ** level - 1;
      const posInLevel = index - levelStart;
      const levelCount = 2 ** level;
      const spacing = HEAP_CANVAS_WIDTH / (levelCount + 1);
      const occurrence = seenByValue.get(value) ?? 0;
      seenByValue.set(value, occurrence + 1);

      return {
        id: `${value}:${occurrence}`,
        index,
        value,
        x: spacing * (posInLevel + 1),
        y: HEAP_TOP_PADDING + level * HEAP_LEVEL_HEIGHT
      };
    })
  };
}

export function HeapVisualizer() {
  const { items } = useAlgoStore(
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
        <AnimatePresence initial={false}>
          {positions.map((node) => {
            if (node.index === 0) {
              return null;
            }

            const parent = positions[Math.floor((node.index - 1) / 2)];
            const edge = getEdgeSegment(parent, node);
            return (
              <motion.line
                key={`edge-${node.id}`}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                exit={{ opacity: 0 }}
                transition={{
                  layout: { type: 'spring', stiffness: 360, damping: 30 },
                  duration: 0.2,
                  ease: [0.22, 1, 0.36, 1]
                }}
                x1={edge.x1}
                y1={edge.y1}
                x2={edge.x2}
                y2={edge.y2}
                className="heap-edge"
              />
            );
          })}
        </AnimatePresence>

        <AnimatePresence initial={false} mode="popLayout">
          {positions.map((node, idx) => (
            <motion.g
              key={`node-${node.id}`}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.72 }}
              transition={{
                layout: { type: 'spring', stiffness: 360, damping: 30 },
                duration: 0.24,
                delay: idx * 0.008,
                ease: [0.22, 1, 0.36, 1]
              }}
              style={{ transformOrigin: `${node.x}px ${node.y}px` }}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={HEAP_NODE_RADIUS}
                className={node.index === 0 ? 'heap-node heap-root' : 'heap-node'}
              />
              <text x={node.x} y={node.y + 1} className="heap-node-text">
                {node.value}
              </text>
            </motion.g>
          ))}
        </AnimatePresence>
      </svg>
    </div>
  );
}
