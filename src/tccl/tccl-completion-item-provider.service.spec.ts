import { TestBed } from '@angular/core/testing';
import type { editor, Position } from 'monaco-editor';
import { TcclCompletionItemProviderService } from './tccl-completion-item-provider.service';
import { TcclWorkerAccessorService } from './tccl-worker-accessor.service';

jest.mock('monaco-editor', () => ({
  Range: class {
    constructor(
      public startLineNumber: number,
      public startColumn: number,
      public endLineNumber: number,
      public endColumn: number,
    ) {}
  },
}));

const range = (
  startLineNumber: number,
  startColumn: number,
  endLineNumber: number,
  endColumn: number,
) => expect.objectContaining({ startLineNumber, startColumn, endLineNumber, endColumn });

describe('TcclCompletionItemProviderService', () => {
  const getSuggestions = jest.fn();
  const getWorker = jest.fn();
  let provider: TcclCompletionItemProviderService;

  const lines = ['a + b = x', 'c  '];
  const uri = { toString: () => 'file://test' };
  const model = {
    uri,
    getValueInRange: (r: {
      startLineNumber: number;
      startColumn: number;
      endLineNumber: number;
      endColumn: number;
    }) => {
      // Minimal implementation of ITextModel.getValueInRange for the test text.
      const picked: string[] = [];
      for (let n = r.startLineNumber; n <= r.endLineNumber; n++) {
        const line = lines[n - 1];
        const from = n === r.startLineNumber ? r.startColumn - 1 : 0;
        const to = n === r.endLineNumber ? r.endColumn - 1 : line.length;
        picked.push(line.slice(from, to));
      }
      return picked.join('\n');
    },
  } as unknown as editor.ITextModel;
  const pos = (lineNumber: number, column: number) =>
    ({ lineNumber, column }) as Position;

  beforeEach(() => {
    getSuggestions.mockReset().mockResolvedValue([]);
    getWorker.mockReset().mockResolvedValue({ getSuggestions });
    TestBed.configureTestingModule({
      providers: [
        { provide: TcclWorkerAccessorService, useValue: { getWorker } },
      ],
    });
    provider = TestBed.inject(TcclCompletionItemProviderService);
  });

  it('triggers on space and on ASCII letters', () => {
    expect(provider.triggerCharacters).toContain(' ');
    expect(provider.triggerCharacters).toContain('a');
    expect(provider.triggerCharacters).toContain('Z');
    expect(provider.triggerCharacters).toHaveLength(1 + 26 + 26);
  });

  it('asks the worker for the model resource', async () => {
    await provider.provideCompletionItems(model, pos(1, 3));
    expect(getWorker).toHaveBeenCalledWith(uri);
  });

  it('sends the text from the document start up to the caret', async () => {
    await provider.provideCompletionItems(model, pos(2, 3));
    expect(getSuggestions).toHaveBeenCalledWith('a + b = x\nc ', pos(2, 3));
  });

  it('returns an empty complete list when there are no suggestions', async () => {
    expect(await provider.provideCompletionItems(model, pos(1, 3))).toEqual({
      incomplete: false,
      suggestions: [],
    });
  });

  it('maps worker suggestions to completion items', async () => {
    getSuggestions.mockResolvedValue([{ value: ' + ', optionType: 11 }]);
    // Line 1 is "a + b = x"; the text before column 2 is "a" (no trailing space).
    const result = await provider.provideCompletionItems(model, pos(1, 2));
    expect(result.incomplete).toBe(false);
    expect(result.suggestions).toEqual([
      {
        label: ' + ',
        kind: 11,
        insertText: ' + ',
        range: range(1, 2, 1, 2),
      },
    ]);
  });

  it('replaces a single space typed right before the caret', async () => {
    getSuggestions.mockResolvedValue([{ value: ' + ', optionType: 11 }]);
    // The text before column 3 is "a " (one trailing space).
    const result = await provider.provideCompletionItems(model, pos(1, 3));
    expect(result.suggestions[0].range).toEqual(range(1, 2, 1, 3));
  });

  it('replaces the spaces typed before the caret', async () => {
    getSuggestions.mockResolvedValue([{ value: ' + ', optionType: 11 }]);
    // Line 2 is "c  ": two spaces end at the caret in column 4.
    const result = await provider.provideCompletionItems(model, pos(2, 4));
    expect(result.suggestions[0].range).toEqual(range(2, 2, 2, 4));
  });
});
