# Calcs for word

## Basic behaviour and syntax

The app only operates on a line where an '=' is present. There are two ways it handles a line with this depending on whether the line defines a variable or does a calculation:

Definition: (Optional text description can be here); variable = number (with units if appropriate)

Calculation: (Optional text description can be here); (optional result variable) = expression = (an automatically calculated answer)

The final value in a calculation line in the bit noted (an automatically calculated answer) above is written back by the app.

Results can be recalculated without removing values.

Variables are held in the memory panel between updates so if only a portion of text is updated using 'Update Selected Text' then this will use any variables stored in the memory panel on the right hand side.

## Precision

If nothing is typed after the final = sign, a default precision will be put in which is probably going to be too specific. To change this, you can suggest a precision. For example, writing x = 5.1233m + 4.11111m = 0.0m will evaluate to 9.2m.

## Calculation Engine

The app uses the math.js package to evaluate expressions. A full set of supported functions is available here: https://mathjs.org/docs/expressions/syntax.html

Conditional statements are in the format of shorthand javascript ternary statements. For example, writing x = 5 > 3 ? 10 : 20 will evaluate to 10.

## Unit handling

The app uses the math.js package for unit handling. A full set of supported units is available here: https://mathjs.org/docs/datatypes/units.html

Units can be specified for definition lines which are read by the app. If the calculated answer is going to contain units, the answer will be written in a suggested set of units based on the calculation. If more control over the units is required, these can be specified by writing in the desired units after the last '=' sign which the answer will be converted into. For example, 1kN + 2kN = N will evaluate to 3000N.

Most SI and engineering units are supported as well as some imperial units.

## Greek and powers

The app understands powers written as unicode powers, formatted as superscript or written out inline. Subscripts are always just treated in the background as if they aren't formatted subscript. Note that variables containing commas, brackets and 'min' or 'max' will throw a hissy for this reason as they will be treated like an equation!

Greek unicode characters are available on the cheat sheet button and can be clicked on to insert them. Alternatively, the emoji keyboard can be used (ctrl+cmd+space)

## Errors

Any errors will be highlighted in the text and the app sidebar. These might relate to syntax or unit/calculation issues.
