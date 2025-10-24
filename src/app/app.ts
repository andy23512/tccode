import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { IconGuardPipe } from '../pipe/icon-guard.pipe';
import { ChordEditorComponent } from './component/chord-editor';

@Component({
  imports: [MatListModule, MatIconModule, IconGuardPipe, ChordEditorComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  host: {
    class: 'h-screen flex',
  },
})
export class App {}
