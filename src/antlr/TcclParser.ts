
import * as antlr from "antlr4ng";
import { Token } from "antlr4ng";

import { TcclParserListener } from "./TcclParserListener.js";
import { TcclParserVisitor } from "./TcclParserVisitor.js";

// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number;


export class TcclParser extends antlr.Parser {
    public static readonly INDENT = 1;
    public static readonly DEDENT = 2;
    public static readonly CHORD_INPUT_KEY = 3;
    public static readonly INPUT_KEY_SEPARATOR = 4;
    public static readonly INPUT_OUTPUT_SEPARATOR = 5;
    public static readonly CHORD_OUTPUT_KEY = 6;
    public static readonly NEWLINE = 7;
    public static readonly RULE_tcclFile = 0;
    public static readonly RULE_chordNode = 1;
    public static readonly RULE_chord = 2;
    public static readonly RULE_chordInput = 3;
    public static readonly RULE_chordOutput = 4;

    public static readonly literalNames = [
        null, null, null, null, "' + '", "' = '"
    ];

    public static readonly symbolicNames = [
        null, "INDENT", "DEDENT", "CHORD_INPUT_KEY", "INPUT_KEY_SEPARATOR", 
        "INPUT_OUTPUT_SEPARATOR", "CHORD_OUTPUT_KEY", "NEWLINE"
    ];
    public static readonly ruleNames = [
        "tcclFile", "chordNode", "chord", "chordInput", "chordOutput",
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
            this.state = 13;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 3) {
                {
                {
                this.state = 10;
                this.chordNode();
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
    public chordNode(): ChordNodeContext {
        let localContext = new ChordNodeContext(this.context, this.state);
        this.enterRule(localContext, 2, TcclParser.RULE_chordNode);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 18;
            this.chord();
            this.state = 27;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 1) {
                {
                this.state = 19;
                this.match(TcclParser.INDENT);
                this.state = 21;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                do {
                    {
                    {
                    this.state = 20;
                    this.chordNode();
                    }
                    }
                    this.state = 23;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                } while (_la === 3);
                this.state = 25;
                this.match(TcclParser.DEDENT);
                }
            }

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
        this.enterRule(localContext, 4, TcclParser.RULE_chord);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 29;
            this.chordInput();
            this.state = 30;
            this.match(TcclParser.INPUT_OUTPUT_SEPARATOR);
            this.state = 31;
            this.chordOutput();
            this.state = 32;
            this.match(TcclParser.NEWLINE);
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
        this.enterRule(localContext, 6, TcclParser.RULE_chordInput);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 34;
            this.match(TcclParser.CHORD_INPUT_KEY);
            this.state = 37;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            do {
                {
                {
                this.state = 35;
                this.match(TcclParser.INPUT_KEY_SEPARATOR);
                this.state = 36;
                this.match(TcclParser.CHORD_INPUT_KEY);
                }
                }
                this.state = 39;
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
    public chordOutput(): ChordOutputContext {
        let localContext = new ChordOutputContext(this.context, this.state);
        this.enterRule(localContext, 8, TcclParser.RULE_chordOutput);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 42;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            do {
                {
                {
                this.state = 41;
                this.match(TcclParser.CHORD_OUTPUT_KEY);
                }
                }
                this.state = 44;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            } while (_la === 6);
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
        4,1,7,47,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,1,0,5,0,12,8,0,
        10,0,12,0,15,9,0,1,0,1,0,1,1,1,1,1,1,4,1,22,8,1,11,1,12,1,23,1,1,
        1,1,3,1,28,8,1,1,2,1,2,1,2,1,2,1,2,1,3,1,3,1,3,4,3,38,8,3,11,3,12,
        3,39,1,4,4,4,43,8,4,11,4,12,4,44,1,4,0,0,5,0,2,4,6,8,0,0,46,0,13,
        1,0,0,0,2,18,1,0,0,0,4,29,1,0,0,0,6,34,1,0,0,0,8,42,1,0,0,0,10,12,
        3,2,1,0,11,10,1,0,0,0,12,15,1,0,0,0,13,11,1,0,0,0,13,14,1,0,0,0,
        14,16,1,0,0,0,15,13,1,0,0,0,16,17,5,0,0,1,17,1,1,0,0,0,18,27,3,4,
        2,0,19,21,5,1,0,0,20,22,3,2,1,0,21,20,1,0,0,0,22,23,1,0,0,0,23,21,
        1,0,0,0,23,24,1,0,0,0,24,25,1,0,0,0,25,26,5,2,0,0,26,28,1,0,0,0,
        27,19,1,0,0,0,27,28,1,0,0,0,28,3,1,0,0,0,29,30,3,6,3,0,30,31,5,5,
        0,0,31,32,3,8,4,0,32,33,5,7,0,0,33,5,1,0,0,0,34,37,5,3,0,0,35,36,
        5,4,0,0,36,38,5,3,0,0,37,35,1,0,0,0,38,39,1,0,0,0,39,37,1,0,0,0,
        39,40,1,0,0,0,40,7,1,0,0,0,41,43,5,6,0,0,42,41,1,0,0,0,43,44,1,0,
        0,0,44,42,1,0,0,0,44,45,1,0,0,0,45,9,1,0,0,0,5,13,23,27,39,44
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
    public EOF(): antlr.TerminalNode {
        return this.getToken(TcclParser.EOF, 0)!;
    }
    public chordNode(): ChordNodeContext[];
    public chordNode(i: number): ChordNodeContext | null;
    public chordNode(i?: number): ChordNodeContext[] | ChordNodeContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ChordNodeContext);
        }

        return this.getRuleContext(i, ChordNodeContext);
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


export class ChordNodeContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public chord(): ChordContext {
        return this.getRuleContext(0, ChordContext)!;
    }
    public INDENT(): antlr.TerminalNode | null {
        return this.getToken(TcclParser.INDENT, 0);
    }
    public DEDENT(): antlr.TerminalNode | null {
        return this.getToken(TcclParser.DEDENT, 0);
    }
    public chordNode(): ChordNodeContext[];
    public chordNode(i: number): ChordNodeContext | null;
    public chordNode(i?: number): ChordNodeContext[] | ChordNodeContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ChordNodeContext);
        }

        return this.getRuleContext(i, ChordNodeContext);
    }
    public override get ruleIndex(): number {
        return TcclParser.RULE_chordNode;
    }
    public override enterRule(listener: TcclParserListener): void {
        if(listener.enterChordNode) {
             listener.enterChordNode(this);
        }
    }
    public override exitRule(listener: TcclParserListener): void {
        if(listener.exitChordNode) {
             listener.exitChordNode(this);
        }
    }
    public override accept<Result>(visitor: TcclParserVisitor<Result>): Result | null {
        if (visitor.visitChordNode) {
            return visitor.visitChordNode(this);
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
    public NEWLINE(): antlr.TerminalNode {
        return this.getToken(TcclParser.NEWLINE, 0)!;
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
