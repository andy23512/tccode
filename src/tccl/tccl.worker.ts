import * as worker from 'monaco-editor/esm/vs/editor/editor.worker';
import { TcclWorker } from './tccl-worker';

self.onmessage = () => {
  worker.initialize((ctx) => {
    return new TcclWorker(ctx);
  });
};
