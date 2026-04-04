import { ACTIONS, ActionType, KeyboardLayout } from 'tangent-cc-lib';
import { SUPPORTED_NON_SPACE_KEY_SET } from '../const/character-key-set.const';

export function getTcclKeyFromActionCode(
  actionCode: number,
  keyboardLayout: KeyboardLayout,
  type: 'input' | 'output',
): string {
  let key = `<${actionCode}>`;
  const action = ACTIONS.find((a) => a.codeId === actionCode);
  if (action?.type === ActionType.WSK && action.keyCode) {
    const keyboardLayoutKey = keyboardLayout.layout[action.keyCode];
    const modifier = action.withShift ? 'withShift' : 'unmodified';
    const character = keyboardLayoutKey?.[modifier];
    if (
      character?.type === 'text' &&
      SUPPORTED_NON_SPACE_KEY_SET.has(character.value)
    ) {
      key = character.value;
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

export function getCharacterActionCodeMapFromKeyboardLayout(
  keyboardLayout: KeyboardLayout,
): Map<string, number> {
  const map = new Map<string, number>();
  Object.entries(keyboardLayout.layout).forEach(
    ([keyCode, keyboardLayoutKey]) => {
      if (!keyboardLayoutKey) {
        return;
      }
      Object.entries(keyboardLayoutKey).forEach(([modifier, character]) => {
        if (
          !['unmodified', 'withShift'].includes(modifier) ||
          !character ||
          character.type !== 'text' ||
          !SUPPORTED_NON_SPACE_KEY_SET.has(character.value)
        ) {
          return;
        }
        const action = ACTIONS.find(
          (a) =>
            a.type === ActionType.WSK &&
            a.keyCode === keyCode &&
            (modifier === 'withShift' ? a.withShift : !a.withShift),
        );
        if (!action) {
          return;
        }
        map.set(character.value, action.codeId);
      });
    },
  );
  return map;
}

export function getActionCodeFromTcclKey(
  tcclKey: string,
  characterActionCodeMap: Map<string, number>,
  type: 'input' | 'output',
): number {
  const match = /^<(\d+)>$/.exec(tcclKey);
  if (match) {
    return +match[1];
  }
  if (type === 'output' && tcclKey === ' ') {
    return 544;
  }
  const actionCode = characterActionCodeMap.get(tcclKey);
  if (!actionCode) {
    throw Error('Cannot find corresponding action code for key: ' + tcclKey);
  }
  return actionCode;
}
