import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
} from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';
import {
  KeyboardLayout,
  convertKeyboardLayoutToCharacterKeyCodeMap,
} from 'tangent-cc-lib';
import { US_KEYBOARD_LAYOUT } from '../data/keyboard-layouts.const';
import { withSelectedEntity } from './selected-entity.feature';

export const KeyboardLayoutStore = signalStore(
  { providedIn: 'root' },
  withDevtools('keyboardLayout'),
  withEntities<KeyboardLayout>(),
  withSelectedEntity(),
  withMethods((store) => ({
    load() {
      patchState(store, setAllEntities([US_KEYBOARD_LAYOUT]));
      store.setSelectedId(US_KEYBOARD_LAYOUT.id);
    },
  })),
  withComputed((state) => ({
    characterKeyCodeMap: computed(() => {
      const keyboardLayout = state.selectedEntity();
      return convertKeyboardLayoutToCharacterKeyCodeMap(keyboardLayout);
    }),
  })),
  withHooks({ onInit: (store) => store.load() }),
);
