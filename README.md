# Calcs for word

## Basic behaviour and syntax

The app only operates on a line where an '=' is present. There are two ways it handles a line with this depending on whether the line defines a variable or does a calculation:

Definition: (Optional text description can be here); variable = number (with units if appropriate)

Calculation: (Optional text description can be here); result = expression = (an automatically calculated answer)

The final value in a calculation line in the bit noted (an automatically calculated answer) above is written back by the app.

Results can be recalculated without removing values.

Variables are held in the memory panel between updates so if only a portion of text is updated using 'Update Selected Text' then this will use any variables stored in the memory panel on the right hand side.

## Precision

If nothing is typed after the final = sign, a default precision will be put in which is probably going to be too specific. To change this, you can suggest a precision. For example, writing x = 5.1233m + 4.11111m = 0.0m will evaluate to 9.2m.

## Calculation Engine

The app uses the math.js package to evaluate expressions. A full set of supported functions is available here: https://mathjs.org/docs/expressions/syntax.html

## Unit handling

The app uses the math.js package for unit handling. A full set of supported units is available here: https://mathjs.org/docs/datatypes/units.html

Units can be specified for definition lines which are read by the app. If the calculated answer is going to contain units, the answer will be written in a suggested set of units based on the calculation. If more control over the units is required, these can be specified by writing in the desired units after the last '=' sign which the answer will be converted into .

Most SI and engineering units are supported as well as some imperial units.

## Greek and powers

The app understands plain unicode characters without formatting so anything formatted with subscript or superscript will just be read as normal text as if it isnt subscript/superscript. Therefore, to use power signs, either inline notation can be used (e.g. x\^2 = ) or unicode squares, cubes and quads can be pasted in from the cheat sheet.

Greek unicode characters are also available on the cheat sheet button and can be pasted in.

Note that double clicking a character will select just that character and keyboard shortcuts can be used for copy/paste.

## Errors

Any errors will be highlighted in the text and the app sidebar. These might relate to syntax or unit/calculation issues.
