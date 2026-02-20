import { TreeVisualizer } from '../../components/visualization/TreeVisualizer';
import { type TreeNode } from '../../lib/algorithms/bst';
import { useAlgoStore } from '../../lib/state/useAlgoStore';

function countNodes(root: TreeNode | null): number {
  if (root === null) {
    return 0;
  }

  return 1 + countNodes(root.left) + countNodes(root.right);
}

export function TreeModule() {
  const state = useAlgoStore((store) => store.treeSession.history[store.treeSession.cursor].state);

  return (
    <div className="module-stage">
      <div className="module-metrics">
        <div className="metric-pill">
          <span>Nodes</span>
          <strong>{countNodes(state.root)}</strong>
        </div>
        <div className="metric-pill">
          <span>Selected</span>
          <strong>{state.highlighted ?? 'None'}</strong>
        </div>
        <div className="metric-pill">
          <span>Traversal</span>
          <strong>{state.traversalType ?? 'None'}</strong>
        </div>
      </div>
      <TreeVisualizer />
    </div>
  );
}
