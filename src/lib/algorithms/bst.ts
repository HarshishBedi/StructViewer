export interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

export type TraversalType = 'inorder' | 'preorder' | 'postorder' | 'level';

export interface TreeState {
  root: TreeNode | null;
  highlighted: number | null;
  traversal: number[];
  traversalType: TraversalType | null;
  autoBalance: boolean;
}

export interface TreeActionResult {
  next: TreeState;
  title: string;
  description: string;
  complexity: string;
  isError?: boolean;
}

export interface TreeBalanceInfo {
  height: number;
  balanced: boolean;
}

function cloneNode(node: TreeNode | null): TreeNode | null {
  if (node === null) {
    return null;
  }

  return {
    value: node.value,
    left: cloneNode(node.left),
    right: cloneNode(node.right)
  };
}

function insertNode(node: TreeNode | null, value: number): { node: TreeNode; inserted: boolean } {
  if (node === null) {
    return {
      node: { value, left: null, right: null },
      inserted: true
    };
  }

  if (value === node.value) {
    return {
      node,
      inserted: false
    };
  }

  if (value < node.value) {
    const result = insertNode(node.left, value);
    return {
      node: {
        ...node,
        left: result.node
      },
      inserted: result.inserted
    };
  }

  const result = insertNode(node.right, value);
  return {
    node: {
      ...node,
      right: result.node
    },
    inserted: result.inserted
  };
}

function findMin(node: TreeNode): TreeNode {
  let current: TreeNode = node;
  while (current.left !== null) {
    current = current.left;
  }

  return current;
}

function deleteNode(node: TreeNode | null, value: number): { node: TreeNode | null; deleted: boolean } {
  if (node === null) {
    return { node: null, deleted: false };
  }

  if (value < node.value) {
    const result = deleteNode(node.left, value);
    return {
      node: {
        ...node,
        left: result.node
      },
      deleted: result.deleted
    };
  }

  if (value > node.value) {
    const result = deleteNode(node.right, value);
    return {
      node: {
        ...node,
        right: result.node
      },
      deleted: result.deleted
    };
  }

  if (node.left === null) {
    return {
      node: node.right,
      deleted: true
    };
  }

  if (node.right === null) {
    return {
      node: node.left,
      deleted: true
    };
  }

  const successor = findMin(node.right);
  const result = deleteNode(node.right, successor.value);

  return {
    node: {
      value: successor.value,
      left: node.left,
      right: result.node
    },
    deleted: true
  };
}

function searchNode(node: TreeNode | null, value: number): boolean {
  if (node === null) {
    return false;
  }

  if (value === node.value) {
    return true;
  }

  if (value < node.value) {
    return searchNode(node.left, value);
  }

  return searchNode(node.right, value);
}

function inorder(node: TreeNode | null, output: number[]): void {
  if (node === null) {
    return;
  }

  inorder(node.left, output);
  output.push(node.value);
  inorder(node.right, output);
}

function preorder(node: TreeNode | null, output: number[]): void {
  if (node === null) {
    return;
  }

  output.push(node.value);
  preorder(node.left, output);
  preorder(node.right, output);
}

function postorder(node: TreeNode | null, output: number[]): void {
  if (node === null) {
    return;
  }

  postorder(node.left, output);
  postorder(node.right, output);
  output.push(node.value);
}

function levelOrder(node: TreeNode | null): number[] {
  if (node === null) {
    return [];
  }

  const output: number[] = [];
  const queue: TreeNode[] = [node];

  while (queue.length > 0) {
    const current = queue.shift() as TreeNode;
    output.push(current.value);

    if (current.left !== null) {
      queue.push(current.left);
    }

    if (current.right !== null) {
      queue.push(current.right);
    }
  }

  return output;
}

function buildBalancedFromSorted(values: number[], start: number, end: number): TreeNode | null {
  if (start > end) {
    return null;
  }

  const mid = Math.floor((start + end) / 2);
  return {
    value: values[mid],
    left: buildBalancedFromSorted(values, start, mid - 1),
    right: buildBalancedFromSorted(values, mid + 1, end)
  };
}

function rebalanceRoot(root: TreeNode | null): TreeNode | null {
  if (root === null) {
    return null;
  }

  const sortedValues: number[] = [];
  inorder(root, sortedValues);
  return buildBalancedFromSorted(sortedValues, 0, sortedValues.length - 1);
}

function computeBalance(node: TreeNode | null): TreeBalanceInfo {
  if (node === null) {
    return {
      height: 0,
      balanced: true
    };
  }

  const left = computeBalance(node.left);
  const right = computeBalance(node.right);

  return {
    height: Math.max(left.height, right.height) + 1,
    balanced: left.balanced && right.balanced && Math.abs(left.height - right.height) <= 1
  };
}

export function analyzeTree(root: TreeNode | null): TreeBalanceInfo {
  return computeBalance(root);
}

export function insertTree(state: TreeState, value: number): TreeActionResult {
  const clonedRoot = cloneNode(state.root);
  const result = insertNode(clonedRoot, value);

  if (!result.inserted) {
    return {
      next: {
        ...state,
        highlighted: value,
        traversal: [],
        traversalType: null
      },
      title: `Insert ${value} skipped`,
      description: `Value ${value} already exists in the BST.`,
      complexity: 'O(log n) average',
      isError: true
    };
  }

  const autoBalancedRoot = state.autoBalance ? rebalanceRoot(result.node) : result.node;

  return {
    next: {
      ...state,
      root: autoBalancedRoot,
      highlighted: value,
      traversal: [],
      traversalType: null
    },
    title: `Insert ${value}`,
    description: state.autoBalance
      ? `${value} was inserted and the tree was rebalanced.`
      : `${value} was inserted into the BST.`,
    complexity: state.autoBalance ? 'O(log n) average + O(n) rebalance' : 'O(log n) average'
  };
}

export function deleteTree(state: TreeState, value: number): TreeActionResult {
  const clonedRoot = cloneNode(state.root);
  const result = deleteNode(clonedRoot, value);

  if (!result.deleted) {
    return {
      next: {
        ...state,
        highlighted: value,
        traversal: [],
        traversalType: null
      },
      title: `Delete ${value} failed`,
      description: `${value} was not found in the BST.`,
      complexity: 'O(log n) average',
      isError: true
    };
  }

  const autoBalancedRoot = state.autoBalance ? rebalanceRoot(result.node) : result.node;

  return {
    next: {
      ...state,
      root: autoBalancedRoot,
      highlighted: null,
      traversal: [],
      traversalType: null
    },
    title: `Delete ${value}`,
    description: state.autoBalance
      ? `${value} was removed and the tree was rebalanced.`
      : `${value} was removed from the BST.`,
    complexity: state.autoBalance ? 'O(log n) average + O(n) rebalance' : 'O(log n) average'
  };
}

export function searchTree(state: TreeState, value: number): TreeActionResult {
  const found = searchNode(state.root, value);
  return {
    next: {
      ...state,
      highlighted: found ? value : null,
      traversal: [],
      traversalType: null
    },
    title: `Search ${value}`,
    description: found ? `${value} exists in the BST.` : `${value} was not found in the BST.`,
    complexity: 'O(log n) average',
    isError: !found
  };
}

export function traverseTree(state: TreeState, type: TraversalType): TreeActionResult {
  const values: number[] = [];

  if (type === 'inorder') {
    inorder(state.root, values);
  } else if (type === 'preorder') {
    preorder(state.root, values);
  } else if (type === 'postorder') {
    postorder(state.root, values);
  } else {
    values.push(...levelOrder(state.root));
  }

  const label = type.charAt(0).toUpperCase() + type.slice(1);

  return {
    next: {
      ...state,
      highlighted: null,
      traversal: values,
      traversalType: type
    },
    title: `${label} traversal`,
    description:
      values.length > 0
        ? `${label} order: ${values.join(' → ')}`
        : `BST is empty. ${label} traversal produced no values.`,
    complexity: 'O(n)',
    isError: values.length === 0
  };
}

export function stopTreeTraversal(state: TreeState): TreeActionResult {
  if (state.traversalType === null && state.traversal.length === 0) {
    return {
      next: state,
      title: 'Traversal already stopped',
      description: 'No traversal is currently active.',
      complexity: 'O(1)'
    };
  }

  return {
    next: {
      ...state,
      traversal: [],
      traversalType: null
    },
    title: 'Traversal stopped',
    description: 'Stopped traversal playback and cleared traversal state.',
    complexity: 'O(1)'
  };
}

export function clearTree(): TreeActionResult {
  return {
    next: {
      root: null,
      highlighted: null,
      traversal: [],
      traversalType: null,
      autoBalance: false
    },
    title: 'Reset tree',
    description: 'Cleared the BST and removed all nodes.',
    complexity: 'O(n)'
  };
}

export function setTreeAutoBalance(state: TreeState, enabled: boolean): TreeActionResult {
  if (enabled === state.autoBalance) {
    return {
      next: state,
      title: enabled ? 'Auto-balance already enabled' : 'Auto-balance already disabled',
      description: enabled
        ? 'Auto-balance mode is already active.'
        : 'Auto-balance mode is already inactive.',
      complexity: 'O(1)'
    };
  }

  if (!enabled) {
    return {
      next: {
        ...state,
        autoBalance: false
      },
      title: 'Auto-balance disabled',
      description: 'New insert/delete operations will use plain BST behavior.',
      complexity: 'O(1)'
    };
  }

  const nextRoot = rebalanceRoot(state.root);
  const info = analyzeTree(nextRoot);

  return {
    next: {
      ...state,
      root: nextRoot,
      autoBalance: true,
      highlighted: null,
      traversal: [],
      traversalType: null
    },
    title: 'Auto-balance enabled',
    description:
      nextRoot === null
        ? 'Auto-balance is enabled. The tree is currently empty.'
        : `Tree rebalanced. Height is now ${info.height}.`,
    complexity: nextRoot === null ? 'O(1)' : 'O(n)'
  };
}

export function rebalanceTree(state: TreeState): TreeActionResult {
  if (state.root === null) {
    return {
      next: state,
      title: 'Rebalance skipped',
      description: 'Tree is empty. Add nodes before rebalancing.',
      complexity: 'O(1)',
      isError: true
    };
  }

  const currentInfo = analyzeTree(state.root);
  if (currentInfo.balanced) {
    return {
      next: {
        ...state,
        highlighted: null,
        traversal: [],
        traversalType: null
      },
      title: 'Tree already balanced',
      description: `Tree is already balanced (height ${currentInfo.height}).`,
      complexity: 'O(1)'
    };
  }

  const nextRoot = rebalanceRoot(state.root);
  const nextInfo = analyzeTree(nextRoot);

  return {
    next: {
      ...state,
      root: nextRoot,
      highlighted: null,
      traversal: [],
      traversalType: null
    },
    title: 'Tree rebalanced',
    description: `Rebalanced tree. Height is now ${nextInfo.height}.`,
    complexity: 'O(n)'
  };
}

export function presetTree(autoBalance = false): TreeActionResult {
  const values = [40, 22, 60, 13, 30, 50, 72, 27, 35];
  let state: TreeState = {
    root: null,
    highlighted: null,
    traversal: [],
    traversalType: null,
    autoBalance: false
  };

  for (const value of values) {
    state = insertTree(state, value).next;
  }

  const nextRoot = autoBalance ? rebalanceRoot(state.root) : state.root;

  return {
    next: {
      ...state,
      root: nextRoot,
      highlighted: null,
      autoBalance
    },
    title: 'Load BST preset',
    description: autoBalance
      ? 'Loaded sample values and rebalanced the BST.'
      : 'Loaded a balanced sample tree for experimentation.',
    complexity: 'O(n log n)'
  };
}
