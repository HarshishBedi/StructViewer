export interface QueueState {
  items: number[];
  highlighted: number | null;
}

export interface QueueActionResult {
  next: QueueState;
  title: string;
  description: string;
  complexity: string;
  isError?: boolean;
}

export function enqueueQueue(state: QueueState, value: number): QueueActionResult {
  return {
    next: { items: [...state.items, value], highlighted: value },
    title: `Enqueue ${value}`,
    description: `${value} was added to the back of the queue.`,
    complexity: 'O(1)'
  };
}

export function dequeueQueue(state: QueueState): QueueActionResult {
  if (state.items.length === 0) {
    return {
      next: state,
      title: 'Dequeue failed',
      description: 'Cannot dequeue because the queue is empty.',
      complexity: 'O(1)',
      isError: true
    };
  }

  const removed = state.items[0];
  const nextItems = state.items.slice(1);
  return {
    next: { items: nextItems, highlighted: nextItems.length > 0 ? nextItems[0] : null },
    title: `Dequeue ${removed}`,
    description: `${removed} was removed from the front of the queue.`,
    complexity: 'O(1)'
  };
}

export function frontQueue(state: QueueState): QueueActionResult {
  if (state.items.length === 0) {
    return {
      next: state,
      title: 'Front lookup failed',
      description: 'Queue is empty, there is no front element to inspect.',
      complexity: 'O(1)',
      isError: true
    };
  }

  const front = state.items[0];
  return {
    next: { ...state, highlighted: front },
    title: `Front ${front}`,
    description: `Front element is ${front}. Queue remains unchanged.`,
    complexity: 'O(1)'
  };
}

export function clearQueue(): QueueActionResult {
  return {
    next: { items: [], highlighted: null },
    title: 'Clear queue',
    description: 'All values were removed from the queue.',
    complexity: 'O(n)'
  };
}

export function presetQueue(): QueueActionResult {
  return {
    next: { items: [6, 11, 24, 33], highlighted: 6 },
    title: 'Load queue preset',
    description: 'Loaded sample queue values [6, 11, 24, 33].',
    complexity: 'O(n)'
  };
}
