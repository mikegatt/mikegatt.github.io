// ──────────────────────────────────────────────
// CalcDoc – Office.js add-in with math.js units
// ──────────────────────────────────────────────
var updateSelection;
let df = []; // the "dataframe"
let scope = {}; // math.js scope: name → Unit or number

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
 *
 * Sync budget (reduced from original 4 syncs across 2 Word.run calls):
 *   Single Word.run with 3 context.sync() calls:
 *     Sync 1 – load all paragraph text                       (read phase)
 *     Sync 2 – resolve all batched search() results          (search phase)
 *     Sync 3 – flush all insertText mutations                (write phase)
 *
 * The two Word.run contexts from the original have been merged into one,
 * eliminating an entire round-trip and the intermediate para.load("text")
 * sync that was previously needed to re-read paragraphs in the second context.
 */
async function Excel_or_Word_update() {
  const errors = [];

  await Word.run(async function (context) {

    // ── 1. Load all paragraph text ───────────────────────────────
    let paras;
    if (updateSelection == true) {
      paras = context.document.getSelection().paragraphs;
    } else {
      paras = context.document.paragraphs;
    }
    paras.load("text");
    await context.sync(); // ← SYNC 1

    const rawTexts = paras.items.map((p) => convertSuperscripts(p.text));

    // ── 2. Parse & classify (pure JS, zero Office calls) ─────────
    for (let i = 0; i < rawTexts.length; i++) {
      if (!rawTexts[i].includes("=")) continue;

      let calcLine, lineDefinition, lineResult;
      try {
        calcLine = rawTexts[i].match(/^([^=]+)=(.+)$/);
        lineDefinition = clean(calcLine[1]);
        lineResult = clean(calcLine[2]);
      } catch (err) {
        errors.push(`Line ${i + 1}: could not parse as an equation. Error: ${err.message}`);
        continue;
      }

      let lineName, lineVar;
      if (lineDefinition.includes(";")) {
        [lineName, lineVar] = lineDefinition.split(";");
      } else {
        lineName = null;
        lineVar = lineDefinition;
      }

      // No second '=' → DEFINED variable
      if (!lineResult.includes("=")) {
        try {
          const unitValue = math.evaluate(lineResult);
          scope[lineVar] = unitValue;
          const formatted = formatValue(unitValue);
          const existing = df.findIndex((e) => e.name === lineVar);
          const row = { type: "DEFINED", name: lineVar, equation: lineResult, value: unitValue, valueStr: formatted, paraIndex: i };
          if (existing !== -1) df[existing] = row; else df.push(row);
        } catch (err) {
          errors.push(`Line ${i + 1}: could not parse "${lineResult}" as a unit or number. Error: ${err.message}`);
        }
        continue;
      }

      // Has a second '=' → CALCULATED line
      const eqParts  = lineResult.split("=");
      const expression = eqParts[0];
      const answer     = eqParts[1];
      const targetunits = answer.replace(/^[-+]?\d+\.?\d*\s*/, "");
      const existingDecimalPlaces = countDecimalPlaces(answer);

      try {
        let result;
        if (targetunits !== "") {
          result = math.evaluate(expression + " to " + targetunits, scope);
        } else {
          result = math.evaluate(expression, scope);
        }

        if (isErrorValue(result)) {
          errors.push(`Line ${i + 1} (${lineVar}): expression "${expression}" evaluated to an error.`);
          df.push({ type: "CALCULATED", name: lineVar, equation: expression, value: null, valueStr: "ERROR", paraIndex: i });
          continue;
        }

        scope[lineVar] = result;
        const formatted = formatValue(result, existingDecimalPlaces);
        const existing  = df.findIndex((e) => e.name === lineVar);
        const row = { type: "CALCULATED", name: lineVar, equation: lineResult, value: result, valueStr: formatted, paraIndex: i };
        if (existing !== -1) df[existing] = row; else df.push({ ...row, equation: expression });
      } catch (err) {
        errors.push(`Line ${i + 1} (${lineVar}): expression "${expression}" failed. ${err.message}`);
        df.push({ type: "CALCULATED", name: lineVar, equation: expression, value: null, valueStr: "ERROR: " + err.message, paraIndex: i });
      }
    }

    // ── 3. Queue search() for every paragraph that needs updating ─
    // All search() calls are issued here — before any sync — so they
    // are batched into a single round-trip by context.sync().
    const searchOps = [];
    for (const row of df) {
      if (row.type !== "CALCULATED") continue;

      const rawText = rawTexts[row.paraIndex];
      const m2 = rawText.match(/^(.*)=([^=]*)$/);
      if (!m2) continue;
      const [, beforeLastEquals] = m2;

      // Skip if the value hasn't changed
      if (clean(rawText) === clean(beforeLastEquals + "=" + row.valueStr)) continue;

      try {
        const paraRange = paras.items[row.paraIndex].getRange("Whole");
        const searchResults = paraRange.search("=", { matchCase: true });
        searchResults.load("items");
        searchOps.push({ searchResults, newResultText: row.valueStr, paraRange });
      } catch (e) {
        errors.push(`Search error on line ${row.paraIndex + 1}: ${e.message}`);
      }
    }

    // Resolve all searches in one shot
    if (searchOps.length > 0) {
      await context.sync(); // ← SYNC 2

      // ── 4. Queue all replacements (no more syncs until the final one) ──
      for (const { searchResults, newResultText, paraRange } of searchOps) {
        if (searchResults.items.length === 0) continue;
        const lastEquals = searchResults.items[searchResults.items.length - 1];
        const rangeAfterEquals = lastEquals.getRange("After").expandTo(paraRange.getRange("End"));
        rangeAfterEquals.clear();
        rangeAfterEquals.insertText(convertToSuperscripts(newResultText), "Start");
      }

      await context.sync(); // ← SYNC 3: write all results
    }
  });

  // ── 5. Render the dataframe table ────────────────────────────
  renderTable(df);

  // ── 6. Status ────────────────────────────────────────────────
  if (errors.length > 0) {
    setStatus("Done with " + errors.length + " warning(s): " + errors.join("; "), "err");
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
 * Count the number of decimal places in the numeric part of an answer string.
 * e.g. "3.14 m^2" → 2,  "42 kN" → 0,  "0.1800" → 4,  "42" → 0
 * Returns null if no numeric part is found (caller will use default formatting).
 */
function countDecimalPlaces(answerStr) {
  if (!answerStr) return null;
  // Match an optional sign, digits, optional decimal point + decimals
  const m = answerStr.trim().match(/^[-+]?\d+(\.\d*)?/);
  if (!m) return null;
  if (!m[1]) return 0; // integer – no decimal point present
  return m[1].length - 1; // subtract the leading "."
}

/**
 * Format a math.js value (Unit or number) for display.
 * If decimalPlaces is provided (>= 0) the numeric part is rounded and
 * zero-padded to exactly that many decimal places, matching what was
 * already in the document.
 * Returns a string like "0.18 m^2" or "42" (unitless).
 */
function formatValue(val, decimalPlaces) {
  if (val === null || val === undefined) return "NaN";

  const useFixed = typeof decimalPlaces === "number" && decimalPlaces >= 0;

  // Check if it's a math.js Unit
  if (math.isUnit && math.isUnit(val)) {
    // Get the numeric magnitude and unit string separately
    const numericPart = val.toNumber();           // magnitude in current unit
    const unitStr = val.format({ precision: 15 }) // e.g. "3.14159265 m^2"
      .replace(/^[-+]?\d+\.?\d*\s*/, "")         // strip the number, keep unit
      .trim();

    let numStr;
    if (useFixed) {
      numStr = numericPart.toFixed(decimalPlaces);
    } else {
      numStr = String(parseFloat(numericPart.toPrecision(5)));
    }

    const result = unitStr ? numStr + " " + unitStr : numStr;
    return convertSuperscripts(result);
  }

  // Check if it's a plain number
  if (typeof val === "number") {
    if (!isFinite(val)) return "NaN";
    if (useFixed) {
      return val.toFixed(decimalPlaces);
    }
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