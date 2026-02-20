import { useState } from 'react';
import { useAlgoStore } from '../../lib/state/useAlgoStore';
import { parseIntegerInput } from '../../lib/utils/parse';
import { Button } from '../ui/Button';
import { MessageBubble } from '../ui/MessageBubble';

export function StackControls() {
  const push = useAlgoStore((state) => state.stackPush);
  const pop = useAlgoStore((state) => state.stackPop);
  const peek = useAlgoStore((state) => state.stackPeek);
  const clear = useAlgoStore((state) => state.stackClear);
  const preset = useAlgoStore((state) => state.stackLoadPreset);

  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submitPush = () => {
    const parsed = parseIntegerInput(value);
    if (parsed.error || parsed.value === null) {
      setError(parsed.error);
      return;
    }

    push(parsed.value);
    setValue('');
    setError(null);
  };

  return (
    <div className="control-group">
      <div className="field">
        <label htmlFor="stack-value">Value</label>
        <input
          id="stack-value"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="e.g. 24"
          inputMode="numeric"
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              submitPush();
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
        <Button variant="primary" onClick={submitPush}>
          Push
        </Button>
        <Button onClick={pop}>Pop</Button>
        <Button onClick={peek}>Peek</Button>
        <Button onClick={clear}>Clear</Button>
      </div>

      <Button className="full-width" onClick={preset}>
        Load Preset
      </Button>
    </div>
  );
}
