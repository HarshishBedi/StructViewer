import { analyzeComponents } from '../../lib/algorithms/unionFind';
import { useAlgoStore } from '../../lib/state/useAlgoStore';
import { UnionFindVisualizer } from '../../components/visualization/UnionFindVisualizer';

export function UnionFindModule() {
  const state = useAlgoStore(
    (store) => store.unionFindSession.history[store.unionFindSession.cursor].state
  );
  const components = analyzeComponents(state);

  return (
    <div className="module-stage">
      <div className="module-metrics">
        <div className="metric-pill">
          <span>Nodes</span>
          <strong>{state.size}</strong>
        </div>
        <div className="metric-pill">
          <span>Components</span>
          <strong>{components}</strong>
        </div>
        <div className="metric-pill">
          <span>Root</span>
          <strong>{state.lastRoot ?? 'None'}</strong>
        </div>
        <div className="metric-pill">
          <span>Connected</span>
          <strong>
            {state.connectedResult === null
              ? 'N/A'
              : state.connectedResult
                ? 'True'
                : 'False'}
          </strong>
        </div>
      </div>
      <UnionFindVisualizer />
    </div>
  );
}
