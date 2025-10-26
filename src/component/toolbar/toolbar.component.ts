import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IconGuardPipe } from '../../pipe/icon-guard.pipe';
import { ConnectButtonComponent } from '../connect-button/connect-button.component';
import { LogoComponent } from '../logo/logo.component';
import { SerialLogDialogComponent } from '../serial-log-dialog/serial-log-dialog.component';

@Component({
  imports: [
    LogoComponent,
    ConnectButtonComponent,
    MatTooltipModule,
    MatIconModule,
    IconGuardPipe,
    MatButtonModule,
  ],
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  host: {
    class: 'flex flex-col',
  },
})
export class ToolbarComponent {
  public matDialog = inject(MatDialog);
  public isWebSerialApiSupported = 'serial' in navigator;

  public openSerialLogDialog() {
    this.matDialog.open(SerialLogDialogComponent, {
      width: '80vw',
      maxWidth: '80vw',
      panelClass: 'shadow-sm shadow-white'.split(' '),
    });
  }
}
