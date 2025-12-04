//
// This script generates an array of keys from the glyphnames.json
// for typehinting.
//
import GlyphNameMeta from "../server/smufl-metadata/glyphnames.json" with { type: "json" };

if (import.meta.main) {
	const lines = ["const _glyphNames = ["];
	for(const key in GlyphNameMeta) {
		lines.push(`\t"${key}",`);
	}
	lines.push("] as const;");
	lines.push("");
	lines.push("export type GlyphName = typeof _glyphNames[number];");

	await Deno.writeTextFile("server/SMuFL.types.ts", lines.join("\n"));
}
