import { TcclWorker } from './tccl-worker';

self.onmessage = () => {
  (monaco as any).worker.initialize((ctx) => {
    return new TcclWorker(ctx);
  });
};
