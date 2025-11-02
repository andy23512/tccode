import {
  Component,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import type { editor } from 'monaco-editor';
import * as monaco from 'monaco-editor';
import { EmacsExtension } from 'monaco-emacs';
import { initVimMode, VimMode } from 'monaco-vim';
import { MONACO_EDITOR_OPTIONS } from '../../config/monaco.config';
import { KeyBindings } from '../../model/setting.model';
import { IconGuardPipe } from '../../pipe/icon-guard.pipe';
import { ChordLoaderService } from '../../service/chord-loader.service';
import { EditorStore } from '../../store/editor.store';
import { SettingStore } from '../../store/setting.store';

@Component({
  imports: [FormsModule, MatIconModule, IconGuardPipe],
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  host: {
    class: 'flex flex-col relative',
  },
})
export class EditorComponent implements OnInit, OnDestroy {
  private keyBindings = inject(SettingStore).keyBindings;
  private vimMode: VimMode | null = null;
  private emacsMode: EmacsExtension | null = null;
  private statusBar =
    viewChild.required<ElementRef<HTMLDivElement>>('statusBar');
  private editor = signal<editor.ICodeEditor | null>(null);
  private monacoContainer =
    viewChild.required<ElementRef<HTMLDivElement>>('monacoContainer');
  private editorStore = inject(EditorStore);
  private chordLoaderService = inject(ChordLoaderService);
  public isDragOver = signal(false);

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
    const model = editor.getModel();
    if (!model) {
      throw Error('Editor has no model.');
    }
    model.onDidChangeContent(() => {
      this.editorStore.setContent(model.getValue());
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
    if (model && model.getValue() !== content) {
      model.setValue(content);
    }
  }

  public onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
    const files = event.dataTransfer?.files;
    if (files && files.length === 1) {
      const file = files[0];
      this.chordLoaderService.loadFromFile(file);
    }
  }

  public onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  public onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }
}
