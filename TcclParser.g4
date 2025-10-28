parser grammar TcclParser;
options {tokenVocab=TcclLexer;}

tcclFile : chord (NEWLINE chord)* EOF;
chord : chordInput INPUT_OUTPUT_SEPARATOR chordOutput;
chordInput : CHORD_INPUT_KEY (INPUT_KEY_SEPARATOR CHORD_INPUT_KEY)+;
chordOutput : (CHORD_OUTPUT_KEY)+;
