import { inject, Injectable } from '@angular/core';
import type { editor, languages, Position } from 'monaco-editor';
import { ACTIONS } from '../data/actions.const';
import { ActionType } from '../model/action.model';
import { TcclTokensProviderService } from './tccl-tokens-provider.service';

@Injectable({ providedIn: 'root' })
export class TcclHoverProvider implements languages.HoverProvider {
  public tokensProvider = inject(TcclTokensProviderService);

  provideHover(
    model: editor.ITextModel,
    position: Position,
  ): languages.ProviderResult<languages.Hover> {
    const lineContent = model.getLineContent(position.lineNumber);
    const lineTokens = this.tokensProvider.tokenize(lineContent).tokens;
    lineTokens.reverse();
    const targetTokenIndex = lineTokens.findIndex(
      (t) => t.startIndex <= position.column,
    );
    if (targetTokenIndex === -1) {
      return null;
    }
    const targetToken = lineTokens[targetTokenIndex];
    let token: string | null = null;
    if (targetTokenIndex > 0) {
      const nextToken = lineTokens[targetTokenIndex - 1];
      token = lineContent.slice(targetToken.startIndex, nextToken.startIndex);
    } else {
      token = lineContent.slice(targetToken.startIndex);
    }
    if (token) {
      const match = /^<(\d+)>$/.exec(token);
      if (match) {
        const actionCodeId = +match[1];
        const action = ACTIONS.find((a) => a.codeId === actionCodeId);
        if (action) {
          const header = [
            action.title,
            action.type === ActionType.NonKey ? `(${action.actionName})` : null,
          ]
            .filter(Boolean)
            .join(' ');
          return {
            contents: [
              {
                value: `**Action Code ${match[1]}${header ? `: ${header}` : ''}**\n\n${action.description}`,
              },
            ],
            range: {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: targetToken.startIndex,
              endColumn: targetToken.startIndex + token.length,
            },
          };
        }
      }
    }
    return null;
  }
}
