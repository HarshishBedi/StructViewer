import { describe, expect, it } from 'vitest';
import {
  deleteTrieWord,
  insertTrieWord,
  prefixTrieWords,
  searchTrieWord,
  type TrieState
} from '../../src/lib/algorithms/trie';

const EMPTY_TRIE: TrieState = {
  words: [],
  query: null,
  highlightedWord: null,
  prefixMatches: []
};

describe('trie algorithms', () => {
  it('inserts and searches words', () => {
    let state = EMPTY_TRIE;
    state = insertTrieWord(state, 'tree').next;
    state = insertTrieWord(state, 'trie').next;

    const found = searchTrieWord(state, 'tree');
    expect(found.isError).toBe(false);
    expect(found.next.highlightedWord).toBe('tree');
  });

  it('resolves prefix matches', () => {
    let state = EMPTY_TRIE;
    state = insertTrieWord(state, 'algo').next;
    state = insertTrieWord(state, 'all').next;
    state = insertTrieWord(state, 'also').next;

    const result = prefixTrieWords(state, 'al');
    expect(result.next.prefixMatches).toEqual(['algo', 'all', 'also']);
  });

  it('deletes existing words', () => {
    let state = EMPTY_TRIE;
    state = insertTrieWord(state, 'heap').next;
    state = deleteTrieWord(state, 'heap').next;
    expect(state.words).toEqual([]);
  });
});
