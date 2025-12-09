export class Score {

	// In px
	public readonly height = 256;
	public readonly width = 256;
	private _marginT = 10;
	private _marginL = 10;
	private _marginR = 10;

	// Passed to stroke-color in the SVG
	private _color = "black";

	public staffSpaceHeight = 4;

	private get _fontSize(): number {
		return this.staffSpacing * 4;
	}

	private get _staffHeight() {
		return this.staffSpacing * 4;
	}

	public renderSvg(): string {
		const renderer = new SVGRenderer(this);
		return renderer.render();
	}

}

class SVGRenderer {
	private lines: string[] = [`
			<svg
			id="score"
			width="${this.score.width}"
			height="${this.score.height}"
			xmlns="http://www.w3.org/2000/svg">`];

	private cursor: [number, number] = [0, 0];
	
	constructor(readonly score: Score) {}

	private _renderGlyph(args: {
		glyph: Glyph;
		drawBBox: boolean;
	}) {
		// TODO: copy bbox

		const text = `<text
			font-family="Bravura"
			fill="${this._color}"
			font-size="${this._fontSize}"
			x="${this.cursor[0]}"
			y="${this.cursor[1] - glyph.offsetY * this.staffSpaceHeight}"
		>${args.glyph.toString()}</text>`;
		
		this.cursor[0] += glyph.advanceWidth * this.staffSpaceHeight;
		return text;
	}

	private _renderStaff() {
	}

	public render(): string {
		this._renderStaff();
		this.lines.push('</svg>');
		return this.lines.join("");
	}
}
