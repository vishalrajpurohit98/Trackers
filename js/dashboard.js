/* =====================================================================
   Dashboard engine — live KPIs and charts computed from sheet rows.
   Pure rendering + model. No AI and no backend code lives here:
   - data comes from BT.S (kept current by whichever backend is loaded)
   - every render recomputes from the rows, so edits, new rows and
     deletions show up automatically (nothing is hard-coded or cached)
   ===================================================================== */
(function (BT) {
  "use strict";
  if (!BT) return;
  const $ = BT.$, esc = BT.esc;
  const TYPES = {kpi: "KPI", bar: "Column", hbar: "Bar", line: "Line (trend)", pie: "Pie", donut: "Donut", stacked: "Stacked bar", table: "Top list"};
  const METRICS = {count: "Count of entries", sum: "Sum", avg: "Average", min: "Minimum", max: "Maximum"};
  const PALETTE = ["#0C8565", "#2F5DA8", "#F2A93B", "#BF3A31", "#7A5CC2", "#1B9AAA", "#C2577A", "#6B8E23", "#A6640A", "#4C6EF5", "#8A8F98"];
  const EMPTY = "(Empty)", OTHER = "Other";
  const UI = {edit: false, drag: null, why: new Set()};
  const S = () => BT.S;
  const arr = v => Array.isArray(v) ? v : v && typeof v === "object" ? Object.values(v) : [];
  const fmt = n => n == null || !isFinite(n) ? "–" : Math.abs(n) >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M" : Math.abs(n) >= 1e4 ? (n / 1e3).toFixed(1).replace(/\.0$/, "") + "k" : Number.isInteger(n) ? n.toLocaleString() : n.toFixed(1);

  /* ---------- data access ---------- */
  let MEMO = null; // per-render memo of rows per sheet
  function rowsFor(sid) { MEMO = MEMO || new Map(); if (!MEMO.has(sid)) MEMO.set(sid, BT.rowsOf(sid)); return MEMO.get(sid); }
  function sheet(sid) { const x = S().sheets[sid]; return x ? {id: sid, ...x, columns: arr(x.columns)} : null; }
  function col(sh, id) { return id ? (sh.columns || []).find(c => c.id === id) : null; }
  function raw(sh, c, r) { if (c.type === "calc") { const v = BT.calcCell(sh, c, r); return v.n != null ? v.n : (v.text || ""); } return (r.cells || {})[c.id] ?? ""; }
  function num(sh, c, r) { const v = raw(sh, c, r); if (typeof v === "number") return v; const n = parseFloat(String(v).replace(/[, ]/g, "")); return isFinite(n) ? n : null; }
  function splitMulti(v) { return String(v || "").split(/\s*(?:,|\/|\+|&|;|\n)\s*/).map(x => x.trim()).filter(Boolean); }
  function dateOf(v) { if (!v) return null; const d = /^\d{4}-\d{2}-\d{2}/.test(v) ? new Date(v.slice(0, 10) + "T00:00:00") : new Date(BT.normDate ? BT.normDate(v) + "T00:00:00" : v); return isNaN(d) ? null : d; }
  function cats(sh, c, r) {
    if (c.type === "date") { const d = dateOf((r.cells || {})[c.id]); return [d ? d.toLocaleDateString(undefined, {month: "short", year: "numeric"}) : EMPTY]; }
    let v = raw(sh, c, r); v = typeof v === "number" ? String(v) : String(v).trim();
    if (!v) return [EMPTY];
    if (c.id === sh.assigneeCol || c.id === sh.ownerCol) return splitMulti(v);
    return [v.length > 60 ? v.slice(0, 57) + "…" : v];
  }
  function passes(sh, f, r) {
    if (!f) return true;
    if (f.op === "open") return !BT.isDoneRow(sh, r);
    if (f.op === "closed") return BT.isDoneRow(sh, r);
    if (f.op === "overdue") return BT.rowState(sh, r).breach;
    if (f.op === "important") return !!r.imp;
    const c = col(sh, f.col); if (!c) return true;
    const vs = cats(sh, c, r), want = arr(f.values).map(x => String(x).toLowerCase());
    if (f.op === "empty") return vs[0] === EMPTY;
    if (f.op === "notempty") return vs[0] !== EMPTY;
    const hit = vs.some(v => want.includes(v.toLowerCase()));
    if (f.op === "notin") return !hit;
    if (f.op === "gt" || f.op === "lt") { const n = num(sh, c, r); return n != null && (f.op === "gt" ? n > +f.values[0] : n < +f.values[0]); }
    return hit; // "in"
  }
  function filtered(sh, w, extra) { return rowsFor(sh.id).filter(r => arr(w.filter).every(f => passes(sh, f, r)) && (!extra || arr(extra).every(f => passes(sh, f, r)))); }
  function agg(sh, w, rows) {
    const m = w.metric || "count"; if (m === "count") return rows.length;
    const c = col(sh, w.valueCol); if (!c) return null;
    const ns = rows.map(r => num(sh, c, r)).filter(n => n != null); if (!ns.length) return null;
    if (m === "sum") return ns.reduce((a, b) => a + b, 0);
    if (m === "avg") return ns.reduce((a, b) => a + b, 0) / ns.length;
    if (m === "min") return Math.min(...ns);
    if (m === "max") return Math.max(...ns);
    return rows.length;
  }
  function stageOrder(sh, c) {
    const sc = BT.statusCol(sh); if (!sc || sc.id !== c.id) return c.type === "select" ? arr(c.options) : null;
    try { return BT.statusesOf(BT.tid(sh)).map(x => x.name); } catch (e) { return arr(c.options); }
  }
  /* Problems that stop a widget from rendering — shown as a clear message, never as wrong numbers */
  function problem(w) {
    if (w.groupBy === "@sheet") { const ok = arr(w.sheets).filter(id => S().sheets[id]); if (!ok.length) return "The sheets compared by this chart were deleted or aren't shared with you."; if (!S().sheets[w.sheetId]) w.sheetId = ok[0]; return w.metric && w.metric !== "count" && !w.valueCol ? "Pick a number column." : null; }
    const sh = sheet(w.sheetId);
    if (!sh) return `The source sheet for this chart was deleted or isn't shared with you.`;
    const need = [["groupBy", "group by"], ["stackBy", "split by"], ["dateCol", "date"], ["valueCol", "value"]];
    for (const [k, l] of need) if (w[k] && !col(sh, w[k])) return `The ${l} column used by this chart no longer exists in “${esc(sh.name)}”. Edit the chart to pick another column.`;
    for (const f of arr(w.filter)) if (f.col && !col(sh, f.col)) return `A filter column no longer exists in “${esc(sh.name)}”. Edit the chart.`;
    if (w.metric && w.metric !== "count" && !w.valueCol) return `Pick a number column for ${METRICS[w.metric] || w.metric}.`;
    if (["bar", "hbar", "pie", "donut", "table", "stacked"].includes(w.type) && !w.groupBy) return `Pick a column to group by.`;
    if (w.type === "stacked" && !w.stackBy) return `Pick a column to split the bars by.`;
    if (w.type === "line" && !w.dateCol) return `Pick a date column for the trend.`;
    return null;
  }
  /* ---------- computing a widget ---------- */
  function compute(w) {
    const sh = sheet(w.sheetId), rows = filtered(sh, w);
    if (w.type === "kpi") {
      if (w.kpi?.mode === "pct") { const part = filtered(sh, w, w.kpi.where).length; return {kpi: rows.length ? part / rows.length * 100 : null, pct: true, sub: `${part} of ${rows.length}`, rows}; }
      const v = agg(sh, w, rows); return {kpi: v, sub: w.metric && w.metric !== "count" ? `${METRICS[w.metric]} of ${esc(col(sh, w.valueCol)?.label || "")} · ${rows.length} entries` : `entries${arr(w.filter).length ? " matching" : ""}`, rows};
    }
    if (w.type === "line") {
      const dc = col(sh, w.dateCol), pts = rows.map(r => ({d: dateOf((r.cells || {})[dc.id]), r})).filter(x => x.d);
      if (!pts.length) return {empty: `No dates in “${esc(dc.label)}” yet.`};
      const min = Math.min(...pts.map(p => +p.d)), max = Math.max(...pts.map(p => +p.d)), span = (max - min) / 864e5;
      const bucket = w.bucket || (span > 150 ? "month" : span > 21 ? "week" : "day");
      const key = d => { if (bucket === "month") return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"); const x = new Date(d); if (bucket === "week") x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x.toISOString().slice(0, 10); };
      const lab = k => bucket === "month" ? new Date(k + "-01T00:00:00").toLocaleDateString(undefined, {month: "short", year: "2-digit"}) : new Date(k + "T00:00:00").toLocaleDateString(undefined, {day: "numeric", month: "short"});
      const keys = []; { const d = new Date(min); if (bucket === "month") d.setDate(1); if (bucket === "week") d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); for (let i = 0; i < 400 && +d <= max; i++) { keys.push(key(d)); if (bucket === "month") d.setMonth(d.getMonth() + 1); else d.setDate(d.getDate() + (bucket === "week" ? 7 : 1)); } }
      const sc = col(sh, w.stackBy), groups = new Map();
      for (const p of pts) { const s0 = sc ? cats(sh, sc, p.r)[0] : "All"; if (!groups.has(s0)) groups.set(s0, new Map()); const g = groups.get(s0), k = key(p.d); if (!g.has(k)) g.set(k, []); g.get(k).push(p.r); }
      let series = [...groups.entries()].map(([name, g]) => ({name, vals: keys.map(k => { const rs = g.get(k) || []; return w.metric && w.metric !== "count" ? agg(sh, w, rs) ?? 0 : rs.length; })}));
      if (w.cumulative) series.forEach(s0 => { let t = 0; s0.vals = s0.vals.map(v => (t += v || 0)); });
      series = series.sort((a, b) => b.vals.reduce((x, y) => x + y, 0) - a.vals.reduce((x, y) => x + y, 0)).slice(0, 5);
      return {labels: keys.map(lab), series, bucket};
    }
    if (w.groupBy === "@sheet") {
      const items = arr(w.sheets).map(sid => sheet(sid)).filter(Boolean).map(s2 => { const rs = filtered(s2, {...w, filter: arr(w.filter).filter(f => !f.col)}); const vc = w.valueCol && col(s2, w.valueCol) ? w : {...w, metric: "count"}; return {k: s2.name, rows: rs, v: agg(s2, vc, rs) ?? 0, sid: s2.id}; }).sort((a, b) => b.v - a.v);
      return {items, gc: null};
    }
    const gc = col(sh, w.groupBy), groups = new Map();
    for (const r of rows) for (const k of cats(sh, gc, r)) { if (!groups.has(k)) groups.set(k, []); groups.get(k).push(r); }
    if (!groups.size) return {empty: `No entries${arr(w.filter).length ? " match this chart's filter" : ` in “${esc(sh.name)}”`} yet.`};
    const order = stageOrder(sh, gc);
    let items = [...groups.entries()].map(([k, rs]) => ({k, rows: rs, v: agg(sh, w, rs) ?? 0}));
    if (order && order.length && w.sort !== "value") { const ix = k => { const i = order.findIndex(o => String(o).toLowerCase() === k.toLowerCase()); return i < 0 ? 999 : i; }; items.sort((a, b) => ix(a.k) - ix(b.k) || b.v - a.v); }
    else items.sort((a, b) => b.v - a.v);
    if (gc.type === "date") items.sort((a, b) => (dateOf("1 " + a.k) || 0) - (dateOf("1 " + b.k) || 0));
    const top = +w.top || (w.type === "pie" || w.type === "donut" ? 6 : 12);
    if (items.length > top) { const rest = items.slice(top - 1); items = items.slice(0, top - 1); const rr = rest.flatMap(x => x.rows); items.push({k: OTHER, rows: rr, v: agg(sh, w, rr) ?? 0, other: rest.map(x => x.k)}); }
    if (w.type === "stacked") {
      const sc = col(sh, w.stackBy), sNames = new Map();
      items.forEach(it => it.rows.forEach(r => cats(sh, sc, r).forEach(k => sNames.set(k, (sNames.get(k) || 0) + 1))));
      const so = stageOrder(sh, sc); let names = [...sNames.keys()];
      names = so && so.length ? names.sort((a, b) => { const ia = so.indexOf(a), ib = so.indexOf(b); return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib); }) : names.sort((a, b) => sNames.get(b) - sNames.get(a));
      if (names.length > 8) names = [...names.slice(0, 7), OTHER];
      items.forEach(it => { it.parts = names.map(n => ({n, rows: it.rows.filter(r => { const ks = cats(sh, sc, r); return n === OTHER ? !ks.some(k => names.slice(0, 7).includes(k)) : ks.includes(n); })})); it.parts.forEach(p => p.v = p.rows.length); });
      return {items, names, sc, gc};
    }
    return {items, gc};
  }
  /* ---------- colour per value, stable across charts ---------- */
  const CMAP = new Map();
  function colorFor(sh, c, k, i) {
    if (k === EMPTY) return "#B8C2BF"; if (k === OTHER) return "#9AA5A1";
    const sc = c && BT.statusCol(sh);
    if (sc && sc.id === c.id) { const m = BT.STATUS_META.get(String(k).trim().toLowerCase()); if (m) { const t = (BT.STATUS_CATS[m.cat] || {}).tone; const base = {good: "#167E57", warn: "#C98512", bad: "#BF3A31", info: "#2F5DA8", neu: "#7B8A86"}[t] || PALETTE[i % PALETTE.length]; return base; } }
    const key = (c?.id || "") + "|" + k; if (!CMAP.has(key)) { const n = [...CMAP.keys()].filter(x => x.startsWith((c?.id || "") + "|")).length; CMAP.set(key, PALETTE[n % PALETTE.length]); }
    return CMAP.get(key);
  }
  /* ---------- drawing (HTML + inline SVG, no chart library) ---------- */
  const drill = (w, k, it) => k === OTHER ? "" : it && it.sid ? ` data-drill="${esc(it.sid)}" data-dcol="" data-dval=""` : ` data-drill="${esc(w.sheetId)}" data-dcol="${esc(w.groupBy || "")}" data-dval="${esc(k)}"`;
  function drawKPI(w, d) {
    const v = d.kpi; const txt = v == null ? "–" : d.pct ? Math.round(v) + "%" : fmt(v);
    return `<div class="k-val ${d.pct && v != null ? (v >= 75 ? "t-good" : v >= 40 ? "t-warn" : "t-bad") : ""}">${txt}</div><div class="k-sub">${d.sub || ""}</div>${d.pct && v != null ? `<div class="k-bar"><i style="width:${Math.min(100, v)}%"></i></div>` : ""}`;
  }
  function drawHBar(w, d, sh) {
    const max = Math.max(...d.items.map(x => x.v), 1);
    return `<div class="hb">${d.items.map((it, i) => `<button type="button" class="hb-row"${drill(w, it.k, it)} title="${esc(it.k)}: ${fmt(it.v)}${it.other ? " (" + it.other.length + " smaller groups)" : ""}"><span class="hb-l">${esc(it.k)}</span><span class="hb-t"><i style="width:${Math.max(1.5, it.v / max * 100)}%;background:${colorFor(sh, d.gc, it.k, i)}"></i></span><span class="hb-v">${fmt(it.v)}</span></button>`).join("")}</div>`;
  }
  function drawCols(w, d, sh) {
    const max = Math.max(...d.items.map(x => x.v), 1);
    return `<div class="cb" style="--n:${d.items.length}">${d.items.map((it, i) => `<button type="button" class="cb-c"${drill(w, it.k, it)} title="${esc(it.k)}: ${fmt(it.v)}"><span class="cb-v">${fmt(it.v)}</span><span class="cb-t"><i style="height:${Math.max(1.5, it.v / max * 100)}%;background:${colorFor(sh, d.gc, it.k, i)}"></i></span><span class="cb-l">${esc(it.k)}</span></button>`).join("")}</div>`;
  }
  function drawPie(w, d, sh, donut) {
    const tot = d.items.reduce((a, b) => a + b.v, 0) || 1; let a0 = -Math.PI / 2;
    const R = 80, r0 = donut ? 48 : 0, cx = 90, cy = 90;
    const arcs = d.items.map((it, i) => { const a1 = a0 + it.v / tot * Math.PI * 2, large = a1 - a0 > Math.PI ? 1 : 0, c = colorFor(sh, d.gc, it.k, i);
      const p = (r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)].map(n => n.toFixed(2)).join(" ");
      let path; if (it.v / tot > 0.9999) path = donut ? `M ${cx} ${cy - R} A ${R} ${R} 0 1 1 ${cx - .01} ${cy - R} Z M ${cx} ${cy - r0} A ${r0} ${r0} 0 1 0 ${cx + .01} ${cy - r0} Z` : `M ${cx} ${cy - R} A ${R} ${R} 0 1 1 ${cx - .01} ${cy - R} Z`;
      else path = donut ? `M ${p(R, a0)} A ${R} ${R} 0 ${large} 1 ${p(R, a1)} L ${p(r0, a1)} A ${r0} ${r0} 0 ${large} 0 ${p(r0, a0)} Z` : `M ${cx} ${cy} L ${p(R, a0)} A ${R} ${R} 0 ${large} 1 ${p(R, a1)} Z`;
      a0 = a1; return `<path d="${path}" style="fill:${c}" fill-rule="evenodd"${drill(w, it.k, it)} class="pz"><title>${esc(it.k)}: ${fmt(it.v)} (${Math.round(it.v / tot * 100)}%)</title></path>`; }).join("");
    return `<div class="pie"><svg viewBox="0 0 180 180" role="img" aria-label="${esc(w.title || "")}">${arcs}${donut ? `<text x="90" y="88" text-anchor="middle" class="pc-n">${fmt(tot)}</text><text x="90" y="106" text-anchor="middle" class="pc-l">total</text>` : ""}</svg>
      <div class="lg">${d.items.map((it, i) => `<button type="button" class="lg-i"${drill(w, it.k, it)}><i style="background:${colorFor(sh, d.gc, it.k, i)}"></i><span>${esc(it.k)}</span><b>${fmt(it.v)}</b><small>${Math.round(it.v / tot * 100)}%</small></button>`).join("")}</div></div>`;
  }
  function drawStacked(w, d, sh) {
    const max = Math.max(...d.items.map(x => x.parts.reduce((a, b) => a + b.v, 0)), 1);
    return `<div class="lg lg-row">${d.names.map((n, i) => `<span class="lg-i"><i style="background:${colorFor(sh, d.sc, n, i)}"></i><span>${esc(n)}</span></span>`).join("")}</div>
      <div class="hb">${d.items.map(it => { const t = it.parts.reduce((a, b) => a + b.v, 0); return `<div class="hb-row"><span class="hb-l" title="${esc(it.k)}">${esc(it.k)}</span><span class="hb-t sb">${it.parts.filter(p => p.v).map((p, i) => `<i style="width:${p.v / max * 100}%;background:${colorFor(sh, d.sc, p.n, d.names.indexOf(p.n))}" title="${esc(it.k)} · ${esc(p.n)}: ${p.v}"></i>`).join("")}</span><span class="hb-v">${fmt(t)}</span></div>`; }).join("")}</div>`;
  }
  function drawLine(w, d) {
    const sz = w.size || 2, W = sz >= 4 ? 1100 : sz === 1 ? 320 : 600, H = sz >= 4 ? 250 : 230, pl = 36, pr = 12, pt = 12, pb = 30, n = d.labels.length;
    const max = Math.max(1, ...d.series.flatMap(s0 => s0.vals)), x = i => pl + (n <= 1 ? (W - pl - pr) / 2 : i * (W - pl - pr) / (n - 1)), y = v => pt + (H - pt - pb) * (1 - v / max);
    const ticks = [0, .5, 1].map(f => Math.round(max * f));
    const every = Math.ceil(n / (sz >= 4 ? 14 : sz === 1 ? 4 : 8));
    const lines = d.series.map((s0, si) => { const c = PALETTE[si % PALETTE.length]; const pts = s0.vals.map((v, i) => `${x(i).toFixed(1)},${y(v || 0).toFixed(1)}`).join(" ");
      return `${d.series.length === 1 ? `<polygon points="${x(0)},${y(0)} ${pts} ${x(n - 1)},${y(0)}" style="fill:${c};opacity:.12"/>` : ""}<polyline points="${pts}" style="fill:none;stroke:${c};stroke-width:2.5;stroke-linejoin:round"/>${s0.vals.map((v, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(v || 0).toFixed(1)}" r="${n > 30 ? 0 : 3.2}" style="fill:${c}"><title>${esc(d.labels[i])}${d.series.length > 1 ? " · " + esc(s0.name) : ""}: ${fmt(v)}</title></circle>`).join("")}`; }).join("");
    return `${d.series.length > 1 ? `<div class="lg lg-row">${d.series.map((s0, i) => `<span class="lg-i"><i style="background:${PALETTE[i % PALETTE.length]}"></i><span>${esc(s0.name)}</span></span>`).join("")}</div>` : ""}
      <svg class="ln" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(w.title || "")}">${ticks.map(t => `<line x1="${pl}" x2="${W - pr}" y1="${y(t)}" y2="${y(t)}" class="gl"/><text x="${pl - 6}" y="${y(t) + 4}" text-anchor="end" class="ax">${fmt(t)}</text>`).join("")}${lines}${d.labels.map((l, i) => i % every === 0 ? `<text x="${x(i)}" y="${H - 8}" text-anchor="middle" class="ax">${esc(l)}</text>` : "").join("")}</svg>`;
  }
  function drawTable(w, d, sh) {
    const tot = d.items.reduce((a, b) => a + b.v, 0) || 1;
    return `<table class="tl"><tbody>${d.items.map((it, i) => `<tr${drill(w, it.k, it)}><td><i style="background:${colorFor(sh, d.gc, it.k, i)}"></i>${esc(it.k)}</td><td>${fmt(it.v)}</td><td>${Math.round(it.v / tot * 100)}%</td></tr>`).join("")}</tbody></table>`;
  }
  function body(w) {
    const p = problem(w); if (p) return `<div class="dw-err">${p}</div>`;
    let d; try { d = compute(w); } catch (e) { console.error(e); return `<div class="dw-err">This chart couldn't be calculated: ${esc(e.message)}</div>`; }
    if (d.empty) return `<div class="dw-empty">${d.empty}</div>`;
    const sh = sheet(w.sheetId);
    if (w.type === "kpi") return drawKPI(w, d);
    if (w.type === "line") return drawLine(w, d);
    if (w.type === "pie" || w.type === "donut") return drawPie(w, d, sh, w.type === "donut");
    if (w.type === "stacked") return drawStacked(w, d, sh);
    if (w.type === "table") return drawTable(w, d, sh);
    if (w.type === "bar" && d.items.length <= 10) return drawCols(w, d, sh);
    return drawHBar(w, d, sh);
  }
  function describe(w) {
    const sh = sheet(w.sheetId); if (!sh) return "";
    const L = id => esc(col(sh, id)?.label || "?");
    const m = !w.metric || w.metric === "count" ? "count" : `${w.metric} of ${L(w.valueCol)}`;
    if (w.groupBy === "@sheet") return `${arr(w.sheets).filter(id => S().sheets[id]).length} sheets compared · ${w.metric && w.metric !== "count" ? esc(w.metric) : "count"}${arr(w.filter).some(f => f.op === "open") ? " · open only" : ""}`;
    const by = w.type === "kpi" ? "" : w.type === "line" ? ` over ${L(w.dateCol)}` : ` by ${L(w.groupBy)}${w.stackBy ? ` × ${L(w.stackBy)}` : ""}`;
    const f = arr(w.filter).map(x => ({open: "open only", closed: "closed only", overdue: "ETA crossed", important: "important"})[x.op] || (x.col ? `${L(x.col)} ${x.op === "notin" ? "≠" : x.op === "empty" ? "empty" : x.op === "notempty" ? "filled" : "="} ${arr(x.values).slice(0, 2).map(esc).join("/")}` : "")).filter(Boolean);
    return `${esc(sh.name)} · ${m}${by}${f.length ? " · " + f.join(", ") : ""}`;
  }
  function widgetHTML(w, i, n, canEdit) {
    const sz = w.type === "kpi" ? (w.size || 1) : (w.size || 2);
    return `<section class="dw ${w.type === "kpi" ? "is-kpi" : ""}" style="--span:${sz}" data-w="${esc(w.id)}" ${UI.edit && canEdit ? `draggable="true"` : ""} aria-label="${esc(w.title || TYPES[w.type])}">
      <header class="dw-h"><div class="dw-t"><h3>${esc(w.title || TYPES[w.type])}</h3><small>${describe(w)}</small></div>
        <div class="dw-a">${w.why ? `<button type="button" class="dw-ib" data-dwa="why" aria-pressed="${UI.why.has(w.id)}" title="Why this chart?" aria-label="Why this chart?">i</button>` : ""}
        ${UI.edit && canEdit ? `<button type="button" class="dw-ib" data-dwa="left" ${i === 0 ? "disabled" : ""} title="Move earlier" aria-label="Move earlier">‹</button><button type="button" class="dw-ib" data-dwa="right" ${i === n - 1 ? "disabled" : ""} title="Move later" aria-label="Move later">›</button><button type="button" class="dw-ib" data-dwa="size" title="Change size" aria-label="Change size">⇔</button><button type="button" class="dw-ib" data-dwa="edit" title="Edit chart" aria-label="Edit chart">✎</button><button type="button" class="dw-ib red" data-dwa="remove" title="Remove from dashboard" aria-label="Remove">✕</button>` : ""}</div></header>
      ${w.why && UI.why.has(w.id) ? `<p class="dw-why">${esc(w.why)}</p>` : ""}
      <div class="dw-b dw-${w.type}">${body(w)}</div></section>`;
  }
  /* ---------- dashboard model ---------- */
  const dashList = tId => Object.entries(S().dashboards || {}).filter(([, d]) => (d.trackerId || "bcp") === tId && d.type !== "sheetshare").map(([id, d]) => ({id, ...d})).sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || String(a.createdAt).localeCompare(String(b.createdAt)));
  const cur = () => { const d = S().dashboards[S().dashId]; return d ? {id: S().dashId, ...d, widgets: arr(d.widgets), sheets: arr(d.sheets)} : null; };
  const canEdit = () => !window.BT_COLLAB || window.BT_COLLAB.role === "owner";
  async function saveDash(id, patch, msg) {
    const prev = S().dashboards[id], snaps = BT.snap("dashboards", [id]);
    const next = {...(prev || {}), ...patch, updatedAt: new Date().toISOString()};
    await BT.store.put("dashboards", id, next); BT.render(); if (msg) BT.pushUndo(msg, snaps);
  }
  async function createDashboard({name, trackerId, sheets, widgets}) {
    const id = BT.uid("d"), order = dashList(trackerId).length;
    const ws = arr(widgets).map(w => ({...w, id: w.id || BT.uid("w")}));
    await BT.store.put("dashboards", id, {name: name || "Dashboard", trackerId, sheets: arr(sheets), widgets: ws, order, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()});
    S().view = "dash"; S().dashId = id; BT.render(); window.scrollTo(0, 0);
    BT.pushUndo(`Dashboard “${name}” created with ${ws.length} chart${ws.length === 1 ? "" : "s"}`, [["dashboards", id, null]]);
    return id;
  }
  async function addWidgets(id, widgets) {
    const d = S().dashboards[id]; if (!d) return;
    const ws = [...arr(d.widgets), ...arr(widgets).map(w => ({...w, id: BT.uid("w")}))];
    const sheets = [...new Set([...arr(d.sheets), ...ws.map(w => w.sheetId)])];
    await saveDash(id, {widgets: ws, sheets}, `${arr(widgets).length} chart${arr(widgets).length === 1 ? "" : "s"} added`);
  }
  /* ---------- views ---------- */
  function navHTML() { return window.BTShare?.navHTML ? window.BTShare.navHTML() : ""; }
  function tabsHTML() {
    const t = BT.curTracker(); if (!t) return "";
    return dashList(t.id).map(d => `<span class="tabw"><button type="button" class="tab dtab" data-dash="${esc(d.id)}" aria-selected="${S().view === "dash" && S().dashId === d.id}" title="Dashboard · ${esc(d.name)}"><span class="dico">${DICON}</span><span class="nm">${esc(d.name)}</span></button></span>`).join("");
  }
  function sideHTML() {
    const t = BT.curTracker(); if (!t) return "";
    return dashList(t.id).map(d => `<button type="button" data-dash="${esc(d.id)}" aria-current="${S().view === "dash" && S().dashId === d.id}"><span class="dico">${DICON}</span><span class="nm">${esc(d.name)}</span><span class="ct">${arr(d.widgets).length}</span></button>`).join("") + (canEdit() ? `<button type="button" class="dnew" data-act="newdash">${DICON} New dashboard</button>` : "");
  }
  const sourceSheets = d => [...new Set([...arr(d.sheets), ...arr(d.widgets).flatMap(w => [w.sheetId, ...arr(w.sheets)])])].filter(id => id && S().sheets[id]);
  const DICON = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>';
  function renderView(main) {
    MEMO = null;
    const d = cur(); if (!d) return;
    const t = BT.curTracker(), ed = canEdit();
    const srcs = [...new Set(d.widgets.map(w => w.sheetId).concat(d.sheets))].filter(Boolean);
    const live = srcs.map(sid => S().sheets[sid]?.name).filter(Boolean);
    const total = srcs.reduce((a, sid) => a + (S().sheets[sid] ? rowsFor(sid).length : 0), 0);
    main.innerHTML = BT.topbar(`<span class="cr-proj"><i style="background:${BT.trackerColor(t)}"></i>${esc(t?.name || "")}</span><span class="cr-sep">/</span><b>${esc(d.name)}</b>`) + `
      <div class="dh" data-title="${esc(d.name)} · ${esc(new Date().toLocaleDateString(undefined, {day: "numeric", month: "short", year: "numeric"}))}">
        <div class="dh-l"><span class="dh-live" title="Charts recalculate whenever the source sheets change"><i></i>Live</span><span class="dh-src">${live.length ? `From ${live.slice(0, 4).map(n => `<b>${esc(n)}</b>`).join(", ")}${live.length > 4 ? ` +${live.length - 4}` : ""} · ${total} entries` : "No source sheets yet"}</span>${window.BT_COLLAB ? `<span class="dh-role">${window.BT_COLLAB.role === "edit" ? "You can edit the data" : window.BT_COLLAB.role === "view" ? "View only" : ""}</span>` : ""}</div>
        <div class="dh-r">${ed ? `<button class="btn primary" type="button" data-act="dashsuggest">${BT.ICON.spark} Suggest charts</button><button class="btn" type="button" data-act="dashkpi">${BT.ICON.plus} KPI</button><button class="btn" type="button" data-act="dashadd">${BT.ICON.plus} Chart</button><button class="btn ${UI.edit ? "on" : ""}" type="button" data-act="dashedit" aria-pressed="${UI.edit}">${UI.edit ? "Done" : "Edit layout"}</button>` : ""}
          <button class="btn" type="button" data-act="export" title="Excel with charts, or PDF">${BT.ICON.dl} Download</button>
          ${window.BTShare?.dashButton ? window.BTShare.dashButton(d) : ""}
          ${ed ? `<button class="btn ghost" type="button" data-act="dashmenu" aria-label="More">⋯</button>` : ""}</div>
      </div>
      ${UI.edit && ed ? `<div class="dh-tip">Drag charts to rearrange, or use ‹ ›. ⇔ changes the size. ✕ removes a chart (Undo brings it back).</div>` : ""}
      ${d.widgets.length ? `<div class="dg" id="dgrid">${d.widgets.map((w, i) => widgetHTML(w, i, d.widgets.length, ed)).join("")}</div>`
        : `<div class="emptystate"><h3>No charts yet</h3><p>Let the assistant study ${srcs.length ? "the source sheets" : "your sheets"} and suggest KPIs and charts, or build one yourself.</p>${ed ? `<div class="row2" style="justify-content:center;flex:none"><button class="btn primary" type="button" data-act="dashsuggest" style="flex:none">${BT.ICON.spark} Suggest charts</button><button class="btn" type="button" data-act="dashadd" style="flex:none">${BT.ICON.plus} Add a chart</button></div>` : ""}</div>`}`;
    MEMO = null;
  }
  /* ---------- chart builder (manual add / edit) ---------- */
  function openBuilder(w0, onDone, preset) {
    const d = cur(), t = BT.curTracker(); if (!t) return;
    const sheets = BT.sheetList(t.id); if (!sheets.length) { BT.toast("Add a sheet first"); return; }
    const firstSheet = (d && sourceSheets(d)[0]) || (BT.S.view === "sheet" && BT.S.sheetId) || sheets[0].id;
    const w = {type: "bar", metric: "count", sheetId: firstSheet, filter: [], ...(preset || {}), ...(w0 ? JSON.parse(JSON.stringify(w0)) : {})};
    w.filter = arr(w.filter);
    const colOpts = (sh, pred, sel, none) => `${none ? `<option value="">${none}</option>` : ""}${(sh?.columns || []).filter(pred).map(c => `<option value="${esc(c.id)}" ${c.id === sel ? "selected" : ""}>${esc(c.label)} · ${esc(BT.TYPES[c.type] || c.type)}</option>`).join("")}`;
    const isNum = c => c.type === "number" || c.type === "calc";
    const draw = root => {
      const sh = sheet(w.sheetId);
      root.querySelector("#cb_form").innerHTML = `
        <div class="row2"><div class="field" style="flex:1"><label for="cb_sheet">Data from</label><select class="inp" id="cb_sheet">${sheets.map(s0 => `<option value="${esc(s0.id)}" ${s0.id === w.sheetId ? "selected" : ""}>${esc(s0.name)}</option>`).join("")}</select></div>
        <div class="field" style="flex:1"><label for="cb_type">Chart type</label><select class="inp" id="cb_type">${Object.entries(TYPES).map(([k, l]) => `<option value="${k}" ${k === w.type ? "selected" : ""}>${l}</option>`).join("")}</select></div></div>
        <div class="field"><label for="cb_title">Title</label><input class="inp" id="cb_title" value="${esc(w.title || "")}" placeholder="e.g. Open items by status"></div>
        ${w.type === "line" ? `<div class="row2"><div class="field" style="flex:1"><label for="cb_date">Date column</label><select class="inp" id="cb_date">${colOpts(sh, c => c.type === "date", w.dateCol, "Choose…")}</select></div><div class="field" style="flex:1"><label for="cb_bucket">Group dates by</label><select class="inp" id="cb_bucket">${[["", "Automatic"], ["day", "Day"], ["week", "Week"], ["month", "Month"]].map(([k, l]) => `<option value="${k}" ${(w.bucket || "") === k ? "selected" : ""}>${l}</option>`).join("")}</select></div></div>
          <div class="row2"><div class="field" style="flex:1"><label for="cb_stack">Separate lines by <span class="typ">optional</span></label><select class="inp" id="cb_stack">${colOpts(sh, c => c.type === "select" || c.type === "text", w.stackBy, "One line")}</select></div><label class="ck" style="align-self:end;padding-bottom:10px"><input type="checkbox" id="cb_cum" ${w.cumulative ? "checked" : ""}> Running total</label></div>`
        : w.type === "kpi" ? `<div class="field"><label for="cb_kmode">Show</label><select class="inp" id="cb_kmode"><option value="value" ${w.kpi?.mode !== "pct" ? "selected" : ""}>A number (count, sum, average…)</option><option value="pct" ${w.kpi?.mode === "pct" ? "selected" : ""}>A percentage of entries</option></select></div>
          ${w.kpi?.mode === "pct" ? `<div class="field"><label>Percentage of entries where</label>${filterRow(sh, (w.kpi.where || [])[0] || {}, "kw")}</div>` : ""}`
        : `<div class="row2"><div class="field" style="flex:1"><label for="cb_group">Group by</label><select class="inp" id="cb_group">${colOpts(sh, c => c.type !== "long", w.groupBy, "Choose…")}</select></div>
          ${w.type === "stacked" ? `<div class="field" style="flex:1"><label for="cb_stack">Split each bar by</label><select class="inp" id="cb_stack">${colOpts(sh, c => c.type === "select" || c.type === "text", w.stackBy, "Choose…")}</select></div>` : ""}</div>`}
        ${w.type !== "stacked" && !(w.type === "kpi" && w.kpi?.mode === "pct") ? `<div class="row2"><div class="field" style="flex:1"><label for="cb_metric">Measure</label><select class="inp" id="cb_metric">${Object.entries(METRICS).map(([k, l]) => `<option value="${k}" ${k === (w.metric || "count") ? "selected" : ""}>${l}</option>`).join("")}</select></div>
          ${w.metric && w.metric !== "count" ? `<div class="field" style="flex:1"><label for="cb_value">Of column</label><select class="inp" id="cb_value">${colOpts(sh, isNum, w.valueCol, "Choose a number column…")}</select></div>` : ""}</div>` : ""}
        <div class="field"><label>Only include entries where <span class="typ">optional</span></label>${filterRow(sh, w.filter[0] || {}, "f")}</div>
        <div class="field"><span class="lbl">Preview</span><div class="cb-prev dw-b dw-${w.type}" id="cb_prev"></div></div>`;
      const prev = root.querySelector("#cb_prev"); MEMO = null; prev.innerHTML = body({...w, id: "preview"}); MEMO = null;
    };
    const read = root => {
      const g = sel => root.querySelector(sel)?.value;
      const nt = g("#cb_type"), ns = g("#cb_sheet");
      if (ns && ns !== w.sheetId) { w.sheetId = ns; w.groupBy = w.stackBy = w.dateCol = w.valueCol = null; w.filter = []; }
      if (nt) w.type = nt;
      w.title = g("#cb_title") ?? w.title;
      if (root.querySelector("#cb_group")) w.groupBy = g("#cb_group") || null;
      if (root.querySelector("#cb_stack")) w.stackBy = g("#cb_stack") || null;
      if (root.querySelector("#cb_date")) { w.dateCol = g("#cb_date") || null; w.bucket = g("#cb_bucket") || null; w.cumulative = !!root.querySelector("#cb_cum")?.checked; }
      if (root.querySelector("#cb_metric")) w.metric = g("#cb_metric");
      if (root.querySelector("#cb_value")) w.valueCol = g("#cb_value") || null;
      if (root.querySelector("#cb_kmode")) { const m = g("#cb_kmode"); w.kpi = {mode: m, where: m === "pct" ? [readFilter(root, "kw")].filter(Boolean) : []}; if (m === "pct") w.metric = "count"; }
      w.filter = [readFilter(root, "f")].filter(Boolean);
    };
    BT.openDialog({
      eyebrow: d ? d.name : "Dashboard", title: w0 ? (w0.type === "kpi" ? "Edit KPI" : "Edit chart") : preset?.type === "kpi" ? "Add a KPI" : "Add a chart", saveLabel: w0 ? "Save" : "Add to dashboard",
      body: () => `<div id="cb_form" class="cbf"></div>`,
      mount: root => { draw(root); root.addEventListener("change", () => { read(root); draw(root); }); root.addEventListener("input", e => { if (e.target.id === "cb_title") w.title = e.target.value; }); },
      onSave: async root => {
        read(root); const p = problem(w); if (p) { BT.toast(p.replace(/<[^>]+>/g, "")); return false; }
        if (!w.title) w.title = autoTitle(w);
        if (onDone) return onDone(w);
      }
    });
  }
  function filterRow(sh, f, k) {
    const c = col(sh, f.col);
    const vals = c ? [...new Set(rowsFor(sh.id).flatMap(r => cats(sh, c, r)))].slice(0, 200) : [];
    return `<div class="row2 frow"><select class="inp" id="${k}_col"><option value="">No filter</option><option value="@open" ${f.op === "open" ? "selected" : ""}>Open entries (not closed)</option><option value="@closed" ${f.op === "closed" ? "selected" : ""}>Closed entries</option><option value="@overdue" ${f.op === "overdue" ? "selected" : ""}>ETA crossed</option><option value="@important" ${f.op === "important" ? "selected" : ""}>Marked important</option>${(sh?.columns || []).filter(x => x.type !== "long").map(x => `<option value="${esc(x.id)}" ${x.id === f.col ? "selected" : ""}>${esc(x.label)}</option>`).join("")}</select>
      ${c ? `<select class="inp" id="${k}_op" style="flex:none;width:auto"><option value="in" ${f.op === "in" ? "selected" : ""}>is</option><option value="notin" ${f.op === "notin" ? "selected" : ""}>is not</option><option value="notempty" ${f.op === "notempty" ? "selected" : ""}>is filled</option><option value="empty" ${f.op === "empty" ? "selected" : ""}>is empty</option></select>
      ${f.op === "empty" || f.op === "notempty" ? "" : `<select class="inp" id="${k}_val">${vals.map(v => `<option ${arr(f.values).includes(v) ? "selected" : ""}>${esc(v)}</option>`).join("")}</select>`}` : ""}</div>`;
  }
  function readFilter(root, k) {
    const c = root.querySelector(`#${k}_col`)?.value; if (!c) return null;
    if (c[0] === "@") return {op: c.slice(1)};
    const op = root.querySelector(`#${k}_op`)?.value || "in", v = root.querySelector(`#${k}_val`)?.value;
    return {col: c, op, values: v != null ? [v] : []};
  }
  function autoTitle(w) {
    const sh = sheet(w.sheetId); const L = id => col(sh, id)?.label || "";
    if (w.type === "kpi") return w.kpi?.mode === "pct" ? "% of entries" : w.metric && w.metric !== "count" ? `${METRICS[w.metric]} of ${L(w.valueCol)}` : "Entries";
    if (w.type === "line") return `Entries over time (${L(w.dateCol)})`;
    if (w.type === "stacked") return `${L(w.groupBy)} by ${L(w.stackBy)}`;
    return `${w.metric && w.metric !== "count" ? METRICS[w.metric] + " of " + L(w.valueCol) : "Entries"} by ${L(w.groupBy)}`;
  }
  /* ---------- events ---------- */
  document.addEventListener("click", async e => {
    const nav = e.target.closest("[data-dash]");
    if (nav) { S().view = "dash"; S().dashId = nav.dataset.dash; UI.edit = false; BT.render(); window.scrollTo(0, 0); return; }
    const dr = e.target.closest("[data-drill]");
    if (dr && !UI.edit && !e.target.closest("#dlg")) {
      const sid = dr.dataset.drill, cid = dr.dataset.dcol, v = dr.dataset.dval; if (!S().sheets[sid]) return;
      const sh = sheet(sid), c = col(sh, cid);
      if (c && c.type === "select" && v) { S().filters = S().filters || {}; S().filters[sid] = [{col: cid, op: "in", val: [v === EMPTY ? "(Empty)" : v]}]; BT.saveFilters && BT.saveFilters(); }
      S().view = "sheet"; S().sheetId = sid; S().q = c && c.type !== "select" && v !== EMPTY ? v : ""; BT.render(); window.scrollTo(0, 0);
      BT.toast(c && c.type === "select" ? `Showing “${v}” in ${sh.name}. Clear the filter to see everything.` : `Opened ${sh.name}`); return;
    }
    const a = e.target.closest("[data-act]")?.dataset.act;
    const d = cur();
    if (a === "newdash") { window.BTAI ? window.BTAI.openWizard() : openNew(); return; }
    if (!d && a && a.startsWith("dash")) return;
    if (a === "dashedit") { UI.edit = !UI.edit; BT.render(); return; }
    if (a === "dashadd") { openBuilder(null, w => addWidgets(d.id, [w])); return; }
    if (a === "dashkpi") { openBuilder(null, w => addWidgets(d.id, [w]), {type: "kpi", metric: "count"}); return; }
    if (a === "dashsuggest") { window.BTAI ? window.BTAI.openWizard(d.id) : BT.toast("The suggestion module didn't load."); return; }
    if (a === "dashmenu") { openMenu(d); return; }
    const wa = e.target.closest("[data-dwa]");
    if (wa && d) {
      const id = wa.closest("[data-w]").dataset.w, ws = d.widgets.slice(), i = ws.findIndex(x => x.id === id); if (i < 0) return;
      const k = wa.dataset.dwa;
      if (k === "why") { UI.why.has(id) ? UI.why.delete(id) : UI.why.add(id); BT.render(); return; }
      if (k === "remove") { ws.splice(i, 1); await saveDash(d.id, {widgets: ws}, "Chart removed"); return; }
      if (k === "left" || k === "right") { const j = k === "left" ? i - 1 : i + 1; if (j < 0 || j >= ws.length) return; [ws[i], ws[j]] = [ws[j], ws[i]]; await saveDash(d.id, {widgets: ws}); return; }
      if (k === "size") { const w = ws[i], seq = w.type === "kpi" ? [1, 2] : [2, 4, 1]; const curS = w.size || (w.type === "kpi" ? 1 : 2); ws[i] = {...w, size: seq[(seq.indexOf(curS) + 1) % seq.length]}; await saveDash(d.id, {widgets: ws}); return; }
      if (k === "edit") { openBuilder(ws[i], async nw => { ws[i] = {...nw, id}; await saveDash(d.id, {widgets: ws, sheets: [...new Set([...d.sheets, nw.sheetId])]}, "Chart updated"); }); return; }
    }
  });
  function openNew() {
    const t = BT.curTracker(); if (!t) { BT.toast("Create a tracker first"); return; }
    BT.openDialog({eyebrow: t.name, title: "New dashboard", saveLabel: "Create", body: () => `<div class="field"><label for="nd_name">Name</label><input class="inp" id="nd_name" value="${esc(t.name)} overview"></div>`,
      onSave: async root => { await createDashboard({name: root.querySelector("#nd_name").value.trim() || "Dashboard", trackerId: t.id, sheets: [], widgets: []}); }});
  }
  function openMenu(d) {
    BT.openDialog({eyebrow: "Dashboard", title: d.name, saveLabel: "Save",
      body: () => `<div class="field"><label for="dm_name">Name</label><input class="inp" id="dm_name" value="${esc(d.name)}"></div><p class="hint" style="margin:0">${d.widgets.length} charts · created ${esc(BT.ago(d.createdAt) || "")}. Deleting a dashboard never deletes sheet data.</p>`,
      onDelete: async () => { const sn = BT.snap("dashboards", [d.id]); await BT.store.del("dashboards", d.id); S().view = "sheet"; S().dashId = null; BT.render(); BT.pushUndo(`Dashboard “${d.name}” deleted`, sn); },
      deleteLabel: "Delete dashboard", confirmLabel: "Click again to delete this dashboard",
      onSave: async root => { const n = root.querySelector("#dm_name").value.trim(); if (n && n !== d.name) await saveDash(d.id, {name: n}, "Dashboard renamed"); }});
  }
  /* drag to reorder (edit mode) */
  document.addEventListener("dragstart", e => { const s0 = e.target.closest?.(".dg [data-w]"); if (!s0 || !UI.edit) return; UI.drag = s0.dataset.w; s0.classList.add("dragging"); e.dataTransfer.effectAllowed = "move"; try { e.dataTransfer.setData("text/plain", UI.drag); } catch (x) {} });
  document.addEventListener("dragover", e => { if (!UI.drag) return; const t0 = e.target.closest?.(".dg [data-w]"); if (!t0) return; e.preventDefault(); document.querySelectorAll(".dg .drop").forEach(x => x.classList.remove("drop")); if (t0.dataset.w !== UI.drag) t0.classList.add("drop"); });
  document.addEventListener("drop", async e => { if (!UI.drag) return; const t0 = e.target.closest?.(".dg [data-w]"); const from = UI.drag; UI.drag = null; if (!t0) return; e.preventDefault();
    const d = cur(), ws = d.widgets.slice(), i = ws.findIndex(x => x.id === from), j = ws.findIndex(x => x.id === t0.dataset.w); if (i < 0 || j < 0 || i === j) { BT.render(); return; }
    const [m] = ws.splice(i, 1); ws.splice(j, 0, m); await saveDash(d.id, {widgets: ws}); });
  document.addEventListener("dragend", () => { UI.drag = null; document.querySelectorAll(".dg .drop, .dg .dragging").forEach(x => x.classList.remove("drop", "dragging")); });

  function printDash(id) {
    if (id && S().dashboards[id]) { S().view = "dash"; S().dashId = id; UI.edit = false; BT.render(); }
    document.body.classList.add("printing-dash");
    const done = () => { document.body.classList.remove("printing-dash"); window.removeEventListener("afterprint", done); };
    window.addEventListener("afterprint", done);
    setTimeout(() => { try { window.print(); } catch (e) { BT.toast("Printing isn't available in this view."); done(); } }, 150);
  }
  window.BTDash = {renderView, navHTML, tabsHTML, sideHTML, sourceSheets, canEdit, printDash, colorFor, body, describe, compute, problem, TYPES, METRICS, createDashboard, addWidgets, openBuilder, dashList, cur, sheet, col, cats, rowsFor, num, resetMemo: () => { MEMO = null; }};
})(window.BT);
