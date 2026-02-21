import { useMemo, useState } from 'react';
import { analyzeTree, type TraversalType, type TreeNode } from '../../lib/algorithms/bst';
import { useAlgoStore } from '../../lib/state/useAlgoStore';
import { parseIntegerCollectionInput } from '../../lib/utils/parse';
import { randomInt } from '../../lib/utils/random';
import { Button } from '../ui/Button';
import { MessageBubble } from '../ui/MessageBubble';

const RANDOM_MIN = -99;
const RANDOM_MAX = 99;
const RANDOM_RANGE_SIZE = RANDOM_MAX - RANDOM_MIN + 1;
const RANDOM_MAX_ATTEMPTS = 220;

function collectTreeValues(root: TreeNode | null, output: Set<number>): void {
  if (root === null) {
    return;
  }

  output.add(root.value);
  collectTreeValues(root.left, output);
  collectTreeValues(root.right, output);
}

export function TreeControls() {
  const insert = useAlgoStore((state) => state.treeInsert);
  const remove = useAlgoStore((state) => state.treeDelete);
  const search = useAlgoStore((state) => state.treeSearch);
  const traverse = useAlgoStore((state) => state.treeTraverse);
  const stopTraversal = useAlgoStore((state) => state.treeStopTraversal);
  const setAutoBalance = useAlgoStore((state) => state.treeSetAutoBalance);
  const reset = useAlgoStore((state) => state.treeReset);
  const preset = useAlgoStore((state) => state.treeLoadPreset);
  const autoBalance = useAlgoStore((state) => state.treeSession.history[state.treeSession.cursor].state.autoBalance);
  const root = useAlgoStore((state) => state.treeSession.history[state.treeSession.cursor].state.root);
  const traversalType = useAlgoStore(
    (state) => state.treeSession.history[state.treeSession.cursor].state.traversalType
  );
  const balanceInfo = useMemo(() => analyzeTree(root), [root]);

  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const apply = (operation: 'insert' | 'delete' | 'search') => {
    const parsed = parseIntegerCollectionInput(value);
    if (parsed.error) {
      setError(parsed.error);
      return;
    }

    parsed.values.forEach((nextValue) => {
      if (operation === 'insert') {
        insert(nextValue);
      } else if (operation === 'delete') {
        remove(nextValue);
      } else {
        search(nextValue);
      }
    });

    setError(null);
  };

  const runTraversal = (type: TraversalType) => {
    traverse(type);
  };

  const addRandom = () => {
    const existingValues = new Set<number>();
    collectTreeValues(root, existingValues);

    if (existingValues.size >= RANDOM_RANGE_SIZE) {
      setError(`All values from ${RANDOM_MIN} to ${RANDOM_MAX} already exist in this tree.`);
      return;
    }

    let candidate = randomInt(RANDOM_MIN, RANDOM_MAX);
    let attempts = 0;
    while (existingValues.has(candidate) && attempts < RANDOM_MAX_ATTEMPTS) {
      candidate = randomInt(RANDOM_MIN, RANDOM_MAX);
      attempts += 1;
    }

    if (existingValues.has(candidate)) {
      for (let valueToTry = RANDOM_MIN; valueToTry <= RANDOM_MAX; valueToTry += 1) {
        if (!existingValues.has(valueToTry)) {
          candidate = valueToTry;
          break;
        }
      }
    }

    setValue(String(candidate));
    insert(candidate);
    setError(null);
  };

  return (
    <div className="control-group">
      <div className="field">
        <label htmlFor="tree-value">Value</label>
        <div className="input-inline">
          <input
            id="tree-value"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="e.g. 30 or [20, 10, 40]"
            inputMode="text"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                apply('insert');
              }
            }}
          />
          <Button size="sm" variant="ghost" onClick={addRandom} title="Generate and insert a unique random value">
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
          onClick={() => apply('insert')}
          title="Insert value(s) (Enter)"
        >
          Insert
        </Button>
      </div>

      <div className="action-secondary-grid action-secondary-grid-3">
        <Button size="sm" variant="secondary" onClick={() => apply('delete')} title="Delete value(s)">
          Delete
        </Button>
        <Button size="sm" variant="secondary" onClick={() => apply('search')} title="Search value(s)">
          Search
        </Button>
        <Button size="sm" variant="secondary" onClick={reset} title="Reset tree">
          Reset
        </Button>
      </div>

      <div className="button-grid">
        <Button
          size="sm"
          variant={traversalType === 'inorder' ? 'primary' : 'secondary'}
          onClick={() => runTraversal('inorder')}
          title="Run inorder traversal"
        >
          Inorder (LNR)
        </Button>
        <Button
          size="sm"
          variant={traversalType === 'preorder' ? 'primary' : 'secondary'}
          onClick={() => runTraversal('preorder')}
          title="Run preorder traversal"
        >
          Preorder (NLR)
        </Button>
        <Button
          size="sm"
          variant={traversalType === 'postorder' ? 'primary' : 'secondary'}
          onClick={() => runTraversal('postorder')}
          title="Run postorder traversal"
        >
          Postorder (LRN)
        </Button>
        <Button
          size="sm"
          variant={traversalType === 'level' ? 'primary' : 'secondary'}
          onClick={() => runTraversal('level')}
          title="Run level-order traversal"
        >
          Level (BFS)
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={stopTraversal}
          disabled={traversalType === null}
          title="Stop current traversal"
        >
          Stop
        </Button>
      </div>

      <div className="tree-balance-row">
        <label className="tree-balance-toggle" htmlFor="tree-auto-balance">
          <input
            id="tree-auto-balance"
            type="checkbox"
            checked={autoBalance}
            onChange={(event) => setAutoBalance(event.target.checked)}
          />
          <span className="tree-balance-copy">
            <span>Auto-balance BST</span>
            <small className={balanceInfo.balanced ? 'tree-balance-inline-good' : 'tree-balance-inline-bad'}>
              {balanceInfo.balanced ? 'Balanced' : 'Unbalanced'} · h={balanceInfo.height}
            </small>
          </span>
        </label>
      </div>

      <Button className="full-width control-preset" size="sm" variant="ghost" onClick={preset} title="Load sample tree preset">
        Load Preset
      </Button>
    </div>
  );
}
