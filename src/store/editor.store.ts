import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { EditorState } from '../model/editor-state.model';

const initialState: EditorState = {
  content: '',
};

export const EditorStore = signalStore(
  { providedIn: 'root' },
  withDevtools('editor'),
  withState(initialState),
  withMethods((store) => ({
    setContent(content: string): void {
      patchState(store, { content });
    },
  })),
);
