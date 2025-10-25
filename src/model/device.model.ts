export interface RawChordLibraryLoadStatus {
  complete: boolean;
  loaded: number;
  total: number;
}

export interface RawChord {
  index: number;
  input: string;
  output: string;
}

export interface RawChordLibrary {
  rawChords: RawChord[];
}

export interface Device {
  isConnected: boolean;
  version: string;
  id: string;
  rawChordLibraryLoadStatus: RawChordLibraryLoadStatus | null;
  rawChordLibrary: RawChordLibrary | null;
}
