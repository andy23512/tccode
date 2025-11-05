lexer grammar TcclLexer;

/* Lexer Rules */

fragment LOWERCASE : [a-z];
fragment UPPERCASE : [A-Z];
fragment SYMBOL : ('[' | ']' | '.' | '/' | '-');
fragment NON_SPACE_KEY : (LOWERCASE | UPPERCASE | SYMBOL);
fragment SPACE : ' ';

CHORD_INPUT_KEY : NON_SPACE_KEY;
INPUT_KEY_SEPARATOR : ' + ';
INPUT_OUTPUT_SEPARATOR : ' = ' -> pushMode(ChordOutput);

mode ChordOutput;

CHORD_OUTPUT_KEY : (NON_SPACE_KEY | SPACE);
NEWLINE : ('\r'? '\n' | '\r')+ -> popMode;
