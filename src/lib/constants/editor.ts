export type EditorLanguage = 'python' | 'javascript' | 'java' | 'c' | 'cpp';

export const EDITOR_LANGUAGE_OPTIONS: Array<{ id: EditorLanguage; label: string }> = [
  { id: 'python', label: 'Python' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'java', label: 'Java' },
  { id: 'c', label: 'C' },
  { id: 'cpp', label: 'C++' }
];
