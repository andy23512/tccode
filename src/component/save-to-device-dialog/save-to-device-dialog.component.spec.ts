import { TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of, Subject, throwError } from 'rxjs';
import { ChordTreeNode } from '../../model/chord.model';
import { ChordLoaderService } from '../../service/chord-loader.service';
import { SerialService } from '../../service/serial.service';
import { EditorStore } from '../../store/editor.store';
import { KeyboardLayoutStore } from '../../store/keyboard-layout.store';
import {
  convertChordInNumberListFormToChord,
  convertChordsToChordTreeNodes,
} from '../../util/chord.util';
import { parseChordActions } from '../../util/raw-chord.util';
import { SaveToDeviceDialogComponent } from './save-to-device-dialog.component';

// US layout action codes: KeyA = 97, KeyB = 98, KeyC = 99, KeyD = 100.
const pad12 = (...codes: number[]) => [
  ...Array(12 - codes.length).fill(0),
  ...codes,
];

/** Chords in the form used by the device, as a tree. */
const deviceTree = (...forms: [number[], number[]][]): ChordTreeNode[] =>
  convertChordsToChordTreeNodes(
    forms.map((f) => convertChordInNumberListFormToChord(f)),
  );

const A_B: [number[], number[]] = [pad12(97, 98), [99, 100]]; // a + b = cd
const A_B_NEW: [number[], number[]] = [pad12(97, 98), [100, 99]]; // a + b = dc
const A_C: [number[], number[]] = [pad12(97, 99), [98]]; // a + c = b

describe('SaveToDeviceDialogComponent', () => {
  const chordLoader = { loadChordTreeNodesFromDevice: jest.fn() };
  const serial = { batchSend: jest.fn(), disconnect: jest.fn() };
  const snackBar = { open: jest.fn() };
  const dialogRef = { close: jest.fn() };
  let editor: InstanceType<typeof EditorStore>;

  async function create(editorContent: string, device: ChordTreeNode[]) {
    chordLoader.loadChordTreeNodesFromDevice.mockResolvedValue(device);
    editor.setContent(editorContent);
    return render();
  }

  async function render() {
    const fixture = TestBed.createComponent(SaveToDeviceDialogComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    localStorage.clear();
    chordLoader.loadChordTreeNodesFromDevice.mockReset().mockResolvedValue([]);
    serial.batchSend.mockReset();
    serial.disconnect.mockReset().mockResolvedValue(undefined);
    snackBar.open.mockReset();
    dialogRef.close.mockReset();
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      providers: [
        { provide: ChordLoaderService, useValue: chordLoader },
        { provide: SerialService, useValue: serial },
        { provide: MatSnackBar, useValue: snackBar },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    });
    editor = TestBed.inject(EditorStore);
  });

  describe('comparing the editor with the device', () => {
    it('keeps the connection open while reading the device', async () => {
      await create('', []);
      expect(chordLoader.loadChordTreeNodesFromDevice).toHaveBeenCalledWith({
        disconnect: false,
      });
    });

    it('shows a progress bar until the device has answered', async () => {
      let answer: (nodes: ChordTreeNode[]) => void = () => undefined;
      chordLoader.loadChordTreeNodesFromDevice.mockReturnValue(
        new Promise<ChordTreeNode[]>((resolve) => (answer = resolve)),
      );
      const fixture = TestBed.createComponent(SaveToDeviceDialogComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance.loading()).toBe(true);
      expect(
        fixture.nativeElement.querySelector('mat-progress-bar'),
      ).not.toBeNull();

      answer([]);
      await fixture.whenStable();
      fixture.detectChanges();
      expect(fixture.componentInstance.loading()).toBe(false);
      expect(
        fixture.nativeElement.querySelector('mat-progress-bar'),
      ).toBeNull();
    });

    it('says there is nothing to save when both sides are the same', async () => {
      const fixture = await create('a + b = cd\n', deviceTree(A_B));
      const c = fixture.componentInstance;
      expect(c.hasChange()).toBe(false);
      expect(fixture.nativeElement.textContent).toContain('Nothing to save');
    });

    it('lists chords that exist only in the editor as added', async () => {
      const fixture = await create('a + b = cd\n', []);
      const c = fixture.componentInstance;
      expect(c.hasChange()).toBe(true);
      expect(c.addedChordsForDisplay()).toEqual(['a + b = cd']);
      expect(c.updatedChordsForDisplay()).toEqual([]);
      expect(c.removedChordsForDisplay()).toEqual([]);
    });

    it('lists chords that exist only on the device as removed', async () => {
      const fixture = await create('', deviceTree(A_B));
      const c = fixture.componentInstance;
      expect(c.hasChange()).toBe(true);
      expect(c.removedChordsForDisplay()).toEqual(['a + b = cd']);
      expect(c.addedChordsForDisplay()).toEqual([]);
      expect(c.updatedChordsForDisplay()).toEqual([]);
    });

    it('lists chords with the same input but a different output as updated', async () => {
      const fixture = await create('a + b = dc\n', deviceTree(A_B));
      const c = fixture.componentInstance;
      expect(c.updatedChordsForDisplay()).toEqual([
        { fullInput: 'a + b', oldOutput: 'cd', newOutput: 'dc' },
      ]);
      expect(c.addedChordsForDisplay()).toEqual([]);
      expect(c.removedChordsForDisplay()).toEqual([]);
    });

    it('reports added, updated and removed chords together', async () => {
      const fixture = await create(
        'a + b = dc\na + c = b\n',
        deviceTree(A_B, [pad12(98, 99), [97]]),
      );
      const c = fixture.componentInstance;
      expect(c.addedChordsForDisplay()).toEqual(['a + c = b']);
      expect(c.updatedChordsForDisplay().map((u) => u.fullInput)).toEqual([
        'a + b',
      ]);
      expect(c.removedChordsForDisplay()).toEqual(['b + c = a']);
    });

    it('shows the parent chords of a changed child chord', async () => {
      const fixture = await create(
        'a + b = cd\n  c + d = a\n',
        deviceTree(A_B),
      );
      const c = fixture.componentInstance;
      expect(c.addedChordsForDisplay()).toEqual(['a + b | c + d = a']);
      expect(c.updatedChordsForDisplay()).toEqual([]);
    });

    it('does not treat the order of the input keys as a change', async () => {
      const fixture = await create('b + a = cd\n', deviceTree(A_B));
      expect(fixture.componentInstance.hasChange()).toBe(false);
    });

    it('shows each kind of change in its own tab', async () => {
      const fixture = await create(
        'a + b = dc\na + c = b\n',
        deviceTree(A_B, [pad12(98, 99), [97]]),
      );
      const labels = Array.from(
        fixture.nativeElement.querySelectorAll('.mdc-tab__text-label'),
      ).map((e) => (e as HTMLElement).textContent?.replace(/\s+/g, ' ').trim());
      expect(labels).toEqual([
        expect.stringContaining('Chord(s) to be added'),
        expect.stringContaining('Chord(s) to be updated'),
        expect.stringContaining('Chord(s) to be removed'),
      ]);
    });
  });

  describe('when the device cannot be read', () => {
    it('tells the user, closes the dialog and shows no changes', async () => {
      const error = jest.spyOn(console, 'error').mockImplementation();
      chordLoader.loadChordTreeNodesFromDevice.mockRejectedValue(
        new Error('no answer'),
      );
      editor.setContent('a + b = cd\n');
      const fixture = await render();
      expect(snackBar.open).toHaveBeenCalledWith(
        'Failed to communicate with the device.',
      );
      expect(dialogRef.close).toHaveBeenCalledTimes(1);
      expect(fixture.componentInstance.hasChange()).toBe(false);
      error.mockRestore();
    });
  });

  describe('Save button', () => {
    const saveButton = (fixture: {
      nativeElement: HTMLElement;
    }): HTMLButtonElement =>
      Array.from(fixture.nativeElement.querySelectorAll('button')).find(
        (b) => b.textContent?.trim() === 'Save',
      ) as HTMLButtonElement;

    it('is disabled while loading', async () => {
      chordLoader.loadChordTreeNodesFromDevice.mockReturnValue(
        new Promise(() => undefined),
      );
      const fixture = TestBed.createComponent(SaveToDeviceDialogComponent);
      fixture.detectChanges();
      expect(saveButton(fixture).disabled).toBe(true);
    });

    it('is disabled when there is nothing to save', async () => {
      const fixture = await create('a + b = cd\n', deviceTree(A_B));
      expect(saveButton(fixture).disabled).toBe(true);
    });

    it('is enabled when there are changes', async () => {
      const fixture = await create('a + b = cd\n', []);
      expect(saveButton(fixture).disabled).toBe(false);
    });
  });

  describe('saveChordsToDevice', () => {
    const sent = () => serial.batchSend.mock.calls[0][0] as string[];

    it('sends added and updated chords as C3 and removed chords as C4, in that order', async () => {
      serial.batchSend.mockReturnValue(of({ complete: true }));
      const fixture = await create(
        'a + b = dc\na + c = b\n',
        deviceTree(A_B, [pad12(98, 99), [97]]),
      );
      await fixture.componentInstance.saveChordsToDevice();

      const commands = sent();
      expect(commands).toHaveLength(3);
      const [added, updated, removed] = commands.map((c) => c.split(' '));
      expect(added.slice(0, 2)).toEqual(['CML', 'C3']);
      expect(parseChordActions(added[2])).toEqual(A_C[0]);
      expect(updated.slice(0, 2)).toEqual(['CML', 'C3']);
      expect(parseChordActions(updated[2])).toEqual(A_B_NEW[0]);
      expect(removed.slice(0, 2)).toEqual(['CML', 'C4']);
      expect(parseChordActions(removed[2])).toEqual(pad12(98, 99));
      expect(removed).toHaveLength(3);
      expect(added).toHaveLength(4);
      expect(updated).toHaveLength(4);
    });

    it('closes the dialog and confirms only once the batch is complete', async () => {
      const progress = new Subject<{ complete: boolean }>();
      serial.batchSend.mockReturnValue(progress as Observable<never>);
      const fixture = await create('a + b = cd\n', []);
      await fixture.componentInstance.saveChordsToDevice();

      progress.next({ complete: false });
      expect(snackBar.open).not.toHaveBeenCalled();
      expect(dialogRef.close).not.toHaveBeenCalled();

      progress.next({ complete: true });
      expect(snackBar.open).toHaveBeenCalledWith(
        'Chords are successfully saved to device.',
      );
      expect(dialogRef.close).toHaveBeenCalledTimes(1);
    });

    it('tells the user and keeps the dialog open when sending fails', async () => {
      const error = jest.spyOn(console, 'error').mockImplementation();
      serial.batchSend.mockReturnValue(
        throwError(() => new Error('device stopped answering')),
      );
      const fixture = await create('a + b = cd\n', []);
      await fixture.componentInstance.saveChordsToDevice();

      expect(snackBar.open).toHaveBeenCalledTimes(1);
      expect(snackBar.open).toHaveBeenCalledWith(
        'Failed to save chords to the device.',
      );
      expect(dialogRef.close).not.toHaveBeenCalled();
      error.mockRestore();
    });
  });

  describe('closing', () => {
    it('disconnects from the device when destroyed', async () => {
      const fixture = await create('', []);
      expect(serial.disconnect).not.toHaveBeenCalled();
      fixture.destroy();
      expect(serial.disconnect).toHaveBeenCalledTimes(1);
    });
  });

  describe('without a keyboard layout', () => {
    it('tells the user and closes, instead of showing the progress bar forever', async () => {
      TestBed.inject(KeyboardLayoutStore).setSelectedId(null);
      await create('a + b = cd\n', deviceTree(A_B));
      expect(snackBar.open).toHaveBeenCalledTimes(1);
      expect(snackBar.open).toHaveBeenCalledWith(
        'No keyboard layout is selected.',
      );
      expect(dialogRef.close).toHaveBeenCalledTimes(1);
    });

    it('does not read the device', async () => {
      TestBed.inject(KeyboardLayoutStore).setSelectedId(null);
      await create('a + b = cd\n', deviceTree(A_B));
      expect(chordLoader.loadChordTreeNodesFromDevice).not.toHaveBeenCalled();
    });
  });
});
