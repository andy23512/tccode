declare module 'monaco-vim' {
  import type { editor } from 'monaco-editor';

  export class VimMode {
    dispose: () => void;
  }

  export function initVimMode(
    editor: editor.IEditor,
    element: HTMLElement,
  ): VimMode;
}
