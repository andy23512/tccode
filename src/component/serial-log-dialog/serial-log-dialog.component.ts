import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { SerialLogItemType } from '../../model/serial-log.model';
import { IconGuardPipe } from '../../pipe/icon-guard.pipe';
import { SerialLogStore } from '../../store/serial-log.store';

@Component({
  imports: [MatDialogModule, MatButtonModule, MatIconModule, IconGuardPipe],
  selector: 'app-serial-log-dialog',
  templateUrl: './serial-log-dialog.component.html',
})
export class SerialLogDialogComponent {
  public serialLogStore = inject(SerialLogStore);
  public serialLogItems = this.serialLogStore.items;

  public SerialLogItemType = SerialLogItemType;
}
