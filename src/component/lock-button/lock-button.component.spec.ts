import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SettingStore } from '../../store/setting.store';
import { ToolbarButtonComponent } from '../toolbar-button/toolbar-button.component';
import { LockButtonComponent } from './lock-button.component';

describe('LockButtonComponent', () => {
  let fixture: ComponentFixture<LockButtonComponent>;
  let store: InstanceType<typeof SettingStore>;

  const toolbarButton = () =>
    fixture.debugElement.children[0].componentInstance as ToolbarButtonComponent;
  const iconText = () =>
    (
      fixture.nativeElement.querySelector('mat-icon') as HTMLElement
    ).textContent?.trim();
  const click = () => {
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    fixture.detectChanges();
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [NoopAnimationsModule] });
    store = TestBed.inject(SettingStore);
    fixture = TestBed.createComponent(LockButtonComponent);
    fixture.detectChanges();
  });

  it('offers to lock the editor when it is unlocked', () => {
    expect(toolbarButton().tooltip()).toBe('Lock the editor (Read-only)');
    expect(toolbarButton().icon()).toBe('lock_open_right');
    expect(iconText()).toBe('lock_open_right');
  });

  it('offers to unlock the editor when it is locked', () => {
    store.set('editorLocked', true);
    fixture.detectChanges();
    expect(toolbarButton().tooltip()).toBe('Unlock the editor');
    expect(toolbarButton().icon()).toBe('lock');
    expect(iconText()).toBe('lock');
  });

  it('locks the editor on click, then unlocks it on the next click', () => {
    click();
    expect(store.editorLocked()).toBe(true);
    expect(toolbarButton().icon()).toBe('lock');
    click();
    expect(store.editorLocked()).toBe(false);
    expect(toolbarButton().icon()).toBe('lock_open_right');
  });

  it('changes only the editorLocked setting', () => {
    click();
    expect(store.showWelcomeDialogWhenStart()).toBe(true);
    expect(store.autoConnectToDevice()).toBe(false);
  });
});
