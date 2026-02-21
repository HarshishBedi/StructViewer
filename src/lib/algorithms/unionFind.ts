export interface UnionFindState {
  size: number;
  parent: number[];
  rank: number[];
  highlighted: number[];
  lastRoot: number | null;
  lastPair: [number, number] | null;
  connectedResult: boolean | null;
}

export interface UnionFindActionResult {
  next: UnionFindState;
  title: string;
  description: string;
  complexity: string;
  isError?: boolean;
}

const MIN_SIZE = 2;
const MAX_SIZE = 24;

function clampSize(size: number): number {
  return Math.max(MIN_SIZE, Math.min(MAX_SIZE, Math.floor(size)));
}

function createState(size: number): UnionFindState {
  const safeSize = clampSize(size);
  return {
    size: safeSize,
    parent: Array.from({ length: safeSize }, (_, index) => index),
    rank: Array.from({ length: safeSize }, () => 0),
    highlighted: [],
    lastRoot: null,
    lastPair: null,
    connectedResult: null
  };
}

function validateIndex(state: UnionFindState, index: number): string | null {
  if (!Number.isInteger(index)) {
    return 'Index must be an integer.';
  }
  if (index < 0 || index >= state.size) {
    return `Index must be between 0 and ${state.size - 1}.`;
  }
  return null;
}

function findRootWithCompression(parent: number[], index: number): { root: number; parent: number[] } {
  let root = index;
  while (parent[root] !== root) {
    root = parent[root];
  }

  const nextParent = [...parent];
  let current = index;
  while (nextParent[current] !== current) {
    const next = nextParent[current];
    nextParent[current] = root;
    current = next;
  }

  return { root, parent: nextParent };
}

function countComponents(parent: number[]): number {
  const roots = new Set<number>();
  for (let index = 0; index < parent.length; index += 1) {
    let current = index;
    while (parent[current] !== current) {
      current = parent[current];
    }
    roots.add(current);
  }
  return roots.size;
}

export function resizeUnionFind(state: UnionFindState, size: number): UnionFindActionResult {
  if (!Number.isInteger(size)) {
    return {
      next: state,
      title: 'Resize failed',
      description: 'Size must be an integer.',
      complexity: 'O(n)',
      isError: true
    };
  }

  const safeSize = clampSize(size);
  return {
    next: createState(safeSize),
    title: `Resize to ${safeSize}`,
    description: `Created ${safeSize} isolated sets.`,
    complexity: 'O(n)'
  };
}

export function unionNodes(state: UnionFindState, left: number, right: number): UnionFindActionResult {
  const leftError = validateIndex(state, left);
  if (leftError) {
    return {
      next: state,
      title: 'Union failed',
      description: `Left node invalid: ${leftError}`,
      complexity: 'O(alpha(n))',
      isError: true
    };
  }
  const rightError = validateIndex(state, right);
  if (rightError) {
    return {
      next: state,
      title: 'Union failed',
      description: `Right node invalid: ${rightError}`,
      complexity: 'O(alpha(n))',
      isError: true
    };
  }

  let parent = [...state.parent];
  const rank = [...state.rank];

  const leftRootResult = findRootWithCompression(parent, left);
  parent = leftRootResult.parent;
  const rightRootResult = findRootWithCompression(parent, right);
  parent = rightRootResult.parent;

  let leftRoot = leftRootResult.root;
  let rightRoot = rightRootResult.root;

  if (leftRoot === rightRoot) {
    return {
      next: {
        ...state,
        parent,
        highlighted: [left, right, leftRoot],
        lastRoot: leftRoot,
        lastPair: [left, right],
        connectedResult: true
      },
      title: `Union ${left}, ${right} skipped`,
      description: `${left} and ${right} are already in the same set (root ${leftRoot}).`,
      complexity: 'O(alpha(n))',
      isError: true
    };
  }

  if (rank[leftRoot] < rank[rightRoot]) {
    [leftRoot, rightRoot] = [rightRoot, leftRoot];
  }

  parent[rightRoot] = leftRoot;
  if (rank[leftRoot] === rank[rightRoot]) {
    rank[leftRoot] += 1;
  }

  return {
    next: {
      ...state,
      parent,
      rank,
      highlighted: [left, right, leftRoot, rightRoot],
      lastRoot: leftRoot,
      lastPair: [left, right],
      connectedResult: true
    },
    title: `Union ${left}, ${right}`,
    description: `Merged sets with roots ${leftRoot} and ${rightRoot}.`,
    complexity: 'O(alpha(n))'
  };
}

export function findNode(state: UnionFindState, index: number): UnionFindActionResult {
  const error = validateIndex(state, index);
  if (error) {
    return {
      next: state,
      title: 'Find failed',
      description: error,
      complexity: 'O(alpha(n))',
      isError: true
    };
  }

  const found = findRootWithCompression(state.parent, index);
  return {
    next: {
      ...state,
      parent: found.parent,
      highlighted: [index, found.root],
      lastRoot: found.root,
      lastPair: null,
      connectedResult: null
    },
    title: `Find(${index}) = ${found.root}`,
    description: `Root of node ${index} is ${found.root}.`,
    complexity: 'O(alpha(n))'
  };
}

export function connectedNodes(state: UnionFindState, left: number, right: number): UnionFindActionResult {
  const leftError = validateIndex(state, left);
  if (leftError) {
    return {
      next: state,
      title: 'Connected check failed',
      description: `Left node invalid: ${leftError}`,
      complexity: 'O(alpha(n))',
      isError: true
    };
  }
  const rightError = validateIndex(state, right);
  if (rightError) {
    return {
      next: state,
      title: 'Connected check failed',
      description: `Right node invalid: ${rightError}`,
      complexity: 'O(alpha(n))',
      isError: true
    };
  }

  let parent = [...state.parent];
  const leftRootResult = findRootWithCompression(parent, left);
  parent = leftRootResult.parent;
  const rightRootResult = findRootWithCompression(parent, right);
  parent = rightRootResult.parent;
  const connected = leftRootResult.root === rightRootResult.root;

  return {
    next: {
      ...state,
      parent,
      highlighted: [left, right, leftRootResult.root, rightRootResult.root],
      lastRoot: connected ? leftRootResult.root : null,
      lastPair: [left, right],
      connectedResult: connected
    },
    title: `Connected ${left}, ${right}`,
    description: connected
      ? `${left} and ${right} are connected.`
      : `${left} and ${right} are in different sets.`,
    complexity: 'O(alpha(n))',
    isError: !connected
  };
}

export function resetUnionFind(state: UnionFindState): UnionFindActionResult {
  return {
    next: createState(state.size),
    title: 'Reset union-find',
    description: `Reset all ${state.size} nodes to isolated sets.`,
    complexity: 'O(n)'
  };
}

export function presetUnionFind(): UnionFindActionResult {
  let state = createState(10);
  const seedPairs: Array<[number, number]> = [
    [0, 1],
    [1, 2],
    [3, 4],
    [5, 6],
    [6, 7],
    [7, 8]
  ];
  for (const [left, right] of seedPairs) {
    state = unionNodes(state, left, right).next;
  }
  return {
    next: {
      ...state,
      highlighted: [],
      lastRoot: null,
      lastPair: null,
      connectedResult: null
    },
    title: 'Load union-find preset',
    description: 'Loaded sample disjoint sets with 10 nodes.',
    complexity: 'O(n alpha(n))'
  };
}

export function analyzeComponents(state: UnionFindState): number {
  return countComponents(state.parent);
}

export function createUnionFindState(size = 8): UnionFindState {
  return createState(size);
}
