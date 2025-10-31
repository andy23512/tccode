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
    appendContent(content: string): void {
      patchState(store, (state) => ({
        content: state.content ? state.content + '\n' + content : content,
      }));
    },
  })),
);
