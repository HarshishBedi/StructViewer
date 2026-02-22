import { TrieVisualizer } from '../../components/visualization/TrieVisualizer';
import { useAlgoStore } from '../../lib/state/useAlgoStore';
import { ModuleComplexity } from '../../components/layout/ModuleComplexity';

export function TrieModule() {
  const state = useAlgoStore((store) => store.trieSession.history[store.trieSession.cursor].state);

  return (
    <div className="module-stage">
      <div className="module-head">
        <ModuleComplexity
          chips={[
            { label: 'Insert', complexity: 'O(k)' },
            { label: 'Search', complexity: 'O(k)' },
            { label: 'Prefix', complexity: 'O(k + m)' }
          ]}
          label="Trie operation complexity"
        />
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
      </div>
      <TrieVisualizer />
    </div>
  );
}
