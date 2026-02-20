import { describe, expect, it } from 'vitest';
import { buildHeap, extractRoot, insertHeap, type HeapState } from '../../src/lib/algorithms/heap';

function isValidHeap(values: number[], mode: 'min' | 'max'): boolean {
  for (let index = 0; index < values.length; index += 1) {
    const left = index * 2 + 1;
    const right = left + 1;

    if (left < values.length) {
      if (mode === 'max' ? values[index] < values[left] : values[index] > values[left]) {
        return false;
      }
    }

    if (right < values.length) {
      if (mode === 'max' ? values[index] < values[right] : values[index] > values[right]) {
        return false;
      }
    }
  }

  return true;
}

describe('heap algorithms', () => {
  it('builds a valid max heap from unordered values', () => {
    const values = buildHeap([4, 1, 8, 2, 6, 3], 'max');
    expect(isValidHeap(values, 'max')).toBe(true);
  });

  it('inserts while preserving heap property', () => {
    const state: HeapState = { items: [21, 14, 18, 8, 12, 3], mode: 'max' };
    const result = insertHeap(state, 30);

    expect(isValidHeap(result.next.items, 'max')).toBe(true);
    expect(result.next.items[0]).toBe(30);
  });

  it('extracts root while preserving heap property', () => {
    const state: HeapState = { items: [30, 14, 21, 8, 12, 3], mode: 'max' };
    const result = extractRoot(state);

    expect(isValidHeap(result.next.items, 'max')).toBe(true);
    expect(result.next.items).toHaveLength(5);
  });
});
