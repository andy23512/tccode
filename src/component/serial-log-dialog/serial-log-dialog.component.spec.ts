import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SerialLogItemType } from '../../model/serial-log.model';
import { SerialLogStore } from '../../store/serial-log.store';
import { SerialLogDialogComponent } from './serial-log-dialog.component';

describe('SerialLogDialogComponent', () => {
  let fixture: ComponentFixture<SerialLogDialogComponent>;
  let store: InstanceType<typeof SerialLogStore>;
  const dialogRef = { close: jest.fn() };

  const rows = () =>
    Array.from(fixture.nativeElement.querySelectorAll('li') as NodeListOf<HTMLLIElement>).map(
      (li) => ({
        icon: li.querySelector('mat-icon')?.textContent?.trim(),
        iconClasses: Array.from(li.querySelector('mat-icon')?.classList ?? []),
        data: li.querySelector('span')?.textContent,
      }),
    );

  beforeEach(() => {
    dialogRef.close.mockReset();
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      providers: [{ provide: MatDialogRef, useValue: dialogRef }],
    });
    store = TestBed.inject(SerialLogStore);
    fixture = TestBed.createComponent(SerialLogDialogComponent);
    fixture.detectChanges();
  });

  it('has the title Serial Log', () => {
    expect(
      fixture.nativeElement.querySelector('h2')?.textContent?.trim(),
    ).toBe('Serial Log');
  });

  it('shows no rows when nothing was sent or received', () => {
    expect(rows()).toEqual([]);
  });

  it('shows a green up arrow for what was sent, with the data as it is', () => {
    store.push(SerialLogItemType.Send, 'VERSION');
    fixture.detectChanges();
    const [row] = rows();
    expect(row.icon).toBe('arrow_drop_up');
    expect(row.iconClasses).toContain('text-green-500');
    expect(row.iconClasses).not.toContain('text-red-500');
    expect(row.data).toBe('VERSION');
  });

  it('shows a red down arrow for what was received', () => {
    store.push(SerialLogItemType.Receive, 'VERSION CHARACHORDER ONE');
    fixture.detectChanges();
    const [row] = rows();
    expect(row.icon).toBe('arrow_drop_down');
    expect(row.iconClasses).toContain('text-red-500');
    expect(row.iconClasses).not.toContain('text-green-500');
    expect(row.data).toBe('VERSION CHARACHORDER ONE');
  });

  it('lists rows in the order they were logged, and adds new ones at the end', () => {
    store.push(SerialLogItemType.Send, 'ID');
    store.push(SerialLogItemType.Receive, 'ID CHARACHORDER');
    store.push(SerialLogItemType.Send, 'ID');
    fixture.detectChanges();
    expect(rows().map((r) => [r.icon, r.data])).toEqual([
      ['arrow_drop_up', 'ID'],
      ['arrow_drop_down', 'ID CHARACHORDER'],
      ['arrow_drop_up', 'ID'],
    ]);
    store.push(SerialLogItemType.Receive, 'done');
    fixture.detectChanges();
    expect(rows()).toHaveLength(4);
    expect(rows()[3].data).toBe('done');
  });

  it('closes the dialog from the Close button', () => {
    const close = Array.from(
      fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((b) => b.textContent?.trim() === 'Close');
    close?.click();
    expect(dialogRef.close).toHaveBeenCalledTimes(1);
  });
});
