import { useState } from 'react';
import { type TraversalType } from '../../lib/algorithms/bst';
import { useAlgoStore } from '../../lib/state/useAlgoStore';
import { parseIntegerInput } from '../../lib/utils/parse';
import { Button } from '../ui/Button';

const TRAVERSAL_LABELS: Record<TraversalType, string> = {
  inorder: 'Inorder',
  preorder: 'Preorder',
  postorder: 'Postorder',
  level: 'Level'
};

const TRAVERSAL_PATHS: Record<TraversalType, string> = {
  inorder: 'Left → Root → Right',
  preorder: 'Root → Left → Right',
  postorder: 'Left → Right → Root',
  level: 'Top → Down by levels'
};

export function TreeControls() {
  const insert = useAlgoStore((state) => state.treeInsert);
  const remove = useAlgoStore((state) => state.treeDelete);
  const search = useAlgoStore((state) => state.treeSearch);
  const traverse = useAlgoStore((state) => state.treeTraverse);
  const reset = useAlgoStore((state) => state.treeReset);
  const preset = useAlgoStore((state) => state.treeLoadPreset);
  const traversalType = useAlgoStore(
    (state) => state.treeSession.history[state.treeSession.cursor].state.traversalType
  );
  const traversal = useAlgoStore((state) => state.treeSession.history[state.treeSession.cursor].state.traversal);

  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const apply = (operation: 'insert' | 'delete' | 'search') => {
    const parsed = parseIntegerInput(value);
    if (parsed.error || parsed.value === null) {
      setError(parsed.error);
      return;
    }

    if (operation === 'insert') {
      insert(parsed.value);
    } else if (operation === 'delete') {
      remove(parsed.value);
    } else {
      search(parsed.value);
    }

    setError(null);
  };

  const runTraversal = (type: TraversalType) => {
    traverse(type);
  };

  return (
    <div className="control-group">
      <div className="field">
        <label htmlFor="tree-value">Value</label>
        <input
          id="tree-value"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="e.g. 30"
          inputMode="numeric"
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              apply('insert');
            }
          }}
        />
        {error && <p className="field-error">{error}</p>}
      </div>

      <div className="button-grid">
        <Button variant="primary" onClick={() => apply('insert')}>
          Insert
        </Button>
        <Button onClick={() => apply('delete')}>Delete</Button>
        <Button onClick={() => apply('search')}>Search</Button>
        <Button onClick={reset}>Reset</Button>
      </div>

      <div className="button-grid">
        <Button
          size="sm"
          variant={traversalType === 'inorder' ? 'primary' : 'secondary'}
          onClick={() => runTraversal('inorder')}
        >
          Inorder (LNR)
        </Button>
        <Button
          size="sm"
          variant={traversalType === 'preorder' ? 'primary' : 'secondary'}
          onClick={() => runTraversal('preorder')}
        >
          Preorder (NLR)
        </Button>
        <Button
          size="sm"
          variant={traversalType === 'postorder' ? 'primary' : 'secondary'}
          onClick={() => runTraversal('postorder')}
        >
          Postorder (LRN)
        </Button>
        <Button
          size="sm"
          variant={traversalType === 'level' ? 'primary' : 'secondary'}
          onClick={() => runTraversal('level')}
        >
          Level (BFS)
        </Button>
      </div>

      <div className="traversal-feedback" aria-live="polite">
        <p className="traversal-feedback-title">
          {traversalType ? `${TRAVERSAL_LABELS[traversalType]} active` : 'Traversal helper'}
        </p>
        <p className="traversal-feedback-path">
          {traversalType ? TRAVERSAL_PATHS[traversalType] : 'Choose a traversal to animate tree visits.'}
        </p>
        {traversal.length > 0 && <p className="traversal-feedback-order">{traversal.join(' → ')}</p>}
      </div>

      <Button className="full-width" onClick={preset}>
        Load Preset
      </Button>
    </div>
  );
}
