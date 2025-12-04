import { getGlyph } from "./SMuFLMetadata.ts";

export class SVGGenerator {

	// In px units
	private _height = 256;
	private _width = 256;
	private _marginT = 10; // Staff margin top
	private _marginL = 10;
	private _marginR = 10;

	private _color = "black";

	// Score settings
	private readonly _fontSize = 16; // 1em == 16px
	private _scale = 4.0;

	private _minHeight = 0; // height of the tallest glyph
	private _minWidth = 0; // width of all glyphs combined

	private get _staffSpaceHeight(): number {
		return (this._fontSize / 4) * this._scale;
	}

	private get _staffHeight(): number {
		return this._staffSpaceHeight * 4;
	}

	private get _staffMarginT(): number {
		// return this._staffHeight + this._marginT;
		
		// Center the staff
		return this._staffHeight + (this._height - this._staffHeight)  / 2
	}

	public height(h: number): SVGGenerator {
		this._height = h;
		return this;
	}

	public width(w: number): SVGGenerator {
		this._width = w;
		return this;
	}

	public scale(s: number): SVGGEnerator {
		this._scale = s;
		return this;
	}

	// Outputs a string representing the SVG
	public generate(): string {
		const lines: string[] = [
			`<svg
			id="score"
			width="${this._width}"
			height="${this._height}"
			xmlns="http://www.w3.org/2000/svg">`.trim()
		];

		// 0.13 is found in the engravingDefaults.staffLineThickness
		lines.push(`<g
				id="staff"
				stroke="${this._color}"
				stroke-width="${this._scale * (4 * 0.13)}"
				>`.trim());
		for(let i = 0; i < 5; i++) { // 5 lines in staff
			const y = this._staffMarginT - i * this._staffSpaceHeight;
			lines.push(
				`<line
					x1="${this._marginL}"
					x2="${this._width - this._marginR}"
					y1="${y}"
					y2="${y}"/>`.trim());
		}
		lines.push(`</g>`);

		// Starting barline
		lines.push(`<line
					 x1="${this._marginL}"
					 x2="${this._marginL}"
					 y1="${this._staffMarginT - this._staffHeight - (this._scale * 4 * 0.13 / 2)}"
					 y2="${this._staffMarginT + (this._scale * 4 * 0.13 / 2)}"
					 stroke="${this._color}"
					 stroke-width="${this._scale * 4 * 0.16}"/>`.trim());
		

		const clef: Glyph = getGlyph("gClef");
		const qNote: Glyph = getGlyph("noteQuarterUp");
		const staffPaddingL: number = 0.2 * (this._fontSize * this._scale);
		// Align the clef to the last staff line
		lines.push(this._createGlyphNode(
			clef,
			this._marginL + staffPaddingL,
			this._staffMarginT,
			{drawBBox: false}));
		lines.push(this._createGlyphNode(
			qNote,
			// Effectively, we put the origin of this glyph after the advanceWidth
			// which describes the distance from the previous glyph's origin to the
			// next glyph
			this._marginL + (4 * this._scale * clef.advanceWidth + staffPaddingL) +
				(4 * this._scale * clef.advanceWidth),
			this._staffMarginT,
			{drawBBox: false}));

		// Ending barline
		lines.push(`<line
					 x1="${this._width - this._marginR}"
					 x2="${this._width - this._marginR}"
					 y1="${this._staffMarginT - this._staffHeight - (this._scale * 4 * 0.13 / 2)}"
					 y2="${this._staffMarginT + (this._scale * 4 * 0.13 / 2)}"
					 stroke="${this._color}"
					 stroke-width="${this._scale * 4 * 0.16}"/>`.trim());

		lines.push(`</svg>`);
		return lines.join('');
	}

	private _createGlyphNode(
		glyph: Glyph,
		x: number,
		y: number,
		opts?: Partial<{
			drawBBox: boolean
		}>
	): string {

		this._minHeight = Math.max(this._minHeight, glyph.height * this._staffSpaceHeight);
		this._minWidth += glyph.width * this._staffSpaceHeight;

		const bbox = `<rect
			x="${x}"
			y="${y - (glyph.offsetY + glyph.bBoxNE[1]) * this._staffSpaceHeight}"
			height="${glyph.height * this._staffSpaceHeight}"
			width="${glyph.width * this._staffSpaceHeight}"
			fill="blue"
			fill-opacity="0.2"
		/>`.trim();

		// 2.864 - advance space
		// 3 * (4 * this._scale) is the number of staff lines for spacing
		return `<text
			font-family="Bravura"
			fill="${this._color}"
			font-size="${this._fontSize * this._scale}"
			x="${x}"
			y="${y - (glyph.offsetY * this._staffSpaceHeight)}"
		>${glyph.toString()}</text>${opts?.drawBBox ? bbox : null}`.trim();
	}
}
