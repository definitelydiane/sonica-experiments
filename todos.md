## Notes

Each image needs to be at capable of displaying 3 ledger lines above and below the staff
This is usually considered the maximum number of viable ledger lines to read.

## Blue Sky

What if midi input devices supported?
What if audio input supported?

## What you were doing 12/3

You were writing a script to pare down the font metadata files to send to the client
You need to:

- Bundle the SVGGenerator class for the front-end
- Use the SVGGenerator to create an empty staff in the HTML before sending? Maybe just do client-side for now.
- Use the rendered SVG to add or remove nodes from itself...... Can this be a library?
- Multiple choice buttons to choose what note we're looking at
- Configuration parameters: range
- Figure out a way to represent pitch as numeric, then adjust the position of the notehead as needed
