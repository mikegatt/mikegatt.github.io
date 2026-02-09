  // ──────────────────────────────────────────────
  // CalcDoc – Office.js add-in with math.js units
  // ──────────────────────────────────────────────

  Office.onReady(function () {
    document.getElementById("btnUpdate").addEventListener("click", runUpdate);
  });

  // ─── Helpers ─────────────────────────────────

  /** Strip surrounding whitespace */
  const trim = s => (s || "").trim();

  /** Set the status bar text and optional class (ok | err | "") */
  function setStatus(msg, cls) {
    const el = document.getElementById("status");
    el.textContent = msg;
    el.className = cls || "";
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
      return val.format({ precision: 10 });
    }
    
    // Check if it's a plain number
    if (typeof val === 'number') {
      if (!isFinite(val)) return "NaN";
      return String(parseFloat(Number(val).toPrecision(10)));
    }
    
    // Fallback for other types
    return String(val);
  }

  /**
   * Check if a value represents an error (NaN, null, undefined, or error object).
   */
  function isErrorValue(val) {
    if (val === null || val === undefined) return true;
    if (typeof val === 'number' && !isFinite(val)) return true;
    // math.js might return error objects in some cases
    if (val instanceof Error) return true;
    return false;
  }

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
        const paras = context.document.paragraphs;
        paras.load("text");
        await context.sync();

        // Copy text out so we can work with it outside the context
        resolve(paras.items.map(p => p.text));
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

    const df       = [];         // the "dataframe"
    const scope    = {};         // math.js scope: name → Unit or number
    const errors   = [];         // human-readable error messages

    // Regex explanation:
    //   ^(.+?)\s*\:\s*         ← description  :
    //   (\w+)\s*=\s*           ← variable     =
    //   (.+?)                  ← RHS  (unit expression OR calculation = result)
    //   $
    const LINE_RE = /^(.+?)\s*\:\s*(\w+)\s*=\s*(.+)$/;

    for (let i = 0; i < paragraphs.length; i++) {
      const raw = trim(paragraphs[i]);
      if (!raw) continue;                          // skip blank lines

      const m = raw.match(LINE_RE);
      if (!m) continue;                            // plain text – ignore

      const [, , varName, rhs] = m;

      // ── Try to parse RHS as a unit expression (DEFINITION) ──
      // math.js can parse things like "0.3 m", "2400 kg/m^3", "50 kN"
      // If it succeeds and there's no "=" sign, it's a definition.
      
      if (!rhs.includes("=")) {
        // No equals sign → should be a definition (unit expression)
        try {
          const unitValue = math.evaluate(trim(rhs));
          scope[varName] = unitValue;
          
          const formatted = formatValue(unitValue);
          df.push({ 
            type: "DEFINED", 
            name: varName, 
            equation: trim(rhs), 
            value: unitValue,
            valueStr: formatted,
            paraIndex: i 
          });
          continue;
        } catch (err) {
          // Failed to parse as a unit – might be a plain number
          errors.push(`Line ${i + 1}: could not parse "${rhs}" as a unit or number. Error: ${err.message}`);
          continue;
        }
      }

      // ── Otherwise it should be  expression = <r>  → CALCULATION ──
      // Split on the LAST "=" to separate expression from the (possibly stale) result
      const eqParts = rhs.split("=");
      if (eqParts.length < 2) {
        // Malformed – treat as an expression with no prior result
        errors.push(`Line ${i + 1}: could not parse calculation RHS.`);
        continue;
      }

      const expression = trim(eqParts.slice(0, -1).join("=")); // everything before last =
      const answer = trim(eqParts[eqParts.length-1]);
      //regex to remove all leading digits
      const targetunits = answer.replace(/^\d+/, '')

      // ── Evaluate with math.js (units propagate automatically) ──
      try {
        const result = math.evaluate(expression+' to '+targetunits, scope);
        
        if (isErrorValue(result)) {
          errors.push(`Line ${i + 1} (${varName}): expression "${expression}" evaluated to an error.`);
          df.push({ 
            type: "CALCULATED", 
            name: varName, 
            equation: expression, 
            value: null,
            valueStr: "ERROR",
            paraIndex: i 
          });
          continue;
        }

        // Store in scope so later calculations can use it
        scope[varName] = result;
        
        const formatted = formatValue(result);
        df.push({ 
          type: "CALCULATED", 
          name: varName, 
          equation: expression, 
          value: result,
          valueStr: formatted,
          paraIndex: i 
        });
        
      } catch (err) {
        errors.push(`Line ${i + 1} (${varName}): expression "${expression}" failed. ${err.message}`);
        df.push({ 
          type: "CALCULATED", 
          name: varName, 
          equation: expression, 
          value: null,
          valueStr: "ERROR",
          paraIndex: i 
        });
      }
    }

    // ── 3.  Write results back into the document ────────────────
    //   For each CALCULATED row that evaluated successfully we rebuild the
    //   paragraph text with the new result.

    await new Promise((resolve, reject) => {
      Word.run(async function (context) {
        const paras = context.document.paragraphs;
        paras.load("text");
        await context.sync();

        for (const row of df) {
          if (row.type !== "CALCULATED") continue;
          if (isErrorValue(row.value))    continue; // don't overwrite with ERROR

          const para = paras.items[row.paraIndex];
          const currentText = trim(para.text);

          // Rebuild: description : varName = expression = result
          // We re-parse to preserve the original description
          const m2 = currentText.match(LINE_RE);
          if (!m2) continue;
          const [, desc] = m2;

          const newText = trim(desc) + " : " + row.name + " = " + row.equation + " = " + row.valueStr;

          // Only write if something actually changed (avoids unnecessary revisions)
          if (trim(para.text) !== newText) {
            // Clear existing runs and insert new text
            para.clear();
            para.insertText(newText, "start");
          }
        }

        await context.sync();
        resolve();
      }).catch(reject);
    });

    // ── 4.  Render the dataframe table ───────────────────────────
    renderTable(df);

    // ── 5.  Status ───────────────────────────────────────────────
    if (errors.length > 0) {
      setStatus("Done with " + errors.length + " warning(s):"+errors, "err");
      console.warn("CalcDoc warnings:", errors);
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
      tbody.innerHTML = '<tr class="empty-row"><td colspan="4">No variables found in this document.</td></tr>';
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

  function escapeHtml(s)   { return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }