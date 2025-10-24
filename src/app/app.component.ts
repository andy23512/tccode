import { Component } from '@angular/core';
import { ChordEditorComponent } from '../component/chord-editor.component';
import { ToolbarComponent } from '../component/toolbar.component';

@Component({
  imports: [ChordEditorComponent, ToolbarComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  host: {
    class: 'h-screen flex',
  },
})
export class AppComponent {}
