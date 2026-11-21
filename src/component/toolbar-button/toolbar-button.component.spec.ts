import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Icon } from '../../model/icon.model';
import { ToolbarButtonComponent } from './toolbar-button.component';

@Component({
  imports: [ToolbarButtonComponent, MatMenuModule],
  template: `
    <app-toolbar-button
      [tooltip]="tooltip"
      [icon]="icon"
      [disabled]="disabled"
      [menu]="withMenu ? menu : null"
      (buttonClick)="clicks = clicks + 1"
    ></app-toolbar-button>
    <mat-menu #menu="matMenu">
      <button mat-menu-item>First item</button>
      <button mat-menu-item>Second item</button>
    </mat-menu>
  `,
})
class HostComponent {
  public tooltip = 'Tip';
  public icon: Icon = 'save';
  public disabled = false;
  public withMenu = false;
  public clicks = 0;
}

describe('ToolbarButtonComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const button = () =>
    fixture.nativeElement.querySelector('button') as HTMLButtonElement;
  const menuItems = () =>
    Array.from(
      document.querySelectorAll('.mat-mdc-menu-panel button[mat-menu-item]'),
    ).map((e) => e.textContent?.trim());

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [NoopAnimationsModule] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shows the icon name as the icon text', () => {
    expect(button().querySelector('mat-icon')?.textContent?.trim()).toBe(
      'save',
    );
    host.icon = 'settings';
    fixture.detectChanges();
    expect(button().querySelector('mat-icon')?.textContent?.trim()).toBe(
      'settings',
    );
  });

  it('shows the tooltip text, placed to the right of the button', () => {
    const tooltip = fixture.debugElement
      .query(By.directive(MatTooltip))
      .injector.get(MatTooltip);
    expect(tooltip.message).toBe('Tip');
    expect(tooltip.position).toBe('right');
    host.tooltip = 'Other tip';
    fixture.detectChanges();
    expect(tooltip.message).toBe('Other tip');
  });

  it('emits buttonClick once for each click', () => {
    button().click();
    expect(host.clicks).toBe(1);
    button().click();
    expect(host.clicks).toBe(2);
  });

  it('uses the pointer cursor when enabled', () => {
    expect(button().disabled).toBe(false);
    expect(button().classList).toContain('!cursor-pointer');
    expect(button().classList).not.toContain('!cursor-not-allowed');
  });

  it('is disabled, shows the not-allowed cursor and emits nothing when disabled', () => {
    host.disabled = true;
    fixture.detectChanges();
    expect(button().disabled).toBe(true);
    expect(button().classList).toContain('!cursor-not-allowed');
    expect(button().classList).not.toContain('!cursor-pointer');
    button().click();
    expect(host.clicks).toBe(0);
  });

  it('has no menu trigger and opens no menu without a menu', () => {
    expect(fixture.nativeElement.querySelector('[aria-haspopup]')).toBeNull();
    button().click();
    fixture.detectChanges();
    expect(menuItems()).toEqual([]);
  });

  it('opens the menu on click when it has one, and still emits buttonClick', () => {
    host.withMenu = true;
    fixture.detectChanges();
    expect(menuItems()).toEqual([]);
    button().click();
    fixture.detectChanges();
    expect(menuItems()).toEqual(['First item', 'Second item']);
    expect(host.clicks).toBe(1);
  });

  it('does not open the menu when disabled', () => {
    host.withMenu = true;
    host.disabled = true;
    fixture.detectChanges();
    button().click();
    fixture.detectChanges();
    expect(menuItems()).toEqual([]);
  });
});
