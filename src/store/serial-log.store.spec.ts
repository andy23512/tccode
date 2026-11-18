import { TestBed } from '@angular/core/testing';
import { SerialLogItemType } from '../model/serial-log.model';
import { SerialLogStore } from './serial-log.store';

describe('SerialLogStore', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  const create = () => TestBed.inject(SerialLogStore);

  it('starts empty', () => {
    expect(create().items()).toEqual([]);
  });

  it('push appends items with type, data and a timestamp', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-02T03:04:05Z'));
    const store = create();
    store.push(SerialLogItemType.Send, 'VERSION');
    expect(store.items()).toEqual([
      {
        type: SerialLogItemType.Send,
        time: new Date('2026-01-02T03:04:05Z'),
        data: 'VERSION',
      },
    ]);
  });

  it('keeps items in the order they were pushed', () => {
    const store = create();
    store.push(SerialLogItemType.Send, 'one');
    store.push(SerialLogItemType.Receive, 'two');
    store.push(SerialLogItemType.Send, 'three');
    expect(store.items().map((i) => [i.type, i.data])).toEqual([
      [SerialLogItemType.Send, 'one'],
      [SerialLogItemType.Receive, 'two'],
      [SerialLogItemType.Send, 'three'],
    ]);
  });

  it('push produces a new array instead of mutating the previous one', () => {
    const store = create();
    store.push(SerialLogItemType.Send, 'one');
    const before = store.items();
    store.push(SerialLogItemType.Send, 'two');
    expect(before).toHaveLength(1);
    expect(store.items()).toHaveLength(2);
  });

  it('clear removes all items', () => {
    const store = create();
    store.push(SerialLogItemType.Send, 'one');
    store.clear();
    expect(store.items()).toEqual([]);
  });

  it('can be used again after clear', () => {
    const store = create();
    store.push(SerialLogItemType.Send, 'one');
    store.clear();
    store.push(SerialLogItemType.Receive, 'two');
    expect(store.items().map((i) => i.data)).toEqual(['two']);
  });
});
