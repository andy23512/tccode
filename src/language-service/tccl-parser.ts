import { CharStream, CommonTokenStream } from 'antlr4ng';
import { TcclLexer } from '../antlr/TcclLexer';
import { TcclFileContext, TcclParser } from '../antlr/TcclParser';
import { TcclError, TcclErrorListener } from './tccl-error-listener';

function parse(code: string): { ast: TcclFileContext; errors: TcclError[] } {
  const inputStream = CharStream.fromString(code);
  const lexer = new TcclLexer(inputStream);
  lexer.removeErrorListeners();
  const tcclErrorsListener = new TcclErrorListener();
  lexer.addErrorListener(tcclErrorsListener);
  const tokenStream = new CommonTokenStream(lexer);
  const parser = new TcclParser(tokenStream);
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
