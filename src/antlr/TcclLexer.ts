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
    'LOWERCASE',
    'UPPERCASE',
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
      case 10:
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
    4, 0, 7, 72, 6, -1, 6, -1, 2, 0, 7, 0, 2, 1, 7, 1, 2, 2, 7, 2, 2, 3, 7, 3,
    2, 4, 7, 4, 2, 5, 7, 5, 2, 6, 7, 6, 2, 7, 7, 7, 2, 8, 7, 8, 2, 9, 7, 9, 2,
    10, 7, 10, 1, 0, 1, 0, 1, 1, 1, 1, 1, 2, 1, 2, 1, 3, 1, 3, 1, 3, 3, 3, 34,
    8, 3, 1, 4, 1, 4, 1, 5, 4, 5, 39, 8, 5, 11, 5, 12, 5, 40, 1, 6, 1, 6, 1, 7,
    1, 7, 1, 7, 1, 7, 1, 8, 1, 8, 1, 8, 1, 8, 1, 8, 1, 8, 1, 9, 1, 9, 3, 9, 57,
    8, 9, 1, 10, 3, 10, 60, 8, 10, 1, 10, 1, 10, 3, 10, 64, 8, 10, 1, 10, 3, 10,
    67, 8, 10, 1, 10, 1, 10, 1, 10, 1, 10, 0, 0, 11, 2, 0, 4, 0, 6, 0, 8, 0, 10,
    0, 12, 0, 14, 3, 16, 4, 18, 5, 20, 6, 22, 7, 2, 0, 1, 4, 1, 0, 97, 122, 1,
    0, 65, 90, 3, 0, 45, 47, 91, 91, 93, 93, 2, 0, 9, 9, 32, 32, 71, 0, 14, 1,
    0, 0, 0, 0, 16, 1, 0, 0, 0, 0, 18, 1, 0, 0, 0, 1, 20, 1, 0, 0, 0, 1, 22, 1,
    0, 0, 0, 2, 24, 1, 0, 0, 0, 4, 26, 1, 0, 0, 0, 6, 28, 1, 0, 0, 0, 8, 33, 1,
    0, 0, 0, 10, 35, 1, 0, 0, 0, 12, 38, 1, 0, 0, 0, 14, 42, 1, 0, 0, 0, 16, 44,
    1, 0, 0, 0, 18, 48, 1, 0, 0, 0, 20, 56, 1, 0, 0, 0, 22, 63, 1, 0, 0, 0, 24,
    25, 7, 0, 0, 0, 25, 3, 1, 0, 0, 0, 26, 27, 7, 1, 0, 0, 27, 5, 1, 0, 0, 0,
    28, 29, 7, 2, 0, 0, 29, 7, 1, 0, 0, 0, 30, 34, 3, 2, 0, 0, 31, 34, 3, 4, 1,
    0, 32, 34, 3, 6, 2, 0, 33, 30, 1, 0, 0, 0, 33, 31, 1, 0, 0, 0, 33, 32, 1, 0,
    0, 0, 34, 9, 1, 0, 0, 0, 35, 36, 5, 32, 0, 0, 36, 11, 1, 0, 0, 0, 37, 39, 7,
    3, 0, 0, 38, 37, 1, 0, 0, 0, 39, 40, 1, 0, 0, 0, 40, 38, 1, 0, 0, 0, 40, 41,
    1, 0, 0, 0, 41, 13, 1, 0, 0, 0, 42, 43, 3, 8, 3, 0, 43, 15, 1, 0, 0, 0, 44,
    45, 5, 32, 0, 0, 45, 46, 5, 43, 0, 0, 46, 47, 5, 32, 0, 0, 47, 17, 1, 0, 0,
    0, 48, 49, 5, 32, 0, 0, 49, 50, 5, 61, 0, 0, 50, 51, 5, 32, 0, 0, 51, 52, 1,
    0, 0, 0, 52, 53, 6, 8, 0, 0, 53, 19, 1, 0, 0, 0, 54, 57, 3, 8, 3, 0, 55, 57,
    3, 10, 4, 0, 56, 54, 1, 0, 0, 0, 56, 55, 1, 0, 0, 0, 57, 21, 1, 0, 0, 0, 58,
    60, 5, 13, 0, 0, 59, 58, 1, 0, 0, 0, 59, 60, 1, 0, 0, 0, 60, 61, 1, 0, 0, 0,
    61, 64, 5, 10, 0, 0, 62, 64, 2, 12, 13, 0, 63, 59, 1, 0, 0, 0, 63, 62, 1, 0,
    0, 0, 64, 66, 1, 0, 0, 0, 65, 67, 3, 12, 5, 0, 66, 65, 1, 0, 0, 0, 66, 67,
    1, 0, 0, 0, 67, 68, 1, 0, 0, 0, 68, 69, 6, 10, 1, 0, 69, 70, 1, 0, 0, 0, 70,
    71, 6, 10, 2, 0, 71, 23, 1, 0, 0, 0, 8, 0, 1, 33, 40, 56, 59, 63, 66, 3, 5,
    1, 0, 1, 10, 0, 4, 0, 0,
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
