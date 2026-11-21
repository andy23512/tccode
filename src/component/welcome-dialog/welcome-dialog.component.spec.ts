import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SettingStore } from '../../store/setting.store';
import { WelcomeDialogComponent } from './welcome-dialog.component';

describe('WelcomeDialogComponent', () => {
  let fixture: ComponentFixture<WelcomeDialogComponent>;
  let store: InstanceType<typeof SettingStore>;
  const dialogRef = { close: jest.fn() };

  const checkbox = () =>
    fixture.nativeElement.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
  const text = () => fixture.nativeElement.textContent as string;

  beforeEach(() => {
    localStorage.clear();
    dialogRef.close.mockReset();
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      providers: [{ provide: MatDialogRef, useValue: dialogRef }],
    });
    store = TestBed.inject(SettingStore);
    fixture = TestBed.createComponent(WelcomeDialogComponent);
    fixture.detectChanges();
  });

  it('greets the user and recommends backing up with the official Device Manager', () => {
    expect(
      fixture.nativeElement.querySelector('h2')?.textContent?.trim(),
    ).toBe('Welcome to TanChord Code!');
    expect(text()).toContain('unofficial, experimental editor');
    expect(text()).toContain('back up your data using the official');
  });

  it('has the "show when start" box checked by default', () => {
    expect(checkbox().checked).toBe(true);
    expect(text()).toContain('Show this dialog when start');
  });

  it('shows the stored setting in the checkbox', () => {
    store.set('showWelcomeDialogWhenStart', false);
    fixture.detectChanges();
    expect(checkbox().checked).toBe(false);
  });

  it('writes the checkbox state to the setting: off, then on again', () => {
    checkbox().click();
    fixture.detectChanges();
    expect(store.showWelcomeDialogWhenStart()).toBe(false);
    checkbox().click();
    fixture.detectChanges();
    expect(store.showWelcomeDialogWhenStart()).toBe(true);
  });

  it('changes no other setting', () => {
    checkbox().click();
    expect(store.autoConnectToDevice()).toBe(false);
    expect(store.editorLocked()).toBe(false);
    expect(store.detectConflictsWithBopomofoChords()).toBe(false);
  });

  it('closes the dialog from the Start button', () => {
    const start = Array.from(
      fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((b) => b.textContent?.trim() === 'Start');
    expect(start).toBeDefined();
    start?.click();
    expect(dialogRef.close).toHaveBeenCalledTimes(1);
  });
});
