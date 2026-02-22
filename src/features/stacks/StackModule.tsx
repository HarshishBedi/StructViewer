import { useAlgoStore } from '../../lib/state/useAlgoStore';
import { StackVisualizer } from '../../components/visualization/StackVisualizer';
import { ModuleComplexity } from '../../components/layout/ModuleComplexity';

export function StackModule() {
  const items = useAlgoStore((state) => state.stackSession.history[state.stackSession.cursor].state.items);

  return (
    <div className="module-stage">
      <div className="module-head">
        <ModuleComplexity
          chips={[
            { label: 'Push', complexity: 'O(1)' },
            { label: 'Pop', complexity: 'O(1)' },
            { label: 'Peek', complexity: 'O(1)' }
          ]}
          label="Stack operation complexity"
        />
        <div className="module-metrics">
          <div className="metric-pill">
            <span>Size</span>
            <strong>{items.length}</strong>
          </div>
          <div className="metric-pill">
            <span>Top</span>
            <strong>{items.length > 0 ? items[items.length - 1] : 'Empty'}</strong>
          </div>
        </div>
      </div>
      <StackVisualizer />
    </div>
  );
}
