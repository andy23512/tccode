import { editor, languages } from 'monaco-editor';
export const TCCL_LANGUAGE_ID = 'tccl';
export const TCCL_LANGUAGE_DEF: languages.IMonarchLanguage = {
  keys: [...'abcdefghijklmnopqrstuvwxyz'.split('')],
  includeLF: true,
  tokenizer: {
    root: [[/ = /, 'input-output-separator', '@output'], { include: '@input' }],
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
};
export const TCCL_THEME_NAME = 'tccl-theme';
export const TCCL_THEME_DATA: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'input-separator', foreground: '#999999' },
    { token: 'input-key', foreground: '#39C5BB' },
    { token: 'output-key', foreground: '#FC4769' },
  ],
  colors: {},
};
