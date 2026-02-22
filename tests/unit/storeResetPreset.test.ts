import { beforeEach, describe, expect, it } from 'vitest';
import { presetTree, traverseTree } from '../../src/lib/algorithms/bst';
import { presetHeap } from '../../src/lib/algorithms/heap';
import { presetTrie } from '../../src/lib/algorithms/trie';
import { useAlgoStore } from '../../src/lib/state/useAlgoStore';

function resetStore(): void {
  useAlgoStore.setState(useAlgoStore.getInitialState(), true);
}

function currentHeapState() {
  const session = useAlgoStore.getState().heapSession;
  return session.history[session.cursor].state;
}

function currentTreeState() {
  const session = useAlgoStore.getState().treeSession;
  return session.history[session.cursor].state;
}

function currentTrieState() {
  const session = useAlgoStore.getState().trieSession;
  return session.history[session.cursor].state;
}

function currentUnionFindState() {
  const session = useAlgoStore.getState().unionFindSession;
  return session.history[session.cursor].state;
}

describe('store reset/preset semantics', () => {
  beforeEach(() => {
    resetStore();
  });

  it('global reset clears heap, tree, and trie', () => {
    const actions = useAlgoStore.getState();

    actions.setActiveModule('heap');
    actions.resetActiveStructure();
    expect(currentHeapState().items).toEqual([]);

    actions.setActiveModule('tree');
    actions.resetActiveStructure();
    const treeState = currentTreeState();
    expect(treeState.root).toBeNull();
    expect(treeState.autoBalance).toBe(false);

    actions.setActiveModule('trie');
    actions.resetActiveStructure();
    expect(currentTrieState().words).toEqual([]);
  });

  it('heap reset clears values while preserving selected mode', () => {
    const actions = useAlgoStore.getState();
    actions.heapSetMode('min');
    actions.heapInsert(-7);
    actions.heapReset();

    const heapState = currentHeapState();
    expect(heapState.mode).toBe('min');
    expect(heapState.items).toEqual([]);
  });

  it('tree reset clears nodes and disables auto-balance', () => {
    const actions = useAlgoStore.getState();
    actions.treeSetAutoBalance(true);
    actions.treeInsert(99);
    actions.treeReset();

    const treeState = currentTreeState();
    expect(treeState.root).toBeNull();
    expect(treeState.autoBalance).toBe(false);
    expect(treeState.traversal).toEqual([]);
    expect(treeState.traversalType).toBeNull();
  });

  it('global union-find reset matches module reset for current size', () => {
    const actions = useAlgoStore.getState();
    actions.unionFindResize(12);
    actions.unionFindUnion(0, 1);
    actions.unionFindUnion(1, 2);
    actions.unionFindReset();

    let state = currentUnionFindState();
    expect(state.size).toBe(12);
    expect(state.parent).toEqual(Array.from({ length: 12 }, (_, index) => index));

    actions.unionFindUnion(3, 4);
    actions.setActiveModule('unionfind');
    actions.resetActiveStructure();

    state = currentUnionFindState();
    expect(state.size).toBe(12);
    expect(state.parent).toEqual(Array.from({ length: 12 }, (_, index) => index));
  });

  it('load preset replaces current data with preset sample only', () => {
    const actions = useAlgoStore.getState();

    actions.heapReset();
    actions.heapInsert(999);
    actions.heapLoadPreset();
    expect(currentHeapState().items).toEqual(presetHeap(currentHeapState().mode).next.items);

    actions.treeReset();
    actions.treeInsert(999);
    actions.treeLoadPreset();
    const expectedTree = presetTree(currentTreeState().autoBalance).next;
    expect(traverseTree(currentTreeState(), 'inorder').next.traversal).toEqual(
      traverseTree(expectedTree, 'inorder').next.traversal
    );

    actions.trieClear();
    actions.trieInsertWord('zzz');
    actions.trieLoadPreset();
    expect(currentTrieState().words).toEqual(presetTrie().next.words);
  });
});
