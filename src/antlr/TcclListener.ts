// Generated from ./Tccl.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";

import { TcclFileContext } from "./TcclParser";
import { ChordContext } from "./TcclParser";
import { ChordInputContext } from "./TcclParser";
import { ChordOutputContext } from "./TcclParser";


/**
 * This interface defines a complete listener for a parse tree produced by
 * `TcclParser`.
 */
export interface TcclListener extends ParseTreeListener {
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
}

