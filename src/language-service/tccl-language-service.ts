import { TcclError } from './tccl-error-listener';
import { parseAndGetSyntaxErrors } from './tccl-parser';

export class TcclLanguageService {
  public validate(code: string): TcclError[] {
    const syntaxErrors: TcclError[] = parseAndGetSyntaxErrors(code);
    // Later we will append semantic errors
    return syntaxErrors;
  }
}
