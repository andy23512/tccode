import { NgxMonacoEditorConfig } from 'ngx-monaco-editor-v2';

export const TCCL_LANGUAGE_ID = 'tccl';
export const TCCL_THEME_NAME = 'tccl-theme';

export const MONACO_CONFIG: NgxMonacoEditorConfig = {
  onMonacoLoad: () => {
    monaco.languages.register({ id: TCCL_LANGUAGE_ID });
    monaco.languages.setMonarchTokensProvider(TCCL_LANGUAGE_ID, {
      keys: [...'abcdefghijklmnopqrstuvwxyz'.split('')],
      includeLF: true,
      tokenizer: {
        root: [
          [/ = /, 'input-output-separator', '@output'],
          { include: '@input' },
        ],
        input: [
          [/ /, 'space'],
          [/\+/, 'input-separator'],
          [/\S/, { cases: { '@keys': 'input-key' } }],
        ],
        output: [
          [/\n/, '', '@pop'],
          [/\S/, { cases: { '@keys': 'output-key' } }],
        ],
      },
    });
    monaco.editor.defineTheme(TCCL_THEME_NAME, {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'input-separator', foreground: '#999999' },
        { token: 'input-key', foreground: '#39C5BB' },
        { token: 'output-key', foreground: '#fc4769' },
      ],
      colors: {},
    });
  },
};
