import * as monaco from 'monaco-editor';
import { TCCL_LANGUAGE_ID } from '../config/tccl-language.config';
import { TcclError } from '../language-service/tccl-error-listener';
import { WorkerAccessor } from './setup';

export class TcclDiagnosticsAdapter {
  constructor(private worker: WorkerAccessor) {
    const onModelAdd = (model: monaco.editor.IModel): void => {
      let handle: any;
      model.onDidChangeContent(() => {
        // here we are debouncing the user changes, so everytime a new change is done, we wait 500ms before validating
        // otherwise if the user is still typing, we cancel the
        clearTimeout(handle);
        handle = setTimeout(() => this.validate(model.uri), 500);
      });
    };
    monaco.editor.onDidCreateModel(onModelAdd);
    monaco.editor.getModels().forEach(onModelAdd);
  }

  private async validate(resource: monaco.Uri): Promise<void> {
    // get the worker proxy
    const worker = await this.worker(resource);
    // call the validate methods proxy from the language service and get errors
    const errorMarkers = await worker.doValidation();
    // get the current model(editor or file) which is only one
    const model = monaco.editor.getModel(resource);
    // add the error markers and underline them with severity of error
    monaco.editor.setModelMarkers(
      model,
      TCCL_LANGUAGE_ID,
      errorMarkers.map(toDiagnostics),
    );
  }
}

function toDiagnostics(error: TcclError): monaco.editor.IMarkerData {
  return {
    ...error,
    severity: monaco.MarkerSeverity.Error,
  };
}
