export interface ShortcutDefinition {
  key: string;
  description: string;
}

export const SHORTCUTS: ShortcutDefinition[] = [
  { key: '1 / 2 / 3 / 4 / 5 / 6', description: 'Switch between modules (Stack, Queue, Heap, Tree, Trie, Union-Find)' },
  { key: 'I', description: 'Toggle inspector panel' },
  { key: 'A', description: 'Toggle autoplay timeline playback' },
  { key: 'N', description: 'Move timeline to the next step' },
  { key: 'P', description: 'Move timeline to the previous step' },
  { key: 'R', description: 'Reset current data structure' },
  { key: 'Ctrl/Cmd + K', description: 'Open command palette' },
  { key: '?', description: 'Open keyboard shortcut help' },
  { key: 'Esc', description: 'Close active modal or clear focus' }
];
