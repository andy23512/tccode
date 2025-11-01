import { Injectable } from '@angular/core';
import type { Uri, editor } from 'monaco-editor';
import * as monaco from 'monaco-editor';
import { TCCL_LANGUAGE_ID } from './tccl-config';
import { TcclWorker } from './tccl-worker';

@Injectable({ providedIn: 'root' })
export class TcclWorkerManagerService {
  private worker: editor.MonacoWebWorker<TcclWorker> | null = null;
  private workerClientProxy: Promise<TcclWorker> | null = null;

  private getClientProxy(): Promise<TcclWorker> {
    if (!this.workerClientProxy) {
      this.worker = monaco.editor.createWebWorker<TcclWorker>({
        moduleId: 'TcclWorker',
        label: TCCL_LANGUAGE_ID,
        createData: {
          languageId: TCCL_LANGUAGE_ID,
        },
      });
      this.workerClientProxy =
        this.worker.getProxy() as any as Promise<TcclWorker>;
    }
    return this.workerClientProxy;
  }

  async getLanguageServiceWorker(...resources: Uri[]): Promise<TcclWorker> {
    const _client: TcclWorker = await this.getClientProxy();
    await this.worker?.withSyncedResources(resources);
    return _client;
  }
}
