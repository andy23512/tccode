import { CodeCompletionCore } from 'antlr4-c3';
import { ParseTree, TerminalNode } from 'antlr4ng';
import type { languages, Position } from 'monaco-editor';
import { TcclFileContext, TcclParser } from '../antlr/TcclParser';
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
    chord: string;
  }
  const chordMap = new Map<string, ChordInfo[]>();
  let errors: TcclError[] = [];
  ast.chord().forEach((chordNode) => {
    if (!chordNode.stop) {
      return;
    }
    const chordInputNode = chordNode.chordInput();
    const chordInputKeys = chordInputNode
      .CHORD_INPUT_KEY()
      .map((k) => k.getText());
    const chordInputIdentifier =
      convertChordInputKeysToIdentifier(chordInputKeys);
    const chordInfo = {
      lineNumber: chordNode.stop.line,
      chord: chordNode.toString(),
    };
    const targetChordInfoList = chordMap.get(chordInputIdentifier);
    if (targetChordInfoList) {
      targetChordInfoList.push(chordInfo);
    } else {
      chordMap.set(chordInputIdentifier, [chordInfo]);
    }
  });
  errors = errors.concat(
    [...chordMap.values()]
      .filter((chordInfos) => chordInfos.length > 1)
      .flatMap((chordInfos) =>
        chordInfos.map((chordInfo) => ({
          code: 'DUPLICATED_CHORD_INPUT',
          endColumn: Infinity,
          startColumn: 0,
          startLineNumber: chordInfo.lineNumber,
          endLineNumber: chordInfo.lineNumber,
          message: 'Multiple chords with same chord input are detected.',
        })),
      ),
  );
  if (option.detectConflictsWithBopomofoChords) {
    errors = errors.concat(
      [...chordMap.entries()]
        .filter(([identifier]) => BOPOMOFO_CHORD_MAP.has(identifier))
        .flatMap(([identifier, chordInfos]) => {
          const bopomofoChordOutput = BOPOMOFO_CHORD_MAP.get(identifier);
          return chordInfos.map((chordInfo) => ({
            code: 'BPMF_CHORD_CONFLICT',
            endColumn: Infinity,
            startColumn: 0,
            startLineNumber: chordInfo.lineNumber,
            endLineNumber: chordInfo.lineNumber,
            message: `This chord conflicts with Bopomofo chord 「${bopomofoChordOutput}」.`,
          }));
        }),
    );
  }
  return errors;
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
