import { analyzeComponents } from '../../lib/algorithms/unionFind';
import { useAlgoStore } from '../../lib/state/useAlgoStore';
import { UnionFindVisualizer } from '../../components/visualization/UnionFindVisualizer';
import { ModuleComplexity } from '../../components/layout/ModuleComplexity';

export function UnionFindModule() {
  const state = useAlgoStore(
    (store) => store.unionFindSession.history[store.unionFindSession.cursor].state
  );
  const components = analyzeComponents(state);
  const connectedLabel =
    state.connectedResult === null ? 'Not checked' : state.connectedResult ? 'Connected' : 'Not connected';

  return (
    <div className="module-stage">
      <div className="module-head">
        <ModuleComplexity
          chips={[
            { label: 'Union', complexity: 'O(alpha(n))' },
            { label: 'Find', complexity: 'O(alpha(n))' },
            { label: 'Connected', complexity: 'O(alpha(n))' }
          ]}
          note="Amortized with path compression and union by rank."
          label="Union-find operation complexity"
        />
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
            <span>Last Root</span>
            <strong>{state.lastRoot ?? 'None'}</strong>
          </div>
          <div className="metric-pill">
            <span>Last Check</span>
            <strong>{connectedLabel}</strong>
          </div>
        </div>
      </div>
      <UnionFindVisualizer />
    </div>
  );
}
