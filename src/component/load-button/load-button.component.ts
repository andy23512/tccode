import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import {
  SAMPLE_CHORDS_1,
  SAMPLE_CHORDS_2,
} from '../../data/sample-chords.const';
import { IconGuardPipe } from '../../pipe/icon-guard.pipe';
import { EditorStore } from '../../store/editor.store';
import { ToolbarButtonComponent } from '../toolbar-button/toolbar-button.component';

@Component({
  selector: 'app-load-button',
  templateUrl: 'load-button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IconGuardPipe,
    MatIconModule,
    MatMenuModule,
    ToolbarButtonComponent,
  ],
})
export class LoadButtonComponent {
  private editorStore = inject(EditorStore);

  public loadSample(index: 1 | 2) {
    const chordLibrary = index === 1 ? SAMPLE_CHORDS_1 : SAMPLE_CHORDS_2;
    this.editorStore.appendContent(chordLibrary);
  }
}
