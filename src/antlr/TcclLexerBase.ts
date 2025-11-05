import { CharStream, CommonToken, Lexer, Token } from 'antlr4ng';
import { TcclParser } from './TcclParser';

export abstract class TcclLexerBase extends Lexer {
  tokens: any[];
  indents: any[];
  opened: number;

  constructor(input: CharStream) {
    super(input);
    this.tokens = [];
    this.indents = [];
    this.opened = 0;
  }

  reset() {
    // A queue where extra tokens are pushed on (see the NEWLINE lexer rule).
    this.tokens = [];

    // The stack that keeps track of the indentation level.
    this.indents = [];

    // The amount of opened braces, brackets and parenthesis.
    this.opened = 0;

    super.reset();
  }

  emitToken(token: Token) {
    super.emitToken(token);
    this.tokens.push(token);
  }

  nextToken() {
    // Check if the end-of-file is ahead and there are still some DEDENTS expected.
    if (this['input'].LA(1) === TcclParser.EOF && this.indents.length) {
      // Remove any trailing EOF tokens from our buffer.
      this.tokens = this.tokens.filter(function (val) {
        return val.type !== TcclParser.EOF;
      });
      // First emit an extra line break that serves as the end of the statement.
      this.emitToken(this.commonToken(TcclParser.NEWLINE, '\n'));
      // Now emit as much DEDENT tokens as needed.
      while (this.indents.length) {
        this.emitToken(this.createDedent());
        this.indents.pop();
      }
      // Put the EOF back on the token stream.
      this.emitToken(this.commonToken(TcclParser.EOF, '<EOF>'));
    }
    const next = super.nextToken();
    return this.tokens.length ? this.tokens.shift() : next;
  }

  createDedent() {
    return this.commonToken(TcclParser.DEDENT, '');
  }

  getCharIndex() {
    return this['input'].index;
  }

  commonToken(type: number, text: string) {
    const stop = this.getCharIndex() - 1;
    const start = text.length ? stop - text.length + 1 : stop;
    return CommonToken.fromSource([this, this['input']], type, 0, start, stop);
  }

  getIndentationCount(whitespace: string) {
    let count = 0;
    for (let i = 0; i < whitespace.length; i++) {
      if (whitespace[i] === '\t') {
        count += 8 - (count % 8);
      } else {
        count++;
      }
    }
    return count;
  }

  atStartOfInput() {
    return this.getCharIndex() === 0;
  }

  openBrace() {
    this.opened++;
  }

  closeBrace() {
    this.opened--;
  }

  onNewLine() {
    const newLine = this.text.replace(/[^\r\n]+/g, '');
    const spaces = this.text.replace(/[\r\n]+/g, '');

    // Strip newlines inside open clauses except if we are near EOF. We keep NEWLINEs near EOF to
    // satisfy the final newline needed by the single_put rule used by the REPL.
    const next = this['input'].LA(1);
    const nextnext = this['input'].LA(2);
    if (
      this.opened > 0 ||
      (nextnext != -1 /* EOF */ &&
        (next === 13 /* '\r' */ ||
          next === 10 /* '\n' */ ||
          next === 35)) /* '#' */
    ) {
      // If we're inside a list or on a blank line, ignore all indents,
      // dedents and line breaks.
      this.skip();
    } else {
      this.emitToken(this.commonToken(TcclParser.NEWLINE, newLine));

      const indent = this.getIndentationCount(spaces);
      const previous = this.indents.length
        ? this.indents[this.indents.length - 1]
        : 0;

      if (indent === previous) {
        // skip indents of the same size as the present indent-size
        this.skip();
      } else if (indent > previous) {
        this.indents.push(indent);
        this.emitToken(this.commonToken(TcclParser.INDENT, spaces));
      } else {
        // Possibly emit more than 1 DEDENT token.
        while (
          this.indents.length &&
          this.indents[this.indents.length - 1] > indent
        ) {
          this.emitToken(this.createDedent());
          this.indents.pop();
        }
      }
    }
  }
}
