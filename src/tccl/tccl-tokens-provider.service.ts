import { Injectable } from '@angular/core';
import { ANTLRErrorListener, RecognitionException, Recognizer } from 'antlr4ng';
import type { languages } from 'monaco-editor';
import { createLexer } from '../language-service/tccl-parser';
type ILineTokens = languages.ILineTokens;
type IToken = languages.IToken;

export class TcclState implements languages.IState {
  clone(): languages.IState {
    return new TcclState();
  }

  equals(other: languages.IState): boolean {
    return true;
  }
}

@Injectable({ providedIn: 'root' })
export class TcclTokensProviderService implements languages.TokensProvider {
  public getInitialState(): languages.IState {
    return new TcclState();
  }

  public tokenize(line: string): languages.ILineTokens {
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
  endState: languages.IState;
  tokens: languages.IToken[];

  constructor(tokens: languages.IToken[]) {
    this.endState = new TcclState();
    this.tokens = tokens;
  }
}

export function tokensForLine(input: string): languages.ILineTokens {
  const errorStartingPoints: number[] = [];

  class ErrorCollectorListener implements ANTLRErrorListener {
    reportAmbiguity(): void {
      throw new Error('Method not implemented.');
    }
    reportAttemptingFullContext(): void {
      throw new Error('Method not implemented.');
    }
    reportContextSensitivity(): void {
      throw new Error('Method not implemented.');
    }

    syntaxError(
      recognizer: Recognizer<any>,
      offendingSymbol: any,
      line: number,
      column: number,
      msg: string,
      e: RecognitionException | null,
    ) {
      errorStartingPoints.push(column);
    }
  }

  const lexer = createLexer(input);
  lexer.removeErrorListeners();
  const errorListener = new ErrorCollectorListener();
  lexer.addErrorListener(errorListener);
  let done = false;
  const myTokens: languages.IToken[] = [];
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
        if (tokenTypeName) {
          const myToken = new TcclToken(tokenTypeName, token.column);
          myTokens.push(myToken);
        }
      }
    }
  } while (!done);
  for (const e of errorStartingPoints) {
    myTokens.push(new TcclToken('error.tccl', e));
  }
  myTokens.sort((a, b) => (a.startIndex > b.startIndex ? 1 : -1));
  return new TcclLineTokens(myTokens);
}
