import { lazy, Suspense, useCallback, useMemo, useState } from 'react';
import { EDITOR_LANGUAGE_OPTIONS, type EditorLanguage } from '../../lib/constants/editor';
import { useShallow } from 'zustand/react/shallow';
import { MODULES, type ModuleId } from '../../lib/constants/modules';
import { useAlgoStore } from '../../lib/state/useAlgoStore';
import { runCodeScript } from '../../lib/utils/pythonRunner';
import { Button } from '../ui/Button';
import { IconPlay, IconSparkles, IconTrash } from '../ui/icons';
import { MessageBubble } from '../ui/MessageBubble';

const PythonCodeEditor = lazy(async () => {
  const module = await import('../ui/PythonCodeEditor');
  return { default: module.PythonCodeEditor };
});

const PYTHON_EXAMPLES: Record<ModuleId, string> = {
  stack: `# Stack script
for i in range(3):
  stack.push(randint(1, 40))
stack.peek()
stack.pop()`,
  queue: `# Queue script
for i in range(4):
  queue.enqueue(randint(1, 40))
queue.front()
queue.dequeue()`,
  heap: `# Heap script
heap.mode("max")
for i in range(6):
  heap.insert(randint(5, 60))
heap.extract_root()`,
  tree: `# Tree script
for i in range(6):
  tree.insert(randint(10, 90))
tree.search(42)
tree.traverse("inorder")`,
  trie: `# Trie script
trie.insert("tree")
trie.insert("trie")
trie.prefix("tr")
trie.search("tree")`,
  unionfind: `# Union-Find script
unionfind.resize(8)
unionfind.union(0, 1)
unionfind.union(1, 2)
unionfind.connected(0, 2)
unionfind.find(2)`
};

const NON_PYTHON_EXAMPLES: Record<Exclude<EditorLanguage, 'python'>, Record<ModuleId, string>> = {
  javascript: {
    stack: `// JavaScript stack script
let start = 10;
for (let i = 0; i < 3; i++) {
  stack.push(start + i);
}
stack.peek();
stack.pop();`,
    queue: `// JavaScript queue script
for (let i = 0; i < 4; i++) {
  queue.enqueue(randint(1, 40));
}
queue.front();
queue.dequeue();`,
    heap: `// JavaScript heap script
heap.mode("max");
for (let i = 0; i < 6; i++) {
  heap.insert(randint(5, 60));
}
heap.extract_root();`,
    tree: `// JavaScript tree script
for (let i = 0; i < 6; i++) {
  tree.insert(randint(10, 90));
}
tree.search(42);
tree.traverse("inorder");`,
    trie: `// JavaScript trie script
trie.insert("tree");
trie.insert("trie");
trie.prefix("tr");
trie.search("tree");`,
    unionfind: `// JavaScript union-find script
unionfind.resize(8);
unionfind.union(0, 1);
unionfind.union(1, 2);
unionfind.connected(0, 2);
unionfind.find(2);`
  },
  java: {
    stack: `// Java-style stack script
int start = 10;
for (int i = 0; i < 3; i++) {
  stack.push(start + i);
}
stack.peek();
stack.pop();`,
    queue: `// Java-style queue script
for (int i = 0; i < 4; i++) {
  queue.enqueue(randint(1, 40));
}
queue.front();
queue.dequeue();`,
    heap: `// Java-style heap script
heap.mode("max");
for (int i = 0; i < 6; i++) {
  heap.insert(randint(5, 60));
}
heap.extract_root();`,
    tree: `// Java-style tree script
for (int i = 0; i < 6; i++) {
  tree.insert(randint(10, 90));
}
tree.search(42);
tree.traverse("inorder");`,
    trie: `// Java-style trie script
trie.insert("tree");
trie.insert("trie");
trie.prefix("tr");
trie.search("tree");`,
    unionfind: `// Java-style union-find script
int size = 8;
unionfind.resize(size);
unionfind.union(0, 1);
unionfind.union(1, 2);
unionfind.connected(0, 2);
unionfind.find(2);`
  },
  c: {
    stack: `// C-style stack script
int start = 10;
for (int i = 0; i < 3; i++) {
  stack.push(start + i);
}
stack.peek();
stack.pop();`,
    queue: `// C-style queue script
for (int i = 0; i < 4; i++) {
  queue.enqueue(randint(1, 40));
}
queue.front();
queue.dequeue();`,
    heap: `// C-style heap script
heap.mode("max");
for (int i = 0; i < 6; i++) {
  heap.insert(randint(5, 60));
}
heap.extract_root();`,
    tree: `// C-style tree script
for (int i = 0; i < 6; i++) {
  tree.insert(randint(10, 90));
}
tree.search(42);
tree.traverse("inorder");`,
    trie: `// C-style trie script
trie.insert("tree");
trie.insert("trie");
trie.prefix("tr");
trie.search("tree");`,
    unionfind: `// C-style union-find script
int size = 8;
unionfind.resize(size);
unionfind.union(0, 1);
unionfind.union(1, 2);
unionfind.connected(0, 2);
unionfind.find(2);`
  },
  cpp: {
    stack: `// C++-style stack script
int start = 10;
for (int i = 0; i < 3; i++) {
  stack.push(start + i);
}
stack.peek();
stack.pop();`,
    queue: `// C++-style queue script
for (int i = 0; i < 4; i++) {
  queue.enqueue(randint(1, 40));
}
queue.front();
queue.dequeue();`,
    heap: `// C++-style heap script
heap.mode("max");
for (int i = 0; i < 6; i++) {
  heap.insert(randint(5, 60));
}
heap.extract_root();`,
    tree: `// C++-style tree script
for (int i = 0; i < 6; i++) {
  tree.insert(randint(10, 90));
}
tree.search(42);
tree.traverse("inorder");`,
    trie: `// C++-style trie script
trie.insert("tree");
trie.insert("trie");
trie.prefix("tr");
trie.search("tree");`,
    unionfind: `// C++-style union-find script
int size = 8;
unionfind.resize(size);
unionfind.union(0, 1);
unionfind.union(1, 2);
unionfind.connected(0, 2);
unionfind.find(2);`
  }
};

function getDefaultScript(language: EditorLanguage, module: ModuleId): string {
  if (language === 'python') {
    return PYTHON_EXAMPLES[module];
  }

  return NON_PYTHON_EXAMPLES[language][module];
}

const INITIAL_SCRIPTS: Record<EditorLanguage, Record<ModuleId, string>> = EDITOR_LANGUAGE_OPTIONS.reduce(
  (accumulator, option) => {
    accumulator[option.id] = MODULES.reduce((byModule, module) => {
      byModule[module.id] = getDefaultScript(option.id, module.id);
      return byModule;
    }, {} as Record<ModuleId, string>);
    return accumulator;
  },
  {} as Record<EditorLanguage, Record<ModuleId, string>>
);

interface ScriptState {
  message: string;
  tone: 'info' | 'success' | 'warning' | 'error';
}

export function PythonConsole() {
  const activeModule = useAlgoStore((state) => state.activeModule);
  const themeMode = useAlgoStore((state) => state.themeMode);

  const actions = useAlgoStore(
    useShallow((state) => ({
      stackPush: state.stackPush,
      stackPop: state.stackPop,
      stackPeek: state.stackPeek,
      stackClear: state.stackClear,
      stackLoadPreset: state.stackLoadPreset,
      heapInsert: state.heapInsert,
      heapExtractRoot: state.heapExtractRoot,
      heapSetMode: state.heapSetMode,
      heapReset: state.heapReset,
      heapLoadPreset: state.heapLoadPreset,
      treeInsert: state.treeInsert,
      treeDelete: state.treeDelete,
      treeSearch: state.treeSearch,
      treeTraverse: state.treeTraverse,
      treeReset: state.treeReset,
      treeLoadPreset: state.treeLoadPreset,
      queueEnqueue: state.queueEnqueue,
      queueDequeue: state.queueDequeue,
      queueFront: state.queueFront,
      queueClear: state.queueClear,
      queueLoadPreset: state.queueLoadPreset,
      trieInsertWord: state.trieInsertWord,
      trieDeleteWord: state.trieDeleteWord,
      trieSearchWord: state.trieSearchWord,
      triePrefixSearch: state.triePrefixSearch,
      trieClear: state.trieClear,
      trieLoadPreset: state.trieLoadPreset,
      unionFindResize: state.unionFindResize,
      unionFindUnion: state.unionFindUnion,
      unionFindFind: state.unionFindFind,
      unionFindConnected: state.unionFindConnected,
      unionFindReset: state.unionFindReset,
      unionFindLoadPreset: state.unionFindLoadPreset
    }))
  );

  const [editorLanguage, setEditorLanguage] = useState<EditorLanguage>('python');
  const [scripts, setScripts] = useState<Record<EditorLanguage, Record<ModuleId, string>>>(
    INITIAL_SCRIPTS
  );
  const [status, setStatus] = useState<ScriptState | null>(null);
  const [running, setRunning] = useState(false);

  const currentScript = scripts[editorLanguage][activeModule];
  const activeLanguageLabel = useMemo(
    () => EDITOR_LANGUAGE_OPTIONS.find((option) => option.id === editorLanguage)?.label ?? editorLanguage,
    [editorLanguage]
  );
  const editorTheme = useMemo(() => {
    if (themeMode === 'dark') {
      return 'dark';
    }
    if (themeMode === 'light') {
      return 'light';
    }
    if (typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark') {
      return 'dark';
    }
    return 'light';
  }, [themeMode]);
  const runScript = useCallback(() => {
    if (running) {
      return;
    }

    setRunning(true);
    setStatus({
      tone: 'info',
      message: 'Applying commands optimistically...'
    });

    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        const result = runCodeScript(currentScript, { activeModule, actions }, editorLanguage);
        setStatus({
          tone: result.ok ? 'success' : 'error',
          message: result.summary
        });
        setRunning(false);
      }, 0);
    });
  }, [actions, activeModule, currentScript, editorLanguage, running]);

  const loadExample = () => {
    setScripts((previous) => ({
      ...previous,
      [editorLanguage]: {
        ...previous[editorLanguage],
        [activeModule]: getDefaultScript(editorLanguage, activeModule)
      }
    }));
    setStatus({
      tone: 'success',
      message: `${activeLanguageLabel} example loaded.`
    });
  };

  const clearScript = () => {
    setScripts((previous) => ({
      ...previous,
      [editorLanguage]: {
        ...previous[editorLanguage],
        [activeModule]: ''
      }
    }));
    setStatus(null);
  };

  return (
    <section className="python-console">
      <header className="python-console-header">
        <h3>Code Console</h3>
        <label htmlFor="editor-language" className="python-console-language">
          <span>Lang</span>
          <select
            id="editor-language"
            value={editorLanguage}
            onChange={(event) => setEditorLanguage(event.target.value as EditorLanguage)}
            disabled={running}
          >
            {EDITOR_LANGUAGE_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </header>

      <Suspense
        fallback={
          <textarea
            className="python-console-fallback"
            value={currentScript}
            onChange={(event) =>
              setScripts((previous) => ({
                ...previous,
                [editorLanguage]: {
                  ...previous[editorLanguage],
                  [activeModule]: event.target.value
                }
              }))
            }
            placeholder={`# Write ${activeLanguageLabel} code for ${activeModule}`}
            spellCheck={false}
            disabled={running}
          />
        }
      >
        <PythonCodeEditor
          value={currentScript}
          disabled={running}
          theme={editorTheme}
          language={editorLanguage}
          onRunShortcut={runScript}
          onChange={(nextValue) =>
            setScripts((previous) => ({
              ...previous,
              [editorLanguage]: {
                ...previous[editorLanguage],
                [activeModule]: nextValue
              }
            }))
          }
          placeholder={`# Write ${activeLanguageLabel} code for ${activeModule}`}
        />
      </Suspense>

      <div className="python-console-actions">
        <div className="python-console-actions-left">
          <Button
            size="sm"
            iconOnly
            onClick={loadExample}
            aria-label="Load example script"
            title={`Load ${activeLanguageLabel} example`}
          >
            <IconSparkles className="btn-icon-svg" />
            <span className="sr-only">Load Example</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={clearScript}
            aria-label="Delete script"
            title="Delete Script"
          >
            <IconTrash className="btn-icon-svg" />
            <span className="sr-only">Delete Script</span>
          </Button>
        </div>
        <div className="python-console-actions-right">
          <Button
            variant="primary"
            size="sm"
            iconOnly
            loading={running}
            onClick={runScript}
            aria-label="Run script"
            title="Run Script"
          >
            <IconPlay className="btn-icon-svg" />
            <span className="sr-only">Run Script</span>
          </Button>
        </div>
      </div>

      {status && (
        <MessageBubble variant={status.tone} compact>
          {status.message}
        </MessageBubble>
      )}
    </section>
  );
}
