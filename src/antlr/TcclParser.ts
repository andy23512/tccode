// Generated from ./Tccl.g4 by ANTLR 4.9.0-SNAPSHOT


import { ATN } from "antlr4ts/atn/ATN";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer";
import { FailedPredicateException } from "antlr4ts/FailedPredicateException";
import { NotNull } from "antlr4ts/Decorators";
import { NoViableAltException } from "antlr4ts/NoViableAltException";
import { Override } from "antlr4ts/Decorators";
import { Parser } from "antlr4ts/Parser";
import { ParserRuleContext } from "antlr4ts/ParserRuleContext";
import { ParserATNSimulator } from "antlr4ts/atn/ParserATNSimulator";
import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";
import { RecognitionException } from "antlr4ts/RecognitionException";
import { RuleContext } from "antlr4ts/RuleContext";
//import { RuleVersion } from "antlr4ts/RuleVersion";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { Token } from "antlr4ts/Token";
import { TokenStream } from "antlr4ts/TokenStream";
import { Vocabulary } from "antlr4ts/Vocabulary";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl";

import * as Utils from "antlr4ts/misc/Utils";

import { TcclListener } from "./TcclListener";

export class TcclParser extends Parser {
	public static readonly INPUT_KEY_SEPARATOR = 1;
	public static readonly INPUT_OUTPUT_SEPARATOR = 2;
	public static readonly NON_SPACE_KEY = 3;
	public static readonly SPACE = 4;
	public static readonly NEWLINE = 5;
	public static readonly RULE_tcclFile = 0;
	public static readonly RULE_chord = 1;
	public static readonly RULE_chordInput = 2;
	public static readonly RULE_chordOutput = 3;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"tcclFile", "chord", "chordInput", "chordOutput",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "' + '", "' = '", undefined, "' '",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, "INPUT_KEY_SEPARATOR", "INPUT_OUTPUT_SEPARATOR", "NON_SPACE_KEY", 
		"SPACE", "NEWLINE",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(TcclParser._LITERAL_NAMES, TcclParser._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return TcclParser.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace

	// @Override
	public get grammarFileName(): string { return "Tccl.g4"; }

	// @Override
	public get ruleNames(): string[] { return TcclParser.ruleNames; }

	// @Override
	public get serializedATN(): string { return TcclParser._serializedATN; }

	protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message);
	}

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(TcclParser._ATN, this);
	}
	// @RuleVersion(0)
	public tcclFile(): TcclFileContext {
		let _localctx: TcclFileContext = new TcclFileContext(this._ctx, this.state);
		this.enterRule(_localctx, 0, TcclParser.RULE_tcclFile);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 8;
			this.chord();
			this.state = 13;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === TcclParser.NEWLINE) {
				{
				{
				this.state = 9;
				this.match(TcclParser.NEWLINE);
				this.state = 10;
				this.chord();
				}
				}
				this.state = 15;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 16;
			this.match(TcclParser.EOF);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public chord(): ChordContext {
		let _localctx: ChordContext = new ChordContext(this._ctx, this.state);
		this.enterRule(_localctx, 2, TcclParser.RULE_chord);
		try {
			this.enterOuterAlt(_localctx, 1);
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
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public chordInput(): ChordInputContext {
		let _localctx: ChordInputContext = new ChordInputContext(this._ctx, this.state);
		this.enterRule(_localctx, 4, TcclParser.RULE_chordInput);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 22;
			this.match(TcclParser.NON_SPACE_KEY);
			this.state = 25;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 23;
				this.match(TcclParser.INPUT_KEY_SEPARATOR);
				this.state = 24;
				this.match(TcclParser.NON_SPACE_KEY);
				}
				}
				this.state = 27;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while (_la === TcclParser.INPUT_KEY_SEPARATOR);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public chordOutput(): ChordOutputContext {
		let _localctx: ChordOutputContext = new ChordOutputContext(this._ctx, this.state);
		this.enterRule(_localctx, 6, TcclParser.RULE_chordOutput);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 30;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 29;
				_la = this._input.LA(1);
				if (!(_la === TcclParser.NON_SPACE_KEY || _la === TcclParser.SPACE)) {
				this._errHandler.recoverInline(this);
				} else {
					if (this._input.LA(1) === Token.EOF) {
						this.matchedEOF = true;
					}

					this._errHandler.reportMatch(this);
					this.consume();
				}
				}
				}
				this.state = 32;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while (_la === TcclParser.NON_SPACE_KEY || _la === TcclParser.SPACE);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03\x07%\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x03\x02\x03\x02\x03\x02" +
		"\x07\x02\x0E\n\x02\f\x02\x0E\x02\x11\v\x02\x03\x02\x03\x02\x03\x03\x03" +
		"\x03\x03\x03\x03\x03\x03\x04\x03\x04\x03\x04\x06\x04\x1C\n\x04\r\x04\x0E" +
		"\x04\x1D\x03\x05\x06\x05!\n\x05\r\x05\x0E\x05\"\x03\x05\x02\x02\x02\x06" +
		"\x02\x02\x04\x02\x06\x02\b\x02\x02\x03\x03\x02\x05\x06\x02#\x02\n\x03" +
		"\x02\x02\x02\x04\x14\x03\x02\x02\x02\x06\x18\x03\x02\x02\x02\b \x03\x02" +
		"\x02\x02\n\x0F\x05\x04\x03\x02\v\f\x07\x07\x02\x02\f\x0E\x05\x04\x03\x02" +
		"\r\v\x03\x02\x02\x02\x0E\x11\x03\x02\x02\x02\x0F\r\x03\x02\x02\x02\x0F" +
		"\x10\x03\x02\x02\x02\x10\x12\x03\x02\x02\x02\x11\x0F\x03\x02\x02\x02\x12" +
		"\x13\x07\x02\x02\x03\x13\x03\x03\x02\x02\x02\x14\x15\x05\x06\x04\x02\x15" +
		"\x16\x07\x04\x02\x02\x16\x17\x05\b\x05\x02\x17\x05\x03\x02\x02\x02\x18" +
		"\x1B\x07\x05\x02\x02\x19\x1A\x07\x03\x02\x02\x1A\x1C\x07\x05\x02\x02\x1B" +
		"\x19\x03\x02\x02\x02\x1C\x1D\x03\x02\x02\x02\x1D\x1B\x03\x02\x02\x02\x1D" +
		"\x1E\x03\x02\x02\x02\x1E\x07\x03\x02\x02\x02\x1F!\t\x02\x02\x02 \x1F\x03" +
		"\x02\x02\x02!\"\x03\x02\x02\x02\" \x03\x02\x02\x02\"#\x03\x02\x02\x02" +
		"#\t\x03\x02\x02\x02\x05\x0F\x1D\"";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!TcclParser.__ATN) {
			TcclParser.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(TcclParser._serializedATN));
		}

		return TcclParser.__ATN;
	}

}

export class TcclFileContext extends ParserRuleContext {
	public chord(): ChordContext[];
	public chord(i: number): ChordContext;
	public chord(i?: number): ChordContext | ChordContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ChordContext);
		} else {
			return this.getRuleContext(i, ChordContext);
		}
	}
	public EOF(): TerminalNode { return this.getToken(TcclParser.EOF, 0); }
	public NEWLINE(): TerminalNode[];
	public NEWLINE(i: number): TerminalNode;
	public NEWLINE(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(TcclParser.NEWLINE);
		} else {
			return this.getToken(TcclParser.NEWLINE, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TcclParser.RULE_tcclFile; }
	// @Override
	public enterRule(listener: TcclListener): void {
		if (listener.enterTcclFile) {
			listener.enterTcclFile(this);
		}
	}
	// @Override
	public exitRule(listener: TcclListener): void {
		if (listener.exitTcclFile) {
			listener.exitTcclFile(this);
		}
	}
}


export class ChordContext extends ParserRuleContext {
	public chordInput(): ChordInputContext {
		return this.getRuleContext(0, ChordInputContext);
	}
	public INPUT_OUTPUT_SEPARATOR(): TerminalNode { return this.getToken(TcclParser.INPUT_OUTPUT_SEPARATOR, 0); }
	public chordOutput(): ChordOutputContext {
		return this.getRuleContext(0, ChordOutputContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TcclParser.RULE_chord; }
	// @Override
	public enterRule(listener: TcclListener): void {
		if (listener.enterChord) {
			listener.enterChord(this);
		}
	}
	// @Override
	public exitRule(listener: TcclListener): void {
		if (listener.exitChord) {
			listener.exitChord(this);
		}
	}
}


export class ChordInputContext extends ParserRuleContext {
	public NON_SPACE_KEY(): TerminalNode[];
	public NON_SPACE_KEY(i: number): TerminalNode;
	public NON_SPACE_KEY(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(TcclParser.NON_SPACE_KEY);
		} else {
			return this.getToken(TcclParser.NON_SPACE_KEY, i);
		}
	}
	public INPUT_KEY_SEPARATOR(): TerminalNode[];
	public INPUT_KEY_SEPARATOR(i: number): TerminalNode;
	public INPUT_KEY_SEPARATOR(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(TcclParser.INPUT_KEY_SEPARATOR);
		} else {
			return this.getToken(TcclParser.INPUT_KEY_SEPARATOR, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TcclParser.RULE_chordInput; }
	// @Override
	public enterRule(listener: TcclListener): void {
		if (listener.enterChordInput) {
			listener.enterChordInput(this);
		}
	}
	// @Override
	public exitRule(listener: TcclListener): void {
		if (listener.exitChordInput) {
			listener.exitChordInput(this);
		}
	}
}


export class ChordOutputContext extends ParserRuleContext {
	public NON_SPACE_KEY(): TerminalNode[];
	public NON_SPACE_KEY(i: number): TerminalNode;
	public NON_SPACE_KEY(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(TcclParser.NON_SPACE_KEY);
		} else {
			return this.getToken(TcclParser.NON_SPACE_KEY, i);
		}
	}
	public SPACE(): TerminalNode[];
	public SPACE(i: number): TerminalNode;
	public SPACE(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(TcclParser.SPACE);
		} else {
			return this.getToken(TcclParser.SPACE, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TcclParser.RULE_chordOutput; }
	// @Override
	public enterRule(listener: TcclListener): void {
		if (listener.enterChordOutput) {
			listener.enterChordOutput(this);
		}
	}
	// @Override
	public exitRule(listener: TcclListener): void {
		if (listener.exitChordOutput) {
			listener.exitChordOutput(this);
		}
	}
}


