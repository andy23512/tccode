import { CodeCompletionCore } from 'antlr4-c3';
import type { languages } from 'monaco-editor';
import { TcclFileContext, TcclParser } from '../antlr/TcclParser';
import { BOPOMOFO_CHORD_MAP } from '../data/bopomofo.const';
import { convertChordInputKeysToIdentifier } from '../util/chord-identifier.util';
import { TcclError } from './tccl-error-listener';
import {
  getParser,
  getTokenStream,
  parseAndGetAstRoot,
  parseAndGetSyntaxErrors,
} from './tccl-parser';
import { TcclValidateOptions } from './tccl-validate-option';

export class TcclLanguageService {
  public validate(code: string, option: TcclValidateOptions): TcclError[] {
    const syntaxErrors: TcclError[] = parseAndGetSyntaxErrors(code);
    const ast: TcclFileContext = parseAndGetAstRoot(code);
    return syntaxErrors.concat(checkSemanticRules(ast, option));
  }

  public autoComplete(
    code: string,
    atIndex: number,
  ): languages.CompletionItem[] {
    const tokenStream = getTokenStream(code);
    const parser = getParser(tokenStream);
    const core = new CodeCompletionCore(parser);
    for (const rule of [
      TcclParser.RULE_tcclFile,
      TcclParser.RULE_chord,
      TcclParser.RULE_chordInput,
      TcclParser.RULE_chordOutput,
    ]) {
      core.preferredRules = new Set([rule]);
      const candidates = core.collectCandidates(atIndex);
      console.log(rule, candidates.rules, candidates.tokens);
      for (const ct of candidates.tokens) {
        console.log(ct);
        console.log(parser.vocabulary.getDisplayNames());
        console.log(parser.vocabulary.getDisplayName(ct[0]));
      }
      for (const cr of candidates.rules) {
        console.log(
          cr[0],
          TcclParser.RULE_tcclFile,
          TcclParser.RULE_chord,
          TcclParser.RULE_chordInput,
          TcclParser.RULE_chordOutput,
        );
      }
    }
    return [];
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
