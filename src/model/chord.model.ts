export interface Chord {
  index: number;
  input: number[];
  output: number[];
}

export interface ChordLibraryLoadStatus {
  complete: boolean;
  loaded: number;
  total: number;
}
