import { compressActions, decompressActions } from './action.util';

describe('compressActions', () => {
  it('encodes codes up to 0xff as a single byte', () => {
    expect([...compressActions([65, 66, 255])]).toEqual([65, 66, 255]);
  });

  it('encodes codes above 0xff as two bytes (high byte first)', () => {
    // 544 = 0x220
    expect([...compressActions([544])]).toEqual([0x02, 0x20]);
  });

  it('mixes single and double byte codes', () => {
    expect([...compressActions([97, 544, 98])]).toEqual([97, 0x02, 0x20, 98]);
  });

  it('returns an empty array for no actions', () => {
    expect(compressActions([]).length).toBe(0);
  });
});

describe('decompressActions', () => {
  it('decodes single byte codes', () => {
    expect(decompressActions(Uint8Array.from([65, 66]))).toEqual([65, 66]);
  });

  it('combines a leading byte in 1..31 with the following byte', () => {
    expect(decompressActions(Uint8Array.from([0x02, 0x20]))).toEqual([544]);
  });

  it('keeps 0 as a plain action', () => {
    expect(decompressActions(Uint8Array.from([0, 65]))).toEqual([0, 65]);
  });

  it('keeps a trailing byte in 1..31 as-is when no byte follows', () => {
    expect(decompressActions(Uint8Array.from([65, 0x02]))).toEqual([65, 2]);
  });

  it('returns an empty array for empty input', () => {
    expect(decompressActions(new Uint8Array())).toEqual([]);
  });
});

describe('compressActions / decompressActions round trip', () => {
  it.each([
    [[97, 98, 99]],
    [[97, 544, 98]],
    [[300, 559, 558, 32]],
    [[0x3ff, 0x100, 0xff, 32]],
  ])('round-trips %j', (actions) => {
    expect(decompressActions(compressActions(actions))).toEqual(actions);
  });
});
