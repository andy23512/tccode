export type ChordInNumberListForm = [number[], number[]];

export interface Chord {
  hash: number;
  input: number[];
  output: number[];
  parentHash: number | null;
}

export interface ChordWithChildren extends Chord {
  children: ChordWithChildren[];
}

export interface ChordLibraryLoadStatus {
  complete: boolean;
  loaded: number;
  total: number;
}
