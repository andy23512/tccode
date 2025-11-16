import { Injectable } from '@angular/core';
import type { editor, languages } from 'monaco-editor';
import * as monaco from 'monaco-editor';

@Injectable({ providedIn: 'root' })
export class TcclFoldingRangeProviderService
  implements languages.FoldingRangeProvider
{
  provideFoldingRanges(
    model: editor.ITextModel,
  ): languages.ProviderResult<languages.FoldingRange[]> {
    const ranges = [];
    const pattern = /^(\s*)(.+)/;
    for (let i = 1, count = model.getLineCount(); i <= count; i++) {
      const line = model.getLineContent(i);
      const matches = pattern.exec(line);
      if (matches) {
        const indentLen = matches[1].length;
        let endLine = i + 1;
        let lastNotEmptyLine = i;
        while (endLine <= count) {
          const lineContent = model.getLineContent(endLine);
          const subMatches = pattern.exec(lineContent);
          if (subMatches !== null) {
            if (subMatches[1].length > indentLen) {
              lastNotEmptyLine = endLine;
            } else {
              break;
            }
          }
          endLine++;
        }

        if (lastNotEmptyLine > i) {
          ranges.push({
            start: i,
            end: lastNotEmptyLine,
            kind: monaco.languages.FoldingRangeKind.Region,
          });
        }
      }
    }
    return ranges;
  }
}
