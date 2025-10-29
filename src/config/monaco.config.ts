import type { editor } from 'monaco-editor';
import { TCCL_LANGUAGE_ID, TCCL_THEME_NAME } from '../tccl/tccl-config';

export const MONACO_EDITOR_OPTIONS: editor.IStandaloneEditorConstructionOptions =
  {
    language: TCCL_LANGUAGE_ID,
    automaticLayout: true,
    fontFamily: 'Consolas, "Courier New", monospace',
    fontSize: 20,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    theme: TCCL_THEME_NAME,
    wordWrap: 'off',
    renderWhitespace: 'all',
  };
