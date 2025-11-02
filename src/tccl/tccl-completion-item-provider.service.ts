import { inject, Injectable } from '@angular/core';
import type { editor, languages, Position } from 'monaco-editor';
import * as monaco from 'monaco-editor';
import { TcclWorkerAccessorService } from './tccl-worker-accessor.service';

@Injectable({ providedIn: 'root' })
export class TcclCompletionItemProviderService
  implements languages.CompletionItemProvider
{
  private readonly tcclWorkerAccessorService = inject(
    TcclWorkerAccessorService,
  );

  public triggerCharacters = [
    ' ',
    ...'abcdefghijklmnopqrstuvwxyz'.split(''),
    ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  ];

  public async provideCompletionItems(
    model: editor.ITextModel,
    position: Position,
  ): Promise<languages.CompletionList> {
    const input = model.getValueInRange(
      new monaco.Range(1, 1, position.lineNumber, position.column),
    );
    const currentLine = model.getValueInRange(
      new monaco.Range(
        position.lineNumber,
        1,
        position.lineNumber,
        position.column,
      ),
    );
    const match = currentLine.match(/ +$/);
    const spaceCount = match ? match[0].length : 0;
    const worker = await this.tcclWorkerAccessorService.getWorker(model.uri);
    const suggestions = await worker.getSuggestions(input, position);
    return {
      incomplete: false,
      suggestions: suggestions.map(({ value, optionType }) => ({
        label: value,
        kind: optionType,
        insertText: value,
        range: new monaco.Range(
          position.lineNumber,
          position.column - spaceCount,
          position.lineNumber,
          position.column,
        ),
      })),
    };
  }
}
