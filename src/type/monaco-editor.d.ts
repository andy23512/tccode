declare module 'monaco-editor/esm/vs/editor/editor.worker' {
  import type { worker } from 'monaco-editor';

  export function initialize(
    callback: (ctx: worker.IWorkerContext) => any,
  ): void;
}
