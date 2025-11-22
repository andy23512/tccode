const NUMBER = [...'0123456789'];
const UPPERCASE = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
const LOWERCASE = [...'abcdefghijklmnopqrstuvwxyz'];
const SYMBOL = [...'[]./-'];
const NON_SPACE_CHARACTER_KEY = [
  ...NUMBER,
  ...UPPERCASE,
  ...LOWERCASE,
  ...SYMBOL,
];
export const SUPPORTED_NON_SPACE_KEY_SET = new Set([
  ...NON_SPACE_CHARACTER_KEY,
]);
