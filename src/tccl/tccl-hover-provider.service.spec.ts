import { TestBed } from '@angular/core/testing';
import type { editor, Position } from 'monaco-editor';
import { ACTIONS } from 'tangent-cc-lib';
import { TcclHoverProvider } from './tccl-hover-provider.service';

const model = (line: string) =>
  ({ getLineContent: () => line }) as unknown as editor.ITextModel;
const pos = (column: number) => ({ lineNumber: 1, column }) as Position;

describe('TcclHoverProvider', () => {
  let provider: TcclHoverProvider;

  beforeEach(() => {
    provider = TestBed.inject(TcclHoverProvider);
  });

  // 559 is one of the few actions that carries a title and a description in
  // tangent-cc-lib@0.0.17.
  const action559 = ACTIONS.find((a) => a.codeId === 559);

  it('relies on action 559 having a title and description', () => {
    expect(action559).toMatchObject({
      title: 'Base Library',
      actionName: 'ReleaseCompound',
    });
    expect((action559 as { description?: string }).description).toBeTruthy();
  });

  it('shows the action title, name and description for <code> tokens', () => {
    const hover = provider.provideHover(model('<559> + a = x'), pos(2)) as {
      contents: { value: string }[];
    };
    expect(hover.contents).toEqual([
      {
        value: `**Action Code 559: Base Library (ReleaseCompound)**\n\n${
          (action559 as unknown as { description: string }).description
        }`,
      },
    ]);
  });

  it('works for <code> tokens in the output too', () => {
    const hover = provider.provideHover(
      model('a + b = <559>x'),
      pos(10),
    ) as { contents: { value: string }[] };
    expect(hover.contents[0].value).toContain('Action Code 559');
  });

  it('reports the range of the hovered token on that line', () => {
    const hover = provider.provideHover(model('<559> + a = x'), pos(2)) as {
      range: object;
    };
    // The range uses the lexer's 0-based start index as startColumn.
    expect(hover.range).toEqual({
      startLineNumber: 1,
      endLineNumber: 1,
      startColumn: 0,
      endColumn: 5,
    });
  });

  it('returns null when hovering over a plain key', () => {
    expect(provider.provideHover(model('a + b = x'), pos(1))).toBeNull();
  });

  it('returns null when hovering over a separator', () => {
    expect(provider.provideHover(model('<559> + a = x'), pos(7))).toBeNull();
  });

  it('returns null for an unknown action code', () => {
    expect(provider.provideHover(model('<99999> + a = x'), pos(2))).toBeNull();
  });

  it('returns null for an empty line', () => {
    expect(provider.provideHover(model(''), pos(1))).toBeNull();
  });

  // KNOWN GAP (see TEST_TODO.md): most actions in tangent-cc-lib@0.0.17 have no
  // title/description, so the hover text contains the literal "undefined".
  it('currently prints "undefined" for actions without a description', () => {
    const noDescription = ACTIONS.find(
      (a) => !(a as { description?: string }).description,
    );
    expect(noDescription).toBeDefined();
    const code = noDescription?.codeId as number;
    const hover = provider.provideHover(
      model(`<${code}> + a = x`),
      pos(2),
    ) as { contents: { value: string }[] };
    expect(hover.contents[0].value).toMatch(/\n\nundefined$/);
  });
});
