import { describe, expect, it } from 'vitest';
import {
  analyzeTree,
  deleteTree,
  insertTree,
  searchTree,
  setTreeAutoBalance,
  stopTreeTraversal,
  traverseTree,
  type TreeState
} from '../../src/lib/algorithms/bst';

const EMPTY_TREE: TreeState = {
  root: null,
  highlighted: null,
  traversal: [],
  traversalType: null,
  autoBalance: false
};

describe('bst algorithms', () => {
  it('inserts values and supports search', () => {
    let state = EMPTY_TREE;
    state = insertTree(state, 40).next;
    state = insertTree(state, 22).next;
    state = insertTree(state, 60).next;

    const searchFound = searchTree(state, 22);
    const searchMissed = searchTree(state, 99);

    expect(searchFound.isError).toBe(false);
    expect(searchMissed.isError).toBe(true);
  });

  it('deletes a node and removes it from inorder traversal', () => {
    let state = EMPTY_TREE;
    for (const value of [40, 22, 60, 13, 30]) {
      state = insertTree(state, value).next;
    }

    state = deleteTree(state, 22).next;
    const inorder = traverseTree(state, 'inorder').next.traversal;

    expect(inorder).toEqual([13, 30, 40, 60]);
  });

  it('produces expected traversal order', () => {
    let state = EMPTY_TREE;
    for (const value of [40, 22, 60, 13, 30]) {
      state = insertTree(state, value).next;
    }

    const preorder = traverseTree(state, 'preorder').next.traversal;
    expect(preorder).toEqual([40, 22, 13, 30, 60]);
  });

  it('stops traversal and clears traversal state', () => {
    let state = EMPTY_TREE;
    for (const value of [40, 22, 60, 13, 30]) {
      state = insertTree(state, value).next;
    }

    state = traverseTree(state, 'inorder').next;
    expect(state.traversalType).toBe('inorder');
    expect(state.traversal.length).toBeGreaterThan(0);

    state = stopTreeTraversal(state).next;
    expect(state.traversalType).toBeNull();
    expect(state.traversal).toEqual([]);
  });

  it('rebalances a skewed tree when auto-balance is enabled', () => {
    let state = EMPTY_TREE;
    for (const value of [10, 20, 30, 40, 50, 60, 70]) {
      state = insertTree(state, value).next;
    }

    expect(analyzeTree(state.root).balanced).toBe(false);

    state = setTreeAutoBalance(state, true).next;

    const balance = analyzeTree(state.root);
    expect(state.autoBalance).toBe(true);
    expect(balance.balanced).toBe(true);
  });
});
