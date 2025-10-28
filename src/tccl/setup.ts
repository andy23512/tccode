import type { Uri } from 'monaco-editor';
import { TcclWorker } from './tccl-worker';

export type WorkerAccessor = (...uris: Uri[]) => Promise<TcclWorker>;
