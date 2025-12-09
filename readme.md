A music education tool to practice reading music. Currently built using Deno.

## Getting started

First, [install Deno](https://docs.deno.com/runtime/getting_started/installation/)

### Running the project:

```
deno run dev
```

Running tests:
```
deno test
```

**Additional scripts**
- `deno run generate-types` will generate a `types.ts` file for the SMuFL
	metadata for type checking
- `deno run pare-smufl-meta` will tree-shake the SMuFL metadata to serve to the
	client
- `deno run update-tailwind` running this manually will re-generate the CSS
	served to the client.
