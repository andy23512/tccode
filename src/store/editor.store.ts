import {
  withDevtools,
  withStorageSync,
} from '@angular-architects/ngrx-toolkit';
import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import detectIndent from 'detect-indent';
import { EditorState } from '../model/editor-state.model';

const initialState: EditorState = {
  content: '',
};

export const EditorStore = signalStore(
  { providedIn: 'root' },
  withDevtools('editor'),
  withStorageSync({
    key: 'editor',
    parse(stateString: string) {
      return { ...initialState, ...JSON.parse(stateString) };
    },
  }),
  withState(initialState),
  withComputed((state) => ({
    indent: computed<string>(() => {
      const content = state.content();
      return detectIndent(content).indent || '  ';
    }),
  })),
  withMethods((store) => ({
    appendContent(content: string): void {
      patchState(store, (state) => ({
        content: state.content ? state.content + '\n' + content : content,
      }));
    },
    setContent(content: string): void {
      patchState(store, {
        content,
      });
    },
  })),
);
