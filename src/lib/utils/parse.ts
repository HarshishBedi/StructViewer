export interface ParseResult {
  value: number | null;
  error: string | null;
}

export interface ParseCollectionResult {
  values: number[];
  error: string | null;
}

export interface ParseWordCollectionResult {
  values: string[];
  error: string | null;
}

export function parseIntegerInput(input: string): ParseResult {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { value: null, error: 'Please enter a number.' };
  }

  const value = Number(trimmed);
  if (!Number.isInteger(value)) {
    return { value: null, error: 'Only integer values are allowed.' };
  }

  if (value < -999 || value > 999) {
    return { value: null, error: 'Use a value between -999 and 999.' };
  }

  return { value, error: null };
}

export function parseIntegerCollectionInput(input: string): ParseCollectionResult {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { values: [], error: 'Please enter a number or an array.' };
  }

  const hasOpening = trimmed.startsWith('[');
  const hasClosing = trimmed.endsWith(']');
  if (hasOpening !== hasClosing) {
    return { values: [], error: 'Array input must use matching brackets: [1, 2, 3].' };
  }

  const normalized = hasOpening ? trimmed.slice(1, -1).trim() : trimmed;
  if (normalized.length === 0) {
    return { values: [], error: 'Array input cannot be empty.' };
  }

  const chunks = normalized.includes(',')
    ? normalized.split(',').map((chunk) => chunk.trim())
    : normalized.split(/\s+/).map((chunk) => chunk.trim());

  if (chunks.some((chunk) => chunk.length === 0)) {
    return { values: [], error: 'Use comma-separated integers like [4, 9, 16].' };
  }

  const values: number[] = [];
  for (let index = 0; index < chunks.length; index += 1) {
    const parsed = parseIntegerInput(chunks[index]);
    if (parsed.error || parsed.value === null) {
      const label = chunks.length > 1 ? `Item ${index + 1}: ` : '';
      return { values: [], error: `${label}${parsed.error}` };
    }
    values.push(parsed.value);
  }

  return { values, error: null };
}

export function parseWordCollectionInput(input: string): ParseWordCollectionResult {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { values: [], error: 'Please enter a word or a list of words.' };
  }

  const hasOpening = trimmed.startsWith('[');
  const hasClosing = trimmed.endsWith(']');
  if (hasOpening !== hasClosing) {
    return { values: [], error: 'List input must use matching brackets: [tree, trie, graph].' };
  }

  const normalized = hasOpening ? trimmed.slice(1, -1).trim() : trimmed;
  if (normalized.length === 0) {
    return { values: [], error: 'Word list cannot be empty.' };
  }

  const chunks = normalized.includes(',')
    ? normalized.split(',').map((chunk) => chunk.trim())
    : normalized.split(/\s+/).map((chunk) => chunk.trim());

  if (chunks.some((chunk) => chunk.length === 0)) {
    return { values: [], error: 'Use comma-separated words like [tree, trie, graph].' };
  }

  const values: string[] = [];
  for (let index = 0; index < chunks.length; index += 1) {
    const word = chunks[index].toLowerCase();
    if (!/^[a-z]+$/.test(word)) {
      const label = chunks.length > 1 ? `Item ${index + 1}: ` : '';
      return { values: [], error: `${label}Use letters a-z only.` };
    }
    values.push(word);
  }

  return { values, error: null };
}
