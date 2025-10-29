import type { Uri } from 'monaco-editor';
import * as monaco from 'monaco-editor';
import {
  TCCL_LANGUAGE_ID,
  TCCL_THEME_DATA,
  TCCL_THEME_NAME,
} from './tccl-config';
import { TcclDiagnosticsAdapter } from './tccl-diagnostics-adapter';
import { TcclTokensProvider } from './tccl-tokens-provider';
import { TcclWorker } from './tccl-worker';
import { TcclWorkerManager } from './tccl-worker-manager';

export function setupTcclLanguage() {
  window.MonacoEnvironment = {
    getWorker: function () {
      return new Worker(new URL('./tccl.worker', import.meta.url));
    },
  };

  monaco.languages.register({ id: TCCL_LANGUAGE_ID });
  monaco.languages.setTokensProvider(
    TCCL_LANGUAGE_ID,
    new TcclTokensProvider(),
  );
  monaco.editor.defineTheme(TCCL_THEME_NAME, TCCL_THEME_DATA);

  const client = new TcclWorkerManager();

  const worker: WorkerAccessor = (...uris: Uri[]): Promise<TcclWorker> => {
    return client.getLanguageServiceWorker(...uris);
  };
  //Call the errors provider
  new TcclDiagnosticsAdapter(worker);
}

export type WorkerAccessor = (...uris: Uri[]) => Promise<TcclWorker>;
