import { TreeVisualizer } from '../../components/visualization/TreeVisualizer';
import { analyzeTree, type TraversalType, type TreeNode } from '../../lib/algorithms/bst';
import { useAlgoStore } from '../../lib/state/useAlgoStore';
import { ModuleComplexity } from '../../components/layout/ModuleComplexity';

function countNodes(root: TreeNode | null): number {
  if (root === null) {
    return 0;
  }

  return 1 + countNodes(root.left) + countNodes(root.right);
}

const TRAVERSAL_CYCLE: TraversalType[] = ['inorder', 'preorder', 'postorder', 'level'];

function nextTraversal(type: TraversalType | null): TraversalType {
  if (type === null) {
    return TRAVERSAL_CYCLE[0];
  }

  const index = TRAVERSAL_CYCLE.indexOf(type);
  if (index === -1) {
    return TRAVERSAL_CYCLE[0];
  }

  return TRAVERSAL_CYCLE[(index + 1) % TRAVERSAL_CYCLE.length];
}

export function TreeModule() {
  const state = useAlgoStore((store) => store.treeSession.history[store.treeSession.cursor].state);
  const traverse = useAlgoStore((store) => store.treeTraverse);
  const setAutoBalance = useAlgoStore((store) => store.treeSetAutoBalance);
  const rebalance = useAlgoStore((store) => store.treeRebalance);
  const balance = analyzeTree(state.root);
  const canRebalance = state.root !== null && !balance.balanced;
  const nextTraversalType = nextTraversal(state.traversalType);

  return (
    <div className="module-stage">
      <div className="module-head">
        <ModuleComplexity
          chips={[
            { label: 'Insert', complexity: 'O(log n) avg' },
            { label: 'Delete', complexity: 'O(log n) avg' },
            { label: 'Search', complexity: 'O(log n) avg' }
          ]}
          note="Traversal runs in O(n)."
          label="Tree operation complexity"
        />
        <div className="module-metrics">
          <div className="metric-pill">
            <span>Nodes</span>
            <strong>{countNodes(state.root)}</strong>
          </div>
          <div className="metric-pill">
            <span>Selected</span>
            <strong>{state.highlighted ?? 'None'}</strong>
          </div>
          <button
            type="button"
            className="metric-pill metric-pill-toggle"
            onClick={() => traverse(nextTraversalType)}
            title={`Cycle traversal: ${nextTraversalType}`}
          >
            <span>Traversal</span>
            <strong>{state.traversalType ?? 'None'}</strong>
          </button>
          <button
            type="button"
            className="metric-pill metric-pill-toggle"
            onClick={rebalance}
            disabled={!canRebalance}
            title={canRebalance ? 'Rebalance tree now' : 'Tree is already balanced'}
          >
            <span>Balance</span>
            <strong>{balance.balanced ? 'Balanced' : 'Unbalanced'}</strong>
          </button>
          <button
            type="button"
            className="metric-pill metric-pill-toggle"
            onClick={() => setAutoBalance(!state.autoBalance)}
            title={state.autoBalance ? 'Disable auto-balance' : 'Enable auto-balance'}
          >
            <span>Auto-Balance</span>
            <strong>{state.autoBalance ? 'On' : 'Off'}</strong>
          </button>
        </div>
      </div>
      <TreeVisualizer />
    </div>
  );
}
