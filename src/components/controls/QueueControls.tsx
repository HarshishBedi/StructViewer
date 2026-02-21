import { useState } from 'react';
import { useAlgoStore } from '../../lib/state/useAlgoStore';
import { parseIntegerCollectionInput } from '../../lib/utils/parse';
import { randomInt } from '../../lib/utils/random';
import { Button } from '../ui/Button';
import { MessageBubble } from '../ui/MessageBubble';

export function QueueControls() {
  const enqueue = useAlgoStore((state) => state.queueEnqueue);
  const dequeue = useAlgoStore((state) => state.queueDequeue);
  const front = useAlgoStore((state) => state.queueFront);
  const clear = useAlgoStore((state) => state.queueClear);
  const preset = useAlgoStore((state) => state.queueLoadPreset);
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submitEnqueue = () => {
    const parsed = parseIntegerCollectionInput(value);
    if (parsed.error) {
      setError(parsed.error);
      return;
    }

    parsed.values.forEach((nextValue) => enqueue(nextValue));
    setValue('');
    setError(null);
  };

  const addRandom = () => {
    const valueToAdd = randomInt(-99, 99);
    setValue(String(valueToAdd));
    enqueue(valueToAdd);
    setError(null);
  };

  return (
    <div className="control-group">
      <div className="field">
        <label htmlFor="queue-value">Value</label>
        <div className="input-inline">
          <input
            id="queue-value"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="e.g. 7 or [4, 9, 16]"
            inputMode="text"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                submitEnqueue();
              }
            }}
          />
          <Button size="sm" variant="ghost" onClick={addRandom} title="Generate and enqueue a random value">
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
          onClick={submitEnqueue}
          title="Enqueue value(s) (Enter)"
        >
          Enqueue
        </Button>
      </div>

      <div className="action-secondary-grid action-secondary-grid-3">
        <Button size="sm" variant="secondary" onClick={dequeue} title="Dequeue front element">
          Dequeue
        </Button>
        <Button size="sm" variant="secondary" onClick={front} title="Inspect front element">
          Front
        </Button>
        <Button size="sm" variant="secondary" onClick={clear} title="Clear queue">
          Clear
        </Button>
      </div>

      <Button className="full-width control-preset" size="sm" variant="ghost" onClick={preset} title="Load preset values">
        Load Preset
      </Button>
    </div>
  );
}
