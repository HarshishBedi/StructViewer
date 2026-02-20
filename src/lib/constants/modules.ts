export type ModuleId = 'stack' | 'heap' | 'tree';

export interface ModuleConfig {
  id: ModuleId;
  title: string;
  description: string;
  complexityHint: string;
}

export const MODULES: ModuleConfig[] = [
  {
    id: 'stack',
    title: 'Stacks',
    description: 'LIFO operations with push, pop, and peek.',
    complexityHint: 'Push/Pop/Peek: O(1)'
  },
  {
    id: 'heap',
    title: 'Heaps',
    description: 'Binary heap with insert and extract root.',
    complexityHint: 'Insert/Extract: O(log n), Peek: O(1)'
  },
  {
    id: 'tree',
    title: 'Trees',
    description: 'Binary Search Tree operations and traversals.',
    complexityHint: 'Average insert/search/delete: O(log n)'
  }
];

export const MODULE_SHORTCUTS: Record<ModuleId, string> = {
  stack: '1',
  heap: '2',
  tree: '3'
};
