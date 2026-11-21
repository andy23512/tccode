import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ChordLoaderService } from '../../service/chord-loader.service';
import { ChordSaverService } from '../../service/chord-saver.service';
import { AbstractSyntaxTreeDialogComponent } from '../abstract-syntax-tree-dialog/abstract-syntax-tree-dialog.component';
import { InformationDialogComponent } from '../information-dialog/information-dialog.component';
import { SerialLogDialogComponent } from '../serial-log-dialog/serial-log-dialog.component';
import { SettingsDialogComponent } from '../settings-dialog/settings-dialog.component';
import { ToolbarComponent } from './toolbar.component';

jest.mock('monaco-editor', () => ({
  MarkerSeverity: { Error: 8 },
  editor: { onDidChangeMarkers: () => ({ dispose: () => undefined }) },
}));

describe('ToolbarComponent', () => {
  const dialog = { open: jest.fn() };
  let fixture: ComponentFixture<ToolbarComponent>;

  const bar = () => fixture.nativeElement as HTMLElement;
  const tooltips = () =>
    Array.from(bar().querySelectorAll('app-toolbar-button')).map((e) =>
      e.querySelector('mat-icon')?.textContent?.trim(),
    );
  const buttonFor = (icon: string) => {
    const host = Array.from(bar().querySelectorAll('app-toolbar-button')).find(
      (e) => e.querySelector('mat-icon')?.textContent?.trim() === icon,
    );
    if (!host) throw new Error(`no button with icon ${icon}`);
    return host.querySelector('button') as HTMLButtonElement;
  };

  function create(serial: boolean) {
    if (serial) {
      Object.defineProperty(navigator, 'serial', { value: {}, configurable: true });
    } else {
      delete (navigator as unknown as Record<string, unknown>)['serial'];
    }
    fixture = TestBed.createComponent(ToolbarComponent);
    fixture.detectChanges();
  }

  beforeEach(() => {
    localStorage.clear();
    dialog.open.mockReset();
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      providers: [
        { provide: MatDialog, useValue: dialog },
        { provide: ChordLoaderService, useValue: {} },
        { provide: ChordSaverService, useValue: {} },
      ],
    });
  });

  afterEach(() => {
    delete (navigator as unknown as Record<string, unknown>)['serial'];
  });

  it('is a column', () => {
    create(true);
    expect(bar().classList).toContain('flex');
    expect(bar().classList).toContain('flex-col');
  });

  it('shows, top to bottom: logo, load, save, lock, then settings, information, serial log and syntax tree', () => {
    create(true);
    expect(bar().querySelectorAll('app-logo')).toHaveLength(1);
    expect(
      Array.from(bar().children).map((c) => c.tagName.toLowerCase()),
    ).toEqual([
      'div',
      'app-load-button',
      'app-save-button',
      'app-lock-button',
      'div',
      'app-toolbar-button',
      'app-toolbar-button',
      'app-toolbar-button',
      'app-toolbar-button',
    ]);
    expect(tooltips().slice(-4)).toEqual(['settings', 'info', 'article', 'account_tree']);
  });

  it('hides the serial log button when the browser has no Web Serial API', () => {
    create(false);
    expect(fixture.componentInstance.isWebSerialApiSupported).toBe(false);
    expect(tooltips().slice(-3)).toEqual(['settings', 'info', 'account_tree']);
    expect(tooltips()).not.toContain('article');
  });

  it('opens the settings dialog at its default size', () => {
    create(true);
    buttonFor('settings').click();
    expect(dialog.open).toHaveBeenCalledTimes(1);
    expect(dialog.open).toHaveBeenCalledWith(SettingsDialogComponent);
  });

  it.each([
    ['info', InformationDialogComponent],
    ['article', SerialLogDialogComponent],
    ['account_tree', AbstractSyntaxTreeDialogComponent],
  ] as const)('opens the %s dialog at 80% of the screen width', (icon, component) => {
    create(true);
    buttonFor(icon).click();
    expect(dialog.open).toHaveBeenCalledTimes(1);
    expect(dialog.open).toHaveBeenCalledWith(component, {
      width: '80vw',
      maxWidth: '80vw',
    });
  });
});
