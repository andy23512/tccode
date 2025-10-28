import type { editor, Uri } from 'monaco-editor';
import * as monaco from 'monaco-editor';
import { WorkerAccessor } from '../tccl/setup';
import { TcclDiagnosticsAdapter } from '../tccl/tccl-diagnostics-adapter';
import { TcclTokensProvider } from '../tccl/tccl-tokens-provider';
import { TcclWorker } from '../tccl/tccl-worker';
import { TcclWorkerManager } from '../tccl/tccl-worker-manager';
import {
  TCCL_LANGUAGE_ID,
  TCCL_THEME_DATA,
  TCCL_THEME_NAME,
} from './tccl-language.config';

monaco.languages.register({ id: TCCL_LANGUAGE_ID });
monaco.languages.setTokensProvider(TCCL_LANGUAGE_ID, new TcclTokensProvider());
monaco.editor.defineTheme(TCCL_THEME_NAME, TCCL_THEME_DATA);

const client = new TcclWorkerManager();

const worker: WorkerAccessor = (...uris: Uri[]): Promise<TcclWorker> => {
  return client.getLanguageServiceWorker(...uris);
};
//Call the errors provider
new TcclDiagnosticsAdapter(worker);

export const MONACO_EDITOR_OPTIONS: editor.IStandaloneEditorConstructionOptions =
  {
    language: TCCL_LANGUAGE_ID,
    automaticLayout: true,
    fontFamily: 'Consolas, "Courier New", monospace',
    fontSize: 20,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    theme: TCCL_THEME_NAME,
    wordWrap: 'off',
    renderWhitespace: 'all',
  };
