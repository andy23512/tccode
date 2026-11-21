import { TestBed } from '@angular/core/testing';
import type { Uri } from 'monaco-editor';
import { TcclError } from '../language-service/tccl-error-listener';
import { SettingStore } from '../store/setting.store';
import { TcclDiagnosticsAdapterService } from './tccl-diagnostics-adapter.service';
import { TcclWorkerAccessorService } from './tccl-worker-accessor.service';

type Model = {
  uri: Uri;
  onDidChangeContent: jest.Mock;
  fireChange: () => void;
};

const monacoMock = {
  models: [] as Model[],
  onCreateModel: null as null | ((m: Model) => void),
  setModelMarkers: jest.fn(),
};

const makeModel = (name: string): Model => {
  let listener: (() => void) | null = null;
  return {
    uri: { name } as unknown as Uri,
    onDidChangeContent: jest.fn((cb: () => void) => {
      listener = cb;
    }),
    fireChange: () => listener?.(),
  };
};

jest.mock('monaco-editor', () => ({
  MarkerSeverity: { Hint: 1, Info: 2, Warning: 4, Error: 8 },
  editor: {
    onDidCreateModel: (cb: (m: Model) => void) => {
      monacoMock.onCreateModel = cb;
    },
    getModels: () => monacoMock.models,
    getModel: (uri: Uri) => monacoMock.models.find((m) => m.uri === uri) ?? null,
    setModelMarkers: (...args: unknown[]) => monacoMock.setModelMarkers(...args),
  },
}));

const error = (severity: 'error' | 'warning', message = 'm'): TcclError => ({
  startLineNumber: 1,
  startColumn: 2,
  endLineNumber: 3,
  endColumn: 4,
  message,
  code: '1',
  severity,
});

describe('TcclDiagnosticsAdapterService', () => {
  const worker = { doValidation: jest.fn() };
  const accessor = { getWorker: jest.fn() };
  let settings: InstanceType<typeof SettingStore>;

  const flush = async () => {
    await jest.advanceTimersByTimeAsync(0);
    TestBed.tick();
    await jest.advanceTimersByTimeAsync(0);
  };

  const create = () => TestBed.inject(TcclDiagnosticsAdapterService);

  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
    monacoMock.models = [];
    monacoMock.onCreateModel = null;
    monacoMock.setModelMarkers.mockReset();
    worker.doValidation.mockReset().mockResolvedValue([]);
    accessor.getWorker.mockReset().mockResolvedValue(worker);
    TestBed.configureTestingModule({
      providers: [{ provide: TcclWorkerAccessorService, useValue: accessor }],
    });
    settings = TestBed.inject(SettingStore);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('exposes the Bopomofo conflict setting as validation options', () => {
    const service = create();
    expect(service.options).toEqual({ detectConflictsWithBopomofoChords: false });
    settings.set('detectConflictsWithBopomofoChords', true);
    expect(service.options).toEqual({ detectConflictsWithBopomofoChords: true });
  });

  it('validates every existing model once on start, with the current options', async () => {
    const a = makeModel('a');
    const b = makeModel('b');
    monacoMock.models = [a, b];
    create();
    await flush();
    expect(accessor.getWorker.mock.calls.map((c) => c[0])).toEqual([a.uri, b.uri]);
    expect(worker.doValidation).toHaveBeenCalledTimes(2);
    expect(worker.doValidation).toHaveBeenCalledWith({
      detectConflictsWithBopomofoChords: false,
    });
  });

  it('validates again for every model when the Bopomofo setting changes', async () => {
    monacoMock.models = [makeModel('a'), makeModel('b')];
    create();
    await flush();
    worker.doValidation.mockClear();
    settings.set('detectConflictsWithBopomofoChords', true);
    await flush();
    expect(worker.doValidation).toHaveBeenCalledTimes(2);
    expect(worker.doValidation).toHaveBeenCalledWith({
      detectConflictsWithBopomofoChords: true,
    });
  });

  it('does not validate again when another setting changes', async () => {
    monacoMock.models = [makeModel('a')];
    create();
    await flush();
    worker.doValidation.mockClear();
    settings.set('keyBindings', 'Vim' as never);
    await flush();
    expect(worker.doValidation).not.toHaveBeenCalled();
  });

  it('waits 500 ms after an edit before validating', async () => {
    const model = makeModel('a');
    monacoMock.models = [model];
    create();
    await flush();
    worker.doValidation.mockClear();
    model.fireChange();
    await jest.advanceTimersByTimeAsync(499);
    expect(worker.doValidation).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(1);
    expect(worker.doValidation).toHaveBeenCalledTimes(1);
  });

  it('restarts the wait on every edit, so a burst of edits validates once', async () => {
    const model = makeModel('a');
    monacoMock.models = [model];
    create();
    await flush();
    worker.doValidation.mockClear();
    model.fireChange();
    await jest.advanceTimersByTimeAsync(400);
    model.fireChange();
    await jest.advanceTimersByTimeAsync(400);
    expect(worker.doValidation).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(100);
    expect(worker.doValidation).toHaveBeenCalledTimes(1);
  });

  it('watches models created later as well', async () => {
    create();
    await flush();
    worker.doValidation.mockClear();
    const late = makeModel('late');
    monacoMock.models = [late];
    monacoMock.onCreateModel?.(late);
    late.fireChange();
    await jest.advanceTimersByTimeAsync(500);
    expect(worker.doValidation).toHaveBeenCalledTimes(1);
    expect(accessor.getWorker).toHaveBeenLastCalledWith(late.uri);
  });

  it('keeps the wait of each model separate', async () => {
    const a = makeModel('a');
    const b = makeModel('b');
    monacoMock.models = [a, b];
    create();
    await flush();
    worker.doValidation.mockClear();
    a.fireChange();
    b.fireChange();
    await jest.advanceTimersByTimeAsync(500);
    expect(worker.doValidation).toHaveBeenCalledTimes(2);
  });

  it('sets the markers on the model under the tccl owner, turning severities into Monaco ones', async () => {
    const model = makeModel('a');
    monacoMock.models = [model];
    worker.doValidation.mockResolvedValue([error('error', 'bad'), error('warning', 'hmm')]);
    create();
    await flush();
    expect(monacoMock.setModelMarkers).toHaveBeenCalledTimes(1);
    const [target, owner, markers] = monacoMock.setModelMarkers.mock.calls[0];
    expect(target).toBe(model);
    expect(owner).toBe('tccl');
    expect(markers).toEqual([
      { ...error('error', 'bad'), severity: 8 },
      { ...error('warning', 'hmm'), severity: 4 },
    ]);
  });

  it('clears the markers when there are no errors', async () => {
    monacoMock.models = [makeModel('a')];
    create();
    await flush();
    expect(monacoMock.setModelMarkers).toHaveBeenCalledWith(expect.anything(), 'tccl', []);
  });

  it('sets no markers if the model is gone by the time the worker answers', async () => {
    const model = makeModel('a');
    monacoMock.models = [model];
    let answer: (e: TcclError[]) => void = () => undefined;
    worker.doValidation.mockReturnValue(new Promise((r) => (answer = r)));
    create();
    await flush();
    monacoMock.models = [];
    answer([error('error')]);
    await flush();
    expect(monacoMock.setModelMarkers).not.toHaveBeenCalled();
  });
});
