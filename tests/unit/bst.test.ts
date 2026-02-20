import { describe, expect, it } from 'vitest';
import { deleteTree, insertTree, searchTree, traverseTree, type TreeState } from '../../src/lib/algorithms/bst';

const EMPTY_TREE: TreeState = {
  root: null,
  highlighted: null,
  traversal: [],
  traversalType: null
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
});
