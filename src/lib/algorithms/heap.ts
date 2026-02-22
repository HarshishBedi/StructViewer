export type HeapMode = 'min' | 'max';

export interface HeapState {
  items: number[];
  mode: HeapMode;
}

export interface HeapActionResult {
  next: HeapState;
  title: string;
  description: string;
  complexity: string;
  isError?: boolean;
}

function compare(mode: HeapMode, left: number, right: number): boolean {
  return mode === 'max' ? left > right : left < right;
}

function bubbleUp(items: number[], mode: HeapMode): void {
  let index = items.length - 1;

  while (index > 0) {
    const parentIndex = Math.floor((index - 1) / 2);
    if (compare(mode, items[parentIndex], items[index])) {
      break;
    }

    [items[parentIndex], items[index]] = [items[index], items[parentIndex]];
    index = parentIndex;
  }
}

function heapifyDown(items: number[], mode: HeapMode): void {
  let index = 0;

  while (index < items.length) {
    const left = index * 2 + 1;
    const right = left + 1;
    let target = index;

    if (left < items.length && compare(mode, items[left], items[target])) {
      target = left;
    }

    if (right < items.length && compare(mode, items[right], items[target])) {
      target = right;
    }

    if (target === index) {
      break;
    }

    [items[index], items[target]] = [items[target], items[index]];
    index = target;
  }
}

export function buildHeap(values: number[], mode: HeapMode): number[] {
  const items = [...values];
  if (items.length <= 1) {
    return items;
  }

  for (let i = Math.floor(items.length / 2) - 1; i >= 0; i -= 1) {
    let index = i;
    while (index < items.length) {
      const left = index * 2 + 1;
      const right = left + 1;
      let target = index;

      if (left < items.length && compare(mode, items[left], items[target])) {
        target = left;
      }

      if (right < items.length && compare(mode, items[right], items[target])) {
        target = right;
      }

      if (target === index) {
        break;
      }

      [items[index], items[target]] = [items[target], items[index]];
      index = target;
    }
  }

  return items;
}

export function insertHeap(state: HeapState, value: number): HeapActionResult {
  const items = [...state.items, value];
  bubbleUp(items, state.mode);

  return {
    next: {
      ...state,
      items
    },
    title: `Insert ${value}`,
    description: `${value} was inserted and bubbled into heap order.`,
    complexity: 'O(log n)'
  };
}

export function extractRoot(state: HeapState): HeapActionResult {
  if (state.items.length === 0) {
    return {
      next: state,
      title: 'Extract failed',
      description: `Cannot extract because the ${state.mode}-heap is empty.`,
      complexity: 'O(log n)',
      isError: true
    };
  }

  if (state.items.length === 1) {
    const [root] = state.items;
    return {
      next: { ...state, items: [] },
      title: `Extract ${root}`,
      description: `${root} was removed. Heap is now empty.`,
      complexity: 'O(1)'
    };
  }

  const items = [...state.items];
  const root = items[0];
  const last = items.pop() as number;
  items[0] = last;
  heapifyDown(items, state.mode);

  return {
    next: {
      ...state,
      items
    },
    title: `Extract ${root}`,
    description: `${root} was removed from the root and heap property was restored.`,
    complexity: 'O(log n)'
  };
}

export function toggleHeapMode(state: HeapState, mode: HeapMode): HeapActionResult {
  if (state.mode === mode) {
    return {
      next: state,
      title: `${mode.toUpperCase()}-heap active`,
      description: `Heap is already in ${mode}-mode.`,
      complexity: 'O(1)'
    };
  }

  return {
    next: {
      mode,
      items: buildHeap(state.items, mode)
    },
    title: `Switch to ${mode}-heap`,
    description: `Heap was rebuilt to satisfy ${mode}-heap ordering.`,
    complexity: 'O(n)'
  };
}

export function clearHeap(state: HeapState): HeapActionResult {
  return {
    next: {
      mode: state.mode,
      items: []
    },
    title: 'Reset heap',
    description: `Cleared all values from the ${state.mode}-heap.`,
    complexity: 'O(1)'
  };
}

export function presetHeap(mode: HeapMode = 'max'): HeapActionResult {
  const values = [21, 14, 18, 8, 12, 3, 6, 5, 7];

  return {
    next: {
      mode,
      items: buildHeap(values, mode)
    },
    title: 'Load heap preset',
    description: 'Loaded sample values and built heap ordering.',
    complexity: 'O(n)'
  };
}
