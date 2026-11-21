import { TCCL_LANGUAGE_ID, TCCL_THEME_DATA, TCCL_THEME_NAME } from './tccl-config';

describe('TCCL config', () => {
  it('names the language and the theme', () => {
    expect(TCCL_LANGUAGE_ID).toBe('tccl');
    expect(TCCL_THEME_NAME).toBe('tccl-theme');
  });

  it('is a dark theme that inherits the base rules, with three colours for the chord parts', () => {
    expect(TCCL_THEME_DATA.base).toBe('vs-dark');
    expect(TCCL_THEME_DATA.inherit).toBe(true);
    expect(TCCL_THEME_DATA.colors).toEqual({});
    expect(TCCL_THEME_DATA.rules).toEqual([
      { token: 'input_key_separator.tccl', foreground: '#999999' },
      { token: 'chord_input_key.tccl', foreground: '#39C5BB' },
      { token: 'chord_output_key.tccl', foreground: '#FC4769' },
    ]);
  });
});
