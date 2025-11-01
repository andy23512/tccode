import { Chord } from '../model/chord.model';
import { KeyBoardLayout } from '../model/keyboard-layout.model';
import { TcclChord } from '../model/tccl.model';
import { getTcclKeyFromActionCode } from './layout.util';

export function convertChordListToTcclFile(
  chords: Chord[],
  keyboardLayout: KeyBoardLayout,
) {
  const tcclChords: TcclChord[] = chords.map((c) => {
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
    return {
      input: inputKeys.map((k) => k.key).join(' + '),
      output: outputKeys.join(''),
    };
  });
  tcclChords.sort((a, b) => a.output.localeCompare(b.output));
  return tcclChords
    .map(({ input, output }) => `${input} = ${output}`)
    .join('\n');
}
