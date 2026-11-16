/* =====================================================================
   AI dashboard suggestions.
   1. profile()      – studies the chosen sheets locally (column types,
                       fill rate, distinct values, numbers, dates, links
                       between sheets). No network.
   2. ruleSuggest()  – instant, free, offline KPI/chart suggestions.
   3. aiSuggest()    – optional: sends ONLY the profile (column names,
                       types, counts, top values — never whole rows) to
                       Google Gemini, validates every answer against the
                       real columns, caches by profile so repeat clicks
                       cost nothing.
   Rendering is done by dashboard.js (window.BTDash); this file only
   produces widget specs.
   ===================================================================== */
(function (BT) {
  "use strict";
  if (!BT || !window.BTDash) return;
  const $ = BT.$, esc = BT.esc, Dash = window.BTDash;
  const arr = v => Array.isArray(v) ? v : v && typeof v === "object" ? Object.values(v) : [];
  const CACHE_KEY = "bt-ai-dash-cache";

  /* ---------- 1. profiling ---------- */
  const RX = {
    status: /status|stage|state|progress/i, priority: /prior|sever|impact|urgen|risk|criticality|siverity/i,
    person: /assign|owner|poc|responsib|resource|developer|tester|lead|name of|handled|spoc|person/i,
    category: /type|categor|module|stream|area|product|team|bank|client|channel|env|phase|region|vendor|api|component/i,
    id: /^(sr\.?|s\.?no|#|no\.?|id|.*\bid\b|.*\bno\b|.*number|ref)/i,
    start: /start|creat|raise|open|log|receiv|date|request|reported/i, end: /close|complet|resolv|go.?live|deliver|end|done|deploy|signoff|sign-off|eta|due|target/i
  };
  function profile(sheetIds) {
    Dash.resetMemo();
    const sheets = [];
    for (const sid of sheetIds) {
      const sh = Dash.sheet(sid); if (!sh) continue;
      const rows = Dash.rowsFor(sid), n = rows.length, sc = BT.statusCol(sh);
      const cols = (sh.columns || []).map(c => {
        const p = {id: c.id, label: c.label, type: c.type};
        if (c.type === "calc") p.calc = c.calc?.kind;
        const vals = rows.map(r => Dash.cats(sh, c, r)), flat = vals.flat().filter(v => v !== "(Empty)");
        p.filled = n ? Math.round(rows.filter((r, i) => vals[i][0] !== "(Empty)").length / n * 100) : 0;
        const cnt = new Map(); flat.forEach(v => cnt.set(v, (cnt.get(v) || 0) + 1));
        p.distinct = cnt.size;
        if (c.type !== "long") p.top = [...cnt.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([v, k]) => [String(v).slice(0, 40), k]);
        if (c.type === "number" || c.type === "calc") { const ns = rows.map(r => Dash.num(sh, c, r)).filter(x => x != null); if (ns.length) p.num = {min: Math.min(...ns), max: Math.max(...ns), avg: +(ns.reduce((a, b) => a + b, 0) / ns.length).toFixed(1), count: ns.length}; }
        if (c.type === "date") { const ds = rows.map(r => (r.cells || {})[c.id]).filter(Boolean).sort(); if (ds.length) p.dates = {from: ds[0], to: ds[ds.length - 1], count: ds.length}; }
        // role
        if (sc && sc.id === c.id) p.role = "status";
        else if (c.id === sh.assigneeCol || (c.type !== "long" && RX.person.test(c.label) && p.distinct > 1 && p.distinct <= Math.max(25, n * .6))) p.role = "person";
        else if (c.type === "date") p.role = RX.end.test(c.label) && !RX.start.test(c.label.replace(/date/i, "")) ? "end-date" : "date";
        else if (c.type === "number" || c.type === "calc") p.role = c.calc?.kind === "serial" || (RX.id.test(c.label) && p.distinct >= n * .9) ? "id" : "measure";
        else if (c.type === "long") p.role = "text";
        else if (p.distinct >= Math.max(8, n * .8)) p.role = "id";
        else if (RX.priority.test(c.label)) p.role = "priority";
        else if (p.distinct >= 2 && p.distinct <= Math.max(15, n * .5)) p.role = "category";
        else p.role = "text";
        return p;
      });
      const closed = sc ? rows.filter(r => BT.isDoneRow(sh, r)).length : null, breach = rows.filter(r => BT.rowState(sh, r).breach).length, imp = rows.filter(r => r.imp).length;
      sheets.push({id: sid, name: sh.name, rows: n, closed, open: closed == null ? null : n - closed, overdue: breach, important: imp, columns: cols, hasEta: (sh.columns || []).some(c => c.calc?.eta || c.calc?.kind === "due")});
    }
    // relationships between sheets: same column names, overlapping values
    const links = [];
    for (let i = 0; i < sheets.length; i++) for (let j = i + 1; j < sheets.length; j++) for (const a of sheets[i].columns) for (const b of sheets[j].columns) {
      if (a.role === "text" || b.role === "text") continue;
      const same = a.label.trim().toLowerCase() === b.label.trim().toLowerCase();
      const av = new Set((a.top || []).map(x => x[0].toLowerCase())), ov = (b.top || []).filter(x => av.has(x[0].toLowerCase())).length;
      if (same || ov >= 2) links.push({a: sheets[i].name, ac: a.label, b: sheets[j].name, bc: b.label, sharedValues: ov});
    }
    return {sheets, links: links.slice(0, 12)};
  }
  /* ---------- 2. rule-based suggestions (offline, free) ---------- */
  function ruleSuggest(P) {
    const out = [], ins = [];
    for (const s of P.sheets) {
      const by = role => s.columns.filter(c => c.role === role && c.filled >= 20);
      const st = by("status")[0], pr = by("priority")[0], ppl = by("person"), cat = by("category"), dates = by("date"), ends = by("end-date"), meas = by("measure");
      const multi = P.sheets.length > 1 ? ` in ${s.name}` : "";
      out.push({_s: 100, type: "kpi", sheetId: s.id, title: `Total entries${multi}`, metric: "count", why: `Baseline size of ${s.name}: ${s.rows} entries today. Every other chart is a slice of this number.`, size: 1});
      if (st && s.closed != null) {
        out.push({_s: 96, type: "kpi", sheetId: s.id, title: `Open items${multi}`, metric: "count", filter: [{op: "open"}], why: `${s.open} of ${s.rows} entries are not yet in a Done/Cancelled stage. This is the live workload.`, size: 1});
        out.push({_s: 90, type: "kpi", sheetId: s.id, title: `Completion rate${multi}`, kpi: {mode: "pct", where: [{op: "closed"}]}, metric: "count", why: `Share of entries that reached a closed stage (${s.closed} of ${s.rows}). Tracks overall delivery progress.`, size: 1});
        out.push({_s: 92, type: st.distinct <= 7 ? "donut" : "hbar", sheetId: s.id, groupBy: st.id, title: `Entries by ${st.label}${multi}`, metric: "count", why: `Shows where work sits in the pipeline. ${st.top?.[0] ? `The largest group is “${st.top[0][0]}” (${st.top[0][1]}).` : ""} ${st.distinct <= 7 ? "A donut works because there are few stages." : "Bars keep many stages readable, in workflow order."}`});
        ins.push(st.top?.[0] ? `${s.name}: most entries are “${st.top[0][0]}” (${Math.round(st.top[0][1] / Math.max(1, s.rows) * 100)}%).` : "");
      }
      if (s.hasEta) { out.push({_s: 94, type: "kpi", sheetId: s.id, title: `ETA crossed${multi}`, metric: "count", filter: [{op: "overdue"}], why: `Entries past their ETA and still open (${s.overdue} today). The number to bring down first.`, size: 1}); if (s.overdue) ins.push(`${s.name}: ${s.overdue} open ${s.overdue === 1 ? "entry has" : "entries have"} crossed the ETA.`); }
      if (pr) out.push(st ? {_s: 80, type: "stacked", sheetId: s.id, groupBy: pr.id, stackBy: st.id, title: `${pr.label} × ${st.label}${multi}`, metric: "count", why: `Shows whether high-${pr.label.toLowerCase()} items are actually moving: each bar is a ${pr.label.toLowerCase()} level split by ${st.label.toLowerCase()}.`}
        : {_s: 78, type: "bar", sheetId: s.id, groupBy: pr.id, title: `Entries by ${pr.label}${multi}`, metric: "count", why: `How the load is spread across ${pr.label.toLowerCase()} levels.`});
      for (const p of ppl.slice(0, 2)) {
        out.push({_s: 84, type: "hbar", sheetId: s.id, groupBy: p.id, title: `${st ? "Open items" : "Entries"} by ${p.label}${multi}`, metric: "count", filter: st ? [{op: "open"}] : [], why: `Workload per ${p.label.toLowerCase()}: spots people who are overloaded or idle.${p.top?.[0] ? ` ${p.top[0][0]} has the most (${p.top[0][1]}).` : ""}`});
        if (p.top?.[0] && s.rows) ins.push(`${s.name}: ${p.top[0][0]} holds ${p.top[0][1]} entries in “${p.label}”.`);
      }
      for (const c of cat.slice(0, 2)) out.push({_s: 70, type: c.distinct <= 5 ? "pie" : "bar", sheetId: s.id, groupBy: c.id, title: `Entries by ${c.label}${multi}`, metric: "count", why: c.distinct <= 5 ? `Only ${c.distinct} groups, so a pie shows the split at a glance.` : `Compares ${c.distinct} ${c.label.toLowerCase()} groups side by side.`});
      if (st && cat[0] && !pr) out.push({_s: 74, type: "stacked", sheetId: s.id, groupBy: cat[0].id, stackBy: st.id, title: `${cat[0].label} by ${st.label}${multi}`, metric: "count", why: `Progress per ${cat[0].label.toLowerCase()}: which groups are mostly done and which are stuck.`});
      const d0 = dates[0] || ends[0];
      if (d0 && d0.dates && d0.dates.count >= 3) out.push({_s: 82, type: "line", sheetId: s.id, dateCol: d0.id, title: `New entries over time (${d0.label})${multi}`, metric: "count", why: `Trend of intake by ${d0.label}. Rising lines mean work is arriving faster than before.`, size: 4});
      if (ends[0] && ends[0] !== d0 && ends[0].dates?.count >= 3) out.push({_s: 60, type: "line", sheetId: s.id, dateCol: ends[0].id, cumulative: true, title: `${ends[0].label} – running total${multi}`, metric: "count", why: `Cumulative ${ends[0].label.toLowerCase()} dates show delivery pace over time.`});
      for (const m of meas.slice(0, 2)) {
        const age = m.calc === "aging" || /aging|age|days/i.test(m.label), money = /amount|value|cost|budget|effort|hours|price|revenue|volume|count/i.test(m.label);
        if (!age && !money) continue;
        out.push({_s: age ? 76 : 64, type: "kpi", sheetId: s.id, title: `Average ${m.label}${st && age ? " (open)" : ""}${multi}`, metric: "avg", valueCol: m.id, filter: st && age ? [{op: "open"}] : [], why: age ? `How long open items have been waiting on average (${m.num?.avg ?? "–"} now).` : `Typical ${m.label} value across entries.`, size: 1});
        const g = ppl[0] || cat[0] || pr; if (g) out.push({_s: age ? 72 : 55, type: "hbar", sheetId: s.id, groupBy: g.id, metric: "avg", valueCol: m.id, filter: st && age ? [{op: "open"}] : [], sort: "value", title: `Average ${m.label} by ${g.label}${multi}`, why: `Compares ${m.label.toLowerCase()} across ${g.label.toLowerCase()} – a performance comparison that shows where things are slowest.`});
      }
      s.columns.filter(c => c.filled < 40 && c.role !== "text" && c.role !== "id" && s.rows >= 5).slice(0, 2).forEach(c => ins.push(`${s.name}: “${c.label}” is only ${c.filled}% filled, so charts on it may be incomplete.`));
    }
    if (P.sheets.length > 1) {
      const withSt = P.sheets.filter(s => s.closed != null);
      out.push({_s: 86, type: "hbar", sheetId: P.sheets[0].id, sheets: P.sheets.map(s => s.id), groupBy: "@sheet", metric: "count", filter: withSt.length === P.sheets.length ? [{op: "open"}] : [], title: withSt.length === P.sheets.length ? "Open items per sheet" : "Entries per sheet", why: `Compares the ${P.sheets.length} source sheets side by side to show where the work is concentrated.`});
    }
    P.links.slice(0, 3).forEach(l => ins.push(`“${l.ac}” in ${l.a} and “${l.bc}” in ${l.b} ${l.sharedValues ? `share ${l.sharedValues} common values` : "have the same name"}, so they can be compared.`));
    const ranked = dedupe(out).map((w, i) => ({w, i})).sort((a, b) => (b.w._s || 50) - (a.w._s || 50) || a.i - b.i).slice(0, 8 + 5 * P.sheets.length).map(x => { const {_s, ...w} = x.w; return w; });
    const kp = ranked.filter(w => w.type === "kpi"), ch = ranked.filter(w => w.type !== "kpi");
    return {suggestions: [...kp, ...ch], insights: ins.filter(Boolean).slice(0, 8), source: "rules"};
  }
  function sig(w) { return [w.type, w.sheetId, w.groupBy, w.stackBy, w.dateCol, w.metric, w.valueCol, JSON.stringify(w.filter || []), JSON.stringify(w.kpi || {})].join("|"); }
  function dedupe(list) { const seen = new Set(); return list.filter(w => { const k = sig(w); if (seen.has(k)) return false; seen.add(k); return true; }); }
  /* ---------- 3. AI (Gemini) suggestions ---------- */
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
  function cacheGet(k) { try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}")[k] || null; } catch (e) { return null; } }
  function cachePut(k, v) { try { const c = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}"); c[k] = {...v, at: Date.now()}; const keys = Object.keys(c).sort((a, b) => c[b].at - c[a].at).slice(0, 15); localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(keys.map(x => [x, c[x]])))); } catch (e) {} }
  function compact(P) { // what is sent to the model: schema + aggregates only
    return {sheets: P.sheets.map(s => ({id: s.id, name: s.name, rows: s.rows, open: s.open, closed: s.closed, overdue: s.overdue, hasEtaTracking: s.hasEta,
      columns: s.columns.map(c => ({id: c.id, label: c.label, type: c.type, role: c.role, filledPct: c.filled, distinct: c.distinct, ...(c.top && c.role !== "id" ? {topValues: c.top} : {}), ...(c.num ? {numbers: c.num} : {}), ...(c.dates ? {dates: c.dates} : {})}))})), links: P.links};
  }
  const TYPES_OK = ["kpi", "bar", "hbar", "line", "pie", "donut", "stacked", "table"], OPS_OK = ["in", "notin", "open", "closed", "overdue", "important", "empty", "notempty"], MET_OK = ["count", "sum", "avg", "min", "max"];
  function validate(s0, P) {
    const sh = P.sheets.find(x => x.id === s0.sheet || x.id === s0.sheetId || x.name === s0.sheet); if (!sh) return null;
    const cid = v => { if (!v) return null; const c = sh.columns.find(x => x.id === v || x.label.toLowerCase() === String(v).toLowerCase()); return c ? c.id : undefined; };
    const w = {type: TYPES_OK.includes(s0.type) ? s0.type : null, sheetId: sh.id, title: String(s0.title || "").slice(0, 80), why: String(s0.why || "").slice(0, 300), metric: MET_OK.includes(s0.metric) ? s0.metric : "count"};
    if (!w.type) return null;
    for (const k of ["groupBy", "stackBy", "dateCol", "valueCol"]) { const v = cid(s0[k]); if (v === undefined) return null; if (v) w[k] = v; }
    const fl = f => { if (!f || !OPS_OK.includes(f.op)) return undefined; if (["open", "closed", "overdue", "important"].includes(f.op)) return {op: f.op}; const c = cid(f.col); if (!c) return undefined; return {col: c, op: f.op, values: arr(f.values).map(String).slice(0, 10)}; };
    w.filter = arr(s0.filter).map(fl); if (w.filter.includes(undefined)) return null;
    if (w.type === "kpi") { const mode = s0.kpi?.mode === "pct" ? "pct" : "value"; w.kpi = {mode, where: arr(s0.kpi?.where).map(fl).filter(Boolean)}; if (mode === "pct" && !w.kpi.where.length) return null; w.size = 1; }
    if (w.type === "line" && /running|cumulative/i.test(w.title)) w.cumulative = true;
    if (Dash.problem(w)) return null;
    return w;
  }
  async function aiSuggest(P, force) {
    const C = compact(P), key = hash(JSON.stringify(C) + "|" + (BT.AI.model || ""));
    if (!force) { const hit = cacheGet(key); if (hit) return {...hit, cached: true}; }
    const prompt = `Design a management dashboard for this tracker data. You only see a profile (column names, types, counts and top values), not the rows.
Return JSON: {"insights": [up to 6 short factual observations based on the numbers given], "suggestions": [8-14 items]}.
Each suggestion: {"type": one of ${TYPES_OK.join("|")}, "title": short, "why": one sentence on why this chart/KPI is useful for this data, "sheet": sheet id, "groupBy": column id (bar/hbar/pie/donut/table/stacked), "stackBy": column id (stacked, optional for line), "dateCol": column id (line), "metric": count|sum|avg|min|max, "valueCol": numeric column id when metric is not count, "filter": [{"col": column id, "op": in|notin|empty|notempty, "values": [..]} or {"op": open|closed|overdue|important}], "kpi": {"mode": "value"|"pct", "where": [filter]} for kpi}.
Rules: use ONLY ids from the profile. Start with 3-5 KPIs. Prefer pie/donut only for ≤6 groups. Use line only with date columns. Include at least one trend and one comparison when the data allows. Don't group by id-like or long text columns. "open"/"closed" use the status workflow.
PROFILE:
${JSON.stringify(C)}`;
    const res = await BT.gemini(prompt, {json: true, temp: 0.2, system: "You are a careful BI analyst. Output strictly valid JSON matching the requested shape. Never invent column ids."});
    const sug = dedupe(arr(res.suggestions).map(s0 => validate(s0, P)).filter(Boolean));
    const out = {suggestions: sug, insights: arr(res.insights).map(String).slice(0, 6), source: "ai", model: BT.AI.model, dropped: arr(res.suggestions).length - sug.length};
    if (sug.length) cachePut(key, out);
    return out;
  }
  /* ---------- Google Sheets import (needs internet; public/published sheets) ---------- */
  async function importGoogleSheet(url) {
    const m = /\/spreadsheets\/d\/(e\/)?([A-Za-z0-9_-]+)/.exec(url || ""); if (!m) throw new Error("That isn't a Google Sheets link. It should contain /spreadsheets/d/…");
    const gid = (/[#&?]gid=(\d+)/.exec(url) || [])[1];
    const tries = m[1] ? [`https://docs.google.com/spreadsheets/d/e/${m[2]}/pub?output=csv${gid ? "&gid=" + gid : ""}`]
      : [`https://docs.google.com/spreadsheets/d/${m[2]}/gviz/tq?tqx=out:csv${gid ? "&gid=" + gid : ""}`, `https://docs.google.com/spreadsheets/d/${m[2]}/export?format=csv${gid ? "&gid=" + gid : ""}`];
    let text = null, lastErr = null;
    for (const u of tries) { try { const r = await fetch(u); if (!r.ok) throw new Error("HTTP " + r.status); const t = await r.text(); if (/^\s*<!DOCTYPE html|<html/i.test(t)) throw new Error("sign-in page"); text = t; break; } catch (e) { lastErr = e; } }
    if (text == null) throw new Error(navigator.onLine === false ? "You're offline. Google Sheets import needs internet." : "Couldn't read that sheet. In Google Sheets choose Share → General access → Anyone with the link (Viewer), or File → Share → Publish to web, then try again. You can also download it as .xlsx and use Upload Excel.");
    if (!window.XLSX) throw new Error("The Excel/CSV reader didn't load.");
    const wb = XLSX.read(text, {type: "string", raw: false});
    const items = []; for (const n of wb.SheetNames) for (const parsed of BT.inferSheets("Google Sheet", XLSX.utils.sheet_to_json(wb.Sheets[n], {header: 1, raw: false, defval: ""}))) items.push({tab: n, parsed});
    if (!items.length) throw new Error("That sheet looks empty, or has no header row.");
    return items;
  }
  /* ---------- wizard UI ---------- */
  function defaultPick(list) { const k = [], c = []; list.forEach((w, i) => (w.type === "kpi" ? k : c).push(i)); return new Set([...k.slice(0, 4), ...c.slice(0, 5)]); }
  const W = {};
  function openWizard(dashId, preSheets) {
    const t = BT.curTracker(); if (!t) { BT.toast("Create a tracker first"); return; }
    const d = dashId ? Dash.cur() : null;
    const srcs = d ? Dash.sourceSheets(d) : [];
    Object.assign(W, {dashId: d ? d.id : null, step: preSheets || (d && srcs.length) ? 2 : 1, name: d ? d.name : `${t.name} dashboard`, sel: new Set(preSheets || (srcs.length ? srcs : (BT.S.view === "sheet" && BT.S.sheetId ? [BT.S.sheetId] : BT.sheetList(t.id).slice(0, 3).map(s => s.id)))), res: null, chosen: new Set(), busy: false, err: ""});
    if (!BT.sheetList(t.id).length) W.step = 1;
    BT.openDialog({eyebrow: d ? d.name : "New dashboard", title: d ? "Suggest charts" : "Build a dashboard with AI suggestions", saveLabel: "Next", body: () => `<div id="sgw" class="sg-step"></div>`,
      mount: root => { W.root = root; draw(); },
      onSave: async () => {
        if (W.step === 1) { if (!W.sel.size) { BT.toast("Tick at least one sheet, or upload a file"); return false; } W.step = 2; draw(); return false; }
        const picks = W.res ? W.res.suggestions.filter((s0, i) => W.chosen.has(i)) : [];
        if (!picks.length) { BT.toast("Select at least one chart, or use Add all"); return false; }
        await finish(picks); }
    });
  }
  async function finish(picks) {
    const clean = picks.map(({...w}) => w);
    if (W.dashId) await Dash.addWidgets(W.dashId, clean);
    else await Dash.createDashboard({name: (W.root?.querySelector("#sg_name")?.value || W.name).trim() || "Dashboard", trackerId: BT.curTracker().id, sheets: [...W.sel], widgets: clean});
    BT.closeDialog(true);
  }
  function setSave(label, show = true) { const b = $("#dSave"); if (b) { b.textContent = label; b.hidden = !show; } }
  function draw() {
    const root = W.root?.querySelector("#sgw"); if (!root) return;
    const t = BT.curTracker(), sheets = BT.sheetList(t.id);
    if (W.step === 1) {
      setSave("Analyse data");
      root.innerHTML = `${W.dashId ? "" : `<div class="field"><label for="sg_name">Dashboard name</label><input class="inp" id="sg_name" value="${esc(W.name)}"></div>`}
        <div class="field"><span class="lbl">Data source: sheets in ${esc(t.name)} <span class="typ">${W.sel.size} selected</span></span>
          ${sheets.length ? `<div class="sg-src">${sheets.map(s => `<label class="ck"><input type="checkbox" data-sgs="${esc(s.id)}" ${W.sel.has(s.id) ? "checked" : ""}> ${esc(s.name)} <span class="n">${BT.rowsOf(s.id).length}</span></label>`).join("")}</div>` : `<div class="banner">No sheets yet. Upload an Excel file or import a Google Sheet.</div>`}</div>
        <div class="field"><span class="lbl">Or bring in new data</span><div class="sg-up"><button class="btn" type="button" id="sg_xl">${BT.ICON.ul} Upload Excel / CSV…</button><button class="btn" type="button" id="sg_gs">Import a Google Sheet link…</button> <span class="needs" title="Fetching from Google needs an internet connection">needs internet</span></div>
          <span class="hint">Uploaded tabs become sheets in ${esc(t.name)}, so charts stay connected to them and update when you edit entries.</span></div>
        <div id="sg_gsf" hidden class="field"><label for="sg_gurl">Google Sheets link</label><div class="row2" style="flex:none"><input class="inp" id="sg_gurl" placeholder="https://docs.google.com/spreadsheets/d/…/edit#gid=0" style="flex:1"><button class="btn primary" type="button" id="sg_ggo" style="flex:none">Import</button></div><span class="hint" id="sg_gmsg">The sheet must be shared as “Anyone with the link” or published to the web. This imports a copy; later edits in Google aren't pulled in.</span></div>`;
      root.querySelectorAll("[data-sgs]").forEach(i => i.onchange = () => { i.checked ? W.sel.add(i.dataset.sgs) : W.sel.delete(i.dataset.sgs); W.res = null; draw(); });
      root.querySelector("#sg_name")?.addEventListener("input", e => W.name = e.target.value);
      const reopen = (ids) => { const keepName = W.name, keepSel = new Set([...W.sel, ...ids]); setTimeout(() => { openWizard(W.dashId, null); W.name = keepName; W.sel = keepSel; W.step = 1; draw(); }, 80); };
      root.querySelector("#sg_xl").onclick = () => { window.__dashImport = (ids) => reopen(ids); BT.closeDialog(true); $("#fileIn").click(); };
      root.querySelector("#sg_gs").onclick = () => { root.querySelector("#sg_gsf").hidden = false; root.querySelector("#sg_gurl").focus(); };
      root.querySelector("#sg_ggo").onclick = async () => { const b = root.querySelector("#sg_ggo"), msg = root.querySelector("#sg_gmsg"); b.disabled = true; b.textContent = "Importing…";
        try { const items = await importGoogleSheet(root.querySelector("#sg_gurl").value.trim()); window.__dashImport = (ids) => reopen(ids); BT.closeDialog(true); BT.openImportDialog(items, "Google Sheet"); }
        catch (e) { msg.className = "hint"; msg.style.color = "var(--bad)"; msg.textContent = e.message; b.disabled = false; b.textContent = "Import"; } };
      return;
    }
    // step 2
    if (!W.res) { W.prof = profile([...W.sel]); W.res = ruleSuggest(W.prof); W.chosen = defaultPick(W.res.suggestions); }
    const P = W.prof, R0 = W.res, aiOK = BT.AI_ON, hasKey = !!BT.AI.key;
    setSave(W.dashId ? `Add ${W.chosen.size} chart${W.chosen.size === 1 ? "" : "s"}` : `Create dashboard (${W.chosen.size})`);
    root.innerHTML = `
      <div class="field"><span class="lbl">Suggest from these sheets <span class="typ">click to add or remove · ${W.sel.size} selected</span></span>
        <div class="sg-pick">${sheets.map(s => { const on = W.sel.has(s.id), p = P.sheets.find(x => x.id === s.id); return `<button type="button" class="sg-tog" data-sgt="${esc(s.id)}" aria-pressed="${on}" title="${p ? `${p.rows} rows · ${p.columns.length} columns` : "Click to include"}">${on ? "✓ " : "+ "}${esc(s.name)}</button>`; }).join("")}
        <button class="btn ghost" type="button" id="sg_back" style="flex:none">Upload / import data…</button></div></div>
      <details class="sg-prof"><summary class="hint" style="cursor:pointer">What the assistant found in your columns</summary>${P.sheets.map(s => `<div><b>${esc(s.name)}</b>${s.columns.map(c => `<div class="pf"><span>${esc(c.label)}</span><span class="sg-chip">${esc(c.role)}</span><span class="sg-chip">${c.filled}% filled</span>${c.distinct ? `<span class="sg-chip">${c.distinct} distinct</span>` : ""}</div>`).join("")}</div>`).join("")}${P.links.length ? `<div><b>Links between sheets</b>${P.links.map(l => `<div class="pf">${esc(l.a)} · ${esc(l.ac)} ↔ ${esc(l.b)} · ${esc(l.bc)}</div>`).join("")}</div>` : ""}</details>
      ${P.sheets.every(s => !s.rows) ? `<div class="banner">These sheets have no entries yet. Charts will fill in automatically as entries are added.</div>` : ""}
      ${R0.insights.length ? `<div class="field"><span class="lbl">Insights</span><ul class="sg-ins">${R0.insights.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
      <div class="sg-bar"><div class="row2" style="flex:none;align-items:center"><span class="sg-src-badge ${R0.source === "ai" ? "ai" : "rule"}">${R0.source === "ai" ? `AI suggestions · ${esc(R0.model || "Gemini")}${R0.cached ? " · saved result" : ""}` : "Quick suggestions (no AI, works offline)"}</span>
          ${aiOK ? hasKey ? `<button class="btn" type="button" id="sg_ai">${BT.ICON.spark} ${R0.source === "ai" ? "Ask AI again" : "Ask AI for smarter suggestions"}</button>` : `<button class="btn" type="button" id="sg_key">${BT.ICON.spark} Add a Gemini key to use AI</button>` : ""}
          ${aiOK ? `<span class="needs" title="AI suggestions call Google Gemini">needs internet + key</span>` : ""}</div>
        <div class="row2" style="flex:none"><button class="btn ghost" type="button" id="sg_all">${W.chosen.size === R0.suggestions.length ? "Clear all" : "Select all"}</button><button class="btn primary" type="button" id="sg_addall">Add all ${R0.suggestions.length}</button></div></div>
      ${W.busy ? `<div class="sg-load"><span class="spin"></span>Asking ${esc(BT.AI.model || "Gemini")} for suggestions. Only column names, types and counts are sent, never whole rows.</div>` : ""}
      ${W.err ? `<div class="banner" style="background:var(--bad-bg);color:var(--bad)">${esc(W.err)} The quick suggestions below still work.</div>` : ""}
      <div class="sg-list">${R0.suggestions.map((s, i) => `<div class="sg" role="checkbox" tabindex="0" aria-checked="${W.chosen.has(i)}" data-sgi="${i}"><div class="sg-top"><input type="checkbox" tabindex="-1" ${W.chosen.has(i) ? "checked" : ""} aria-hidden="true"><div><b>${esc(s.title || Dash.TYPES[s.type])}</b><span class="sg-chip">${esc(Dash.TYPES[s.type])}</span> <span class="sg-chip">${Dash.describe(s)}</span></div></div><p class="sg-why">${esc(s.why || "")}</p><div class="sg-prev dw-b dw-${s.type}">${Dash.body({...s, id: "p" + i})}</div></div>`).join("") || `<div class="banner">No suggestions could be made from these columns. Use Add chart to build one by hand.</div>`}</div>`;
    Dash.resetMemo();
    root.querySelector("#sg_back")?.addEventListener("click", () => { W.step = 1; W.res = null; draw(); });
    root.querySelectorAll("[data-sgt]").forEach(b => b.onclick = () => { const id = b.dataset.sgt; if (W.sel.has(id)) { if (W.sel.size === 1) { BT.toast("Keep at least one sheet"); return; } W.sel.delete(id); } else W.sel.add(id); W.res = null; W.err = ""; draw(); });
    root.querySelector("#sg_key")?.addEventListener("click", () => { BT.closeDialog(true); BT.openAI("settings"); });
    root.querySelector("#sg_all").onclick = () => { W.chosen = W.chosen.size === R0.suggestions.length ? new Set() : new Set(R0.suggestions.map((s, i) => i)); draw(); };
    root.querySelector("#sg_addall").onclick = () => finish(R0.suggestions);
    root.querySelectorAll("[data-sgi]").forEach(el => { const tg = () => { const i = +el.dataset.sgi; W.chosen.has(i) ? W.chosen.delete(i) : W.chosen.add(i); draw(); }; el.onclick = tg; el.onkeydown = e => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); tg(); } }; });
    root.querySelector("#sg_ai")?.addEventListener("click", async () => {
      if (navigator.onLine === false) { W.err = "You're offline. AI suggestions need internet."; draw(); return; }
      W.busy = true; W.err = ""; draw();
      try { const r = await aiSuggest(P, R0.source === "ai"); if (!r.suggestions.length) throw new Error("The AI answer had no usable charts for these columns."); W.res = r; W.chosen = new Set(r.suggestions.map((s, i) => i)); }
      catch (e) { W.err = e.message || String(e); }
      W.busy = false; draw();
    });
  }
  // allow "New dashboard" from the command palette
  document.addEventListener("click", e => { if (e.target.closest("[data-act]")?.dataset.act === "newdash" && e.target.closest("#cmdk")) { /* handled by dashboard.js */ } });
  window.BTAI = {openWizard, profile, ruleSuggest, aiSuggest, validate, importGoogleSheet};
  try { BT.S.ready ? BT.render() : BT.renderNav(); } catch (e) {}
})(window.BT);
