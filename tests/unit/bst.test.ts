import { describe, expect, it } from 'vitest';
import {
  analyzeTree,
  deleteTree,
  insertTree,
  isValidBst,
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
    expect(isValidBst(state.root)).toBe(true);
  });

  it('deletes root with two children using valid BST replacement', () => {
    let state = EMPTY_TREE;
    for (const value of [40, 22, 60, 13, 30, 50, 72]) {
      state = insertTree(state, value).next;
    }

    state = deleteTree(state, 40).next;

    expect(state.root?.value).toBe(50);
    expect(traverseTree(state, 'inorder').next.traversal).toEqual([13, 22, 30, 50, 60, 72]);
    expect(isValidBst(state.root)).toBe(true);
  });

  it('preserves BST invariants through repeated mixed deletes', () => {
    let state = EMPTY_TREE;
    const values = [40, 22, 60, 13, 30, 50, 72, 27, 35];
    for (const value of values) {
      state = insertTree(state, value).next;
    }

    const toDelete = [22, 13, 72, 40, 35, 50, 30, 60, 27];
    const remaining = new Set(values);

    for (const value of toDelete) {
      state = deleteTree(state, value).next;
      remaining.delete(value);

      const inorder = traverseTree(state, 'inorder').next.traversal;
      const expected = [...remaining].sort((left, right) => left - right);

      expect(inorder).toEqual(expected);
      expect(isValidBst(state.root)).toBe(true);
    }
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
