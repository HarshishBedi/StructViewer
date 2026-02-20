export interface StackState {
  items: number[];
}

export interface StackActionResult {
  next: StackState;
  title: string;
  description: string;
  complexity: string;
  isError?: boolean;
}

export function pushStack(state: StackState, value: number): StackActionResult {
  return {
    next: { items: [...state.items, value] },
    title: `Push ${value}`,
    description: `${value} was pushed on top of the stack.`,
    complexity: 'O(1)'
  };
}

export function popStack(state: StackState): StackActionResult {
  if (state.items.length === 0) {
    return {
      next: state,
      title: 'Pop failed',
      description: 'Cannot pop because the stack is empty.',
      complexity: 'O(1)',
      isError: true
    };
  }

  const removed = state.items[state.items.length - 1];
  return {
    next: { items: state.items.slice(0, -1) },
    title: `Pop ${removed}`,
    description: `${removed} was removed from the top of the stack.`,
    complexity: 'O(1)'
  };
}

export function peekStack(state: StackState): StackActionResult {
  if (state.items.length === 0) {
    return {
      next: state,
      title: 'Peek failed',
      description: 'Stack is empty, there is no top element to inspect.',
      complexity: 'O(1)',
      isError: true
    };
  }

  const top = state.items[state.items.length - 1];
  return {
    next: state,
    title: `Peek ${top}`,
    description: `Top element is ${top}. Stack remains unchanged.`,
    complexity: 'O(1)'
  };
}

export function clearStack(): StackActionResult {
  return {
    next: { items: [] },
    title: 'Clear stack',
    description: 'All values were removed from the stack.',
    complexity: 'O(n)'
  };
}
