import {
  Chord,
  ChordInNumberListForm,
  ChordTreeNode,
} from '../model/chord.model';
import { KeyBoardLayout } from '../model/keyboard-layout.model';
import { getTcclKeyFromActionCode } from './layout.util';
import { hashChord } from './raw-chord.util';

export function getParentHashFromChordAction(
  chordAction: number[],
): number | null {
  if (chordAction[3] !== 0) {
    return null;
  }
  const parentHash = chordAction
    .slice(0, 3)
    .reduce((a, b, i) => a | (b << (i * 10)));
  if (parentHash === 0) return null;
  return parentHash;
}

export function getInputFromChordAction(chordAction: number[]): number[] {
  if (chordAction[3] !== 0) {
    return chordAction;
  }
  return chordAction.slice(3);
}

export function convertChordInNumberListFormToChord([
  action,
  phrase,
]: ChordInNumberListForm): Chord {
  return {
    hash: hashChord(action),
    parentHash: getParentHashFromChordAction(action),
    input: getInputFromChordAction(action),
    output: phrase,
  };
}

export function convertChordsToChordTreeNodes(
  chords: Chord[],
  parentHash: number | null = null,
  level = 0,
): ChordTreeNode[] {
  return chords
    .filter((chord) => chord.parentHash === parentHash)
    .map((chord) => ({
      ...chord,
      level,
      children: convertChordsToChordTreeNodes(chords, chord.hash, level + 1),
    }));
}

export function convertChordTreeNodesToTcclFile(
  chordTreeNodes: ChordTreeNode[],
  keyboardLayout: KeyBoardLayout,
  indent: string,
): string {
  function processChordTreeNodes(nodes: ChordTreeNode[], level = 0) {
    nodes.forEach((node) => {
      processChordNode(node, level);
      processChordTreeNodes(node.children, level + 1);
    });
  }
  function processChordNode(c: ChordTreeNode, level: number) {
    const outputKeys = c.output.map((actionCode) =>
      getTcclKeyFromActionCode(actionCode, keyboardLayout),
    );
    const inputKeys = c.input.filter(Boolean).map((actionCode) => {
      const key = getTcclKeyFromActionCode(actionCode, keyboardLayout);
      const indexInOutput = outputKeys.findIndex(
        (k) => k && key && k.toLowerCase() === key.toLowerCase(),
      );
      return {
        key,
        indexInOutput: indexInOutput !== -1 ? indexInOutput : Infinity,
      };
    });
    inputKeys.sort((a, b) => {
      const compareIndexInOutput = Math.sign(a.indexInOutput - b.indexInOutput);
      if (compareIndexInOutput !== 0) {
        return compareIndexInOutput;
      }
      if (a.key === b.key) {
        return 0;
      }
      if (a.key === null || typeof a.key === 'undefined') {
        return 1;
      }
      if (b.key === null || typeof b.key === 'undefined') {
        return -1;
      }
      return a.key.localeCompare(b.key);
    });
    const input = inputKeys.map((k) => k.key).join(' + ');
    const output = outputKeys.join('');
    const line = indent.repeat(level) + `${input} = ${output}`;
    outputLines.push(line);
  }

  const outputLines: string[] = [];
  processChordTreeNodes(chordTreeNodes);
  return outputLines.join('\n') + '\n';
}
