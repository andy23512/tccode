lexer grammar TcclLexer;

/* Lexer Rules */

tokens {
	INDENT,
	DEDENT
}

options {
	superClass = TcclLexerBase;
}

fragment ACTION_CODE : '<' [0-9]+ '>';
fragment LOWERCASE : [a-z];
fragment UPPERCASE : [A-Z];
fragment NUMBER : [0-9];
fragment SYMBOL : ('[' | ']' | '.' | '/' | '-');
fragment NON_SPACE_KEY : (ACTION_CODE | LOWERCASE | UPPERCASE | NUMBER | SYMBOL);
fragment SPACE : ' ';
fragment SPACES: [ \t]+;

CHORD_INPUT_KEY : NON_SPACE_KEY;
INPUT_KEY_SEPARATOR : ' + ';
INPUT_OUTPUT_SEPARATOR : ' = ' -> pushMode(ChordOutput);

mode ChordOutput;

CHORD_OUTPUT_KEY : (NON_SPACE_KEY | SPACE);
NEWLINE: ( '\r'? '\n' | '\r' | '\f') SPACES? {this.onNewLine();} -> popMode;
