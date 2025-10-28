import { editor } from 'monaco-editor';
export const TCCL_LANGUAGE_ID = 'tccl';
export const TCCL_THEME_NAME = 'tccl-theme';
export const TCCL_THEME_DATA: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'input_key_separator.tccl', foreground: '#999999' },
    { token: 'chord_input_key.tccl', foreground: '#39C5BB' },
    { token: 'chord_output_key.tccl', foreground: '#FC4769' },
  ],
  colors: {},
};
