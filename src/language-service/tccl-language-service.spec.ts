import type { Position } from 'monaco-editor';
import { BOPOMOFO_CHORD_MAP } from '../data/bopomofo.const';
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
      // ANTLR columns are 0-based; endColumn is one past the last input key.
      expect(first).toMatchObject({
        startLineNumber: 1,
        endLineNumber: 1,
        startColumn: 0,
        endColumn: 6,
      });
      expect(second).toMatchObject({
        startLineNumber: 2,
        endLineNumber: 2,
        startColumn: 0,
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
          startColumn: 0,
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
      expect(errors.filter((e) => e.code === 'DUPLICATED_CHORD_INPUT')).toHaveLength(2);
      expect(errors.filter((e) => e.code === 'BPMF_CHORD_CONFLICT')).toHaveLength(2);
    });
  });

  // KNOWN GAP (see TEST_TODO.md): the semantic visitor overrides
  // visitChordNode without visiting children, so only top-level chords are
  // checked. These tests record the current behavior, not the intended one.
  describe('nested chords (current behavior)', () => {
    it('does not detect duplicated inputs among siblings of the same parent', () => {
      expect(
        service.validate('a + b = x\n  c + d = y\n  d + c = z\n', OFF),
      ).toEqual([]);
    });

    it('does not detect Bopomofo conflicts on nested chords', () => {
      expect(service.validate('c + d = x\n  a + w = y\n', ON)).toEqual([]);
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

  it('suggests the input separator after "+"', () => {
    expect(values('a + ', 1, 4)).toEqual([' + ']);
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
