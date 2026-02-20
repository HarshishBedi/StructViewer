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
}

export interface TreeActionResult {
  next: TreeState;
  title: string;
  description: string;
  complexity: string;
  isError?: boolean;
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

  return {
    next: {
      ...state,
      root: result.node,
      highlighted: value,
      traversal: [],
      traversalType: null
    },
    title: `Insert ${value}`,
    description: `${value} was inserted into the BST.`,
    complexity: 'O(log n) average'
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

  return {
    next: {
      ...state,
      root: result.node,
      highlighted: null,
      traversal: [],
      traversalType: null
    },
    title: `Delete ${value}`,
    description: `${value} was removed from the BST.`,
    complexity: 'O(log n) average'
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

export function clearTree(): TreeActionResult {
  return {
    next: {
      root: null,
      highlighted: null,
      traversal: [],
      traversalType: null
    },
    title: 'Reset tree',
    description: 'Cleared the BST and removed all nodes.',
    complexity: 'O(n)'
  };
}

export function presetTree(): TreeActionResult {
  const values = [40, 22, 60, 13, 30, 50, 72, 27, 35];
  let state: TreeState = {
    root: null,
    highlighted: null,
    traversal: [],
    traversalType: null
  };

  for (const value of values) {
    state = insertTree(state, value).next;
  }

  return {
    next: {
      ...state,
      highlighted: null
    },
    title: 'Load BST preset',
    description: 'Loaded a balanced sample tree for experimentation.',
    complexity: 'O(n log n)'
  };
}
