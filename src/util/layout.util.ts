import { SUPPORTED_NON_SPACE_KEY_SET } from '../const/character-key-set.const';
import { ACTIONS } from '../data/actions.const';
import { ActionType } from '../model/action.model';
import { WSKCode } from '../model/key-code.model';
import {
  CharacterKeyCodeMap,
  KeyBoardLayout,
  KeyboardLayoutKey,
} from '../model/keyboard-layout.model';

export function convertKeyboardLayoutToCharacterKeyCodeMap(
  keyboardLayout: KeyBoardLayout | null,
): CharacterKeyCodeMap {
  if (!keyboardLayout) {
    return new Map();
  }
  return new Map(
    (
      Object.entries(keyboardLayout.layout) as [
        WSKCode,
        Partial<KeyboardLayoutKey>,
      ][]
    )
      .map(([keyCode, keyboardLayoutKey]) =>
        keyboardLayoutKey
          ? (
              Object.entries(keyboardLayoutKey) as [
                keyof KeyboardLayoutKey,
                string,
              ][]
            ).map(
              ([modifier, character]) =>
                [
                  character,
                  {
                    keyCode,
                    shiftKey:
                      modifier === 'withShift' ||
                      modifier === 'withShiftAltGraph',
                    altGraphKey:
                      modifier === 'withAltGraph' ||
                      modifier === 'withShiftAltGraph',
                  },
                ] as const,
            )
          : [],
      )
      .flat(),
  );
}

export function getTcclKeyFromActionCode(
  actionCode: number,
  keyboardLayout: KeyBoardLayout,
  type: 'input' | 'output',
): string {
  let key = `<${actionCode}>`;
  const action = ACTIONS.find((a) => a.codeId === actionCode);
  if (action?.type === ActionType.WSK && action.keyCode) {
    const keyboardLayoutKey = keyboardLayout.layout[action.keyCode];
    const modifier = action.withShift ? 'withShift' : 'unmodified';
    const character = keyboardLayoutKey?.[modifier];
    if (character && SUPPORTED_NON_SPACE_KEY_SET.has(character)) {
      key = character;
    }
  } else if (
    action?.type === ActionType.NonWSK &&
    action.keyCode === 'Space' &&
    action.codeId === 544 &&
    type === 'output'
  ) {
    key = ' ';
  }
  return key;
}
