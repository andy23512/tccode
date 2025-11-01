import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { SAMPLE_CHORD_LISTS } from '../../data/sample-chords.const';
import { IconGuardPipe } from '../../pipe/icon-guard.pipe';
import { ChordLoaderService } from '../../service/chord-loader.service';
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
  private chordLoaderService = inject(ChordLoaderService);

  public loadFromDevice() {
    this.chordLoaderService.loadFromDevice();
  }

  public loadSample(index: keyof typeof SAMPLE_CHORD_LISTS) {
    this.chordLoaderService.loadSample(index);
  }
}
