//
// This script generates an array of keys from the glyphnames.json
// for typehinting.
//
import GlyphNameMeta from "../lib/smufl/metadata/glyphnames.json" with { type: "json" };

if (import.meta.main) {
	const lines = ["declare const glyphNames: readonly ["];
	for(const key in GlyphNameMeta) {
		lines.push(`\t"${key}",`);
	}
	lines.push("];");
	lines.push("");
	lines.push("export type GlyphName = typeof glyphNames[number];");

	await Deno.writeTextFile("lib/smufl/types.ts", lines.join("\n"));
}
