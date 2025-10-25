export interface ChordLibraryLoadStatus {
  complete: boolean;
  loaded: number;
  total: number;
}

export interface Chord {
  index: number;
  input: number[];
  output: number[];
}

export interface ChordLibrary {
  chords: Chord[];
}

export interface Device {
  isConnected: boolean;
  version: string;
  id: string;
  chordLibraryLoadStatus: ChordLibraryLoadStatus | null;
  chordLibrary: ChordLibrary | null;
}
