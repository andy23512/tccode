import { effect, inject, Injectable } from '@angular/core';
import type { editor, Uri } from 'monaco-editor';
import * as monaco from 'monaco-editor';
import { TcclError } from '../language-service/tccl-error-listener';
import { TcclValidateOptions } from '../language-service/tccl-validate-option';
import { SettingStore } from '../store/setting.store';
import { TCCL_LANGUAGE_ID } from './tccl-config';
import { TcclWorkerAccessorService } from './tccl-worker-accessor.service';

@Injectable({ providedIn: 'root' })
export class TcclDiagnosticsAdapterService {
  private readonly tcclWorkerAccessorService = inject(
    TcclWorkerAccessorService,
  );
  private readonly settingStore = inject(SettingStore);

  get options(): TcclValidateOptions {
    return {
      detectConflictsWithBopomofoChords:
        this.settingStore.detectConflictsWithBopomofoChords(),
    };
  }

  constructor() {
    const onModelAdd = (model: editor.IModel): void => {
      let handle: any;
      model.onDidChangeContent(() => {
        // here we are debouncing the user changes, so everytime a new change is done, we wait 500ms before validating
        // otherwise if the user is still typing, we cancel the
        clearTimeout(handle);
        handle = setTimeout(() => this.validate(model.uri, this.options), 500);
      });
    };
    monaco.editor.onDidCreateModel(onModelAdd);
    monaco.editor.getModels().forEach(onModelAdd);

    effect(() => {
      const options = this.options;
      monaco.editor
        .getModels()
        .forEach((model: editor.IModel) => this.validate(model.uri, options));
    });
  }

  private async validate(
    resource: Uri,
    options: TcclValidateOptions,
  ): Promise<void> {
    // get the worker proxy
    const worker = await this.tcclWorkerAccessorService.getWorker(resource);
    // call the validate methods proxy from the language service and get errors
    const errorMarkers = await worker.doValidation(options);
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

function toDiagnostics(error: TcclError): editor.IMarkerData {
  return {
    ...error,
    severity: monaco.MarkerSeverity.Error,
  };
}
