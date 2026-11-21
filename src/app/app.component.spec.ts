import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { WelcomeDialogComponent } from '../component/welcome-dialog/welcome-dialog.component';
import { SettingStore } from '../store/setting.store';
import { AppComponent } from './app.component';

jest.mock('../component/editor/editor.component', () => {
  const { Component } = jest.requireActual('@angular/core');
  @Component({ selector: 'app-editor', template: '' })
  class EditorComponent {}
  return { EditorComponent };
});
jest.mock('../component/toolbar/toolbar.component', () => {
  const { Component } = jest.requireActual('@angular/core');
  @Component({ selector: 'app-toolbar', template: '' })
  class ToolbarComponent {}
  return { ToolbarComponent };
});

describe('AppComponent', () => {
  const dialog = { open: jest.fn() };

  beforeEach(() => {
    localStorage.clear();
    dialog.open.mockReset();
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      providers: [{ provide: MatDialog, useValue: dialog }],
    });
  });

  it('fills the screen as a row with the toolbar first and the editor taking the rest', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.classList).toContain('h-screen');
    expect(el.classList).toContain('flex');
    expect(Array.from(el.children).map((c) => c.tagName.toLowerCase())).toEqual([
      'app-toolbar',
      'app-editor',
    ]);
    expect(el.children[0].classList).toContain('flex-none');
    expect(el.children[1].classList).toContain('flex-1');
  });

  it('opens the welcome dialog, which cannot be dismissed by clicking outside, when starting for the first time', () => {
    TestBed.createComponent(AppComponent).detectChanges();
    expect(dialog.open).toHaveBeenCalledTimes(1);
    expect(dialog.open).toHaveBeenCalledWith(WelcomeDialogComponent, {
      disableClose: true,
    });
  });

  it('does not open the welcome dialog when the user turned it off', () => {
    TestBed.inject(SettingStore).set('showWelcomeDialogWhenStart', false);
    TestBed.createComponent(AppComponent).detectChanges();
    expect(dialog.open).not.toHaveBeenCalled();
  });

  it('opens the welcome dialog only once, however often it re-renders', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    fixture.detectChanges();
    expect(dialog.open).toHaveBeenCalledTimes(1);
  });
});
