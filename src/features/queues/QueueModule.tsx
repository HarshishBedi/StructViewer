import { QueueVisualizer } from '../../components/visualization/QueueVisualizer';
import { useAlgoStore } from '../../lib/state/useAlgoStore';
import { ModuleComplexity } from '../../components/layout/ModuleComplexity';

export function QueueModule() {
  const state = useAlgoStore((store) => store.queueSession.history[store.queueSession.cursor].state);
  const front = state.items.length > 0 ? state.items[0] : null;
  const back = state.items.length > 0 ? state.items[state.items.length - 1] : null;

  return (
    <div className="module-stage">
      <div className="module-head">
        <ModuleComplexity
          chips={[
            { label: 'Enqueue', complexity: 'O(1)' },
            { label: 'Dequeue', complexity: 'O(1)' },
            { label: 'Front', complexity: 'O(1)' }
          ]}
          label="Queue operation complexity"
        />
        <div className="module-metrics">
          <div className="metric-pill">
            <span>Size</span>
            <strong>{state.items.length}</strong>
          </div>
          <div className="metric-pill">
            <span>Front</span>
            <strong>{front ?? 'Empty'}</strong>
          </div>
          <div className="metric-pill">
            <span>Back</span>
            <strong>{back ?? 'Empty'}</strong>
          </div>
        </div>
      </div>
      <QueueVisualizer />
    </div>
  );
}
