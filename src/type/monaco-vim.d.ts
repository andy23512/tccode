declare module 'monaco-vim' {
  import { editor } from 'monaco-editor';

  export class VimMode {
    dispose: () => void;
  }

  export function initVimMode(
    editor: editor.IEditor,
    element: HTMLElement
  ): VimMode;
}
