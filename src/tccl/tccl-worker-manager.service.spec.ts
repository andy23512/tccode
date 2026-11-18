import { TestBed } from '@angular/core/testing';
import type { Uri } from 'monaco-editor';
import { TCCL_LANGUAGE_ID } from './tccl-config';
import { TcclWorkerManagerService } from './tccl-worker-manager.service';

const mockProxy = { marker: 'proxy' };
const mockWebWorker = {
  getProxy: jest.fn(),
  withSyncedResources: jest.fn(),
};
const createWebWorker = jest.fn();

jest.mock('monaco-editor', () => ({
  editor: { createWebWorker: (...args: unknown[]) => createWebWorker(...args) },
}));

describe('TcclWorkerManagerService', () => {
  let service: TcclWorkerManagerService;
  const uri = (name: string) => ({ name }) as unknown as Uri;

  beforeEach(() => {
    createWebWorker.mockReset().mockReturnValue(mockWebWorker);
    mockWebWorker.getProxy.mockReset().mockResolvedValue(mockProxy);
    mockWebWorker.withSyncedResources.mockReset().mockResolvedValue(undefined);
    service = TestBed.inject(TcclWorkerManagerService);
  });

  it('creates the web worker for the TCCL language and returns its proxy', async () => {
    const proxy = await service.getLanguageServiceWorker(uri('a'));
    expect(proxy).toBe(mockProxy);
    expect(createWebWorker).toHaveBeenCalledWith({
      moduleId: 'TcclWorker',
      label: TCCL_LANGUAGE_ID,
      createData: { languageId: TCCL_LANGUAGE_ID },
    });
  });

  it('syncs the requested resources every time', async () => {
    const a = uri('a');
    const b = uri('b');
    await service.getLanguageServiceWorker(a);
    await service.getLanguageServiceWorker(a, b);
    expect(mockWebWorker.withSyncedResources).toHaveBeenNthCalledWith(1, [a]);
    expect(mockWebWorker.withSyncedResources).toHaveBeenNthCalledWith(2, [
      a,
      b,
    ]);
  });

  it('creates the web worker only once', async () => {
    await service.getLanguageServiceWorker(uri('a'));
    await service.getLanguageServiceWorker(uri('b'));
    expect(createWebWorker).toHaveBeenCalledTimes(1);
    expect(mockWebWorker.getProxy).toHaveBeenCalledTimes(1);
  });
});
