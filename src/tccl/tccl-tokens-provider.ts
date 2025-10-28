import {
  ANTLRErrorListener,
  ATNConfigSet,
  BitSet,
  DFA,
  Parser,
  RecognitionException,
  Recognizer,
} from 'antlr4ng';
import * as monaco from 'monaco-editor';
import { createLexer } from './tccl-parser';
import ILineTokens = monaco.languages.ILineTokens;
import IToken = monaco.languages.IToken;

export class TcclState implements monaco.languages.IState {
  clone(): monaco.languages.IState {
    return new TcclState();
  }

  equals(other: monaco.languages.IState): boolean {
    return true;
  }
}

export class TcclTokensProvider implements monaco.languages.TokensProvider {
  public getInitialState(): monaco.languages.IState {
    return new TcclState();
  }

  public tokenize(
    line: string,
    state: monaco.languages.IState,
  ): monaco.languages.ILineTokens {
    // So far we ignore the state, which is not great for performance reasons
    return tokensForLine(line);
  }
}

const EOF = -1;

class TcclToken implements IToken {
  scopes: string;
  startIndex: number;

  constructor(ruleName: string, startIndex: number) {
    this.scopes = ruleName.toLowerCase() + '.tccl';
    this.startIndex = startIndex;
  }
}

class TcclLineTokens implements ILineTokens {
  endState: monaco.languages.IState;
  tokens: monaco.languages.IToken[];

  constructor(tokens: monaco.languages.IToken[]) {
    this.endState = new TcclState();
    this.tokens = tokens;
  }
}

export function tokensForLine(input: string): monaco.languages.ILineTokens {
  const errorStartingPoints: number[] = [];

  class ErrorCollectorListener implements ANTLRErrorListener {
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
    syntaxError(
      recognizer: Recognizer<any>,
      offendingSymbol: any,
      line: number,
      column: number,
      msg: string,
      e: RecognitionException | undefined,
    ) {
      errorStartingPoints.push(column);
    }
  }

  const lexer = createLexer(input);
  lexer.removeErrorListeners();
  const errorListener = new ErrorCollectorListener();
  lexer.addErrorListener(errorListener);
  let done = false;
  const myTokens: monaco.languages.IToken[] = [];
  do {
    const token = lexer.nextToken();
    if (token == null) {
      done = true;
    } else {
      // We exclude EOF
      if (token.type === EOF) {
        done = true;
      } else {
        const tokenTypeName = lexer.symbolicNames[token.type];
        const myToken = new TcclToken(tokenTypeName, token.column);
        myTokens.push(myToken);
      }
    }
  } while (!done);
  for (const e of errorStartingPoints) {
    myTokens.push(new TcclToken('error.tccl', e));
  }
  myTokens.sort((a, b) => (a.startIndex > b.startIndex ? 1 : -1));
  return new TcclLineTokens(myTokens);
}
