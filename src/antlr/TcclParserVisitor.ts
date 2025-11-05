
import { AbstractParseTreeVisitor } from "antlr4ng";


import { TcclFileContext } from "./TcclParser.js";
import { ChordNodeContext } from "./TcclParser.js";
import { ChordContext } from "./TcclParser.js";
import { ChordInputContext } from "./TcclParser.js";
import { ChordOutputContext } from "./TcclParser.js";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `TcclParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export class TcclParserVisitor<Result> extends AbstractParseTreeVisitor<Result> {
    /**
     * Visit a parse tree produced by `TcclParser.tcclFile`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTcclFile?: (ctx: TcclFileContext) => Result;
    /**
     * Visit a parse tree produced by `TcclParser.chordNode`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitChordNode?: (ctx: ChordNodeContext) => Result;
    /**
     * Visit a parse tree produced by `TcclParser.chord`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitChord?: (ctx: ChordContext) => Result;
    /**
     * Visit a parse tree produced by `TcclParser.chordInput`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitChordInput?: (ctx: ChordInputContext) => Result;
    /**
     * Visit a parse tree produced by `TcclParser.chordOutput`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitChordOutput?: (ctx: ChordOutputContext) => Result;
}

