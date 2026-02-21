export interface TrieState {
  words: string[];
  query: string | null;
  highlightedWord: string | null;
  prefixMatches: string[];
}

export interface TrieActionResult {
  next: TrieState;
  title: string;
  description: string;
  complexity: string;
  isError?: boolean;
}

function normalizeWord(value: string): string {
  return value.trim().toLowerCase();
}

function isValidWord(value: string): boolean {
  return /^[a-z]+$/.test(value);
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

export function insertTrieWord(state: TrieState, rawWord: string): TrieActionResult {
  const word = normalizeWord(rawWord);
  if (!isValidWord(word)) {
    return {
      next: { ...state, query: word || null, highlightedWord: null, prefixMatches: [] },
      title: 'Insert failed',
      description: 'Trie words must contain letters a-z only.',
      complexity: 'O(k)',
      isError: true
    };
  }

  if (state.words.includes(word)) {
    return {
      next: { ...state, query: word, highlightedWord: word, prefixMatches: [] },
      title: `Insert ${word} skipped`,
      description: `${word} already exists in the trie.`,
      complexity: 'O(k)',
      isError: true
    };
  }

  const words = uniqueSorted([...state.words, word]);
  return {
    next: { words, query: word, highlightedWord: word, prefixMatches: [word] },
    title: `Insert ${word}`,
    description: `${word} was inserted into the trie.`,
    complexity: 'O(k)'
  };
}

export function deleteTrieWord(state: TrieState, rawWord: string): TrieActionResult {
  const word = normalizeWord(rawWord);
  if (!isValidWord(word)) {
    return {
      next: { ...state, query: word || null, highlightedWord: null, prefixMatches: [] },
      title: 'Delete failed',
      description: 'Trie words must contain letters a-z only.',
      complexity: 'O(k)',
      isError: true
    };
  }

  if (!state.words.includes(word)) {
    return {
      next: { ...state, query: word, highlightedWord: null, prefixMatches: [] },
      title: `Delete ${word} failed`,
      description: `${word} does not exist in the trie.`,
      complexity: 'O(k)',
      isError: true
    };
  }

  const words = state.words.filter((existing) => existing !== word);
  return {
    next: { words, query: word, highlightedWord: null, prefixMatches: [] },
    title: `Delete ${word}`,
    description: `${word} was removed from the trie.`,
    complexity: 'O(k)'
  };
}

export function searchTrieWord(state: TrieState, rawWord: string): TrieActionResult {
  const word = normalizeWord(rawWord);
  if (!isValidWord(word)) {
    return {
      next: { ...state, query: word || null, highlightedWord: null, prefixMatches: [] },
      title: 'Search failed',
      description: 'Trie words must contain letters a-z only.',
      complexity: 'O(k)',
      isError: true
    };
  }

  const found = state.words.includes(word);
  return {
    next: {
      ...state,
      query: word,
      highlightedWord: found ? word : null,
      prefixMatches: found ? [word] : []
    },
    title: `Search ${word}`,
    description: found ? `${word} exists in the trie.` : `${word} was not found in the trie.`,
    complexity: 'O(k)',
    isError: !found
  };
}

export function prefixTrieWords(state: TrieState, rawPrefix: string): TrieActionResult {
  const prefix = normalizeWord(rawPrefix);
  if (!isValidWord(prefix)) {
    return {
      next: { ...state, query: prefix || null, highlightedWord: null, prefixMatches: [] },
      title: 'Prefix lookup failed',
      description: 'Prefix must contain letters a-z only.',
      complexity: 'O(k + m)',
      isError: true
    };
  }

  const matches = state.words.filter((word) => word.startsWith(prefix));
  return {
    next: {
      ...state,
      query: prefix,
      highlightedWord: null,
      prefixMatches: matches
    },
    title: `Prefix ${prefix}`,
    description:
      matches.length > 0
        ? `Found ${matches.length} match${matches.length === 1 ? '' : 'es'}: ${matches.join(', ')}.`
        : `No words found with prefix ${prefix}.`,
    complexity: 'O(k + m)',
    isError: matches.length === 0
  };
}

export function clearTrie(): TrieActionResult {
  return {
    next: { words: [], query: null, highlightedWord: null, prefixMatches: [] },
    title: 'Clear trie',
    description: 'Removed all words from the trie.',
    complexity: 'O(n)'
  };
}

export function presetTrie(): TrieActionResult {
  const words = uniqueSorted([
    'algo',
    'all',
    'also',
    'heap',
    'hero',
    'tree',
    'trie',
    'union'
  ]);

  return {
    next: { words, query: null, highlightedWord: null, prefixMatches: [] },
    title: 'Load trie preset',
    description: `Loaded ${words.length} sample words into the trie.`,
    complexity: 'O(nk)'
  };
}
