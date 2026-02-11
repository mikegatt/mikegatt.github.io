// ──────────────────────────────────────────────
// CalcDoc – Office.js add-in with math.js units
// ──────────────────────────────────────────────
var updateSelection;

Office.onReady(function () {
  document.getElementById("btnUpdate").addEventListener("click", function () {
    updateSelection = false;
    runUpdate();
  });
  document.getElementById("btnUpdateSelection").addEventListener("click", function () {
    updateSelection = true;
    runUpdate();
  });

  // ─── Modal event listeners ───
  var modal = document.getElementById("myModal");
  var modalBtn = document.getElementById("modalBtn");
  var closeBtn = document.getElementsByClassName("close")[0];

  modalBtn.onclick = function () {
    modal.style.display = "block";
  };

  closeBtn.onclick = function () {
    modal.style.display = "none";
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
});

// ─── Core update routine ─────────────────────

async function runUpdate() {
  const btn = document.getElementById("btnUpdate");
  btn.disabled = true;
  setStatus("Scanning document …");

  try {
    await Excel_or_Word_update(); // Office.js word call
  } catch (e) {
    setStatus("Error: " + e.message, "err");
    console.error(e);
  } finally {
    btn.disabled = false;
  }
}

/**
 * Main Office.js routine – reads every paragraph, classifies it,
 * evaluates calculations with math.js (preserving units), then writes results back.
 */
async function Excel_or_Word_update() {
  // ── 1.  Read all paragraphs ──────────────────────────────────
  const paragraphs = await new Promise((resolve, reject) => {
    Word.run(async function (context) {
      let paras;
      if (updateSelection == true) {
        paras = context.document.getSelection().paragraphs;
      } else {
        paras = context.document.paragraphs;
      }
      paras.load("text");
      await context.sync();

      // Copy text out so we can work with it outside the context
      resolve(paras.items.map((p) => convertSuperscripts(p.text)));
    }).catch(reject);
  });
  // ── 2.  Parse & classify ─────────────────────────────────────
  //
  // DataFrame rows:  { type, name, equation, value, valueStr, paraIndex }
  //   type      = "DEFINED" | "CALCULATED"
  //   name      = variable name (string)
  //   equation  = source expression string
  //   value     = math.js Unit object or number (the actual computed value)
  //   valueStr  = formatted string for display
  //   paraIndex = index into the paragraphs array (so we can write back)

  const df = []; // the "dataframe"
  const scope = {}; // math.js scope: name → Unit or number
  const errors = []; // human-readable error messages

  for (let i = 0; i < paragraphs.length; i++) {
    // Check if there is an expression here, if not then continue
    if (!paragraphs[i].includes("=")) {
      continue;
    }

    // Yes, so regex to split to before first equals and after
    let calcLine, lineDefinition, lineResult;
    try {
      calcLine = paragraphs[i].match(/^([^=]+)=(.+)$/);
      lineDefinition = clean(calcLine[1]);
      lineResult = clean(calcLine[2]);
    } catch (err) {
      errors.push(
        `Line ${i + 1}: could not parse "${lineResult}" as an equation. Error: ${err.message}`
      );
      continue;
    }

    // See if the defintion includes words as well as a variable
    if (lineDefinition.includes(";")) {
      [lineName, lineVar] = lineDefinition.split(";");
    } else {
      lineName = null;
      lineVar = lineDefinition;
    }

    // See if the result includes an '=', if it doesnt then it is a definition
    if (!lineResult.includes("=")) {
      try {
        const unitValue = math.evaluate(lineResult);
        scope[lineVar] = unitValue;
        const formatted = formatValue(unitValue);
        df.push({
          type: "DEFINED",
          name: lineVar,
          equation: lineResult,
          value: unitValue,
          valueStr: formatted,
          paraIndex: i,
        });
        continue;
      } catch (err) {
        // Failed to parse as a unit – might be a plain number
        errors.push(
          `Line ${i + 1}: could not parse "${lineResult}" as a unit or number. Error: ${err.message}`
        );
        continue;
      }
    }

    // Otherwise it should be  expression
    const eqParts = lineResult.split("=");
    const expression = eqParts[0]; // everything before last =
    const answer = eqParts[1];

    //regex to split value from units
    const targetunits = answer.replace(/^[-+]?\d+\.?\d*\s*/, "");

    // ── Evaluate with math.js (units propagate automatically) ──
    try {
      let result;
      if (!targetunits == "") {
        result = math.evaluate(expression + " to " + targetunits, scope);
      } else {
        result = math.evaluate(expression, scope);
      }

      if (isErrorValue(result)) {
        errors.push(
          `Line ${i + 1} (${lineVar}): expression "${expression}" evaluated to an error.`
        );
        df.push({
          type: "CALCULATED",
          name: lineVar,
          equation: expression,
          value: null,
          valueStr: "ERROR",
          paraIndex: i,
        });
        continue;
      }

      // Store in scope so later calculations can use it
      scope[lineVar] = result;

      const formatted = formatValue(result);
      df.push({
        type: "CALCULATED",
        name: lineVar,
        equation: expression,
        value: result,
        valueStr: formatted,
        paraIndex: i,
      });
    } catch (err) {
      errors.push(`Line ${i + 1} (${lineVar}): expression "${expression}" failed. ${err.message}`);
      df.push({
        type: "CALCULATED",
        name: lineVar,
        equation: expression,
        value: null,
        valueStr: "ERROR: " + err.message,
        paraIndex: i,
      });
    }
  }

  // ── 3.  Write results back into the document ────────────────
  //   For each CALCULATED row that evaluated successfully we rebuild the
  //   paragraph text with the new result.

  await new Promise((resolve, reject) => {
    Word.run(async function (context) {
      let paras;
      if (updateSelection == true) {
        paras = context.document.getSelection().paragraphs;
      } else {
        paras = context.document.paragraphs;
      }

      paras.load("items");
      await context.sync();

      // Load all paragraph ranges at once
      const paraRanges = [];
      for (const row of df) {
        if (row.type !== "CALCULATED") continue;
        //if (isErrorValue(row.value)) continue;
        const para = paras.items[row.paraIndex];
        const paraRange = para.getRange();
        paraRange.load("text");
        paraRanges.push({ range: paraRange, row });
      }

      // Single sync to load all texts
      await context.sync();

      // Process all paragraphs and queue search operations
      const searchOps = [];
      for (const { range, row } of paraRanges) {
        const currentText = convertSuperscripts(range.text);
        const m2 = currentText.match(/^(.*)=([^=]*)$/);
        if (!m2) continue;
        const [, beforeLastEquals] = m2;
        const newResultText = row.valueStr;

        if (clean(currentText) !== clean(beforeLastEquals + newResultText)) {
          const searchResults = range.search("=", { matchCase: true });
          searchResults.load("items");
          searchOps.push({ searchResults, newResultText, range });
        }
      }

      // Single sync to execute all searches
      if (searchOps.length > 0) {
        await context.sync();

        // Queue all replacements
        for (const { searchResults, newResultText, range } of searchOps) {
          if (searchResults.items.length > 0) {
            const lastEquals = searchResults.items[searchResults.items.length - 1];
            const rangeAfterEquals = lastEquals.getRange("After").expandTo(range.getRange("End"));

            // Clear only the text content, preserving formatting structure
            rangeAfterEquals.clear();

            // Convert back to Unicode superscripts before inserting
            const textToInsert = convertToSuperscripts(newResultText);

            // Insert new text at the start, which inherits formatting from context
            rangeAfterEquals.insertText(textToInsert, "Start");
          }
        }

        // Single final sync to execute all replacements
        await context.sync();
      }

      resolve();
    }).catch(reject);
  });

  // ── 4.  Render the dataframe table ───────────────────────────
  renderTable(df);

  // ── 5.  Status ───────────────────────────────────────────────
  if (errors.length > 0) {
    setStatus("Done with " + errors.length + " warning(s):" + errors, "err");
    console.warn("Calcs for word warnings:", errors);
  } else if (df.length === 0) {
    setStatus("No definition or calculation lines found.");
  } else {
    setStatus("✓  Updated " + df.length + " variable(s) successfully.", "ok");
  }
}

// ─── Table renderer ──────────────────────────────────────────

function renderTable(df) {
  const tbody = document.getElementById("dfBody");
  tbody.innerHTML = "";

  if (df.length === 0) {
    tbody.innerHTML =
      '<tr class="empty-row"><td colspan="4">No variables found in this document.</td></tr>';
    return;
  }

  for (const row of df) {
    const tr = document.createElement("tr");

    const valClass = "col-val" + (row.valueStr === "ERROR" ? " nan" : "");

    tr.innerHTML =
      `<td class="col-type">${row.type === "DEFINED" ? "DEF" : "CALC"}</td>` +
      `<td class="col-name">${escapeHtml(row.name)}</td>` +
      `<td class="col-eq">${escapeHtml(row.equation)}</td>` +
      `<td class="${valClass}">${escapeHtml(row.valueStr)}</td>`;

    tbody.appendChild(tr);
  }
}

// ─── Utility ─────────────────────────────────────────────────

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Set the status bar text and optional class (ok | err | "") */
function setStatus(msg, cls) {
  const el = document.getElementById("status");
  el.textContent = msg;
  el.className = cls || "";
}
//remove whitespace from strings
function clean(str) {
  if (!str == "") {
    return str.replace(/\s/g, "");
  } else {
    return null;
  }
}
function convertSuperscripts(str) {
  if (!str) return str;
  return str.replace(/²/g, "^2").replace(/³/g, "^3").replace(/⁴/g, "^4");
}
/**
 * Format a math.js value (Unit or number) for display.
 * Returns a string like "0.18 m^2" or "42" (unitless).
 */
function formatValue(val) {
  if (val === null || val === undefined) return "NaN";

  // Check if it's a math.js Unit
  if (math.isUnit && math.isUnit(val)) {
    // Format the unit nicely
    return convertSuperscripts(val.format({ precision: 5 }));
  }

  // Check if it's a plain number
  if (typeof val === "number") {
    if (!isFinite(val)) return "NaN";
    return String(parseFloat(Number(val).toPrecision(5)));
  }

  // Fallback for other types
  return String(val);
}
function convertToSuperscripts(str) {
  if (!str) return str;
  return str.replace(/\^2/g, "²").replace(/\^3/g, "³").replace(/\^4/g, "⁴");
}
/**
 * Check if a value represents an error (NaN, null, undefined, or error object).
 */
function isErrorValue(val) {
  if (val === null || val === undefined) return true;
  if (typeof val === "number" && !isFinite(val)) return true;
  // math.js might return error objects in some cases
  if (val instanceof Error) return true;
  return false;
}

//add in some more engineering focused units
math.createUnit({
  Nm: {
    definition: "1 N*m",
    prefixes: "short",
  },
});
