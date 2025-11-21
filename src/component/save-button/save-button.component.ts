import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import * as monaco from 'monaco-editor';
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
    MatTooltip,
    ToolbarButtonComponent,
  ],
})
export class SaveButtonComponent implements OnInit, OnDestroy {
  private chordSaverService = inject(ChordSaverService);
  private matDialog = inject(MatDialog);
  private disposable: monaco.IDisposable | null = null;
  public hasEditorError = signal<boolean | null>(null);

  public ngOnInit(): void {
    this.disposable = monaco.editor.onDidChangeMarkers(() => {
      const model = monaco.editor.getModels()[0];
      const allMarkers = monaco.editor.getModelMarkers({
        resource: model.uri,
      });
      const errors = allMarkers.filter(
        (marker) => marker.severity === monaco.MarkerSeverity.Error,
      );
      this.hasEditorError.set(errors.length > 0);
    });
  }

  public ngOnDestroy(): void {
    this.disposable?.dispose();
  }

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
