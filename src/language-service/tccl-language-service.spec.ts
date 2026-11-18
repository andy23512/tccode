import type { Position } from 'monaco-editor';
import { BOPOMOFO_CHORD_MAP } from '../data/bopomofo.const';
import type { TcclError } from './tccl-error-listener';
import { TcclLanguageService } from './tccl-language-service';

const service = new TcclLanguageService();
const OFF = { detectConflictsWithBopomofoChords: false };
const ON = { detectConflictsWithBopomofoChords: true };

const at = (lineNumber: number, column: number) =>
  ({ lineNumber, column }) as Position;

describe('TcclLanguageService.validate', () => {
  it('returns no errors for a valid file', () => {
    expect(service.validate('a + b = ab\nc + d = cd\n', OFF)).toEqual([]);
  });

  it('returns no errors for an empty file', () => {
    expect(service.validate('', OFF)).toEqual([]);
  });

  it('includes syntax errors from the parser', () => {
    const errors = service.validate('a = b\n', OFF);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({
      code: '1',
      severity: 'error',
      startLineNumber: 1,
    });
  });

  describe('duplicated chord inputs', () => {
    it('reports every chord that shares the same input', () => {
      const errors = service.validate('a + b = x\nc + d = y\na + b = z\n', OFF);
      expect(errors).toHaveLength(2);
      expect(errors.map((e) => e.startLineNumber)).toEqual([1, 3]);
      for (const error of errors) {
        expect(error).toMatchObject({
          code: 'DUPLICATED_CHORD_INPUT',
          severity: 'error',
          message: 'Multiple chords with same chord input path are detected.',
        });
      }
    });

    it('ignores the order of the input keys', () => {
      const errors = service.validate('a + b = x\nb + a = y\n', OFF);
      expect(errors.map((e) => e.code)).toEqual([
        'DUPLICATED_CHORD_INPUT',
        'DUPLICATED_CHORD_INPUT',
      ]);
    });

    it('is case sensitive', () => {
      expect(service.validate('a + b = x\nA + b = y\n', OFF)).toEqual([]);
    });

    it('does not treat a subset of keys as a duplicate', () => {
      expect(service.validate('a + b = x\na + b + c = y\n', OFF)).toEqual([]);
    });

    it('does not report chords with different inputs', () => {
      expect(service.validate('a + b = x\nc + d = x\n', OFF)).toEqual([]);
    });

    it('reports a range that spans the chord input', () => {
      const [first, second] = service.validate('a + b = x\nb + a = y\n', OFF);
      // 1-based columns; endColumn is one past the last input key.
      expect(first).toMatchObject({
        startLineNumber: 1,
        endLineNumber: 1,
        startColumn: 1,
        endColumn: 6,
      });
      expect(second).toMatchObject({
        startLineNumber: 2,
        endLineNumber: 2,
        startColumn: 1,
        endColumn: 6,
      });
    });

    it('does not depend on the Bopomofo option', () => {
      expect(service.validate('a + b = x\nb + a = y\n', ON)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ code: 'DUPLICATED_CHORD_INPUT' }),
        ]),
      );
    });
  });

  describe('Bopomofo chord conflicts', () => {
    it('relies on a known Bopomofo chord for the tests below', () => {
      expect(BOPOMOFO_CHORD_MAP.get('a\tw')).toBe('ㄅㄧ');
    });

    it('is not reported when the option is off', () => {
      expect(service.validate('a + w = x\n', OFF)).toEqual([]);
    });

    it('is reported as a warning when the option is on', () => {
      const errors = service.validate('a + w = x\n', ON);
      expect(errors).toEqual([
        {
          code: 'BPMF_CHORD_CONFLICT',
          severity: 'warning',
          message: 'This chord conflicts with Bopomofo chord 「ㄅㄧ」.',
          startLineNumber: 1,
          endLineNumber: 1,
          startColumn: 1,
          endColumn: 6,
        },
      ]);
    });

    it('ignores the order of the input keys', () => {
      const errors = service.validate('w + a = x\n', ON);
      expect(errors.map((e) => e.code)).toEqual(['BPMF_CHORD_CONFLICT']);
    });

    it('does not report non-conflicting chords', () => {
      // Pre-condition: neither combination is a Bopomofo chord.
      expect(BOPOMOFO_CHORD_MAP.has('1\t2')).toBe(false);
      expect(service.validate('1 + 2 = x\n', ON)).toEqual([]);
    });

    it('can be reported together with duplicated inputs', () => {
      const errors = service.validate('a + w = x\nw + a = y\n', ON);
      expect(
        errors.filter((e) => e.code === 'DUPLICATED_CHORD_INPUT'),
      ).toHaveLength(2);
      expect(
        errors.filter((e) => e.code === 'BPMF_CHORD_CONFLICT'),
      ).toHaveLength(2);
    });
  });

  describe('nested chords', () => {
    const codes = (text: string, opts = OFF) =>
      service.validate(text, opts).map((e) => `${e.code}@${e.startLineNumber}`);

    it('detects duplicated inputs among siblings of the same parent', () => {
      expect(codes('a + b = x\n  c + d = y\n  d + c = z\n')).toEqual([
        'DUPLICATED_CHORD_INPUT@2',
        'DUPLICATED_CHORD_INPUT@3',
      ]);
    });

    it('underlines exactly the nested chord input', () => {
      const text = 'a + b = x\n  c + d = y\n  d + c = z\n';
      expect(
        service.validate(text, OFF).map((e) => underlined(text, e)),
      ).toEqual(['c + d', 'd + c']);
    });

    it('does not report the same input under different parents', () => {
      expect(codes('a + b = x\n  c + d = y\ne + f = z\n  c + d = w\n')).toEqual(
        [],
      );
    });

    it('does not report a nested chord equal to its parent', () => {
      expect(codes('a + b = x\n  a + b = y\n')).toEqual([]);
    });

    it('detects duplicates at deeper levels', () => {
      expect(
        codes('a + b = x\n  c + d = y\n    e + f = 1\n    f + e = 2\n'),
      ).toEqual(['DUPLICATED_CHORD_INPUT@3', 'DUPLICATED_CHORD_INPUT@4']);
    });

    it('also reports the children of duplicated parents', () => {
      // Errors are grouped by chord path, so compare the set of lines.
      expect(
        codes('a + b = x\n  c + d = y\nb + a = z\n  c + d = w\n').sort(),
      ).toEqual([
        'DUPLICATED_CHORD_INPUT@1',
        'DUPLICATED_CHORD_INPUT@2',
        'DUPLICATED_CHORD_INPUT@3',
        'DUPLICATED_CHORD_INPUT@4',
      ]);
    });

    // A nested chord only applies after its parent, so it is not compared with
    // the (top-level) Bopomofo chords. See TEST_TODO.md.
    it('does not check nested chords against Bopomofo chords', () => {
      expect(service.validate('c + d = x\n  a + w = y\n', ON)).toEqual([]);
    });

    it('still checks top-level chords against Bopomofo chords', () => {
      expect(codes('c + d = x\n  e + f = y\na + w = z\n', ON)).toEqual([
        'BPMF_CHORD_CONFLICT@3',
      ]);
    });
  });
});

describe('TcclLanguageService.autoComplete', () => {
  const values = (code: string, line: number, column: number) =>
    service
      .autoComplete(code, at(line, column))
      .map((item) => item.value)
      .sort();

  it('returns nothing for an empty file', () => {
    expect(values('', 1, 1)).toEqual([]);
  });

  it('suggests the input separator after a first key', () => {
    expect(values('a ', 1, 2)).toEqual([' + ']);
  });

  it('suggests both separators after at least two input keys', () => {
    expect(values('a + b ', 1, 6)).toEqual([' + ', ' = ']);
  });

  it('suggests on later lines too', () => {
    expect(values('a + b = x\nc ', 2, 2)).toEqual([' + ']);
  });

  it('returns nothing when the caret is not on any token', () => {
    expect(values('a + b = x\n', 5, 5)).toEqual([]);
  });

  it('returns nothing directly after the last key without a separator', () => {
    expect(values('a + b', 1, 5)).toEqual([]);
  });

  it('returns items with a string value and a completion kind', () => {
    const [item] = service.autoComplete('a ', at(1, 2));
    expect(typeof item.value).toBe('string');
    expect(typeof item.optionType).toBe('number');
  });
});

// The completion provider passes the text up to the caret, and the caret
// position, so in real use the caret column is always the text length + 1.
describe('TcclLanguageService.autoComplete as called by the completion provider', () => {
  const atCaret = (text: string) => {
    const lines = text.split('\n');
    return service
      .autoComplete(text, at(lines.length, lines[lines.length - 1].length + 1))
      .map((item) => item.value)
      .sort();
  };

  it.each([
    ['a', [' + ']],
    ['a ', [' + ']],
    ['a + b', [' + ', ' = ']],
    ['a + b ', [' + ', ' = ']],
    ['a + b = x\nc', [' + ']],
    ['a + b = x\nc ', [' + ']],
    ['a + b = x\nc + d ', [' + ', ' = ']],
  ])('suggests the next separator after %j', (text, expected) => {
    expect(atCaret(text)).toEqual([...expected].sort());
  });

  it('suggests no separator where a key is expected (after " + ")', () => {
    expect(atCaret('a + ')).toEqual([]);
  });

  it('suggests nothing inside the output', () => {
    expect(atCaret('a + b = x')).toEqual([]);
  });
});

// What Monaco would underline for a marker: columns are 1-based, endColumn is
// exclusive, and columns below 1 are clamped to 1 (TextModel._validatePosition).
function underlined(text: string, error: TcclError): string {
  const line = text.split('\n')[error.startLineNumber - 1] ?? '';
  return line.slice(Math.max(error.startColumn, 1) - 1, error.endColumn - 1);
}

describe('diagnostic ranges as Monaco renders them', () => {
  it('underline the whole chord input for a duplicated chord', () => {
    const text = 'a + b = x\nb + a = y\n';
    expect(service.validate(text, OFF).map((e) => underlined(text, e))).toEqual(
      ['a + b', 'b + a'],
    );
  });

  it('underline the whole chord input for a Bopomofo conflict', () => {
    const text = 'a + w = x\n';
    expect(service.validate(text, ON).map((e) => underlined(text, e))).toEqual([
      'a + w',
    ]);
  });

  it('underline the offending character of a syntax error', () => {
    const text = 'a + b = @\n';
    const [error] = service.validate(text, OFF);
    expect(text[8]).toBe('@');
    expect(underlined(text, error)).toBe('@');
  });

  // ANTLR reports the start of the unexpected token. In "a = b" the parser
  // wanted " + " after "a", so the error is at the space (index 1) that starts
  // " = "; likewise the spaces after "c" and "d" in "c d = y".
  it.each([
    ['a = b\n', [1]],
    ['a + b = x\nc d = y\n', [1, 3]],
  ])('underline the start of the unexpected token in %j', (text, indices) => {
    const lines = text.split('\n');
    const errors = service.validate(text, OFF);
    expect(errors.map((e) => underlined(text, e))).toEqual(
      indices.map((i, n) => lines[errors[n].startLineNumber - 1][i]),
    );
    expect(errors.map((e) => e.startColumn - 1)).toEqual(indices);
  });
});
