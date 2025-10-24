import { Component, ElementRef, OnDestroy, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { editor } from 'monaco-editor';
import { initVimMode, VimMode } from 'monaco-vim';
import { EditorComponent } from 'ngx-monaco-editor-v2';
import { TCCL_LANGUAGE_ID, TCCL_THEME_NAME } from '../config/monaco.config';
import { SAMPLE_CHORDS } from '../data/sample-chords.const';

@Component({
  imports: [EditorComponent, FormsModule],
  selector: 'app-chord-editor',
  templateUrl: './chord-editor.html',
  host: {
    class: 'flex flex-col',
  },
})
export class ChordEditorComponent implements OnDestroy {
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
  public code = SAMPLE_CHORDS;
  public vimMode: VimMode;
  public statusBar = viewChild<ElementRef<HTMLDivElement>>('statusBar');

  public onEditorInit(editor: editor.IEditor) {
    this.vimMode = initVimMode(editor, this.statusBar().nativeElement);
  }

  public ngOnDestroy(): void {
    this.vimMode?.dispose();
  }
}
