import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ChordLoaderService } from '../../service/chord-loader.service';
import { SettingStore } from '../../store/setting.store';
import { LoadButtonComponent } from './load-button.component';

describe('LoadButtonComponent', () => {
  const loader = {
    loadFromDevice: jest.fn(),
    loadFromFile: jest.fn(),
    loadSample: jest.fn(),
  };
  let fixture: ComponentFixture<LoadButtonComponent>;
  let store: InstanceType<typeof SettingStore>;

  const trigger = () =>
    fixture.nativeElement.querySelector('app-toolbar-button button') as HTMLButtonElement;
  const fileInput = () =>
    fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
  const menuButtons = () =>
    Array.from(
      document.querySelectorAll('.mat-mdc-menu-panel button[mat-menu-item]'),
    ) as HTMLButtonElement[];
  const openMenu = () => {
    trigger().click();
    fixture.detectChanges();
  };
  const item = (label: string) => {
    const found = menuButtons().find((b) => b.textContent?.includes(label));
    if (!found) throw new Error(`no menu item ${label}`);
    return found;
  };
  const setFiles = (files: File[] | null) =>
    Object.defineProperty(fileInput(), 'files', { value: files, configurable: true });

  beforeEach(() => {
    localStorage.clear();
    Object.values(loader).forEach((f) => f.mockReset());
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      providers: [{ provide: ChordLoaderService, useValue: loader }],
    });
    store = TestBed.inject(SettingStore);
    fixture = TestBed.createComponent(LoadButtonComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    document.querySelectorAll('.cdk-overlay-container > *').forEach((e) => e.remove());
  });

  it('has a Load button, disabled while the editor is locked', () => {
    expect(trigger().disabled).toBe(false);
    store.set('editorLocked', true);
    fixture.detectChanges();
    expect(trigger().disabled).toBe(true);
  });

  it('accepts only .json and .txt files, in a hidden input', () => {
    expect(fileInput().accept).toBe('.json,.txt');
    expect(fileInput().classList).toContain('hidden');
  });

  it('lists the five ways to load, in order', () => {
    openMenu();
    expect(menuButtons().map((b) => b.textContent?.replace(/\s+/g, ' ').trim())).toEqual([
      'developer_boardLoad from device',
      'draftLoad from file',
      'looks_oneLoad sample 1',
      'looks_twoLoad sample 2',
      'looks_3Load sample 3',
    ]);
  });

  it('loads from the device', () => {
    openMenu();
    item('Load from device').click();
    expect(loader.loadFromDevice).toHaveBeenCalledTimes(1);
    expect(loader.loadFromFile).not.toHaveBeenCalled();
  });

  it.each([1, 2, 3])('loads sample %i', (n) => {
    openMenu();
    item(`Load sample ${n}`).click();
    expect(loader.loadSample).toHaveBeenCalledWith(n);
    expect(loader.loadSample).toHaveBeenCalledTimes(1);
  });

  it('opens the file picker by clicking the hidden input', () => {
    const click = jest.spyOn(fileInput(), 'click').mockImplementation(() => undefined);
    openMenu();
    item('Load from file').click();
    expect(click).toHaveBeenCalledTimes(1);
  });

  it('loads the first chosen file', () => {
    const a = new File(['a'], 'a.json');
    const b = new File(['b'], 'b.json');
    setFiles([a, b]);
    fileInput().dispatchEvent(new Event('change'));
    expect(loader.loadFromFile).toHaveBeenCalledTimes(1);
    // File objects compare equal to each other in Jest, so check identity.
    expect(loader.loadFromFile.mock.calls[0][0]).toBe(a);
    expect(loader.loadFromFile.mock.calls[0][0]).not.toBe(b);
  });

  it('does nothing when the choice was cancelled (no files, or null)', () => {
    setFiles([]);
    fileInput().dispatchEvent(new Event('change'));
    setFiles(null);
    fileInput().dispatchEvent(new Event('change'));
    expect(loader.loadFromFile).not.toHaveBeenCalled();
  });

  it('does nothing when FileReader is not available', () => {
    const original = globalThis.FileReader;
    // @ts-expect-error simulating an environment without FileReader
    delete globalThis.FileReader;
    try {
      setFiles([new File(['a'], 'a.json')]);
      fileInput().dispatchEvent(new Event('change'));
      expect(loader.loadFromFile).not.toHaveBeenCalled();
    } finally {
      globalThis.FileReader = original;
    }
  });
});
