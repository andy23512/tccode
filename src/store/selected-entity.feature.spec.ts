import { TestBed } from '@angular/core/testing';
import { patchState, signalStore } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';
import { withSelectedEntity } from './selected-entity.feature';

type Item = { id: number | string; name: string };

const ItemStore = signalStore(
  { providedIn: 'root' },
  withEntities<Item>(),
  withSelectedEntity<Item>(),
);

describe('withSelectedEntity', () => {
  const create = (items: Item[]) => {
    const store = TestBed.inject(ItemStore);
    patchState(store, setAllEntities(items));
    return store;
  };

  it('has no selection initially', () => {
    const store = create([{ id: 'a', name: 'A' }]);
    expect(store.selectedId()).toBeNull();
    expect(store.selectedEntity()).toBeNull();
  });

  it('returns the entity with the selected id', () => {
    const store = create([
      { id: 'a', name: 'A' },
      { id: 'b', name: 'B' },
    ]);
    store.setSelectedId('b');
    expect(store.selectedEntity()).toEqual({ id: 'b', name: 'B' });
  });

  it('follows changes of the selection', () => {
    const store = create([
      { id: 'a', name: 'A' },
      { id: 'b', name: 'B' },
    ]);
    store.setSelectedId('a');
    store.setSelectedId('b');
    expect(store.selectedEntity()?.name).toBe('B');
    store.setSelectedId(null);
    expect(store.selectedEntity()).toBeNull();
  });

  it('returns null (not undefined) for an unknown id', () => {
    const store = create([{ id: 'a', name: 'A' }]);
    store.setSelectedId('missing');
    expect(store.selectedEntity()).toBeNull();
  });

  it('treats a falsy but valid id (0) as a real selection', () => {
    const store = create([{ id: 0, name: 'zero' }]);
    store.setSelectedId(0);
    expect(store.selectedEntity()).toEqual({ id: 0, name: 'zero' });
  });

  it('reacts when the selected entity is added later', () => {
    const store = create([]);
    store.setSelectedId('late');
    expect(store.selectedEntity()).toBeNull();
    patchState(store, setAllEntities([{ id: 'late', name: 'L' }]));
    expect(store.selectedEntity()?.name).toBe('L');
  });
});
