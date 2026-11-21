import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ChordSaverService } from '../../service/chord-saver.service';
import { SaveToDeviceDialogComponent } from '../save-to-device-dialog/save-to-device-dialog.component';
import { SaveButtonComponent } from './save-button.component';

const mockMonaco = {
  listener: null as null | (() => void),
  dispose: jest.fn(),
  markers: [] as { severity: number }[],
};

jest.mock('monaco-editor', () => ({
  MarkerSeverity: { Hint: 1, Info: 2, Warning: 4, Error: 8 },
  editor: {
    onDidChangeMarkers: (cb: () => void) => {
      mockMonaco.listener = cb;
      return { dispose: () => mockMonaco.dispose() };
    },
    getModels: () => [{ uri: 'model-uri' }],
    getModelMarkers: (filter: { resource: string }) =>
      filter.resource === 'model-uri' ? mockMonaco.markers : [],
  },
}));

describe('SaveButtonComponent', () => {
  const saver = { saveAsTcclFile: jest.fn() };
  const dialog = { open: jest.fn() };
  let fixture: ComponentFixture<SaveButtonComponent>;

  const trigger = () =>
    fixture.nativeElement.querySelector('app-toolbar-button button') as HTMLButtonElement;
  const menuButtons = () =>
    Array.from(
      document.querySelectorAll('.mat-mdc-menu-panel button[mat-menu-item]'),
    ) as HTMLButtonElement[];
  const item = (label: string) => {
    const found = menuButtons().find((b) => b.textContent?.includes(label));
    if (!found) throw new Error(`no menu item ${label}`);
    return found;
  };
  const openMenu = () => {
    trigger().click();
    fixture.detectChanges();
  };
  const markersChanged = (...severities: number[]) => {
    mockMonaco.markers = severities.map((severity) => ({ severity }));
    mockMonaco.listener?.();
    fixture.detectChanges();
  };

  beforeEach(() => {
    saver.saveAsTcclFile.mockReset();
    dialog.open.mockReset();
    mockMonaco.listener = null;
    mockMonaco.markers = [];
    mockMonaco.dispose.mockReset();
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      providers: [
        { provide: ChordSaverService, useValue: saver },
        { provide: MatDialog, useValue: dialog },
      ],
    });
    fixture = TestBed.createComponent(SaveButtonComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    document.querySelectorAll('.cdk-overlay-container > *').forEach((e) => e.remove());
  });

  it('has not heard of any marker yet, so the error flag is null', () => {
    expect(fixture.componentInstance.hasEditorError()).toBeNull();
  });

  it('lists Save to device and Save as TCCL file', () => {
    openMenu();
    expect(menuButtons().map((b) => b.textContent?.replace(/\s+/g, ' ').trim())).toEqual([
      'developer_boardSave to device',
      'draftSave as TCCL file',
    ]);
  });

  it('opens the save-to-device dialog at 80% of the screen', () => {
    openMenu();
    item('Save to device').click();
    expect(dialog.open).toHaveBeenCalledWith(SaveToDeviceDialogComponent, {
      width: '80vw',
      maxWidth: '80vw',
      height: '80vh',
    });
  });

  it('saves a TCCL file', () => {
    openMenu();
    item('Save as TCCL file').click();
    expect(saver.saveAsTcclFile).toHaveBeenCalledTimes(1);
    expect(dialog.open).not.toHaveBeenCalled();
  });

  it('flags an error when the editor has an Error marker', () => {
    markersChanged(4, 8);
    expect(fixture.componentInstance.hasEditorError()).toBe(true);
  });

  it('does not count warnings, infos and hints as errors', () => {
    markersChanged(1, 2, 4);
    expect(fixture.componentInstance.hasEditorError()).toBe(false);
  });

  it('clears the flag when the errors are gone', () => {
    markersChanged(8);
    expect(fixture.componentInstance.hasEditorError()).toBe(true);
    markersChanged();
    expect(fixture.componentInstance.hasEditorError()).toBe(false);
  });

  it('disables Save to device while there is an error, and enables it again afterwards', () => {
    markersChanged(8);
    openMenu();
    expect(item('Save to device').getAttribute('aria-disabled')).toBe('true');
    item('Save to device').click();
    expect(dialog.open).not.toHaveBeenCalled();
    expect(item('Save as TCCL file').getAttribute('aria-disabled')).not.toBe('true');
    markersChanged();
    expect(item('Save to device').getAttribute('aria-disabled')).not.toBe('true');
  });

  it('stops listening to markers when it is destroyed', () => {
    expect(mockMonaco.dispose).not.toHaveBeenCalled();
    fixture.destroy();
    expect(mockMonaco.dispose).toHaveBeenCalledTimes(1);
  });
});
