import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogoComponent } from './logo.component';

/** The numbers of an SVG path, in order of appearance. */
const numbers = (d: string) => (d.match(/-?\d+(\.\d+)?(e-?\d+)?/g) ?? []).map(Number);
/** The command letters of an SVG path, in order of appearance. */
const commands = (d: string) => d.match(/[A-Za-z]/g)?.join('');

describe('LogoComponent', () => {
  let fixture: ComponentFixture<LogoComponent>;

  const paths = () =>
    Array.from(
      fixture.nativeElement.querySelectorAll('path') as NodeListOf<SVGPathElement>,
    );

  // The logo is a circle of radius r1 whose chord sits at x = r2, with r2 = r1 / 1.618.
  const r1 = 16;
  const r2 = r1 / 1.618;
  const half = r1 * Math.cos(Math.asin(r2 / r1));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogoComponent);
    fixture.detectChanges();
  });

  it('is a block element', () => {
    expect(fixture.nativeElement.classList).toContain('block');
  });

  it('draws one svg, centred on the origin, with two paths', () => {
    const svg = fixture.nativeElement.querySelector('svg') as SVGElement;
    expect(svg.getAttribute('viewBox')).toBe('-18 -18 36 36');
    expect(paths()).toHaveLength(2);
  });

  it('colours the C shape with the primary colour and the segment with the secondary colour', () => {
    const [cShape, segment] = paths();
    expect(cShape.classList).toContain('fill-primary');
    expect(segment.classList).toContain('fill-secondary');
    for (const p of paths()) {
      expect(p.classList).toContain('stroke-white');
      expect(p.classList).toContain('stroke-2');
    }
  });

  it('draws the C shape: line to the chord, big arc, back, then the inner circle as two arcs', () => {
    const d = paths()[0].getAttribute('d') as string;
    expect(commands(d)).toBe('MLALAA');
    const n = numbers(d);
    expect(n).toHaveLength(2 + 2 + 7 + 2 + 7 + 7);
    const expected = [
      r2, 0,
      r2, -half,
      r1, r1, 0, 1, 0, r2, half,
      r2, 0,
      r2, r2, 0, 1, 1, -r2, 0,
      r2, r2, 0, 1, 1, r2, 0,
    ];
    expected.forEach((value, i) => expect(n[i]).toBeCloseTo(value, 9));
  });

  it('draws the segment: an arc along the chord that closes the path', () => {
    const d = paths()[1].getAttribute('d') as string;
    expect(commands(d)).toBe('MAZ');
    const n = numbers(d);
    const expected = [r2, -half, r1, r1, 0, 0, 1, r2, half];
    expect(n).toHaveLength(expected.length);
    expected.forEach((value, i) => expect(n[i]).toBeCloseTo(value, 9));
  });

  it('has a chord at about x = 9.889 and half-length about 12.578', () => {
    expect(r2).toBeCloseTo(9.8888, 3);
    expect(half).toBeCloseTo(12.5783, 3);
    const n = numbers(paths()[1].getAttribute('d') as string);
    expect(n[0]).toBeCloseTo(9.8888, 3);
    expect(n[1]).toBeCloseTo(-12.5783, 3);
  });
});
