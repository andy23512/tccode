import { TestBed } from '@angular/core/testing';
import { EditorStore } from './editor.store';

describe('EditorStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const create = () => TestBed.inject(EditorStore);

  it('starts with empty content', () => {
    expect(create().content()).toBe('');
  });

  it('setContent replaces the content', () => {
    const store = create();
    store.setContent('a + b = x\n');
    store.setContent('c + d = y\n');
    expect(store.content()).toBe('c + d = y\n');
  });

  describe('appendContent', () => {
    it('sets the content when the editor is empty (no leading newline)', () => {
      const store = create();
      store.appendContent('a + b = x\n');
      expect(store.content()).toBe('a + b = x\n');
    });

    it('joins to existing content with a newline', () => {
      const store = create();
      store.setContent('a + b = x');
      store.appendContent('c + d = y');
      expect(store.content()).toBe('a + b = x\nc + d = y');
    });

    it('adds a blank line when the existing content already ends with a newline', () => {
      const store = create();
      store.setContent('a + b = x\n');
      store.appendContent('c + d = y\n');
      expect(store.content()).toBe('a + b = x\n\nc + d = y\n');
    });
  });

  describe('indent', () => {
    it('defaults to two spaces when nothing is indented', () => {
      const store = create();
      store.setContent('a + b = x\nc + d = y\n');
      expect(store.indent()).toBe('  ');
    });

    it('defaults to two spaces for empty content', () => {
      expect(create().indent()).toBe('  ');
    });

    it('detects four-space indentation', () => {
      const store = create();
      store.setContent('a + b = x\n    c + d = y\n');
      expect(store.indent()).toBe('    ');
    });

    it('detects tab indentation', () => {
      const store = create();
      store.setContent('a + b = x\n\tc + d = y\n');
      expect(store.indent()).toBe('\t');
    });

    it('updates when the content changes', () => {
      const store = create();
      store.setContent('a + b = x\n    c + d = y\n');
      expect(store.indent()).toBe('    ');
      store.setContent('a + b = x\n\tc + d = y\n');
      expect(store.indent()).toBe('\t');
    });
  });

  describe('storage sync', () => {
    it('restores saved content on creation', () => {
      localStorage.setItem('editor', JSON.stringify({ content: 'saved\n' }));
      expect(create().content()).toBe('saved\n');
    });

    it('falls back to the initial state for missing keys', () => {
      localStorage.setItem('editor', JSON.stringify({}));
      expect(create().content()).toBe('');
    });

    it('persists changes to localStorage', () => {
      const store = create();
      store.setContent('persist me\n');
      TestBed.tick();
      expect(JSON.parse(localStorage.getItem('editor') as string)).toEqual({
        content: 'persist me\n',
      });
    });
  });
});
