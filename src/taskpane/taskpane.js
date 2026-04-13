// ──────────────────────────────────────────────
// Calcs for word – Office.js add-in with math.js units
// ──────────────────────────────────────────────

let df = []; // the "dataframe"
let scope = {}; // math.js scope: name → Unit or number
const characters = [
  "Α",
  "α",
  "Β",
  "β",
  "Γ",
  "γ",
  "Δ",
  "δ",
  "Ε",
  "ε",
  "Ζ",
  "ζ",
  "Η",
  "η",
  "Θ",
  "θ",
  "Ι",
  "ι",
  "Κ",
  "κ",
  "Λ",
  "λ",
  "Μ",
  "μ",
  "Ν",
  "ν",
  "Ξ",
  "ξ",
  "Ο",
  "ο",
  "Π",
  "π",
  "Ρ",
  "ρ",
  "Σ",
  "σ",
  "ς",
  "Τ",
  "τ",
  "Υ",
  "υ",
  "Φ",
  "φ",
  "Χ",
  "χ",
  "Ψ",
  "ψ",
  "Ω",
  "ω",
];
const powers = ["²", "³", "⁴", "⁶"];

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
    btn.addEventListener("click", () => insertCharacterToDocument(char, modal));
    document.getElementById("character-grid").appendChild(btn);
  });
  const powgrid = document.getElementById("power-grid");
  powgrid.innerHTML = ""; // Clear existing buttons first
  powers.forEach((pow) => {
    const powbtn = document.createElement("button");
    powbtn.textContent = pow;
    powbtn.classList.add("character-btn");
    powbtn.addEventListener("click", () => insertCharacterToDocument(pow, modal));
    document.getElementById("power-grid").appendChild(powbtn);
  });
  // ── Templates modal ──────────────────────────────────────────
  const templatesModal = document.getElementById("templatesModal");
  document.getElementById("templatesBtn").onclick = function () {
    templatesModal.style.display = "block";
    loadTemplatesList();
  };
  document.getElementById("templatesClose").onclick = function () {
    templatesModal.style.display = "none";
  };
  window.addEventListener("click", function (event) {
    if (event.target === templatesModal) {
      templatesModal.style.display = "none";
    }
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
 * Main Office.js routine – reads every paragraph, classifies it,
 * then immediately searches and replaces the result in the same iteration.
 */
async function Excel_or_Word_update(updateSelection) {
  const errors = [];

  await Word.run(async function (context) {
    // ── 1. Load all paragraph text ───────────────────────────────
    let paras;
    if (updateSelection == true) {
      paras = context.document.getSelection().paragraphs;
    } else {
      paras = context.document.body.paragraphs;
    }
    paras.load("text");
    await context.sync(); // ← SYNC 1: read paragraph text

    const rawTexts = paras.items.map((p) => convertSuperscripts(p.text));

    // ── 2. Parse, classify, and queue replacements ───────────
    const searchOps = [];

    for (let i = 0; i < rawTexts.length; i++) {
      if (!rawTexts[i].includes("=")) continue;

      // ── Discard lineName via ';' split first ─────────────────
      const rawLine = rawTexts[i].includes(";")
        ? clean(rawTexts[i].split(";")[1])
        : clean(rawTexts[i]);

      // ── If the second to last term has an operator, it is calculated ────────────────
      splitLine = rawLine.split("=");
      l = splitLine.length - 2;
      typeSwitch = /[/*\-+?]|min|max/.test(splitLine[l]) ? "CALCULATED" : "DEFINED";
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
            const result =
              targetunits !== ""
                ? math.evaluate(expression + " to " + targetunits, scope)
                : math.evaluate(expression, scope);

            if (isErrorValue(result)) {
              errors.push(
                `Line ${i + 1} (${lineVar}): expression "${expression}" evaluated to an error.`
              );
              newValueStr = "ERROR";
            } else {
              scope[lineVar] = result;
              calcResult = result;
              newValueStr = formatValue(result, existingDecimalPlaces);
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

          // Queue a search() for this line if the document text needs updating
          const m2 = rawLine.match(/^(.*)=([^=]*)$/);
          if (!m2) break;
          const [, beforeLastEquals] = m2;
          if (clean(rawLine) === clean(beforeLastEquals + "=" + newValueStr)) break;
          try {
            const paraRange = paras.items[i].getRange("Whole");
            const searchResults = paraRange.search("=", { matchCase: true });
            searchResults.load("items");
            searchOps.push({ searchResults, newResultText: newValueStr, paraRange });
          } catch (e) {
            errors.push(`Search error on line ${i + 1}: ${e.message}`);
          }
          break;
        }

        // ── Unexpected format ───────────────────────────────────
        default: {
          errors.push(`Line ${i + 1}: unexpected number of '=' signs (${parts.length - 1}).`);
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

    // Resolve all searches in one shot
    if (searchOps.length > 0) {
      await context.sync(); // ← SYNC 2: resolve all searches

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

  // ── 4. Render the dataframe table ────────────────────────────
  renderTable(df);

  // ── 5. Status ────────────────────────────────────────────────
  if (errors.length > 0) {
    setStatus("Done with " + errors.length + " warning(s)" + errors, "err");
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

      tr.innerHTML =
        `<td class="col-name">${escapeHtml(row.name)}</td>` +
        `<td class="col-eq">${escapeHtml(row.equation)}</td>` +
        `<td class="${valClass}">${escapeHtml(row.valueStr)}</td>`;

      tbody.appendChild(tr);
    }
  }
}
// ─── Insert character ─────────────────────────────────────────
async function insertCharacterToDocument(character, modal) {
  try {
    await Word.run(async (context) => {
      // Get the current selection (cursor position)
      const selection = context.document.getSelection();

      // Insert the character at the cursor, replacing any selected text
      selection.insertText(character, Word.InsertLocation.replace);

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
  return str.replace(/²/g, "^2").replace(/³/g, "^3").replace(/⁴/g, "^4").replace(/⁶/g, "^6");
}
function convertToSuperscripts(str) {
  if (!str) return str;
  return str.replace(/\^2/g, "²").replace(/\^3/g, "³").replace(/\^4/g, "⁴").replace(/\^6/g, "⁶");
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

const GITHUB_RAW_BASE =
  "https://raw.githubusercontent.com/mikegatt/mikegatt.github.io/main/assets/calcs/";

async function loadTemplatesList() {
  const statusEl = document.getElementById("templates-status");
  const listEl = document.getElementById("templates-list");
  listEl.innerHTML = "";
  statusEl.textContent = "Loading templates…";
  statusEl.style.color = "#64748b";

  try {
    const res = await fetch(GITHUB_RAW_BASE + "index.txt");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const text = await res.text();

    // Each non-blank, non-comment line is a filename
    const fileNames = text
      .split("\n")
      .map((l) => l.trim().replace(".md", ""))
      .filter((l) => l.length > 0 && !l.startsWith("#"));

    if (fileNames.length === 0) {
      statusEl.textContent = "No templates found.";
      return;
    }

    statusEl.textContent =
      fileNames.length + " template(s) available. Click to insert into document.";
    statusEl.style.color = "#16a34a";

    fileNames.forEach((fileName) => {
      const item = document.createElement("div");
      item.className = "template-item";

      const nameSpan = document.createElement("span");
      nameSpan.className = "template-item-name";
      nameSpan.textContent = fileName;

      const insertBtn = document.createElement("button");
      insertBtn.className = "template-item-insert";
      insertBtn.textContent = "Insert ↩";
      insertBtn.onclick = async function () {
        insertBtn.disabled = true;
        insertBtn.textContent = "Inserting…";
        try {
          await insertTemplateIntoDocument(
            fileName,
            GITHUB_RAW_BASE + encodeURIComponent(fileName)
          );
          insertBtn.textContent = "✓ Done";
          document.getElementById("templatesModal").style.display = "none";
        } catch (e) {
          insertBtn.textContent = "Error";
          console.error(e);
          statusEl.textContent = "Error inserting template: " + e.message;
          statusEl.style.color = "#dc2626";
        } finally {
          setTimeout(() => {
            insertBtn.disabled = false;
            insertBtn.textContent = "Insert ↩";
          }, 2000);
        }
      };

      item.appendChild(nameSpan);
      item.appendChild(insertBtn);
      listEl.appendChild(item);
    });
  } catch (e) {
    statusEl.textContent = "Failed to load templates: " + e.message;
    statusEl.style.color = "#dc2626";
    console.error(e);
  }
}

async function insertTemplateIntoDocument(fileName, downloadUrl) {
  const res = await fetch(downloadUrl);
  if (!res.ok) throw new Error("Could not fetch " + fileName + " (HTTP " + res.status + ")");
  const text = await res.text();

  await Word.run(async (context) => {
    const body = context.document.body;
    // Insert a page break then the template content at the end of the document
    body.insertBreak(Word.BreakType.page, Word.InsertLocation.end);
    body.insertText(text, Word.InsertLocation.end);
    await context.sync();
  });
}

math.createUnit({
  Nm: {
    definition: "1 N*m",
    prefixes: "short",
  },
});
