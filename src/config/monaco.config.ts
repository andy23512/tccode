import { NgxMonacoEditorConfig } from 'ngx-monaco-editor-v2';

export const TCCL_LANGUAGE_ID = 'tccl';
export const TCCL_THEME_NAME = 'tccl-theme';

export const MONACO_CONFIG: NgxMonacoEditorConfig = {
  onMonacoLoad: () => {
    monaco.languages.register({ id: TCCL_LANGUAGE_ID });
    monaco.languages.setMonarchTokensProvider(TCCL_LANGUAGE_ID, {
      tokenizer: {
        root: [[/b\+c.*/, 'because']],
      },
    });
    monaco.editor.defineTheme(TCCL_THEME_NAME, {
      base: 'vs-dark',
      inherit: true,
      rules: [{ token: 'because', foreground: '39C5BB' }],
      colors: {},
    });
  },
};
