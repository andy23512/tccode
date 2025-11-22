import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatStepperModule } from '@angular/material/stepper';
import { diff as treeObjectDiff } from 'tree-object-diff';
import { ChordLoaderService } from '../../service/chord-loader.service';
import { EditorStore } from '../../store/editor.store';
import { KeyboardLayoutStore } from '../../store/keyboard-layout.store';
import { convertTcclFileToChordTreeNodes } from '../../util/chord.util';

@Component({
  selector: 'app-save-to-device-dialog',
  templateUrl: 'save-to-device-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule, MatStepperModule],
})
export class SaveToDeviceDialogComponent implements OnInit {
  public editorStore = inject(EditorStore);
  private keyboardLayout = inject(KeyboardLayoutStore).selectedEntity;
  private chordLoaderService = inject(ChordLoaderService);

  public async ngOnInit(): Promise<void> {
    const content = this.editorStore.content();
    const keyboardLayout = this.keyboardLayout();
    if (!keyboardLayout) {
      return;
    }
    const chordTreeNodesFromEditor = convertTcclFileToChordTreeNodes(
      content,
      keyboardLayout,
    );
    const chordTreeNodesFromDevice =
      await this.chordLoaderService.loadChordTreeNodesFromDevice({
        disconnect: false,
      });
    console.log(
      treeObjectDiff(
        {
          id: 0,
          level: -1,
          input: [],
          output: [],
          parentId: null,
          children: chordTreeNodesFromDevice,
        },
        {
          id: 0,
          level: -1,
          input: [],
          output: [],
          parentId: null,
          children: chordTreeNodesFromEditor,
        },
      ),
    );
  }
}
