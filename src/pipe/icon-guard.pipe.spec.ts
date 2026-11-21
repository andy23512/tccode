import { IconGuardPipe } from './icon-guard.pipe';

describe('IconGuardPipe', () => {
  const pipe = new IconGuardPipe();

  it('returns the icon name it is given, unchanged', () => {
    expect(pipe.transform('save')).toBe('save');
    expect(pipe.transform('lock_open_right')).toBe('lock_open_right');
  });
});
