import * as antlr from 'antlr4ng';
import { TcclLexerBase } from './TcclLexerBase';

export class TcclLexer extends TcclLexerBase {
  public static readonly INDENT = 1;
  public static readonly DEDENT = 2;
  public static readonly CHORD_INPUT_KEY = 3;
  public static readonly INPUT_KEY_SEPARATOR = 4;
  public static readonly INPUT_OUTPUT_SEPARATOR = 5;
  public static readonly CHORD_OUTPUT_KEY = 6;
  public static readonly NEWLINE = 7;
  public static readonly ChordOutput = 1;

  public static readonly channelNames = ['DEFAULT_TOKEN_CHANNEL', 'HIDDEN'];

  public static readonly literalNames = [
    null,
    null,
    null,
    null,
    "' + '",
    "' = '",
  ];

  public static readonly symbolicNames = [
    null,
    'INDENT',
    'DEDENT',
    'CHORD_INPUT_KEY',
    'INPUT_KEY_SEPARATOR',
    'INPUT_OUTPUT_SEPARATOR',
    'CHORD_OUTPUT_KEY',
    'NEWLINE',
  ];

  public static readonly modeNames = ['DEFAULT_MODE', 'ChordOutput'];

  public static readonly ruleNames = [
    'ACTION_CODE',
    'LOWERCASE',
    'UPPERCASE',
    'NUMBER',
    'SYMBOL',
    'NON_SPACE_KEY',
    'SPACE',
    'SPACES',
    'CHORD_INPUT_KEY',
    'INPUT_KEY_SEPARATOR',
    'INPUT_OUTPUT_SEPARATOR',
    'CHORD_OUTPUT_KEY',
    'NEWLINE',
  ];

  public constructor(input: antlr.CharStream) {
    super(input);
    this.interpreter = new antlr.LexerATNSimulator(
      this,
      TcclLexer._ATN,
      TcclLexer.decisionsToDFA,
      new antlr.PredictionContextCache(),
    );
  }

  public get grammarFileName(): string {
    return 'TcclLexer.g4';
  }

  public get literalNames(): (string | null)[] {
    return TcclLexer.literalNames;
  }
  public get symbolicNames(): (string | null)[] {
    return TcclLexer.symbolicNames;
  }
  public get ruleNames(): string[] {
    return TcclLexer.ruleNames;
  }

  public get serializedATN(): number[] {
    return TcclLexer._serializedATN;
  }

  public get channelNames(): string[] {
    return TcclLexer.channelNames;
  }

  public get modeNames(): string[] {
    return TcclLexer.modeNames;
  }

  public override action(
    localContext: antlr.ParserRuleContext | null,
    ruleIndex: number,
    actionIndex: number,
  ): void {
    switch (ruleIndex) {
      case 12:
        this.NEWLINE_action(localContext, actionIndex);
        break;
    }
  }
  private NEWLINE_action(
    localContext: antlr.ParserRuleContext | null,
    actionIndex: number,
  ): void {
    switch (actionIndex) {
      case 0:
        this.onNewLine();
        break;
    }
  }

  public static readonly _serializedATN: number[] = [
    4, 0, 7, 88, 6, -1, 6, -1, 2, 0, 7, 0, 2, 1, 7, 1, 2, 2, 7, 2, 2, 3, 7, 3,
    2, 4, 7, 4, 2, 5, 7, 5, 2, 6, 7, 6, 2, 7, 7, 7, 2, 8, 7, 8, 2, 9, 7, 9, 2,
    10, 7, 10, 2, 11, 7, 11, 2, 12, 7, 12, 1, 0, 1, 0, 4, 0, 31, 8, 0, 11, 0,
    12, 0, 32, 1, 0, 1, 0, 1, 1, 1, 1, 1, 2, 1, 2, 1, 3, 1, 3, 1, 4, 1, 4, 1, 5,
    1, 5, 1, 5, 1, 5, 1, 5, 3, 5, 50, 8, 5, 1, 6, 1, 6, 1, 7, 4, 7, 55, 8, 7,
    11, 7, 12, 7, 56, 1, 8, 1, 8, 1, 9, 1, 9, 1, 9, 1, 9, 1, 10, 1, 10, 1, 10,
    1, 10, 1, 10, 1, 10, 1, 11, 1, 11, 3, 11, 73, 8, 11, 1, 12, 3, 12, 76, 8,
    12, 1, 12, 1, 12, 3, 12, 80, 8, 12, 1, 12, 3, 12, 83, 8, 12, 1, 12, 1, 12,
    1, 12, 1, 12, 0, 0, 13, 2, 0, 4, 0, 6, 0, 8, 0, 10, 0, 12, 0, 14, 0, 16, 0,
    18, 3, 20, 4, 22, 5, 24, 6, 26, 7, 2, 0, 1, 5, 1, 0, 48, 57, 1, 0, 97, 122,
    1, 0, 65, 90, 3, 0, 45, 47, 91, 91, 93, 93, 2, 0, 9, 9, 32, 32, 88, 0, 18,
    1, 0, 0, 0, 0, 20, 1, 0, 0, 0, 0, 22, 1, 0, 0, 0, 1, 24, 1, 0, 0, 0, 1, 26,
    1, 0, 0, 0, 2, 28, 1, 0, 0, 0, 4, 36, 1, 0, 0, 0, 6, 38, 1, 0, 0, 0, 8, 40,
    1, 0, 0, 0, 10, 42, 1, 0, 0, 0, 12, 49, 1, 0, 0, 0, 14, 51, 1, 0, 0, 0, 16,
    54, 1, 0, 0, 0, 18, 58, 1, 0, 0, 0, 20, 60, 1, 0, 0, 0, 22, 64, 1, 0, 0, 0,
    24, 72, 1, 0, 0, 0, 26, 79, 1, 0, 0, 0, 28, 30, 5, 60, 0, 0, 29, 31, 7, 0,
    0, 0, 30, 29, 1, 0, 0, 0, 31, 32, 1, 0, 0, 0, 32, 30, 1, 0, 0, 0, 32, 33, 1,
    0, 0, 0, 33, 34, 1, 0, 0, 0, 34, 35, 5, 62, 0, 0, 35, 3, 1, 0, 0, 0, 36, 37,
    7, 1, 0, 0, 37, 5, 1, 0, 0, 0, 38, 39, 7, 2, 0, 0, 39, 7, 1, 0, 0, 0, 40,
    41, 7, 0, 0, 0, 41, 9, 1, 0, 0, 0, 42, 43, 7, 3, 0, 0, 43, 11, 1, 0, 0, 0,
    44, 50, 3, 2, 0, 0, 45, 50, 3, 4, 1, 0, 46, 50, 3, 6, 2, 0, 47, 50, 3, 8, 3,
    0, 48, 50, 3, 10, 4, 0, 49, 44, 1, 0, 0, 0, 49, 45, 1, 0, 0, 0, 49, 46, 1,
    0, 0, 0, 49, 47, 1, 0, 0, 0, 49, 48, 1, 0, 0, 0, 50, 13, 1, 0, 0, 0, 51, 52,
    5, 32, 0, 0, 52, 15, 1, 0, 0, 0, 53, 55, 7, 4, 0, 0, 54, 53, 1, 0, 0, 0, 55,
    56, 1, 0, 0, 0, 56, 54, 1, 0, 0, 0, 56, 57, 1, 0, 0, 0, 57, 17, 1, 0, 0, 0,
    58, 59, 3, 12, 5, 0, 59, 19, 1, 0, 0, 0, 60, 61, 5, 32, 0, 0, 61, 62, 5, 43,
    0, 0, 62, 63, 5, 32, 0, 0, 63, 21, 1, 0, 0, 0, 64, 65, 5, 32, 0, 0, 65, 66,
    5, 61, 0, 0, 66, 67, 5, 32, 0, 0, 67, 68, 1, 0, 0, 0, 68, 69, 6, 10, 0, 0,
    69, 23, 1, 0, 0, 0, 70, 73, 3, 12, 5, 0, 71, 73, 3, 14, 6, 0, 72, 70, 1, 0,
    0, 0, 72, 71, 1, 0, 0, 0, 73, 25, 1, 0, 0, 0, 74, 76, 5, 13, 0, 0, 75, 74,
    1, 0, 0, 0, 75, 76, 1, 0, 0, 0, 76, 77, 1, 0, 0, 0, 77, 80, 5, 10, 0, 0, 78,
    80, 2, 12, 13, 0, 79, 75, 1, 0, 0, 0, 79, 78, 1, 0, 0, 0, 80, 82, 1, 0, 0,
    0, 81, 83, 3, 16, 7, 0, 82, 81, 1, 0, 0, 0, 82, 83, 1, 0, 0, 0, 83, 84, 1,
    0, 0, 0, 84, 85, 6, 12, 1, 0, 85, 86, 1, 0, 0, 0, 86, 87, 6, 12, 2, 0, 87,
    27, 1, 0, 0, 0, 9, 0, 1, 32, 49, 56, 72, 75, 79, 82, 3, 5, 1, 0, 1, 12, 0,
    4, 0, 0,
  ];

  private static __ATN: antlr.ATN;
  public static get _ATN(): antlr.ATN {
    if (!TcclLexer.__ATN) {
      TcclLexer.__ATN = new antlr.ATNDeserializer().deserialize(
        TcclLexer._serializedATN,
      );
    }

    return TcclLexer.__ATN;
  }

  private static readonly vocabulary = new antlr.Vocabulary(
    TcclLexer.literalNames,
    TcclLexer.symbolicNames,
    [],
  );

  public override get vocabulary(): antlr.Vocabulary {
    return TcclLexer.vocabulary;
  }

  private static readonly decisionsToDFA = TcclLexer._ATN.decisionToState.map(
    (ds: antlr.DecisionState, index: number) => new antlr.DFA(ds, index),
  );
}
