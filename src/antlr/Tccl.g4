grammar Tccl;

/* Parser Rules */

tcclFile : chord (NEWLINE chord)* EOF;

chord : chordInput ' = ' chordOutput;

chordInput : KEY (' + ' KEY)*;

chordOutput : KEY+;

/* Lexer Rules */

fragment LOWERCASE : [a-z];
fragment UPPERCASE : [A-Z];
fragment SYMBOLS : ('[' | ']' | '.' | '/' | '-' | ' ');

KEY : (LOWERCASE | UPPERCASE | SYMBOLS);

NEWLINE : ('\r'? '\n' | '\r')+;
