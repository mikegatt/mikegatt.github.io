 // ──────────────────────────────────────────────
  // CalcDoc – Office.js add-in logic
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
   * Safely evaluate a mathematical expression string.
   * Only allows: digits, operators +-*,div parentheses, whitespace, and
   * scientific-notation letters (e / E).  Variable names are substituted
   * BEFORE this is called, so only numeric tokens remain.
   *
   * Returns NaN on any error instead of throwing.
   */
  function safeEval(expr) {
    // Allow only safe characters after variable substitution
    if (!/^[\d\s+\-*/().eE]+$/.test(expr)) return NaN;
    try {
      // new Function is acceptable here because we have already stripped
      // every token that is not a number or operator.
      return Function('"use strict"; return (' + expr + ')')();
    } catch (_) {
      return NaN;
    }
  }

  /**
   * Round a number to a sensible number of decimal places.
   * Keeps up to 10 significant figures, strips trailing zeroes.
   */
  function formatNum(n) {
    if (!isFinite(n)) return "NaN";
    // Use toPrecision(10) then parseFloat to strip trailing zeroes
    return String(parseFloat(Number(n).toPrecision(10)));
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
   * evaluates calculations in order, then writes results back.
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
    // DataFrame rows:  { type, name, equation, value, paraIndex }
    //   type  = "DEFINED" | "CALCULATED"
    //   name  = variable name (string)
    //   equation = source expression string (only for CALCULATED)
    //   value = numeric result
    //   paraIndex = index into the paragraphs array (so we can write back)

    const df       = [];         // the "dataframe"
    const varMap   = {};         // name → current numeric value
    const errors   = [];         // human-readable error messages

    // Regex explanation:
    //   ^(.+?)\s*\:\s*         ← description  :
    //   (\w+)\s*=\s*           ← variable     =
    //   (.+?)                  ← RHS  (number OR expression = result)
    //   $
    const LINE_RE = /^(.+?)\s*\:\s*(\w+)\s*=\s*(.+)$/;

    for (let i = 0; i < paragraphs.length; i++) {
      const raw = trim(paragraphs[i]);
      if (!raw) continue;                          // skip blank lines

      const m = raw.match(LINE_RE);
      if (!m) continue;                            // plain text – ignore

      const [, , varName, rhs] = m;

      // ── Is the RHS a bare number? → DEFINITION ──
      const plainNum = Number(rhs);
      if (!isNaN(plainNum) && trim(rhs) !== "") {
        // Defined variable
        varMap[varName] = plainNum;
        df.push({ type: "DEFINED", name: varName, equation: String(plainNum), value: plainNum, paraIndex: i });
        continue;
      }

      // ── Otherwise it should be  expression = <result>  → CALCULATION ──
      // Split on the LAST "=" to separate expression from the (possibly stale) result
      const eqParts = rhs.split("=");
      if (eqParts.length < 2) {
        // Malformed – treat as an expression with no prior result
        errors.push(`Line ${i + 1}: could not parse calculation RHS.`);
        continue;
      }

      const expression = trim(eqParts.slice(0, -1).join("=")); // everything before last =

      // ── Substitute known variables into the expression ──
      let substituted = expression;
      // Sort variable names longest-first so "ab" doesn't partially match "a"
      const sortedNames = Object.keys(varMap).sort((a, b) => b.length - a.length);
      for (const name of sortedNames) {
        // Word-boundary replacement: replace whole-word occurrences only
        const re = new RegExp("\\b" + escapeRegExp(name) + "\\b", "g");
        substituted = substituted.replace(re, String(varMap[name]));
      }

      // ── Evaluate ──
      const result = safeEval(substituted);

      if (isNaN(result)) {
        errors.push(`Line ${i + 1} (${varName}): expression "${expression}" could not be evaluated.  Check that all variables are defined above this line.`);
        df.push({ type: "CALCULATED", name: varName, equation: expression, value: NaN, paraIndex: i });
        continue;
      }

      // Store in the running variable map so later calculations can use it
      varMap[varName] = result;
      df.push({ type: "CALCULATED", name: varName, equation: expression, value: result, paraIndex: i });
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
          if (isNaN(row.value))            continue; // don't overwrite with NaN

          const para = paras.items[row.paraIndex];
          const currentText = trim(para.text);

          // Rebuild: description | varName = expression = result
          // We re-parse to preserve the original description
          const m2 = currentText.match(LINE_RE);
          if (!m2) continue;
          const [, desc] = m2;

          const newText = trim(desc) + " : " + row.name + " = " + row.equation + " = " + formatNum(row.value);

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
      setStatus("Done with " + errors.length + " warning(s). See console.", "err");
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

      const valStr   = isNaN(row.value) ? "ERROR" : formatNum(row.value);
      const valClass = "col-val" + (isNaN(row.value) ? " nan" : "");

      tr.innerHTML =
        `<td class="col-type">${row.type === "DEFINED" ? "DEF" : "CALC"}</td>` +
        `<td class="col-name">${escapeHtml(row.name)}</td>` +
        `<td class="col-eq">${escapeHtml(row.equation)}</td>` +
        `<td class="${valClass}">${escapeHtml(valStr)}</td>`;

      tbody.appendChild(tr);
    }
  }

  // ─── Utility ─────────────────────────────────────────────────

  function escapeRegExp(s) { return s.replace(/[.*+?^${}():[\]\\]/g, "\\$&"); }
  function escapeHtml(s)   { return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
