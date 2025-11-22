import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { lastValueFrom } from 'rxjs';
import { SAMPLE_CHORD_LISTS } from '../data/sample-chords.const';
import {
  Chord,
  ChordInNumberListForm,
  ChordTreeNode,
} from '../model/chord.model';
import { EditorStore } from '../store/editor.store';
import { KeyboardLayoutStore } from '../store/keyboard-layout.store';
import {
  convertChordInNumberListFormToChord,
  convertChordsToChordTreeNodes,
  convertChordTreeNodesToTcclFile,
} from '../util/chord.util';
import { SerialService } from './serial.service';

@Injectable({ providedIn: 'root' })
export class ChordLoaderService {
  private editorStore = inject(EditorStore);
  private serialService = inject(SerialService);
  private keyboardLayout = inject(KeyboardLayoutStore).selectedEntity;
  private matSnackBar = inject(MatSnackBar);

  public async loadChordTreeNodesFromDevice(
    { disconnect = true }: { disconnect: boolean } = { disconnect: true },
  ): Promise<ChordTreeNode[]> {
    await this.serialService.connect();
    const { chords } = await lastValueFrom(this.serialService.loadChords());
    if (disconnect) {
      await this.serialService.disconnect();
    }
    if (!chords) {
      return [];
    }
    const chordTreeNodes = convertChordsToChordTreeNodes(chords);
    return chordTreeNodes;
  }

  public async loadFromDevice() {
    const chordTreeNodes = await this.loadChordTreeNodesFromDevice();
    const keyboardLayout = this.keyboardLayout();
    if (chordTreeNodes.length > 0 && keyboardLayout) {
      const indent = this.editorStore.indent();
      this.editorStore.appendContent(
        convertChordTreeNodesToTcclFile(chordTreeNodes, keyboardLayout, indent),
      );
      this.matSnackBar.open('Chords are successfully loaded from device.');
    }
  }

  public loadFromFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        return;
      }
      if (file.name.endsWith('.json')) {
        this.loadFromJson(result);
      } else {
        this.loadFromText(result);
      }
    };

    reader.readAsText(file);
  }

  private loadFromJson(input: string) {
    const data = JSON.parse(input);
    if (!data || !data.chords) {
      return;
    }
    const chords: Chord[] = (data.chords as ChordInNumberListForm[]).map(
      convertChordInNumberListFormToChord,
    );
    const keyboardLayout = this.keyboardLayout();
    if (!keyboardLayout || !chords || chords.length === 0) {
      return;
    }
    const chordTreeNodes: ChordTreeNode[] =
      convertChordsToChordTreeNodes(chords);
    const indent = this.editorStore.indent();
    this.editorStore.appendContent(
      convertChordTreeNodesToTcclFile(chordTreeNodes, keyboardLayout, indent),
    );
    this.matSnackBar.open('Chords are successfully loaded from JSON.');
  }

  private loadFromText(input: string) {
    this.editorStore.appendContent(input);
    this.matSnackBar.open('Chords are successfully loaded from file.');
  }

  public loadSample(index: keyof typeof SAMPLE_CHORD_LISTS) {
    const chordLibrary = SAMPLE_CHORD_LISTS[index];
    this.editorStore.appendContent(chordLibrary);
    this.matSnackBar.open('Sample chords are successfully loaded.');
  }
}
