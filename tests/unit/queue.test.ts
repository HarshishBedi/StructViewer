import { describe, expect, it } from 'vitest';
import {
  clearQueue,
  dequeueQueue,
  enqueueQueue,
  frontQueue,
  type QueueState
} from '../../src/lib/algorithms/queue';

describe('queue algorithms', () => {
  it('enqueues values to the back', () => {
    const start: QueueState = { items: [3, 8], highlighted: null };
    const result = enqueueQueue(start, 13);
    expect(result.next.items).toEqual([3, 8, 13]);
    expect(result.complexity).toBe('O(1)');
  });

  it('dequeues values from the front', () => {
    const start: QueueState = { items: [5, 9, 12], highlighted: null };
    const result = dequeueQueue(start);
    expect(result.next.items).toEqual([9, 12]);
    expect(result.isError).toBeUndefined();
  });

  it('returns error when queue is empty', () => {
    const start: QueueState = { items: [], highlighted: null };
    const result = frontQueue(start);
    expect(result.isError).toBe(true);
  });

  it('clears all values', () => {
    const result = clearQueue();
    expect(result.next.items).toEqual([]);
  });
});
