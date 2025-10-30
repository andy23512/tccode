export enum KeyBindings {
  Classic = 'Classic',
  Vim = 'Vim',
  Emacs = 'Emacs',
}

export interface Setting {
  showWelcomeDialogWhenStart: boolean;
  keyBindings: KeyBindings;
  detectConflictsWithBopomofoChords: boolean;
}
