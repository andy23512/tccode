import type { worker as workerType } from 'monaco-editor';
import * as worker from 'monaco-editor/esm/vs/editor/editor.worker';
import { TcclWorker } from './tccl-worker';

self.onmessage = () => {
  worker.initialize((ctx: workerType.IWorkerContext) => {
    return new TcclWorker(ctx);
  });
};
