import { TrieVisualizer } from '../../components/visualization/TrieVisualizer';
import { useAlgoStore } from '../../lib/state/useAlgoStore';

export function TrieModule() {
  const state = useAlgoStore((store) => store.trieSession.history[store.trieSession.cursor].state);

  return (
    <div className="module-stage">
      <div className="module-metrics">
        <div className="metric-pill">
          <span>Words</span>
          <strong>{state.words.length}</strong>
        </div>
        <div className="metric-pill">
          <span>Query</span>
          <strong>{state.query ?? 'None'}</strong>
        </div>
        <div className="metric-pill">
          <span>Matches</span>
          <strong>{state.prefixMatches.length}</strong>
        </div>
      </div>
      <TrieVisualizer />
    </div>
  );
}
