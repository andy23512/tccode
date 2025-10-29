import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import {
  SAMPLE_CHORDS_1,
  SAMPLE_CHORDS_2,
} from '../../data/sample-chords.const';
import { IconGuardPipe } from '../../pipe/icon-guard.pipe';
import { EditorStore } from '../../store/editor.store';
import { ConnectButtonComponent } from '../connect-button/connect-button.component';
import { LogoComponent } from '../logo/logo.component';
import { SerialLogDialogComponent } from '../serial-log-dialog/serial-log-dialog.component';
import { SettingsDialogComponent } from '../settings-dialog/settings-dialog.component';
import { ToolbarButtonComponent } from '../toolbar-button/toolbar-button.component';

@Component({
  imports: [
    LogoComponent,
    ConnectButtonComponent,
    ToolbarButtonComponent,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    IconGuardPipe,
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
  private editorStore = inject(EditorStore);

  public loadChordLibrarySample(index: 1 | 2) {
    const chordLibrary = index === 1 ? SAMPLE_CHORDS_1 : SAMPLE_CHORDS_2;
    this.editorStore.setContent(chordLibrary);
  }

  public openSettingsDialog() {
    this.matDialog.open(SettingsDialogComponent);
  }

  public openSerialLogDialog() {
    this.matDialog.open(SerialLogDialogComponent, {
      width: '80vw',
      maxWidth: '80vw',
    });
  }
}
