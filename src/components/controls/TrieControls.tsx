import { useState } from 'react';
import { useAlgoStore } from '../../lib/state/useAlgoStore';
import { parseWordCollectionInput } from '../../lib/utils/parse';
import { Button } from '../ui/Button';
import { MessageBubble } from '../ui/MessageBubble';

export function TrieControls() {
  const insert = useAlgoStore((state) => state.trieInsertWord);
  const remove = useAlgoStore((state) => state.trieDeleteWord);
  const search = useAlgoStore((state) => state.trieSearchWord);
  const prefix = useAlgoStore((state) => state.triePrefixSearch);
  const clear = useAlgoStore((state) => state.trieClear);
  const preset = useAlgoStore((state) => state.trieLoadPreset);

  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const applyWordAction = (kind: 'insert' | 'delete' | 'search' | 'prefix') => {
    const parsed = parseWordCollectionInput(value);
    if (parsed.error) {
      setError(parsed.error);
      return;
    }

    const words = kind === 'insert' ? parsed.values : [parsed.values[0]];
    words.forEach((word) => {
      if (kind === 'insert') {
        insert(word);
      } else if (kind === 'delete') {
        remove(word);
      } else if (kind === 'search') {
        search(word);
      } else {
        prefix(word);
      }
    });

    setError(null);
  };

  return (
    <div className="control-group">
      <div className="field">
        <label htmlFor="trie-word">Word</label>
        <input
          id="trie-word"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="e.g. tree or [tree, trie, track]"
          inputMode="text"
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              applyWordAction('insert');
            }
          }}
        />
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
          onClick={() => applyWordAction('insert')}
          title="Insert word(s) (Enter)"
        >
          Insert Word
        </Button>
      </div>

      <div className="action-secondary-grid action-secondary-grid-3">
        <Button size="sm" variant="secondary" onClick={() => applyWordAction('delete')} title="Delete a word">
          Delete
        </Button>
        <Button size="sm" variant="secondary" onClick={() => applyWordAction('search')} title="Search exact word">
          Search
        </Button>
        <Button size="sm" variant="secondary" onClick={() => applyWordAction('prefix')} title="Search by prefix">
          Prefix
        </Button>
      </div>

      <div className="action-secondary-grid action-secondary-grid-2">
        <Button size="sm" variant="secondary" onClick={clear} title="Clear trie">
          Clear
        </Button>
        <Button size="sm" variant="ghost" onClick={preset} title="Load sample words">
          Load Preset
        </Button>
      </div>
    </div>
  );
}
