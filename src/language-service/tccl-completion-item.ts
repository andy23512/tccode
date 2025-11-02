import type { languages } from 'monaco-editor';

export interface TcclCompletionItem {
  value: string;
  optionType: languages.CompletionItemKind;
}
