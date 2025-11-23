import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
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
  convertChordTreeNodeToTcclInputAndOutput,
  convertChordTreeNodeToTcclStringForm,
  convertTcclFileToChordTreeNodes,
} from '../../util/chord.util';
import {
  stringifyChordActions,
  stringifyPhrase,
} from '../../util/raw-chord.util';

type ChordDiffNode = FlatTreeNodeValue<ChordTreeNode> & { id: number };

interface ChordDiffItem {
  node: ChordDiffNode;
  ancestors: ChordDiffNode[];
}

interface ChordUpdateItem extends ChordDiffItem {
  oldNode: ChordDiffNode;
}

function convertChordUpdateItemsToStringItems(
  chordUpdateItem: ChordUpdateItem[],
  keyboardLayout: KeyBoardLayout,
): { fullInput: string; newOutput: string; oldOutput: string }[] {
  return chordUpdateItem.map((item) => {
    const { input, output: oldOutput } =
      convertChordTreeNodeToTcclInputAndOutput(item.oldNode, keyboardLayout);
    const { output: newOutput } = convertChordTreeNodeToTcclInputAndOutput(
      item.node,
      keyboardLayout,
    );
    const ancestorsInStringForm = item.ancestors.map((a) =>
      convertChordTreeNodeToTcclStringForm(a, keyboardLayout, 'input'),
    );
    return {
      fullInput: [...ancestorsInStringForm, input].join(' | '),
      newOutput,
      oldOutput,
    };
  });
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
      convertChordTreeNodeToTcclStringForm(a, keyboardLayout, 'input'),
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
    MatTabsModule,
  ],
})
export class SaveToDeviceDialogComponent implements OnInit, OnDestroy {
  public editorStore = inject(EditorStore);
  private keyboardLayout = inject(KeyboardLayoutStore).selectedEntity;
  private chordLoaderService = inject(ChordLoaderService);
  private serialService = inject(SerialService);
  private matSnackBar = inject(MatSnackBar);
  private matDialogRef =
    inject<MatDialogRef<SaveToDeviceDialogComponent>>(MatDialogRef);

  public loading = signal(true);
  public addedChords = signal<ChordDiffItem[]>([]);
  public removedChords = signal<ChordDiffItem[]>([]);
  public updatedChords = signal<ChordUpdateItem[]>([]);
  public addedChordsForDisplay = signal<string[]>([]);
  public removedChordsForDisplay = signal<string[]>([]);
  public updatedChordsForDisplay = signal<
    { fullInput: string; oldOutput: string; newOutput: string }[]
  >([]);
  public hasChange = computed<boolean>(() => {
    return (
      this.addedChords().length +
        this.updatedChords().length +
        this.removedChords().length >
      0
    );
  });

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
        actions: [],
        parentId: null,
        children: chordTreeNodesFromDevice,
      },
      {
        id: -1,
        level: -1,
        input: [],
        output: [],
        actions: [],
        parentId: null,
        children: chordTreeNodesFromEditor,
      },
      {
        valueEquality: (a, b) => {
          return (
            a.actions.length === b.actions.length &&
            a.actions.every((e, index) => e === b.actions[index]) &&
            a.output.length === b.output.length &&
            a.output.every((e, index) => e === b.output[index])
          );
        },
      },
    );
    const addedChords: ChordDiffItem[] = [];
    const removeChords: ChordDiffItem[] = [];
    const updatedChords: ChordUpdateItem[] = [];

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
        case CHANGE_TYPE.Updated:
          if (node.detail.oldNode && node.detail.newNode) {
            updatedChords.push({
              node: node.detail.newNode as ChordDiffNode,
              oldNode: node.detail.oldNode as ChordDiffNode,
              ancestors,
            });
          }
          break;
      }
    }

    processDiffTreeNodes(rawDiff.diffTree[0].children, []);
    this.addedChords.set(addedChords);
    this.addedChordsForDisplay.set(
      convertChordDiffItemsToStringItems(addedChords, keyboardLayout),
    );
    this.removedChords.set(removeChords);
    this.removedChordsForDisplay.set(
      convertChordDiffItemsToStringItems(removeChords, keyboardLayout),
    );
    this.updatedChords.set(updatedChords);
    this.updatedChordsForDisplay.set(
      convertChordUpdateItemsToStringItems(updatedChords, keyboardLayout),
    );
    this.loading.set(false);
  }

  public async saveChordsToDevice(): Promise<void> {
    const serialCommands: string[] = [];
    this.addedChords().forEach((c) => {
      const command = `CML C3 ${stringifyChordActions(c.node.actions)} ${stringifyPhrase(c.node.output)}`;
      serialCommands.push(command);
    });
    this.updatedChords().forEach((c) => {
      const command = `CML C3 ${stringifyChordActions(c.node.actions)} ${stringifyPhrase(c.node.output)}`;
      serialCommands.push(command);
    });
    this.removedChords().forEach((c) => {
      const command = `CML C4 ${stringifyChordActions(c.node.actions)}`;
      serialCommands.push(command);
    });
    this.serialService.batchSend(serialCommands).subscribe(() => {
      this.matSnackBar.open('Chords are successfully saved to device.');
      this.matDialogRef.close();
    });
  }

  public async ngOnDestroy(): Promise<void> {
    await this.serialService.disconnect();
  }
}
