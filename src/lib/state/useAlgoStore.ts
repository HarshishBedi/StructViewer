import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import {
  clearTree,
  deleteTree,
  insertTree,
  presetTree,
  setTreeAutoBalance,
  rebalanceTree,
  searchTree,
  stopTreeTraversal,
  traverseTree,
  type TraversalType,
  type TreeState
} from '../algorithms/bst';
import {
  clearHeap,
  extractRoot,
  insertHeap,
  presetHeap,
  toggleHeapMode,
  type HeapMode,
  type HeapState
} from '../algorithms/heap';
import {
  clearQueue,
  dequeueQueue,
  enqueueQueue,
  frontQueue,
  presetQueue,
  type QueueState
} from '../algorithms/queue';
import { clearStack, peekStack, popStack, pushStack, type StackState } from '../algorithms/stack';
import {
  clearTrie,
  deleteTrieWord,
  insertTrieWord,
  prefixTrieWords,
  presetTrie,
  searchTrieWord,
  type TrieState
} from '../algorithms/trie';
import {
  connectedNodes,
  createUnionFindState,
  findNode,
  presetUnionFind,
  resetUnionFind,
  resizeUnionFind,
  unionNodes,
  type UnionFindState
} from '../algorithms/unionFind';
import { type ModuleId } from '../constants/modules';
import { persistThemeMode, readStoredThemeMode, type ThemeMode } from '../theme/theme';

export interface TimelineStep<TState> {
  state: TState;
  title: string;
  description: string;
  complexity: string;
  timestamp: number;
  isError: boolean;
}

export interface SessionState<TState> {
  history: TimelineStep<TState>[];
  cursor: number;
}

interface SessionMeta {
  currentStep: number;
  totalSteps: number;
}

interface SharedUiState {
  autoplay: boolean;
  helpOpen: boolean;
  commandPaletteOpen: boolean;
  themeMode: ThemeMode;
}

interface AlgoStoreState extends SharedUiState {
  activeModule: ModuleId;
  stackSession: SessionState<StackState>;
  queueSession: SessionState<QueueState>;
  heapSession: SessionState<HeapState>;
  treeSession: SessionState<TreeState>;
  trieSession: SessionState<TrieState>;
  unionFindSession: SessionState<UnionFindState>;
  setActiveModule: (module: ModuleId) => void;
  setAutoplay: (value: boolean) => void;
  toggleAutoplay: () => void;
  setHelpOpen: (value: boolean) => void;
  setCommandPaletteOpen: (value: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
  prevStep: () => void;
  nextStep: () => void;
  jumpToStep: (stepIndex: number) => void;
  resetActiveStructure: () => void;
  stackPush: (value: number) => void;
  stackPop: () => void;
  stackPeek: () => void;
  stackClear: () => void;
  stackLoadPreset: () => void;
  queueEnqueue: (value: number) => void;
  queueDequeue: () => void;
  queueFront: () => void;
  queueClear: () => void;
  queueLoadPreset: () => void;
  heapInsert: (value: number) => void;
  heapExtractRoot: () => void;
  heapSetMode: (mode: HeapMode) => void;
  heapReset: () => void;
  heapLoadPreset: () => void;
  treeInsert: (value: number) => void;
  treeDelete: (value: number) => void;
  treeSearch: (value: number) => void;
  treeTraverse: (type: TraversalType) => void;
  treeStopTraversal: () => void;
  treeSetAutoBalance: (enabled: boolean) => void;
  treeRebalance: () => void;
  treeReset: () => void;
  treeLoadPreset: () => void;
  trieInsertWord: (word: string) => void;
  trieDeleteWord: (word: string) => void;
  trieSearchWord: (word: string) => void;
  triePrefixSearch: (prefix: string) => void;
  trieClear: () => void;
  trieLoadPreset: () => void;
  unionFindResize: (size: number) => void;
  unionFindUnion: (left: number, right: number) => void;
  unionFindFind: (index: number) => void;
  unionFindConnected: (left: number, right: number) => void;
  unionFindReset: () => void;
  unionFindLoadPreset: () => void;
}

const MAX_HISTORY = 240;

function createStep<TState>(
  state: TState,
  title: string,
  description: string,
  complexity: string,
  isError = false
): TimelineStep<TState> {
  return {
    state,
    title,
    description,
    complexity,
    timestamp: Date.now(),
    isError
  };
}

function createSession<TState>(initialStep: TimelineStep<TState>): SessionState<TState> {
  return {
    history: [initialStep],
    cursor: 0
  };
}

function appendStep<TState>(
  session: SessionState<TState>,
  step: TimelineStep<TState>
): SessionState<TState> {
  const baseHistory = session.history.slice(0, session.cursor + 1);
  let history = [...baseHistory, step];

  if (history.length > MAX_HISTORY) {
    history = history.slice(history.length - MAX_HISTORY);
  }

  return {
    history,
    cursor: history.length - 1
  };
}

function moveCursor<TState>(session: SessionState<TState>, cursor: number): SessionState<TState> {
  return {
    ...session,
    cursor: Math.max(0, Math.min(cursor, session.history.length - 1))
  };
}

const INITIAL_STACK_STATE: StackState = { items: [] };
const INITIAL_QUEUE_STATE: QueueState = { items: [], highlighted: null };
const INITIAL_HEAP_STATE = presetHeap('max').next;
const INITIAL_TREE_STATE = presetTree().next;
const INITIAL_TRIE_STATE = presetTrie().next;
const INITIAL_UNION_FIND_STATE = createUnionFindState(8);

const INITIAL_STACK_SESSION = createSession(
  createStep(INITIAL_STACK_STATE, 'Stack initialized', 'Start with an empty stack.', 'O(1)')
);

const INITIAL_HEAP_SESSION = createSession(
  createStep(
    INITIAL_HEAP_STATE,
    'Heap preset loaded',
    'A sample max-heap is ready. Insert or extract to explore behavior.',
    'O(n)'
  )
);

const INITIAL_QUEUE_SESSION = createSession(
  createStep(INITIAL_QUEUE_STATE, 'Queue initialized', 'Start with an empty queue.', 'O(1)')
);

const INITIAL_TREE_SESSION = createSession(
  createStep(
    INITIAL_TREE_STATE,
    'BST preset loaded',
    'A sample binary search tree is ready for operations and traversals.',
    'O(n log n)'
  )
);

const INITIAL_TRIE_SESSION = createSession(
  createStep(
    INITIAL_TRIE_STATE,
    'Trie preset loaded',
    'A sample trie is ready for insert/search/prefix experiments.',
    'O(nk)'
  )
);

const INITIAL_UNION_FIND_SESSION = createSession(
  createStep(
    INITIAL_UNION_FIND_STATE,
    'Union-Find initialized',
    'A disjoint set with 8 isolated nodes is ready.',
    'O(n)'
  )
);

function stackPresetValues(): StackState {
  return { items: [4, 9, 16] };
}

export const useAlgoStore = create<AlgoStoreState>((set) => ({
  activeModule: 'stack',
  autoplay: false,
  helpOpen: false,
  commandPaletteOpen: false,
  themeMode: readStoredThemeMode(),
  stackSession: INITIAL_STACK_SESSION,
  queueSession: INITIAL_QUEUE_SESSION,
  heapSession: INITIAL_HEAP_SESSION,
  treeSession: INITIAL_TREE_SESSION,
  trieSession: INITIAL_TRIE_SESSION,
  unionFindSession: INITIAL_UNION_FIND_SESSION,
  setActiveModule: (module) =>
    set(() => ({
      activeModule: module,
      autoplay: false,
      commandPaletteOpen: false
    })),
  setAutoplay: (value) => set({ autoplay: value }),
  toggleAutoplay: () => set((state) => ({ autoplay: !state.autoplay })),
  setHelpOpen: (value) => set({ helpOpen: value }),
  setCommandPaletteOpen: (value) => set({ commandPaletteOpen: value }),
  setThemeMode: (mode) =>
    set(() => {
      persistThemeMode(mode);
      return { themeMode: mode };
    }),
  prevStep: () =>
    set((state) => {
      if (state.activeModule === 'stack') {
        return { stackSession: moveCursor(state.stackSession, state.stackSession.cursor - 1) };
      }

      if (state.activeModule === 'queue') {
        return { queueSession: moveCursor(state.queueSession, state.queueSession.cursor - 1) };
      }

      if (state.activeModule === 'heap') {
        return { heapSession: moveCursor(state.heapSession, state.heapSession.cursor - 1) };
      }

      if (state.activeModule === 'tree') {
        return { treeSession: moveCursor(state.treeSession, state.treeSession.cursor - 1) };
      }

      if (state.activeModule === 'trie') {
        return { trieSession: moveCursor(state.trieSession, state.trieSession.cursor - 1) };
      }

      return {
        unionFindSession: moveCursor(state.unionFindSession, state.unionFindSession.cursor - 1)
      };
    }),
  nextStep: () =>
    set((state) => {
      if (state.activeModule === 'stack') {
        return { stackSession: moveCursor(state.stackSession, state.stackSession.cursor + 1) };
      }

      if (state.activeModule === 'queue') {
        return { queueSession: moveCursor(state.queueSession, state.queueSession.cursor + 1) };
      }

      if (state.activeModule === 'heap') {
        return { heapSession: moveCursor(state.heapSession, state.heapSession.cursor + 1) };
      }

      if (state.activeModule === 'tree') {
        return { treeSession: moveCursor(state.treeSession, state.treeSession.cursor + 1) };
      }

      if (state.activeModule === 'trie') {
        return { trieSession: moveCursor(state.trieSession, state.trieSession.cursor + 1) };
      }

      return {
        unionFindSession: moveCursor(state.unionFindSession, state.unionFindSession.cursor + 1)
      };
    }),
  jumpToStep: (stepIndex) =>
    set((state) => {
      if (state.activeModule === 'stack') {
        return { stackSession: moveCursor(state.stackSession, stepIndex) };
      }

      if (state.activeModule === 'queue') {
        return { queueSession: moveCursor(state.queueSession, stepIndex) };
      }

      if (state.activeModule === 'heap') {
        return { heapSession: moveCursor(state.heapSession, stepIndex) };
      }

      if (state.activeModule === 'tree') {
        return { treeSession: moveCursor(state.treeSession, stepIndex) };
      }

      if (state.activeModule === 'trie') {
        return { trieSession: moveCursor(state.trieSession, stepIndex) };
      }

      return { unionFindSession: moveCursor(state.unionFindSession, stepIndex) };
    }),
  resetActiveStructure: () =>
    set((state) => {
      if (state.activeModule === 'stack') {
        return {
          stackSession: createSession(
            createStep(INITIAL_STACK_STATE, 'Stack reset', 'Stack was reset to empty.', 'O(1)')
          ),
          autoplay: false
        };
      }

      if (state.activeModule === 'queue') {
        return {
          queueSession: createSession(
            createStep(INITIAL_QUEUE_STATE, 'Queue reset', 'Queue was reset to empty.', 'O(1)')
          ),
          autoplay: false
        };
      }

      if (state.activeModule === 'heap') {
        const current = state.heapSession.history[state.heapSession.cursor].state;
        const result = clearHeap(current);
        return {
          heapSession: createSession(
            createStep(result.next, result.title, result.description, result.complexity, !!result.isError)
          ),
          autoplay: false
        };
      }

      if (state.activeModule === 'tree') {
        const result = clearTree();
        return {
          treeSession: createSession(
            createStep(result.next, result.title, result.description, result.complexity, !!result.isError)
          ),
          autoplay: false
        };
      }

      if (state.activeModule === 'trie') {
        const result = clearTrie();
        return {
          trieSession: createSession(
            createStep(result.next, result.title, result.description, result.complexity, !!result.isError)
          ),
          autoplay: false
        };
      }

      const current = state.unionFindSession.history[state.unionFindSession.cursor].state;
      const result = resetUnionFind(current);
      return {
        unionFindSession: createSession(
          createStep(result.next, result.title, result.description, result.complexity, !!result.isError)
        ),
        autoplay: false
      };
    }),
  stackPush: (value) =>
    set((state) => {
      const current = state.stackSession.history[state.stackSession.cursor].state;
      const result = pushStack(current, value);
      return {
        stackSession: appendStep(
          state.stackSession,
          createStep(result.next, result.title, result.description, result.complexity, !!result.isError)
        )
      };
    }),
  stackPop: () =>
    set((state) => {
      const current = state.stackSession.history[state.stackSession.cursor].state;
      const result = popStack(current);

      return {
        stackSession: appendStep(
          state.stackSession,
          createStep(result.next, result.title, result.description, result.complexity, !!result.isError)
        )
      };
    }),
  stackPeek: () =>
    set((state) => {
      const current = state.stackSession.history[state.stackSession.cursor].state;
      const result = peekStack(current);

      return {
        stackSession: appendStep(
          state.stackSession,
          createStep(result.next, result.title, result.description, result.complexity, !!result.isError)
        )
      };
    }),
  stackClear: () =>
    set((state) => {
      const result = clearStack();
      return {
        stackSession: appendStep(
          state.stackSession,
          createStep(result.next, result.title, result.description, result.complexity, !!result.isError)
        )
      };
    }),
  stackLoadPreset: () =>
    set((state) => {
      const nextState = stackPresetValues();
      return {
        stackSession: appendStep(
          state.stackSession,
          createStep(nextState, 'Load stack preset', 'Loaded sample values [4, 9, 16].', 'O(n)')
        )
      };
    }),
  queueEnqueue: (value) =>
    set((state) => {
      const current = state.queueSession.history[state.queueSession.cursor].state;
      const result = enqueueQueue(current, value);
      return {
        queueSession: appendStep(
          state.queueSession,
          createStep(result.next, result.title, result.description, result.complexity, !!result.isError)
        )
      };
    }),
  queueDequeue: () =>
    set((state) => {
      const current = state.queueSession.history[state.queueSession.cursor].state;
      const result = dequeueQueue(current);
      return {
        queueSession: appendStep(
          state.queueSession,
          createStep(result.next, result.title, result.description, result.complexity, !!result.isError)
        )
      };
    }),
  queueFront: () =>
    set((state) => {
      const current = state.queueSession.history[state.queueSession.cursor].state;
      const result = frontQueue(current);
      return {
        queueSession: appendStep(
          state.queueSession,
          createStep(result.next, result.title, result.description, result.complexity, !!result.isError)
        )
      };
    }),
  queueClear: () =>
    set((state) => {
      const result = clearQueue();
      return {
        queueSession: appendStep(
          state.queueSession,
          createStep(result.next, result.title, result.description, result.complexity, !!result.isError)
        )
      };
    }),
  queueLoadPreset: () =>
    set((state) => {
      const result = presetQueue();
      return {
        queueSession: appendStep(
          state.queueSession,
          createStep(result.next, result.title, result.description, result.complexity, !!result.isError)
        )
      };
    }),
  heapInsert: (value) =>
    set((state) => {
      const current = state.heapSession.history[state.heapSession.cursor].state;
      const result = insertHeap(current, value);

      return {
        heapSession: appendStep(
          state.heapSession,
          createStep(result.next, result.title, result.description, result.complexity, !!result.isError)
        )
      };
    }),
  heapExtractRoot: () =>
    set((state) => {
      const current = state.heapSession.history[state.heapSession.cursor].state;
      const result = extractRoot(current);

      return {
        heapSession: appendStep(
          state.heapSession,
          createStep(result.next, result.title, result.description, result.complexity, !!result.isError)
        )
      };
    }),
  heapSetMode: (mode) =>
    set((state) => {
      const current = state.heapSession.history[state.heapSession.cursor].state;
      const result = toggleHeapMode(current, mode);

      return {
        heapSession: appendStep(
          state.heapSession,
          createStep(result.next, result.title, result.description, result.complexity, !!result.isError)
        )
      };
    }),
  heapReset: () =>
    set((state) => {
      const current = state.heapSession.history[state.heapSession.cursor].state;
      const result = clearHeap(current);
      return {
        heapSession: createSession(
          createStep(result.next, result.title, result.description, result.complexity, !!result.isError)
        ),
        autoplay: false
      };
    }),
  heapLoadPreset: () =>
    set((state) => {
      const current = state.heapSession.history[state.heapSession.cursor].state;
      const result = presetHeap(current.mode);

      return {
        heapSession: appendStep(
          state.heapSession,
          createStep(result.next, result.title, result.description, result.complexity, !!result.isError)
        )
      };
    }),
  treeInsert: (value) =>
    set((state) => {
      const current = state.treeSession.history[state.treeSession.cursor].state;
      const result = insertTree(current, value);

      return {
        treeSession: appendStep(
          state.treeSession,
          createStep(result.next, result.title, result.description, result.complexity, !!result.isError)
        )
      };
    }),
  treeDelete: (value) =>
    set((state) => {
      const current = state.treeSession.history[state.treeSession.cursor].state;
      const result = deleteTree(current, value);

      return {
        treeSession: appendStep(
          state.treeSession,
          createStep(result.next, result.title, result.description, result.complexity, !!result.isError)
        )
      };
    }),
  treeSearch: (value) =>
    set((state) => {
      const current = state.treeSession.history[state.treeSession.cursor].state;
      const result = searchTree(current, value);

      return {
        treeSession: appendStep(
          state.treeSession,
          createStep(result.next, result.title, result.description, result.complexity, !!result.isError)
        )
      };
    }),
  treeTraverse: (type) =>
    set((state) => {
      const current = state.treeSession.history[state.treeSession.cursor].state;
      const result = traverseTree(current, type);

      return {
        treeSession: appendStep(
          state.treeSession,
          createStep(result.next, result.title, result.description, result.complexity, !!result.isError)
        )
      };
    }),
  treeStopTraversal: () =>
    set((state) => {
      const current = state.treeSession.history[state.treeSession.cursor].state;
      const result = stopTreeTraversal(current);

      return {
        treeSession: appendStep(
          state.treeSession,
          createStep(result.next, result.title, result.description, result.complexity, !!result.isError)
        )
      };
    }),
  treeSetAutoBalance: (enabled) =>
    set((state) => {
      const current = state.treeSession.history[state.treeSession.cursor].state;
      const result = setTreeAutoBalance(current, enabled);

      return {
        treeSession: appendStep(
          state.treeSession,
          createStep(result.next, result.title, result.description, result.complexity, !!result.isError)
        )
      };
    }),
  treeRebalance: () =>
    set((state) => {
      const current = state.treeSession.history[state.treeSession.cursor].state;
      const result = rebalanceTree(current);

      return {
        treeSession: appendStep(
          state.treeSession,
          createStep(result.next, result.title, result.description, result.complexity, !!result.isError)
        )
      };
    }),
  treeReset: () =>
    set(() => {
      const result = clearTree();
      return {
        treeSession: createSession(
          createStep(result.next, result.title, result.description, result.complexity, !!result.isError)
        ),
        autoplay: false
      };
    }),
  treeLoadPreset: () =>
    set((state) => {
      const current = state.treeSession.history[state.treeSession.cursor].state;
      const result = presetTree(current.autoBalance);
      return {
        treeSession: appendStep(
          state.treeSession,
          createStep(result.next, result.title, result.description, result.complexity, !!result.isError)
        )
      };
    }),
  trieInsertWord: (word) =>
    set((state) => {
      const current = state.trieSession.history[state.trieSession.cursor].state;
      const result = insertTrieWord(current, word);
      return {
        trieSession: appendStep(
          state.trieSession,
          createStep(result.next, result.title, result.description, result.complexity, !!result.isError)
        )
      };
    }),
  trieDeleteWord: (word) =>
    set((state) => {
      const current = state.trieSession.history[state.trieSession.cursor].state;
      const result = deleteTrieWord(current, word);
      return {
        trieSession: appendStep(
          state.trieSession,
          createStep(result.next, result.title, result.description, result.complexity, !!result.isError)
        )
      };
    }),
  trieSearchWord: (word) =>
    set((state) => {
      const current = state.trieSession.history[state.trieSession.cursor].state;
      const result = searchTrieWord(current, word);
      return {
        trieSession: appendStep(
          state.trieSession,
          createStep(result.next, result.title, result.description, result.complexity, !!result.isError)
        )
      };
    }),
  triePrefixSearch: (prefix) =>
    set((state) => {
      const current = state.trieSession.history[state.trieSession.cursor].state;
      const result = prefixTrieWords(current, prefix);
      return {
        trieSession: appendStep(
          state.trieSession,
          createStep(result.next, result.title, result.description, result.complexity, !!result.isError)
        )
      };
    }),
  trieClear: () =>
    set((state) => {
      const result = clearTrie();
      return {
        trieSession: appendStep(
          state.trieSession,
          createStep(result.next, result.title, result.description, result.complexity, !!result.isError)
        )
      };
    }),
  trieLoadPreset: () =>
    set((state) => {
      const result = presetTrie();
      return {
        trieSession: appendStep(
          state.trieSession,
          createStep(result.next, result.title, result.description, result.complexity, !!result.isError)
        )
      };
    }),
  unionFindResize: (size) =>
    set((state) => {
      const current = state.unionFindSession.history[state.unionFindSession.cursor].state;
      const result = resizeUnionFind(current, size);
      return {
        unionFindSession: appendStep(
          state.unionFindSession,
          createStep(result.next, result.title, result.description, result.complexity, !!result.isError)
        )
      };
    }),
  unionFindUnion: (left, right) =>
    set((state) => {
      const current = state.unionFindSession.history[state.unionFindSession.cursor].state;
      const result = unionNodes(current, left, right);
      return {
        unionFindSession: appendStep(
          state.unionFindSession,
          createStep(result.next, result.title, result.description, result.complexity, !!result.isError)
        )
      };
    }),
  unionFindFind: (index) =>
    set((state) => {
      const current = state.unionFindSession.history[state.unionFindSession.cursor].state;
      const result = findNode(current, index);
      return {
        unionFindSession: appendStep(
          state.unionFindSession,
          createStep(result.next, result.title, result.description, result.complexity, !!result.isError)
        )
      };
    }),
  unionFindConnected: (left, right) =>
    set((state) => {
      const current = state.unionFindSession.history[state.unionFindSession.cursor].state;
      const result = connectedNodes(current, left, right);
      return {
        unionFindSession: appendStep(
          state.unionFindSession,
          createStep(result.next, result.title, result.description, result.complexity, !!result.isError)
        )
      };
    }),
  unionFindReset: () =>
    set((state) => {
      const current = state.unionFindSession.history[state.unionFindSession.cursor].state;
      const result = resetUnionFind(current);
      return {
        unionFindSession: createSession(
          createStep(result.next, result.title, result.description, result.complexity, !!result.isError)
        ),
        autoplay: false
      };
    }),
  unionFindLoadPreset: () =>
    set((state) => {
      const result = presetUnionFind();
      return {
        unionFindSession: appendStep(
          state.unionFindSession,
          createStep(result.next, result.title, result.description, result.complexity, !!result.isError)
        )
      };
    })
}));

export function useActiveSessionMeta(): SessionMeta {
  return useAlgoStore(
    useShallow(
    (state) => {
      if (state.activeModule === 'stack') {
        return {
          currentStep: state.stackSession.cursor,
          totalSteps: state.stackSession.history.length
        };
      }

      if (state.activeModule === 'queue') {
        return {
          currentStep: state.queueSession.cursor,
          totalSteps: state.queueSession.history.length
        };
      }

      if (state.activeModule === 'heap') {
        return {
          currentStep: state.heapSession.cursor,
          totalSteps: state.heapSession.history.length
        };
      }

      if (state.activeModule === 'tree') {
        return {
          currentStep: state.treeSession.cursor,
          totalSteps: state.treeSession.history.length
        };
      }

      if (state.activeModule === 'trie') {
        return {
          currentStep: state.trieSession.cursor,
          totalSteps: state.trieSession.history.length
        };
      }

      return {
        currentStep: state.unionFindSession.cursor,
        totalSteps: state.unionFindSession.history.length
      };
    }
    )
  );
}

export function useActiveCurrentStep(): TimelineStep<
  StackState | QueueState | HeapState | TreeState | TrieState | UnionFindState
> {
  return useAlgoStore((state) => {
    if (state.activeModule === 'stack') {
      return state.stackSession.history[state.stackSession.cursor];
    }

    if (state.activeModule === 'queue') {
      return state.queueSession.history[state.queueSession.cursor];
    }

    if (state.activeModule === 'heap') {
      return state.heapSession.history[state.heapSession.cursor];
    }

    if (state.activeModule === 'tree') {
      return state.treeSession.history[state.treeSession.cursor];
    }

    if (state.activeModule === 'trie') {
      return state.trieSession.history[state.trieSession.cursor];
    }

    return state.unionFindSession.history[state.unionFindSession.cursor];
  });
}

export function useActiveHistory(): Array<
  TimelineStep<StackState | QueueState | HeapState | TreeState | TrieState | UnionFindState>
> {
  return useAlgoStore((state) => {
    if (state.activeModule === 'stack') {
      return state.stackSession.history;
    }

    if (state.activeModule === 'queue') {
      return state.queueSession.history;
    }

    if (state.activeModule === 'heap') {
      return state.heapSession.history;
    }

    if (state.activeModule === 'tree') {
      return state.treeSession.history;
    }

    if (state.activeModule === 'trie') {
      return state.trieSession.history;
    }

    return state.unionFindSession.history;
  });
}
