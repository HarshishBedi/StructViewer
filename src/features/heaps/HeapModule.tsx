import { HeapVisualizer } from '../../components/visualization/HeapVisualizer';
import { useAlgoStore } from '../../lib/state/useAlgoStore';

export function HeapModule() {
  const { items, mode } = useAlgoStore(
    (state) => state.heapSession.history[state.heapSession.cursor].state
  );

  return (
    <div className="module-stage">
      <div className="module-metrics">
        <div className="metric-pill">
          <span>Mode</span>
          <strong>{mode.toUpperCase()}</strong>
        </div>
        <div className="metric-pill">
          <span>Root</span>
          <strong>{items.length > 0 ? items[0] : 'Empty'}</strong>
        </div>
        <div className="metric-pill">
          <span>Nodes</span>
          <strong>{items.length}</strong>
        </div>
      </div>
      <HeapVisualizer />
    </div>
  );
}
