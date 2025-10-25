import { Injectable } from '@angular/core';
import { filter, firstValueFrom, Subject } from 'rxjs';
import { CHARACHORDER_DEVICE_PORTS } from '../data/charachorder-device-ports.const';

// Reference: https://github.com/archocron/ngx-serial/blob/fd1cf846cc5dba2bb2a935f44845d072964b566c/projects/ngx-serial/src/lib/ngx-serial.ts

class LineBreakTransformer {
  container = '';
  private controlCharacter: string;

  constructor(controlCharacter: string) {
    this.container = '';
    this.controlCharacter = controlCharacter;
  }

  transform(chunk: string, controller: any) {
    this.container += chunk;
    const lines = this.container.split(this.controlCharacter);
    this.container = lines.pop();
    lines.forEach((line: string) => controller.enqueue(line));
  }

  flush(controller: any) {
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

  public async connect() {
    try {
      this.port = await navigator.serial.requestPort({
        filters: [...CHARACHORDER_DEVICE_PORTS.values()],
      });
      await this.port.open({ baudRate: 115200 });
      const textEncoder = new TextEncoderStream();
      this.writableStreamClosed = textEncoder.readable.pipeTo(
        this.port.writable
      );
      this.writer = textEncoder.writable.getWriter();

      this.startReadLoop();

      const version = await this.sendData('VERSION');
      const id = await this.sendData('ID');
      return { version, id };
    } catch (e) {
      console.error(e);
    }
  }

  public async sendData(data: string) {
    await this.writer.write(data + '\r\n');
    return firstValueFrom(
      this.webSerialData$.pipe(filter((d) => d.startsWith(data)))
    );
  }

  public async disconnect() {
    this.reader.cancel();
    await this.readableStreamClosed.catch(() => {});
    this.writer.close();
    await this.writableStreamClosed;
    await this.port.close();
  }

  private async startReadLoop() {
    while (this.port.readable) {
      const textDecoder = new TextDecoderStream();
      this.readableStreamClosed = this.port.readable.pipeTo(
        textDecoder.writable as unknown as WritableStream<
          Uint8Array<ArrayBufferLike>
        >
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
          'Read Loop error. Have the serial device been disconnected ? '
        );
      }
    }
  }
}
