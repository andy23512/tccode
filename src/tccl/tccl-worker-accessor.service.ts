import { inject, Injectable } from '@angular/core';
import type { Uri } from 'monaco-editor';
import { TcclWorker } from './tccl-worker';
import { TcclWorkerManagerService } from './tccl-worker-manager.service';

@Injectable({ providedIn: 'root' })
export class TcclWorkerAccessorService {
  private readonly tcclWorkerManager = inject(TcclWorkerManagerService);

  public getWorker(...uris: Uri[]): Promise<TcclWorker> {
    return this.tcclWorkerManager.getLanguageServiceWorker(...uris);
  }
}
