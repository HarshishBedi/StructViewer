import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent
} from 'react';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { type TreeNode } from '../../lib/algorithms/bst';
import { useAlgoStore } from '../../lib/state/useAlgoStore';
import { cn } from '../../lib/utils/cn';
import { Button } from '../ui/Button';

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
const TREE_NAV_MIN_NODES = 9;
const TREE_NAV_MIN_DEPTH = 4;
const TREE_MIN_ZOOM = 0.72;
const TREE_MAX_ZOOM = 2.4;
const TREE_ZOOM_STEP = 0.18;
const TREE_PAN_MARGIN = 36;

interface EdgeSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

interface Point {
  x: number;
  y: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getContentBounds(nodes: PositionedNode[], canvasHeight: number): Bounds {
  if (nodes.length === 0) {
    return {
      minX: 0,
      maxX: TREE_CANVAS_WIDTH,
      minY: 0,
      maxY: canvasHeight
    };
  }

  return nodes.reduce<Bounds>(
    (bounds, node) => ({
      minX: Math.min(bounds.minX, node.x - TREE_NODE_RADIUS),
      maxX: Math.max(bounds.maxX, node.x + TREE_NODE_RADIUS),
      minY: Math.min(bounds.minY, node.y - TREE_NODE_RADIUS),
      maxY: Math.max(bounds.maxY, node.y + TREE_NODE_RADIUS)
    }),
    {
      minX: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY
    }
  );
}

function clampPan(
  pan: Point,
  bounds: Bounds,
  zoom: number,
  viewportWidth: number,
  viewportHeight: number
): Point {
  const scaledWidth = (bounds.maxX - bounds.minX) * zoom;
  const scaledHeight = (bounds.maxY - bounds.minY) * zoom;

  if (scaledWidth <= viewportWidth - TREE_PAN_MARGIN * 2) {
    pan.x = 0;
  } else {
    const minX = viewportWidth - TREE_PAN_MARGIN - bounds.maxX * zoom;
    const maxX = TREE_PAN_MARGIN - bounds.minX * zoom;
    pan.x = clamp(pan.x, minX, maxX);
  }

  if (scaledHeight <= viewportHeight - TREE_PAN_MARGIN * 2) {
    pan.y = 0;
  } else {
    const minY = viewportHeight - TREE_PAN_MARGIN - bounds.maxY * zoom;
    const maxY = TREE_PAN_MARGIN - bounds.minY * zoom;
    pan.y = clamp(pan.y, minY, maxY);
  }

  return pan;
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
  const { treeState, cursor, stepTimestamp } = useAlgoStore(
    useShallow((state) => ({
      treeState: state.treeSession.history[state.treeSession.cursor].state,
      cursor: state.treeSession.cursor,
      stepTimestamp: state.treeSession.history[state.treeSession.cursor].timestamp
    }))
  );

  const layout = useMemo(() => buildLayout(treeState.root), [treeState.root]);
  const positioned = layout.nodes;
  const canvasHeight = Math.max(420, TREE_TOP_PADDING + layout.maxDepth * TREE_LEVEL_HEIGHT + 88);
  const bounds = useMemo(() => getContentBounds(positioned, canvasHeight), [canvasHeight, positioned]);
  const canNavigate = positioned.length >= TREE_NAV_MIN_NODES || layout.maxDepth >= TREE_NAV_MIN_DEPTH;
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragStartRef = useRef<{ clientX: number; clientY: number; originPan: Point } | null>(null);
  const traversalTimerRef = useRef<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [revealedTraversalCount, setRevealedTraversalCount] = useState(
    treeState.traversal.length
  );
  const revealedTraversal = useMemo(
    () => treeState.traversal.slice(0, revealedTraversalCount),
    [revealedTraversalCount, treeState.traversal]
  );
  const activeTraversalValue =
    revealedTraversalCount > 0 && treeState.traversal.length > 0
      ? treeState.traversal[Math.min(revealedTraversalCount - 1, treeState.traversal.length - 1)]
      : null;
  const traversalOrder = useMemo(
    () => new Map(revealedTraversal.map((value, index) => [value, index])),
    [revealedTraversal]
  );
  const byValue = useMemo(
    () => new Map(positioned.map((node) => [node.value, node])),
    [positioned]
  );
  const zoomPercent = Math.round(zoom * 100);
  const zoomHint = canNavigate
    ? 'Use +/- to zoom, drag to pan, reset to recenter.'
    : 'Zoom and pan activate automatically when the tree gets larger.';

  useEffect(() => {
    setPan((current) =>
      clampPan({ ...current }, bounds, zoom, TREE_CANVAS_WIDTH, canvasHeight)
    );
  }, [bounds, canvasHeight, zoom]);

  useEffect(() => {
    if (traversalTimerRef.current !== null) {
      window.clearInterval(traversalTimerRef.current);
      traversalTimerRef.current = null;
    }

    const traversalLength = treeState.traversal.length;
    if (treeState.traversalType === null || traversalLength === 0) {
      setRevealedTraversalCount(traversalLength);
      return;
    }

    setRevealedTraversalCount(0);
    traversalTimerRef.current = window.setInterval(() => {
      setRevealedTraversalCount((count) => {
        const nextCount = count + 1;
        if (nextCount >= traversalLength) {
          if (traversalTimerRef.current !== null) {
            window.clearInterval(traversalTimerRef.current);
            traversalTimerRef.current = null;
          }
          return traversalLength;
        }
        return nextCount;
      });
    }, 260);

    return () => {
      if (traversalTimerRef.current !== null) {
        window.clearInterval(traversalTimerRef.current);
        traversalTimerRef.current = null;
      }
    };
  }, [stepTimestamp, treeState.traversal, treeState.traversalType]);

  useEffect(() => {
    if (canNavigate) {
      return;
    }

    setZoom(1);
    setPan({ x: 0, y: 0 });
    setIsDragging(false);
    dragStartRef.current = null;
  }, [canNavigate]);

  const zoomAtPoint = (nextZoom: number, focusPoint: Point) => {
    setZoom((currentZoom) => {
      const clampedZoom = clamp(nextZoom, TREE_MIN_ZOOM, TREE_MAX_ZOOM);
      if (clampedZoom === currentZoom) {
        return currentZoom;
      }

      setPan((currentPan) => {
        const worldX = (focusPoint.x - currentPan.x) / currentZoom;
        const worldY = (focusPoint.y - currentPan.y) / currentZoom;
        const nextPan = {
          x: focusPoint.x - worldX * clampedZoom,
          y: focusPoint.y - worldY * clampedZoom
        };
        return clampPan(nextPan, bounds, clampedZoom, TREE_CANVAS_WIDTH, canvasHeight);
      });

      return clampedZoom;
    });
  };

  const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!canNavigate || event.button !== 0) {
      return;
    }

    const svg = svgRef.current;
    if (!svg) {
      return;
    }

    svg.setPointerCapture(event.pointerId);
    dragStartRef.current = {
      clientX: event.clientX,
      clientY: event.clientY,
      originPan: pan
    };
    setIsDragging(true);
  };

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const dragStart = dragStartRef.current;
    if (!canNavigate || !dragStart) {
      return;
    }

    const svg = svgRef.current;
    if (!svg) {
      return;
    }

    const rect = svg.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return;
    }

    const deltaX = ((event.clientX - dragStart.clientX) / rect.width) * TREE_CANVAS_WIDTH;
    const deltaY = ((event.clientY - dragStart.clientY) / rect.height) * canvasHeight;
    const nextPan = {
      x: dragStart.originPan.x + deltaX,
      y: dragStart.originPan.y + deltaY
    };
    setPan(clampPan(nextPan, bounds, zoom, TREE_CANVAS_WIDTH, canvasHeight));
  };

  const stopDrag = (pointerId?: number) => {
    if (pointerId !== undefined && svgRef.current?.hasPointerCapture(pointerId)) {
      svgRef.current.releasePointerCapture(pointerId);
    }

    dragStartRef.current = null;
    setIsDragging(false);
  };

  const handlePointerUp = (event: ReactPointerEvent<SVGSVGElement>) => {
    stopDrag(event.pointerId);
  };

  const handlePointerCancel = (event: ReactPointerEvent<SVGSVGElement>) => {
    stopDrag(event.pointerId);
  };

  const handleZoomIn = () => {
    zoomAtPoint(zoom + TREE_ZOOM_STEP, { x: TREE_CANVAS_WIDTH / 2, y: canvasHeight / 2 });
  };

  const handleZoomOut = () => {
    zoomAtPoint(zoom - TREE_ZOOM_STEP, { x: TREE_CANVAS_WIDTH / 2, y: canvasHeight / 2 });
  };

  const resetViewport = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setIsDragging(false);
    dragStartRef.current = null;
  };

  return (
    <div className="viz-tree" aria-label="BST visualization">
      <div className="tree-nav-toolbar" aria-live="polite">
        <div className="tree-nav-meta">
          <span className="tree-nav-zoom">{zoomPercent}%</span>
          <span className="tree-nav-hint">{zoomHint}</span>
        </div>
        <div className="tree-nav-actions">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            disabled={!canNavigate || zoom <= TREE_MIN_ZOOM}
            aria-label="Zoom out"
          >
            -
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            disabled={!canNavigate || zoom >= TREE_MAX_ZOOM}
            aria-label="Zoom in"
          >
            +
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resetViewport}
            disabled={!canNavigate || (zoom === 1 && pan.x === 0 && pan.y === 0)}
          >
            Reset View
          </Button>
        </div>
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${TREE_CANVAS_WIDTH} ${canvasHeight}`}
        preserveAspectRatio="xMidYMid meet"
        className={cn(
          'tree-canvas',
          canNavigate && 'tree-canvas-interactive',
          isDragging && 'tree-canvas-dragging'
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <g transform={`translate(${pan.x} ${pan.y})`}>
          <g transform={`scale(${zoom})`}>
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
              const visiting = activeTraversalValue === node.value;
              const traversalIndex = traversalOrder.get(node.value);
              const traversed = traversalIndex !== undefined;
              const traversalStyle = traversed
                ? ({ '--traversal-delay': `${traversalIndex * 45}ms` } as CSSProperties)
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
                    className={cn(
                      'tree-node',
                      visiting && 'tree-node-visiting',
                      highlighted && 'tree-node-highlighted',
                      traversed && 'tree-node-traversed'
                    )}
                  />
                  <ellipse
                    cx={node.x - 7}
                    cy={node.y - 13}
                    rx="6"
                    ry="3.2"
                    className="tree-node-glare"
                  />
                  <text x={node.x} y={node.y} className="tree-node-text">
                    {node.value}
                  </text>
                </g>
              );
            })}
          </g>
        </g>
      </svg>
    </div>
  );
}
