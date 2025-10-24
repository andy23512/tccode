import { Component } from '@angular/core';
import { ChordEditorComponent } from '../component/chord-editor';
import { ToolbarComponent } from '../component/toolbar';

@Component({
  imports: [ChordEditorComponent, ToolbarComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  host: {
    class: 'h-screen flex',
  },
})
export class App {}
