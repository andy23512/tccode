import {
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { editor } from 'monaco-editor';
import { initVimMode, VimMode } from 'monaco-vim';
import { EditorComponent } from 'ngx-monaco-editor-v2';
import { MONACO_EDITOR_OPTIONS } from '../config/monaco.config';
import { TcclChord } from '../model/tccl.model';
import { DeviceStore } from '../store/device.store';
import { KeyboardLayoutStore } from '../store/keyboard-layout.store';
import { getTcclKeyFromActionCode } from '../util/layout.util';

@Component({
  imports: [EditorComponent, FormsModule],
  selector: 'app-chord-editor',
  templateUrl: './chord-editor.component.html',
  host: {
    class: 'flex flex-col',
  },
})
export class ChordEditorComponent implements OnDestroy {
  public keyboardLayout = inject(KeyboardLayoutStore).selectedEntity;
  public deviceChordLibrary = inject(DeviceStore).chordLibrary;
  public deviceChordsInTccl = computed<string>(() => {
    const keyboardLayout = this.keyboardLayout();
    const deviceChords = this.deviceChordLibrary()?.chords;
    if (!keyboardLayout || !deviceChords) {
      return '';
    }
    const tcclChords: TcclChord[] = deviceChords.map((c) => {
      const outputKeys = c.output.map((actionCode) =>
        getTcclKeyFromActionCode(actionCode, keyboardLayout),
      );
      const inputKeys = c.input.filter(Boolean).map((actionCode) => {
        const key = getTcclKeyFromActionCode(actionCode, keyboardLayout);
        const indexInOutput = outputKeys.findIndex(
          (k) => k.toLowerCase() === key.toLowerCase(),
        );
        return {
          key,
          indexInOutput: indexInOutput !== -1 ? indexInOutput : Infinity,
        };
      });
      inputKeys.sort((a, b) => {
        const compareIndexInOutput = Math.sign(
          a.indexInOutput - b.indexInOutput,
        );
        if (compareIndexInOutput !== 0) {
          return compareIndexInOutput;
        }
        return a.key.localeCompare(b.key);
      });
      return {
        input: inputKeys.map((k) => k.key).join(' + '),
        output: outputKeys.join(''),
      };
    });
    tcclChords.sort((a, b) => a.output.localeCompare(b.output));
    return tcclChords
      .map(({ input, output }) => `${input} = ${output}`)
      .join('\n');
  });
  public editorOptions = MONACO_EDITOR_OPTIONS;
  public vimMode: VimMode;
  public statusBar = viewChild<ElementRef<HTMLDivElement>>('statusBar');

  public onEditorInit(editor: editor.IEditor) {
    this.vimMode = initVimMode(editor, this.statusBar().nativeElement);
  }

  public ngOnDestroy(): void {
    this.vimMode?.dispose();
  }
}
