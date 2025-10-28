
import { ErrorNode, ParseTreeListener, ParserRuleContext, TerminalNode } from "antlr4ng";


import { TcclFileContext } from "./TcclParser.js";
import { ChordContext } from "./TcclParser.js";
import { ChordInputContext } from "./TcclParser.js";
import { ChordOutputContext } from "./TcclParser.js";


/**
 * This interface defines a complete listener for a parse tree produced by
 * `TcclParser`.
 */
export class TcclParserListener implements ParseTreeListener {
    /**
     * Enter a parse tree produced by `TcclParser.tcclFile`.
     * @param ctx the parse tree
     */
    enterTcclFile?: (ctx: TcclFileContext) => void;
    /**
     * Exit a parse tree produced by `TcclParser.tcclFile`.
     * @param ctx the parse tree
     */
    exitTcclFile?: (ctx: TcclFileContext) => void;
    /**
     * Enter a parse tree produced by `TcclParser.chord`.
     * @param ctx the parse tree
     */
    enterChord?: (ctx: ChordContext) => void;
    /**
     * Exit a parse tree produced by `TcclParser.chord`.
     * @param ctx the parse tree
     */
    exitChord?: (ctx: ChordContext) => void;
    /**
     * Enter a parse tree produced by `TcclParser.chordInput`.
     * @param ctx the parse tree
     */
    enterChordInput?: (ctx: ChordInputContext) => void;
    /**
     * Exit a parse tree produced by `TcclParser.chordInput`.
     * @param ctx the parse tree
     */
    exitChordInput?: (ctx: ChordInputContext) => void;
    /**
     * Enter a parse tree produced by `TcclParser.chordOutput`.
     * @param ctx the parse tree
     */
    enterChordOutput?: (ctx: ChordOutputContext) => void;
    /**
     * Exit a parse tree produced by `TcclParser.chordOutput`.
     * @param ctx the parse tree
     */
    exitChordOutput?: (ctx: ChordOutputContext) => void;

    visitTerminal(node: TerminalNode): void {}
    visitErrorNode(node: ErrorNode): void {}
    enterEveryRule(node: ParserRuleContext): void {}
    exitEveryRule(node: ParserRuleContext): void {}
}

