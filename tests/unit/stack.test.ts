import { describe, expect, it } from 'vitest';
import { popStack, pushStack } from '../../src/lib/algorithms/stack';

describe('stack algorithms', () => {
  it('pushes values to the top in order', () => {
    const start = { items: [1, 2] };
    const result = pushStack(start, 5);

    expect(result.next.items).toEqual([1, 2, 5]);
    expect(result.complexity).toBe('O(1)');
  });

  it('pops the top value', () => {
    const start = { items: [3, 8, 13] };
    const result = popStack(start);

    expect(result.next.items).toEqual([3, 8]);
    expect(result.isError).toBeUndefined();
  });

  it('returns error metadata when popping empty stack', () => {
    const result = popStack({ items: [] });

    expect(result.isError).toBe(true);
    expect(result.next.items).toEqual([]);
  });
});
