
import * as antlr from "antlr4ng";
import { Token } from "antlr4ng";

import { TcclParserListener } from "./TcclParserListener.js";
import { TcclParserVisitor } from "./TcclParserVisitor.js";

// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number;


export class TcclParser extends antlr.Parser {
    public static readonly CHORD_INPUT_KEY = 1;
    public static readonly INPUT_KEY_SEPARATOR = 2;
    public static readonly INPUT_OUTPUT_SEPARATOR = 3;
    public static readonly CHORD_OUTPUT_KEY = 4;
    public static readonly NEWLINE = 5;
    public static readonly RULE_tcclFile = 0;
    public static readonly RULE_chord = 1;
    public static readonly RULE_chordInput = 2;
    public static readonly RULE_chordOutput = 3;

    public static readonly literalNames = [
        null, null, "' + '", "' = '"
    ];

    public static readonly symbolicNames = [
        null, "CHORD_INPUT_KEY", "INPUT_KEY_SEPARATOR", "INPUT_OUTPUT_SEPARATOR", 
        "CHORD_OUTPUT_KEY", "NEWLINE"
    ];
    public static readonly ruleNames = [
        "tcclFile", "chord", "chordInput", "chordOutput",
    ];

    public get grammarFileName(): string { return "TcclParser.g4"; }
    public get literalNames(): (string | null)[] { return TcclParser.literalNames; }
    public get symbolicNames(): (string | null)[] { return TcclParser.symbolicNames; }
    public get ruleNames(): string[] { return TcclParser.ruleNames; }
    public get serializedATN(): number[] { return TcclParser._serializedATN; }

    protected createFailedPredicateException(predicate?: string, message?: string): antlr.FailedPredicateException {
        return new antlr.FailedPredicateException(this, predicate, message);
    }

    public constructor(input: antlr.TokenStream) {
        super(input);
        this.interpreter = new antlr.ParserATNSimulator(this, TcclParser._ATN, TcclParser.decisionsToDFA, new antlr.PredictionContextCache());
    }
    public tcclFile(): TcclFileContext {
        let localContext = new TcclFileContext(this.context, this.state);
        this.enterRule(localContext, 0, TcclParser.RULE_tcclFile);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 8;
            this.chord();
            this.state = 13;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 5) {
                {
                {
                this.state = 9;
                this.match(TcclParser.NEWLINE);
                this.state = 10;
                this.chord();
                }
                }
                this.state = 15;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 16;
            this.match(TcclParser.EOF);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public chord(): ChordContext {
        let localContext = new ChordContext(this.context, this.state);
        this.enterRule(localContext, 2, TcclParser.RULE_chord);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 18;
            this.chordInput();
            this.state = 19;
            this.match(TcclParser.INPUT_OUTPUT_SEPARATOR);
            this.state = 20;
            this.chordOutput();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public chordInput(): ChordInputContext {
        let localContext = new ChordInputContext(this.context, this.state);
        this.enterRule(localContext, 4, TcclParser.RULE_chordInput);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 22;
            this.match(TcclParser.CHORD_INPUT_KEY);
            this.state = 25;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            do {
                {
                {
                this.state = 23;
                this.match(TcclParser.INPUT_KEY_SEPARATOR);
                this.state = 24;
                this.match(TcclParser.CHORD_INPUT_KEY);
                }
                }
                this.state = 27;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            } while (_la === 2);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public chordOutput(): ChordOutputContext {
        let localContext = new ChordOutputContext(this.context, this.state);
        this.enterRule(localContext, 6, TcclParser.RULE_chordOutput);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 30;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            do {
                {
                {
                this.state = 29;
                this.match(TcclParser.CHORD_OUTPUT_KEY);
                }
                }
                this.state = 32;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            } while (_la === 4);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }

    public static readonly _serializedATN: number[] = [
        4,1,5,35,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,1,0,1,0,1,0,5,0,12,8,0,
        10,0,12,0,15,9,0,1,0,1,0,1,1,1,1,1,1,1,1,1,2,1,2,1,2,4,2,26,8,2,
        11,2,12,2,27,1,3,4,3,31,8,3,11,3,12,3,32,1,3,0,0,4,0,2,4,6,0,0,33,
        0,8,1,0,0,0,2,18,1,0,0,0,4,22,1,0,0,0,6,30,1,0,0,0,8,13,3,2,1,0,
        9,10,5,5,0,0,10,12,3,2,1,0,11,9,1,0,0,0,12,15,1,0,0,0,13,11,1,0,
        0,0,13,14,1,0,0,0,14,16,1,0,0,0,15,13,1,0,0,0,16,17,5,0,0,1,17,1,
        1,0,0,0,18,19,3,4,2,0,19,20,5,3,0,0,20,21,3,6,3,0,21,3,1,0,0,0,22,
        25,5,1,0,0,23,24,5,2,0,0,24,26,5,1,0,0,25,23,1,0,0,0,26,27,1,0,0,
        0,27,25,1,0,0,0,27,28,1,0,0,0,28,5,1,0,0,0,29,31,5,4,0,0,30,29,1,
        0,0,0,31,32,1,0,0,0,32,30,1,0,0,0,32,33,1,0,0,0,33,7,1,0,0,0,3,13,
        27,32
    ];

    private static __ATN: antlr.ATN;
    public static get _ATN(): antlr.ATN {
        if (!TcclParser.__ATN) {
            TcclParser.__ATN = new antlr.ATNDeserializer().deserialize(TcclParser._serializedATN);
        }

        return TcclParser.__ATN;
    }


    private static readonly vocabulary = new antlr.Vocabulary(TcclParser.literalNames, TcclParser.symbolicNames, []);

    public override get vocabulary(): antlr.Vocabulary {
        return TcclParser.vocabulary;
    }

    private static readonly decisionsToDFA = TcclParser._ATN.decisionToState.map( (ds: antlr.DecisionState, index: number) => new antlr.DFA(ds, index) );
}

export class TcclFileContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public chord(): ChordContext[];
    public chord(i: number): ChordContext | null;
    public chord(i?: number): ChordContext[] | ChordContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ChordContext);
        }

        return this.getRuleContext(i, ChordContext);
    }
    public EOF(): antlr.TerminalNode {
        return this.getToken(TcclParser.EOF, 0)!;
    }
    public NEWLINE(): antlr.TerminalNode[];
    public NEWLINE(i: number): antlr.TerminalNode | null;
    public NEWLINE(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TcclParser.NEWLINE);
    	} else {
    		return this.getToken(TcclParser.NEWLINE, i);
    	}
    }
    public override get ruleIndex(): number {
        return TcclParser.RULE_tcclFile;
    }
    public override enterRule(listener: TcclParserListener): void {
        if(listener.enterTcclFile) {
             listener.enterTcclFile(this);
        }
    }
    public override exitRule(listener: TcclParserListener): void {
        if(listener.exitTcclFile) {
             listener.exitTcclFile(this);
        }
    }
    public override accept<Result>(visitor: TcclParserVisitor<Result>): Result | null {
        if (visitor.visitTcclFile) {
            return visitor.visitTcclFile(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ChordContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public chordInput(): ChordInputContext {
        return this.getRuleContext(0, ChordInputContext)!;
    }
    public INPUT_OUTPUT_SEPARATOR(): antlr.TerminalNode {
        return this.getToken(TcclParser.INPUT_OUTPUT_SEPARATOR, 0)!;
    }
    public chordOutput(): ChordOutputContext {
        return this.getRuleContext(0, ChordOutputContext)!;
    }
    public override get ruleIndex(): number {
        return TcclParser.RULE_chord;
    }
    public override enterRule(listener: TcclParserListener): void {
        if(listener.enterChord) {
             listener.enterChord(this);
        }
    }
    public override exitRule(listener: TcclParserListener): void {
        if(listener.exitChord) {
             listener.exitChord(this);
        }
    }
    public override accept<Result>(visitor: TcclParserVisitor<Result>): Result | null {
        if (visitor.visitChord) {
            return visitor.visitChord(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ChordInputContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public CHORD_INPUT_KEY(): antlr.TerminalNode[];
    public CHORD_INPUT_KEY(i: number): antlr.TerminalNode | null;
    public CHORD_INPUT_KEY(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TcclParser.CHORD_INPUT_KEY);
    	} else {
    		return this.getToken(TcclParser.CHORD_INPUT_KEY, i);
    	}
    }
    public INPUT_KEY_SEPARATOR(): antlr.TerminalNode[];
    public INPUT_KEY_SEPARATOR(i: number): antlr.TerminalNode | null;
    public INPUT_KEY_SEPARATOR(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TcclParser.INPUT_KEY_SEPARATOR);
    	} else {
    		return this.getToken(TcclParser.INPUT_KEY_SEPARATOR, i);
    	}
    }
    public override get ruleIndex(): number {
        return TcclParser.RULE_chordInput;
    }
    public override enterRule(listener: TcclParserListener): void {
        if(listener.enterChordInput) {
             listener.enterChordInput(this);
        }
    }
    public override exitRule(listener: TcclParserListener): void {
        if(listener.exitChordInput) {
             listener.exitChordInput(this);
        }
    }
    public override accept<Result>(visitor: TcclParserVisitor<Result>): Result | null {
        if (visitor.visitChordInput) {
            return visitor.visitChordInput(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ChordOutputContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public CHORD_OUTPUT_KEY(): antlr.TerminalNode[];
    public CHORD_OUTPUT_KEY(i: number): antlr.TerminalNode | null;
    public CHORD_OUTPUT_KEY(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TcclParser.CHORD_OUTPUT_KEY);
    	} else {
    		return this.getToken(TcclParser.CHORD_OUTPUT_KEY, i);
    	}
    }
    public override get ruleIndex(): number {
        return TcclParser.RULE_chordOutput;
    }
    public override enterRule(listener: TcclParserListener): void {
        if(listener.enterChordOutput) {
             listener.enterChordOutput(this);
        }
    }
    public override exitRule(listener: TcclParserListener): void {
        if(listener.exitChordOutput) {
             listener.exitChordOutput(this);
        }
    }
    public override accept<Result>(visitor: TcclParserVisitor<Result>): Result | null {
        if (visitor.visitChordOutput) {
            return visitor.visitChordOutput(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
