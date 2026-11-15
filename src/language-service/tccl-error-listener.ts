import {
  ANTLRErrorListener,
  ATNSimulator,
  Recognizer,
  Token,
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
  reportAmbiguity(): void {
    throw new Error('Method not implemented.');
  }
  reportAttemptingFullContext(): void {
    throw new Error('Method not implemented.');
  }
  reportContextSensitivity(): void {
    throw new Error('Method not implemented.');
  }
  private errors: TcclError[] = [];

  public syntaxError(
    _recognizer: Recognizer<ATNSimulator>,
    _offendingSymbol: Token | null,
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
