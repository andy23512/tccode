import { TestBed } from '@angular/core/testing';
import {
  TcclState,
  TcclTokensProviderService,
  tokensForLine,
} from './tccl-tokens-provider.service';

const scan = (line: string) =>
  tokensForLine(line).tokens.map((t) => [t.scopes, t.startIndex]);

describe('tokensForLine', () => {
  it('returns no tokens for an empty line', () => {
    expect(tokensForLine('').tokens).toEqual([]);
  });

  it('tokenizes a chord line into keys and separators with start indexes', () => {
    expect(scan('a + b = cd')).toEqual([
      ['chord_input_key.tccl', 0],
      ['input_key_separator.tccl', 1],
      ['chord_input_key.tccl', 4],
      ['input_output_separator.tccl', 5],
      ['chord_output_key.tccl', 8],
      ['chord_output_key.tccl', 9],
    ]);
  });

  it('treats <code> notation as a single token', () => {
    expect(scan('<559> + a = <559>b')).toEqual([
      ['chord_input_key.tccl', 0],
      ['input_key_separator.tccl', 5],
      ['chord_input_key.tccl', 8],
      ['input_output_separator.tccl', 9],
      ['chord_output_key.tccl', 12],
      ['chord_output_key.tccl', 17],
    ]);
  });

  it('tokenizes a space in the output as an output key', () => {
    const tokens = scan('a + b = x y');
    expect(tokens.slice(-3)).toEqual([
      ['chord_output_key.tccl', 8],
      ['chord_output_key.tccl', 9],
      ['chord_output_key.tccl', 10],
    ]);
  });

  it('marks unrecognized characters as error tokens, in position order', () => {
    const tokens = scan('a + b = @');
    const last = tokens[tokens.length - 1];
    expect(last[1]).toBe(8);
    expect(String(last[0])).toBe('error.tccl');
  });

  it('keeps tokens sorted by start index', () => {
    const indexes = tokensForLine('a + b = @').tokens.map((t) => t.startIndex);
    expect([...indexes].sort((a, b) => a - b)).toEqual(indexes);
  });

  it('is stateless between calls', () => {
    expect(scan('a + b = c')).toEqual(scan('a + b = c'));
  });
});

describe('TcclTokensProviderService', () => {
  let service: TcclTokensProviderService;

  beforeEach(() => {
    service = TestBed.inject(TcclTokensProviderService);
  });

  it('provides an initial state', () => {
    expect(service.getInitialState()).toBeInstanceOf(TcclState);
  });

  it('treats all states as equal and clones to a new state', () => {
    const state = new TcclState();
    expect(state.equals()).toBe(true);
    expect(state.clone()).toBeInstanceOf(TcclState);
    expect(state.clone()).not.toBe(state);
  });

  it('tokenize returns the line tokens and an end state', () => {
    const result = service.tokenize('a + b = c');
    expect(result.tokens).toHaveLength(5);
    expect(result.endState).toBeInstanceOf(TcclState);
  });
});
