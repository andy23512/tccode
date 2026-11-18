import { TestBed } from '@angular/core/testing';
import {
  ReadableStream,
  TextDecoderStream,
  TextEncoderStream,
  TransformStream,
  WritableStream,
} from 'node:stream/web';
import { firstValueFrom, toArray } from 'rxjs';
import { SerialCommand } from '../data/serial-command.enum';
import { SerialLogItemType } from '../model/serial-log.model';
import { SerialLogStore } from '../store/serial-log.store';
import {
  stringifyChordActions,
  stringifyPhrase,
} from '../util/raw-chord.util';
import { SerialPortService } from './serial-port.service';
import { SerialService } from './serial.service';

// jsdom has no Web Streams; Node's implementations behave like the browser's.
const STREAM_GLOBALS = {
  TextEncoderStream,
  TextDecoderStream,
  TransformStream,
};

/**
 * A fake CharaChorder serial port. `respond` receives each command line the
 * app writes and returns the raw chunks the device sends back.
 */
function createFakeDevice(respond: (command: string) => string[] | undefined) {
  const written: string[] = [];
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  let readableGone = false;
  let closed = false;

  const readable = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c as unknown as ReadableStreamDefaultController<Uint8Array>;
    },
    cancel() {
      readableGone = true;
    },
  });
  const writable = new WritableStream<Uint8Array>({
    write(chunk) {
      for (const line of decoder.decode(chunk).split('\r\n')) {
        if (!line) continue;
        written.push(line);
        const chunks = respond(line) ?? [];
        // Real devices answer asynchronously.
        setTimeout(() => {
          for (const c of chunks) {
            try {
              controller.enqueue(encoder.encode(c));
            } catch {
              /* stream already closed */
            }
          }
        }, 0);
      }
    },
  });

  const port = {
    open: jest.fn().mockResolvedValue(undefined),
    close: jest.fn(async () => {
      closed = true;
    }),
    get readable() {
      return readableGone || closed ? null : readable;
    },
    get writable() {
      return writable;
    },
  };
  return { port, written };
}

const pad12 = (...codes: number[]) => [
  ...Array(12 - codes.length).fill(0),
  ...codes,
];

/** Responds like a device holding the given chords ([actions, phrase][]). */
function deviceWithChords(chords: [number[], number[]][] = []) {
  return (command: string): string[] | undefined => {
    if (command === 'VERSION') return ['VERSION V1.2.3\r\n'];
    if (command === 'ID') return ['ID ABC123\r\n'];
    if (command === 'CML C0') return [`CML C0 ${chords.length}\r\n`];
    const match = /^CML C1 (\d+)$/.exec(command);
    if (match) {
      const [actions, phrase] = chords[+match[1]];
      return [
        `${command} ${stringifyChordActions(actions)} ${stringifyPhrase(phrase)}\r\n`,
      ];
    }
    return undefined;
  };
}

describe('SerialService', () => {
  let service: SerialService;
  let log: InstanceType<typeof SerialLogStore>;
  let device: ReturnType<typeof createFakeDevice>;
  let connected = false;

  const setup = (respond = deviceWithChords()) => {
    device = createFakeDevice(respond);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SerialPortService,
          useValue: { getPort: () => Promise.resolve(device.port) },
        },
      ],
    });
    service = TestBed.inject(SerialService);
    log = TestBed.inject(SerialLogStore);
  };

  const connect = async () => {
    const result = await service.connect();
    connected = true;
    return result;
  };

  beforeAll(() => {
    Object.assign(globalThis, STREAM_GLOBALS);
  });

  afterAll(() => {
    for (const key of Object.keys(STREAM_GLOBALS)) {
      delete (globalThis as Record<string, unknown>)[key];
    }
  });

  beforeEach(() => {
    localStorage.clear();
    connected = false;
  });

  afterEach(async () => {
    if (connected) {
      await service.disconnect();
    }
    jest.restoreAllMocks();
  });

  describe('connect', () => {
    it('opens the port at 115200 baud and returns the version and id', async () => {
      setup();
      expect(await connect()).toEqual({ version: 'V1.2.3', id: 'ABC123' });
      expect(device.port.open).toHaveBeenCalledWith({ baudRate: 115200 });
    });

    it('sends VERSION then ID, each terminated by CRLF', async () => {
      setup();
      await connect();
      expect(device.written).toEqual(['VERSION', 'ID']);
    });

    it('logs what was sent and received', async () => {
      setup();
      await connect();
      expect(log.items().map((i) => [i.type, i.data])).toEqual([
        [SerialLogItemType.Send, 'VERSION'],
        [SerialLogItemType.Receive, 'VERSION V1.2.3'],
        [SerialLogItemType.Send, 'ID'],
        [SerialLogItemType.Receive, 'ID ABC123'],
      ]);
    });

    it('rejects when no port can be obtained', async () => {
      TestBed.configureTestingModule({
        providers: [
          {
            provide: SerialPortService,
            useValue: { getPort: () => Promise.reject(new Error('denied')) },
          },
        ],
      });
      service = TestBed.inject(SerialService);
      await expect(service.connect()).rejects.toThrow('denied');
    });

    it('rejects when the port cannot be opened, without writing anything', async () => {
      setup();
      device.port.open.mockRejectedValue(new Error('busy'));
      await expect(service.connect()).rejects.toThrow('busy');
      expect(device.written).toEqual([]);
    });
  });

  describe('send', () => {
    it('returns the response without the echoed command', async () => {
      setup();
      await connect();
      expect(await service.send(SerialCommand.Version)).toBe('V1.2.3');
    });

    it('joins the command and its arguments with spaces', async () => {
      setup(deviceWithChords([[pad12(97, 98), [99, 100]]]));
      await connect();
      await service.send(SerialCommand.GetChordMapByIndex, 0);
      expect(device.written[device.written.length - 1]).toBe('CML C1 0');
    });

    it('ignores unrelated lines the device sends in the meantime', async () => {
      setup((command) =>
        command === 'ID'
          ? ['LOG something unrelated\r\n', 'ID ABC123\r\n']
          : deviceWithChords()(command),
      );
      await connect();
      expect(await service.send(SerialCommand.Id)).toBe('ABC123');
    });

    it('reassembles a response that arrives in several chunks', async () => {
      setup((command) =>
        command === 'VERSION'
          ? ['VERS', 'ION V9', '.9.9\r', '\n']
          : deviceWithChords()(command),
      );
      expect(await connect()).toEqual({ version: 'V9.9.9', id: 'ABC123' });
    });
  });

  describe('loadChords', () => {
    const chordA: [number[], number[]] = [pad12(97, 98), [99, 100]];
    const chordB: [number[], number[]] = [pad12(99, 100), [97]];

    it('reads every chord and converts it', async () => {
      setup(deviceWithChords([chordA, chordB]));
      await connect();
      const emissions = await firstValueFrom(
        service.loadChords().pipe(toArray()),
      );
      const last = emissions[emissions.length - 1];
      expect(last.complete).toBe(true);
      expect(last.chords).toHaveLength(2);
      expect(last.chords?.[0]).toMatchObject({
        actions: chordA[0],
        input: chordA[0].slice(3),
        output: chordA[1],
        parentId: null,
      });
      expect(last.chords?.[1]).toMatchObject({
        actions: chordB[0],
        output: chordB[1],
      });
    });

    it('requests the count first, then each index in order', async () => {
      setup(deviceWithChords([chordA, chordB]));
      await connect();
      await firstValueFrom(service.loadChords().pipe(toArray()));
      expect(device.written.slice(2)).toEqual([
        'CML C0',
        'CML C1 0',
        'CML C1 1',
      ]);
    });

    it('reports progress while loading', async () => {
      setup(deviceWithChords([chordA, chordB]));
      await connect();
      const progress: unknown[] = [];
      await new Promise<void>((resolve) => {
        service.loadChords().subscribe({
          // The service mutates one status object, so snapshot each emission.
          next: ({ complete, loaded, total }) =>
            progress.push({ complete, loaded, total }),
          complete: resolve,
        });
      });
      expect(progress).toEqual([
        { complete: false, loaded: 0, total: 2 },
        { complete: false, loaded: 1, total: 2 },
        { complete: false, loaded: 2, total: 2 },
        { complete: true, loaded: 2, total: 2 },
      ]);
    });

    it('completes with an empty list when the device has no chords', async () => {
      setup(deviceWithChords([]));
      await connect();
      const emissions = await firstValueFrom(
        service.loadChords().pipe(toArray()),
      );
      const last = emissions[emissions.length - 1];
      expect(last).toMatchObject({ complete: true, loaded: 0, total: 0 });
      expect(last.chords).toEqual([]);
    });
  });

  describe('batchSend', () => {
    const echoDevice = (command: string) =>
      deviceWithChords()(command) ?? [`${command} OK\r\n`];

    it('sends each item in order', async () => {
      setup(echoDevice);
      await connect();
      await firstValueFrom(
        service.batchSend(['FIRST 1', 'SECOND 2', 'THIRD 3']).pipe(toArray()),
      );
      expect(device.written.slice(2)).toEqual(['FIRST 1', 'SECOND 2', 'THIRD 3']);
    });

    it('reports progress and completes', async () => {
      setup(echoDevice);
      await connect();
      const progress: unknown[] = [];
      await new Promise<void>((resolve) => {
        service.batchSend(['FIRST 1', 'SECOND 2']).subscribe({
          // The service mutates one status object, so snapshot each emission.
          next: ({ complete, sent, total }) =>
            progress.push({ complete, sent, total }),
          complete: resolve,
        });
      });
      expect(progress).toEqual([
        { complete: false, sent: 1, total: 2 },
        { complete: false, sent: 2, total: 2 },
        { complete: true, sent: 2, total: 2 },
      ]);
    });

    it('logs every item sent and acknowledged', async () => {
      setup(echoDevice);
      await connect();
      log.clear();
      await firstValueFrom(service.batchSend(['FIRST 1']).pipe(toArray()));
      expect(log.items().map((i) => [i.type, i.data])).toEqual([
        [SerialLogItemType.Send, 'FIRST 1'],
        [SerialLogItemType.Receive, 'FIRST 1 OK'],
      ]);
    });
  });

  describe('disconnect', () => {
    it('does nothing when it was never connected', async () => {
      setup();
      await expect(service.disconnect()).resolves.toBeUndefined();
      expect(device.port.close).not.toHaveBeenCalled();
    });

    it('does nothing after a failed connection', async () => {
      setup();
      device.port.open.mockRejectedValue(new Error('busy'));
      await service.connect().catch(() => undefined);
      await expect(service.disconnect()).resolves.toBeUndefined();
    });

    it('closes the port', async () => {
      setup();
      await connect();
      connected = false;
      await service.disconnect();
      expect(device.port.close).toHaveBeenCalledTimes(1);
    });
  });
});
