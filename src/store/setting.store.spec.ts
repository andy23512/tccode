import { TestBed } from '@angular/core/testing';
import { KeyBindings } from '../model/setting.model';
import { SettingStore } from './setting.store';

describe('SettingStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const create = () => TestBed.inject(SettingStore);

  it('starts with the default settings', () => {
    const store = create();
    expect(store.showWelcomeDialogWhenStart()).toBe(true);
    expect(store.keyBindings()).toBe(KeyBindings.Classic);
    expect(store.detectConflictsWithBopomofoChords()).toBe(false);
    expect(store.autoConnectToDevice()).toBe(false);
    expect(store.editorLocked()).toBe(false);
  });

  it('set() changes only the given setting', () => {
    const store = create();
    store.set('keyBindings', KeyBindings.Vim);
    expect(store.keyBindings()).toBe(KeyBindings.Vim);
    expect(store.showWelcomeDialogWhenStart()).toBe(true);
    expect(store.editorLocked()).toBe(false);
  });

  it('set() works for boolean settings in both directions', () => {
    const store = create();
    store.set('editorLocked', true);
    expect(store.editorLocked()).toBe(true);
    store.set('editorLocked', false);
    expect(store.editorLocked()).toBe(false);
  });

  describe('storage sync', () => {
    it('restores saved settings on creation', () => {
      localStorage.setItem(
        'setting',
        JSON.stringify({ keyBindings: 'Emacs', autoConnectToDevice: true }),
      );
      const store = create();
      expect(store.keyBindings()).toBe(KeyBindings.Emacs);
      expect(store.autoConnectToDevice()).toBe(true);
    });

    it('fills settings missing from an older saved state with defaults', () => {
      localStorage.setItem('setting', JSON.stringify({ editorLocked: true }));
      const store = create();
      expect(store.editorLocked()).toBe(true);
      expect(store.showWelcomeDialogWhenStart()).toBe(true);
      expect(store.keyBindings()).toBe(KeyBindings.Classic);
    });

    it('persists changes to localStorage', () => {
      const store = create();
      store.set('detectConflictsWithBopomofoChords', true);
      TestBed.tick();
      expect(
        JSON.parse(localStorage.getItem('setting') as string),
      ).toMatchObject({ detectConflictsWithBopomofoChords: true });
    });
  });
});
