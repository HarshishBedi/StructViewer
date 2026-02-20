import type { CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { type TreeNode } from '../../lib/algorithms/bst';
import { useAlgoStore } from '../../lib/state/useAlgoStore';
import { cn } from '../../lib/utils/cn';

interface TreeLayoutNode {
  value: number;
  slot: number;
  depth: number;
  parent: number | null;
}

interface PositionedNode {
  value: number;
  x: number;
  y: number;
  parent: number | null;
}

interface TreeLayout {
  nodes: PositionedNode[];
  maxDepth: number;
}

const TREE_CANVAS_WIDTH = 1000;
const TREE_TOP_PADDING = 78;
const TREE_LEVEL_HEIGHT = 112;
const TREE_NODE_RADIUS = 24;

interface EdgeSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function buildLayout(root: TreeNode | null): TreeLayout {
  const layoutNodes: TreeLayoutNode[] = [];
  let slot = 0;
  let maxDepth = 0;

  const dfs = (node: TreeNode | null, depth: number, parent: number | null): void => {
    if (node === null) {
      return;
    }

    maxDepth = Math.max(maxDepth, depth);
    dfs(node.left, depth + 1, node.value);
    layoutNodes.push({ value: node.value, slot, depth, parent });
    slot += 1;
    dfs(node.right, depth + 1, node.value);
  };

  dfs(root, 0, null);

  const total = layoutNodes.length;
  if (total === 0) {
    return { nodes: [], maxDepth: 0 };
  }

  return {
    maxDepth,
    nodes: layoutNodes.map((node) => ({
      ...node,
      x: ((node.slot + 1) / (total + 1)) * TREE_CANVAS_WIDTH,
      y: TREE_TOP_PADDING + node.depth * TREE_LEVEL_HEIGHT
    }))
  };
}

function getEdgeSegment(parent: PositionedNode, child: PositionedNode): EdgeSegment {
  const dx = child.x - parent.x;
  const dy = child.y - parent.y;
  const distance = Math.hypot(dx, dy);

  if (distance <= TREE_NODE_RADIUS * 2) {
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
    x1: parent.x + nx * TREE_NODE_RADIUS,
    y1: parent.y + ny * TREE_NODE_RADIUS,
    x2: child.x - nx * TREE_NODE_RADIUS,
    y2: child.y - ny * TREE_NODE_RADIUS
  };
}

export function TreeVisualizer() {
  const { treeState, cursor, stepTimestamp } = useAlgoStore((state) => ({
    treeState: state.treeSession.history[state.treeSession.cursor].state,
    cursor: state.treeSession.cursor,
    stepTimestamp: state.treeSession.history[state.treeSession.cursor].timestamp
  }));

  const layout = useMemo(() => buildLayout(treeState.root), [treeState.root]);
  const positioned = layout.nodes;
  const canvasHeight = Math.max(420, TREE_TOP_PADDING + layout.maxDepth * TREE_LEVEL_HEIGHT + 88);
  const traversalOrder = useMemo(
    () => new Map(treeState.traversal.map((value, index) => [value, index])),
    [treeState.traversal]
  );
  const byValue = useMemo(
    () => new Map(positioned.map((node) => [node.value, node])),
    [positioned]
  );

  return (
    <div className="viz-tree" aria-label="BST visualization">
      <svg
        viewBox={`0 0 ${TREE_CANVAS_WIDTH} ${canvasHeight}`}
        preserveAspectRatio="xMidYMid meet"
        className="tree-canvas"
      >
        <defs>
          <linearGradient id="treeEdgeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(156, 188, 229, 0.94)" />
            <stop offset="100%" stopColor="rgba(102, 142, 191, 0.7)" />
          </linearGradient>
          <radialGradient id="treeNodeGradient" cx="30%" cy="25%" r="72%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
            <stop offset="55%" stopColor="rgba(210,229,255,0.78)" />
            <stop offset="100%" stopColor="rgba(169,204,251,0.66)" />
          </radialGradient>
          <filter id="treeNodeShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="rgba(18,39,66,0.24)" />
          </filter>
        </defs>

        {positioned.map((node) => {
          if (node.parent === null) {
            return null;
          }

          const parent = byValue.get(node.parent);
          if (!parent) {
            return null;
          }

          const edge = getEdgeSegment(parent, node);
          return (
            <line
              key={`edge-${node.value}`}
              x1={edge.x1}
              y1={edge.y1}
              x2={edge.x2}
              y2={edge.y2}
              className="tree-edge"
            />
          );
        })}

        {positioned.map((node, index) => {
          const highlighted = treeState.highlighted === node.value;
          const traversalIndex = traversalOrder.get(node.value);
          const traversed = traversalIndex !== undefined;
          const traversalDelay =
            traversed && treeState.traversalType ? `${traversalIndex * 120}ms` : undefined;
          const traversalStyle = traversed
            ? ({ '--traversal-delay': traversalDelay } as CSSProperties)
            : undefined;

          return (
            <g key={`node-${node.value}-${cursor}-${stepTimestamp}`}>
              <motion.circle
                initial={{ opacity: 0, scale: 0.86 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.24, delay: index * 0.012, ease: [0.22, 1, 0.36, 1] }}
                cx={node.x}
                cy={node.y}
                r={TREE_NODE_RADIUS}
                style={traversalStyle}
                filter="url(#treeNodeShadow)"
                className={cn(
                  'tree-node',
                  highlighted && 'tree-node-highlighted',
                  traversed && 'tree-node-traversed'
                )}
              />
              <ellipse
                cx={node.x - 8}
                cy={node.y - 9}
                rx="9"
                ry="5"
                className="tree-node-glare"
              />
              <text x={node.x} y={node.y + 1} className="tree-node-text">
                {node.value}
              </text>
            </g>
          );
        })}
      </svg>

      <p className="viz-caption">
        {treeState.traversalType
          ? `${treeState.traversalType} traversal: ${treeState.traversal.join(' → ') || 'empty'}`
          : 'Run a traversal or search to inspect node flow.'}
      </p>
    </div>
  );
}
