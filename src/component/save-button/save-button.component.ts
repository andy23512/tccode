import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { IconGuardPipe } from '../../pipe/icon-guard.pipe';
import { ChordSaverService } from '../../service/chord-saver.service';
import { ToolbarButtonComponent } from '../toolbar-button/toolbar-button.component';

@Component({
  selector: 'app-save-button',
  templateUrl: 'save-button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IconGuardPipe,
    MatIconModule,
    MatMenuModule,
    ToolbarButtonComponent,
  ],
})
export class SaveButtonComponent {
  private chordSaverService = inject(ChordSaverService);

  public saveAsTcclFile() {
    this.chordSaverService.saveAsTcclFile();
  }
}
