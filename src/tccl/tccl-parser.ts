import { CharStream } from 'antlr4ng';
import { TcclLexer } from '../antlr/TcclLexer';

export function createLexer(input: string) {
  const chars = CharStream.fromString(input);
  const lexer = new TcclLexer(chars);
  return lexer;
}
