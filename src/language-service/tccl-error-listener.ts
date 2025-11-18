import {
  ANTLRErrorListener,
  ATNConfigSet,
  BitSet,
  DFA,
  Parser,
  Recognizer,
} from 'antlr4ng';

export interface TcclError {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
  message: string;
  code: string;
  severity: 'warning' | 'error';
}

export class TcclErrorListener implements ANTLRErrorListener {
  reportAmbiguity(
    recognizer: Parser,
    dfa: DFA,
    startIndex: number,
    stopIndex: number,
    exact: boolean,
    ambigAlts: BitSet | undefined,
    configs: ATNConfigSet,
  ): void {
    throw new Error('Method not implemented.');
  }
  reportAttemptingFullContext(
    recognizer: Parser,
    dfa: DFA,
    startIndex: number,
    stopIndex: number,
    conflictingAlts: BitSet | undefined,
    configs: ATNConfigSet,
  ): void {
    throw new Error('Method not implemented.');
  }
  reportContextSensitivity(
    recognizer: Parser,
    dfa: DFA,
    startIndex: number,
    stopIndex: number,
    prediction: number,
    configs: ATNConfigSet,
  ): void {
    throw new Error('Method not implemented.');
  }
  private errors: TcclError[] = [];

  public syntaxError(
    _recognizer: Recognizer<any>,
    _offendingSymbol: any,
    line: number,
    charPositionInLine: number,
    message: string,
  ): void {
    this.errors.push({
      startLineNumber: line,
      endLineNumber: line,
      startColumn: charPositionInLine,
      endColumn: charPositionInLine + 1,
      message,
      code: '1',
      severity: 'error',
    });
  }

  public getErrors(): TcclError[] {
    return this.errors;
  }
}
