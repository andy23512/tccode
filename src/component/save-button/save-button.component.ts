import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { IconGuardPipe } from '../../pipe/icon-guard.pipe';
import { ChordSaverService } from '../../service/chord-saver.service';
import { SaveToDeviceDialogComponent } from '../save-to-device-dialog/save-to-device-dialog.component';
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
  private matDialog = inject(MatDialog);

  public openSaveToDeviceDialog() {
    this.matDialog.open(SaveToDeviceDialogComponent, {
      width: '80vw',
      maxWidth: '80vw',
      height: '80vh',
    });
  }

  public saveAsTcclFile() {
    this.chordSaverService.saveAsTcclFile();
  }
}
