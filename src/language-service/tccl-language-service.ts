import { TcclFileContext } from '../antlr/TcclParser';
import { TcclError } from './tccl-error-listener';
import { parseAndGetAstRoot, parseAndGetSyntaxErrors } from './tccl-parser';
import { TcclValidateOptions } from './tccl-validate-option';

export class TcclLanguageService {
  public validate(code: string, option: TcclValidateOptions): TcclError[] {
    const syntaxErrors: TcclError[] = parseAndGetSyntaxErrors(code);
    const ast: TcclFileContext = parseAndGetAstRoot(code);
    return syntaxErrors.concat(checkSemanticRules(ast, option));
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
  ast.chord().forEach((chordNode) => {
    const chordInputNode = chordNode.chordInput();
    const chordInputKeys = chordInputNode
      .CHORD_INPUT_KEY()
      .map((k) => k.getText());
    chordInputKeys.sort((a, b) => a.localeCompare(b));
    const chordInputIdentifier = chordInputKeys.join('\t');
    const chordInfo = {
      lineNumber: chordNode.stop.line,
      chord: chordNode.toString(),
    };
    if (chordMap.has(chordInputIdentifier)) {
      chordMap.get(chordInputIdentifier).push(chordInfo);
    } else {
      chordMap.set(chordInputIdentifier, [chordInfo]);
    }
  });
  return [...chordMap.values()]
    .filter((chordInfos) => chordInfos.length > 1)
    .flatMap((chordInfos) =>
      chordInfos.map((chordInfo) => ({
        code: '2',
        endColumn: Infinity,
        startColumn: 0,
        startLineNumber: chordInfo.lineNumber,
        endLineNumber: chordInfo.lineNumber,
        message: 'Multiple chords with same chord input are detected.',
      })),
    );
}
