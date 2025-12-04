//
// This script generates a minimal metadata file from the smufl json provided
// We use this to limit how many properties we actually need.
//

import GlyphNameMeta from "../server/smufl-metadata/glyphnames.json" with { type: "json" };
import GlyphClass from "../server/smufl-metadata/classes.json" with { type: "json" };
import BravuraMeta from "../server/bravura_metadata.json" with { type: "json" };

if (import.meta.main) {
    // We can scan each file in each source directory for the `getGlyph()` method call
    // We can also search for unicode and hexcode strings for this
    const fnames= ["./server/SVGGenerator.ts"];

    const glyphNames = new Set();

    const re = /(?<=getGlyph\(")([A-Za-z]+)(?="\))/g;
    for(const fname of fnames) {
        const text = await Deno.readTextFile(fname); // Files shouldn't be ridiculously large...
        for(const match of text.matchAll(re)) {
            glyphNames.add(match[0]);
        }
    }

    const glyphNamesOutput = {};
    for(const gname of glyphNames) {
        //@ts-ignore
        glyphNamesOutput[gname] = GlyphNameMeta[gname];
    }

    await Deno.writeTextFile("ParedMetadataTest.json", JSON.stringify(glyphNamesOutput));
}