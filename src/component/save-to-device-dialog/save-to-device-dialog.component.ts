import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatStepperModule } from '@angular/material/stepper';
import {
  CHANGE_TYPE,
  DiffTreeNode,
  FlatTreeNodeValue,
  diff as treeObjectDiff,
} from 'tree-object-diff';
import { ChordTreeNode } from '../../model/chord.model';
import { KeyBoardLayout } from '../../model/keyboard-layout.model';
import { IconGuardPipe } from '../../pipe/icon-guard.pipe';
import { ChordLoaderService } from '../../service/chord-loader.service';
import { SerialService } from '../../service/serial.service';
import { EditorStore } from '../../store/editor.store';
import { KeyboardLayoutStore } from '../../store/keyboard-layout.store';
import {
  convertChordTreeNodeToTcclStringForm,
  convertTcclFileToChordTreeNodes,
} from '../../util/chord.util';

type ChordDiffNode = FlatTreeNodeValue<ChordTreeNode> & { id: number };

interface ChordDiffItem {
  node: ChordDiffNode;
  ancestors: ChordDiffNode[];
}

function convertChordDiffItemsToStringItems(
  chordDiffItems: ChordDiffItem[],
  keyboardLayout: KeyBoardLayout,
): string[] {
  return chordDiffItems.map((item) => {
    const chordInStringForm = convertChordTreeNodeToTcclStringForm(
      item.node,
      keyboardLayout,
    );
    const ancestorsInStringForm = item.ancestors.map((a) =>
      convertChordTreeNodeToTcclStringForm(a, keyboardLayout, true),
    );
    return [...ancestorsInStringForm, chordInStringForm].join(' | ');
  });
}

@Component({
  selector: 'app-save-to-device-dialog',
  templateUrl: 'save-to-device-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatStepperModule,
    MatProgressBarModule,
    MatIconModule,
    IconGuardPipe,
  ],
})
export class SaveToDeviceDialogComponent implements OnInit, OnDestroy {
  public editorStore = inject(EditorStore);
  private keyboardLayout = inject(KeyboardLayoutStore).selectedEntity;
  private chordLoaderService = inject(ChordLoaderService);
  private serialService = inject(SerialService);

  public loading = signal(true);
  public addedChords = signal<string[]>([]);
  public removedChords = signal<string[]>([]);

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
    const rawDiff = treeObjectDiff(
      {
        id: -1,
        level: -1,
        input: [],
        output: [],
        parentId: null,
        children: chordTreeNodesFromDevice,
      },
      {
        id: -1,
        level: -1,
        input: [],
        output: [],
        parentId: null,
        children: chordTreeNodesFromEditor,
      },
    );
    const addedChords: ChordDiffItem[] = [];
    const removeChords: ChordDiffItem[] = [];

    function processDiffTreeNodes(
      nodes: DiffTreeNode<ChordTreeNode>[],
      ancestors: ChordDiffNode[],
    ) {
      const ancestorNodes = [...ancestors];
      nodes.forEach((node) => {
        processDiffTreeNode(node, ancestorNodes);
        processDiffTreeNodes(node.children, [
          ...ancestorNodes,
          (node.change[0] === CHANGE_TYPE.Deleted
            ? node.detail.oldNode
            : node.detail.newNode) as ChordDiffNode,
        ]);
      });
    }

    function processDiffTreeNode(
      node: DiffTreeNode<ChordTreeNode>,
      ancestors: ChordDiffNode[],
    ) {
      switch (node.change[0]) {
        case CHANGE_TYPE.Added:
          if (node.detail.newNode) {
            addedChords.push({
              node: node.detail.newNode as ChordDiffNode,
              ancestors,
            });
          }
          break;
        case CHANGE_TYPE.Deleted:
          if (node.detail.oldNode) {
            removeChords.push({
              node: node.detail.oldNode as ChordDiffNode,
              ancestors,
            });
          }
          break;
      }
    }

    processDiffTreeNodes(rawDiff.diffTree[0].children, []);
    this.addedChords.set(
      convertChordDiffItemsToStringItems(addedChords, keyboardLayout),
    );
    this.removedChords.set(
      convertChordDiffItemsToStringItems(removeChords, keyboardLayout),
    );
    this.loading.set(false);
  }

  public async ngOnDestroy(): Promise<void> {
    await this.serialService.disconnect();
  }
}
