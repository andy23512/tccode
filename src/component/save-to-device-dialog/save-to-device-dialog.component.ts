import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatStepperModule } from '@angular/material/stepper';
import { parseTccl } from '../../language-service/tccl-parser';
import { EditorStore } from '../../store/editor.store';

@Component({
  selector: 'app-save-to-device-dialog',
  templateUrl: 'save-to-device-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule, MatStepperModule],
})
export class SaveToDeviceDialogComponent implements OnInit {
  public editorStore = inject(EditorStore);

  public ngOnInit(): void {
    const content = this.editorStore.content();
    const ast = parseTccl(content).ast;
    console.log(ast.chordNode());
  }
}
