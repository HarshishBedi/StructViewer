import { useState } from 'react';
import { useAlgoStore } from '../../lib/state/useAlgoStore';
import { parseIntegerInput } from '../../lib/utils/parse';
import { Button } from '../ui/Button';
import { MessageBubble } from '../ui/MessageBubble';

function parseNonNegativeInteger(raw: string): { value: number | null; error: string | null } {
  const parsed = parseIntegerInput(raw);
  if (parsed.error || parsed.value === null) {
    return { value: null, error: parsed.error };
  }
  if (parsed.value < 0) {
    return { value: null, error: 'Use a non-negative integer.' };
  }
  return { value: parsed.value, error: null };
}

export function UnionFindControls() {
  const resize = useAlgoStore((state) => state.unionFindResize);
  const union = useAlgoStore((state) => state.unionFindUnion);
  const find = useAlgoStore((state) => state.unionFindFind);
  const connected = useAlgoStore((state) => state.unionFindConnected);
  const reset = useAlgoStore((state) => state.unionFindReset);
  const preset = useAlgoStore((state) => state.unionFindLoadPreset);
  const size = useAlgoStore((state) => state.unionFindSession.history[state.unionFindSession.cursor].state.size);

  const [sizeValue, setSizeValue] = useState(String(size));
  const [leftValue, setLeftValue] = useState('0');
  const [rightValue, setRightValue] = useState('1');
  const [singleValue, setSingleValue] = useState('0');
  const [error, setError] = useState<string | null>(null);

  const submitResize = () => {
    const parsed = parseNonNegativeInteger(sizeValue);
    if (parsed.error || parsed.value === null) {
      setError(parsed.error);
      return;
    }
    resize(parsed.value);
    setError(null);
  };

  const parsePair = (): { left: number; right: number } | null => {
    const left = parseNonNegativeInteger(leftValue);
    const right = parseNonNegativeInteger(rightValue);
    if (left.error || left.value === null) {
      setError(left.error);
      return null;
    }
    if (right.error || right.value === null) {
      setError(right.error);
      return null;
    }
    return { left: left.value, right: right.value };
  };

  const parseSingle = (): number | null => {
    const parsed = parseNonNegativeInteger(singleValue);
    if (parsed.error || parsed.value === null) {
      setError(parsed.error);
      return null;
    }
    return parsed.value;
  };

  return (
    <div className="control-group">
      <div className="field">
        <label htmlFor="uf-size">Node Count</label>
        <div className="input-inline">
          <input
            id="uf-size"
            value={sizeValue}
            onChange={(event) => setSizeValue(event.target.value)}
            placeholder="e.g. 10"
            inputMode="numeric"
          />
          <Button size="sm" variant="ghost" onClick={submitResize} title="Resize node count">
            Resize
          </Button>
        </div>
      </div>

      <div className="field">
        <label>Pair (a, b)</label>
        <div className="union-pair-inputs">
          <input
            value={leftValue}
            onChange={(event) => setLeftValue(event.target.value)}
            placeholder="a"
            inputMode="numeric"
          />
          <input
            value={rightValue}
            onChange={(event) => setRightValue(event.target.value)}
            placeholder="b"
            inputMode="numeric"
          />
        </div>
      </div>

      <div className="action-secondary-grid action-secondary-grid-2">
        <Button
          size="sm"
          variant="primary"
          onClick={() => {
            const pair = parsePair();
            if (!pair) {
              return;
            }
            union(pair.left, pair.right);
            setError(null);
          }}
          title="Union two nodes"
        >
          Union
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            const pair = parsePair();
            if (!pair) {
              return;
            }
            connected(pair.left, pair.right);
            setError(null);
          }}
          title="Check if two nodes are connected"
        >
          Connected?
        </Button>
      </div>

      <div className="field">
        <label htmlFor="uf-find">Find Root</label>
        <div className="input-inline">
          <input
            id="uf-find"
            value={singleValue}
            onChange={(event) => setSingleValue(event.target.value)}
            placeholder="node index"
            inputMode="numeric"
          />
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              const index = parseSingle();
              if (index === null) {
                return;
              }
              find(index);
              setError(null);
            }}
            title="Find root of node"
          >
            Find
          </Button>
        </div>
        {error && (
          <MessageBubble variant="error" compact>
            {error}
          </MessageBubble>
        )}
      </div>

      <div className="action-secondary-grid action-secondary-grid-2">
        <Button size="sm" variant="secondary" onClick={reset} title="Reset disjoint sets">
          Reset
        </Button>
        <Button size="sm" variant="ghost" onClick={preset} title="Load sample unions">
          Load Preset
        </Button>
      </div>
    </div>
  );
}
