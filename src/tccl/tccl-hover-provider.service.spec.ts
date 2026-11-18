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

  // Monaco columns are 1-based: column N is the position before the character
  // at (0-based) index N - 1, and the hover position is the start of the
  // hovered character.
  it('reports the range of the hovered token using 1-based columns', () => {
    const hover = provider.provideHover(model('<559> + a = x'), pos(2)) as {
      range: object;
    };
    // "<559>" occupies indices 0-4, i.e. columns 1-5 (endColumn is exclusive).
    expect(hover.range).toEqual({
      startLineNumber: 1,
      endLineNumber: 1,
      startColumn: 1,
      endColumn: 6,
    });
  });

  it('reports the range of a token that does not start the line', () => {
    const line = 'a + b = <559>x'; // "<559>" occupies indices 8-12
    const hover = provider.provideHover(model(line), pos(10)) as {
      range: object;
    };
    expect(hover.range).toEqual({
      startLineNumber: 1,
      endLineNumber: 1,
      startColumn: 9,
      endColumn: 14,
    });
  });

  // Every character of the token must show the hover, including the first and
  // the last one, and no neighbouring character may.
  it.each([
    ['<559> + a = x', 0, 4], // "<559>" at indices 0-4
    ['a + b = <559>x', 8, 12], // "<559>" at indices 8-12
  ])('shows the hover for exactly the characters of the token in %j', (line, first, last) => {
    for (let index = 0; index < line.length; index++) {
      const hover = provider.provideHover(model(line), pos(index + 1));
      const inside = index >= first && index <= last;
      expect({ index, hovered: hover !== null }).toEqual({
        index,
        hovered: inside,
      });
    }
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

  // Most actions in tangent-cc-lib@0.0.17 have no title/description.
  it('does not print "undefined" for actions without a description', () => {
    const noDescription = ACTIONS.find(
      (a) => !(a as { description?: string }).description,
    );
    expect(noDescription).toBeDefined();
    const code = noDescription?.codeId as number;
    const hover = provider.provideHover(
      model(`<${code}> + a = x`),
      pos(2),
    ) as { contents: { value: string }[] };
    const value = hover.contents[0].value;
    expect(value).not.toContain('undefined');
    expect(value).toMatch(new RegExp(`^\\*\\*Action Code ${code}.*\\*\\*$`));
  });

  it('puts the description below the header when there is one', () => {
    const described = ACTIONS.find(
      (a) => (a as { description?: string }).description,
    );
    expect(described).toBeDefined();
    const code = described?.codeId as number;
    const hover = provider.provideHover(
      model(`<${code}> + a = x`),
      pos(2),
    ) as { contents: { value: string }[] };
    expect(hover.contents[0].value).toContain(
      `\n\n${(described as { description?: string }).description}`,
    );
  });
});
