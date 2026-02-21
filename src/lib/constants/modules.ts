export type ModuleId = 'stack' | 'queue' | 'heap' | 'tree' | 'trie' | 'unionfind';

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
    id: 'queue',
    title: 'Queues',
    description: 'FIFO operations with enqueue and dequeue.',
    complexityHint: 'Enqueue/Dequeue/Front: O(1)'
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
  },
  {
    id: 'trie',
    title: 'Tries',
    description: 'Prefix tree for fast word insert/search/prefix.',
    complexityHint: 'Insert/Search/Prefix: O(k)'
  },
  {
    id: 'unionfind',
    title: 'Union-Find',
    description: 'Disjoint set union with path compression.',
    complexityHint: 'Union/Find/Connected: O(alpha(n)) amortized'
  }
];

export const MODULE_SHORTCUTS: Record<ModuleId, string> = {
  stack: '1',
  queue: '2',
  heap: '3',
  tree: '4',
  trie: '5',
  unionfind: '6'
};
