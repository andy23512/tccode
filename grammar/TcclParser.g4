parser grammar TcclParser;
options {tokenVocab=TcclLexer;}

tcclFile : chordNode* EOF;
chordNode : chord (INDENT chordNode+ DEDENT)?;
chord : chordInput INPUT_OUTPUT_SEPARATOR chordOutput NEWLINE;
chordInput : CHORD_INPUT_KEY (INPUT_KEY_SEPARATOR CHORD_INPUT_KEY)+;
chordOutput : (CHORD_OUTPUT_KEY)+;
