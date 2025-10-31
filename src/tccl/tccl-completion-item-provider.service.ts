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

  public triggerCharacters = [' '];

  public async provideCompletionItems(
    model: editor.ITextModel,
    position: Position,
  ): Promise<languages.CompletionList> {
    const input = model.getValue();
    if (!input) return;

    const word = model.getWordUntilPosition(position);
    const range = new monaco.Range(
      position.lineNumber,
      word.startColumn,
      position.lineNumber,
      word.endColumn,
    );
    const atIndex = model.getOffsetAt(range.getStartPosition());
    const worker = await this.tcclWorkerAccessorService.getWorker(model.uri);
    const suggestions = await worker.getSuggestions(input, range, atIndex);
    return {
      incomplete: false,
      suggestions,
    };
  }
}
