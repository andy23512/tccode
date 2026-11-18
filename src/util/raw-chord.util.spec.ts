import {
  deserializeActions,
  hashChord,
  parseChordActions,
  parsePhrase,
  serializeActions,
  stringifyChordActions,
  stringifyPhrase,
} from './raw-chord.util';

describe('phrase parsing / stringifying', () => {
  it('parses a hex phrase into action codes', () => {
    expect(parsePhrase('4142')).toEqual([65, 66]);
  });

  it('parses a two-byte action', () => {
    expect(parsePhrase('0220')).toEqual([544]);
  });

  it('stringifies action codes as uppercase hex', () => {
    expect(stringifyPhrase([65, 66])).toBe('4142');
    expect(stringifyPhrase([0xab])).toBe('AB');
  });

  it('pads single hex digits to two characters', () => {
    expect(stringifyPhrase([544])).toBe('0220');
  });

  it('round-trips', () => {
    const actions = [97, 544, 98, 559];
    expect(parsePhrase(stringifyPhrase(actions))).toEqual(actions);
  });

  it('handles an empty phrase', () => {
    expect(parsePhrase('')).toEqual([]);
    expect(stringifyPhrase([])).toBe('');
  });
});

describe('serializeActions / deserializeActions', () => {
  it('places action k at bit offset k * 10 for a full 12-action list', () => {
    const actions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const native = serializeActions(actions);
    actions.forEach((action, k) => {
      expect((native >> BigInt(k * 10)) & 0x3ffn).toBe(BigInt(action));
    });
  });

  it('round-trips a full 12-action list', () => {
    const actions = [0, 0, 0, 0, 0, 0, 0, 0, 0, 97, 98, 99];
    expect(deserializeActions(serializeActions(actions))).toEqual(actions);
  });

  it('right-aligns lists shorter than 12 (zeros are added on the left)', () => {
    expect(deserializeActions(serializeActions([7]))).toEqual([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7,
    ]);
  });

  it('masks each action to 10 bits', () => {
    const actions = [...Array(11).fill(0), 0x400 | 5];
    expect(deserializeActions(serializeActions(actions))[11]).toBe(5);
  });

  it('always deserializes to exactly 12 actions', () => {
    expect(deserializeActions(0n)).toHaveLength(12);
  });
});

describe('parseChordActions / stringifyChordActions', () => {
  it('stringifies to 32 uppercase hex characters', () => {
    const text = stringifyChordActions([0, 0, 0, 0, 0, 0, 0, 0, 0, 97, 98, 99]);
    expect(text).toMatch(/^[0-9A-F]{32}$/);
    expect(text).toBe('0018C621840000000000000000000000');
  });

  it('pads small values with leading zeros', () => {
    expect(stringifyChordActions([])).toBe('0'.repeat(32));
  });

  it('round-trips', () => {
    const actions = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8];
    expect(parseChordActions(stringifyChordActions(actions))).toEqual(actions);
  });
});

describe('hashChord', () => {
  // Expected values were computed with an independent Python implementation
  // of the same algorithm (FNV-1a over the 16 little-endian bytes of the
  // serialized actions, then CCOS-style masking).
  it.each([
    [[0, 0, 0, 0, 0, 0, 0, 0, 0, 97, 98, 99], 563755250],
    [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 97], 528534637],
    [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], 594429066],
    [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 694753541],
  ])('hashes %j to %i', (actions, expected) => {
    expect(hashChord(actions)).toBe(expected);
  });

  it('clears the low byte when it would be 0xff', () => {
    // Raw FNV-1a value for this input is 0x253293ff.
    expect(hashChord([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 104])).toBe(624071424);
  });

  it('always fits in 30 bits and never ends in 0xff', () => {
    for (let k = 1; k < 1024; k++) {
      const hash = hashChord([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, k]);
      expect(hash).toBeGreaterThanOrEqual(0);
      expect(hash).toBeLessThanOrEqual(0x3fffffff);
      expect(hash & 0xff).not.toBe(0xff);
    }
  });

  it('is deterministic and distinguishes different inputs', () => {
    const a = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 97, 98];
    const b = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 97, 99];
    expect(hashChord(a)).toBe(hashChord([...a]));
    expect(hashChord(a)).not.toBe(hashChord(b));
  });
});
