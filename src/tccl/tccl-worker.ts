import type { worker } from 'monaco-editor';
import { TcclError } from '../language-service/tccl-error-listener';
import { TcclLanguageService } from '../language-service/tccl-language-service';
import { TcclValidateOptions } from '../language-service/tccl-validate-option';

type IWorkerContext = worker.IWorkerContext;

export class TcclWorker {
  private languageService: TcclLanguageService;

  constructor(private _ctx: IWorkerContext) {
    this.languageService = new TcclLanguageService();
  }

  public doValidation(option: TcclValidateOptions): Promise<TcclError[]> {
    const code = this.getTextDocument();
    return Promise.resolve(this.languageService.validate(code, option));
  }

  private getTextDocument(): string {
    const model = this._ctx.getMirrorModels()[0]; // When there are multiple files open, this will be an array
    return model.getValue();
  }
}
