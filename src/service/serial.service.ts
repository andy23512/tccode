import { inject, Injectable } from '@angular/core';
import {
  concatMap,
  filter,
  firstValueFrom,
  from,
  map,
  Observable,
  Subject,
  tap,
  toArray,
} from 'rxjs';
import { CHARACHORDER_DEVICE_PORTS } from '../data/charachorder-device-ports.const';
import {
  SerialCommand,
  SerialCommandArgMap,
} from '../data/serial-command.enum';
import { Chord, ChordLibraryLoadStatus } from '../model/chord.model';
import { SerialLogItemType } from '../model/serial-log.model';
import { SerialLogStore } from '../store/serial-log.store';
import { parseChordActions, parsePhrase } from '../util/raw-chord.util';

// Reference: https://github.com/archocron/ngx-serial/blob/fd1cf846cc5dba2bb2a935f44845d072964b566c/projects/ngx-serial/src/lib/ngx-serial.ts

class LineBreakTransformer {
  container = '';
  private controlCharacter: string;

  constructor(controlCharacter: string) {
    this.container = '';
    this.controlCharacter = controlCharacter;
  }

  transform(
    chunk: string,
    controller: TransformStreamDefaultController<string>,
  ) {
    this.container += chunk;
    const lines = this.container.split(this.controlCharacter);
    this.container = lines.pop() as string;
    lines.forEach((line) => controller.enqueue(line));
  }

  flush(controller: TransformStreamDefaultController<string>) {
    controller.enqueue(this.container);
  }
}

@Injectable({ providedIn: 'root' })
export class SerialService {
  private port!: SerialPort;
  private webSerialDataSubject = new Subject<string>();
  private webSerialData$ = this.webSerialDataSubject.asObservable();
  private writer!: WritableStreamDefaultWriter<string>;
  private reader!: ReadableStreamDefaultReader<string>;
  private readableStreamClosed!: Promise<void>;
  private writableStreamClosed!: Promise<void>;

  private serialLogStore = inject(SerialLogStore);

  public async connect() {
    try {
      this.port = await navigator.serial.requestPort({
        filters: [...CHARACHORDER_DEVICE_PORTS.values()],
      });
      await this.port.open({ baudRate: 115200 });
      const textEncoder = new TextEncoderStream();
      if (!this.port.writable) {
        throw Error('Port is not writable.');
      }
      this.writableStreamClosed = textEncoder.readable.pipeTo(
        this.port.writable,
      );
      this.writer = textEncoder.writable.getWriter();

      this.startReadLoop();

      const version = await this.send(SerialCommand.Version);
      const id = await this.send(SerialCommand.Id);
      return { version, id };
    } catch (e) {
      console.error(e);
    }
  }

  public loadChords(): Observable<
    ChordLibraryLoadStatus & { chords?: Chord[] }
  > {
    return new Observable((observer) => {
      (async () => {
        const chordNumber = +(await this.send(SerialCommand.GetChordMapCount));
        const result = {
          complete: false,
          loaded: 0,
          total: chordNumber,
        };
        observer.next(result);
        const indices = Array.from({ length: chordNumber }).map((_, i) => i);
        from(indices)
          .pipe(
            concatMap((i) =>
              from(this.send(SerialCommand.GetChordMapByIndex, i)).pipe(
                map((r) => {
                  const [chordActions, phrase] = r.split(' ');
                  return {
                    index: i,
                    input: parseChordActions(chordActions),
                    output: parsePhrase(phrase),
                  };
                }),
              ),
            ),
            tap(() => {
              result.loaded++;
              observer.next(result);
            }),
            toArray(),
          )
          .subscribe((chords) => {
            result.complete = true;
            observer.next({ ...result, chords });
            observer.complete();
          });
      })();
    });
  }

  public async send<T extends SerialCommand>(
    command: T,
    ...args: SerialCommandArgMap[T]
  ) {
    const data = args ? [command, ...args].join(' ') : command;
    return this.sendData(data);
  }

  private async sendData(data: string) {
    await this.writer.write(data + '\r\n');
    this.serialLogStore.push(SerialLogItemType.Send, data);
    return firstValueFrom(
      this.webSerialData$.pipe(
        filter((d) => d.startsWith(data)),
        tap((d) => {
          this.serialLogStore.push(SerialLogItemType.Receive, d);
        }),
        map((d) => d.substring(data.length + 1).trim()),
      ),
    );
  }

  public async disconnect() {
    this.reader.cancel();
    await this.readableStreamClosed.catch(() => {
      /* empty */
    });
    this.writer.close();
    await this.writableStreamClosed;
    await this.port.close();
    this.serialLogStore.clear();
  }

  private async startReadLoop() {
    while (this.port.readable) {
      const textDecoder = new TextDecoderStream();
      this.readableStreamClosed = this.port.readable.pipeTo(
        textDecoder.writable as unknown as WritableStream<
          Uint8Array<ArrayBufferLike>
        >,
      );
      this.reader = textDecoder.readable
        .pipeThrough(new TransformStream(new LineBreakTransformer('\n')))
        .getReader();
      try {
        while (true) {
          const { value, done } = await this.reader.read();
          if (done) {
            break;
          }
          if (value) {
            this.webSerialDataSubject.next(value.trim());
          }
        }
      } catch {
        console.error(
          'Read Loop error. Have the serial device been disconnected ? ',
        );
      }
    }
  }
}
