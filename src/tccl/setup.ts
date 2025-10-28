import * as monaco from 'monaco-editor';
/*
monaco.languages.onLanguage(TCCL_LANGUAGE_ID, () => {
  monaco.languages.setMonarchTokensProvider(TCCL_LANGUAGE_ID, monarchLanguage);
  monaco.languages.setLanguageConfiguration(
    TCCL_LANGUAGE_ID,
    richLanguageConfiguration,
  );
  const client = new TcclWorkerManager();

  const worker: WorkerAccessor = (
    ...uris: monaco.Uri[]
  ): Promise<TcclWorker> => {
    return client.getLanguageServiceWorker(...uris);
  };
  // call the errors provider
  new TcclDiagnosticsAdapter(worker);
});
*/

import { TcclWorker } from './tccl-worker';

export type WorkerAccessor = (...uris: monaco.Uri[]) => Promise<TcclWorker>;
