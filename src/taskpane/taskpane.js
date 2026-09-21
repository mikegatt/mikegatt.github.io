// ──────────────────────────────────────────────
// Calcs for word – Office.js add-in with math.js units
// ──────────────────────────────────────────────

let df = []; 
let scope = {}; // math.js scope: name → Unit or number
const characters = [
  "Α", "α", "Β", "β", "Γ", "γ", "Δ", "δ", "Ε", "ε", "Ζ", "ζ", "Η", "η", "Θ",
  "θ", "Ι", "ι", "Κ", "κ", "Λ", "λ", "Μ", "μ", "Ν", "ν", "Ξ", "ξ", "Ο", "ο",
  "Π", "π", "Ρ", "ρ", "Σ", "σ", "ς", "Τ", "τ", "Υ", "υ", "Φ", "φ", "Χ", "χ",
  "Ψ", "ψ", "Ω", "ω",
];

Office.onReady(function () {
  document.getElementById("btnUpdate").onclick = function () {
    runUpdate(false);
  };
  document.getElementById("btnUpdateSelection").onclick = function () {
    runUpdate(true);
  };
  document.getElementById("clearBtn").onclick = function () {
    df = [];
    scope = {};
    renderTable(df);
    setStatus("Variables cleared", "ok");
  };
  var modal = document.getElementById("myModal");
  document.getElementById("modalBtn").onclick = function () {
    modal.style.display = "block";
  };
  document.getElementsByClassName("close")[0].onclick = function () {
    modal.style.display = "none";
  };
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
  const grid = document.getElementById("character-grid");
  grid.innerHTML = ""; // Clear existing buttons first
  characters.forEach((char) => {
    const btn = document.createElement("button");
    btn.textContent = char;
    btn.classList.add("character-btn");
    btn.addEventListener("click", () => insertCharacterToDocument(char, modal, false));
    document.getElementById("character-grid").appendChild(btn);
  });
});

// ─── Core update routine ─────────────────────

async function runUpdate(updateSelection) {
  const btn = document.getElementById("btnUpdate");
  btn.disabled = true;
  setStatus("Scanning document …");

  try {
    await Excel_or_Word_update(updateSelection); // Office.js word call
  } catch (e) {
    setStatus("Error: " + e.message, "err");
    console.error(e);
  } finally {
    btn.disabled = false;
  }
}

/**
 * Main Office.js routine – reads every paragraph's HTML, classifies it,
 * then searches and replaces the result (as HTML) in the same iteration.
 *
 * Sync plan (3 round trips total):
 *   SYNC 1 — cheap paragraph text, just to find '=' lines
 *   SYNC 2 — resolve getHtml() AND search("=") together for every
 *            candidate paragraph, so both are ready before we parse
 *   SYNC 3 — execute all queued writes (clear/insertHtml)
 */
async function Excel_or_Word_update(updateSelection) {
  const errors = [];

  await Word.run(async function (context) {
    // ── 1. Load all paragraph plain text (cheap first pass) ─────
    let paras;
    if (updateSelection == true) {
      paras = context.document.getSelection().paragraphs;
    } else {
      paras = context.document.body.paragraphs;
    }
    paras.load("text");
    await context.sync(); // ← SYNC 1: cheap text pass, just to find '=' lines

    // ── 2. For lines that contain '=', request HTML *and* queue a
    //       search for the last '=' at the same time. We don't yet
    //       know which lines will need a text update, but search() is
    //       cheap, and queuing it now avoids a dedicated round trip
    //       later just to resolve search positions. ────────────────
    const htmlRequests = []; // { index, range, htmlResult, searchResults }
    for (let i = 0; i < paras.items.length; i++) {
      if (!paras.items[i].text.includes("=")) continue;
      const range = paras.items[i].getRange("Whole");
      const htmlResult = range.getHtml();
      const searchResults = range.search("=", { matchCase: true });
      searchResults.load("items");
      htmlRequests.push({ index: i, range, htmlResult, searchResults });
    }

    if (htmlRequests.length === 0) {
      renderTable(df);
      setStatus("No definition or calculation lines found.");
      return;
    }

    await context.sync(); // ← SYNC 2: resolve HTML + search together for candidate paragraphs

    // ── 3. Parse, classify, and queue replacements ───────────────
    // (search results are already resolved — no extra sync needed to use them)
    const writeOps = [];

    for (const { index: i, range, htmlResult, searchResults } of htmlRequests) {
      const fullExpr = htmlToMathExpr(htmlResult.value); // convert <sup> to ^(x) notation

      // ── Discard lineName via ';' split first ────────────────
      const rawLine = fullExpr.includes(";")
        ? clean(fullExpr.split(";")[1])
        : clean(fullExpr);

      // ── If the second to last term has an operator, it is calculated ──
      let splitLine = rawLine.split("=");
      let l = splitLine.length - 2;
      let typeSwitch = /[/*\-+?^]|min|max/.test(splitLine[l]) ? "CALCULATED" : "DEFINED";
      let row = null;

      switch (typeSwitch) {
        // ── DEFINED variable ─────────────────
        case "DEFINED": {
          const [lineVar, lineResult] = rawLine.split("=");
          try {
            const unitValue = math.evaluate(lineResult);
            scope[lineVar] = unitValue;
            row = {
              name: lineVar,
              equation: lineResult,
              value: unitValue,
              valueStr: formatValue(unitValue),
              paraIndex: i,
            };
          } catch (err) {
            errors.push(
              `Line ${i + 1}: could not parse "${lineResult}" as a unit or number. Error: ${err.message}`
            );
          }
          break;
        }

        // ── CALCULATED line ──────────────────
        case "CALCULATED": {
          let lineVar, expression, answer, targetunits, existingDecimalPlaces;
          targetunits = "";
          const parts = rawLine.split("=");
          parts.length == 3
            ? ([lineVar, expression, answer] = parts)
            : ([expression, answer] = parts);
          if (answer.slice(0, 5) !== "ERROR" && answer !== "") {
            answer = clean(answer);
            targetunits = answer.replace(/^[-+]?\d+\.?\d*\s*/, "");
            existingDecimalPlaces = countDecimalPlaces(answer);
          } else {
            answer = "";
          }

          let newValueStr;
          let calcResult = null;

          try {
            const evalResult =
              targetunits !== ""
                ? math.evaluate(expression + " to " + targetunits, scope)
                : math.evaluate(expression, scope);

            if (isErrorValue(evalResult)) {
              errors.push(
                `Line ${i + 1} (${lineVar}): expression "${expression}" evaluated to an error.`
              );
              newValueStr = "ERROR";
            } else {
              scope[lineVar] = evalResult;
              calcResult = evalResult;
              newValueStr = formatValue(evalResult, existingDecimalPlaces);
            }
          } catch (err) {
            errors.push(
              `Line ${i + 1} (${lineVar}): expression "${expression}" failed. ${err.message}`
            );
            newValueStr = "ERROR: " + err.message;
          }

          row = {
            name: lineVar,
            equation: expression,
            value: calcResult,
            valueStr: newValueStr,
            paraIndex: i,
          };

          // Queue a write for this line if the document text needs updating.
          // The search results are already resolved (queued back in step 2),
          // so we can go straight to computing the write — no extra sync.
          const m2 = rawLine.match(/^(.*)=([^=]*)$/);
          if (!m2) break;
          const [, beforeLastEquals] = m2;
          if (clean(rawLine) === clean(beforeLastEquals + "=" + newValueStr)) break;

          if (searchResults.items.length === 0) {
            errors.push(`Line ${i + 1}: could not locate '=' to update text.`);
            break;
          }
          writeOps.push({ searchResults, newResultText: newValueStr, paraRange: range });
          break;
        }

        // ── Unexpected format ───────────────────────────────────
        default: {
          errors.push(`Line ${i + 1}: unexpected number of '=' signs (${rawLine.split("=").length - 1}).`);
          break;
        }
      }

      // ── Store / update the dataframe row ─────────────────────
      if (row) {
        const existing = df.findIndex((e) => e.name === row.name);
        if (existing !== -1) df[existing] = row;
        else df.push(row);
      }
    }

    // ── 4. Execute all writes in one shot ─────────────────────────
    if (writeOps.length > 0) {
      for (const { searchResults, newResultText, paraRange } of writeOps) {
        const lastEquals = searchResults.items[searchResults.items.length - 1];
        const rangeAfterEquals = lastEquals.getRange("After").expandTo(paraRange.getRange("End"));
        // insertHtml(..., "Replace") does the clear + insert in one queued op
        rangeAfterEquals.insertHtml(mathStringToHtml(newResultText), "Replace");
      }

      await context.sync(); // ← SYNC 3: write all results
    }
  });

  // ── 5. Render the dataframe table ────────────────────────────
  renderTable(df);

  // ── 6. Status ────────────────────────────────────────────────
  if (errors.length > 0) {
    setStatus("Done with " + errors.length + " warning(s) 😢", "err");
    console.warn("Calcs for word warnings:", errors);
    const el = document.getElementById("bad-flash-overlay");
    el.classList.remove("flash-active");
    void el.offsetWidth; // force reflow
    el.classList.add("flash-active");
  } else if (df.length === 0) {
    setStatus("No definition or calculation lines found.");
  } else {
    setStatus("✓  Updated " + df.length + " variable(s) successfully.", "ok");
    const el = document.getElementById("ok-flash-overlay");
    el.classList.remove("flash-active");
    void el.offsetWidth; // force reflow
    el.classList.add("flash-active");
  }
}

// ─── Table renderer ──────────────────────────────────────────

function renderTable(df) {
  const tbody = document.getElementById("dfBody");
  tbody.innerHTML = "";

  if (df.length === 0) {
    tbody.innerHTML =
      '<tr class="empty-row"><td colspan="3">No variables found in this document.</td></tr>';
    return;
  }

  for (const row of df) {
    if (row.name !== undefined) {
      const tr = document.createElement("tr");

      const valClass = "col-val" + (row.valueStr === "ERROR" ? " nan" : "");

      // Render equation/value through the HTML converter so exponents show
      // as real superscripts in the sidebar too, not escaped caret text.
      tr.innerHTML =
        `<td class="col-name">${escapeHtml(row.name)}</td>` +
        `<td class="col-eq">${mathStringToHtml(row.equation)}</td>` +
        `<td class="${valClass}">${mathStringToHtml(row.valueStr)}</td>`;

      tbody.appendChild(tr);
    }
  }
}

// ─── Insert character ─────────────────────────────────────────
// isPower: when true, insert as a real HTML <sup> instead of a literal glyph.
async function insertCharacterToDocument(character, modal, isPower) {
  try {
    await Word.run(async (context) => {
      // Get the current selection (cursor position)
      const selection = context.document.getSelection();

      if (isPower) {
        // Real superscript formatting via HTML, not a Unicode look-alike.
        selection.insertHtml("<sup>" + escapeHtml(character) + "</sup>", Word.InsertLocation.replace);
      } else {
        selection.insertText(character, Word.InsertLocation.replace);
      }

      await context.sync();
    });
  } catch (error) {
    console.error("Error inserting character:", error);
  }
  modal.style.display = "none";
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

// remove whitespace from strings
function clean(str) {
  if (!str == "") {
    return str.replace(/\s/g, "");
  } else {
    return null;
  }
}

/**
 * Walk a Word paragraph's HTML (from range.getHtml()) and turn it into a
 * math.js-evaluable string:
 *   <sup>2</sup>  → ^(2)
 *   everything else's text content is kept, tags are dropped.
 *   Legacy support for Unicode superscripts is also included (²³⁴⁶ → ^2, ^3, ^4, ^6).
 */
function htmlToMathExpr(html) {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return walkNodeForMath(doc.body).trim();
}

function walkNodeForMath(node) {
  let out = "";
  for (const child of node.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      out += child.textContent;
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const tag = child.tagName.toLowerCase();
      if (tag === "sup") {
        out += "^(" + walkNodeForMath(child).trim() + ")";
      } else if (tag === "br") {
        out += " ";
      } else {
        out += walkNodeForMath(child);
      }
    }
  }
  out = out.replace(/²/g, "^2").replace(/³/g, "^3").replace(/⁴/g, "^4").replace(/⁶/g, "^6");
  return out;
}

/**
 * Turn a math.js-formatted string (caret-notation exponents, e.g. "m^2" or
 * "m^(-2)") into HTML with real <sup> tags, for insertHtml() / table display.
 */
function mathStringToHtml(str) {
  if (str === null || str === undefined) return "";
  let escaped = escapeHtml(String(str));
  escaped = escaped.replace(/\^\(([^)]+)\)/g, "<sup>$1</sup>");
  escaped = escaped.replace(/\^(-?\d+(?:\.\d+)?)/g, "<sup>$1</sup>");
  escaped = escaped.replace(/\^2/g, "²").replace(/\^3/g, "³").replace(/\^4/g, "⁴").replace(/\^6/g, "⁶")
  return escaped;
}

/**
 * Count the number of decimal places in the numeric part of an answer string.
 * e.g. "3.14 m^2" → 2,  "42 kN" → 0,  "0.1800" → 4,  "42" → 0
 * Returns null if no numeric part is found (caller will use default formatting).
 */
function countDecimalPlaces(answerStr) {
  if (!answerStr) return null;
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
 * Returns a plain caret-notation string like "0.18 m^2" or "42" (unitless).
 */
function formatValue(val, decimalPlaces) {
  if (val === null || val === undefined) return "NaN";

  const useFixed = typeof decimalPlaces === "number" && decimalPlaces >= 0;

  // Check if it's a math.js Unit
  if (math.isUnit && math.isUnit(val)) {
    const numericPart = val.toNumber(); // magnitude in current unit
    const unitStr = val
      .format({ precision: 15 }) // e.g. "3.14159265 m^2"
      .replace(/^[-+]?\d+\.?\d*\s*/, "") // strip the number, keep unit
      .trim();

    let numStr;
    if (useFixed) {
      numStr = numericPart.toFixed(decimalPlaces);
    } else {
      numStr = String(parseFloat(numericPart.toPrecision(5)));
    }

    return unitStr ? numStr + " " + unitStr : numStr;
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

/**
 * Check if a value represents an error (NaN, null, undefined, or error object).
 */
function isErrorValue(val) {
  if (val === null || val === undefined) return true;
  if (typeof val === "number" && !isFinite(val)) return true;
  if (val instanceof Error) return true;
  return false;
}

math.createUnit({
  Nm: {
    definition: "1 N*m",
    prefixes: "short",
  },
});