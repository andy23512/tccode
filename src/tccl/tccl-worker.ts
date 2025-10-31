import type { languages, Range, worker } from 'monaco-editor';
import { TcclError } from '../language-service/tccl-error-listener';
import { TcclLanguageService } from '../language-service/tccl-language-service';
import { TcclValidateOptions } from '../language-service/tccl-validate-option';

type IWorkerContext = worker.IWorkerContext;

export class TcclWorker {
  private languageService: TcclLanguageService;

  constructor(private _ctx: IWorkerContext) {
    this.languageService = new TcclLanguageService();
  }

  public async doValidation(option: TcclValidateOptions): Promise<TcclError[]> {
    const code = this.getTextDocument();
    if (!code) {
      return [];
    }
    return this.languageService.validate(code, option);
  }

  public async getSuggestions(
    input: string,
    range: Range,
    atIndex: number,
  ): Promise<languages.CompletionItem[]> {
    const suggestions = this.languageService.autoComplete(input, atIndex);
    return [...suggestions];
  }

  private getTextDocument(): string {
    return this.getModel().getValue();
  }

  private getModel(): worker.IMirrorModel {
    return this._ctx.getMirrorModels()[0]; // When there are multiple files open, this will be an array
  }
}
