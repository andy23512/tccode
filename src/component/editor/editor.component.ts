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
import { KeyBindings } from '../../model/setting.model';
import { TcclChord } from '../../model/tccl.model';
import { DeviceStore } from '../../store/device.store';
import { EditorStore } from '../../store/editor.store';
import { KeyboardLayoutStore } from '../../store/keyboard-layout.store';
import { SettingStore } from '../../store/setting.store';
import { getTcclKeyFromActionCode } from '../../util/layout.util';

@Component({
  imports: [FormsModule],
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  host: {
    class: 'flex flex-col',
  },
})
export class EditorComponent implements OnInit, OnDestroy {
  private keyboardLayout = inject(KeyboardLayoutStore).selectedEntity;
  private deviceChordLibrary = inject(DeviceStore).chordLibrary;
  private keyBindings = inject(SettingStore).keyBindings;
  private deviceChordsInTccl = computed<string>(() => {
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
  private vimMode: VimMode;
  private emacsMode: EmacsExtension;
  private statusBar = viewChild<ElementRef<HTMLDivElement>>('statusBar');
  private editor = signal<editor.ICodeEditor | null>(null);
  private monacoContainer =
    viewChild.required<ElementRef<HTMLDivElement>>('monacoContainer');
  private editorStore = inject(EditorStore);

  constructor() {
    effect(() => {
      const keyBindings = this.keyBindings();
      const editor = this.editor();
      this.setKeyBindings(editor, keyBindings);
    });

    effect(() => {
      const content = this.editorStore.content();
      const editor = this.editor();
      this.setContentToEditor(editor, content);
    });
  }

  public ngOnInit(): void {
    const editor = monaco.editor.create(this.monacoContainer().nativeElement, {
      value: '',
      ...MONACO_EDITOR_OPTIONS,
    });
    this.editor.set(editor);
    editor.getModel().onDidChangeContent(() => {
      this.editorStore.setContent(editor.getModel().getValue());
    });
  }

  public ngOnDestroy(): void {
    this.vimMode?.dispose();
    this.emacsMode?.dispose();
  }

  private setKeyBindings(
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

  private setContentToEditor(
    editor: editor.ICodeEditor | null,
    content: string,
  ): void {
    if (!editor) {
      return;
    }
    const model = editor.getModel();
    if (model.getValue() !== content) {
      model.setValue(content);
    }
  }
}
