import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ParseTree } from 'antlr4ng';
import { parseTccl } from '../../language-service/tccl-parser';
import { EditorStore } from '../../store/editor.store';
import { AbstractSyntaxTreeDialogComponent } from './abstract-syntax-tree-dialog.component';

describe('AbstractSyntaxTreeDialogComponent', () => {
  const dialogRef = { close: jest.fn() };
  let fixture: ComponentFixture<AbstractSyntaxTreeDialogComponent>;
  let component: AbstractSyntaxTreeDialogComponent;
  let editor: InstanceType<typeof EditorStore>;

  /** All nodes of a tree, depth first. */
  const walk = (node: ParseTree): ParseTree[] => [
    node,
    ...component.childrenAccessor(node).flatMap(walk),
  ];
  const textOf = (content: string) => {
    editor.setContent(content);
    const [root] = component.ast();
    return walk(root).map((n) => component.getNodeText(n));
  };

  beforeEach(() => {
    localStorage.clear();
    dialogRef.close.mockReset();
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      providers: [{ provide: MatDialogRef, useValue: dialogRef }],
    });
    editor = TestBed.inject(EditorStore);
    fixture = TestBed.createComponent(AbstractSyntaxTreeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('has the title Abstract Syntax Tree', () => {
    expect(
      fixture.nativeElement.querySelector('h2')?.textContent?.trim(),
    ).toBe('Abstract Syntax Tree');
  });

  it('holds one tree, which is the parse of the editor content', () => {
    editor.setContent('a + b = ab');
    expect(component.ast()).toHaveLength(1);
    expect(component.ast()[0].getText()).toBe(parseTccl('a + b = ab').ast.getText());
  });

  it('builds a new tree when the editor content changes', () => {
    editor.setContent('a + b = ab');
    const first = component.ast()[0];
    editor.setContent('c + d = cd');
    expect(component.ast()[0]).not.toBe(first);
    expect(component.ast()[0].getText()).toContain('c');
  });

  it('finds the children of a node, and none for a leaf', () => {
    editor.setContent('a + b = ab');
    const [root] = component.ast();
    const children = component.childrenAccessor(root);
    expect(children).toHaveLength(root.getChildCount());
    expect(children.length).toBeGreaterThan(0);
    const leaf = walk(root).find((n) => n.getChildCount() === 0) as ParseTree;
    expect(component.childrenAccessor(leaf)).toEqual([]);
  });

  it('tells nodes with children from leaves (hasChild)', () => {
    editor.setContent('a + b = ab');
    const [root] = component.ast();
    expect(component.hasChild(0, root)).toBe(true);
    const leaf = walk(root).find((n) => n.getChildCount() === 0) as ParseTree;
    expect(component.hasChild(0, leaf)).toBe(false);
  });

  it('says a node has children exactly when it has at least one, including a node with just one', () => {
    editor.setContent('a + b = ab');
    const nodes = walk(component.ast()[0]);
    const counts = new Set(nodes.map((n) => n.getChildCount()));
    expect(counts.has(0)).toBe(true);
    expect(counts.has(1)).toBe(true);
    for (const n of nodes) expect(component.hasChild(0, n)).toBe(n.getChildCount() > 0);
  });

  it('names a chord, its input and its output together with their text', () => {
    const names = textOf('a + b = ab');
    expect(names.some((n) => /^chord: /.test(n))).toBe(true);
    expect(names.some((n) => /^chordInput: /.test(n))).toBe(true);
    expect(names.some((n) => /^chordOutput: /.test(n))).toBe(true);
  });

  it('names other rules by rule name only, without text', () => {
    const names = textOf('a + b = ab');
    const ruleOnly = names.filter((n) => /^[a-zA-Z]+$/.test(n));
    expect(ruleOnly.length).toBeGreaterThan(0);
    expect(names.filter((n) => /^(chord|chordInput|chordOutput): /.test(n)).length).toBe(3);
  });

  it('names a token by its token name and text', () => {
    const names = textOf('a + b = ab');
    expect(names.some((n) => /^[A-Z_]+: .+/.test(n))).toBe(true);
  });

  it('shows only the token name for a token that is only whitespace', () => {
    const names = textOf('a + b = ab\n');
    const bare = names.filter((n) => /^[A-Z_]+$/.test(n));
    expect(bare.length).toBeGreaterThan(0);
    expect(names.every((n) => !/^[A-Z_]+: \s*$/.test(n))).toBe(true);
  });

  it('closes the dialog from the Close button', () => {
    const close = Array.from(
      fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((b) => b.textContent?.trim() === 'Close');
    close?.click();
    expect(dialogRef.close).toHaveBeenCalledTimes(1);
  });
});
