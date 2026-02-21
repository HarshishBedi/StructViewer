import { useState } from 'react';
import { useAlgoStore } from '../../lib/state/useAlgoStore';
import { parseIntegerCollectionInput } from '../../lib/utils/parse';
import { randomInt } from '../../lib/utils/random';
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
    const parsed = parseIntegerCollectionInput(value);
    if (parsed.error) {
      setError(parsed.error);
      return;
    }

    parsed.values.forEach((nextValue) => {
      insert(nextValue);
    });
    setValue('');
    setError(null);
  };

  const addRandom = () => {
    const valueToAdd = randomInt(-99, 99);
    setValue(String(valueToAdd));
    insert(valueToAdd);
    setError(null);
  };

  return (
    <div className="control-group">
      <div className="toggle-row">
        <Button
          variant={mode === 'max' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setMode('max')}
          title="Switch to max-heap mode"
        >
          Max Heap
        </Button>
        <Button
          variant={mode === 'min' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setMode('min')}
          title="Switch to min-heap mode"
        >
          Min Heap
        </Button>
      </div>

      <div className="field">
        <label htmlFor="heap-value">Value</label>
        <div className="input-inline">
          <input
            id="heap-value"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="e.g. 42 or 10, 22, 31"
            inputMode="text"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                submitInsert();
              }
            }}
          />
          <Button size="sm" variant="ghost" onClick={addRandom} title="Generate and insert a random value">
            Random Add
          </Button>
        </div>
        {error && (
          <MessageBubble variant="error" compact>
            {error}
          </MessageBubble>
        )}
      </div>

      <div className="action-primary-row">
        <Button
          variant="primary"
          size="sm"
          className="full-width"
          onClick={submitInsert}
          title="Insert value(s) (Enter)"
        >
          Insert
        </Button>
      </div>

      <div className="action-secondary-grid action-secondary-grid-2">
        <Button size="sm" variant="secondary" onClick={extract} title="Extract root element">
          Extract Root
        </Button>
        <Button size="sm" variant="secondary" onClick={reset} title="Reset heap">
          Reset
        </Button>
      </div>

      <Button className="full-width control-preset" size="sm" variant="ghost" onClick={preset} title="Load preset values">
        Load Preset
      </Button>
    </div>
  );
}
