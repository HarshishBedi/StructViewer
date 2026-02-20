import { useState } from 'react';
import { useAlgoStore } from '../../lib/state/useAlgoStore';
import { parseIntegerInput } from '../../lib/utils/parse';
import { Button } from '../ui/Button';
import { MessageBubble } from '../ui/MessageBubble';

export function HeapControls() {
  const insert = useAlgoStore((state) => state.heapInsert);
  const extract = useAlgoStore((state) => state.heapExtractRoot);
  const setMode = useAlgoStore((state) => state.heapSetMode);
  const mode = useAlgoStore(
    (state) => state.heapSession.history[state.heapSession.cursor].state.mode
  );
  const reset = useAlgoStore((state) => state.heapReset);
  const preset = useAlgoStore((state) => state.heapLoadPreset);

  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submitInsert = () => {
    const parsed = parseIntegerInput(value);
    if (parsed.error || parsed.value === null) {
      setError(parsed.error);
      return;
    }

    insert(parsed.value);
    setValue('');
    setError(null);
  };

  return (
    <div className="control-group">
      <div className="toggle-row">
        <Button
          variant={mode === 'max' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setMode('max')}
        >
          Max Heap
        </Button>
        <Button
          variant={mode === 'min' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setMode('min')}
        >
          Min Heap
        </Button>
      </div>

      <div className="field">
        <label htmlFor="heap-value">Value</label>
        <input
          id="heap-value"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="e.g. 42"
          inputMode="numeric"
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              submitInsert();
            }
          }}
        />
        {error && (
          <MessageBubble variant="error" compact>
            {error}
          </MessageBubble>
        )}
      </div>

      <div className="button-grid">
        <Button variant="primary" onClick={submitInsert}>
          Insert
        </Button>
        <Button onClick={extract}>Extract Root</Button>
        <Button onClick={reset}>Reset</Button>
        <Button onClick={preset}>Load Preset</Button>
      </div>
    </div>
  );
}
