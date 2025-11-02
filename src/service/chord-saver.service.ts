import { inject, Injectable } from '@angular/core';
import { EditorStore } from '../store/editor.store';

@Injectable({ providedIn: 'root' })
export class ChordSaverService {
  private editorStore = inject(EditorStore);

  public saveAsTcclFile() {
    const content = this.editorStore.content();
    const mimeType = 'text/plain';
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chords.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
