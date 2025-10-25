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
import {
  TCCL_LANGUAGE_ID,
  TCCL_THEME_NAME,
} from '../config/tccl-language.config';
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
  // TODO - use real type instead of any
  public deviceChordsInTccl = computed<string>(() => {
    const keyboardLayout = this.keyboardLayout();
    const deviceChords = this.deviceChordLibrary()?.chords;
    if (!keyboardLayout || !deviceChords) {
      return '';
    }
    return deviceChords
      .map((c) => {
        const outputKeys = c.output.map((actionCode) =>
          getTcclKeyFromActionCode(actionCode, keyboardLayout),
        );
        const inputKeys = c.input
          .filter(Boolean)
          .map((actionCode) =>
            getTcclKeyFromActionCode(actionCode, keyboardLayout),
          );
        return inputKeys.join(' + ') + ' = ' + outputKeys.join('');
      })
      .join('\n');
  });
  public editorOptions: editor.IStandaloneEditorConstructionOptions = {
    automaticLayout: true,
    fontFamily: 'Consolas, "Courier New", monospace',
    fontSize: 20,
    language: TCCL_LANGUAGE_ID,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    theme: TCCL_THEME_NAME,
    wordWrap: 'off',
  };
  public vimMode: VimMode;
  public statusBar = viewChild<ElementRef<HTMLDivElement>>('statusBar');

  public onEditorInit(editor: editor.IEditor) {
    this.vimMode = initVimMode(editor, this.statusBar().nativeElement);
  }

  public ngOnDestroy(): void {
    this.vimMode?.dispose();
  }
}
