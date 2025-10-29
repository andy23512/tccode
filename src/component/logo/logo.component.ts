import { Component } from '@angular/core';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  host: {
    class: 'block',
  },
})
export class LogoComponent {
  private r1 = 16;
  private r2 = this.r1 / 1.618;
  private thetaInRad = Math.asin(this.r2 / this.r1);
  private chordLine = {
    x1: this.r2,
    x2: this.r2,
    y1: -this.r1 * Math.cos(this.thetaInRad),
    y2: this.r1 * Math.cos(this.thetaInRad),
  };
  public cShapePath = `
	  M ${this.r2} 0
		L ${this.chordLine.x1} ${this.chordLine.y1}
		A ${this.r1} ${this.r1} 0 1 0 ${this.chordLine.x2} ${[this.chordLine.y2]}
		L ${this.r2} 0
		A ${this.r2} ${this.r2} 0 1 1 ${-this.r2} 0
		A ${this.r2} ${this.r2} 0 1 1 ${this.r2} 0
	`;
  public circularSegmentPath = `
		M ${this.chordLine.x1} ${this.chordLine.y1}
		A ${this.r1} ${this.r1} 0 0 1 ${this.chordLine.x2} ${[this.chordLine.y2]}
		Z
	`;
}
