export interface ParseResult {
  value: number | null;
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

export function parseIntegerList(input: string): ParseResult[] {
  return input
    .split(',')
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0)
    .map(parseIntegerInput);
}
