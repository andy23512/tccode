import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AbstractSyntaxTreeDialogComponent } from '../abstract-syntax-tree-dialog/abstract-syntax-tree-dialog.component';
import { LoadButtonComponent } from '../load-button/load-button.component';
import { LogoComponent } from '../logo/logo.component';
import { SaveButtonComponent } from '../save-button/save-button.component';
import { SerialLogDialogComponent } from '../serial-log-dialog/serial-log-dialog.component';
import { SettingsDialogComponent } from '../settings-dialog/settings-dialog.component';
import { ToolbarButtonComponent } from '../toolbar-button/toolbar-button.component';

@Component({
  imports: [
    LoadButtonComponent,
    LogoComponent,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    ToolbarButtonComponent,
    SaveButtonComponent,
  ],
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  host: {
    class: 'flex flex-col',
  },
})
export class ToolbarComponent {
  private matDialog = inject(MatDialog);
  public isWebSerialApiSupported = 'serial' in navigator;

  public openSettingsDialog() {
    this.matDialog.open(SettingsDialogComponent);
  }

  public openSerialLogDialog() {
    this.matDialog.open(SerialLogDialogComponent, {
      width: '80vw',
      maxWidth: '80vw',
    });
  }

  public openAbstractSyntaxTreeDialog() {
    this.matDialog.open(AbstractSyntaxTreeDialogComponent, {
      width: '80vw',
      maxWidth: '80vw',
    });
  }
}
