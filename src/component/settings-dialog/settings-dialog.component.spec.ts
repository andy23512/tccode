import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KeyBindings } from '../../model/setting.model';
import { SettingStore } from '../../store/setting.store';
import { SettingsDialogComponent } from './settings-dialog.component';

describe('SettingsDialogComponent', () => {
  let fixture: ComponentFixture<SettingsDialogComponent>;
  let store: InstanceType<typeof SettingStore>;
  const dialogRef = { close: jest.fn() };

  const checkboxes = () =>
    Array.from(
      fixture.nativeElement.querySelectorAll('mat-checkbox') as NodeListOf<HTMLElement>,
    );
  const boxFor = (label: string) => {
    const host = checkboxes().find((c) => c.textContent?.includes(label));
    if (!host) throw new Error(`no checkbox labelled ${label}`);
    return host.querySelector('input') as HTMLInputElement;
  };
  const select = () =>
    fixture.debugElement.query(By.directive(MatSelect)).componentInstance as MatSelect;

  const WELCOME = 'Show the welcome dialog when start';
  const AUTO = 'Auto connect to device when you save to or load from device';
  const BOPOMOFO = 'Detect conflicts with Bopomofo chords';

  beforeEach(() => {
    localStorage.clear();
    dialogRef.close.mockReset();
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      providers: [{ provide: MatDialogRef, useValue: dialogRef }],
    });
    store = TestBed.inject(SettingStore);
    fixture = TestBed.createComponent(SettingsDialogComponent);
    fixture.detectChanges();
  });

  it('has the title Settings and three checkboxes', () => {
    expect(
      fixture.nativeElement.querySelector('h2')?.textContent?.trim(),
    ).toBe('Settings');
    expect(checkboxes()).toHaveLength(3);
  });

  it('shows the default settings', () => {
    expect(boxFor(WELCOME).checked).toBe(true);
    expect(boxFor(AUTO).checked).toBe(false);
    expect(boxFor(BOPOMOFO).checked).toBe(false);
    expect(select().value).toBe(KeyBindings.Classic);
  });

  it('shows the stored settings', () => {
    store.set('showWelcomeDialogWhenStart', false);
    store.set('autoConnectToDevice', true);
    store.set('detectConflictsWithBopomofoChords', true);
    store.set('keyBindings', KeyBindings.Vim);
    fixture.detectChanges();
    expect(boxFor(WELCOME).checked).toBe(false);
    expect(boxFor(AUTO).checked).toBe(true);
    expect(boxFor(BOPOMOFO).checked).toBe(true);
    expect(select().value).toBe(KeyBindings.Vim);
  });

  it.each([
    [WELCOME, 'showWelcomeDialogWhenStart', true],
    [AUTO, 'autoConnectToDevice', false],
    [BOPOMOFO, 'detectConflictsWithBopomofoChords', false],
  ] as const)('the "%s" checkbox writes %s, in both directions', (label, key, initial) => {
    boxFor(label).click();
    fixture.detectChanges();
    expect(store[key]()).toBe(!initial);
    boxFor(label).click();
    fixture.detectChanges();
    expect(store[key]()).toBe(initial);
  });

  it('a checkbox changes only its own setting', () => {
    boxFor(AUTO).click();
    expect(store.autoConnectToDevice()).toBe(true);
    expect(store.showWelcomeDialogWhenStart()).toBe(true);
    expect(store.detectConflictsWithBopomofoChords()).toBe(false);
    expect(store.keyBindings()).toBe(KeyBindings.Classic);
  });

  it('offers the key bindings Classic, Vim and Emacs, in that order', () => {
    expect(
      fixture.componentInstance.keyBindingOptions.map((o) => [o.label, o.value]),
    ).toEqual([
      ['Classic', KeyBindings.Classic],
      ['Vim', KeyBindings.Vim],
      ['Emacs', KeyBindings.Emacs],
    ]);
    expect(select().options.map((o) => o.viewValue)).toEqual([
      'Classic',
      'Vim',
      'Emacs',
    ]);
  });

  it('writes the chosen key bindings to the setting', () => {
    select().options.find((o) => o.viewValue === 'Emacs')?.select();
    fixture.detectChanges();
    expect(store.keyBindings()).toBe(KeyBindings.Emacs);
    select().options.find((o) => o.viewValue === 'Vim')?.select();
    fixture.detectChanges();
    expect(store.keyBindings()).toBe(KeyBindings.Vim);
  });

  it('closes the dialog from the Close button', () => {
    const close = Array.from(
      fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((b) => b.textContent?.trim() === 'Close');
    close?.click();
    expect(dialogRef.close).toHaveBeenCalledTimes(1);
  });
});
