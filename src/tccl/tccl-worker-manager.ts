import type { Uri, editor } from 'monaco-editor';
import * as monaco from 'monaco-editor';
import { TCCL_LANGUAGE_ID } from '../config/tccl-language.config';
import { TcclWorker } from './tccl-worker';

export class TcclWorkerManager {
  private worker: editor.MonacoWebWorker<TcclWorker>;
  private workerClientProxy: Promise<TcclWorker>;

  constructor() {
    this.worker = null;
  }

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
    await this.worker.withSyncedResources(resources);
    return _client;
  }
}
