import { inject } from '@angular/core';
import type { Uri } from 'monaco-editor';
import * as monaco from 'monaco-editor';
import { TcclCompletionItemProviderService } from './tccl-completion-item-provider.service';
import {
  TCCL_LANGUAGE_ID,
  TCCL_THEME_DATA,
  TCCL_THEME_NAME,
} from './tccl-config';
import { TcclDiagnosticsAdapterService } from './tccl-diagnostics-adapter.service';
import { TcclFoldingRangeProviderService } from './tccl-folding-range-provider.service';
import { TcclHoverProvider } from './tccl-hover-provider.service';
import { TcclTokensProviderService } from './tccl-tokens-provider.service';
import { TcclWorker } from './tccl-worker';

export function setupTcclLanguage(): void {
  window.MonacoEnvironment = {
    getWorker: function () {
      return new Worker(new URL('./tccl.worker', import.meta.url));
    },
  };

  monaco.languages.register({ id: TCCL_LANGUAGE_ID });
  monaco.languages.setTokensProvider(
    TCCL_LANGUAGE_ID,
    inject(TcclTokensProviderService),
  );
  monaco.languages.registerCompletionItemProvider(
    TCCL_LANGUAGE_ID,
    inject(TcclCompletionItemProviderService),
  );
  monaco.languages.registerFoldingRangeProvider(
    TCCL_LANGUAGE_ID,
    inject(TcclFoldingRangeProviderService),
  );
  monaco.languages.registerHoverProvider(
    TCCL_LANGUAGE_ID,
    inject(TcclHoverProvider),
  );
  monaco.editor.defineTheme(TCCL_THEME_NAME, TCCL_THEME_DATA);

  //Call the errors provider
  inject(TcclDiagnosticsAdapterService);
}

export type WorkerAccessor = (...uris: Uri[]) => Promise<TcclWorker>;
