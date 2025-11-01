import * as monaco from 'monaco-editor';

export function setupMonacoKeybindings() {
  monaco.editor.addKeybindingRules([
    {
      keybinding:
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyP,
      command: 'editor.action.quickCommand',
    },
  ]);
}
