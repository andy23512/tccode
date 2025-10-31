import { CharStream, CommonTokenStream } from 'antlr4ng';
import { TcclLexer } from '../antlr/TcclLexer';
import { TcclFileContext, TcclParser } from '../antlr/TcclParser';
import { TcclError, TcclErrorListener } from './tccl-error-listener';

export function createLexer(code: string) {
  const inputStream = CharStream.fromString(code);
  const lexer = new TcclLexer(inputStream);
  return lexer;
}

export function getTokenStream(code: string): CommonTokenStream {
  const lexer = createLexer(code);
  return new CommonTokenStream(lexer);
}

export function getParser(tokenStream: CommonTokenStream): TcclParser {
  return new TcclParser(tokenStream);
}

function parse(code: string): { ast: TcclFileContext; errors: TcclError[] } {
  const lexer = createLexer(code);
  lexer.removeErrorListeners();
  const tcclErrorsListener = new TcclErrorListener();
  lexer.addErrorListener(tcclErrorsListener);
  const tokenStream = new CommonTokenStream(lexer);
  const parser = getParser(tokenStream);
  parser.removeErrorListeners();
  parser.addErrorListener(tcclErrorsListener);
  const ast = parser.tcclFile();
  const errors: TcclError[] = tcclErrorsListener.getErrors();
  return { ast, errors };
}

export function parseAndGetAstRoot(code: string): TcclFileContext {
  const { ast } = parse(code);
  return ast;
}

export function parseAndGetSyntaxErrors(code: string): TcclError[] {
  const { errors } = parse(code);
  return errors;
}
