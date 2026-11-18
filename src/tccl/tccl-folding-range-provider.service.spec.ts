import { TestBed } from '@angular/core/testing';
import type { editor } from 'monaco-editor';
import { TcclFoldingRangeProviderService } from './tccl-folding-range-provider.service';

jest.mock('monaco-editor', () => ({
  languages: { FoldingRangeKind: { Region: { value: 'region' } } },
}));

const model = (text: string) => {
  const lines = text.split('\n');
  return {
    getLineCount: () => lines.length,
    getLineContent: (n: number) => lines[n - 1],
  } as unknown as editor.ITextModel;
};

describe('TcclFoldingRangeProviderService', () => {
  let service: TcclFoldingRangeProviderService;
  const fold = (text: string) =>
    (service.provideFoldingRanges(model(text)) as { start: number; end: number }[]).map(
      ({ start, end }) => [start, end],
    );

  beforeEach(() => {
    service = TestBed.inject(TcclFoldingRangeProviderService);
  });

  it('returns no ranges for a flat file', () => {
    expect(fold('a + b = x\nc + d = y\ne + f = z')).toEqual([]);
  });

  it('folds an indented child under its parent', () => {
    expect(fold('a + b = x\n  c + d = y')).toEqual([[1, 2]]);
  });

  it('extends the range over all deeper lines', () => {
    expect(fold('a + b = x\n  c + d = y\n  e + f = z\ng + h = w')).toEqual([
      [1, 3],
    ]);
  });

  it('creates nested ranges for nested levels', () => {
    expect(fold('a + b = x\n  c + d = y\n    e + f = z\ng + h = w')).toEqual([
      [1, 3],
      [2, 3],
    ]);
  });

  it('creates one range per parent', () => {
    expect(
      fold('a + b = x\n  c + d = y\ne + f = z\n  g + h = w'),
    ).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it('does not include trailing empty lines in the range', () => {
    expect(fold('a + b = x\n  c + d = y\n\n\ne + f = z')).toEqual([[1, 2]]);
  });

  it('skips empty lines inside a block', () => {
    expect(fold('a + b = x\n  c + d = y\n\n  e + f = z')).toEqual([[1, 4]]);
  });

  it('marks ranges as regions', () => {
    const ranges = service.provideFoldingRanges(
      model('a + b = x\n  c + d = y'),
    ) as { kind: unknown }[];
    expect(ranges[0].kind).toEqual({ value: 'region' });
  });

  it('handles an empty model', () => {
    expect(fold('')).toEqual([]);
  });
});
