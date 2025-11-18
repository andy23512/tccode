import { CodeCompletionCore } from 'antlr4-c3';
import { ParseTree, TerminalNode } from 'antlr4ng';
import type { languages, Position } from 'monaco-editor';
import {
  ChordNodeContext,
  TcclFileContext,
  TcclParser,
} from '../antlr/TcclParser';
import { TcclParserVisitor } from '../antlr/TcclParserVisitor';
import { BOPOMOFO_CHORD_MAP } from '../data/bopomofo.const';
import { convertChordInputKeysToIdentifier } from '../util/chord-identifier.util';
import { TcclCompletionItem } from './tccl-completion-item';
import { TcclError } from './tccl-error-listener';
import { parseTccl } from './tccl-parser';
import { TcclValidateOptions } from './tccl-validate-option';

export class TcclLanguageService {
  public validate(code: string, option: TcclValidateOptions): TcclError[] {
    const { ast, errors } = parseTccl(code);
    return errors.concat(checkSemanticRules(ast, option));
  }

  public autoComplete(code: string, position: Position): TcclCompletionItem[] {
    const { ast, parser } = parseTccl(code);
    const tokenIndex = computeTokenIndex(ast, position);
    if (typeof tokenIndex === 'undefined') {
      return [];
    }
    const core = new CodeCompletionCore(parser);
    const completionItems: {
      value: string;
      optionType: languages.CompletionItemKind;
    }[] = [];
    const operatorSet = new Set<string>();
    for (const rule of [
      TcclParser.RULE_tcclFile,
      TcclParser.RULE_chord,
      TcclParser.RULE_chordInput,
      TcclParser.RULE_chordOutput,
    ]) {
      core.preferredRules = new Set([rule]);
      const candidates = core.collectCandidates(tokenIndex);
      for (const ct of candidates.tokens) {
        let name = parser.vocabulary.getDisplayName(ct[0]) as string;
        if (name === "' + '" || name === "' = '") {
          name = name.replace(/'/g, '');
          operatorSet.add(name);
        }
      }
    }
    [...operatorSet].forEach((operator) => {
      completionItems.push({
        value: operator,
        optionType: 11, // TODO
      });
    });
    return completionItems;
  }
}

function checkSemanticRules(
  ast: TcclFileContext,
  option: TcclValidateOptions,
): TcclError[] {
  interface ChordInfo {
    lineNumber: number;
    startColumn: number;
    endColumn: number;
    chord: string;
  }
  const chordInputPathMap = new Map<string, ChordInfo[]>();
  const chordInputMap = new Map<string, ChordInfo[]>();
  let errors: TcclError[] = [];

  class Visitor extends TcclParserVisitor<void> {
    public visitChordNode = (chordNodeContext: ChordNodeContext): void => {
      const chordContext = chordNodeContext.chord();
      const chordInputContext = chordContext.chordInput();
      if (!chordInputContext.stop || !chordInputContext.start) {
        return;
      }
      const chordInfo: ChordInfo = {
        lineNumber: chordInputContext.start.line,
        startColumn: chordInputContext.start.column,
        endColumn: chordInputContext.stop.column + 1,
        chord: chordContext.toString(),
      };
      const chordInputPathIdentifier =
        getChordInputIdentifierPathFromChordNodeContext(chordNodeContext);
      const targetChordInfoListInChordInputPathMap = chordInputPathMap.get(
        chordInputPathIdentifier,
      );
      if (targetChordInfoListInChordInputPathMap) {
        targetChordInfoListInChordInputPathMap.push(chordInfo);
      } else {
        chordInputPathMap.set(chordInputPathIdentifier, [chordInfo]);
      }
      const chordInputIdentifier =
        getChordInputIdentifierFromChordNodeContext(chordNodeContext);
      const targetChordInfoListInChordInputMap =
        chordInputMap.get(chordInputIdentifier);
      if (targetChordInfoListInChordInputMap) {
        targetChordInfoListInChordInputMap.push(chordInfo);
      } else {
        chordInputMap.set(chordInputIdentifier, [chordInfo]);
      }
    };
  }

  const visitor = new Visitor();
  visitor.visit(ast);
  errors = errors.concat(
    [...chordInputPathMap.values()]
      .filter((chordInfos) => chordInfos.length > 1)
      .flatMap((chordInfos) =>
        chordInfos.map((chordInfo) => ({
          code: 'DUPLICATED_CHORD_INPUT',
          startColumn: chordInfo.startColumn,
          endColumn: chordInfo.endColumn + 1,
          startLineNumber: chordInfo.lineNumber,
          endLineNumber: chordInfo.lineNumber,
          message: 'Multiple chords with same chord input path are detected.',
          severity: 'error',
        })),
      ),
  );
  if (option.detectConflictsWithBopomofoChords) {
    errors = errors.concat(
      [...chordInputMap.entries()]
        .filter(([identifier]) => BOPOMOFO_CHORD_MAP.has(identifier))
        .flatMap(([identifier, chordInfos]) => {
          const bopomofoChordOutput = BOPOMOFO_CHORD_MAP.get(identifier);
          return chordInfos.map((chordInfo) => ({
            code: 'BPMF_CHORD_CONFLICT',
            startColumn: chordInfo.startColumn,
            endColumn: chordInfo.endColumn + 1,
            startLineNumber: chordInfo.lineNumber,
            endLineNumber: chordInfo.lineNumber,
            message: `This chord conflicts with Bopomofo chord 「${bopomofoChordOutput}」.`,
            severity: 'warning',
          }));
        }),
    );
  }
  return errors;
}

function getChordInputIdentifierFromChordNodeContext(
  chordNodeContext: ChordNodeContext,
): string {
  return convertChordInputKeysToIdentifier(
    chordNodeContext
      .chord()
      .chordInput()
      .CHORD_INPUT_KEY()
      .map((k) => k.getText()),
  );
}

function getChordInputIdentifierPathFromChordNodeContext(
  chordNodeContext: ChordNodeContext,
): string {
  const chordInputIdentifier =
    getChordInputIdentifierFromChordNodeContext(chordNodeContext);
  const parent = chordNodeContext.parent;
  if (parent instanceof ChordNodeContext) {
    return (
      getChordInputIdentifierPathFromChordNodeContext(parent) +
      '|' +
      chordInputIdentifier
    );
  }
  return chordInputIdentifier;
}

function computeTokenIndex(parseTree: ParseTree, caretPosition: Position) {
  if (parseTree instanceof TerminalNode) {
    return computeTokenIndexOfTerminalNode(parseTree, caretPosition);
  }
  return computeTokenIndexOfChildNode(parseTree, caretPosition);
}

function computeTokenIndexOfTerminalNode(
  parseTree: TerminalNode,
  caretPosition: Position,
): number | undefined {
  const start = parseTree.symbol.column;
  const stop = parseTree.symbol.column + parseTree.getText().length;
  if (
    parseTree.symbol.line === caretPosition.lineNumber &&
    start <= caretPosition.column &&
    stop >= caretPosition.column
  ) {
    return parseTree.symbol.tokenIndex;
  }
  return undefined;
}

function computeTokenIndexOfChildNode(
  parseTree: ParseTree,
  caretPosition: Position,
): number | undefined {
  for (let i = 0; i < parseTree.getChildCount(); i++) {
    const index: number | undefined = computeTokenIndex(
      parseTree.getChild(i) as ParseTree,
      caretPosition,
    );
    if (index !== undefined) {
      return index;
    }
  }
  return undefined;
}
