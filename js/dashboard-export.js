/* =====================================================================
   Dashboard export
   - Excel: one worksheet per dashboard with KPI cards, a data table for
     every chart and a NATIVE Excel chart next to it (column, bar,
     stacked bar, line, pie, donut). Charts reference the table cells, so
     the client can restyle or reuse them in Excel.
   - PDF: browser print of the dashboard view (Save as PDF).
   Values are calculated at download time from the live sheet data.
   ===================================================================== */
(function (BT) {
  "use strict";
  if (!BT || !window.BTDash) return;
  const Dash = window.BTDash, esc = BT.esc;
  const arr = v => Array.isArray(v) ? v : v && typeof v === "object" ? Object.values(v) : [];
  const XE = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;"})[c]);
  const L = i => { let s = ""; i++; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - m) / 26); } return s; };
  const hex = c => String(c || "#0C8565").replace("#", "").toUpperCase().slice(0, 6);
  const INK = "10231F", MUTED = "5A6E68", HEAD = "0C5E48", LINE = "D3DED9";
  const bd = {top: {style: "thin", color: {rgb: LINE}}, bottom: {style: "thin", color: {rgb: LINE}}, left: {style: "thin", color: {rgb: LINE}}, right: {style: "thin", color: {rgb: LINE}}};

  /* ---------- the "pick dashboards" block inside the Download dialog ---------- */
  function pickHTML(curId) {
    const t = BT.curTracker(); if (!t) return "";
    const list = Dash.dashList(t.id); if (!list.length) return "";
    return `<div class="field"><span class="lbl">Dashboards <span class="typ">KPIs + Excel charts, ready to send to the client</span></span>
      <div class="group"><div class="kids">${list.map(d => `<label class="ck"><input type="checkbox" data-dx="${esc(d.id)}" ${d.id === curId ? "checked" : ""}> ${esc(d.name)} <span class="n">${arr(d.widgets).length} charts</span></label>`).join("")}</div></div>
      ${curId ? `<div class="row2" style="flex:none;align-items:center;flex-wrap:wrap"><button class="btn" type="button" id="dx_pdf" style="flex:none">Save this dashboard as PDF…</button><span class="hint">Opens the print window: choose “Save as PDF”.</span></div>` : ""}</div>`;
  }
  document.addEventListener("click", e => { if (e.target.closest("#dx_pdf")) { const id = BT.S.dashId; BT.closeDialog(true); Dash.printDash(id); } });

  /* ---------- worksheet ---------- */
  function C(v, s, extra) { return Object.assign({v: v ?? "", t: typeof v === "number" ? "n" : "s", s}, extra || {}); }
  function buildSheet(did) {
    const d0 = BT.S.dashboards[did]; if (!d0) return null;
    const d = {id: did, ...d0, widgets: arr(d0.widgets)};
    Dash.resetMemo();
    const aoa = [], merges = [], rows = [], charts = [], NC = 14;
    const put = (r, c, cell) => { while (aoa.length <= r) aoa.push([]); aoa[r][c] = cell; };
    const t = BT.trackerList().find(x => x.id === (d.trackerId || "bcp"));
    const srcNames = Dash.sourceSheets(d).map(id => BT.S.sheets[id]?.name).filter(Boolean);
    put(0, 0, C(d.name, {font: {bold: true, sz: 18, color: {rgb: INK}}})); merges.push({s: {r: 0, c: 0}, e: {r: 0, c: NC - 1}}); rows[0] = {hpt: 30};
    put(1, 0, C(`${t?.name || ""} · Live dashboard exported ${new Date().toLocaleString(undefined, {day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"})} · Source: ${srcNames.join(", ")}`, {font: {italic: true, sz: 10, color: {rgb: MUTED}}}));
    merges.push({s: {r: 1, c: 0}, e: {r: 1, c: NC - 1}});
    let r = 3;
    // KPI cards: 2 columns each, 4 per line (B..I), label / value / note
    const kpis = d.widgets.filter(w => w.type === "kpi"), charts0 = d.widgets.filter(w => w.type !== "kpi");
    for (let i = 0; i < kpis.length; i += 4) {
      kpis.slice(i, i + 4).forEach((w, j) => {
        const c = 2 + j * 3, p = Dash.problem(w); let val = "–", sub = "";
        if (!p) { const x = Dash.compute(w); val = x.kpi == null ? "–" : x.pct ? Math.round(x.kpi) / 100 : Math.round(x.kpi * 10) / 10; sub = String(x.sub || "").replace(/<[^>]+>/g, ""); } else sub = p.replace(/<[^>]+>/g, "");
        const card = {fill: {fgColor: {rgb: "F4F8F6"}}, border: bd};
        put(r, c, C(w.title || "KPI", {...card, font: {bold: true, sz: 10, color: {rgb: MUTED}}, alignment: {wrapText: true, vertical: "top"}})); put(r, c + 1, C("", card));
        put(r + 1, c, C(val, {...card, font: {bold: true, sz: 24, color: {rgb: INK}}, alignment: {horizontal: "left", vertical: "center"}, ...(typeof val === "number" && w.kpi?.mode === "pct" ? {numFmt: "0%"} : {})}, typeof val === "number" && w.kpi?.mode === "pct" ? {z: "0%"} : null)); put(r + 1, c + 1, C("", card));
        put(r + 2, c, C(sub, {...card, font: {sz: 9, color: {rgb: MUTED}}, alignment: {wrapText: true, vertical: "top"}})); put(r + 2, c + 1, C("", card));
        [r, r + 1, r + 2].forEach(rr => merges.push({s: {r: rr, c}, e: {r: rr, c: c + 1}}));
      });
      rows[r] = {hpt: 30}; rows[r + 1] = {hpt: 36}; rows[r + 2] = {hpt: 28}; r += 4;
    }
    if (kpis.length) r += 1;
    // charts: data table at B.., native chart to the right
    for (const w of charts0) {
      const title = w.title || Dash.TYPES[w.type];
      put(r, 1, C(title, {font: {bold: true, sz: 13, color: {rgb: INK}}})); merges.push({s: {r, c: 1}, e: {r, c: NC - 1}}); rows[r] = {hpt: 22};
      put(r + 1, 1, C(String(Dash.describe(w)).replace(/<[^>]+>/g, "").replace(/&amp;/g, "&") + (w.why ? " — " + w.why : ""), {font: {italic: true, sz: 9, color: {rgb: MUTED}}, alignment: {wrapText: true}})); merges.push({s: {r: r + 1, c: 1}, e: {r: r + 1, c: NC - 1}}); rows[r + 1] = {hpt: 26};
      const p = Dash.problem(w); let x = null; if (!p) { try { x = Dash.compute(w); } catch (e) { x = {empty: e.message}; } }
      if (p || !x || x.empty) { put(r + 2, 1, C(String(p || x?.empty || "No data").replace(/<[^>]+>/g, ""), {font: {sz: 10, color: {rgb: "A6640A"}}})); r += 4; continue; }
      const sh = Dash.sheet(w.sheetId), hs = {fill: {fgColor: {rgb: HEAD}}, font: {bold: true, color: {rgb: "FFFFFF"}, sz: 10}, border: bd, alignment: {horizontal: "center"}};
      const top = r + 2; let cats = [], series = [], kind;
      if (w.type === "line") { kind = "line"; cats = x.labels; series = x.series.map(s0 => ({name: s0.name, vals: s0.vals.map(v => v ?? 0)})); }
      else if (w.type === "stacked") { kind = "stacked"; cats = x.items.map(i => i.k); series = x.names.map(n => ({name: n, vals: x.items.map(i => (i.parts.find(p0 => p0.n === n) || {}).v || 0), color: Dash.colorFor(sh, x.sc, n, x.names.indexOf(n))})); }
      else { kind = w.type === "table" ? "table" : w.type === "bar" && x.items.length <= 10 ? "col" : w.type === "pie" ? "pie" : w.type === "donut" ? "donut" : "bar";
        cats = x.items.map(i => i.k); series = [{name: w.metric && w.metric !== "count" ? `${w.metric} of ${Dash.col(sh, w.valueCol)?.label || ""}` : "Entries", vals: x.items.map(i => Math.round((i.v || 0) * 100) / 100), colors: x.items.map((i, k) => Dash.colorFor(sh, x.gc, i.k, k))}]; }
      put(top, 1, C(w.type === "line" ? "Period" : String(Dash.col(sh, w.groupBy)?.label || (w.groupBy === "@sheet" ? "Sheet" : "Group")), hs));
      series.forEach((s0, j) => put(top, 2 + j, C(String(s0.name), hs)));
      cats.forEach((k, i) => { put(top + 1 + i, 1, C(String(k), {border: bd, font: {sz: 10}, fill: {fgColor: {rgb: i % 2 ? "F4F8F6" : "FFFFFF"}}})); series.forEach((s0, j) => put(top + 1 + i, 2 + j, C(s0.vals[i] ?? 0, {border: bd, font: {sz: 10}, alignment: {horizontal: "right"}, fill: {fgColor: {rgb: i % 2 ? "F4F8F6" : "FFFFFF"}}}))); });
      const lastCol = 1 + series.length, height = 18;
      if (kind !== "table") charts.push({kind, title, cats, series, catCol: 1, valCol0: 2, r0: top + 1, r1: top + cats.length, anchor: {c0: Math.max(lastCol + 2, 4), r0: top, c1: Math.max(lastCol + 2, 4) + 9, r1: top + height}});
      r = top + Math.max(cats.length + 2, kind === "table" ? cats.length + 2 : height + 2);
    }
    const ws = XLSX.utils.aoa_to_sheet(aoa.map(row => Array.from({length: Math.max(row.length, 1)}, (_, i) => row[i] ?? null)));
    ws["!merges"] = merges; ws["!rows"] = rows;
    ws["!cols"] = [{wch: 2}, {wch: 30}, ...Array.from({length: NC}, () => ({wch: 12}))];
    return {ws, charts, title: d.name, trackerId: d.trackerId || "bcp"};
  }
  function addSheets(wb, ids, used) {
    const parts = [];
    for (const id of ids) {
      const b = buildSheet(id); if (!b) continue;
      let nm = ("Dashboard - " + b.title).replace(/[\\\/\?\*\[\]:]/g, " ").slice(0, 31).trim(), k = 2; while (used.has(nm)) nm = nm.slice(0, 28) + " " + k++; used.add(nm);
      XLSX.utils.book_append_sheet(wb, b.ws, nm);
      parts.push({name: nm, charts: b.charts, title: b.title, trackerId: b.trackerId});
    }
    return parts;
  }
  /* ---------- native Excel charts (DrawingML) ---------- */
  const ref = (sheet, c, r0, r1) => `'${sheet.replace(/'/g, "''")}'!$${L(c)}$${r0 + 1}${r1 != null ? `:$${L(c)}$${r1 + 1}` : ""}`;
  const strCache = list => `<c:strCache><c:ptCount val="${list.length}"/>${list.map((v, i) => `<c:pt idx="${i}"><c:v>${XE(v)}</c:v></c:pt>`).join("")}</c:strCache>`;
  const numCache = list => `<c:numCache><c:formatCode>General</c:formatCode><c:ptCount val="${list.length}"/>${list.map((v, i) => `<c:pt idx="${i}"><c:v>${+v || 0}</c:v></c:pt>`).join("")}</c:numCache>`;
  const fill = c => `<c:spPr><a:solidFill><a:srgbClr val="${hex(c)}"/></a:solidFill></c:spPr>`;
  const PAL = ["0C8565", "2F5DA8", "F2A93B", "BF3A31", "7A5CC2", "1B9AAA", "C2577A", "6B8E23", "A6640A"];
  function chartXML(ch, sheet) {
    const pie = ch.kind === "pie" || ch.kind === "donut", line = ch.kind === "line", multi = ch.series.length > 1;
    const ser = ch.series.map((s0, j) => {
      const color = s0.color || PAL[j % PAL.length];
      const dpts = (pie || (!multi && ch.kind !== "line")) && s0.colors ? s0.colors.map((c, i) => `<c:dPt><c:idx val="${i}"/>${pie ? "" : '<c:invertIfNegative val="0"/>'}<c:bubble3D val="0"/>${fill(c)}</c:dPt>`).join("") : "";
      const lbls = `<c:dLbls>${pie ? '<c:numFmt formatCode="0%" sourceLinked="0"/>' : ""}<c:spPr><a:noFill/><a:ln><a:noFill/></a:ln></c:spPr><c:txPr><a:bodyPr/><a:lstStyle/><a:p><a:pPr><a:defRPr sz="900"/></a:pPr><a:endParaRPr lang="en-US"/></a:p></c:txPr><c:showLegendKey val="0"/><c:showVal val="${pie ? 0 : 1}"/><c:showCatName val="0"/><c:showSerName val="0"/><c:showPercent val="${pie ? 1 : 0}"/><c:showBubbleSize val="0"/></c:dLbls>`;
      return `<c:ser><c:idx val="${j}"/><c:order val="${j}"/><c:tx><c:strRef><c:f>${ref(sheet, ch.valCol0 + j, ch.r0 - 1)}</c:f>${strCache([s0.name])}</c:strRef></c:tx>`
        + (line ? `<c:spPr><a:ln w="28575" cap="rnd"><a:solidFill><a:srgbClr val="${hex(color)}"/></a:solidFill><a:round/></a:ln></c:spPr><c:marker><c:symbol val="circle"/><c:size val="5"/>${fill(color)}</c:marker>` : pie ? "" : fill(color) + '<c:invertIfNegative val="0"/>')
        + dpts + (multi && !pie ? "" : lbls)
        + `<c:cat><c:strRef><c:f>${ref(sheet, ch.catCol, ch.r0, ch.r1)}</c:f>${strCache(ch.cats)}</c:strRef></c:cat><c:val><c:numRef><c:f>${ref(sheet, ch.valCol0 + j, ch.r0, ch.r1)}</c:f>${numCache(s0.vals)}</c:numRef></c:val>`
        + (line ? '<c:smooth val="0"/>' : "") + `</c:ser>`;
    }).join("");
    const ax = (horiz) => `<c:catAx><c:axId val="5001"/><c:scaling><c:orientation val="${horiz ? "maxMin" : "minMax"}"/></c:scaling><c:delete val="0"/><c:axPos val="${horiz ? "l" : "b"}"/><c:numFmt formatCode="General" sourceLinked="0"/><c:majorTickMark val="none"/><c:minorTickMark val="none"/><c:tickLblPos val="nextTo"/><c:spPr><a:ln><a:solidFill><a:srgbClr val="D3DED9"/></a:solidFill></a:ln></c:spPr><c:txPr><a:bodyPr/><a:lstStyle/><a:p><a:pPr><a:defRPr sz="900"/></a:pPr><a:endParaRPr lang="en-US"/></a:p></c:txPr><c:crossAx val="5002"/><c:crosses val="autoZero"/><c:auto val="1"/><c:lblAlgn val="ctr"/><c:lblOffset val="100"/><c:noMultiLvlLbl val="0"/></c:catAx>`
      + `<c:valAx><c:axId val="5002"/><c:scaling><c:orientation val="minMax"/></c:scaling><c:delete val="0"/><c:axPos val="${horiz ? "b" : "l"}"/><c:majorGridlines><c:spPr><a:ln><a:solidFill><a:srgbClr val="E7ECEA"/></a:solidFill></a:ln></c:spPr></c:majorGridlines><c:numFmt formatCode="General" sourceLinked="0"/><c:majorTickMark val="none"/><c:minorTickMark val="none"/><c:tickLblPos val="nextTo"/><c:spPr><a:ln><a:noFill/></a:ln></c:spPr><c:txPr><a:bodyPr/><a:lstStyle/><a:p><a:pPr><a:defRPr sz="900"/></a:pPr><a:endParaRPr lang="en-US"/></a:p></c:txPr><c:crossAx val="5001"/><c:crosses val="${horiz ? "max" : "autoZero"}"/><c:crossBetween val="between"/></c:valAx>`;
    let plot;
    if (ch.kind === "pie") plot = `<c:pieChart><c:varyColors val="1"/>${ser}<c:firstSliceAng val="0"/></c:pieChart>`;
    else if (ch.kind === "donut") plot = `<c:doughnutChart><c:varyColors val="1"/>${ser}<c:firstSliceAng val="0"/><c:holeSize val="55"/></c:doughnutChart>`;
    else if (line) plot = `<c:lineChart><c:grouping val="standard"/><c:varyColors val="0"/>${ser}<c:marker val="1"/><c:axId val="5001"/><c:axId val="5002"/></c:lineChart>${ax(false)}`;
    else { const horiz = ch.kind !== "col", stacked = ch.kind === "stacked";
      plot = `<c:barChart><c:barDir val="${horiz ? "bar" : "col"}"/><c:grouping val="${stacked ? "stacked" : "clustered"}"/><c:varyColors val="0"/>${ser}${stacked ? `<c:dLbls><c:showLegendKey val="0"/><c:showVal val="0"/><c:showCatName val="0"/><c:showSerName val="0"/><c:showPercent val="0"/><c:showBubbleSize val="0"/></c:dLbls>` : ""}<c:gapWidth val="${stacked ? 60 : 50}"/>${stacked ? '<c:overlap val="100"/>' : ""}<c:axId val="5001"/><c:axId val="5002"/></c:barChart>${ax(horiz)}`; }
    const legend = pie || multi ? `<c:legend><c:legendPos val="${pie ? "r" : "t"}"/><c:overlay val="0"/><c:txPr><a:bodyPr/><a:lstStyle/><a:p><a:pPr><a:defRPr sz="900"/></a:pPr><a:endParaRPr lang="en-US"/></a:p></c:txPr></c:legend>` : "";
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><c:roundedCorners val="0"/><c:chart><c:title><c:tx><c:rich><a:bodyPr/><a:lstStyle/><a:p><a:pPr><a:defRPr sz="1200" b="1"/></a:pPr><a:r><a:rPr lang="en-US" sz="1200" b="1"/><a:t>${XE(ch.title)}</a:t></a:r></a:p></c:rich></c:tx><c:overlay val="0"/></c:title><c:autoTitleDeleted val="0"/><c:plotArea><c:layout/>${plot}</c:plotArea>${legend}<c:plotVisOnly val="1"/><c:dispBlanksAs val="gap"/></c:chart><c:spPr><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:ln><a:solidFill><a:srgbClr val="D3DED9"/></a:solidFill></a:ln></c:spPr></c:chartSpace>`;
  }
  function drawingXML(charts) {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">${charts.map((ch, i) => `<xdr:twoCellAnchor editAs="oneCell"><xdr:from><xdr:col>${ch.anchor.c0}</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${ch.anchor.r0}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from><xdr:to><xdr:col>${ch.anchor.c1}</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${ch.anchor.r1}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to><xdr:graphicFrame macro=""><xdr:nvGraphicFramePr><xdr:cNvPr id="${i + 2}" name="Chart ${i + 1}"/><xdr:cNvGraphicFramePr/></xdr:nvGraphicFramePr><xdr:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></xdr:xfrm><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart"><c:chart xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="rId${i + 1}"/></a:graphicData></a:graphic></xdr:graphicFrame><xdr:clientData/></xdr:twoCellAnchor>`).join("")}</xdr:wsDr>`;
  }
  function injectCharts(data, sheetNames, parts) {
    const CFB = XLSX.CFB, z = CFB.read(data, {type: "array"});
    const idx = p => z.FullPaths.findIndex(x => x.endsWith("/" + p));
    const get = p => { const i = idx(p); return i < 0 ? null : new TextDecoder().decode(z.FileIndex[i].content); };
    const set = (p, text) => { const bytes = new TextEncoder().encode(text), i = idx(p); if (i >= 0) z.FileIndex[i].content = bytes; else CFB.utils.cfb_add(z, "/" + p, bytes); };
    let ct = get("[Content_Types].xml"), chartNo = 0, drawNo = 0;
    for (const part of parts) {
      if (!part.charts.length) continue;
      const sn = sheetNames.indexOf(part.name) + 1; if (sn < 1) continue;
      const d = ++drawNo, sheetPath = `xl/worksheets/sheet${sn}.xml`, relPath = `xl/worksheets/_rels/sheet${sn}.xml.rels`;
      const drels = [];
      part.charts.forEach((ch, i) => { const n = ++chartNo; set(`xl/charts/chart${n}.xml`, chartXML(ch, part.name)); drels.push(`<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart${n}.xml"/>`); ct = ct.replace("</Types>", `<Override PartName="/xl/charts/chart${n}.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/></Types>`); });
      set(`xl/drawings/drawing${d}.xml`, drawingXML(part.charts));
      set(`xl/drawings/_rels/drawing${d}.xml.rels`, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${drels.join("")}</Relationships>`);
      ct = ct.replace("</Types>", `<Override PartName="/xl/drawings/drawing${d}.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/></Types>`);
      let rels = get(relPath) || `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`;
      rels = rels.replace("</Relationships>", `<Relationship Id="rIdDash${d}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing${d}.xml"/></Relationships>`);
      set(relPath, rels);
      let sx = get(sheetPath);
      if (!/xmlns:r=/.test(sx.slice(0, 600))) sx = sx.replace("<worksheet ", '<worksheet xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" ');
      const tail = sx.search(/<(legacyDrawing|tableParts|extLst)\b/);
      sx = tail > 0 ? sx.slice(0, tail) + `<drawing r:id="rIdDash${d}"/>` + sx.slice(tail) : sx.replace("</worksheet>", `<drawing r:id="rIdDash${d}"/></worksheet>`);
      set(sheetPath, sx);
    }
    set("[Content_Types].xml", ct);
    const out = CFB.write(z, {fileType: "zip", type: "array"});
    return out instanceof Uint8Array ? out : new Uint8Array(out);
  }
  window.BTDashExport = {pickHTML, addSheets, injectCharts, buildSheet, chartXML};
})(window.BT);
