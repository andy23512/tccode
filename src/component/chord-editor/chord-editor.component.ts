import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { editor } from 'monaco-editor';
import { EmacsExtension } from 'monaco-emacs';
import { initVimMode, VimMode } from 'monaco-vim';
import { DiffEditorComponent } from 'ngx-monaco-editor-v2';
import { MONACO_DIFF_EDITOR_OPTIONS } from '../../config/monaco.config';
import { TCCL_LANGUAGE_ID } from '../../config/tccl-language.config';
import { KeyBindings } from '../../model/setting.model';
import { TcclChord } from '../../model/tccl.model';
import { DeviceStore } from '../../store/device.store';
import { KeyboardLayoutStore } from '../../store/keyboard-layout.store';
import { SettingStore } from '../../store/setting.store';
import { getTcclKeyFromActionCode } from '../../util/layout.util';

@Component({
  imports: [FormsModule, DiffEditorComponent],
  selector: 'app-chord-editor',
  templateUrl: './chord-editor.component.html',
  host: {
    class: 'flex flex-col',
  },
})
export class ChordEditorComponent implements OnDestroy {
  public keyboardLayout = inject(KeyboardLayoutStore).selectedEntity;
  public deviceChordLibrary = inject(DeviceStore).chordLibrary;
  public keyBindings = inject(SettingStore).keyBindings;
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
  public diffEditorOptions = MONACO_DIFF_EDITOR_OPTIONS;
  public tcclLanguageId = TCCL_LANGUAGE_ID;
  public vimMode: VimMode;
  public emacsMode: EmacsExtension;
  public statusBar = viewChild<ElementRef<HTMLDivElement>>('statusBar');
  public editor = signal<editor.ICodeEditor | null>(null);

  constructor() {
    effect(() => {
      const keyBindings = this.keyBindings();
      const editor = this.editor();
      this.setKeyBindings(editor, keyBindings);
    });
  }

  public onEditorInit(editor: editor.IDiffEditor) {
    this.editor.set(editor.getModifiedEditor());
  }

  public ngOnDestroy(): void {
    this.vimMode?.dispose();
    this.emacsMode?.dispose();
  }

  public setKeyBindings(
    editor: editor.ICodeEditor | null,
    keyBindings: KeyBindings,
  ) {
    if (!editor) {
      return;
    }
    this.vimMode?.dispose();
    this.emacsMode?.dispose();
    if (keyBindings === KeyBindings.Vim) {
      this.vimMode = initVimMode(editor, this.statusBar().nativeElement);
    } else if (keyBindings === KeyBindings.Emacs) {
      const statusNode = this.statusBar().nativeElement;
      this.emacsMode = new EmacsExtension(
        editor as editor.IStandaloneCodeEditor,
      );
      this.emacsMode.onDidMarkChange((ev) => {
        statusNode.textContent = ev ? 'Mark Set!' : 'Mark Unset';
      });
      this.emacsMode.onDidChangeKey((str) => {
        statusNode.textContent = str;
      });
      this.emacsMode.start();
    }
  }
}
