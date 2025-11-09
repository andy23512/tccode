import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';
import { ParserRuleContext, ParseTree, TerminalNode } from 'antlr4ng';
import { TcclLexer } from '../../antlr/TcclLexer';
import {
  ChordContext,
  ChordInputContext,
  ChordOutputContext,
  TcclParser,
} from '../../antlr/TcclParser';
import { parseTccl } from '../../language-service/tccl-parser';
import { IconGuardPipe } from '../../pipe/icon-guard.pipe';
import { EditorStore } from '../../store/editor.store';

@Component({
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatTreeModule,
    MatIconModule,
    IconGuardPipe,
  ],
  selector: 'app-abstract-syntax-tree-dialog',
  templateUrl: 'abstract-syntax-tree-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AbstractSyntaxTreeDialogComponent {
  private editorStore = inject(EditorStore);

  public ast = computed<[ParseTree]>(() => {
    const content = this.editorStore.content();
    return [parseTccl(content).ast];
  });

  public childrenAccessor = (node: ParseTree) => {
    const count = node.getChildCount();
    return Array.from({ length: count }).map(
      (_, i) => node.getChild(i) as ParseTree,
    );
  };
  public hasChild = (_: number, node: ParseTree) => node.getChildCount() > 0;

  public getNodeText(node: ParseTree) {
    const text = node.getText();
    if (node instanceof ParserRuleContext) {
      const ruleName = TcclParser.ruleNames[node.ruleIndex];
      if (
        node instanceof ChordContext ||
        node instanceof ChordInputContext ||
        node instanceof ChordOutputContext
      ) {
        return `${ruleName}: ${text}`;
      }
      return ruleName;
    }
    if (node instanceof TerminalNode) {
      const tokenName = TcclLexer.symbolicNames[node.symbol.type];
      return text.trim() ? `${tokenName}: ${text}` : tokenName;
    }
    return node.getText();
  }
}
