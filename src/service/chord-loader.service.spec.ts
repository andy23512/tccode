import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { SAMPLE_CHORD_LISTS } from '../data/sample-chords.const';
import { Chord } from '../model/chord.model';
import { EditorStore } from '../store/editor.store';
import { KeyboardLayoutStore } from '../store/keyboard-layout.store';
import { convertChordInNumberListFormToChord } from '../util/chord.util';
import { ChordLoaderService } from './chord-loader.service';
import { SerialService } from './serial.service';

// US layout action codes: KeyA = 97, KeyB = 98, KeyC = 99, KeyD = 100.
const pad12 = (...codes: number[]) => [
  ...Array(12 - codes.length).fill(0),
  ...codes,
];
const ab = (): [number[], number[]] => [pad12(97, 98), [99, 100]]; // a + b = cd

const chord = (form: [number[], number[]]): Chord =>
  convertChordInNumberListFormToChord(form);

async function until(condition: () => boolean, timeoutMs = 2000) {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error('Timed out waiting for condition');
    }
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

describe('ChordLoaderService', () => {
  const serial = {
    connect: jest.fn(),
    disconnect: jest.fn(),
    loadChords: jest.fn(),
  };
  const snackBar = { open: jest.fn() };
  let service: ChordLoaderService;
  let editor: InstanceType<typeof EditorStore>;

  beforeEach(() => {
    localStorage.clear();
    serial.connect.mockReset().mockResolvedValue(undefined);
    serial.disconnect.mockReset().mockResolvedValue(undefined);
    serial.loadChords.mockReset().mockReturnValue(of({ chords: [] }));
    snackBar.open.mockReset();
    TestBed.configureTestingModule({
      providers: [
        { provide: SerialService, useValue: serial },
        { provide: MatSnackBar, useValue: snackBar },
      ],
    });
    service = TestBed.inject(ChordLoaderService);
    editor = TestBed.inject(EditorStore);
  });

  describe('loadSample', () => {
    it.each([1, 2, 3] as const)('appends sample list %i', (index) => {
      service.loadSample(index);
      expect(editor.content()).toBe(SAMPLE_CHORD_LISTS[index]);
      expect(snackBar.open).toHaveBeenCalledWith(
        'Sample chords are successfully loaded.',
      );
    });

    it('appends after existing content', () => {
      editor.setContent('x + y = z\n');
      service.loadSample(1);
      expect(editor.content()).toBe(`x + y = z\n\n${SAMPLE_CHORD_LISTS[1]}`);
    });
  });

  describe('loadChordTreeNodesFromDevice', () => {
    it('connects, reads the chords, disconnects and returns the chord tree', async () => {
      serial.loadChords.mockReturnValue(of({ chords: [chord(ab())] }));
      const nodes = await service.loadChordTreeNodesFromDevice();
      expect(serial.connect).toHaveBeenCalledTimes(1);
      expect(serial.disconnect).toHaveBeenCalledTimes(1);
      expect(nodes).toHaveLength(1);
      expect(nodes[0]).toMatchObject({
        level: 0,
        parentId: null,
        output: [99, 100],
        children: [],
      });
    });

    it('uses only the last emission (progress events carry no chords)', async () => {
      serial.loadChords.mockReturnValue(
        of(
          { complete: false, loaded: 0, total: 1 },
          { complete: true, loaded: 1, total: 1, chords: [chord(ab())] },
        ),
      );
      expect(await service.loadChordTreeNodesFromDevice()).toHaveLength(1);
    });

    it('stays connected when disconnect is false', async () => {
      await service.loadChordTreeNodesFromDevice({ disconnect: false });
      expect(serial.connect).toHaveBeenCalled();
      expect(serial.disconnect).not.toHaveBeenCalled();
    });

    it('returns an empty list (and still disconnects) when the device sent no chords', async () => {
      serial.loadChords.mockReturnValue(of({ complete: true }));
      expect(await service.loadChordTreeNodesFromDevice()).toEqual([]);
      expect(serial.disconnect).toHaveBeenCalled();
    });

    it('disconnects and rethrows when reading the chords fails', async () => {
      serial.loadChords.mockReturnValue(throwError(() => new Error('timeout')));
      await expect(service.loadChordTreeNodesFromDevice()).rejects.toThrow(
        'timeout',
      );
      expect(serial.disconnect).toHaveBeenCalledTimes(1);
    });

    it('tells the user when reading the chords fails', async () => {
      const error = jest.spyOn(console, 'error').mockImplementation();
      serial.loadChords.mockReturnValue(throwError(() => new Error('timeout')));
      await service.loadFromDevice();
      expect(snackBar.open).toHaveBeenCalledWith(
        'Failed to communicate with the device.',
      );
      expect(editor.content()).toBe('');
      error.mockRestore();
    });

    it('does not read chords when connecting fails', async () => {
      serial.connect.mockRejectedValue(new Error('no port'));
      await expect(service.loadChordTreeNodesFromDevice()).rejects.toThrow(
        'no port',
      );
      expect(serial.loadChords).not.toHaveBeenCalled();
    });
  });

  describe('loadFromDevice', () => {
    it('appends the chords as TCCL and shows a message', async () => {
      serial.loadChords.mockReturnValue(of({ chords: [chord(ab())] }));
      await service.loadFromDevice();
      expect(editor.content()).toBe('a + b = cd\n');
      expect(snackBar.open).toHaveBeenCalledWith(
        'Chords are successfully loaded from device.',
      );
    });

    it('tells the user when the connection fails, and loads nothing', async () => {
      const error = jest.spyOn(console, 'error').mockImplementation();
      serial.connect.mockRejectedValue(new Error('No port selected'));
      await service.loadFromDevice();
      expect(snackBar.open).toHaveBeenCalledTimes(1);
      expect(snackBar.open).toHaveBeenCalledWith(
        'Failed to communicate with the device.',
      );
      expect(editor.content()).toBe('');
      expect(serial.loadChords).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
      error.mockRestore();
    });

    it('tells the user when the device has no chords', async () => {
      await service.loadFromDevice();
      expect(editor.content()).toBe('');
      expect(snackBar.open).toHaveBeenCalledTimes(1);
      expect(snackBar.open).toHaveBeenCalledWith('The device has no chords.');
    });

    it('tells the user when no keyboard layout is selected', async () => {
      TestBed.inject(KeyboardLayoutStore).setSelectedId(null);
      serial.loadChords.mockReturnValue(of({ chords: [chord(ab())] }));
      await service.loadFromDevice();
      expect(editor.content()).toBe('');
      expect(snackBar.open).toHaveBeenCalledTimes(1);
      expect(snackBar.open).toHaveBeenCalledWith(
        'Failed to load chords from the device. No keyboard layout is selected.',
      );
    });

    it('uses the indentation detected in the editor for child chords', async () => {
      editor.setContent('x + y = z\n    p + q = r\n');
      const parent = chord(ab());
      const childActions = [
        parent.id & 0x3ff,
        (parent.id >> 10) & 0x3ff,
        (parent.id >> 20) & 0x3ff,
        ...Array(9 - 2).fill(0),
        99,
        100,
      ];
      serial.loadChords.mockReturnValue(
        of({ chords: [parent, chord([childActions, [97]])] }),
      );
      await service.loadFromDevice();
      expect(editor.content()).toContain('\n\na + b = cd\n    c + d = a\n');
    });
  });

  describe('loadFromFile', () => {
    const file = (name: string, content: string) =>
      new File([content], name, { type: 'text/plain' });

    it.each(['chords.tccl', 'chords.txt'])(
      'appends the text of %s',
      async (name) => {
        service.loadFromFile(file(name, 'a + b = cd\n'));
        await until(() => snackBar.open.mock.calls.length > 0);
        expect(editor.content()).toBe('a + b = cd\n');
        expect(snackBar.open).toHaveBeenCalledWith(
          'Chords are successfully loaded from file.',
        );
      },
    );

    it('does not validate text files', async () => {
      service.loadFromFile(file('x.txt', 'this is not tccl'));
      await until(() => snackBar.open.mock.calls.length > 0);
      expect(editor.content()).toBe('this is not tccl');
    });

    it('converts a JSON backup into TCCL', async () => {
      const json = JSON.stringify({ chords: [ab()] });
      service.loadFromFile(file('backup.json', json));
      await until(() => snackBar.open.mock.calls.length > 0);
      expect(editor.content()).toBe('a + b = cd\n');
      expect(snackBar.open).toHaveBeenCalledWith(
        'Chords are successfully loaded from JSON.',
      );
    });

    it('tells the user when a JSON file has no chords list', async () => {
      service.loadFromFile(file('backup.json', JSON.stringify({ other: 1 })));
      await until(() => snackBar.open.mock.calls.length > 0);
      expect(snackBar.open).toHaveBeenCalledTimes(1);
      expect(snackBar.open).toHaveBeenCalledWith(
        'Failed to load chords from JSON. The file has no chord list.',
      );
      expect(editor.content()).toBe('');
    });

    it('tells the user when a JSON file has an empty chords list', async () => {
      service.loadFromFile(file('backup.json', JSON.stringify({ chords: [] })));
      await until(() => snackBar.open.mock.calls.length > 0);
      expect(snackBar.open).toHaveBeenCalledTimes(1);
      expect(snackBar.open).toHaveBeenCalledWith(
        'The JSON file contains no chords.',
      );
      expect(editor.content()).toBe('');
    });

    it('tells the user when no keyboard layout is selected', async () => {
      TestBed.inject(KeyboardLayoutStore).setSelectedId(null);
      service.loadFromFile(
        file('backup.json', JSON.stringify({ chords: [ab()] })),
      );
      await until(() => snackBar.open.mock.calls.length > 0);
      expect(snackBar.open).toHaveBeenCalledTimes(1);
      expect(snackBar.open).toHaveBeenCalledWith(
        'Failed to load chords from JSON. No keyboard layout is selected.',
      );
      expect(editor.content()).toBe('');
    });

    it('tells the user when a file is empty', async () => {
      service.loadFromFile(file('empty.tccl', ''));
      await until(() => snackBar.open.mock.calls.length > 0);
      expect(snackBar.open).toHaveBeenCalledTimes(1);
      expect(snackBar.open).toHaveBeenCalledWith('The file is empty.');
      expect(editor.content()).toBe('');
    });

    it.each([
      ['truncated', '{"chords": [[1,2'],
      ['not JSON', 'hello'],
      ['wrong shape', '{"chords": [1, 2, 3]}'],
    ])(
      'tells the user a malformed JSON backup was not loaded (%s)',
      async (_, content) => {
        service.loadFromFile(file('backup.json', content));
        await until(() => snackBar.open.mock.calls.length > 0);
        expect(snackBar.open).toHaveBeenCalledTimes(1);
        expect(snackBar.open).toHaveBeenCalledWith(
          'Failed to load chords from JSON. The file is not a valid chord backup.',
        );
        expect(editor.content()).toBe('');
      },
    );

    it('treats only the ".json" extension as a backup (case sensitive)', async () => {
      service.loadFromFile(file('backup.JSON', '{"chords": []}'));
      await until(() => snackBar.open.mock.calls.length > 0);
      expect(editor.content()).toBe('{"chords": []}');
    });
  });
});
