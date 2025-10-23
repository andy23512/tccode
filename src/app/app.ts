import { Component, ElementRef, OnDestroy, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { editor } from 'monaco-editor';
import { initVimMode, VimMode } from 'monaco-vim';
import { EditorComponent } from 'ngx-monaco-editor-v2';
import { SAMPLE_CHORDS } from '../data/sample-chords.const';

@Component({
  imports: [RouterModule, EditorComponent, FormsModule],
  selector: 'app-root',
  templateUrl: './app.html',
  host: {
    class: 'h-screen flex flex-col',
  },
})
export class App implements OnDestroy {
  public editorOptions: editor.IStandaloneEditorConstructionOptions = {
    automaticLayout: true,
    fontFamily: 'Consolas, "Courier New", monospace',
    fontSize: 20,
    language: 'javascript',
    scrollBeyondLastLine: false,
    theme: 'vs-dark',
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
