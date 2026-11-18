import { KeyboardLayout } from 'tangent-cc-lib';
import { Chord, ChordTreeNode } from '../model/chord.model';
import {
  convertChordInNumberListFormToChord,
  convertChordsToChordTreeNodes,
  convertChordTreeNodesToTcclFile,
  convertChordTreeNodeToTcclInputAndOutput,
  convertChordTreeNodeToTcclStringForm,
  convertInputAndParentHashToActions,
  convertTcclFileToChordTreeNodes,
  getInputFromChordAction,
  getParentHashFromChordAction,
} from './chord.util';
import { hashChord } from './raw-chord.util';

// Action codes: KeyA = 97 / Shift+KeyA = 65, KeyB = 98, KeyC = 99,
// KeyD = 100, Space (output) = 544.
const layout = {
  id: 'test',
  name: 'Test',
  reference: '',
  layout: {
    KeyA: {
      unmodified: { type: 'text', value: 'a' },
      withShift: { type: 'text', value: 'A' },
    },
    KeyB: { unmodified: { type: 'text', value: 'b' } },
    KeyC: { unmodified: { type: 'text', value: 'c' } },
    KeyD: { unmodified: { type: 'text', value: 'd' } },
  },
} as unknown as KeyboardLayout;

const pad = (n: number, ...codes: number[]) => [
  ...Array(n - codes.length).fill(0),
  ...codes,
];

function node(
  partial: Pick<ChordTreeNode, 'input' | 'output'> &
    Partial<ChordTreeNode>,
): ChordTreeNode {
  return {
    id: 0,
    parentId: null,
    actions: [],
    level: 0,
    children: [],
    ...partial,
  };
}

describe('getParentHashFromChordAction', () => {
  it('returns null when the 4th action is non-zero', () => {
    expect(getParentHashFromChordAction([1, 2, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0]))
      .toBeNull();
  });

  it('returns null when the first three actions are all zero', () => {
    expect(
      getParentHashFromChordAction([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 97, 98]),
    ).toBeNull();
  });

  it('packs the first three actions as 10-bit groups', () => {
    const actions = [1, 2, 3, 0, 0, 0, 0, 0, 0, 0, 97, 98];
    expect(getParentHashFromChordAction(actions)).toBe(1 | (2 << 10) | (3 << 20));
  });
});

describe('getInputFromChordAction', () => {
  it('drops the 3 parent slots when the 4th action is zero', () => {
    const actions = [1, 2, 3, 0, 0, 0, 0, 0, 0, 0, 97, 98];
    expect(getInputFromChordAction(actions)).toEqual(actions.slice(3));
  });

  it('keeps all 12 actions when the 4th action is non-zero', () => {
    const actions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    expect(getInputFromChordAction(actions)).toEqual(actions);
  });
});

describe('convertInputAndParentHashToActions', () => {
  it('left-pads to 12 actions when there is no parent', () => {
    expect(convertInputAndParentHashToActions([97, 98], null)).toEqual(
      pad(12, 97, 98),
    );
  });

  it('treats a parent hash of 0 as no parent', () => {
    expect(convertInputAndParentHashToActions([97, 98], 0)).toEqual(
      pad(12, 97, 98),
    );
  });

  it('puts the parent hash in the first 3 slots and pads the input to 9', () => {
    const parent = 1 | (2 << 10) | (3 << 20);
    const actions = convertInputAndParentHashToActions([97, 98], parent);
    expect(actions).toEqual([1, 2, 3, ...pad(9, 97, 98)]);
  });

  it('round-trips with getParentHashFromChordAction / getInputFromChordAction', () => {
    const parent = hashChord(pad(12, 97, 98));
    const actions = convertInputAndParentHashToActions([99, 100], parent);
    expect(actions).toHaveLength(12);
    expect(getParentHashFromChordAction(actions)).toBe(parent);
    expect(getInputFromChordAction(actions)).toEqual(pad(9, 99, 100));
  });
});

describe('convertChordInNumberListFormToChord', () => {
  it('derives id, parentId and input from the action list', () => {
    const parent = hashChord(pad(12, 97, 98));
    const actions = convertInputAndParentHashToActions([99, 100], parent);
    const chord = convertChordInNumberListFormToChord([actions, [97, 98]]);
    expect(chord).toEqual({
      id: hashChord(actions),
      parentId: parent,
      input: pad(9, 99, 100),
      actions,
      output: [97, 98],
    });
  });

  it('gives a top-level chord a null parentId', () => {
    const actions = pad(12, 97, 98);
    expect(
      convertChordInNumberListFormToChord([actions, [97]]).parentId,
    ).toBeNull();
  });
});

describe('convertChordsToChordTreeNodes', () => {
  const chord = (id: number, parentId: number | null): Chord => ({
    id,
    parentId,
    input: [],
    actions: [],
    output: [],
  });

  it('builds a tree with levels', () => {
    const tree = convertChordsToChordTreeNodes([
      chord(1, null),
      chord(2, 1),
      chord(3, 2),
      chord(4, null),
    ]);
    expect(tree.map((n) => [n.id, n.level])).toEqual([
      [1, 0],
      [4, 0],
    ]);
    expect(tree[0].children.map((n) => [n.id, n.level])).toEqual([[2, 1]]);
    expect(tree[0].children[0].children.map((n) => [n.id, n.level])).toEqual([
      [3, 2],
    ]);
    expect(tree[1].children).toEqual([]);
  });

  it('drops chords whose parent is not in the list', () => {
    const tree = convertChordsToChordTreeNodes([chord(1, null), chord(2, 999)]);
    expect(tree.map((n) => n.id)).toEqual([1]);
  });

  it('returns an empty array for no chords', () => {
    expect(convertChordsToChordTreeNodes([])).toEqual([]);
  });
});

describe('convertChordTreeNodeToTcclInputAndOutput', () => {
  it('writes input keys joined by " + " and the output as text', () => {
    expect(
      convertChordTreeNodeToTcclInputAndOutput(
        node({ input: pad(9, 97, 98), output: [97, 98] }),
        layout,
      ),
    ).toEqual({ input: 'a + b', output: 'ab' });
  });

  it('orders input keys by their first position in the output', () => {
    expect(
      convertChordTreeNodeToTcclInputAndOutput(
        node({ input: pad(9, 97, 98, 100), output: [98, 100, 97] }),
        layout,
      ).input,
    ).toBe('b + d + a');
  });

  it('matches input keys to the output case-insensitively', () => {
    expect(
      convertChordTreeNodeToTcclInputAndOutput(
        node({ input: pad(9, 98, 65), output: [97, 98] }),
        layout,
      ).input,
    ).toBe('A + b');
  });

  // Current behavior, which probably differs from the intent: keys absent from
  // the output all get indexInOutput = Infinity, and
  // Math.sign(Infinity - Infinity) is NaN, so the comparator never reaches its
  // localeCompare tie-break and these keys keep their original relative order
  // instead of being sorted alphabetically.
  it('keeps keys that are absent from the output in their original order, after the rest', () => {
    expect(
      convertChordTreeNodeToTcclInputAndOutput(
        node({ input: pad(9, 100, 99, 97, 98), output: [98] }),
        layout,
      ).input,
    ).toBe('b + d + c + a');
  });

  it('renders spaces in the output and ignores zero padding in the input', () => {
    expect(
      convertChordTreeNodeToTcclInputAndOutput(
        node({ input: pad(9, 97, 98), output: [97, 544, 98] }),
        layout,
      ),
    ).toEqual({ input: 'a + b', output: 'a b' });
  });

  it('uses <code> notation for actions without a layout character', () => {
    expect(
      convertChordTreeNodeToTcclInputAndOutput(
        node({ input: pad(9, 97, 559), output: [559, 97] }),
        layout,
      ),
    ).toEqual({ input: '<559> + a', output: '<559>a' });
  });
});

describe('convertChordTreeNodeToTcclStringForm', () => {
  const n = node({ input: pad(9, 97, 98), output: [97, 98] });

  it('shows "input = output" by default', () => {
    expect(convertChordTreeNodeToTcclStringForm(n, layout)).toBe('a + b = ab');
  });

  it('can show only the input or only the output', () => {
    expect(convertChordTreeNodeToTcclStringForm(n, layout, 'input')).toBe(
      'a + b',
    );
    expect(convertChordTreeNodeToTcclStringForm(n, layout, 'output')).toBe(
      'ab',
    );
  });
});

describe('convertChordTreeNodesToTcclFile', () => {
  it('writes one line per node, indenting children, with a trailing newline', () => {
    const tree = [
      node({
        input: pad(9, 97, 98),
        output: [97, 98],
        children: [
          node({ input: pad(9, 99, 100), output: [99, 100], level: 1 }),
        ],
      }),
      node({ input: pad(9, 98, 99), output: [98, 99] }),
    ];
    expect(convertChordTreeNodesToTcclFile(tree, layout, '  ')).toBe(
      'a + b = ab\n  c + d = cd\nb + c = bc\n',
    );
  });

  it('writes just a newline for an empty tree', () => {
    expect(convertChordTreeNodesToTcclFile([], layout, '  ')).toBe('\n');
  });
});

describe('convertTcclFileToChordTreeNodes', () => {
  it('parses a flat list of chords', () => {
    const tree = convertTcclFileToChordTreeNodes(
      'a + b = ab\nc + d = c d\n',
      layout,
    );
    expect(tree).toHaveLength(2);
    expect(tree[0]).toMatchObject({
      level: 0,
      parentId: null,
      input: pad(9, 97, 98),
      output: [97, 98],
      actions: pad(12, 97, 98),
      id: hashChord(pad(12, 97, 98)),
      children: [],
    });
    expect(tree[1].output).toEqual([99, 544, 100]);
  });

  it('sorts the input keys by action code', () => {
    const [chord] = convertTcclFileToChordTreeNodes('b + a = ab\n', layout);
    expect(chord.input).toEqual(pad(9, 97, 98));
  });

  it('links indented chords to their parent hash', () => {
    const [parent] = convertTcclFileToChordTreeNodes(
      'a + b = ab\n  c + d = cd\n',
      layout,
    );
    expect(parent.children).toHaveLength(1);
    const [child] = parent.children;
    expect(child.level).toBe(1);
    expect(child.parentId).toBe(parent.id);
    expect(child.actions).toEqual(
      convertInputAndParentHashToActions(pad(9, 99, 100), parent.id),
    );
    expect(child.id).toBe(hashChord(child.actions));
  });

  it('accepts <code> notation', () => {
    const [chord] = convertTcclFileToChordTreeNodes(
      '<559> + a = <559>a\n',
      layout,
    );
    expect(chord.input).toEqual(pad(9, 97, 559));
    expect(chord.output).toEqual([559, 97]);
  });

  it('returns an empty list for an empty file', () => {
    expect(convertTcclFileToChordTreeNodes('', layout)).toEqual([]);
  });

  it('throws for keys that are not on the layout', () => {
    expect(() => convertTcclFileToChordTreeNodes('a + z = az\n', layout)).toThrow(
      'Cannot find corresponding action code for key: z',
    );
  });

  it('round-trips with convertChordTreeNodesToTcclFile', () => {
    const text = 'a + b = ab\n  c + d = c d\nb + c = bc\n';
    const tree = convertTcclFileToChordTreeNodes(text, layout);
    expect(convertChordTreeNodesToTcclFile(tree, layout, '  ')).toBe(text);
  });
});
