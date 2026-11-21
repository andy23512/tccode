import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { InformationDialogComponent } from './information-dialog.component';

describe('InformationDialogComponent', () => {
  let fixture: ComponentFixture<InformationDialogComponent>;
  const dialogRef = { close: jest.fn() };

  const root = () => fixture.nativeElement as HTMLElement;
  const links = () =>
    Array.from(root().querySelectorAll('a')) as HTMLAnchorElement[];
  const texts = (selector: string) =>
    Array.from(root().querySelectorAll(selector)).map((e) =>
      e.textContent?.replace(/\s+/g, ' ').trim(),
    );

  beforeEach(() => {
    dialogRef.close.mockReset();
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      providers: [{ provide: MatDialogRef, useValue: dialogRef }],
    });
    fixture = TestBed.createComponent(InformationDialogComponent);
    fixture.detectChanges();
  });

  it('links to the project, the notation docs, the language reference, CharaChorder and localStorage', () => {
    expect(links().map((a) => a.href)).toEqual([
      'https://github.com/andy23512/tccode',
      'https://docs.charachorder.com/Chords.html#chord-notation',
      'https://andy23512.github.io/blog/tanchord-code-library-tccl-language-reference/',
      'https://www.charachorder.com/',
      'https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage',
    ]);
  });

  it('opens every link in a new tab with rel="noopener"', () => {
    for (const a of links()) {
      expect([a.href, a.target, a.rel]).toEqual([a.href, '_blank', 'noopener']);
    }
  });

  it('has the sections in order', () => {
    expect(texts('h2')).toEqual([
      'Information',
      'TCCL Language',
      'Main Procedure',
      'Side Features',
      'Disclaimers',
    ]);
  });

  it('describes loading, editing and saving, each with its icon', () => {
    expect(texts('h3').slice(0, 3)).toEqual([
      'forms_add_on Loading Chords',
      'edit Editing Chords',
      'save Saving Chords',
    ]);
  });

  it('describes the side features with the icons of their toolbar buttons', () => {
    expect(texts('h3').slice(3)).toEqual([
      'lock Editor Lock',
      'settings Settings',
      'article Serial Log',
      'account_tree Abstract Syntax Tree',
    ]);
  });

  it('states that the site is unofficial and that data stays in localStorage', () => {
    expect(texts('ol li')).toHaveLength(2);
    expect(texts('ol li')[0]).toContain('not affiliated');
    expect(texts('ol li')[1]).toContain('not transmitted to any other place');
  });

  it('closes the dialog from the Close button', () => {
    const close = Array.from(root().querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Close',
    );
    close?.click();
    expect(dialogRef.close).toHaveBeenCalledTimes(1);
  });
});
