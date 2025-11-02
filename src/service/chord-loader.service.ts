import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { lastValueFrom } from 'rxjs';
import { SAMPLE_CHORD_LISTS } from '../data/sample-chords.const';
import { Chord } from '../model/chord.model';
import { EditorStore } from '../store/editor.store';
import { KeyboardLayoutStore } from '../store/keyboard-layout.store';
import { convertChordListToTcclFile } from '../util/chord.util';
import { SerialService } from './serial.service';

@Injectable({ providedIn: 'root' })
export class ChordLoaderService {
  private editorStore = inject(EditorStore);
  private serialService = inject(SerialService);
  private keyboardLayout = inject(KeyboardLayoutStore).selectedEntity;
  private matSnackBar = inject(MatSnackBar);

  public async loadFromDevice() {
    await this.serialService.connect();
    const { chords } = await lastValueFrom(this.serialService.loadChords());
    await this.serialService.disconnect();
    const keyboardLayout = this.keyboardLayout();
    if (chords && chords.length && keyboardLayout) {
      this.editorStore.appendContent(
        convertChordListToTcclFile(chords, keyboardLayout),
      );
      this.matSnackBar.open('Chords are successfully loaded from device.');
    }
  }

  public async loadFromJson(input: string) {
    const data = JSON.parse(input);
    if (!data || !data.chords) {
      return;
    }
    const chords: Chord[] = (data.chords as [number[], number[]][]).map(
      ([input, output], index) => ({
        index,
        input,
        output,
      }),
    );
    const keyboardLayout = this.keyboardLayout();
    if (!keyboardLayout || !chords || chords.length === 0) {
      return;
    }
    this.editorStore.appendContent(
      convertChordListToTcclFile(chords, keyboardLayout),
    );
    this.matSnackBar.open('Chords are successfully loaded from JSON.');
  }

  public loadFromText(input: string) {
    this.editorStore.appendContent(input);
    this.matSnackBar.open('Chords are successfully loaded from file.');
  }

  public loadSample(index: keyof typeof SAMPLE_CHORD_LISTS) {
    const chordLibrary = SAMPLE_CHORD_LISTS[index];
    this.editorStore.appendContent(chordLibrary);
    this.matSnackBar.open('Sample chords are successfully loaded.');
  }
}
