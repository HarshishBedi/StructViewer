import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { indentWithTab } from '@codemirror/commands';
import { EditorView, keymap } from '@codemirror/view';
import { useMemo } from 'react';
import type { EditorLanguage } from '../../lib/constants/editor';

interface PythonCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  theme: 'light' | 'dark';
  placeholder: string;
  onRunShortcut: () => void;
  language: EditorLanguage;
}

export function PythonCodeEditor({
  value,
  onChange,
  disabled,
  theme,
  placeholder,
  onRunShortcut,
  language
}: PythonCodeEditorProps) {
  const languageExtension = useMemo(() => {
    if (language === 'javascript') {
      return javascript({ jsx: true });
    }
    if (language === 'java') {
      return java();
    }
    if (language === 'c' || language === 'cpp') {
      return cpp();
    }
    return python();
  }, [language]);

  const editorExtensions = useMemo(
    () => [
      languageExtension,
      EditorView.lineWrapping,
      keymap.of([
        indentWithTab,
        {
          key: 'Mod-Enter',
          run: () => {
            onRunShortcut();
            return true;
          }
        }
      ])
    ],
    [languageExtension, onRunShortcut]
  );

  return (
    <CodeMirror
      className="python-console-editor"
      value={value}
      height="176px"
      minHeight="140px"
      maxHeight="320px"
      editable={!disabled}
      theme={theme}
      basicSetup={{
        lineNumbers: true,
        highlightActiveLine: true,
        highlightActiveLineGutter: true,
        foldGutter: false,
        searchKeymap: true,
        autocompletion: true,
        bracketMatching: true
      }}
      extensions={editorExtensions}
      onChange={onChange}
      placeholder={placeholder}
      spellCheck={false}
    />
  );
}
