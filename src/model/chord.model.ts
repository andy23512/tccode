// [action, phrase]. The action would contain entries for parent hash if the chord has a parent
export type ChordInNumberListForm = [number[], number[]];

export interface Chord {
  id: number; // hash
  input: number[];
  actions: number[];
  output: number[];
  parentId: number | null; // parentHash
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
