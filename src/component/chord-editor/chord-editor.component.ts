import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { editor } from 'monaco-editor';
import * as monaco from 'monaco-editor';
import { EmacsExtension } from 'monaco-emacs';
import { initVimMode, VimMode } from 'monaco-vim';
import { MONACO_EDITOR_OPTIONS } from '../../config/monaco.config';
import { SAMPLE_CHORDS_1 } from '../../data/sample-chords.const';
import { KeyBindings } from '../../model/setting.model';
import { TcclChord } from '../../model/tccl.model';
import { DeviceStore } from '../../store/device.store';
import { KeyboardLayoutStore } from '../../store/keyboard-layout.store';
import { SettingStore } from '../../store/setting.store';
import { getTcclKeyFromActionCode } from '../../util/layout.util';

@Component({
  imports: [FormsModule],
  selector: 'app-chord-editor',
  templateUrl: './chord-editor.component.html',
  host: {
    class: 'flex flex-col',
  },
})
export class ChordEditorComponent implements OnInit, OnDestroy {
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
  public vimMode: VimMode;
  public emacsMode: EmacsExtension;
  public statusBar = viewChild<ElementRef<HTMLDivElement>>('statusBar');
  public editor = signal<editor.ICodeEditor | null>(null);
  public monacoContainer =
    viewChild.required<ElementRef<HTMLDivElement>>('monacoContainer');

  constructor() {
    effect(() => {
      const keyBindings = this.keyBindings();
      const editor = this.editor();
      this.setKeyBindings(editor, keyBindings);
    });
  }

  public ngOnInit(): void {
    monaco.editor.create(this.monacoContainer().nativeElement, {
      value: SAMPLE_CHORDS_1,
      ...MONACO_EDITOR_OPTIONS,
    });
  }

  public onEditorInit(editor: editor.IDiffEditor) {
    this.editor.set(editor.getModifiedEditor());
    this.setCustomMarkers(editor.getModifiedEditor());
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

  private setCustomMarkers(editor: editor.ICodeEditor | null) {
    if (!editor) {
      return;
    }
    const markers: editor.IMarkerData[] = [
      {
        message: 'This is a custom error.',
        severity: monaco.MarkerSeverity.Error,
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 5,
      },
      {
        message: 'This is a custom warning.',
        severity: monaco.MarkerSeverity.Warning,
        startLineNumber: 2,
        startColumn: 6,
        endLineNumber: 2,
        endColumn: 10,
      },
    ];

    monaco.editor.setModelMarkers(
      editor.getModel(),
      'my-custom-validation',
      markers,
    );
  }
}
