grammar Tccl;

/* Parser Rules */

tcclFile : chord (NEWLINE chord)* EOF;

chord : chordInput INPUT_OUTPUT_SEPARATOR chordOutput;

chordInput : NON_SPACE_KEY (INPUT_KEY_SEPARATOR NON_SPACE_KEY)+;

chordOutput : (NON_SPACE_KEY | SPACE)+;

/* Lexer Rules */

fragment LOWERCASE : [a-z];
fragment UPPERCASE : [A-Z];
fragment SYMBOL : ('[' | ']' | '.' | '/' | '-');

INPUT_KEY_SEPARATOR : ' + ';
INPUT_OUTPUT_SEPARATOR : ' = ';

NON_SPACE_KEY : (LOWERCASE | UPPERCASE | SYMBOL);
SPACE : ' ';

NEWLINE : ('\r'? '\n' | '\r')+;
