import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KeyBindings } from '../../model/setting.model';
import { ChordLoaderService } from '../../service/chord-loader.service';
import { EditorStore } from '../../store/editor.store';
import { SettingStore } from '../../store/setting.store';
import { EditorComponent } from './editor.component';

const fake = {
  value: '',
  noModel: false,
  changeListener: null as null | (() => void),
  setValue: jest.fn(),
  updateOptions: jest.fn(),
  create: jest.fn(),
  vimDispose: jest.fn(),
  initVimMode: jest.fn(),
  emacs: [] as {
    dispose: jest.Mock;
    start: jest.Mock;
    markCb?: (e: boolean) => void;
    keyCb?: (s: string) => void;
  }[],
};

jest.mock('monaco-editor', () => ({
  editor: {
    create: (...args: unknown[]) => fake.create(...args),
  },
}));
jest.mock('monaco-vim', () => ({
  initVimMode: (...args: unknown[]) => fake.initVimMode(...args),
}));
jest.mock('monaco-emacs', () => ({
  EmacsExtension: class {
    public dispose = jest.fn();
    public start = jest.fn();
    public markCb?: (e: boolean) => void;
    public keyCb?: (s: string) => void;
    constructor(public editor: unknown) {
      fake.emacs.push(this);
    }
    onDidMarkChange(cb: (e: boolean) => void) {
      this.markCb = cb;
    }
    onDidChangeKey(cb: (s: string) => void) {
      this.keyCb = cb;
    }
  },
}));

describe('EditorComponent', () => {
  const loader = { loadFromFile: jest.fn() };
  let fixture: ComponentFixture<EditorComponent>;
  let editorStore: InstanceType<typeof EditorStore>;
  let settings: InstanceType<typeof SettingStore>;
  let monacoEditor: { getModel: jest.Mock; updateOptions: jest.Mock };

  const root = () => fixture.nativeElement as HTMLElement;
  const overlay = () => root().children[2] as HTMLElement;
  const statusBar = () => root().children[1] as HTMLElement;
  const settle = () => {
    fixture.detectChanges();
    TestBed.tick();
    fixture.detectChanges();
  };
  const dragEvent = (type: string, files?: File[]) => {
    const event = new Event(type, { bubbles: true, cancelable: true }) as DragEvent;
    Object.defineProperty(event, 'dataTransfer', {
      value: files ? { files } : null,
    });
    return event;
  };
  const container = () => root().children[0] as HTMLElement;

  beforeEach(() => {
    localStorage.clear();
    fake.value = '';
    fake.noModel = false;
    fake.changeListener = null;
    fake.setValue.mockReset().mockImplementation((v: string) => (fake.value = v));
    fake.updateOptions.mockReset();
    fake.vimDispose.mockReset();
    fake.initVimMode.mockReset().mockReturnValue({ dispose: fake.vimDispose });
    fake.emacs.length = 0;
    loader.loadFromFile.mockReset();
    monacoEditor = {
      getModel: jest.fn(() =>
        fake.noModel
          ? null
          : {
              getValue: () => fake.value,
              setValue: fake.setValue,
              onDidChangeContent: (cb: () => void) => (fake.changeListener = cb),
            },
      ),
      updateOptions: fake.updateOptions,
    };
    fake.create.mockReset().mockReturnValue(monacoEditor);
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      providers: [{ provide: ChordLoaderService, useValue: loader }],
    });
    editorStore = TestBed.inject(EditorStore);
    settings = TestBed.inject(SettingStore);
    fixture = TestBed.createComponent(EditorComponent);
    settle();
  });

  it('creates one Monaco editor in the container, starting empty with the TCCL language and theme', () => {
    expect(fake.create).toHaveBeenCalledTimes(1);
    const [element, options] = fake.create.mock.calls[0];
    expect(element).toBe(container());
    expect(options).toMatchObject({
      value: '',
      language: 'tccl',
      theme: 'tccl-theme',
      automaticLayout: true,
    });
  });

  it('throws when Monaco gives an editor with no model', () => {
    fake.noModel = true;
    fake.create.mockClear();
    const other = TestBed.createComponent(EditorComponent);
    expect(() => other.detectChanges()).toThrow('Editor has no model.');
  });

  it('puts the content of the store into the editor', () => {
    editorStore.setContent('a + b = ab');
    settle();
    expect(fake.setValue).toHaveBeenCalledWith('a + b = ab');
  });

  it('does not set the content again when the editor already has it', () => {
    fake.value = 'same';
    fake.setValue.mockClear();
    editorStore.setContent('same');
    settle();
    expect(fake.setValue).not.toHaveBeenCalled();
  });

  it('copies what the user types into the store', () => {
    fake.value = 'typed text';
    fake.changeListener?.();
    expect(editorStore.content()).toBe('typed text');
  });

  it('locks the editor read-only and unlocks it', () => {
    settings.set('editorLocked', true);
    settle();
    expect(fake.updateOptions).toHaveBeenLastCalledWith({ readOnly: true });
    settings.set('editorLocked', false);
    settle();
    expect(fake.updateOptions).toHaveBeenLastCalledWith({ readOnly: false });
  });

  it('uses the classic key bindings by default: no Vim, no Emacs', () => {
    expect(fake.initVimMode).not.toHaveBeenCalled();
    expect(fake.emacs).toHaveLength(0);
  });

  it('starts Vim mode with the status bar when Vim is chosen', () => {
    settings.set('keyBindings', KeyBindings.Vim);
    settle();
    expect(fake.initVimMode).toHaveBeenCalledTimes(1);
    expect(fake.initVimMode).toHaveBeenCalledWith(monacoEditor, statusBar());
    expect(fake.emacs).toHaveLength(0);
  });

  it('starts Emacs mode and shows the mark and key state in the status bar', () => {
    settings.set('keyBindings', KeyBindings.Emacs);
    settle();
    expect(fake.emacs).toHaveLength(1);
    const emacs = fake.emacs[0];
    expect(emacs.start).toHaveBeenCalledTimes(1);
    emacs.markCb?.(true);
    expect(statusBar().textContent).toBe('Mark Set!');
    emacs.markCb?.(false);
    expect(statusBar().textContent).toBe('Mark Unset');
    emacs.keyCb?.('C-x');
    expect(statusBar().textContent).toBe('C-x');
    expect(fake.initVimMode).not.toHaveBeenCalled();
  });

  it('turns Vim off when switching to Emacs, and Emacs off when switching back to classic', () => {
    settings.set('keyBindings', KeyBindings.Vim);
    settle();
    settings.set('keyBindings', KeyBindings.Emacs);
    settle();
    expect(fake.vimDispose).toHaveBeenCalledTimes(1);
    expect(fake.emacs[0].dispose).not.toHaveBeenCalled();
    settings.set('keyBindings', KeyBindings.Classic);
    settle();
    expect(fake.emacs[0].dispose).toHaveBeenCalledTimes(1);
    expect(fake.initVimMode).toHaveBeenCalledTimes(1);
    expect(fake.emacs).toHaveLength(1);
  });

  it('disposes the Vim or Emacs mode that is on when the component is destroyed', () => {
    settings.set('keyBindings', KeyBindings.Vim);
    settle();
    fixture.destroy();
    expect(fake.vimDispose).toHaveBeenCalledTimes(1);
  });

  it('destroys cleanly in classic mode', () => {
    expect(() => fixture.destroy()).not.toThrow();
  });

  it('hides the drop overlay until a drag is over the editor, and shows it while dragging', () => {
    expect(overlay().classList).toContain('hidden');
    container().dispatchEvent(dragEvent('dragover'));
    fixture.detectChanges();
    expect(overlay().classList).not.toContain('hidden');
    container().dispatchEvent(dragEvent('dragleave'));
    fixture.detectChanges();
    expect(overlay().classList).toContain('hidden');
  });

  it('stops the default handling and bubbling of drag and drop events', () => {
    for (const type of ['dragover', 'dragleave', 'drop']) {
      const event = dragEvent(type);
      const parent = jest.fn();
      root().addEventListener(type, parent);
      container().dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
      expect(parent).not.toHaveBeenCalled();
    }
  });

  it('loads a single dropped file and hides the overlay', () => {
    const file = new File(['x'], 'x.tccl');
    container().dispatchEvent(dragEvent('dragover'));
    container().dispatchEvent(dragEvent('drop', [file]));
    fixture.detectChanges();
    expect(loader.loadFromFile).toHaveBeenCalledTimes(1);
    expect(loader.loadFromFile).toHaveBeenCalledWith(file);
    expect(overlay().classList).toContain('hidden');
  });

  it('ignores a drop of several files, or of none', () => {
    container().dispatchEvent(dragEvent('drop', [new File(['1'], '1'), new File(['2'], '2')]));
    container().dispatchEvent(dragEvent('drop', []));
    container().dispatchEvent(dragEvent('drop'));
    expect(loader.loadFromFile).not.toHaveBeenCalled();
  });
});
