import { TcclLexer } from '../antlr/TcclLexer';
import { TcclParser } from '../antlr/TcclParser';
import { TcclErrorListener } from './tccl-error-listener';
import {
  createLexer,
  getParser,
  getTokenStream,
  parseTccl,
} from './tccl-parser';

describe('parseTccl', () => {
  it('parses a valid file without errors', () => {
    const { ast, errors } = parseTccl('a + b = ab\nc + d = c d\n');
    expect(errors).toEqual([]);
    expect(ast.chordNode()).toHaveLength(2);
  });

  it('exposes the chord input keys and output keys', () => {
    const { ast } = parseTccl('a + b + C = x y\n');
    const chord = ast.chordNode()[0].chord();
    expect(
      chord
        .chordInput()
        .CHORD_INPUT_KEY()
        .map((k) => k.getText()),
    ).toEqual(['a', 'b', 'C']);
    expect(
      chord
        .chordOutput()
        .CHORD_OUTPUT_KEY()
        .map((k) => k.getText()),
    ).toEqual(['x', ' ', 'y']);
  });

  it('accepts <code> notation in both input and output', () => {
    const { ast, errors } = parseTccl('<559> + a = <559>b\n');
    expect(errors).toEqual([]);
    const chord = ast.chordNode()[0].chord();
    expect(chord.chordInput().CHORD_INPUT_KEY()[0].getText()).toBe('<559>');
    expect(chord.chordOutput().CHORD_OUTPUT_KEY()[0].getText()).toBe('<559>');
  });

  it('nests indented chords under their parent', () => {
    const { ast, errors } = parseTccl(
      'a + b = ab\n  c + d = cd\n    e + f = ef\n',
    );
    expect(errors).toEqual([]);
    const [parent] = ast.chordNode();
    expect(parent.chordNode()).toHaveLength(1);
    expect(parent.chordNode()[0].chordNode()).toHaveLength(1);
  });

  it('keeps siblings on the same indentation level together', () => {
    const { ast, errors } = parseTccl('a + b = ab\n  c + d = cd\n  e + f = ef\n');
    expect(errors).toEqual([]);
    expect(ast.chordNode()).toHaveLength(1);
    expect(ast.chordNode()[0].chordNode()).toHaveLength(2);
  });

  it('closes nested levels when the indentation decreases', () => {
    const { ast, errors } = parseTccl(
      'a + b = ab\n  c + d = cd\n    e + f = ef\ng + h = gh\n',
    );
    expect(errors).toEqual([]);
    expect(ast.chordNode()).toHaveLength(2);
  });

  it('handles CRLF line endings', () => {
    const { ast, errors } = parseTccl('a + b = x\r\nc + d = y\r\n');
    expect(errors).toEqual([]);
    expect(ast.chordNode()).toHaveLength(2);
  });

  it('parses an empty file without errors', () => {
    const { ast, errors } = parseTccl('');
    expect(errors).toEqual([]);
    expect(ast.chordNode()).toHaveLength(0);
  });

  it('requires a trailing newline after the last chord', () => {
    expect(parseTccl('a + b = x\nc + d = y').errors).not.toHaveLength(0);
  });

  it('requires at least two input keys', () => {
    const { errors } = parseTccl('a = b\n');
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain("expecting ' + '");
  });

  it('reports lexer errors for unsupported characters', () => {
    const { errors } = parseTccl('a + b = @\n');
    expect(errors.some((e) => e.message.includes("token recognition error at: '@'"))).toBe(true);
  });

  it('reports errors as ERROR severity with code "1"', () => {
    const { errors } = parseTccl('a = b\n');
    expect(errors[0]).toMatchObject({ code: '1', severity: 'error' });
  });

  it('does not leak errors between calls', () => {
    parseTccl('a = b\n');
    expect(parseTccl('a + b = c\n').errors).toEqual([]);
  });
});

describe('parser helpers', () => {
  it('createLexer returns a TcclLexer over the given code', () => {
    const lexer = createLexer('a + b = c\n');
    expect(lexer).toBeInstanceOf(TcclLexer);
    expect(lexer.nextToken().text).toBe('a');
  });

  it('getTokenStream / getParser produce a usable parser', () => {
    const parser = getParser(getTokenStream('a + b = c\n'));
    expect(parser).toBeInstanceOf(TcclParser);
    expect(parser.tcclFile().chordNode()).toHaveLength(1);
  });
});

describe('TcclErrorListener', () => {
  it('starts with no errors', () => {
    expect(new TcclErrorListener().getErrors()).toEqual([]);
  });

  it('records syntax errors as single-character, single-line ranges', () => {
    const listener = new TcclErrorListener();
    listener.syntaxError({} as never, null, 3, 7, 'boom', null);
    expect(listener.getErrors()).toEqual([
      {
        startLineNumber: 3,
        endLineNumber: 3,
        startColumn: 7,
        endColumn: 8,
        message: 'boom',
        code: '1',
        severity: 'error',
      },
    ]);
  });

  it('accumulates errors in order', () => {
    const listener = new TcclErrorListener();
    listener.syntaxError({} as never, null, 1, 0, 'first', null);
    listener.syntaxError({} as never, null, 2, 0, 'second', null);
    expect(listener.getErrors().map((e) => e.message)).toEqual([
      'first',
      'second',
    ]);
  });
});
