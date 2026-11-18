import type { Position, worker } from 'monaco-editor';
import { TcclWorker } from './tccl-worker';

const ctxWith = (value: string) =>
  ({
    getMirrorModels: () => [{ getValue: () => value }],
  }) as unknown as worker.IWorkerContext;

const OPTIONS = { detectConflictsWithBopomofoChords: false };

describe('TcclWorker', () => {
  describe('doValidation', () => {
    it('returns no errors for an empty document', async () => {
      expect(await new TcclWorker(ctxWith('')).doValidation(OPTIONS)).toEqual(
        [],
      );
    });

    it('returns no errors for a valid document', async () => {
      const w = new TcclWorker(ctxWith('a + b = x\n'));
      expect(await w.doValidation(OPTIONS)).toEqual([]);
    });

    it('validates the content of the first mirror model', async () => {
      const w = new TcclWorker(ctxWith('a + b = x\nb + a = y\n'));
      const errors = await w.doValidation(OPTIONS);
      expect(errors.map((e) => e.code)).toEqual([
        'DUPLICATED_CHORD_INPUT',
        'DUPLICATED_CHORD_INPUT',
      ]);
    });

    it('passes the Bopomofo option through', async () => {
      const w = new TcclWorker(ctxWith('a + w = x\n'));
      expect(await w.doValidation(OPTIONS)).toEqual([]);
      const errors = await w.doValidation({
        detectConflictsWithBopomofoChords: true,
      });
      expect(errors.map((e) => e.code)).toEqual(['BPMF_CHORD_CONFLICT']);
    });

    it('reads the document again on every call', async () => {
      let content = 'a + b = x\n';
      const w = new TcclWorker({
        getMirrorModels: () => [{ getValue: () => content }],
      } as unknown as worker.IWorkerContext);
      expect(await w.doValidation(OPTIONS)).toEqual([]);
      content = 'a = b\n';
      expect(await w.doValidation(OPTIONS)).not.toEqual([]);
    });
  });

  describe('getSuggestions', () => {
    it('delegates to the language service', async () => {
      const w = new TcclWorker(ctxWith(''));
      const result = await w.getSuggestions('a ', {
        lineNumber: 1,
        column: 2,
      } as Position);
      expect(result.map((r) => r.value)).toEqual([' + ']);
    });
  });
});
