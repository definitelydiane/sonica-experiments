import GlyphNameMeta from "./metadata/glyphnames.json" with { type: "json" };
import GlyphClass from "./metadata/classes.json" with { type: "json" };
import BravuraMeta from "./metadata/bravura_metadata.json" with {type: "json"};

import type { GlyphName } from "./types.ts";

interface IGlyph {
	readonly codepoint: number;
	readonly description: string;
	readonly alternateCodepoint?: number;

	readonly bBoxNE: [number, number];
	readonly bBoxSW: [number, number];

	readonly advanceWidth: number;

	readonly offsetY: number; // In staff height units
}

export class Glyph implements IGlyph {
	readonly codepoint: number;
	readonly description: string;
	readonly alternateCodepoint?: number;

	readonly bBoxNE: [number, number];
	readonly bBoxSW: [number, number];

	readonly advanceWidth: number = 0;
	readonly offsetY: number = 0;

	public get height(): number {
		return this.bBoxNE[1] - this.bBoxSW[1];
	}

	public get width(): number {
		return this.bBoxNE[0] - this.bBoxSW[0];
	}

	constructor(params: IGlyph) {
		this.codepoint = params.codepoint;
		this.description = params.description;
		this.alternateCodepoint = params.alternateCodepoint;
		this.bBoxNE = params.bBoxNE;
		this.bBoxSW = params.bBoxSW;
		this.advanceWidth = params.advanceWidth ?? 0;
		this.offsetY = params.offsetY;
	}

	public toString(): string {
		return String.fromCodePoint(this.codepoint);
	}
}


function parseCodepointToInt(s: string): number {
	return parseInt(s.replace(/^U\+/i, ""), 16);
}

export function getGlyph(name: GlyphName): Glyph {
	const nameMeta = GlyphNameMeta[name];

	// @ts-ignore: temporary ignore. Maybe not every glyph has a bbox?
	const boundingBox = BravuraMeta.glyphBBoxes[name];

	// @ts-ignore: Not every glyph may have an advance width
	const advanceWidth = BravuraMeta.glyphAdvanceWidths[name];

	var offsetY = 0;
	// handle offets for clefs...
	if(GlyphClass["clefsG"].includes(name)) {
		offsetY = 1
	} else if(GlyphClass["clefsF"].includes(name)) {
		offsetY = 3
	}

	return new Glyph({
		codepoint: parseCodepointToInt(nameMeta.codepoint),
		description: nameMeta.description,
		alternateCodepoint: "alternateCodepoint" in nameMeta ?
			parseCodepointToInt(nameMeta.alternateCodepoint) :
			undefined,
		advanceWidth,
		offsetY,
		...boundingBox,
	});
}


