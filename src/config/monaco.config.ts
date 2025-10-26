import { editor } from 'monaco-editor';
import { NgxMonacoEditorConfig } from 'ngx-monaco-editor-v2';
import {
  TCCL_LANGUAGE_DEF,
  TCCL_LANGUAGE_ID,
  TCCL_THEME_DATA,
  TCCL_THEME_NAME,
} from './tccl-language.config';

export const MONACO_CONFIG: NgxMonacoEditorConfig = {
  onMonacoLoad: () => {
    monaco.languages.register({ id: TCCL_LANGUAGE_ID });
    monaco.languages.setMonarchTokensProvider(
      TCCL_LANGUAGE_ID,
      TCCL_LANGUAGE_DEF,
    );
    monaco.editor.defineTheme(TCCL_THEME_NAME, TCCL_THEME_DATA);
  },
};

export const MONACO_DIFF_EDITOR_OPTIONS: editor.IStandaloneDiffEditorConstructionOptions =
  {
    automaticLayout: true,
    fontFamily: 'Consolas, "Courier New", monospace',
    fontSize: 20,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    theme: TCCL_THEME_NAME,
    wordWrap: 'off',
    renderWhitespace: 'all',
    renderSideBySide: false,
    ignoreTrimWhitespace: false,
  };
