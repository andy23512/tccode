import {
  KeyboardLayout,
  KEYBOARD_LAYOUTS_FROM_KBDLAYOUT,
} from 'tangent-cc-lib';

export const US_KEYBOARD_LAYOUT = KEYBOARD_LAYOUTS_FROM_KBDLAYOUT.find(
  (layout) => layout.id === 'us',
) as KeyboardLayout;
