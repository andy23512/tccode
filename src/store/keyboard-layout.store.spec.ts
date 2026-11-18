import { TestBed } from '@angular/core/testing';
import { KeyboardLayout } from 'tangent-cc-lib';
import { US_KEYBOARD_LAYOUT } from '../data/keyboard-layouts.const';
import { KeyboardLayoutStore } from './keyboard-layout.store';

describe('KeyboardLayoutStore', () => {
  const create = () => TestBed.inject(KeyboardLayoutStore);

  it('relies on the US layout being available in tangent-cc-lib', () => {
    expect(US_KEYBOARD_LAYOUT).toBeDefined();
    expect(US_KEYBOARD_LAYOUT.id).toBe('us');
  });

  it('loads the US layout on init', () => {
    const store = create();
    expect(store.ids()).toEqual(['us']);
    expect(store.entityMap()['us']).toBe(US_KEYBOARD_LAYOUT);
  });

  it('selects the US layout on init', () => {
    const store = create();
    expect(store.selectedId()).toBe('us');
    expect(store.selectedEntity()).toBe(US_KEYBOARD_LAYOUT);
  });

  it('builds the character -> key code map from the selected layout', () => {
    const map = create().characterKeyCodeMap();
    expect(map.get('a')).toEqual({
      keyCode: 'KeyA',
      shiftKey: false,
      altGraphKey: false,
    });
    expect(map.get('A')).toEqual({
      keyCode: 'KeyA',
      shiftKey: true,
      altGraphKey: false,
    });
  });

  it('load() resets the entities and the selection', () => {
    const store = create();
    store.setSelectedId(null);
    store.load();
    expect(store.selectedId()).toBe('us');
    expect(store.ids()).toEqual(['us']);
  });

  describe('selection (withSelectedEntity)', () => {
    it('has no selected entity when the selection is cleared', () => {
      const store = create();
      store.setSelectedId(null);
      expect(store.selectedId()).toBeNull();
      expect(store.selectedEntity()).toBeNull();
    });

    it('gives an empty character map when nothing is selected', () => {
      const store = create();
      store.setSelectedId(null);
      expect(store.characterKeyCodeMap().size).toBe(0);
    });

    it('has no selected entity (null) for an unknown id', () => {
      const store = create();
      store.setSelectedId('does-not-exist');
      expect(store.selectedEntity()).toBeNull();
      expect(store.characterKeyCodeMap().size).toBe(0);
    });

    it('has no selected entity for an id that was never loaded', () => {
      const store = create();
      const other = { ...US_KEYBOARD_LAYOUT, id: 'other' } as KeyboardLayout;
      // Entities are only added through load().
      store.setSelectedId(other.id);
      expect(store.selectedEntity()).toBeNull();
    });
  });
});
