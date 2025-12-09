//
// This script generates a minimal metadata file from the smufl json provided
// We use this to limit how many properties we actually need.
//

import GlyphNameMeta from "../lib/smufl/metadata/glyphnames.json" with { type: "json" };
import GlyphClasses from "../lib/smufl/metadata/classes.json" with { type: "json" };
import BravuraMeta from "../lib/smufl/metadata/bravura_metadata.json" with { type: "json" };

if (import.meta.main) {
    // We can scan each file in each source directory for the `getGlyph()` method call
    // We can also search for unicode and hexcode strings for this
    const fnames = await getFilePaths();
		console.log("Scanning files:");
		fnames.forEach(v => console.log(v));

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


    await Deno.writeTextFile("public/fonts/metadata/glyphnames.json", JSON.stringify(glyphNamesOutput));
		console.log("Glyph names written to: public/fonts/metadata/glyphnames.json");

		const classes = extractClassMeta({glyphNames});
		await Deno.writeTextFile("public/fonts/metadata/classes.json", JSON.stringify(classes));
		console.log("Classes written to: public/fonts/metadata/classes.json");

		const fontMeta = extractFontMeta(glyphNames);
		await Deno.writeTextFile("public/fonts/metadata/bravura_metadata.json", JSON.stringify(fontMeta));
		console.log("Font meta written to: public/fonts/metadata/bravura_metadata.json");
}

async function getFilePaths({ignoreDirs, ignoreFiles}: {
	ignoreDirs: string[],
	ignoreFiles: string[]
} = { ignoreDirs: [".git"], ignoreFiles: [] }): string[] {
	const dirs = ["."];
	const ignoreDirSet = new Set(ignoreDirs);
	const results = [];
	const re = /\.(\/[A-Za-z\-0-9\.]+)+.(ts|js)(?!.+)/;
	while(dirs.length) {
		const dir = dirs.shift();
		for await (const record of Deno.readDir(dir)) {
			const dpath = `${dir}/${record.name}`;
			if(record.isDirectory) {
				// Remove the leading ./ from the path string
				if(!ignoreDirSet.has(dpath.slice(2))){
				 	dirs.push(dpath);
				}
			} else if(record.isFile && re.test(dpath)) {
				results.push(dpath);
			}
		}
	}
	return results;
}

function extractClassMeta({glyphNames, ignoreClasses }: {
	glyphNames: Set<string>,
	ignoreClasses?: Set<string>}
):  Object {
	const result = {};

	for(const key in GlyphClasses) {
		const glyphs = new Set(GlyphClasses[key]);
		const intersection = glyphNames.intersection(glyphs);
		if(intersection.size) {
			result[key] = Array.from(intersection.values());
		}
	}

	return result;
}

function extractFontMeta(glyphNames: Set<string>): Object {
	const result = {};

	// Handles all properties where the glyph is used as a key.
	// E.g. glyphAdvanceWidths, glyphsWithAlternates, glyphsWithAnchors, etc.
	const handleGlyphAsKey = (key: string) => {
		const obj = BravuraMeta[key];
		const keySet = new Set(Object.keys(obj));
		const intersection = glyphNames.intersection(keySet);
		if(!intersection.size) return;
		result[key] = {};
		for(const k of intersection.values()) {
			result[key][k] = obj[k];
		}
	}

	for(const key in BravuraMeta) {
		switch(key) {
			case "fontName":
			case "fontVersion":
			case "engravingDefaults":
				result[key] = BravuraMeta[key];
			case "glyphAdvanceWidths":
			case "glyphBBoxes":
			case "glyphsWithAlternates":
			case "glyphsWithAnchors":
			case "ligatures":
			case "optionalGlyphs":
				handleGlyphAsKey(key);
			// TODO: sets?
		}
	}

	return result;
}
