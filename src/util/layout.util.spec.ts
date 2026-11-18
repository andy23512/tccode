import { KeyboardLayout } from 'tangent-cc-lib';
import {
  getActionCodeFromTcclKey,
  getCharacterActionCodeMapFromKeyboardLayout,
  getTcclKeyFromActionCode,
} from './layout.util';

// Action codes (from tangent-cc-lib ACTIONS): KeyA = 97 / Shift+KeyA = 65,
// KeyB = 98, KeyC = 99, KeyD = 100, Space (non-WSK) = 32 / 300 / 544.
const layout = {
  id: 'test',
  name: 'Test',
  reference: '',
  layout: {
    KeyA: {
      unmodified: { type: 'text', value: 'a' },
      withShift: { type: 'text', value: 'A' },
      withAltGraph: { type: 'text', value: 'b' },
    },
    KeyB: { unmodified: { type: 'text', value: 'b' } },
    // dead keys are not usable in TCCL
    KeyC: { unmodified: { type: 'dead-key', value: '`' } },
    // characters outside the supported set are not usable in TCCL
    KeyD: { unmodified: { type: 'text', value: 'é' } },
  },
} as unknown as KeyboardLayout;

describe('getTcclKeyFromActionCode', () => {
  it('returns the unmodified character for a WSK action', () => {
    expect(getTcclKeyFromActionCode(97, layout, 'input')).toBe('a');
  });

  it('returns the shifted character for a shifted WSK action', () => {
    expect(getTcclKeyFromActionCode(65, layout, 'input')).toBe('A');
  });

  it('falls back to <code> for a dead key', () => {
    expect(getTcclKeyFromActionCode(99, layout, 'input')).toBe('<99>');
  });

  it('falls back to <code> for an unsupported character', () => {
    expect(getTcclKeyFromActionCode(100, layout, 'input')).toBe('<100>');
  });

  it('falls back to <code> when the key is missing from the layout', () => {
    expect(getTcclKeyFromActionCode(49, layout, 'input')).toBe('<49>');
  });

  it('falls back to <code> for unknown action codes', () => {
    expect(getTcclKeyFromActionCode(9999, layout, 'output')).toBe('<9999>');
  });

  it('maps action 544 to a space only for output', () => {
    expect(getTcclKeyFromActionCode(544, layout, 'output')).toBe(' ');
    expect(getTcclKeyFromActionCode(544, layout, 'input')).toBe('<544>');
  });

  it('does not map other space actions to a space', () => {
    expect(getTcclKeyFromActionCode(32, layout, 'output')).toBe('<32>');
    expect(getTcclKeyFromActionCode(300, layout, 'output')).toBe('<300>');
  });
});

describe('getCharacterActionCodeMapFromKeyboardLayout', () => {
  const map = getCharacterActionCodeMapFromKeyboardLayout(layout);

  it('maps unmodified and shifted characters to their action codes', () => {
    expect(map.get('a')).toBe(97);
    expect(map.get('A')).toBe(65);
    expect(map.get('b')).toBe(98);
  });

  it('ignores dead keys and unsupported characters', () => {
    expect(map.has('`')).toBe(false);
    expect(map.has('é')).toBe(false);
  });

  it('ignores modifiers other than unmodified / withShift', () => {
    // KeyA withAltGraph is also 'b', but must not override KeyB's mapping.
    expect(map.get('b')).toBe(98);
  });

  it('returns an empty map for an empty layout', () => {
    const empty = { ...layout, layout: {} } as unknown as KeyboardLayout;
    expect(getCharacterActionCodeMapFromKeyboardLayout(empty).size).toBe(0);
  });
});

describe('getActionCodeFromTcclKey', () => {
  const map = getCharacterActionCodeMapFromKeyboardLayout(layout);

  it('parses <code> notation', () => {
    expect(getActionCodeFromTcclKey('<559>', map, 'input')).toBe(559);
    expect(getActionCodeFromTcclKey('<559>', map, 'output')).toBe(559);
  });

  it('maps a space to 544 for output', () => {
    expect(getActionCodeFromTcclKey(' ', map, 'output')).toBe(544);
  });

  it('rejects a space for input', () => {
    expect(() => getActionCodeFromTcclKey(' ', map, 'input')).toThrow(
      'Cannot find corresponding action code for key:  ',
    );
  });

  it('looks characters up in the layout map', () => {
    expect(getActionCodeFromTcclKey('a', map, 'input')).toBe(97);
    expect(getActionCodeFromTcclKey('A', map, 'output')).toBe(65);
  });

  it('throws for characters not in the layout', () => {
    expect(() => getActionCodeFromTcclKey('z', map, 'input')).toThrow(
      'Cannot find corresponding action code for key: z',
    );
  });
});

describe('getTcclKeyFromActionCode / getActionCodeFromTcclKey round trip', () => {
  const map = getCharacterActionCodeMapFromKeyboardLayout(layout);

  it.each([97, 65, 98])('round-trips action %i', (code) => {
    const key = getTcclKeyFromActionCode(code, layout, 'input');
    expect(getActionCodeFromTcclKey(key, map, 'input')).toBe(code);
  });

  it('round-trips an unmapped code through <code> notation', () => {
    const key = getTcclKeyFromActionCode(559, layout, 'input');
    expect(getActionCodeFromTcclKey(key, map, 'input')).toBe(559);
  });
});
