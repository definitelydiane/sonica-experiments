import { Glyph, getGlyph } from "./SMuFLMetadata.ts";

import { assertEquals } from "@std/assert";

Deno.test(
	"Retrieves metadata from glyphnames.json",
	() => {
		const glyph = getGlyph("gClef");
		assertEquals(glyph.codepoint, 0xE050);
		assertEquals(glyph.description, "G clef");
		assertEquals(glyph.alternateCodepoint, 0x1D11E);

		const glyphNoAlt = getGlyph("gClef15ma");
		assertEquals(glyphNoAlt.codepoint, 0xE054);
		assertEquals(glyphNoAlt.description, "G clef quindicesima alta");
		assertEquals(glyphNoAlt.alternateCodepoint, undefined);
	}
);

Deno.test(
	"Retrieves bounding box metadata from bravura_metadata.json",
	() => {
		const glyph = getGlyph("gClef");
		assertEquals(glyph.bBoxNE, [2.684, 4.392]);
		assertEquals(glyph.bBoxSW, [0.0, -2.632]);
	}
);
