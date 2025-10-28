import * as monaco from 'monaco-editor';
import { TcclError } from '../language-service/tccl-error-listener';
import { TcclLanguageService } from '../language-service/tccl-language-service';

import IWorkerContext = monaco.worker.IWorkerContext;

export class TcclWorker {
  private languageService: TcclLanguageService;

  constructor(private _ctx: IWorkerContext) {
    this.languageService = new TcclLanguageService();
  }

  public doValidation(): Promise<TcclError[]> {
    const code = this.getTextDocument();
    return Promise.resolve(this.languageService.validate(code));
  }

  private getTextDocument(): string {
    const model = this._ctx.getMirrorModels()[0]; // When there are multiple files open, this will be an array
    return model.getValue();
  }
}
