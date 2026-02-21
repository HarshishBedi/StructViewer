import { describe, expect, it } from 'vitest';
import { parseIntegerCollectionInput, parseWordCollectionInput } from '../../src/lib/utils/parse';

describe('parseIntegerCollectionInput', () => {
  it('parses a single integer', () => {
    const result = parseIntegerCollectionInput('24');
    expect(result.error).toBeNull();
    expect(result.values).toEqual([24]);
  });

  it('parses bracket arrays', () => {
    const result = parseIntegerCollectionInput('[4, 9, 16]');
    expect(result.error).toBeNull();
    expect(result.values).toEqual([4, 9, 16]);
  });

  it('parses comma-separated values without brackets', () => {
    const result = parseIntegerCollectionInput('10, 22, 31');
    expect(result.error).toBeNull();
    expect(result.values).toEqual([10, 22, 31]);
  });

  it('parses whitespace-separated values', () => {
    const result = parseIntegerCollectionInput('5 8 13');
    expect(result.error).toBeNull();
    expect(result.values).toEqual([5, 8, 13]);
  });

  it('returns useful error for invalid list items', () => {
    const result = parseIntegerCollectionInput('[7, abc, 9]');
    expect(result.values).toEqual([]);
    expect(result.error).toContain('Item 2');
  });
});

describe('parseWordCollectionInput', () => {
  it('parses words and normalizes case', () => {
    const result = parseWordCollectionInput('[Tree, Trie, Track]');
    expect(result.error).toBeNull();
    expect(result.values).toEqual(['tree', 'trie', 'track']);
  });

  it('returns a useful error for invalid word tokens', () => {
    const result = parseWordCollectionInput('[tree, 42]');
    expect(result.values).toEqual([]);
    expect(result.error).toContain('Item 2');
  });
});
