// [action, phrase]. The action would contain entries for parent hash if the chord has a parent
export type ChordInNumberListForm = [number[], number[]];

export interface Chord {
  hash: number;
  input: number[];
  output: number[];
  parentHash: number | null;
}

export interface ChordTreeNode extends Chord {
  level: number;
  children: ChordTreeNode[];
}

export interface ChordLibraryLoadStatus {
  complete: boolean;
  loaded: number;
  total: number;
}
