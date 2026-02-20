import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import {
  deleteTree,
  insertTree,
  presetTree,
  searchTree,
  traverseTree,
  type TraversalType,
  type TreeState
} from '../algorithms/bst';
import {
  extractRoot,
  insertHeap,
  presetHeap,
  toggleHeapMode,
  type HeapMode,
  type HeapState
} from '../algorithms/heap';
import { clearStack, peekStack, popStack, pushStack, type StackState } from '../algorithms/stack';
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
  heapSession: SessionState<HeapState>;
  treeSession: SessionState<TreeState>;
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
  heapInsert: (value: number) => void;
  heapExtractRoot: () => void;
  heapSetMode: (mode: HeapMode) => void;
  heapReset: () => void;
  heapLoadPreset: () => void;
  treeInsert: (value: number) => void;
  treeDelete: (value: number) => void;
  treeSearch: (value: number) => void;
  treeTraverse: (type: TraversalType) => void;
  treeReset: () => void;
  treeLoadPreset: () => void;
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
const INITIAL_HEAP_STATE = presetHeap('max').next;
const INITIAL_TREE_STATE = presetTree().next;

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

const INITIAL_TREE_SESSION = createSession(
  createStep(
    INITIAL_TREE_STATE,
    'BST preset loaded',
    'A sample binary search tree is ready for operations and traversals.',
    'O(n log n)'
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
  heapSession: INITIAL_HEAP_SESSION,
  treeSession: INITIAL_TREE_SESSION,
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

      if (state.activeModule === 'heap') {
        return { heapSession: moveCursor(state.heapSession, state.heapSession.cursor - 1) };
      }

      return { treeSession: moveCursor(state.treeSession, state.treeSession.cursor - 1) };
    }),
  nextStep: () =>
    set((state) => {
      if (state.activeModule === 'stack') {
        return { stackSession: moveCursor(state.stackSession, state.stackSession.cursor + 1) };
      }

      if (state.activeModule === 'heap') {
        return { heapSession: moveCursor(state.heapSession, state.heapSession.cursor + 1) };
      }

      return { treeSession: moveCursor(state.treeSession, state.treeSession.cursor + 1) };
    }),
  jumpToStep: (stepIndex) =>
    set((state) => {
      if (state.activeModule === 'stack') {
        return { stackSession: moveCursor(state.stackSession, stepIndex) };
      }

      if (state.activeModule === 'heap') {
        return { heapSession: moveCursor(state.heapSession, stepIndex) };
      }

      return { treeSession: moveCursor(state.treeSession, stepIndex) };
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

      if (state.activeModule === 'heap') {
        return {
          heapSession: createSession(
            createStep(
              INITIAL_HEAP_STATE,
              'Heap reset',
              'Heap reset to sample max-heap preset.',
              'O(n)'
            )
          ),
          autoplay: false
        };
      }

      return {
        treeSession: createSession(
          createStep(
            INITIAL_TREE_STATE,
            'Tree reset',
            'Tree reset to sample BST preset.',
            'O(n log n)'
          )
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
    set((state) => ({
      heapSession: appendStep(
        state.heapSession,
        createStep(INITIAL_HEAP_STATE, 'Heap reset', 'Reset to sample max-heap preset.', 'O(n)')
      )
    })),
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
  treeReset: () =>
    set((state) => ({
      treeSession: appendStep(
        state.treeSession,
        createStep(INITIAL_TREE_STATE, 'Tree reset', 'Reset to sample BST preset.', 'O(n log n)')
      )
    })),
  treeLoadPreset: () =>
    set((state) => {
      const result = presetTree();
      return {
        treeSession: appendStep(
          state.treeSession,
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

      if (state.activeModule === 'heap') {
        return {
          currentStep: state.heapSession.cursor,
          totalSteps: state.heapSession.history.length
        };
      }

      return {
        currentStep: state.treeSession.cursor,
        totalSteps: state.treeSession.history.length
      };
    }
    )
  );
}

export function useActiveCurrentStep(): TimelineStep<StackState | HeapState | TreeState> {
  return useAlgoStore((state) => {
    if (state.activeModule === 'stack') {
      return state.stackSession.history[state.stackSession.cursor];
    }

    if (state.activeModule === 'heap') {
      return state.heapSession.history[state.heapSession.cursor];
    }

    return state.treeSession.history[state.treeSession.cursor];
  });
}

export function useActiveHistory(): Array<TimelineStep<StackState | HeapState | TreeState>> {
  return useAlgoStore((state) => {
    if (state.activeModule === 'stack') {
      return state.stackSession.history;
    }

    if (state.activeModule === 'heap') {
      return state.heapSession.history;
    }

    return state.treeSession.history;
  });
}
