import { TestBed } from '@angular/core/testing';
import { EditorStore } from '../store/editor.store';
import { ChordSaverService } from './chord-saver.service';

function readBlob(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

describe('ChordSaverService', () => {
  const originalCreate = URL.createObjectURL;
  const originalRevoke = URL.revokeObjectURL;
  let createObjectURL: jest.Mock;
  let revokeObjectURL: jest.Mock;
  let clickSpy: jest.SpyInstance;
  let anchorWasInDocumentOnClick: boolean;

  beforeEach(() => {
    localStorage.clear();
    createObjectURL = jest.fn().mockReturnValue('blob:tccl-test');
    revokeObjectURL = jest.fn();
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;
    anchorWasInDocumentOnClick = false;
    clickSpy = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (this: HTMLAnchorElement) {
        anchorWasInDocumentOnClick = document.body.contains(this);
      });
  });

  afterEach(() => {
    clickSpy.mockRestore();
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
  });

  // The element `click()` was called on (jest records it as the call context).
  const clickedAnchor = () =>
    clickSpy.mock.contexts[0] as HTMLAnchorElement | undefined;

  const save = (content: string) => {
    TestBed.inject(EditorStore).setContent(content);
    TestBed.inject(ChordSaverService).saveAsTcclFile();
  };

  it('downloads a text/plain blob containing the editor content', async () => {
    save('a + b = cd\n');
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const blob = createObjectURL.mock.calls[0][0] as Blob;
    expect(blob.type).toBe('text/plain');
    expect(await readBlob(blob)).toBe('a + b = cd\n');
  });

  it('saves as chords.tccl using the object URL', () => {
    save('a + b = cd\n');
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(clickedAnchor()?.download).toBe('chords.tccl');
    expect(clickedAnchor()?.getAttribute('href')).toBe('blob:tccl-test');
  });

  it('clicks the link while it is attached to the document, then removes it', () => {
    save('x');
    expect(anchorWasInDocumentOnClick).toBe(true);
    const anchor = clickedAnchor() as HTMLAnchorElement;
    expect(anchor).toBeDefined();
    expect(document.body.contains(anchor)).toBe(false);
  });

  it('revokes the object URL afterwards', () => {
    save('x');
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:tccl-test');
  });

  it('can save empty content', async () => {
    save('');
    const blob = createObjectURL.mock.calls[0][0] as Blob;
    expect(await readBlob(blob)).toBe('');
  });
});
