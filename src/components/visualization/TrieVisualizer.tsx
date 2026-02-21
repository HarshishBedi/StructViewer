import { useMemo } from 'react';
import { useAlgoStore } from '../../lib/state/useAlgoStore';
import { cn } from '../../lib/utils/cn';

interface TrieNode {
  char: string;
  id: string;
  terminal: boolean;
  children: Record<string, TrieNode>;
}

interface PositionedTrieNode {
  id: string;
  char: string;
  parentId: string | null;
  depth: number;
  terminal: boolean;
  x: number;
  y: number;
}

const TRIE_CANVAS_WIDTH = 1000;
const TRIE_TOP_PADDING = 66;
const TRIE_LEVEL_HEIGHT = 98;
const TRIE_NODE_RADIUS = 20;

function createTrie(words: string[]): TrieNode {
  const root: TrieNode = {
    char: '*',
    id: '',
    terminal: false,
    children: {}
  };

  for (const word of words) {
    let current = root;
    for (const char of word) {
      const nextId = `${current.id}${char}`;
      if (!current.children[char]) {
        current.children[char] = {
          char,
          id: nextId,
          terminal: false,
          children: {}
        };
      }
      current = current.children[char];
    }
    current.terminal = true;
  }

  return root;
}

function layoutTrie(root: TrieNode): { nodes: PositionedTrieNode[]; maxDepth: number } {
  const positioned: PositionedTrieNode[] = [];
  let maxDepth = 0;
  let leafSlot = 0;

  const dfs = (node: TrieNode, depth: number, parentId: string | null): number => {
    maxDepth = Math.max(maxDepth, depth);
    const children = Object.values(node.children).sort((left, right) =>
      left.char.localeCompare(right.char)
    );

    let slot: number;
    if (children.length === 0) {
      leafSlot += 1;
      slot = leafSlot;
    } else {
      const childSlots = children.map((child) => dfs(child, depth + 1, node.id));
      slot = childSlots.reduce((sum, value) => sum + value, 0) / childSlots.length;
    }

    positioned.push({
      id: node.id,
      char: node.char,
      parentId,
      depth,
      terminal: node.terminal,
      x: slot,
      y: TRIE_TOP_PADDING + depth * TRIE_LEVEL_HEIGHT
    });

    return slot;
  };

  dfs(root, 0, null);

  const widthSlots = Math.max(leafSlot + 1, 2);
  return {
    maxDepth,
    nodes: positioned.map((node) => ({
      ...node,
      x: (node.x / widthSlots) * TRIE_CANVAS_WIDTH
    }))
  };
}

export function TrieVisualizer() {
  const state = useAlgoStore((store) => store.trieSession.history[store.trieSession.cursor].state);
  const trieRoot = useMemo(() => createTrie(state.words), [state.words]);
  const layout = useMemo(() => layoutTrie(trieRoot), [trieRoot]);
  const canvasHeight = Math.max(360, TRIE_TOP_PADDING + layout.maxDepth * TRIE_LEVEL_HEIGHT + 80);
  const nodesById = useMemo(() => new Map(layout.nodes.map((node) => [node.id, node])), [layout.nodes]);
  const queryPath = useMemo(() => {
    if (!state.query) {
      return new Set<string>();
    }
    const next = new Set<string>(['']);
    for (let index = 1; index <= state.query.length; index += 1) {
      next.add(state.query.slice(0, index));
    }
    return next;
  }, [state.query]);
  const matchedWords = useMemo(() => new Set(state.prefixMatches), [state.prefixMatches]);

  return (
    <div className="viz-trie" aria-label="Trie visualization">
      <svg
        viewBox={`0 0 ${TRIE_CANVAS_WIDTH} ${canvasHeight}`}
        preserveAspectRatio="xMidYMid meet"
        className="trie-canvas"
      >
        {layout.nodes.map((node) => {
          if (node.parentId === null) {
            return null;
          }

          const parent = nodesById.get(node.parentId);
          if (!parent) {
            return null;
          }

          return (
            <line
              key={`trie-edge-${node.id}`}
              x1={parent.x}
              y1={parent.y}
              x2={node.x}
              y2={node.y}
              className="trie-edge"
            />
          );
        })}

        {layout.nodes.map((node) => (
          <g key={`trie-node-${node.id || 'root'}`}>
            <circle
              cx={node.x}
              cy={node.y}
              r={TRIE_NODE_RADIUS}
              className={cn(
                'trie-node',
                node.id === '' && 'trie-node-root',
                queryPath.has(node.id) && 'trie-node-active',
                node.terminal && 'trie-node-terminal',
                matchedWords.has(node.id) && 'trie-node-match',
                state.highlightedWord === node.id && 'trie-node-highlighted'
              )}
            />
            <text x={node.x} y={node.y} className="trie-node-text">
              {node.id === '' ? 'R' : node.char}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
