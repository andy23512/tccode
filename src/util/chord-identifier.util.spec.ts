import { convertChordInputKeysToIdentifier } from './chord-identifier.util';
import { cos, sin } from './math.util';

describe('convertChordInputKeysToIdentifier', () => {
  it('sorts keys and joins them with tabs', () => {
    expect(convertChordInputKeysToIdentifier(['c', 'a', 'b'])).toBe('a\tb\tc');
  });

  it('gives the same identifier regardless of input order', () => {
    expect(convertChordInputKeysToIdentifier(['x', 'y'])).toBe(
      convertChordInputKeysToIdentifier(['y', 'x']),
    );
  });

  it('does not mutate the input array', () => {
    const keys = ['b', 'a'];
    convertChordInputKeysToIdentifier(keys);
    expect(keys).toEqual(['b', 'a']);
  });

  it('handles an empty list', () => {
    expect(convertChordInputKeysToIdentifier([])).toBe('');
  });
});

describe('sin / cos (degrees)', () => {
  it('computes known angles', () => {
    expect(sin(0)).toBeCloseTo(0);
    expect(sin(90)).toBeCloseTo(1);
    expect(sin(180)).toBeCloseTo(0);
    expect(cos(0)).toBeCloseTo(1);
    expect(cos(90)).toBeCloseTo(0);
    expect(cos(180)).toBeCloseTo(-1);
  });
});
