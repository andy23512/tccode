import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatStepperModule } from '@angular/material/stepper';
import * as monaco from 'monaco-editor';

@Component({
  selector: 'app-save-to-device-dialog',
  templateUrl: 'save-to-device-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule, MatStepperModule],
})
export class SaveToDeviceDialogComponent implements OnInit {
  public noEditorError = signal<boolean | null>(null);

  public ngOnInit(): void {
    const model = monaco.editor.getModels()[0];
    const allMarkers = monaco.editor.getModelMarkers({ resource: model.uri });
    const errors = allMarkers.filter(
      (marker) => marker.severity === monaco.MarkerSeverity.Error,
    );
    this.noEditorError.set(errors.length === 0);
  }
}
