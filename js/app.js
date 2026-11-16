(() => {
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmtDate = v => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v || ""); return m ? `${m[3]} ${MON[+m[2]-1]} ${m[1]}` : (v || ""); };
const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
const stampText = () => { const d = new Date(); return `${String(d.getDate()).padStart(2,"0")}-${MON[d.getMonth()]}-${d.getFullYear()}`; };
const ago = iso => { if (!iso) return ""; const s = (Date.now() - new Date(iso)) / 1000; if (s < 60) return "just now"; if (s < 3600) return Math.floor(s/60) + "m ago"; if (s < 86400) return Math.floor(s/3600) + "h ago"; if (s < 86400*30) return Math.floor(s/86400) + "d ago"; return fmtDate(iso.slice(0,10)); };
const ICON = {
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  up:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 15 6-6 6 6"/></svg>',
  down:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>',
  trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
  dl:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14"/></svg>',
  ul:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 16V5m0 0-4 4m4-4 4 4M5 20h14"/></svg>',
  filter:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16l-6 7.5V19l-4 1.5v-8Z"/></svg>',
  flag:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 21V4h10.5l.6 2H20v10h-6.5l-.6-2H7v7Z"/></svg>',
  edit:'<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 20h4L19 9l-4-4L4 16v4Z"/></svg>',
  side:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/></svg>',
  expand:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  shrink:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>',
  format:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16"/></svg>',
  spark:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9L12 2Zm7 12l.9 2.6 2.6.9-2.6.9L19 21l-.9-2.6-2.6-.9 2.6-.9L19 14ZM5 15l.7 1.8L7.5 17.5l-1.8.7L5 20l-.7-1.8-1.8-.7 1.8-.7L5 15Z"/></svg>',
  palette:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-.5-.2-.8-.5-1.1-.3-.3-.5-.7-.5-1.2 0-.9.7-1.6 1.6-1.6H16a5 5 0 0 0 5-5c0-4.1-4-7.5-9-7.5Z"/><circle cx="7.5" cy="11" r="1.2" fill="currentColor"/><circle cx="10.5" cy="7" r="1.2" fill="currentColor"/><circle cx="15" cy="7.5" r="1.2" fill="currentColor"/></svg>',
  dots:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
};
const TYPES = {select:"Dropdown", text:"Free text", long:"Long text / notes", date:"Date", number:"Number", calc:"Auto-calculated"};
const TYPE_HINT = {select:"Pick from a list", text:"One line", long:"Remarks, updates", date:"Calendar picker", number:"Sr. no, counts", calc:"Aging, due dates, formulas"};

/* ---------- Status tone ---------- */
function tone(v) {
  const meta = STATUS_META.get(String(v || "").trim().toLowerCase()); if (meta) return (STATUS_CATS[meta.cat] || STATUS_CATS.progress).tone;
  const s = String(v || "").toLowerCase();
  if (!s) return "neu";
  if (/(blocker|fail|not received|not done|rejected|overdue|critical)/.test(s)) return "bad";
  if (/(not required|out of scope|^na$|^n\/a$|^none$|^no$)/.test(s)) return "neu";
  if (/(complete|closed|done|^yes$|received|agreed|approved|live|signed)/.test(s)) return "good";
  if (/(wip|progress|pending|post |clarity|confirm|phase|rfi|hold|review|open|^ma$)/.test(s)) return "warn";
  if (/(bank|fable|owner)/.test(s)) return "info";
  return "info";
}
const TONE_ORDER = {good:0, warn:1, info:2, bad:3, neu:4};

/* ---------- State ---------- */
const S = { trackers:{}, sheets:{}, rows:{}, dashboards:{}, dashId:null, view:"home", sheetId:null, trackerId:"bcp", q:"", filter:null, layout:{}, sort:null, ready:false };
try { S.trackerId = localStorage.getItem("bcp-tracker-current") || "bcp"; } catch (e) {}
let store = null; // {mode, put(kind,id,data), del(kind,id)}
let pending = 0;

function setSync(state, text) { const el = $("#sync"); el.dataset.s = state; $("#syncTxt").textContent = text; }
function bumpPending(d) {
  pending += d;
  if (store?.mode === "cloud") setSync(pending ? "saving" : "ok", pending ? "Saving…" : "Live · all changes saved");
}

/* ---------- Firebase Realtime Database ---------- */
const ROOT = (window.DATA_ROOT || "tracker").replace(/^\/+|\/+$/g, "");
let FB = null, ME = null;
const BUILTIN_CONFIG = {apiKey: "AIzaSyDQ8pdVjYiQ_YfvUPiOYk6BU4IViUvS5OE", authDomain: "trackers-4ad6e.firebaseapp.com", databaseURL: "https://trackers-4ad6e-default-rtdb.asia-southeast1.firebasedatabase.app", projectId: "trackers-4ad6e", storageBucket: "trackers-4ad6e.firebasestorage.app", messagingSenderId: "905056124165", appId: "1:905056124165:web:e56034dcc64a22364ecb6c"};
function getFbConfig() {
  const c = window.FIREBASE_CONFIG; if (c && c.apiKey && c.databaseURL) return c;
  return BUILTIN_CONFIG;
  const m = /cfg=([A-Za-z0-9+/=_-]+)/.exec(location.hash);
  if (m) { try { const j = JSON.parse(atob(m[1].replace(/-/g, "+").replace(/_/g, "/"))); localStorage.setItem("fb-config", JSON.stringify(j)); history.replaceState(null, "", location.pathname + location.search); return j; } catch (e) {} }
  try { const j = JSON.parse(localStorage.getItem("fb-config") || "null"); if (j && j.apiKey) return j; } catch (e) {}
  return null;
}
function parseCfgText(t) {
  const m = /firebaseConfig\s*=\s*\{([\s\S]*?)\}/.exec(t || "") || /\{([\s\S]*?)\}/.exec(t || ""); if (!m) return null;
  const o = {}, re = /["']?([A-Za-z_$][\w$]*)["']?\s*:\s*(["'`])([\s\S]*?)\2/g; let x;
  while ((x = re.exec(m[1]))) { let v = x[3].trim(); const md = /^\[([^\]]+)\]\([^)]*\)$/.exec(v); if (md) v = md[1]; o[x[1]] = v; }
  return o.apiKey ? o : null;
}
const gate = (html) => { $("#gateCard").innerHTML = html; $("#gate").hidden = false; };
function showSetup(msg) {
  gate(`<div class="brand-mark" style="width:44px;height:44px">BT</div><h1>Connect your Firebase database</h1>
    <p>Paste the web app config from Firebase console → Project settings → Your apps. It looks like <code>const firebaseConfig = { apiKey: … }</code>. It must include <code>databaseURL</code>.</p>
    <textarea class="inp" id="cfgIn" placeholder="const firebaseConfig = {&#10;  apiKey: &quot;…&quot;,&#10;  authDomain: &quot;…&quot;,&#10;  databaseURL: &quot;https://….firebasedatabase.app&quot;,&#10;  projectId: &quot;…&quot;,&#10;  appId: &quot;…&quot;&#10;};"></textarea>
    ${msg ? `<div class="err">${esc(msg)}</div>` : ""}
    <button class="btn primary" type="button" id="cfgSave">Connect</button>
    <p style="font-size:12.5px">Tip: to skip this on every device, paste the same config into <code>index.html</code> (FIREBASE_CONFIG) before uploading to GitHub.</p>`);
  $("#cfgSave").onclick = () => { const c = parseCfgText($("#cfgIn").value); if (!c) return showSetup("That doesn't look like a Firebase config. Copy the whole { … } block."); if (!c.databaseURL) return showSetup("The config has no databaseURL. Create a Realtime Database first, then copy the config again."); try { localStorage.setItem("fb-config", JSON.stringify(c)); } catch (e) {} location.reload(); };
}
function showSignIn(msg, ok, closable) {
  gate(`${closable ? `<button class="icon" type="button" id="gClose" aria-label="Close" style="align-self:flex-end;margin:-12px -12px -30px 0">✕</button>` : ""}<div class="brand-mark" style="width:44px;height:44px">BT</div><h1>${closable ? "Sign in to show your name" : "Bank Project Tracker"}</h1><p>${closable ? "Optional. Your edits will show your name instead of “Guest”." : (VIEW_ID ? "Sign in to view the sheets shared with you." : "Sign in to open your trackers. Your data is private to your account.")}</p>
    <button class="btn primary" type="button" id="gIn"><svg viewBox="0 0 24 24" width="18" height="18"><path fill="#fff" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3Z"/><path fill="#fff" opacity=".85" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z"/><path fill="#fff" opacity=".7" d="M6.4 14a6 6 0 0 1 0-3.9V7.5H3.1a10 10 0 0 0 0 9.1L6.4 14Z"/><path fill="#fff" opacity=".55" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.5L6.4 10C7.2 7.7 9.4 5.9 12 5.9Z"/></svg> Continue with Google</button>
    <div class="or">or email</div>
    <input class="inp" id="eMail" type="email" placeholder="you@company.com" autocomplete="username">
    <input class="inp" id="ePass" type="password" placeholder="Password (min 6 characters)" autocomplete="current-password">
    <div class="row2" style="flex:none"><button class="btn" type="button" id="eIn">Sign in</button><button class="btn ghost" type="button" id="eUp">Create account</button></div>
    <label class="ck" style="font-size:13px"><input type="checkbox" id="eKeep" ${keepSignedIn() ? "checked" : ""}> Keep me signed in on this device</label>
    <button class="stamp" type="button" id="eReset" style="align-self:flex-start">Forgot password?</button>
    ${msg ? `<div class="${ok ? "ok" : "err"}">${esc(msg)}</div>` : ""}
`);
  const auth = firebase.auth(), em = () => $("#eMail").value.trim(), pw = () => $("#ePass").value;
  $("#eKeep").onchange = e => { try { localStorage.setItem("bt-keep", e.target.checked ? "1" : "0"); } catch (x) {} };
  const persist = () => auth.setPersistence(keepSignedIn() ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION).catch(() => {});
  $("#gClose")?.addEventListener("click", () => { $("#gate").hidden = true; });
  const fail = e => showSignIn(({"auth/invalid-credential":"Wrong email or password.","auth/wrong-password":"Wrong email or password.","auth/user-not-found":"No account with that email. Use Create account.","auth/email-already-in-use":"That email already has an account. Sign in instead.","auth/weak-password":"Use at least 6 characters.","auth/unauthorized-domain":"This website isn't on the Firebase authorized domains list. Add it under Authentication → Settings → Authorized domains.","auth/popup-closed-by-user":"Sign-in window was closed.","auth/operation-not-allowed":"This sign-in method is off. Turn it on in Firebase → Authentication → Sign-in method.","auth/admin-restricted-operation":"New accounts are switched off. In Firebase → Authentication → Settings → User actions, tick Enable create (sign-up).","auth/invalid-email":"Enter a valid email address.","auth/too-many-requests":"Too many attempts. Wait a minute and try again."})[e.code] || e.message, false, closable);
  $("#gIn").onclick = () => persist().then(() => auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())).catch(e => e.code === "auth/popup-blocked" ? auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider()) : fail(e));
  $("#eIn").onclick = () => persist().then(() => auth.signInWithEmailAndPassword(em(), pw())).catch(fail);
  $("#eUp").onclick = () => persist().then(() => auth.createUserWithEmailAndPassword(em(), pw())).catch(fail);
  $("#ePass").addEventListener("keydown", e => { if (e.key === "Enter") $("#eIn").click(); });
  $("#eReset").onclick = () => em() ? auth.sendPasswordResetEmail(em()).then(() => showSignIn("Password reset email sent.", true)).catch(fail) : showSignIn("Type your email first.");
}
async function init() {
  render();
  const cfg = getFbConfig();
  if (!window.firebase) { setSync("offline", "Couldn't load Firebase"); gate(`<h1>Couldn't load Firebase</h1><p>Check your internet connection and reload the page.</p>`); return; }
  if (!cfg) { showSetup(); return; }
  try { firebase.initializeApp(cfg); } catch (e) { showSetup("Firebase rejected that config: " + e.message); return; }
  const auth = firebase.auth(); FB = firebase.database();
  auth.getRedirectResult().catch(() => {});
  if (VIEW_ID) { startViewer(auth); return; }
  let started = false;
  auth.onAuthStateChanged(user => {
    if (LEAVING) return;
    if (!user || user.isAnonymous) {
      if (started) { wipeAndReload(); return; }  // signed out elsewhere (another tab, idle timeout, revoked): never keep data on screen
      $("#userChip").hidden = true; ME = null;
      let msg = ""; try { msg = sessionStorage.getItem("bt-msg") || ""; sessionStorage.removeItem("bt-msg"); } catch (e) {}
      showSignIn(msg, !!msg); return;
    }
    if (started && ME && ME.uid !== user.uid) { wipeAndReload(); return; }
    ME = user; $("#gate").hidden = true; $("#userChip").hidden = false; $("#userEmail").textContent = user.email || user.displayName || "Signed in";
    $("#signOutBtn").textContent = "Sign out";
    if (!started) { started = true;
      if (COLLAB_ID && COLLAB_ID.split("~")[0] !== user.uid) startCollab();
      else { if (COLLAB_ID) { S.view = "dash"; S.dashId = COLLAB_ID.split("~")[1]; history.replaceState(null, "", location.pathname); } startSync(); }
      startSession(); }
  });
  $("#signOutBtn").onclick = () => confirmSignOut();
}
/* ---------- Session handling ---------- */
function keepSignedIn() { try { return localStorage.getItem("bt-keep") !== "0"; } catch (e) { return true; } }
let SYNC_REFS = [], GUARD = false, LEAVING = false;
function wipeAndReload(msg) {
  try { SYNC_REFS.forEach(r => r.off()); } catch (e) {}
  S.trackers = {}; S.sheets = {}; S.rows = {}; S.view = "home"; S.sheetId = null; ME = null;
  try { document.querySelectorAll(".main, .nav, #trkPop, #drForm, #dBody").forEach(e => e.innerHTML = ""); document.querySelector(".app").style.display = "none"; } catch (e) {}
  try { localStorage.removeItem("bcp-tracker-v1"); localStorage.removeItem("bcp-tracker-current"); if (msg) sessionStorage.setItem("bt-msg", msg); } catch (e) {}
  LEAVING = true; location.replace(location.pathname + location.search);
}
async function doSignOut(msg) {
  LEAVING = true;
  try { SYNC_REFS.forEach(r => r.off()); } catch (e) {}
  try { await firebase.auth().signOut(); } catch (e) {}
  wipeAndReload(msg || "You've signed out.");
}
function confirmSignOut(fromBack) {
  openDialog({
    eyebrow: ME?.email || "Account", title: fromBack ? "Leave the tracker?" : "Sign out?", saveLabel: fromBack ? "Stay here" : "Sign out",
    body: () => `<p style="margin:0">${fromBack ? "You pressed Back. Do you want to sign out before you leave? Anyone using this browser afterwards would otherwise still be signed in to your trackers." : "You'll need to sign in again to see your trackers. Your data stays safe in your account."}</p>
      ${pending ? `<div class="banner" style="margin-top:10px">${pending} change${pending === 1 ? " is" : "s are"} still saving. Wait a moment before signing out.</div>` : ""}
      ${fromBack ? `<div class="row2" style="flex:none;margin-top:14px;flex-wrap:wrap"><button class="btn danger" type="button" id="soLeave" style="flex:none">Sign out and leave</button><button class="btn" type="button" id="soStay" style="flex:none">Leave, stay signed in</button></div>` : ""}`,
    mount: root => {
      root.querySelector("#soLeave")?.addEventListener("click", async () => { closeDialog(true); LEAVING = true; await doSignOutAndBack(); });
      root.querySelector("#soStay")?.addEventListener("click", () => { closeDialog(true); LEAVING = true; history.back(); setTimeout(() => { if (document.visibilityState === "visible" && ME) { LEAVING = false; armGuard(); toast("There's no earlier page in this tab. Close the tab to leave."); } }, 700); });
    },
    onCancel: () => { if (fromBack) armGuard(); },
    onSave: async () => { if (fromBack) { armGuard(); return; } closeDialog(true); await doSignOut(); return false; }
  });
}
async function doSignOutAndBack() {
  try { SYNC_REFS.forEach(r => r.off()); } catch (e) {}
  try { await firebase.auth().signOut(); } catch (e) {}
  try { document.querySelectorAll(".main, .nav, #trkPop, #drForm, #dBody").forEach(e => e.innerHTML = ""); document.querySelector(".app").style.display = "none"; localStorage.removeItem("bcp-tracker-v1"); sessionStorage.setItem("bt-msg", "You've signed out."); } catch (e) {}
  history.back();
  setTimeout(() => location.replace(location.pathname + location.search), 700);  // no earlier page: show the sign-in screen
}
function armGuard() { if (!GUARD) return; try { history.pushState({bt: 1}, "", location.href); } catch (e) {} }
function startSession() {
  // Back-button guard: one extra history entry; pressing Back asks before leaving
  GUARD = true; armGuard();
  window.addEventListener("popstate", () => { if (LEAVING || !ME) return; if (!$("#dlg").hidden) closeDialog(true); confirmSignOut(true); });
  // Unsaved writes → browser's own "leave site?" prompt
  window.addEventListener("beforeunload", e => { if (!LEAVING && pending > 0) { e.preventDefault(); e.returnValue = ""; } });
  // Inactivity sign-out
  const mins = +(window.IDLE_SIGNOUT_MINUTES ?? 60);
  if (mins > 0) {
    let last = Date.now(); const bump = () => { last = Date.now(); try { localStorage.setItem("bt-active", String(last)); } catch (e) {} };
    ["pointerdown", "keydown", "wheel", "touchstart"].forEach(ev => window.addEventListener(ev, bump, {passive: true, capture: true}));
    bump();
    setInterval(() => { let shared = last; try { shared = Math.max(last, +localStorage.getItem("bt-active") || 0); } catch (e) {}
      if (ME && Date.now() - shared > mins * 60000) doSignOut(`Signed out after ${mins} minutes of inactivity.`); }, 30000);
  }
}
// Back/forward cache: a page restored after sign-out must re-check the session, never show old data
window.addEventListener("pageshow", e => { if (e.persisted) location.reload(); });

/* ---------- Sharing: live, view-only links to selected sheets ---------- */
const VIEW_ID = (new URLSearchParams(location.search).get("view") || "").replace(/[^A-Za-z0-9_-]/g, "");
const SHARE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>';
let SHARES = {}, VIEWONLY = false;
const emailKey = e => String(e || "").trim().toLowerCase().replace(/\./g, ",");
const shareURL = id => location.origin + location.pathname + "?view=" + id;
function normalizeKind(kind, map) {
  if (kind === "sheets") Object.values(map).forEach(sh => { sh.columns = Array.isArray(sh.columns) ? sh.columns : Object.values(sh.columns || {}); sh.columns.forEach(c => { if (c.type === "select") c.options = Array.isArray(c.options) ? c.options : Object.values(c.options || {}); }); if (sh.cardFields && !Array.isArray(sh.cardFields)) sh.cardFields = Object.values(sh.cardFields); });
  if (kind === "rows") Object.values(map).forEach(r => { r.cells = r.cells || {}; });
  if (kind === "trackers") Object.values(map).forEach(t => { if (t.holidays && !Array.isArray(t.holidays)) t.holidays = Object.values(t.holidays); if (t.statuses && !Array.isArray(t.statuses)) t.statuses = Object.values(t.statuses); });
  return map;
}
const shareIdx = () => FB.ref(`users/${ME.uid}/shareIndex`);
function startShares() {
  let first = true;
  shareIdx().on("value", snap => { SHARES = snap.val() || {}; if (first) { first = false; Object.keys(SHARES).forEach(id => pushShare(id).catch(() => {})); } });
}
function sharesWith(sid) { return Object.entries(SHARES).filter(([, m]) => m.sheets && m.sheets[sid]).map(([id]) => id); }
function mirrorShare(kind, id, c, was) {
  if (!ME || VIEWONLY || !Object.keys(SHARES).length) return;
  const w = (sh, path, v) => (v == null ? FB.ref(`shares/${sh}/${path}`).remove() : FB.ref(`shares/${sh}/${path}`).set(v)).catch(() => {});
  if (kind === "rows") { const sid = (c || was || {}).sheetId; sharesWith(sid).forEach(sh => w(sh, `rows/${id}`, c)); if (c && was && was.sheetId && was.sheetId !== c.sheetId) sharesWith(was.sheetId).forEach(sh => w(sh, `rows/${id}`, null)); }
  else if (kind === "sheets") sharesWith(id).forEach(sh => w(sh, `sheets/${id}`, c));
  else if (kind === "trackers") Object.entries(SHARES).filter(([, m]) => m.trackerId === id).forEach(([sh]) => c && w(sh, "tracker", c));
}
async function pushShare(id) {
  const m = SHARES[id]; if (!m) return;
  const sheets = {}, rows = {}, tid0 = m.trackerId;
  Object.keys(m.sheets || {}).forEach(sid => { if (S.sheets[sid]) sheets[sid] = JSON.parse(JSON.stringify(S.sheets[sid])); });
  Object.entries(S.rows).forEach(([rid, r]) => { if (sheets[r.sheetId]) rows[rid] = JSON.parse(JSON.stringify(r)); });
  const t = S.trackers[tid0] || trackerList().find(x => x.id === tid0) || {name: "Tracker"};
  const emails = {}; Object.values(m.emails || {}).forEach(e => { emails[emailKey(e)] = true; });
  await FB.ref(`shares/${id}`).set({owner: ME.uid, ownerEmail: ME.email || "", title: m.title || "", mode: m.mode, emails, trackerId: tid0, tracker: JSON.parse(JSON.stringify({...t, id: undefined})), sheets, rows, updatedAt: new Date().toISOString()});
}
function newShareId() { const a = new Uint8Array(15); crypto.getRandomValues(a); return Array.from(a, b => "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 57]).join(""); }
function copyText(t) { (navigator.clipboard?.writeText(t) || Promise.reject()).then(() => toast("Link copied"), () => { prompt("Copy this link:", t); }); }
function openShares(editId) {
  if (!ME) return; const ct = curTracker(); if (!ct) { toast("Create a tracker first"); return; }
  const list = Object.entries(SHARES).sort((a, b) => (b[1].createdAt || "").localeCompare(a[1].createdAt || ""));
  const ed = editId ? SHARES[editId] : null;
  const pickT = ed ? ed.trackerId : ct.id, shs = sheetList(pickT);
  const preSel = ed ? new Set(Object.keys(ed.sheets || {})) : new Set(S.view === "sheet" && S.sheetId ? [S.sheetId] : []);
  let mode = ed ? ed.mode : "emails";
  const accessTxt = m => m.mode === "link" ? "Anyone with the link" : `${Object.keys(m.emails || {}).length} ${Object.keys(m.emails || {}).length === 1 ? "person" : "people"}: ${Object.values(m.emails || {}).slice(0, 3).map(esc).join(", ")}${Object.keys(m.emails || {}).length > 3 ? "…" : ""}`;
  openDialog({
    eyebrow: ed ? "Edit link" : `${list.length} active link${list.length === 1 ? "" : "s"}`, title: ed ? (ed.title || "Shared sheets") : "Share sheets", saveLabel: ed ? "Save changes" : "Create link",
    body: () => `${!ed && list.length ? `<div class="field"><span class="lbl">Your links</span><div class="shlist">${list.map(([id, m]) => { const n = Object.keys(m.sheets || {}).filter(x => S.sheets[x]).length; return `<div class="shrow" data-sh="${esc(id)}"><div class="shmain"><b>${esc(m.title || "Shared sheets")}</b><span class="hint">${n} sheet${n === 1 ? "" : "s"} · ${accessTxt(m)}</span><input class="inp mini" readonly value="${esc(shareURL(id))}" aria-label="Link"></div><div class="shacts"><button type="button" class="btn" data-shcopy>Copy link</button><button type="button" class="btn ghost" data-shedit>Edit</button><button type="button" class="btn ghost" data-shstop style="color:var(--bad)">Stop sharing</button></div></div>`; }).join("")}</div></div><div class="or-line">New link</div>` : ""}
      <div class="field"><label for="sh_title">Link name <span class="typ">shown to viewers</span></label><input class="inp" id="sh_title" value="${esc(ed ? ed.title : (preSel.size === 1 ? S.sheets[[...preSel][0]]?.name : `${ct.name} sheets`) || "")}"></div>
      <div class="field"><span class="lbl">Sheets to share <span class="typ">from ${esc((trackerList().find(t => t.id === pickT) || {}).name || "")}</span></span><div class="shsheets">${shs.map(s0 => `<label class="ck"><input type="checkbox" data-shs="${esc(s0.id)}" ${preSel.has(s0.id) ? "checked" : ""}> ${esc(s0.name)} <span class="n">${rowsOf(s0.id).length}</span></label>`).join("")}</div></div>
      <div class="field"><span class="lbl">Who can view</span><div class="choices" id="sh_mode">
        <button type="button" class="choice" data-v="emails" aria-pressed="${mode === "emails"}"><b>Only people I add</b><span>They sign in with that email</span></button>
        <button type="button" class="choice" data-v="link" aria-pressed="${mode === "link"}"><b>Anyone with the link</b><span>No sign-in. Anyone it's forwarded to can view</span></button></div></div>
      <div class="field" id="sh_emf" ${mode === "link" ? "hidden" : ""}><label for="sh_em">Email addresses <span class="typ">comma or new line</span></label><textarea class="inp" id="sh_em" rows="3" placeholder="manager@bank.com, colleague@fable.com">${esc(ed ? Object.values(ed.emails || {}).join(", ") : "")}</textarea><span class="hint">They sign in with Google, or with email and password. If they use a password, they confirm their email once.</span></div>
      <p class="hint" style="margin:0">Viewers can't change anything. They see your edits to these sheets live, until you stop sharing. Notes, status colours and aging come along; your other sheets stay private.</p>`,
    mount: root => {
      const g = root.querySelector("#sh_mode"); g.dataset.s = mode; pressGroup(g, ".choice", "s"); g.addEventListener("pick", () => { mode = g.dataset.s; root.querySelector("#sh_emf").hidden = mode === "link"; });
      root.querySelectorAll(".shrow").forEach(r => { const id = r.dataset.sh;
        r.querySelector("[data-shcopy]").onclick = () => copyText(shareURL(id));
        r.querySelector("[data-shedit]").onclick = () => { closeDialog(true); openShares(id); };
        const st = r.querySelector("[data-shstop]"); st.onclick = async () => { if (!st.dataset.armed) { st.dataset.armed = "1"; st.textContent = "Click again to stop"; return; } await FB.ref(`shares/${id}`).remove().catch(() => {}); await shareIdx().child(id).remove(); delete SHARES[id]; toast("Link turned off"); closeDialog(true); openShares(); }; });
    },
    onSave: async root => {
      const sheets = {}; root.querySelectorAll("[data-shs]:checked").forEach(i => sheets[i.dataset.shs] = true);
      if (!Object.keys(sheets).length) { toast("Tick at least one sheet"); return false; }
      const emails = {}; if (mode === "emails") { const list2 = root.querySelector("#sh_em").value.split(/[\s,;]+/).map(x => x.trim().toLowerCase()).filter(Boolean);
        const bad = list2.filter(x => !/^[^@\s#$\[\]\/]+@[^@\s#$\[\]\/]+\.[^@\s#$\[\]\/]+$/.test(x)); if (bad.length) { toast("Check these emails: " + bad.join(", ")); return false; }
        if (!list2.length) { toast("Add at least one email, or choose Anyone with the link"); return false; } list2.forEach(e => emails[emailKey(e)] = e); }
      const id = editId || newShareId();
      const meta = {title: root.querySelector("#sh_title").value.trim() || "Shared sheets", sheets, mode, emails, trackerId: pickT, createdAt: ed?.createdAt || new Date().toISOString()};
      try { await shareIdx().child(id).set(meta); SHARES[id] = meta; await pushShare(id); }
      catch (e) { toast(e.code === "PERMISSION_DENIED" || /permission/i.test(e.message || "") ? "Sharing is blocked by the database rules. Publish the rules from README step 1.3." : "Couldn't share: " + e.message); return false; }
      copyText(shareURL(id));
      closeDialog(true); openShares(); return false;
    }
  });
}
/* ---------- Viewer (someone opened a ?view= link) ---------- */
function startViewer(auth) {
  VIEWONLY = true; document.body.classList.add("viewonly");
  store = {mode: "view", async put() { toast("View only. You can't change a shared sheet."); }, async del() { toast("View only. You can't change a shared sheet."); }};
  const bar = document.createElement("div"); bar.className = "viewbar"; bar.id = "viewBar"; bar.innerHTML = `${SHARE_ICON}<span>View only</span>`; document.body.append(bar);
  let ref = null, gotData = false;
  const show = (html) => gate(`<div class="brand-mark" style="width:44px;height:44px">BT</div>${html}`);
  const sub = () => {
    if (ref) ref.off();
    ref = FB.ref(`shares/${VIEW_ID}`);
    ref.on("value", snap => {
      const d = snap.val();
      if (!d) { show(`<h1>This link isn't active</h1><p>The owner stopped sharing these sheets, or the link is incomplete. Ask them for a new link.</p>`); return; }
      const T = d.trackerId || "shared", sheets = normalizeKind("sheets", d.sheets || {}), rows = normalizeKind("rows", d.rows || {});
      Object.values(sheets).forEach(x => x.trackerId = T);
      S.trackers = normalizeKind("trackers", {[T]: {...(d.tracker || {name: "Shared"}), name: d.title || d.tracker?.name || "Shared sheets"}}); S.sheets = sheets; S.rows = rows; S.trackerId = T;
      if (!S.sheetId || !S.sheets[S.sheetId]) { const f = Object.entries(sheets).sort((a, b) => (a[1].order ?? 0) - (b[1].order ?? 0))[0]; S.sheetId = f ? f[0] : null; S.view = f ? "sheet" : "home"; }
      bar.innerHTML = `${SHARE_ICON}<span><b>View only</b> · shared by ${esc(d.ownerEmail || "the owner")} · live</span>`;
      S.ready = true; setSync("ok", "Live · view only"); $("#gate").hidden = true; gotData = true;
      if (!drawerOpen() && !CM && $("#dlg").hidden) render(); else renderNav();
    }, err => {
      const u = auth.currentUser;
      if (!u || u.isAnonymous) { showSignIn("These sheets are shared with specific people. Sign in with the email they were shared with. If you're sure you're on the list, the owner may have turned this link off."); return; }
      if (u.providerData?.some(p => p.providerId === "password") && !u.emailVerified) {
        show(`<h1>Confirm your email</h1><p>You're signed in as <b>${esc(u.email)}</b>. To open shared sheets, confirm this email address once.</p><button class="btn primary" type="button" id="vfSend">Send confirmation email</button><button class="btn" type="button" id="vfDone">I've confirmed it</button><button class="btn ghost" type="button" id="vfOut">Use a different account</button><div id="vfMsg" class="ok"></div>`);
        $("#vfSend").onclick = () => u.sendEmailVerification().then(() => $("#vfMsg").textContent = "Sent. Check your inbox, click the link, then come back here.").catch(e => $("#vfMsg").textContent = e.message);
        $("#vfDone").onclick = async () => { await u.reload(); await u.getIdToken(true); sub(); };
        $("#vfOut").onclick = () => auth.signOut();
        return;
      }
      show(`<h1>No access</h1><p><b>${esc(u.email || "This account")}</b> isn't on the list for this link, or the owner turned the link off. Ask the owner to add your email, or sign in with the email they used.</p><button class="btn" type="button" id="vfOut">Use a different account</button>`);
      $("#vfOut").onclick = () => auth.signOut();
    });
  };
  auth.onAuthStateChanged(user => {
    ME = user && !user.isAnonymous ? user : null;
    $("#userChip").hidden = !ME; if (ME) { $("#userEmail").textContent = ME.email || "Signed in"; $("#signOutBtn").textContent = "Sign out"; }
    sub();
  });
  $("#signOutBtn").onclick = () => auth.signOut().then(() => location.replace(location.href));
  window.addEventListener("pageshow", e => { if (e.persisted) location.reload(); });
  // view-only guards
  const OK_ACTS = new Set(["toggleside", "theme", "fullscreen", "export", "exportone", "filter", "clear", "fmt", "cmdk", "keys", "onlyred", "attn", "ai", "notecancel"]);
  document.addEventListener("click", e => {
    if (!VIEWONLY) return;
    const a = e.target.closest("[data-act]");
    if (a && !OK_ACTS.has(a.dataset.act) && !a.closest("#dlg") && !a.closest("#modal")) { e.preventDefault(); e.stopImmediatePropagation(); toast("View only"); return; }
    if (e.target.closest("[data-imp], .rowck, [data-dragcol] .rsz")) { e.preventDefault(); e.stopImmediatePropagation(); return; }
    const td = e.target.closest("td[data-cell]");
    if (td && !e.target.closest("[data-rmksum]")) { e.preventDefault(); e.stopImmediatePropagation(); const tr = td.closest("tr[data-row]"); if (tr) openDrawer(S.rows[tr.dataset.row]?.sheetId, tr.dataset.row); }
  }, true);
  document.addEventListener("keydown", e => { if (!VIEWONLY) return; const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName); if (!typing && (e.key === "n" || e.key === "N" || ((e.ctrlKey || e.metaKey) && /^[zZvV]$/.test(e.key)))) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);
  document.addEventListener("paste", e => { if (VIEWONLY) e.stopImmediatePropagation(); }, true);
  document.addEventListener("dragstart", e => { if (VIEWONLY) e.preventDefault(); }, true);
  const od = openDrawer; openDrawer = function (...a) { od.apply(this, a); if (!VIEWONLY) return; $("#drTitle").textContent = $("#drTitle").textContent === "New entry" ? "Entry" : $("#drTitle").textContent; $("#drForm").querySelectorAll("input, textarea, select, button").forEach(el => { if (el.tagName === "BUTTON") el.disabled = true; else el.readOnly = el.disabled = true; }); };
}
/* ---------- Dashboard sharing with View / Edit access (GitHub + Firebase only) ----------
   Single source of truth: collaborators read and write the OWNER's data directly
   (users/<ownerUid>/tracker/...). Nothing is copied. The database rules allow it
   only for sheets listed in the owner's ACL (users/<ownerUid>/acl), which this file
   keeps in step with each dashboard's people list.
   Link format: index.html?dash=<ownerUid>~<dashboardId>                        */
const COLLAB_ID = (new URLSearchParams(location.search).get("dash") || "").replace(/[^A-Za-z0-9_~-]/g, "");
let SHAREDME = {}, lastAcl = "", aclT = null;
const dashLink = (uidOwner, did) => location.origin + location.pathname + "?dash=" + uidOwner + "~" + did;
const arrv = v => Array.isArray(v) ? v : v && typeof v === "object" ? Object.values(v) : [];
const shareOf = d => (d && d.share && typeof d.share === "object") ? d.share : {};
function sheetsOfDash(d) {
  const ids = new Set(arrv(d.sheets));
  arrv(d.widgets).forEach(w => { if (w.sheetId) ids.add(w.sheetId); arrv(w.sheets).forEach(x => ids.add(x)); });
  return [...ids].filter(Boolean);
}
/* ---- owner side: keep ACL + inboxes in step with dashboards ---- */
function collabHook(kind, id, c, was) {
  if (kind !== "dashboards" || !ME || window.BT_COLLAB) return;
  if (!c && was) Object.keys(shareOf(was)).forEach(ek => FB.ref(`inbox/${ek}/${ME.uid}~${id}`).remove().catch(() => {}));
  scheduleAcl();
}
function scheduleAcl() { clearTimeout(aclT); aclT = setTimeout(() => syncAcl().catch(e => toast("Couldn't update sharing: " + (e.code === "PERMISSION_DENIED" ? "publish the database rules from README step 1.3" : e.message))), 500); }
async function syncAcl() {
  if (!ME || window.BT_COLLAB) return;
  const acl = {sheets: {}, trackers: {}, dash: {}}, rank = {view: 1, edit: 2}, inbox = [];
  for (const [did, d] of Object.entries(S.dashboards || {})) {
    const members = Object.entries(shareOf(d)); if (!members.length) continue;
    const sids = sheetsOfDash(d), tid0 = d.trackerId || "bcp";
    for (const [ek, m] of members) {
      const role = m.role === "edit" ? "edit" : "view";
      (acl.dash[did] = acl.dash[did] || {})[ek] = role;
      (acl.trackers[tid0] = acl.trackers[tid0] || {})[ek] = true;
      for (const sid of sids) { const cur = acl.sheets[sid]?.[ek]; if (!cur || rank[role] > rank[cur]) (acl.sheets[sid] = acl.sheets[sid] || {})[ek] = role; }
      inbox.push([ek, did, {owner: ME.uid, ownerEmail: ME.email || "", dash: did, title: d.name || "Dashboard", role, at: d.updatedAt || ""}]);
    }
  }
  const key = JSON.stringify(acl) + JSON.stringify(inbox);
  if (key === lastAcl) return; lastAcl = key;
  await FB.ref(`users/${ME.uid}/acl`).set(acl);
  await Promise.all(inbox.map(([ek, did, v]) => FB.ref(`inbox/${ek}/${ME.uid}~${did}`).set(v).catch(() => {})));
}
function startInbox() {
  if (!ME?.email) return;
  FB.ref(`inbox/${emailKey(ME.email)}`).on("value", snap => { SHAREDME = snap.val() || {}; renderNav(); }, () => { SHAREDME = {}; });
}
function openDashShare(d) {
  if (!ME) return;
  const people = Object.entries(shareOf(d)).map(([ek, m]) => ({ek, email: m.email, role: m.role === "edit" ? "edit" : "view"}));
  const before = new Set(people.map(p => p.ek));
  const names = sheetsOfDash(d).map(sid => S.sheets[sid]?.name).filter(Boolean);
  const draw = root => {
    root.querySelector("#ds_list").innerHTML = people.length ? people.map((p, i) => `<div class="dsrow" data-i="${i}"><span class="av" style="--h:${(p.email.length * 47) % 360}">${esc(p.email[0].toUpperCase())}</span><span class="dse">${esc(p.email)}</span>
      <select class="inp mini" data-dsr aria-label="Access for ${esc(p.email)}"><option value="view" ${p.role === "view" ? "selected" : ""}>Can view</option><option value="edit" ${p.role === "edit" ? "selected" : ""}>Can edit data</option></select><button type="button" class="dw-ib red" data-dsx aria-label="Remove ${esc(p.email)}">✕</button></div>`).join("")
      : `<div class="hint">Nobody yet. Add people by email below.</div>`;
  };
  openDialog({
    eyebrow: d.name, title: "Share dashboard", saveLabel: "Save sharing",
    body: () => `<div class="field"><span class="lbl">People with access</span><div id="ds_list" class="dslist"></div></div>
      <div class="field"><label for="ds_em">Add people <span class="typ">emails, comma separated</span></label><div class="row2" style="flex:none"><input class="inp" id="ds_em" placeholder="manager@bank.com, colleague@fable.com" style="flex:1"><select class="inp" id="ds_role" style="flex:none;width:auto"><option value="view">Can view</option><option value="edit">Can edit data</option></select><button class="btn" type="button" id="ds_add" style="flex:none">Add</button></div></div>
      <div class="field"><span class="lbl">Link</span><div class="row2" style="flex:none"><input class="inp mini" readonly value="${esc(dashLink(ME.uid, d.id))}" style="flex:1;font-family:var(--f-mono);font-size:12px"><button class="btn" type="button" id="ds_copy" style="flex:none">Copy link</button></div><span class="hint">Only the people above can open it. They sign in with that email (Google, or email + password with the email confirmed once).</span></div>
      <div class="banner" style="font-size:13px"><b>Can view</b>: sees the dashboard and its source sheets live. <b>Can edit data</b>: can also add, change and delete entries in ${names.length ? names.map(n => `<b>${esc(n)}</b>`).join(", ") : "the source sheets"}. Edits go straight into your sheets, so everyone sees the same data. Nobody but you can change the charts, sheet columns or your other sheets.</div>`,
    mount: root => {
      draw(root);
      const add = () => { const list = root.querySelector("#ds_em").value.split(/[\s,;]+/).map(x => x.trim().toLowerCase()).filter(Boolean), role = root.querySelector("#ds_role").value;
        const bad = list.filter(x => !/^[^@\s#$\[\]\/]+@[^@\s#$\[\]\/]+\.[^@\s#$\[\]\/]+$/.test(x)); if (bad.length) { toast("Check these emails: " + bad.join(", ")); return; }
        if (list.includes((ME.email || "").toLowerCase())) toast("You already own this dashboard.");
        list.filter(e => e !== (ME.email || "").toLowerCase()).forEach(e => { const ek = emailKey(e), ex = people.find(p => p.ek === ek); if (ex) ex.role = role; else people.push({ek, email: e, role}); });
        root.querySelector("#ds_em").value = ""; draw(root); };
      root.querySelector("#ds_add").onclick = add; root.querySelector("#ds_em").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); add(); } });
      root.querySelector("#ds_copy").onclick = () => copyText(dashLink(ME.uid, d.id));
      root.querySelector("#ds_list").addEventListener("change", e => { const r = e.target.closest("[data-i]"); if (r && e.target.matches("[data-dsr]")) people[+r.dataset.i].role = e.target.value; });
      root.querySelector("#ds_list").addEventListener("click", e => { const r = e.target.closest("[data-i]"); if (r && e.target.closest("[data-dsx]")) { people.splice(+r.dataset.i, 1); draw(root); } });
    },
    onSave: async root => {
      if (root.querySelector("#ds_em").value.trim()) root.querySelector("#ds_add").click();
      const share = {}; people.forEach(p => share[p.ek] = {email: p.email, role: p.role});
      const removed = [...before].filter(ek => !share[ek]);
      const cur = S.dashboards[d.id];
      try {
        await store.put("dashboards", d.id, {...cur, share, ownerEmail: ME.email || "", trackerName: (trackerList().find(t => t.id === (cur.trackerId || "bcp")) || {}).name || ""});
        await Promise.all(removed.map(ek => FB.ref(`inbox/${ek}/${ME.uid}~${d.id}`).remove().catch(() => {})));
        lastAcl = ""; await syncAcl();
        toast(people.length ? `Shared with ${people.length} ${people.length === 1 ? "person" : "people"}` : "Sharing turned off");
      } catch (e) { toast("Couldn't save sharing: " + (e.code === "PERMISSION_DENIED" ? "publish the database rules from README step 1.3" : e.message)); return false; }
    }
  });
}
window.BTShare = {
  dashButton: d => window.BT_COLLAB ? "" : `<button class="btn" type="button" data-act="dashshare">${SHARE_ICON} Share${Object.keys(shareOf(S.dashboards[d.id])).length ? ` · ${Object.keys(shareOf(S.dashboards[d.id])).length}` : ""}</button>`,
  navHTML: () => { const items = Object.entries(SHAREDME); if (!items.length || window.BT_COLLAB) return "";
    return `<div class="side-label"><span>Shared with me</span></div>${items.map(([k, x]) => `<button type="button" data-openshared="${esc(k)}" title="Shared by ${esc(x.ownerEmail || "")}"><span class="dico">${SHARE_ICON}</span><span class="nm">${esc(x.title || "Dashboard")}</span><span class="ct">${x.role === "edit" ? "edit" : "view"}</span></button>`).join("")}`; }
};
document.addEventListener("click", e => {
  const o = e.target.closest("[data-openshared]"); if (o) { location.href = location.pathname + "?dash=" + encodeURIComponent(o.dataset.openshared); return; }
  if (e.target.closest("[data-act]")?.dataset.act === "dashshare") { const d = S.dashboards[S.dashId]; if (d) openDashShare({id: S.dashId, ...d}); }
});
/* ---- collaborator side ---- */
const OWNER_ONLY = new Set(["newsheet", "newtracker", "edittracker", "delsheet", "dupsheet", "editsheet", "splitsec", "statusset", "workflow", "assignset", "people", "remarkset", "cardset", "holidays", "share", "import", "importx", "addcol", "addaging", "addcolq", "noteedit", "noteclear", "notesave", "newdash", "dashshare", "backup", "xlupdate"]);
function collabGuards() {
  document.body.classList.add("collab");
  document.addEventListener("click", e => {
    if (!window.BT_COLLAB) return;
    const a = e.target.closest("[data-act]");
    if (a && OWNER_ONLY.has(a.dataset.act) && !a.closest("#dlg")) { e.preventDefault(); e.stopImmediatePropagation(); toast("Only the owner can change this."); return; }
    if (window.BT_COLLAB.role !== "edit") {
      if (a && !["toggleside", "theme", "fullscreen", "export", "exportone", "filter", "clear", "fmt", "cmdk", "keys", "onlyred", "attn", "ai", "notecancel", "dashedit"].includes(a.dataset.act) && !a.closest("#dlg") && !a.closest("#modal")) { e.preventDefault(); e.stopImmediatePropagation(); toast("View only"); return; }
      if (e.target.closest("[data-imp], .rowck")) { e.preventDefault(); e.stopImmediatePropagation(); return; }
      const td = e.target.closest("td[data-cell]"); if (td && !e.target.closest("[data-rmksum]")) { e.preventDefault(); e.stopImmediatePropagation(); const tr = td.closest("tr[data-row]"); if (tr) openDrawer(S.rows[tr.dataset.row]?.sheetId, tr.dataset.row); }
    }
  }, true);
  document.addEventListener("keydown", e => { if (!window.BT_COLLAB || window.BT_COLLAB.role === "edit") return; const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName); if (!typing && (e.key === "n" || e.key === "N" || ((e.ctrlKey || e.metaKey) && /^[zZvV]$/.test(e.key)))) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);
  document.addEventListener("paste", e => { if (window.BT_COLLAB && window.BT_COLLAB.role !== "edit") e.stopImmediatePropagation(); }, true);
  const od = openDrawer; openDrawer = function (...a) { od.apply(this, a); if (!window.BT_COLLAB || window.BT_COLLAB.role === "edit") return; $("#drForm").querySelectorAll("input, textarea, select, button").forEach(el => { if (el.tagName === "BUTTON") el.disabled = true; else el.readOnly = el.disabled = true; }); };
}
function collabProblem(err, what) {
  const u = firebase.auth().currentUser;
  if (u && u.providerData?.some(p => p.providerId === "password") && !u.emailVerified) {
    gate(`<div class="brand-mark" style="width:44px;height:44px">BT</div><h1>Confirm your email</h1><p>You're signed in as <b>${esc(u.email)}</b>. To open a dashboard someone shared with you, confirm this email address once.</p><button class="btn primary" type="button" id="vfSend">Send confirmation email</button><button class="btn" type="button" id="vfDone">I've confirmed it</button><button class="btn ghost" type="button" id="vfOut">Use a different account</button><div id="vfMsg" class="ok"></div>`);
    $("#vfSend").onclick = () => u.sendEmailVerification().then(() => $("#vfMsg").textContent = "Sent. Check your inbox, click the link, then come back here.").catch(e => $("#vfMsg").textContent = e.message);
    $("#vfDone").onclick = async () => { await u.reload(); await u.getIdToken(true); location.reload(); };
    $("#vfOut").onclick = () => doSignOut("Signed out. Sign in with the email the dashboard was shared with.");
    return;
  }
  gate(`<div class="brand-mark" style="width:44px;height:44px">BT</div><h1>No access</h1><p>${what || `<b>${esc(u?.email || "This account")}</b> doesn't have access to this dashboard, or the owner stopped sharing it.`} Ask the owner to share it with your email, or sign in with the email they used.</p><button class="btn primary" type="button" id="vfHome">Go to my trackers</button><button class="btn ghost" type="button" id="vfOut">Use a different account</button>`);
  $("#vfHome").onclick = () => location.replace(location.pathname);
  $("#vfOut").onclick = () => doSignOut("Signed out.");
}
function startCollab() {
  const [owner, did] = COLLAB_ID.split("~"); if (!owner || !did) { collabProblem(null, "This link is incomplete."); return; }
  const base = `users/${owner}/${ROOT}`, ek = emailKey(ME.email), rowsBy = {}, subs = new Set(), clean = d => JSON.parse(JSON.stringify(d));
  collabGuards();
  const bar = document.createElement("div"); bar.className = "viewbar collabbar"; bar.id = "viewBar"; document.body.append(bar);
  store = wrapStore({mode: "cloud",
    async put(kind, id, data) {
      const C = window.BT_COLLAB; if (!C || C.role !== "edit" || !["rows", "sheets"].includes(kind)) { toast(C?.role === "edit" ? "Only the owner can change this." : "View only"); return; }
      S[kind][id] = data; bumpPending(1); const c = clean(data); if (kind === "rows") c.updatedBy = ME.email || "Signed-in user";
      try { await FB.ref(`${base}/${kind}/${id}`).set(c); } catch (e) { toast("Couldn't save: " + (e.code === "PERMISSION_DENIED" ? "you don't have edit access to this sheet" : e.message)); } finally { bumpPending(-1); }
    },
    async del(kind, id) {
      const C = window.BT_COLLAB; if (!C || C.role !== "edit" || kind !== "rows") { toast(C?.role === "edit" ? "Only the owner can delete this." : "View only"); return; }
      const was = S.rows[id]; delete S.rows[id]; bumpPending(1);
      try { await FB.ref(`${base}/rows/${id}`).remove(); } catch (e) { if (was) S.rows[id] = was; toast("Couldn't delete: " + (e.code === "PERMISSION_DENIED" ? "you don't have edit access to this sheet" : e.message)); render(); } finally { bumpPending(-1); }
    }});
  setSync("saving", "Opening shared dashboard…");
  let rT = null; const soon = () => { clearTimeout(rT); rT = setTimeout(() => { if (!drawerOpen() && !CP && !CM && $("#dlg").hidden && $("#modal").hidden) render(); else renderNav(); }, 40); };
  const listen = (ref, ok, bad) => { SYNC_REFS.push(ref); ref.on("value", ok, bad); };
  const watchSheet = sid => {
    if (subs.has(sid)) return; subs.add(sid);
    listen(FB.ref(`${base}/sheets/${sid}`), snap => { const v = snap.val(); if (v) { S.sheets[sid] = normalizeKind("sheets", {[sid]: v})[sid]; } else delete S.sheets[sid]; soon(); }, () => { delete S.sheets[sid]; soon(); });
    listen(FB.ref(`${base}/rows`).orderByChild("sheetId").equalTo(sid), snap => {
      rowsBy[sid] = normalizeKind("rows", snap.val() || {});
      const all = {}; Object.values(rowsBy).forEach(m => Object.assign(all, m)); S.rows = all; soon();
    }, () => { rowsBy[sid] = {}; soon(); });
  };
  let first = true;
  listen(FB.ref(`${base}/dashboards/${did}`), snap => {
    const d = snap.val();
    if (!d) { collabProblem(null, "This dashboard was deleted, or isn't shared with you anymore."); return; }
    const m = shareOf(d)[ek]; if (!m) { collabProblem(null); return; }
    const role = m.role === "edit" ? "edit" : "view";
    window.BT_COLLAB = {role, owner, ownerEmail: d.ownerEmail || "", dashId: did};
    document.body.classList.toggle("viewonly", role !== "edit");
    const tid0 = d.trackerId || "bcp";
    S.dashboards = {[did]: d}; S.trackerId = tid0;
    if (!S.trackers[tid0]) S.trackers[tid0] = {name: d.trackerName || "Shared", order: 0};
    sheetsOfDash(d).forEach(watchSheet);
    bar.innerHTML = `${SHARE_ICON}<span><b>${role === "edit" ? "You can edit the data" : "View only"}</b> · shared by ${esc(d.ownerEmail || "the owner")} · live</span><a href="${esc(location.pathname)}">My trackers</a>`;
    if (first) {
      first = false; S.view = "dash"; S.dashId = did;
      listen(FB.ref(`${base}/trackers/${tid0}`), s2 => { const t = s2.val(); S.trackers = normalizeKind("trackers", {[tid0]: {...(t || {}), name: (t && t.name) || d.trackerName || "Shared"}}); soon(); }, () => {});
      S.ready = true; setSync("ok", role === "edit" ? "Live · shared · you can edit" : "Live · shared · view only"); $("#gate").hidden = true;
    }
    soon();
  }, err => collabProblem(err));
}

function startSync() {
  const BASE = `users/${ME.uid}/${ROOT}`;
  const ref = p => FB.ref(`${BASE}/${p}`);
  const clean = d => JSON.parse(JSON.stringify(d));
  store = { mode: "cloud",
    async put(kind, id, data) { S[kind][id] = data; bumpPending(1); const c = clean(data); if (kind === "rows" && ME) c.updatedBy = ME.email || ME.displayName || "Signed-in user"; try { await ref(`${kind}/${id}`).set(c); mirrorShare(kind, id, c); collabHook(kind, id, c); } catch (e) { toast("Couldn't save: " + (e.code === "PERMISSION_DENIED" ? "your account doesn't have write access" : e.message)); } finally { bumpPending(-1); } },
    async del(kind, id) { const was = S[kind][id]; delete S[kind][id]; bumpPending(1); try { await ref(`${kind}/${id}`).remove(); mirrorShare(kind, id, null, was); collabHook(kind, id, null, was); } catch (e) { toast("Couldn't delete: " + e.message); } finally { bumpPending(-1); } } };
  store = wrapStore(store);
  setSync("saving", "Loading your sheets…");
  let got = {trackers: false, sheets: false, rows: false}, online = true;
  const timer = setTimeout(() => { if (!got.sheets || !got.rows || !got.trackers) { setSync("offline", "Can't reach the database yet"); S.ready = true; render(); } }, 10000);
  let rT = null; const soon = () => { clearTimeout(rT); rT = setTimeout(render, 40); };
  FB.ref(".info/connected").on("value", s => { online = !!s.val(); if (S.ready) setSync(online ? (pending ? "saving" : "ok") : "offline", online ? (pending ? "Saving…" : "Live · all changes saved") : "Offline · changes sync when you reconnect"); });
  for (const kind of ["trackers", "sheets", "rows", "dashboards"]) {
    SYNC_REFS.push(ref(kind));
    ref(kind).on("value", snap => {
      const map = snap.val() || {};
      if (kind === "sheets") Object.values(map).forEach(sh => { sh.columns = Array.isArray(sh.columns) ? sh.columns : Object.values(sh.columns || {}); sh.columns.forEach(c => { if (c.type === "select") c.options = Array.isArray(c.options) ? c.options : Object.values(c.options || {}); }); });
      if (kind === "rows") Object.values(map).forEach(r => { r.cells = r.cells || {}; });
      if (kind === "trackers") Object.values(map).forEach(t => { if (t.holidays && !Array.isArray(t.holidays)) t.holidays = Object.values(t.holidays); });
      normalizeKind(kind, map); S[kind] = map; got[kind] = true;
      if (got.sheets && got.rows && got.trackers && !S.ready) { clearTimeout(timer); S.ready = true; setSync("ok", "Live · all changes saved"); offerLegacyCopy(BASE); startShares(); startInbox(); scheduleAcl(); }
      if (S.sheetId && !S.sheets[S.sheetId] && got.sheets) { S.view = "home"; S.sheetId = null; }
      if (!drawerOpen() && !CP && !CM && !gridHasFocus() && $("#dlg").hidden && $("#modal").hidden) soon(); else renderNav();
    }, err => { clearTimeout(timer); setSync("offline", err.code === "PERMISSION_DENIED" ? "No access · check database rules" : "Sync stopped: " + err.message); S.ready = true; render(); if (err.code === "PERMISSION_DENIED") toast("Your account can't open its data. Publish the database rules from README step 1.3 (private per user)."); });
  }
}
function bumpPendingCloud() {}
/* One-time: copy data from the old shared folder into this account's private folder */
async function offerLegacyCopy(BASE) {
  if (Object.keys(S.sheets).length || Object.keys(S.trackers).length) return;
  const skipKey = "bt-legacy-skip-" + ME.uid; try { if (localStorage.getItem(skipKey)) return; } catch (e) {}
  let old; try { old = (await FB.ref(ROOT).once("value")).val(); } catch (e) { return; }  // no access = nothing to offer
  if (!old || !old.sheets) return;
  const n = k => Object.keys(old[k] || {}).length;
  openDialog({
    eyebrow: "Private data", title: "Copy your existing trackers into your account?", saveLabel: "Copy into my account",
    body: () => `<p style="margin:0">Your account now has its own private space, and it's empty. Data from the old shared version was found: <b>${n("trackers")} trackers, ${n("sheets")} sheets, ${n("rows")} entries</b>.</p><p class="hint" style="margin:10px 0 0">Only copy it if this data is yours. After copying, publish the final database rules (README step 1.3) so nobody else can read the old shared copy.</p>`,
    onCancel: () => { try { localStorage.setItem(skipKey, "1"); } catch (e) {} },
    onSave: async () => { setSync("saving", "Copying…"); try { await FB.ref(BASE).set(old); toast(`Copied ${n("sheets")} sheets and ${n("rows")} entries into your account`); } catch (e) { toast("Couldn't copy: " + (e.code === "PERMISSION_DENIED" ? "publish the rules from README step 1.3 first" : e.message)); } }
  });
}
/* ---------- Derived ---------- */
const TCOLORS = ["#0C8565","#2F5DA8","#B4532A","#7A5CC2","#1B9AAA","#C2577A","#6B8E23","#A6640A"];
function trackerList() {
  const t = Object.entries(S.trackers).map(([id, x]) => ({id, ...x}));
  if (!S.trackers.bcp && Object.values(S.sheets).some(s => !s.trackerId || s.trackerId === "bcp")) t.push({id:"bcp", name:"BCP Bank", short:"BCP", order:0});
  return t.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name));
}
function curTracker() { const l = trackerList(); return l.find(t => t.id === S.trackerId) || l[0] || null; }
const tid = s => s.trackerId || "bcp";
const trackerColor = t => t?.color || TCOLORS[Math.max(0, trackerList().findIndex(x => x.id === t?.id)) % TCOLORS.length];
const shortOf = name => (name || "").replace(/\b(bank|ltd|limited|plc)\b/ig, "").trim().split(/\s+/).filter(Boolean).map(w => /^[A-Z0-9]{2,5}$/.test(w) ? w : w[0]).join("").toUpperCase().slice(0, 4) || "TRK";
function setTracker(id) { S.trackerId = id; S.view = "home"; S.sheetId = null; S.q = ""; try { localStorage.setItem("bcp-tracker-current", id); } catch (e) {} render(); window.scrollTo(0, 0); }
const allSheets = () => Object.entries(S.sheets).map(([id, s]) => ({id, ...s})).sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name));
const sheetList = (trk) => { const t = trk || curTracker()?.id || S.trackerId; return allSheets().filter(s => tid(s) === t); };
const rowsOf = sid => Object.entries(S.rows).filter(([, r]) => r.sheetId === sid).map(([id, r]) => ({id, ...r})).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
function statusCol(sh) {
  if (sh.statusCol) { const c = (sh.columns || []).find(x => x.id === sh.statusCol); if (c) return c; }
  const sel = (sh.columns || []).filter(c => c.type === "select");
  return sel.find(c => /status|integration/i.test(c.label)) || sel.find(c => /poc|owner|pending/i.test(c.label)) || sel.find(c => (c.options || []).length >= 2) || null;
}
function titleCol(sh) {
  const cols = sh.columns || [];
  const pick = sh.titleCol && cols.find(c => c.id === sh.titleCol); if (pick) return pick;
  return cols.find(c => /name|api|module|actionable|parameter|item|title|task/i.test(c.label) && c.type !== "number" && c.type !== "date") || cols.find(c => c.type === "text") || cols.find(c => c.type === "long") || cols[0];
}
function lastUpdated(rows) { return rows.reduce((m, r) => (r.updatedAt || "") > m ? r.updatedAt : m, ""); }
function distribution(sh, rows) {
  const sc = statusCol(sh); if (!sc) return null;
  const m = new Map(); rows.forEach(r => { const v = (r.cells || {})[sc.id] || "—"; m.set(v, (m.get(v) || 0) + 1); });
  const arr = [...m.entries()].map(([v, n]) => ({v, n, t: v === "—" ? "neu" : tone(v)})).sort((a, b) => TONE_ORDER[a.t] - TONE_ORDER[b.t] || b.n - a.n);
  return {col: sc, arr};
}
const SWATCH = ["#0C8565","#F2A93B","#2F5DA8","#BF3A31","#7A5CC2","#1B9AAA","#C2577A","#6B8E23"];

/* ---------- Render ---------- */
function renderNav() {
  const ct = curTracker();
  $("#trkName").textContent = ct ? ct.name : "No tracker yet";
  $("#trkMark").textContent = ct ? (ct.short || shortOf(ct.name)) : "+";
  $("#trkMark").style.background = ct ? trackerColor(ct) : ""; $("#trkMark").style.color = ct ? "#fff" : "";
  $("#trkPop").innerHTML = trackerList().map(t => `<button type="button" data-trk="${esc(t.id)}"><span class="mini" style="background:${trackerColor(t)}">${esc(t.short || shortOf(t.name))}</span><span>${esc(t.name)}</span><span class="sub">${sheetList(t.id).length} sheets</span></button>`).join("") +
    `<hr><button type="button" class="add" data-act="newtracker">+ New tracker (another bank)</button><button type="button" data-act="backup">Backup &amp; restore…</button>${ct ? `<button type="button" data-act="share">Share sheets from ${esc(ct.name)}…</button><button type="button" data-act="import">Add sheets to ${esc(ct.name)} from Excel…</button><button type="button" data-act="workflow">Status workflow for ${esc(ct.name)}…</button><button type="button" data-act="people">People & owners for ${esc(ct.name)} (${peopleOf(ct.id).people.length})…</button><button type="button" data-act="holidays">Holiday calendar for ${esc(ct.name)} (${(S.trackers[ct.id]?.holidays || []).length})…</button><button type="button" data-act="edittracker">Rename or delete ${esc(ct.name)}…</button>` : ""}`;
  $("#navHome").innerHTML = window.BTDash ? window.BTDash.navHTML() : "";
  $("#nav").innerHTML = sheetList().map((s, i) => `<button type="button" data-sheet="${esc(s.id)}" aria-current="${S.view === "sheet" && S.sheetId === s.id}"><span class="dot" style="background:${SWATCH[i % SWATCH.length]}"></span><span class="nm">${esc(s.name)}</span><span class="ct">${rowsOf(s.id).length}</span></button>`).join("");
}
function render() {
  rebuildStatusMeta();
  renderNav();
  const main = $("#main");
  if (!S.ready) { main.innerHTML = `<div class="hero"><h2>Opening your tracker…</h2><p>Fetching sheets and entries.</p></div>`; return; }
  const tw = document.querySelector(".tablewrap"), keep = tw && S.lastSheet === S.sheetId ? [tw.scrollTop, tw.scrollLeft] : null;
  if (S.view === "dash" && !window.BTDash) { main.innerHTML = `<div class="hero"><h2>Opening dashboard…</h2></div>`; return; }
  if (S.view === "dash" && window.BTDash && S.dashboards[S.dashId] && tid(S.dashboards[S.dashId]) === curTracker()?.id) { S.lastSheet = null; window.BTDash.renderView(main); return; }
  if (!(S.view === "sheet" && S.sheets[S.sheetId] && tid(S.sheets[S.sheetId]) === (curTracker()?.id))) { const first = sheetList()[0]; if (first) { S.view = "sheet"; S.sheetId = first.id; } else { S.view = "home"; S.sheetId = null; } }
  if (S.view === "sheet" && S.sheets[S.sheetId]) {
    if (S.lastSheet !== S.sheetId) S.sel.clear();
    const gf = document.activeElement?.classList?.contains("gc") ? [document.activeElement.dataset.ri, document.activeElement.dataset.ci, document.activeElement.selectionStart] : null;
    renderSheet(main); S.lastSheet = S.sheetId;
    if (gf) { const t = document.querySelector(`.gc[data-ri="${gf[0]}"][data-ci="${gf[1]}"]`); if (t) { t.focus({preventScroll: true}); try { t.setSelectionRange(gf[2], gf[2]); } catch (e) {} } }
    const at = document.querySelector('.tab[aria-selected="true"]'); if (at) { const tb = at.closest(".tabs"); const l = at.offsetLeft - tb.offsetLeft; if (l < tb.scrollLeft || l + at.offsetWidth > tb.scrollLeft + tb.clientWidth) tb.scrollLeft = l - 16; }
    const n = document.querySelector(".tablewrap"); if (keep && n) { n.scrollTop = keep[0]; n.scrollLeft = keep[1]; }
    return;
  }
  S.lastSheet = null; S.sel.clear();
  renderHome(main);
}
function topbar(crumb) {
  return `<div class="topbar"><button class="btn ghost sidetog" type="button" data-act="toggleside" aria-pressed="${!S.noside}" title="Menu (press [ )" aria-label="Menu">${ICON.side}</button><div class="crumb">${crumb}</div>
    <button class="cmdk-btn" type="button" data-act="cmdk" title="Search everything (Ctrl+K)" aria-label="Search everything">${ICON.search}<span class="cl">Search entries, sheets, actions…</span><span class="kbd">Ctrl K</span></button>
    <div class="tgroup" role="group" aria-label="Tools">
    ${AI_ON ? `<button class="tbtn aibtn" type="button" data-act="ai" data-tip="AI assistant" aria-label="AI assistant">${ICON.spark}<span class="bl">AI</span></button>` : ""}
    <button class="tbtn" type="button" data-act="share" data-tip="Share sheets (view-only link)" aria-label="Share">${SHARE_ICON}</button>
    <button class="tbtn" type="button" data-act="theme" data-tip="Theme &amp; appearance" aria-label="Theme">${ICON.palette}</button>
    <button class="tbtn" type="button" data-act="import" data-tip="Import Excel" aria-label="Import Excel">${ICON.ul}</button>
    <button class="tbtn" type="button" data-act="fullscreen" data-tip="${S.full ? "Exit full screen (F)" : "Full screen (F)"}" aria-label="${S.full ? "Exit full screen" : "Full screen"}">${S.full ? ICON.shrink : ICON.expand}</button></div>
    <button class="btn dlbtn" type="button" data-act="export" title="Download Excel" aria-label="Download">${ICON.dl}<span class="bl">Download</span></button></div>${tabsHTML()}`;
}
function tabsHTML() {
  const ct = curTracker(); if (!ct) return "";
  const list = sheetList();
  return `<nav class="tabs" aria-label="Sheets">${list.map((s, i) => {
    const rs = rowsOf(s.id), red = rs.filter(r => { const st = rowState(s, r); return st.imp || st.breach; }).length;
    return `<span class="tabw" draggable="true" data-dragsheet="${esc(s.id)}"><button type="button" class="tab" data-sheet="${esc(s.id)}" aria-selected="${S.view === "sheet" && S.sheetId === s.id}" title="${esc(s.name)} · drag to reorder"><span class="dot" style="background:${SWATCH[i % SWATCH.length]}"></span><span class="nm">${esc(s.name)}</span><span class="ct">${rs.length}</span>${gridDirtyCount(s.id) ? `<span class="gdot" title="Unsaved grid edits"></span>` : ""}${red ? `<span class="red" title="${red} important or past ETA">${red}</span>` : ""}</button></span>`;
  }).join("")}<button type="button" class="tab add" data-act="newsheet" title="New sheet">${ICON.plus}</button></nav>`;
}
function greet() { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; }

function renderHome(main) {
  const ct = curTracker();
  if (!ct) {
    main.innerHTML = `<div class="hero"><h2>${greet()}. Let's set up your first tracker.</h2><p>A tracker holds every sheet for one bank or client. Create one, then import a workbook or design sheets from templates.</p></div>
    <div class="emptystate"><h3>No trackers yet</h3><p>Start with the bank you're working with now. You can add more banks any time.</p><button class="btn primary" type="button" data-act="newtracker">${ICON.plus} New tracker</button><button class="btn" type="button" data-act="backup" style="margin-top:4px">${ICON.ul} Restore from a backup file</button></div>`;
    return;
  }
  const list = sheetList();
  const ids = new Set(list.map(s => s.id));
  const all = Object.values(S.rows).filter(r => ids.has(r.sheetId));
  const tname = esc(ct.name);
  if (!list.length) {
    main.innerHTML = topbar(`<b>${tname}</b> / Overview`) + `<div class="hero"><h2>${greet()}. Let's set up ${tname}.</h2><p>Bring in an existing workbook or start a fresh sheet. Every entry you add here is saved as you go.</p></div>
    <div class="emptystate"><h3>No sheets in this tracker yet</h3><p>Import an Excel file to load every tab as a sheet, or design a new sheet from a template.</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center"><button class="btn primary" type="button" data-act="newsheet">${ICON.plus} New sheet</button><button class="btn" type="button" data-act="import">${ICON.ul} Import Excel</button></div></div>`;
    return;
  }
  let open = 0, blockers = 0;
  list.forEach(s => { const d = distribution(s, rowsOf(s.id)); if (d) d.arr.forEach(x => { if (x.t === "warn") open += x.n; if (x.t === "bad") blockers += x.n; }); });
  const attn = [];
  list.forEach(s => rowsOf(s.id).forEach(r => { const st = rowState(s, r); if (st.imp || st.breach) attn.push({s, r, st}); }));
  attn.sort((a, b) => (a.st.imp ? 0 : 1) - (b.st.imp ? 0 : 1) || b.st.late - a.st.late);
  const recent = Object.entries(S.rows).map(([id, r]) => ({id, ...r})).filter(r => ids.has(r.sheetId)).sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || "")).slice(0, 6);
  main.innerHTML = topbar(`<b>${tname}</b> / Overview`) + `
  <div class="hero"><h2>${greet()}. Here's where ${tname} stands.</h2><p>${list.length} sheets, ${all.length} entries. Pick a sheet to update, or jump straight into a new entry.</p></div>
  <div class="stats">
    <div class="stat"><div class="k">Entries</div><div class="v">${all.length}</div></div>
    <div class="stat"><div class="k">In progress</div><div class="v" style="color:var(--warn)">${open}</div></div>
    <div class="stat"><div class="k">Blockers / failed</div><div class="v" style="color:var(--bad)">${blockers}</div></div>
    <div class="stat"><div class="k">Last update</div><div class="v" style="font-size:18px;padding-top:4px">${esc(ago(lastUpdated(all)) || "—")}</div></div>
  </div>
  ${attn.length ? `<h3 class="section-h" style="color:var(--bad)">Needs attention · ${attn.length}</h3>
  <div class="attn">${attn.slice(0, 8).map(x => `<button type="button" data-act="attn" data-row="${esc(x.r.id)}"><span class="tag ${x.st.imp ? "" : "late"}">${x.st.imp ? "Important" : "ETA crossed"}</span><span class="rt">${esc((x.r.cells || {})[titleCol(x.s)?.id] || "Untitled entry")}</span><span class="rd">${x.st.breach ? `+${plural(x.st.late, "day")}` : ""}</span><span class="rs">${esc(x.s.name)}</span></button>`).join("")}</div>
  ${attn.length > 8 ? `<span class="hint">${attn.length - 8} more. Open a sheet to see all its red items at the top.</span>` : ""}` : ""}
  <h3 class="section-h">Sheets</h3>
  <div class="tiles">${list.map(s => {
    const rows = rowsOf(s.id), sts = rows.map(r => rowState(s, r)), ni = sts.filter(x => x.imp).length, nb = sts.filter(x => x.breach).length;
    const bar = (ni || nb ? `<div class="flags">${ni ? `<span class="pill t-bad">${ni} important</span>` : ""}${nb ? `<span class="pill t-bad">${nb} ETA crossed</span>` : ""}</div>` : "") + `<div class="sub">${(s.columns || []).length} columns</div>`;
    return `<button class="tile" type="button" data-sheet="${esc(s.id)}"><h3>${esc(s.name)}</h3><div class="big">${rows.length}<small>entries</small></div>${bar}<div class="sub">Updated ${esc(ago(lastUpdated(rows)) || "—")}</div></button>`;
  }).join("")}<button class="tile new" type="button" data-act="newsheet">${ICON.plus} New sheet</button></div>
  <h3 class="section-h">Recently updated</h3>
  <div class="recent">${recent.map(r => { const sh = S.sheets[r.sheetId], tc = titleCol(sh); return `<button type="button" data-open="${esc(r.id)}"><span class="rt">${esc((r.cells || {})[tc?.id] || "Untitled entry")}</span><span class="rd">${esc(ago(r.updatedAt))}</span><span class="rs">${esc(sh.name)}</span></button>`; }).join("") || `<div class="banner" style="margin:12px">No entries yet.</div>`}</div>`;
}

/* ---------- Calculated columns ---------- */
const CALC = {
  aging:  {name:"Aging", hint:"Working days since a start date"},
  due:    {name:"Days left / overdue", hint:"Countdown to a due date"},
  between:{name:"Days between dates", hint:"Gap between two dates"},
  serial: {name:"Auto serial no.", hint:"1, 2, 3… in sheet order"},
  arith:  {name:"Number formula", hint:"Add, subtract, multiply, divide"},
  updated:{name:"Days since update", hint:"How stale an entry is"},
};
const parseD = v => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v || ""); return m ? new Date(+m[1], m[2] - 1, +m[3]) : null; };
const today0 = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const dayDiff = (a, b) => Math.round((b - a) / 86400000);
const plural = (n, w) => `${n} ${w}${Math.abs(n) === 1 ? "" : "s"}`;
/* Mon–Fri days after `a` up to and including `b` */
const HOLC = new WeakMap();
function holSet(trackerId) {
  const arr = S.trackers[trackerId]?.holidays; if (!arr || !arr.length) return null;
  let st = HOLC.get(arr); if (!st) { st = arr.map(h => parseD(h.date)).filter(d => d && d.getDay() !== 0 && d.getDay() !== 6).map(d => +d); HOLC.set(arr, st); }
  return st;
}
function workdays(a, b, hol) {
  if (!a || !b || b <= a) return 0;
  const total = dayDiff(a, b), weeks = Math.floor(total / 7); let n = weeks * 5;
  const d = new Date(a); d.setDate(d.getDate() + weeks * 7);
  while (d < b) { d.setDate(d.getDate() + 1); const w = d.getDay(); if (w !== 0 && w !== 6) n++; }
  if (hol) for (const h of hol) if (h > +a && h <= +b) n--;
  return Math.max(0, n);
}
function rowState(sh, r) {
  let breach = false, late = 0, etaCols = new Set();
  for (const c of sh.columns || []) if (c.type === "calc" && (c.calc?.kind === "aging" || c.calc?.kind === "due")) {
    const v = calcCell(sh, c, r); if (v.breach) { breach = true; late = Math.max(late, v.late || 0); etaCols.add(c.calc.kind === "aging" ? c.calc.eta : c.calc.a); }
  }
  return {imp: !!r.imp, breach, late, etaCols};
}
const isDoneRow = (sh, r) => { const sc = statusCol(sh); const v = sc && (r.cells || {})[sc.id]; if (!v) return false; const m = STATUS_META.get(String(v).trim().toLowerCase()); return m ? !!(STATUS_CATS[m.cat] || {}).closed : tone(v) === "good"; };
const fmtNum = n => Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
function numVal(sh, colId, r, depth = 0) {
  const c = (sh.columns || []).find(x => x.id === colId); if (!c) return null;
  if (c.type === "calc") return depth > 4 ? null : calcCell(sh, c, r, depth + 1).n;
  const v = parseFloat(String((r.cells || {})[colId] ?? "").replace(/,/g, "")); return isNaN(v) ? null : v;
}
function calcCell(sh, c, r, depth = 0) {
  const k = c.calc || {}, cells = r.cells || {}, none = {n: null, text: "", t: "neu"};
  if (k.kind === "aging") {
    const a = parseD(cells[k.a]); if (!a) return none;
    const done = isDoneRow(sh, r), wd = k.days !== "all", unit = wd ? "working day" : "day";
    let end = k.b ? parseD(cells[k.b]) : null;
    if (!end && done && r.updatedAt) { end = new Date(r.updatedAt); end.setHours(0, 0, 0, 0); }
    const hol = wd ? holSet(tid(sh)) : null, stop = end || today0(), n = wd ? workdays(a, stop, hol) : Math.max(0, dayDiff(a, stop));
    const warn = +k.warn || 10, alert = +k.alert || 20;
    const eta = k.eta ? parseD(cells[k.eta]) : null, t0 = today0();
    const breach = !!(eta && !end && !done && t0 > eta), late = breach ? (wd ? workdays(eta, t0, hol) : dayDiff(eta, t0)) : 0;
    return {n, breach, late, text: plural(n, unit) + (end ? " · closed" : "") + (breach ? ` · ETA +${late}` : ""), t: end ? "neu" : breach || n >= alert ? "bad" : n >= warn ? "warn" : "good"};
  }
  if (k.kind === "due") {
    const a = parseD(cells[k.a]); if (!a) return none;
    if (isDoneRow(sh, r)) return {n: null, text: "Done", t: "good"};
    const n = dayDiff(today0(), a);
    return {n, breach: n < 0, late: -n, text: n < 0 ? `Overdue by ${plural(-n, "day")}` : n === 0 ? "Due today" : `${plural(n, "day")} left`, t: n < 0 ? "bad" : n <= (+k.warn || 3) ? "warn" : "info"};
  }
  if (k.kind === "between") {
    const a = parseD(cells[k.a]), b = parseD(cells[k.b]); if (!a || !b) return none;
    const n = dayDiff(a, b); return {n, text: plural(n, "day"), t: "neu"};
  }
  if (k.kind === "serial") { const n = rowsOf(sh.id).findIndex(x => x.id === r.id) + 1 || rowsOf(sh.id).length + 1; return {n, text: String(n), t: "plain"}; }
  if (k.kind === "arith") {
    const x = numVal(sh, k.a, r, depth), y = numVal(sh, k.b, r, depth); if (x == null || y == null) return none;
    const n = k.op === "-" ? x - y : k.op === "*" ? x * y : k.op === "/" ? (y === 0 ? null : x / y) : x + y;
    return n == null ? none : {n, text: fmtNum(n), t: "plain"};
  }
  if (k.kind === "updated") {
    if (!r.updatedAt) return none; const d = new Date(r.updatedAt); d.setHours(0, 0, 0, 0); const n = dayDiff(d, today0());
    return {n, text: n === 0 ? "Today" : plural(n, "day") + " ago", t: n > 14 ? "warn" : "neu"};
  }
  return none;
}
function calcDesc(sh, c) {
  const k = c.calc || {}, L = id => (sh.columns || []).find(x => x.id === id)?.label || "?";
  return k.kind === "aging" ? `${k.days === "all" ? "Calendar" : `Working (Mon–Fri${(S.trackers[tid(sh)]?.holidays || []).length ? ", excl. holidays" : ""})`} days since ${L(k.a)}${k.b ? ` until ${L(k.b)}` : ", stops when closed"}${k.eta ? ` · ETA from ${L(k.eta)}` : ""}` : k.kind === "due" ? `Countdown to ${L(k.a)}` : k.kind === "between" ? `${L(k.a)} → ${L(k.b)}` : k.kind === "arith" ? `${L(k.a)} ${({"+":"+","-":"−","*":"×","/":"÷"})[k.op || "+"]} ${L(k.b)}` : CALC[k.kind]?.hint || "";
}
/* raw value of any column for search / sort / filter / export */
function valOf(sh, c, r) { if (c.type === "calc") return calcCell(sh, c, r); const v = (r.cells || {})[c.id] ?? ""; return {n: c.type === "number" ? (parseFloat(v) || (v === "" ? null : 0)) : null, text: v}; }
function avHue(n) { let h = 0; for (const ch of String(n)) h = (h * 31 + ch.charCodeAt(0)) % 360; return h; }
function initials(n) { const w = String(n).trim().split(/\s+/).filter(Boolean); return ((w[0] || "?")[0] + (w.length > 1 ? w[w.length - 1][0] : (w[0] || "")[1] || "")).toUpperCase(); }
function avatarsHTML(v, withNames) {
  const ns = splitNames(v); if (!ns.length) return `<span class="empty-cell">—</span>`;
  if (!withNames) return `<span class="avs" title="${esc(ns.join(", "))}">${ns.slice(0, 4).map(n => `<i class="av" style="--h:${avHue(n)}">${esc(initials(n))}</i>`).join("")}${ns.length > 4 ? `<i class="av more">+${ns.length - 4}</i>` : ""}</span>`;
  return `<span class="avlist">${ns.map(n => `<span class="avchip"><i class="av" style="--h:${avHue(n)}">${esc(initials(n))}</i>${esc(n)}</span>`).join("")}</span>`;
}
function cellOut(sh, c, r, st) {
  if (c.id === sh.assigneeCol && c.type !== "calc") { const v = (r.cells || {})[c.id]; return v ? avatarsHTML(v, true) : `<span class="empty-cell">—</span>`; }
  if (c.type === "date" && st && st.breach && st.etaCols.has(c.id)) { const v = (r.cells || {})[c.id]; return `<span class="eta-late">${esc(fmtDateV(v))}<small>ETA crossed</small></span>`; }
  if (c.type === "calc") { const x = calcCell(sh, c, r); if (!x.text) return `<span class="empty-cell">—</span>`; return x.t === "plain" ? esc(x.text) : `<span class="pill t-${x.t}">${esc(x.text)}</span>`; }
  return cellHTML(c, (r.cells || {})[c.id]);
}

/* ---------- Filters ---------- */
try { S.filters = JSON.parse(localStorage.getItem("bcp-filters") || "{}") || {}; } catch (e) { S.filters = {}; }
S.onlyRed = {}; S.noteEdit = null; S.sel = new Set(); S.lastSheet = null;
const saveFilters = () => { try { localStorage.setItem("bcp-filters", JSON.stringify(S.filters)); } catch (e) {} };
const EMPTY = "(Empty)";
function fkind(c) { if (!c) return "text"; if (c.type === "select") return "in"; if (c.type === "date") return "date"; if (c.type === "number" || c.type === "calc") return "num"; return "text"; }
function matchFilter(sh, f, r) {
  const c = (sh.columns || []).find(x => x.id === f.col); if (!c) return true;
  const kind = fkind(c), raw = (r.cells || {})[c.id] ?? "";
  if (f.op === "empty") return kind === "num" ? valOf(sh, c, r).n == null && !valOf(sh, c, r).text : !raw;
  if (f.op === "notempty") return kind === "num" ? valOf(sh, c, r).n != null || !!valOf(sh, c, r).text : !!raw;
  if (kind === "in") return (f.val || []).includes(raw || EMPTY);
  if (kind === "text") { const has = String(raw).toLowerCase().includes(String(f.val || "").toLowerCase()); return f.op === "notcontains" ? !has : has; }
  if (kind === "date") {
    const d = parseD(raw), t = today0(); if (!d) return false;
    if (f.op === "before") return d < parseD(f.val); if (f.op === "after") return d > parseD(f.val); if (f.op === "on") return +d === +parseD(f.val);
    if (f.op === "between") return d >= parseD(f.val[0]) && d <= parseD(f.val[1]);
    if (f.op === "overdue") return d < t && !isDoneRow(sh, r);
    if (f.op === "next7") return d >= t && dayDiff(t, d) <= 7;
    if (f.op === "last7") return d <= t && dayDiff(d, t) <= 7;
    if (f.op === "thismonth") return d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
    return true;
  }
  const n = valOf(sh, c, r).n; if (n == null) return false;
  if (f.op === "gt") return n > +f.val; if (f.op === "lt") return n < +f.val; if (f.op === "eq") return n === +f.val;
  if (f.op === "between") return n >= +f.val[0] && n <= +f.val[1];
  return true;
}
function filterLabel(sh, f) {
  const c = (sh.columns || []).find(x => x.id === f.col); if (!c) return "Removed column";
  const L = c.label, D = v => fmtDate(v);
  const m = {empty:"is empty", notempty:"is filled", contains:`contains “${f.val}”`, notcontains:`doesn't contain “${f.val}”`, before:`before ${D(f.val)}`, after:`after ${D(f.val)}`, on:`on ${D(f.val)}`, overdue:"overdue", next7:"in next 7 days", last7:"in last 7 days", thismonth:"this month", gt:`> ${f.val}`, lt:`< ${f.val}`, eq:`= ${f.val}`};
  if (f.op === "in") return `${L}: ${(f.val || []).length > 2 ? `${f.val.slice(0, 2).join(", ")} +${f.val.length - 2}` : (f.val || []).join(", ")}`;
  if (f.op === "between") return fkind(c) === "date" ? `${L} ${D(f.val[0])} – ${D(f.val[1])}` : `${L} ${f.val[0]}–${f.val[1]}`;
  return `${L} ${m[f.op] || ""}`;
}
function filteredRows(sh) {
  let rows = rowsOf(sh.id);
  const q = S.q.trim().toLowerCase();
  if (q) rows = rows.filter(r => Object.values(r.cells || {}).some(v => String(v).toLowerCase().includes(q)));
  (S.filters[sh.id] || []).forEach(f => { rows = rows.filter(r => matchFilter(sh, f, r)); });
  if (S.onlyRed[sh.id]) rows = rows.filter(r => { const st = rowState(sh, r); return st.imp || st.breach; });
  if (S.sort && S.sort.sheet === sh.id) {
    const {col, dir} = S.sort, c = (sh.columns || []).find(x => x.id === col);
    if (c) rows.sort((a, b) => {
      if (c.type === "number" || c.type === "calc") { const x = valOf(sh, c, a).n, y = valOf(sh, c, b).n; if (x == null && y == null) return 0; if (x == null) return 1; if (y == null) return -1; return dir * (x - y); }
      return dir * String((a.cells || {})[col] || "").localeCompare(String((b.cells || {})[col] || ""));
    });
  }
  const rank = new Map(rows.map(r => { const st = rowState(sh, r); return [r.id, st.imp ? 0 : st.breach ? 1 : 2]; }));
  rows.sort((a, b) => rank.get(a.id) - rank.get(b.id));
  return rows;
}
function openFilter(idx, presetCol) {
  const sh = {id: S.sheetId, ...S.sheets[S.sheetId]}, cols = sh.columns || [], list = S.filters[sh.id] || [];
  const cur = idx != null ? {...list[idx]} : {col: presetCol || (statusCol(sh) || cols[0])?.id, op: null, val: null};
  const OPS = {
    text: [["contains","contains"],["notcontains","doesn't contain"],["empty","is empty"],["notempty","is filled"]],
    date: [["overdue","is overdue (past, not done)"],["next7","in the next 7 days"],["last7","in the last 7 days"],["thismonth","this month"],["before","before"],["after","after"],["on","on"],["between","between"],["empty","is empty"],["notempty","is filled"]],
    num:  [["gt","greater than"],["lt","less than"],["eq","equal to"],["between","between"],["empty","is empty"],["notempty","has a value"]],
  };
  const valueUI = () => {
    const c = cols.find(x => x.id === cur.col), kind = fkind(c);
    if (kind === "in") {
      const counts = new Map(); rowsOf(sh.id).forEach(r => { const v = (r.cells || {})[c.id] || EMPTY; counts.set(v, (counts.get(v) || 0) + 1); });
      const opts = [...new Set([...(c.options || []), ...counts.keys()])]; const sel = new Set(cur.op === "in" ? cur.val || [] : []);
      return `<div class="field"><span class="lbl">Show entries where ${esc(c.label)} is any of <button type="button" class="stamp" id="f_all">Select all</button></span><div class="fvals">${opts.map(o => `<label class="ck"><input type="checkbox" data-fv="${esc(o)}" ${sel.has(o) ? "checked" : ""}> ${o === EMPTY ? `<i style="color:var(--muted)">${EMPTY}</i>` : `<span class="pill t-${tone(o)}">${esc(o)}</span>`}<span class="n">${counts.get(o) || 0}</span></label>`).join("")}</div></div>`;
    }
    const ops = OPS[kind], op = cur.op && ops.some(o => o[0] === cur.op) ? cur.op : ops[0][0]; cur.op = op;
    const inT = kind === "date" ? "date" : kind === "num" ? "number" : "text";
    const v0 = Array.isArray(cur.val) ? cur.val[0] : cur.val ?? "", v1 = Array.isArray(cur.val) ? cur.val[1] : "";
    const needs = !["empty","notempty","overdue","next7","last7","thismonth"].includes(op);
    const unit = c.type === "calc" && ["aging","due","between","updated"].includes(c.calc?.kind) ? " (days)" : "";
    return `<div class="field"><label for="f_op">Condition</label><select class="inp" id="f_op">${ops.map(([k, l]) => `<option value="${k}" ${k === op ? "selected" : ""}>${l}</option>`).join("")}</select></div>
      ${needs ? `<div class="field"><label for="f_v0">Value${unit}</label><div class="row2"><input class="inp" id="f_v0" type="${inT}" value="${esc(v0)}" placeholder="${kind === "num" ? "e.g. 30" : "Type to match"}">${op === "between" ? `<input class="inp" id="f_v1" type="${inT}" value="${esc(v1)}" aria-label="and">` : ""}</div>
      ${kind === "num" && unit && op !== "between" ? `<div class="chips" style="margin-top:4px">${[7, 15, 30, 45].map(n => `<button type="button" class="chip t-neu" data-q="${n}">${n} days</button>`).join("")}</div>` : ""}</div>` : ""}`;
  };
  openDialog({
    eyebrow: sh.name, title: idx != null ? "Edit filter" : "Add a filter", saveLabel: "Apply filter",
    onDelete: idx != null ? () => { list.splice(idx, 1); S.filters[sh.id] = list; saveFilters(); render(); } : null, deleteLabel: "Remove filter", confirmLabel: "Click again to remove",
    body: () => `${AI_ON && idx == null ? `<div class="field aif"><label for="f_ai">${ICON.spark} Describe what you want to see</label><div class="row2" style="flex:none"><input class="inp" id="f_ai" placeholder="e.g. SSL renewals expiring in the next 3 months" style="flex:1"><button class="btn primary" type="button" id="f_aigo" style="flex:none">Apply</button></div><span class="hint" id="f_aimsg">AI turns your words into filters. Or set one filter by hand below.</span></div>` : ""}<div class="field"><label for="f_col">Column</label><select class="inp" id="f_col">${cols.map(c => `<option value="${esc(c.id)}" ${c.id === cur.col ? "selected" : ""}>${esc(c.label)} · ${TYPES[c.type]}</option>`).join("")}</select></div><div id="f_val">${valueUI()}</div>`,
    mount: root => {
      const redraw = () => { root.querySelector("#f_val").innerHTML = valueUI(); };
      const aiGo = async () => { const q = root.querySelector("#f_ai").value.trim(); if (!q) return; const msg = root.querySelector("#f_aimsg"); msg.textContent = "Thinking…";
        try { const n = await aiFilter(q); closeDialog(true); toast(`${n} filter${n === 1 ? "" : "s"} applied`); } catch (e) { msg.textContent = e.message; msg.style.color = "var(--bad)"; } };
      root.querySelector("#f_aigo")?.addEventListener("click", aiGo);
      root.querySelector("#f_ai")?.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); aiGo(); } });
      root.addEventListener("change", e => {
        if (e.target.id === "f_col") { cur.col = e.target.value; cur.op = null; cur.val = null; redraw(); }
        else if (e.target.id === "f_op") { cur.op = e.target.value; redraw(); }
      });
      root.addEventListener("click", e => {
        if (e.target.id === "f_all") { const ks = [...root.querySelectorAll("[data-fv]")], all = ks.every(k => k.checked); ks.forEach(k => k.checked = !all); }
        const q = e.target.closest("[data-q]"); if (q) { root.querySelector("#f_v0").value = q.dataset.q; }
      });
    },
    onSave: root => {
      const c = cols.find(x => x.id === cur.col), kind = fkind(c); let f;
      if (kind === "in") { const val = [...root.querySelectorAll("[data-fv]:checked")].map(k => k.dataset.fv); if (!val.length) { toast("Tick at least one value"); return false; } f = {col: c.id, op: "in", val}; }
      else {
        const op = root.querySelector("#f_op").value, v0 = root.querySelector("#f_v0")?.value ?? "", v1 = root.querySelector("#f_v1")?.value ?? "";
        const needs = !!root.querySelector("#f_v0");
        if (needs && (v0 === "" || (op === "between" && v1 === ""))) { toast("Enter a value for the filter"); return false; }
        f = {col: c.id, op, val: op === "between" ? [v0, v1] : needs ? v0 : null};
      }
      if (idx != null) list[idx] = f; else list.push(f);
      S.filters[sh.id] = list; saveFilters(); render();
    }
  });
}
function cellHTML(c, v) {
  if (v == null || v === "") return `<span class="empty-cell">—</span>`;
  if (c.type === "select") { const m = STATUS_META.get(String(v).trim().toLowerCase()); return `<span class="pill t-${tone(v)}" title="${esc(v)}${m ? ` · stage ${m.i} of ${m.n} · ${esc((STATUS_CATS[m.cat] || {}).label || "")}` : ""}">${esc(v)}</span>`; }
  if (c.type === "date") return esc(fmtDateV(v));
  if (c.type === "long") return `<div class="clamp">${esc(v)}</div>`;
  return `<div class="clamp">${esc(v)}</div>`;
}
function renderSheet(main) {
  const sh = {id: S.sheetId, ...S.sheets[S.sheetId]}, cols = sh.columns || [];
  const vp = sheetVP(sh.id), vcols = cols.filter(c => !vp.hidden.includes(c.id)), F = VP.fmt;
  const wst = (c, head) => { const w = vp.widths[c.id], cf = vp.colfmt[c.id] || {}, st = [];
    if (w) st.push(`width:${w}px;min-width:${w}px;max-width:${w}px`);
    const al = cf.align || (head ? F.halign : F.align); if (al && al !== "left") st.push(`text-align:${al}`);
    if (!head && cf.bold) st.push("font-weight:700");
    if (!head && cf.color && TINTS[cf.color]) st.push(`--colbg:${TINTS[cf.color]}`);
    return st.length ? ` style="${st.join(";")}"` : ""; };
  const ccls = c => { const cf = vp.colfmt[c.id] || {}; return `${cf.wrap ? "wrap-" + cf.wrap : ""} ${cf.color && TINTS[cf.color] ? "ctint" : ""} al-${cf.align || F.align}`; };
  const all = rowsOf(sh.id), rows = filteredRows(sh);
  const layout = (S.layout[sh.id] === "grid" ? "table" : S.layout[sh.id]) || (matchMedia("(max-width:640px)").matches || (cols.length <= 5 && cols.some(c => c.type === "long")) ? "cards" : "table");
  const flist = S.filters[sh.id] || [], fActive = flist.length > 0 || !!S.onlyRed[sh.id];
  const states = new Map(all.map(r => [r.id, rowState(sh, r)]));
  const breached = all.filter(r => states.get(r.id).breach), imps = all.filter(r => r.imp);
  const unflagged = breached.filter(r => !r.imp);
  const maxLate = breached.reduce((m, r) => Math.max(m, states.get(r.id).late), 0);
  const tc = titleCol(sh), sc = statusCol(sh);
  let body;
  if (!all.length && layout === "cards") body = `<div class="emptystate"><h3>This sheet is ready for its first entry</h3><p>${cols.length} columns set up: ${esc(cols.map(c => c.label).join(", "))}.</p><div class="row2" style="justify-content:center;flex:none"><button class="btn primary" type="button" data-act="add" style="flex:none">${ICON.plus} Add the first entry</button><button class="btn" type="button" data-act="paste" style="flex:none">Paste rows from Excel</button></div></div>`;
  else if (!rows.length && all.length) body = `<div class="emptystate"><h3>Nothing matches</h3><p>Try a different search or clear the filters.</p><button class="btn" type="button" data-act="clear">Clear search &amp; filters</button></div>`;
  else if (layout === "cards") body = `<div class="cardbar"><button type="button" class="btn ghost" data-act="cardset" title="Choose the column used as each card's heading">Card heading: <b>${esc(tc?.label || "—")}</b>${sh.titleCol ? "" : " <span class=\"hint\">(automatic)</span>"} ▾</button></div><div class="cards">${rows.map(r => {
      const c = r.cells || {}, st = states.get(r.id), rest = vcols.filter(x => x !== tc && x !== sc && c[x.id]);
      const sv = sc && c[sc.id], sm = sv ? STATUS_META.get(String(sv).trim().toLowerCase()) : null, cat = sm ? (STATUS_CATS[sm.cat] || {}) : null;
      const ac = (sh.columns || []).find(x => x.id === sh.assigneeCol);
      const pills = (st.imp ? `<span class="pill t-bad">Important</span>` : "") + cols.filter(x => x.type === "select" && x !== sc && x !== ac && c[x.id]).slice(0, 3).map(x => `<span class="pill t-${tone(c[x.id])}" title="${esc(x.label)}">${esc(c[x.id])}</span>`).join("");
      const calcs = cols.filter(x => x.type === "calc" && x.calc?.kind !== "serial").map(x => { const v = calcCell(sh, x, r); return v.text ? `<span class="pill t-${v.t === "plain" ? "neu" : v.t}" title="${esc(x.label)}">${esc(v.text)}</span>` : ""; }).join("");
      const fields = (Array.isArray(sh.cardFields) ? sh.cardFields.map(id => vcols.find(x => x.id === id)).filter(x => x && x !== tc && c[x.id] && x.type !== "calc") : rest.filter(x => x.type !== "select" && x !== ac).slice(0, 3));
      const stage = sv ? `<div class="cstage"><span class="pill t-${tone(sv)}">${esc(sv)}</span>${sm ? `<span class="cstage-n">Stage ${sm.i}/${sm.n}</span>` : ""}</div>${sm ? `<div class="stagebar" title="${esc(cat?.label || "")}"><i class="t-${cat?.tone || "neu"}" style="width:${Math.max(4, Math.round(sm.i / sm.n * 100))}%"></i></div>` : ""}` : "";
      return `<button class="card ${st.imp ? "imp" : ""} ${st.breach ? "breach" : ""}" style="--cat:var(--${(cat?.tone || (sv ? tone(sv) : "line")) === "line" ? "line" : (cat?.tone || tone(sv))})" type="button" data-open="${esc(r.id)}"><h3>${esc(c[tc?.id] || "Untitled entry")}</h3>${stage}${pills ? `<div class="meta">${pills}</div>` : ""}${fields.length ? `<dl>${fields.map(x => `<div><dt>${esc(x.label)}</dt><dd>${x.type === "date" ? esc(fmtDate(c[x.id])) : `<div class="clamp">${esc(c[x.id])}</div>`}</dd></div>`).join("")}</dl>` : ""}<div class="cfoot">${ac && c[ac.id] ? avatarsHTML(c[ac.id]) : ""}${calcs}<span class="when">${esc(ago(r.updatedAt))}</span></div></button>`;
    }).join("")}</div>`;
  else body = `<div class="tablewrap" data-grid="${F.grid}" data-stripe="${F.stripe ? 1 : 0}" data-head="${F.head}" data-wrap="${F.lines}" data-freeze="${F.freeze ? 1 : 0}" data-valign="${F.valign}" data-hcase="${F.hcase}" data-pad="${F.pad}" data-pill="${F.pill}" data-boldfirst="${F.boldFirst ? 1 : 0}" data-hover="${F.hover ? 1 : 0}" data-border="${F.border}" style="--tfs:${({s: 13, m: 14, l: 16})[F.size] || 14}px;--rowh:${F.rowh}px;--lines:${F.lines === "all" ? 999 : F.lines}"><table><thead><tr><th class="c-flag" title="Select · flag · open"><span class="rowacts"><input type="checkbox" class="rowck" id="ckAll" aria-label="Select all shown rows" ${rows.length && rows.every(r => S.sel.has(r.id)) ? "checked" : ""}>${ICON.flag}</span></th>${vcols.map(c => { const s = S.sort && S.sort.sheet === sh.id && S.sort.col === c.id ? (S.sort.dir > 0 ? " ↑" : " ↓") : ""; const hasF = flist.some(f => f.col === c.id); return `<th draggable="true" data-dragcol="${esc(c.id)}"${wst(c, true)}><button type="button" class="colh" data-colmenu="${esc(c.id)}" title="${esc(c.type === "calc" ? calcDesc(sh, c) : "Rename, sort, filter, move")}">${esc(c.label)}${c.type === "calc" ? ' <span class="fx">fx</span>' : ""}${c.id === sh.remarkCol ? ' <span class="fx" title="Remark column">✎</span>' : ""}${c.id === sh.assigneeCol ? ' <span class="fx" title="Assignee column">@</span>' : ""}${c.id === sh.statusCol ? ' <span class="fx" title="Status workflow column">◉</span>' : ""}${c.id === sh.titleCol ? ' <span class="fx" title="Card heading column">H</span>' : ""}${c.id === sh.ownerCol && sh.assigneeCol ? ' <span class="fx" title="Filled from assignee">auto</span>' : ""}${hasF ? ` <span class="fx" style="color:var(--warn)">F</span>` : ""}${s}<span class="chev">▾</span></button><span class="rsz" data-rsz="${esc(c.id)}" title="Drag to resize · double-click to reset"></span></th>`; }).join("")}<th class="addcol"><button type="button" data-act="addcolq" title="Add a column">${ICON.plus} Column</button></th></tr></thead>
      <tbody>${rows.map(r => { const st = states.get(r.id); return `<tr tabindex="0" class="${st.imp ? "imp" : ""} ${st.breach ? "breach" : ""} ${S.sel.has(r.id) ? "sel" : ""}" data-row="${esc(r.id)}" id="row-${esc(r.id)}"><td class="c-flag"><span class="rowacts"><input type="checkbox" class="rowck" data-selrow="${esc(r.id)}" aria-label="Select row" ${S.sel.has(r.id) ? "checked" : ""}><button type="button" class="flag" data-imp="${esc(r.id)}" aria-pressed="${st.imp}" title="${st.imp ? "Remove important mark" : "Mark as important"}">${ICON.flag}</button><button type="button" class="flag open" data-open="${esc(r.id)}" title="Open full entry">${ICON.expand}</button></span></td>${vcols.map(c => `<td class="c-${c.type} ${ccls(c)} ${c.type === "calc" ? "" : "editable"} ${c.id === sh.remarkCol ? "rmk" : ""}" data-cell="${esc(c.id)}"${wst(c)} title="${c.type === "calc" ? esc("Calculated: " + calcDesc(sh, c)) : c.id === sh.remarkCol ? "Click to add an update" : "Click to edit"}">${c.id === sh.remarkCol && AI_ON && (r.cells || {})[c.id] ? `<button type="button" class="rmk-ai" data-rmksum title="AI summary">${ICON.spark}</button>` : ""}${cellOut(sh, c, r, st)}</td>`).join("")}<td></td></tr>`; }).join("")}<tr class="addrow"><td colspan="${vcols.length + 2}"><button type="button" data-act="addrow">${ICON.plus} Add row</button>${vp.hidden.length ? `<button type="button" data-act="fmt" class="hidnote">${vp.hidden.length} hidden column${vp.hidden.length === 1 ? "" : "s"} · show</button>` : ""}</td></tr></tbody></table></div>`;

  const noteHTML = S.noteEdit === sh.id
    ? `<div class="note-edit"><textarea class="inp" id="noteTa" rows="3" placeholder="Add context for this sheet: scope, a reminder, a dependency…">${esc(sh.note || "")}</textarea><div class="acts"><button class="btn primary" type="button" data-act="notesave">Save note</button><button class="btn ghost" type="button" data-act="notecancel">Cancel</button>${sh.note ? `<span class="sp" style="flex:1"></span><button class="btn ghost" type="button" data-act="noteclear" style="color:var(--bad)">Remove note</button>` : ""}</div></div>`
    : sh.note ? `<div class="note"><b>Note</b><span class="txt">${esc(sh.note)}</span><button class="stamp" type="button" data-act="noteedit">${ICON.edit} Edit</button></div>`
    : `<button class="addnote" type="button" data-act="noteedit">${ICON.plus} Add a note to this sheet</button>`;
  const alertHTML = breached.length ? `<div class="alert" role="alert"><span class="ic">!</span><div class="msg"><b>${breached.length} ${breached.length === 1 ? "entry has" : "entries have"} crossed the ETA</b><span>Oldest is ${plural(maxLate, "day")} past its ETA. These rows sit at the top of the sheet, shaded red.</span></div>
      <button class="btn ${S.onlyRed[sh.id] ? "on" : ""}" type="button" data-act="onlyred">${S.onlyRed[sh.id] ? "Show all entries" : "Show only these"}</button>
      ${unflagged.length ? `<button class="btn" type="button" data-act="markred">${ICON.flag} Mark ${unflagged.length === breached.length ? "all" : unflagged.length} as important</button>` : ""}</div>` : "";

  main.innerHTML = topbar(`<span class="cr-proj"><i style="background:${trackerColor(curTracker())}"></i>${esc(curTracker()?.name || "")}</span><span class="cr-sep">/</span><b>${esc(sh.name)}</b>`) + `
  ${noteHTML}
  ${alertHTML}
  <div class="toolbar">
    <label class="search">${ICON.search}<input id="q" type="search" placeholder="Search ${esc(sh.name)}…" value="${esc(S.q)}" aria-label="Search entries"></label>
    <div class="seg" role="group" aria-label="Layout"><button type="button" data-layout="table" aria-pressed="${layout === "table"}">Table</button><button type="button" data-layout="cards" aria-pressed="${layout === "cards"}">Cards</button></div>
    <button class="btn" type="button" data-act="filter">${ICON.filter}<span class="bl">Filter</span>${flist.length ? ` <span class="badge">${flist.length}</span>` : ""}</button>
    <button class="btn" type="button" data-act="fmt" title="Table format: gridlines, row height, hidden columns" aria-label="Table format">${ICON.format}<span class="bl">Format</span>${vp.hidden.length ? ` <span class="badge">${vp.hidden.length}</span>` : ""}</button>
    <button class="btn" type="button" data-act="addcol" title="Add column" aria-label="Add column">${ICON.plus}<span class="bl">Column</span></button>
    <button class="btn primary" type="button" data-act="add">${ICON.plus} Add entry <span class="kbd">N</span></button>
    <div class="menu"><button class="btn ghost" type="button" data-act="sheetmenu" aria-haspopup="true" aria-label="Sheet options" title="Sheet options">${ICON.dots}</button><div class="menu-pop" id="sheetMenu" hidden>
      <button type="button" data-act="addcol">Add a column</button><button type="button" data-act="addaging">Add an aging column</button><button type="button" data-act="noteedit">${sh.note ? "Edit note" : "Add a note"}</button><button type="button" data-act="editsheet">Rename sheet / edit columns</button><button type="button" data-act="paste">Paste rows from Excel…</button><button type="button" data-act="remarkset">Remark column…</button><button type="button" data-act="share">Share sheets (view-only link)…</button><button type="button" data-act="cardset">Card heading & fields…</button><button type="button" data-act="statusset">Status column…</button><button type="button" data-act="workflow">Status workflow…</button><button type="button" data-act="assignset">Assignee & owner…</button><button type="button" data-act="people">People & owners…</button><button type="button" data-act="splitsec">Split into sections (by headings)</button><button type="button" data-act="xlupdate">Upload edited Excel…</button><button type="button" data-act="holidays">Holiday calendar…</button><button type="button" data-act="dupsheet">Duplicate sheet structure</button><button type="button" data-act="exportone">Download this sheet</button><button type="button" class="red" data-act="delsheet">Delete sheet…</button></div></div>
  </div>
  ${flist.length ? `<div class="fbar">${flist.map((f, i) => `<span class="fchip"><button type="button" data-fedit="${i}" title="Edit filter">${esc(filterLabel(sh, f))}</button><button type="button" class="x" data-fdel="${i}" aria-label="Remove filter">✕</button></span>`).join("")}<button class="stamp" type="button" data-act="filter">+ Add filter</button></div>` : ""}
  ${(S.q || fActive) && all.length ? `<div class="banner">Showing ${rows.length} of ${all.length} entries. <button class="stamp" type="button" data-act="clear">Clear search &amp; filters</button></div>` : ""}
  ${body}`;
  [...S.sel].forEach(id => { if (S.rows[id]?.sheetId !== sh.id) S.sel.delete(id); });
  if (S.sel.size) main.insertAdjacentHTML("beforeend", `<div class="bulkbar" role="toolbar" aria-label="Bulk actions"><b>${S.sel.size} selected</b><button type="button" data-act="bulkset">Set a field…</button><button type="button" data-act="bulkimp">Mark important</button><button type="button" data-act="bulkunimp">Remove important</button><button type="button" class="danger" data-act="bulkdel">Delete</button><button type="button" data-act="bulkclear" aria-label="Clear selection">✕</button></div>`);
  $("#ckAll")?.addEventListener("change", e => { rows.forEach(r => e.target.checked ? S.sel.add(r.id) : S.sel.delete(r.id)); render(); });
  const q = $("#q");
  q.addEventListener("input", () => { S.q = q.value; const pos = q.selectionStart; render(); const n = $("#q"); n.focus(); n.setSelectionRange(pos, pos); });
  const ta = $("#noteTa"); if (ta) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); ta.addEventListener("keydown", e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); saveNote(); } if (e.key === "Escape") { e.stopPropagation(); S.noteEdit = null; render(); } }); }
}
function saveNote(clear) {
  const sh = S.sheets[S.sheetId]; if (!sh) return;
  const note = clear ? "" : ($("#noteTa")?.value || "").trim();
  store.put("sheets", S.sheetId, {...sh, note}); S.noteEdit = null; toast(note ? "Note saved" : "Note removed"); render();
}
async function toggleImp(id, val) {
  const r = S.rows[id]; if (!r) return;
  const imp = val ?? !r.imp, sn = snap("rows", [id]);
  await store.put("rows", id, {...r, imp, updatedAt: r.updatedAt});
  render(); pushUndo(imp ? "Marked important · moved to the top" : "Important mark removed", sn);
}

/* ---------- Bulk edit ---------- */
async function bulkUpdate(fn, verb) {
  const ids = [...S.sel].filter(id => S.rows[id]); if (!ids.length) return;
  const sn = snap("rows", ids);
  await pool(ids.map(id => () => store.put("rows", id, fn(clone(S.rows[id])))));
  render(); pushUndo(`${ids.length} ${ids.length === 1 ? "entry" : "entries"} ${verb}`, sn);
}
async function bulkDelete() {
  const ids = [...S.sel].filter(id => S.rows[id]); if (!ids.length) return;
  const sn = snap("rows", ids); S.sel.clear();
  await pool(ids.map(id => () => store.del("rows", id)));
  render(); pushUndo(`${ids.length} ${ids.length === 1 ? "entry" : "entries"} deleted`, sn);
}
function valueCtl(c, id) {
  if (!c) return "";
  if (c.type === "select") return `<div class="opts" id="${id}_opts">${(c.options || []).map(o => `<button type="button" class="opt" data-bv="${esc(o)}" aria-pressed="false">${esc(o)}</button>`).join("")}</div><input class="inp" id="${id}" placeholder="…or type another value">`;
  if (c.type === "date") return `<input class="inp" type="date" id="${id}">`;
  if (c.type === "long") return `<textarea class="inp" id="${id}" rows="4"></textarea>`;
  return `<input class="inp" id="${id}" ${c.type === "number" ? 'type="number"' : ""}>`;
}
function openBulkSet() {
  const sh = S.sheets[S.sheetId], cols = (sh.columns || []).filter(c => c.type !== "calc"), n = S.sel.size;
  let col = (statusCol(sh) || cols[0])?.id;
  openDialog({
    eyebrow: `${n} selected`, title: "Set a field on selected entries", saveLabel: `Update ${n} ${n === 1 ? "entry" : "entries"}`,
    body: () => `<div class="field"><label for="bk_col">Field</label><select class="inp" id="bk_col">${cols.map(c => `<option value="${esc(c.id)}" ${c.id === col ? "selected" : ""}>${esc(c.label)} · ${TYPES[c.type]}</option>`).join("")}</select></div>
      <div class="field"><span class="lbl">New value</span><div id="bk_val">${valueCtl(cols.find(c => c.id === col), "bk_in")}</div></div>
      <label class="ck"><input type="checkbox" id="bk_append"> For long text, add above the existing text instead of replacing it</label>`,
    mount: root => {
      root.addEventListener("change", e => { if (e.target.id === "bk_col") { col = e.target.value; root.querySelector("#bk_val").innerHTML = valueCtl(cols.find(c => c.id === col), "bk_in"); } });
      root.addEventListener("click", e => { const b = e.target.closest("[data-bv]"); if (!b) return; root.querySelectorAll("[data-bv]").forEach(x => { const on = x === b; x.setAttribute("aria-pressed", on); x.className = "opt" + (on ? " t-" + tone(x.dataset.bv) : ""); }); root.querySelector("#bk_in").value = b.dataset.bv; });
    },
    onSave: async root => {
      const c = cols.find(x => x.id === col), v = root.querySelector("#bk_in").value.trim(), app = root.querySelector("#bk_append").checked && c.type === "long";
      if (c.type === "select" && v && !(c.options || []).includes(v)) store.put("sheets", S.sheetId, {...sh, columns: sh.columns.map(x => x.id === c.id ? {...x, options: [...(x.options || []), v]} : x)});
      const now = new Date().toISOString();
      await bulkUpdate(r => { const cells = {...(r.cells || {})}; const nv = app && cells[c.id] ? (v ? v + "\n" + cells[c.id] : cells[c.id]) : v; if (nv) cells[c.id] = nv; else delete cells[c.id]; return {...r, cells, updatedAt: now}; }, `updated · ${c.label}`);
    }
  });
}

/* ---------- Paste rows from Excel ---------- */
function parseTSV(t) {
  const rows = []; let row = [], cell = "", q = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (q) { if (ch === '"') { if (t[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch; }
    else if (ch === '"' && cell === "") q = true;
    else if (ch === "\t") { row.push(cell); cell = ""; }
    else if (ch === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else if (ch !== "\r") cell += ch;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows.map(r => r.map(c => c.trim())).filter(r => r.some(Boolean));
}
const MONS = {jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,sept:8,oct:9,nov:10,dec:11};
function normDate(v) {
  v = String(v || "").trim(); if (!v) return "";
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  let m;
  if ((m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(v))) return iso(new Date(+m[1], m[2] - 1, +m[3]));
  if ((m = /^(\d{1,2})[\s\-\/.]([A-Za-z]{3,4})[A-Za-z]*[\s\-\/.,]*(\d{2,4})$/.exec(v)) && MONS[m[2].toLowerCase()] != null) { let y = +m[3]; if (y < 100) y += 2000; return iso(new Date(y, MONS[m[2].toLowerCase()], +m[1])); }
  if ((m = /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/.exec(v))) { let y = +m[3]; if (y < 100) y += 2000; return iso(new Date(y, m[2] - 1, +m[1])); }
  if ((m = /^(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]{3,})\s*,?\s*(\d{4})?$/.exec(v)) && MONS[m[2].slice(0, 3).toLowerCase()] != null) return iso(new Date(m[3] ? +m[3] : new Date().getFullYear(), MONS[m[2].slice(0, 3).toLowerCase()], +m[1]));
  if (/^\d{5}$/.test(v)) { const d = new Date(Date.UTC(1899, 11, 30) + (+v) * 86400000); return iso(new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); }
  return v;
}
function openPaste(text) {
  const sid = S.sheetId, sh = S.sheets[sid]; if (!sh) return;
  const cols = (sh.columns || []).filter(c => c.type !== "calc");
  const P = {text, rows: [], header: false, map: []};
  const norm = x => String(x || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const parse = () => {
    P.rows = parseTSV(P.text);
    const first = P.rows[0] || [];
    const hits = first.filter(h => cols.some(c => norm(c.label) === norm(h))).length;
    P.header = P.headerSet ?? (hits >= Math.min(2, first.length));
    const width = Math.max(0, ...P.rows.map(r => r.length));
    P.map = Array.from({length: width}, (_, j) => { if (P.header) { const c = cols.find(c => norm(c.label) === norm(first[j])); return c ? c.id : ""; } return cols[j]?.id || ""; });
  };
  const preview = () => {
    const body = P.header ? P.rows.slice(1) : P.rows;
    if (!P.rows.length) return `<div class="banner">Copy cells in Excel (Ctrl+C) and paste them into the box above (Ctrl+V).</div>`;
    return `<div class="field"><span class="lbl">Match columns <span class="typ">${body.length} rows ready</span></span><div class="maptbl"><table><thead><tr>${P.map.map((m, j) => `<th><select class="inp" data-map="${j}"><option value="">Skip</option>${cols.map(c => `<option value="${esc(c.id)}" ${c.id === m ? "selected" : ""}>${esc(c.label)}</option>`).join("")}</select>${P.header ? `<div class="hint" style="margin-top:4px">“${esc(P.rows[0][j] || "")}”</div>` : ""}</th>`).join("")}</tr></thead>
      <tbody>${body.slice(0, 5).map(r => `<tr>${P.map.map((m, j) => { const c = cols.find(x => x.id === m); const v = c?.type === "date" ? fmtDate(normDate(r[j])) : r[j]; return `<td title="${esc(r[j] || "")}" style="${m ? "" : "opacity:.4"}">${esc(v || "")}</td>`; }).join("")}</tr>`).join("")}</tbody></table></div>${body.length > 5 ? `<span class="hint">…and ${body.length - 5} more rows</span>` : ""}</div>
      <label class="ck"><input type="checkbox" id="ps_head" ${P.header ? "checked" : ""}> First row is column headings</label>`;
  };
  if (text) parse();
  openDialog({
    eyebrow: sh.name, title: "Paste rows from Excel", saveLabel: "Add rows",
    body: () => `<div class="field"><label for="ps_txt">Pasted cells</label><textarea class="inp pastebox" id="ps_txt" placeholder="Click here and press Ctrl+V">${esc(text)}</textarea></div><div id="ps_prev">${preview()}</div>`,
    mount: root => {
      const ta = root.querySelector("#ps_txt"), redraw = () => { root.querySelector("#ps_prev").innerHTML = preview(); };
      ta.addEventListener("input", () => { P.text = ta.value; P.headerSet = undefined; parse(); redraw(); });
      root.addEventListener("change", e => {
        if (e.target.dataset.map !== undefined) { P.map[+e.target.dataset.map] = e.target.value; redraw(); }
        if (e.target.id === "ps_head") { P.headerSet = e.target.checked; parse(); redraw(); }
      });
    },
    onSave: async () => {
      const body = P.header ? P.rows.slice(1) : P.rows;
      if (!body.length) { toast("Paste some rows first"); return false; }
      if (!P.map.some(Boolean)) { toast("Match at least one column"); return false; }
      const now = new Date().toISOString(); let order = rowsOf(sid).reduce((m, r) => Math.max(m, r.order || 0), 0);
      const newOpts = {}, recs = [];
      const srCols = cols.filter(c => c.type === "number" && /^(sr|sl|s\.?no|#|no)/i.test(c.label) && !P.map.includes(c.id)), srMax = {};
      srCols.forEach(c => { srMax[c.id] = rowsOf(sid).reduce((m, r) => Math.max(m, +(r.cells || {})[c.id] || 0), 0); });
      body.forEach(r => {
        const cells = {};
        P.map.forEach((m, j) => { if (!m || !r[j]) return; const c = cols.find(x => x.id === m); let v = r[j];
          if (c.type === "date") v = normDate(v); else if (c.type === "number") v = v.replace(/,/g, "");
          else if (c.type === "select" && !(c.options || []).includes(v)) (newOpts[c.id] = newOpts[c.id] || new Set()).add(v);
          cells[m] = v; });
        if (!Object.keys(cells).length) return;
        srCols.forEach(c => { if (!cells[c.id]) cells[c.id] = String(++srMax[c.id]); });
        recs.push([uid("r") + recs.length, {sheetId: sid, order: ++order, cells, updatedAt: now}]);
      });
      if (Object.keys(newOpts).length) store.put("sheets", sid, {...sh, columns: sh.columns.map(c => newOpts[c.id] ? {...c, options: [...(c.options || []), ...newOpts[c.id]]} : c)});
      const sn = recs.map(([id]) => ["rows", id, null]);
      await pool(recs.map(([id, d]) => () => store.put("rows", id, d)));
      render(); pushUndo(`${recs.length} rows pasted`, sn);
    }
  });
}
document.addEventListener("paste", e => {
  if (S.view !== "sheet" || !S.sheets[S.sheetId]) return;
  if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName) || !$("#dlg").hidden || !$("#modal").hidden || drawerOpen() || CP) return;
  const t = e.clipboardData?.getData("text/plain") || ""; if (!/[\t\n]/.test(t.trim())) return;
  e.preventDefault(); openPaste(t.replace(/\r?\n$/, ""));
});

/* ---------- Holiday calendar ---------- */
const WD = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
function openHolidays() {
  const t = curTracker(); if (!t) return;
  let list = clone(S.trackers[t.id]?.holidays || []);
  const draw = () => { list.sort((a, b) => a.date.localeCompare(b.date)); return list.length ? list.map((h, i) => { const d = parseD(h.date); const we = d && (d.getDay() === 0 || d.getDay() === 6); return `<div class="hol-row"><span class="d">${esc(fmtDate(h.date))}<span class="wk">${d ? WD[d.getDay()] : ""}</span></span><span>${esc(h.name || "Holiday")}${we ? ` <span class="hint">(weekend, no effect)</span>` : ""}</span><button type="button" class="icon" data-hdel="${i}" aria-label="Remove">${ICON.trash}</button></div>`; }).join("") : `<div class="hint" style="padding:10px">No holidays yet. Add bank and public holidays so aging skips them.</div>`; };
  openDialog({
    eyebrow: t.name, title: "Holiday calendar", saveLabel: "Save holidays",
    body: () => `<div class="field"><span class="lbl">Holidays <span class="typ" id="hl_n">${list.length}</span></span><div class="hol-list" id="hl_list">${draw()}</div></div>
      <div class="field"><span class="lbl">Add a holiday</span><div class="row2"><input class="inp" type="date" id="hl_d" style="flex:none;width:170px"><input class="inp" id="hl_name" placeholder="e.g. Diwali, Bank holiday"><button class="btn" type="button" id="hl_add" style="flex:none">Add</button></div></div>
      <div class="field"><label for="hl_bulk">Or paste a list <span class="typ">one per line: date, name</span></label><textarea class="inp" id="hl_bulk" rows="3" placeholder="25-Dec-2026 Christmas&#10;2027-01-26 Republic Day"></textarea><button class="btn" type="button" id="hl_bulkadd" style="align-self:flex-start">Add from list</button></div>
      <span class="hint">Aging columns in ${esc(t.name)} set to working days skip these dates. Weekends are always skipped.</span>`,
    mount: root => {
      const redraw = () => { root.querySelector("#hl_list").innerHTML = draw(); root.querySelector("#hl_n").textContent = list.length; };
      const add = (date, name) => { if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false; list = list.filter(h => h.date !== date); list.push({date, name: name || "Holiday"}); return true; };
      root.querySelector("#hl_add").onclick = () => { const d = root.querySelector("#hl_d").value; if (!add(d, root.querySelector("#hl_name").value.trim())) { toast("Pick a date"); return; } root.querySelector("#hl_d").value = ""; root.querySelector("#hl_name").value = ""; redraw(); };
      root.querySelector("#hl_name").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); root.querySelector("#hl_add").click(); } });
      root.querySelector("#hl_bulkadd").onclick = () => {
        let n = 0, bad = 0; root.querySelector("#hl_bulk").value.split(/\n/).map(l => l.trim()).filter(Boolean).forEach(l => {
          const m = /^(\d{4}-\d{1,2}-\d{1,2}|\d{1,2}[\s\-\/.][A-Za-z]{3,9}[\s\-\/.,]*\d{2,4}|\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}|\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]{3,9}(?:\s*,?\s*\d{4})?)\s*[,\t\-–:]?\s*(.*)$/.exec(l);
          if (m && add(normDate(m[1]), m[2].trim())) n++; else bad++;
        });
        redraw(); toast(`${n} added${bad ? `, ${bad} lines skipped (date not recognised)` : ""}`); if (n) root.querySelector("#hl_bulk").value = "";
      };
      root.addEventListener("click", e => { const b = e.target.closest("[data-hdel]"); if (b) { list.splice(+b.dataset.hdel, 1); redraw(); } });
    },
    onSave: async () => {
      const prev = snap("trackers", [t.id]);
      const base = S.trackers[t.id] || {name: t.name, short: t.short, order: t.order ?? 0, color: trackerColor(t)};
      await store.put("trackers", t.id, {...base, holidays: list});
      render(); pushUndo(`Holiday calendar saved (${list.length})`, prev);
    }
  });
}

/* ---------- Status workflow (per project) ---------- */
const STATUS_CATS = {
  plan: {label: "Planning / analysis", tone: "neu"},
  progress: {label: "In progress (Fable)", tone: "info"},
  client: {label: "Waiting on bank / client", tone: "warn"},
  blocked: {label: "Blocked", tone: "bad"},
  hold: {label: "On hold", tone: "neu"},
  done: {label: "Done", tone: "good", closed: true},
  cancelled: {label: "Cancelled", tone: "neu", closed: true},
};
const STD_STATUSES = [["Initial Discussion","plan"],["BRD/Requirements Analysis","plan"],["CRF/FSD Preparation","plan"],["CRF/FSD Sent for Approval","client"],["CRF Walkthrough","plan"],["Efforts Estimation in Progress","plan"],["Efforts Approval by Client Pending","client"],["Bank to Assign Development Priority","client"],["Development to be Started","progress"],["Development in Progress","progress"],["FF Testing WIP","progress"],["Partially Deployed on UAT","progress"],["Bank UAT Testing WIP","client"],["Bank UAT Testing Signed Off","progress"],["Patch Preparation","progress"],["Pre-Prod Deployment Sign-off Pending","client"],["CUG Sign-off Pending","client"],["Deployed in Prod, Client Sign-off Pending","client"],["Production Deployment Signed Off","done"],["On Hold from Bank","hold"],["Cancelled by Bank","cancelled"]].map(([name, cat]) => ({name, cat}));
let STATUS_META = new Map();
function statusesOf(trackerId) { const t = S.trackers[trackerId] || {}; const l = Array.isArray(t.statuses) ? t.statuses : Object.values(t.statuses || {}); return l.length ? l.filter(x => x && x.name) : STD_STATUSES; }
function rebuildStatusMeta() {
  const m = new Map();
  for (const t of trackerList()) { const used = Object.values(S.sheets).some(sh => tid(sh) === t.id && sh.statusCol); if (!used && !S.trackers[t.id]?.statuses) continue; statusesOf(t.id).forEach((st, i, all) => { const k = st.name.trim().toLowerCase(); if (!m.has(k)) m.set(k, {cat: st.cat, i: i + 1, n: all.length}); }); }
  STATUS_META = m;
}
async function syncStatusColumns(trackerId, list) {
  const names = list.map(x => x.name);
  await pool(sheetList(trackerId).filter(sh => sh.statusCol).map(sh => () => { const cur = S.sheets[sh.id]; return store.put("sheets", sh.id, {...cur, columns: cur.columns.map(c => c.id === cur.statusCol ? {...c, type: "select", options: names} : c)}); }));
}
function openWorkflow() {
  const t = curTracker(); if (!t) return;
  let list = clone(statusesOf(t.id)).map((x, i) => ({...x, _orig: x.name, _k: i}));
  const draw = root => {
    root.querySelector("#wf_list").innerHTML = list.map((x, i) => `<div class="wfrow" data-i="${i}"><span class="wfn">${i + 1}</span>
      <input class="inp mini" data-wf="name" value="${esc(x.name)}" aria-label="Status name">
      <select class="inp mini" data-wf="cat" aria-label="Category">${Object.entries(STATUS_CATS).map(([k, c]) => `<option value="${k}" ${x.cat === k ? "selected" : ""}>${c.label}</option>`).join("")}</select>
      <span class="pill t-${(STATUS_CATS[x.cat] || STATUS_CATS.progress).tone}" style="justify-self:start">${esc(x.name || "…")}</span>
      <span class="acts"><button type="button" class="icon" data-wfmv="-1" aria-label="Move up" ${i === 0 ? "disabled" : ""}>${ICON.up}</button><button type="button" class="icon" data-wfmv="1" aria-label="Move down" ${i === list.length - 1 ? "disabled" : ""}>${ICON.down}</button><button type="button" class="icon" data-wfdel aria-label="Remove">${ICON.trash}</button></span></div>`).join("");
  };
  openDialog({
    eyebrow: t.name, title: "Status workflow", saveLabel: "Save workflow",
    body: () => `<p class="hint" style="margin:0">These stages are the choices in the Status column of every sheet in <b>${esc(t.name)}</b> that uses one. Order = stage order. The category sets the colour, and Done / Cancelled count as closed, which stops aging and ETA alerts. Renaming a stage updates the entries that use it.</p>
      <div class="wflist" id="wf_list"></div>
      <div class="row2" style="flex:none"><input class="inp" id="wf_new" placeholder="Add a stage, e.g. SIT Testing WIP" style="flex:2"><select class="inp" id="wf_newcat" style="flex:1">${Object.entries(STATUS_CATS).map(([k, c]) => `<option value="${k}" ${k === "progress" ? "selected" : ""}>${c.label}</option>`).join("")}</select><button class="btn primary" type="button" id="wf_add" style="flex:none">Add</button></div>
      <button class="btn ghost" type="button" id="wf_std" style="align-self:flex-start">Reset to the standard list</button>`,
    mount: root => {
      draw(root);
      root.addEventListener("input", e => { const row = e.target.closest(".wfrow"); if (!row || e.target.dataset.wf !== "name") return; list[+row.dataset.i].name = e.target.value; row.querySelector(".pill").textContent = e.target.value || "…"; });
      root.addEventListener("change", e => { const row = e.target.closest(".wfrow"); if (!row || e.target.dataset.wf !== "cat") return; list[+row.dataset.i].cat = e.target.value; draw(root); });
      root.addEventListener("click", e => {
        const row = e.target.closest(".wfrow"); const b = e.target.closest("button"); if (!row || !b) return; const i = +row.dataset.i;
        if (b.dataset.wfmv) { const j = i + +b.dataset.wfmv; if (j < 0 || j >= list.length) return; [list[i], list[j]] = [list[j], list[i]]; draw(root); }
        if (b.hasAttribute("data-wfdel")) { list.splice(i, 1); draw(root); }
      });
      const add = () => { const v = root.querySelector("#wf_new").value.trim(); if (!v) return; if (list.some(x => x.name.toLowerCase() === v.toLowerCase())) { toast("That stage already exists"); return; } list.push({name: v, cat: root.querySelector("#wf_newcat").value}); root.querySelector("#wf_new").value = ""; draw(root); root.querySelector("#wf_list").lastElementChild?.scrollIntoView({block: "nearest"}); };
      root.querySelector("#wf_add").onclick = add;
      root.querySelector("#wf_new").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); add(); } });
      root.querySelector("#wf_std").onclick = () => { list = clone(STD_STATUSES); draw(root); };
    },
    onSave: async () => {
      list = list.map(x => ({...x, name: x.name.trim()})).filter(x => x.name);
      const dup = list.find((x, i) => list.findIndex(y => y.name.toLowerCase() === x.name.toLowerCase()) !== i); if (dup) { toast(`“${dup.name}” is listed twice`); return false; }
      const renames = new Map(list.filter(x => x._orig && x._orig !== x.name).map(x => [x._orig, x.name]));
      const clean = list.map(({name, cat}) => ({name, cat}));
      const snaps = snap("trackers", [t.id]).concat(snap("sheets", sheetList(t.id).filter(s => s.statusCol).map(s => s.id)));
      const base = S.trackers[t.id] || {name: t.name, short: t.short, order: t.order ?? 0};
      await store.put("trackers", t.id, {...base, statuses: clean});
      await syncStatusColumns(t.id, clean);
      let n = 0;
      if (renames.size) { const tasks = []; sheetList(t.id).filter(s => s.statusCol).forEach(sh => rowsOf(sh.id).forEach(r => { const v = (r.cells || {})[sh.statusCol]; if (renames.has(v)) { snaps.push(["rows", r.id, clone(S.rows[r.id])]); n++; tasks.push(() => store.put("rows", r.id, {...S.rows[r.id], cells: {...S.rows[r.id].cells, [sh.statusCol]: renames.get(v)}})); } })); await pool(tasks); }
      render(); pushUndo(`Status workflow saved${n ? ` · ${n} entries renamed` : ""}`, snaps);
    }
  });
}
function openCardSettings() {
  const sid = S.sheetId, sh = S.sheets[sid], cols = (sh.columns || []).filter(c => c.type !== "calc"), auto = titleCol({...sh, titleCol: null});
  const sample = rowsOf(sid).slice(0, 1)[0];
  openDialog({
    eyebrow: sh.name, title: "Card heading & fields", saveLabel: "Save",
    body: () => `<div class="field"><label for="cs_title">Card heading column</label><select class="inp" id="cs_title"><option value="">Automatic (${esc(auto?.label || "first text column")})</option>${cols.map(c => `<option value="${esc(c.id)}" ${c.id === sh.titleCol ? "selected" : ""}>${esc(c.label)}</option>`).join("")}</select></div>
      <div class="hint" id="cs_prev"></div>
      <div class="field"><label>Details shown under the heading</label><label class="ck"><input type="checkbox" id="cs_auto" ${Array.isArray(sh.cardFields) ? "" : "checked"}> Automatic (first 3 filled text and date columns)</label>
      <div id="cs_fields" class="cs-fields">${cols.filter(c => c.type !== "select").map(c => `<label class="ck"><input type="checkbox" value="${esc(c.id)}" ${Array.isArray(sh.cardFields) && sh.cardFields.includes(c.id) ? "checked" : ""}> ${esc(c.label)}</label>`).join("")}</div></div>
      <p class="hint" style="margin:0">The heading is also used as the title of the entry form and in AI answers. Dropdown values (status, owner…) always show as coloured tags on the card.</p>`,
    mount: root => {
      const sel = root.querySelector("#cs_title"), prev = root.querySelector("#cs_prev"), ck = root.querySelector("#cs_auto"), box = root.querySelector("#cs_fields");
      const upd = () => { const c = cols.find(x => x.id === sel.value) || auto; prev.innerHTML = sample ? `Example: <b>${esc((sample.cells || {})[c?.id] || "Untitled entry")}</b>` : ""; box.style.opacity = ck.checked ? .45 : 1; box.querySelectorAll("input").forEach(i => i.disabled = ck.checked); };
      sel.addEventListener("change", upd); ck.addEventListener("change", upd); upd();
    },
    onSave: async root => {
      const snaps = snap("sheets", [sid]), cur = S.sheets[sid], tcv = root.querySelector("#cs_title").value || null;
      const cf = root.querySelector("#cs_auto").checked ? null : [...root.querySelectorAll("#cs_fields input:checked")].map(i => i.value);
      await store.put("sheets", sid, {...cur, titleCol: tcv, cardFields: cf});
      render(); pushUndo("Card layout updated", snaps);
    }
  });
}
function openStatusSettings(colId) {
  const sid = S.sheetId, sh = S.sheets[sid], cols = (sh.columns || []).filter(c => c.type === "select" || c.type === "text"), t = curTracker();
  const def = colId || sh.statusCol || (cols.find(c => /status|stage/i.test(c.label)) || {}).id || "__new";
  openDialog({
    eyebrow: sh.name, title: "Status column", saveLabel: "Save",
    body: () => `<p class="hint" style="margin:0">The status column uses the <b>${esc(t.name)}</b> workflow (${statusesOf(t.id).length} stages). Click a status cell to pick a stage; new stages you type are added to the workflow.</p>
      <div class="field"><label for="sc_col">Status column</label><select class="inp" id="sc_col"><option value="">None</option><option value="__new" ${def === "__new" ? "selected" : ""}>+ Create a new “Status” column</option>${cols.map(c => `<option value="${esc(c.id)}" ${c.id === def ? "selected" : ""}>${esc(c.label)}</option>`).join("")}</select></div>
      <div id="sc_info"></div>
      <div class="row2" style="flex:none"><button class="btn" type="button" id="sc_wf" style="flex:none">Edit the workflow…</button></div>`,
    mount: root => {
      const names = new Set(statusesOf(t.id).map(x => x.name.toLowerCase()));
      const info = () => { const cid = root.querySelector("#sc_col").value; const box = root.querySelector("#sc_info"); if (!cid || cid === "__new") { box.innerHTML = ""; return; }
        const vals = [...new Set(rowsOf(sid).map(r => (r.cells || {})[cid]).filter(Boolean))], odd = vals.filter(v => !names.has(v.toLowerCase()));
        box.innerHTML = odd.length ? `<div class="banner">${odd.length} value${odd.length === 1 ? "" : "s"} in this column ${odd.length === 1 ? "isn't" : "aren't"} in the workflow: ${odd.slice(0, 6).map(esc).join(", ")}${odd.length > 6 ? "…" : ""}</div><label class="ck"><input type="radio" name="sc_odd" value="keep" checked> Keep them as they are (shown grey)</label><label class="ck"><input type="radio" name="sc_odd" value="add"> Add them to the workflow</label>` : `<div class="hint">All current values match the workflow.</div>`; };
      root.querySelector("#sc_col").addEventListener("change", info); info();
      root.querySelector("#sc_wf").onclick = () => { closeDialog(true); openWorkflow(); };
    },
    onSave: async root => {
      let cid = root.querySelector("#sc_col").value; const snaps = snap("sheets", [sid]).concat(snap("trackers", [t.id])); let cur = S.sheets[sid];
      if (!cid) { await store.put("sheets", sid, {...cur, statusCol: null}); render(); pushUndo("Status column cleared", snaps); return; }
      let list = clone(statusesOf(t.id));
      if (cid === "__new") { const nc = {id: uid("c"), label: "Status", type: "select", options: []}; cur = {...cur, columns: [...cur.columns, nc]}; cid = nc.id; }
      else if (root.querySelector('input[name="sc_odd"]:checked')?.value === "add") { const have = new Set(list.map(x => x.name.toLowerCase())); [...new Set(rowsOf(sid).map(r => (r.cells || {})[cid]).filter(Boolean))].forEach(v => { if (!have.has(v.toLowerCase())) { list.push({name: v, cat: tone(v) === "good" ? "done" : tone(v) === "bad" ? "blocked" : "progress"}); have.add(v.toLowerCase()); } }); }
      const base = S.trackers[t.id] || {name: t.name, short: t.short, order: t.order ?? 0};
      await store.put("trackers", t.id, {...base, statuses: list});
      await store.put("sheets", sid, {...cur, statusCol: cid, columns: cur.columns.map(c => c.id === cid ? {...c, type: "select", options: list.map(x => x.name)} : c)});
      await syncStatusColumns(t.id, list);
      render(); pushUndo("Status column set", snaps);
    }
  });
}

/* ---------- Assignee → Owner ---------- */
const splitNames = v => String(v || "").split(/\s*(?:,|;|\/|&|\+|\band\b|\n)\s*/i).map(x => x.trim()).filter(Boolean);
function peopleOf(trackerId) { const t = S.trackers[trackerId] || {}; const people = Array.isArray(t.people) ? t.people : Object.values(t.people || {}); const owners = Array.isArray(t.owners) ? t.owners : Object.values(t.owners || {}); return {people, owners: owners.length ? owners : ["Fable", (t.name || "Bank").replace(/\s*bank$/i, "") + " Bank"].filter((x, i, a) => a.indexOf(x) === i)}; }
function ownerFor(trackerId, name) { const n = name.toLowerCase(); return peopleOf(trackerId).people.find(p => p.name.toLowerCase() === n)?.owner || ""; }
function ownersFromAssignee(sh, val) { const tid0 = tid(sh); const o = []; splitNames(val).forEach(n => { const w = ownerFor(tid0, n); if (w && !o.includes(w)) o.push(w); }); return o; }
function deriveOwner(d) {
  const sh = S.sheets[d?.sheetId]; if (!sh || !sh.assigneeCol || !sh.ownerCol) return d;
  const a = (d.cells || {})[sh.assigneeCol]; if (!a) return d;
  const o = ownersFromAssignee(sh, a); if (!o.length) return d;
  const val = o.join(", "); if ((d.cells || {})[sh.ownerCol] === val) return d;
  return {...d, cells: {...(d.cells || {}), [sh.ownerCol]: val}};
}
function wrapStore(st) { if (!st || st.__wrapped) return st; const put = st.put.bind(st); st.put = (k, id, d) => put(k, id, k === "rows" ? deriveOwner(d) : d); st.__wrapped = true; return st; }
async function saveTrackerPeople(trackerId, people, owners) {
  const t = S.trackers[trackerId] || {name: curTracker()?.name || "Tracker", order: 0}; const sn = snap("trackers", [trackerId]);
  await store.put("trackers", trackerId, {...t, people, owners}); return sn;
}
function openPeople() {
  const t = curTracker(); if (!t) return;
  let {people, owners} = peopleOf(t.id); people = clone(people); owners = [...owners];
  const draw = root => {
    root.querySelector("#pp_owners").innerHTML = owners.map((o, i) => `<span class="fchip"><button type="button" title="${people.filter(p => p.owner === o).length} people">${esc(o)} <span class="n">${people.filter(p => p.owner === o).length}</span></button><button type="button" class="x" data-odel="${i}" aria-label="Remove ${esc(o)}">✕</button></span>`).join("");
    const osel = (v, attr) => `<select class="inp mini" ${attr}>${owners.map(o => `<option ${o === v ? "selected" : ""}>${esc(o)}</option>`).join("")}${v && !owners.includes(v) ? `<option selected>${esc(v)}</option>` : ""}${!v ? `<option value="" selected>Choose owner…</option>` : ""}</select>`;
    root.querySelector("#pp_list").innerHTML = people.length ? owners.concat(people.some(p => !owners.includes(p.owner)) ? [""] : []).map(o => { const ps = people.map((p, i) => [p, i]).filter(([p]) => o ? p.owner === o : !owners.includes(p.owner)); if (!ps.length) return ""; return `<div class="ppgrp"><b>${o ? esc(o) : "Needs an owner"}</b>${ps.map(([p, i]) => `<div class="pprow"><span>${esc(p.name)}</span>${osel(p.owner, `data-pown="${i}"`)}<button type="button" class="icon" data-pdel="${i}" aria-label="Remove ${esc(p.name)}">${ICON.trash}</button></div>`).join("")}</div>`; }).join("") : `<div class="hint" style="padding:10px">No people yet. Add them below, or click “Learn from sheets”.</div>`;
    root.querySelector("#pp_newown").innerHTML = owners.map(o => `<option>${esc(o)}</option>`).join("");
  };
  openDialog({
    eyebrow: t.name, title: "People & owners", saveLabel: "Save",
    body: () => `<p class="hint" style="margin:0">Owners are the organisations (e.g. Fable, the bank, Mastercard). Each person belongs to one owner. When you pick assignees on a sheet, its Owner column fills in automatically.</p>
      <div class="field"><span class="lbl">Owners</span><div class="fbar" id="pp_owners"></div><div class="row2" style="flex:none"><input class="inp" id="pp_newo" placeholder="Add an owner, e.g. Mastercard" style="flex:1"><button class="btn" type="button" id="pp_addo" style="flex:none">Add owner</button></div></div>
      <div class="field"><span class="lbl">People</span><div id="pp_list" class="pplist"></div>
        <div class="row2" style="flex:none"><input class="inp" id="pp_newn" placeholder="Name, e.g. Vishal (or several: Vishal, Rahul)" style="flex:2"><select class="inp" id="pp_newown" style="flex:1"></select><button class="btn primary" type="button" id="pp_addp" style="flex:none">Add</button></div>
        <button class="btn ghost" type="button" id="pp_learn" style="align-self:flex-start">${ICON.spark} Learn from sheets</button><span class="hint" id="pp_msg"></span></div>`,
    mount: root => {
      draw(root);
      root.querySelector("#pp_addo").onclick = () => { const v = root.querySelector("#pp_newo").value.trim(); if (v && !owners.includes(v)) owners.push(v); root.querySelector("#pp_newo").value = ""; draw(root); };
      root.querySelector("#pp_newo").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); root.querySelector("#pp_addo").click(); } });
      const addP = () => { const names = splitNames(root.querySelector("#pp_newn").value), o = root.querySelector("#pp_newown").value; names.forEach(n => { const ex = people.find(p => p.name.toLowerCase() === n.toLowerCase()); if (ex) ex.owner = o; else people.push({name: n, owner: o}); }); root.querySelector("#pp_newn").value = ""; draw(root); root.querySelector("#pp_newn").focus(); };
      root.querySelector("#pp_addp").onclick = addP;
      root.querySelector("#pp_newn").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); addP(); } });
      root.addEventListener("click", e => {
        const od = e.target.closest("[data-odel]"); if (od) { const o = owners[+od.dataset.odel]; if (people.some(p => p.owner === o)) { toast(`Move or remove the people under ${o} first`); return; } owners.splice(+od.dataset.odel, 1); draw(root); }
        const pd = e.target.closest("[data-pdel]"); if (pd) { people.splice(+pd.dataset.pdel, 1); draw(root); }
      });
      root.addEventListener("change", e => { const i = e.target.dataset.pown; if (i !== undefined) { people[+i].owner = e.target.value; draw(root); } });
      root.querySelector("#pp_learn").onclick = () => {
        let added = 0, unk = 0;
        sheetList(t.id).forEach(sh => { if (!sh.assigneeCol) return; rowsOf(sh.id).forEach(r => { const names = splitNames((r.cells || {})[sh.assigneeCol]); const own = sh.ownerCol ? splitNames((r.cells || {})[sh.ownerCol]) : [];
          names.forEach(n => { if (people.some(p => p.name.toLowerCase() === n.toLowerCase())) return; const o = names.length === 1 && own.length === 1 ? own[0] : ""; if (o && !owners.includes(o)) owners.push(o); people.push({name: n, owner: o}); o ? added++ : unk++; }); }); });
        draw(root); root.querySelector("#pp_msg").textContent = added + unk ? `Found ${added + unk} names${unk ? `, ${unk} need an owner (see “Needs an owner”)` : ""}.` : "No new names found. Set the Assignee column on your sheets first.";
      };
    },
    onSave: async () => { const sn = await saveTrackerPeople(t.id, people.filter(p => p.name), owners); render(); pushUndo("People & owners saved", sn); }
  });
}
function openAssigneeSettings(colId) {
  const sid = S.sheetId, sh = S.sheets[sid], cols = sh.columns || [];
  const aCols = cols.filter(c => c.type === "text" || c.type === "select" || c.type === "long"), oCols = cols.filter(c => (c.type === "text" || c.type === "select") && c.id !== (colId || sh.assigneeCol));
  const aDef = colId || sh.assigneeCol || (aCols.find(c => /assign|owner|resp|spoc|person/i.test(c.label)) || aCols[0])?.id;
  const t = curTracker(), {people} = peopleOf(t.id);
  openDialog({
    eyebrow: sh.name, title: "Assignee & owner", saveLabel: "Save",
    body: () => `<p class="hint" style="margin:0">Pick one or more assignees per entry; the Owner column fills in from <b>People & owners</b> (${people.length} people in ${esc(t.name)}). Mixed teams show both, e.g. “Fable, BCP Bank”.</p>
      <div class="row2" style="flex:none;gap:12px">
        <div class="field" style="flex:1"><label for="as_a">Assignee column</label><select class="inp" id="as_a"><option value="">None</option>${aCols.map(c => `<option value="${esc(c.id)}" ${c.id === aDef ? "selected" : ""}>${esc(c.label)}</option>`).join("")}</select></div>
        <div class="field" style="flex:1"><label for="as_o">Owner column (filled automatically)</label><select class="inp" id="as_o"><option value="__new">+ Create a new “Owner” column</option>${oCols.map(c => `<option value="${esc(c.id)}" ${c.id === sh.ownerCol ? "selected" : ""}>${esc(c.label)}</option>`).join("")}</select></div></div>
      <label class="ck"><input type="checkbox" id="as_fill" checked> Fill the Owner column for existing entries now</label>
      <div class="row2" style="flex:none"><button class="btn" type="button" id="as_people" style="flex:none">Manage people & owners…</button></div>`,
    mount: root => { root.querySelector("#as_people").onclick = () => { closeDialog(true); openPeople(); }; },
    onSave: async root => {
      const a = root.querySelector("#as_a").value; let o = root.querySelector("#as_o").value;
      if (!a) { const sn = snap("sheets", [sid]); await store.put("sheets", sid, {...S.sheets[sid], assigneeCol: null, ownerCol: null}); render(); pushUndo("Assignee column cleared", sn); return; }
      if (o === a) { toast("Owner and Assignee must be different columns"); return false; }
      const snaps = snap("sheets", [sid]); let cur = S.sheets[sid];
      if (o === "__new") { const {owners} = peopleOf(t.id); const nc = {id: uid("c"), label: "Owner", type: "select", options: owners}; const ncols = cur.columns.map(c => c.id === a && /^owners?$/i.test(c.label.trim()) ? {...c, label: "Assignee"} : c); ncols.splice(ncols.findIndex(c => c.id === a) + 1, 0, nc); o = nc.id; cur = {...cur, columns: ncols}; }
      await store.put("sheets", sid, {...cur, assigneeCol: a, ownerCol: o});
      let n = 0;
      if (root.querySelector("#as_fill").checked) { const tasks = []; rowsOf(sid).forEach(r => { const d = deriveOwner({...S.rows[r.id]}); if ((d.cells || {})[o] !== ((S.rows[r.id].cells || {})[o])) { snaps.push(["rows", r.id, clone(S.rows[r.id])]); n++; tasks.push(() => store.put("rows", r.id, d)); } }); await pool(tasks); }
      render(); pushUndo(`Assignee & owner set${n ? ` · ${n} owners filled` : ""}`, snaps);
      if (!peopleOf(t.id).people.length) setTimeout(() => toast("Next: add your people under ⋯ → People & owners"), 2600);
    }
  });
}

/* ---------- Remark column ---------- */
const RMK_DATES = {"dd-MMM-yyyy": "07-Nov-2026", "dd MMM yyyy": "07 Nov 2026", "dd-MMM-yy": "07-Nov-26", "dd/MM/yyyy": "07/11/2026", "dd-MM-yyyy": "07-11-2026", "yyyy-MM-dd": "2026-11-07", "MMM dd, yyyy": "Nov 07, 2026"};
function rmkFmt(sh) { return {date: "dd-MMM-yyyy", tag: "Fable", pos: "top", ...(sh?.remarkFmt || {})}; }
function fmtStampDate(f, d = new Date()) {
  const dd = String(d.getDate()).padStart(2, "0"), mm = String(d.getMonth() + 1).padStart(2, "0"), M = MON[d.getMonth()], y = d.getFullYear();
  return ({"dd MMM yyyy": `${dd} ${M} ${y}`, "dd-MMM-yy": `${dd}-${M}-${String(y).slice(2)}`, "dd/MM/yyyy": `${dd}/${mm}/${y}`, "dd-MM-yyyy": `${dd}-${mm}-${y}`, "yyyy-MM-dd": `${y}-${mm}-${dd}`, "MMM dd, yyyy": `${M} ${dd}, ${y}`})[f] || `${dd}-${M}-${y}`;
}
function remarkStamp(sh) { const f = rmkFmt(sh); return `${fmtStampDate(f.date)}${f.tag ? `(${f.tag})` : ""}:`; }
function addRemark(sh, old, txt) { const f = rmkFmt(sh), line = `${remarkStamp(sh)} ${txt.trim()}`; old = (old || "").trim(); return !old ? line : f.pos === "bottom" ? `${old}\n${line}` : `${line}\n${old}`; }
const isRemark = (sh, c) => !!(sh && c && sh.remarkCol === c.id);
async function aiRewrite(text, mode) {
  const ask = mode === "improve"
    ? "Improve this comment for a professional bank-project tracker: clear, concise, correct grammar and spelling, keep every fact, name, date and number. Do not add new facts."
    : "Rephrase this tracker comment in different, clear words. Keep the same meaning, facts, names, dates and roughly the same length.";
  return (await gemini(`${ask} Return only the rewritten comment, without a date prefix or quotes.\n\nComment:\n${text}`, {system: "You rewrite short status comments for a project tracker.", temp: 0.5})).trim().replace(/^["“]|["”]$/g, "");
}
async function aiSummary(text) {
  return (await gemini(`Summarise the CURRENT status of this tracker entry in at most 2 short sentences (max 220 characters). Start from the latest dated update, keep names, dates and who it's pending with.\n\n${String(text).slice(0, 8000)}`, {system: aiSystem()})).trim();
}
function openRemarkSettings(colId) {
  const sid = S.sheetId, sh = S.sheets[sid], cols = (sh.columns || []).filter(c => c.type === "long" || c.type === "text");
  let col = colId || sh.remarkCol || (cols.find(c => /remark|update|comment|response/i.test(c.label)) || cols[0])?.id;
  const f = rmkFmt(sh);
  openDialog({
    eyebrow: sh.name, title: "Remark column", saveLabel: "Save",
    body: () => `<p class="hint" style="margin:0">The remark column gets dated updates, ${AI_ON ? "an AI summary icon in every cell, and AI rephrase / improve for new comments" : "and a quick “Add update” box"}. One remark column per sheet.</p>
      <div class="field"><label for="rk_col">Remark column</label><select class="inp" id="rk_col"><option value="">None</option>${cols.map(c => `<option value="${esc(c.id)}" ${c.id === col ? "selected" : ""}>${esc(c.label)}</option>`).join("")}</select></div>
      <div class="field"><span class="lbl">Date format for new updates</span><div class="choices" id="rk_date">${Object.entries(RMK_DATES).map(([k, ex]) => `<button type="button" class="choice" data-v="${k}" aria-pressed="${f.date === k}"><b>${ex}</b><span>${k}</span></button>`).join("")}</div></div>
      <div class="row2" style="flex:none;gap:12px">
        <div class="field" style="flex:1"><label for="rk_tag">Name after the date <span class="typ">optional</span></label><input class="inp" id="rk_tag" value="${esc(f.tag)}" placeholder="e.g. Fable, BCP, your name"></div>
        <div class="field" style="flex:1"><label for="rk_pos">New updates go</label><select class="inp" id="rk_pos"><option value="top" ${f.pos !== "bottom" ? "selected" : ""}>On top (newest first)</option><option value="bottom" ${f.pos === "bottom" ? "selected" : ""}>At the bottom</option></select></div></div>
      <div class="banner" id="rk_prev"></div>`,
    mount: root => {
      const g = root.querySelector("#rk_date"); g.dataset.v = f.date; pressGroup(g, ".choice", "v");
      const prev = () => { const tmp = {remarkFmt: {date: g.dataset.v, tag: root.querySelector("#rk_tag").value.trim(), pos: root.querySelector("#rk_pos").value}}; root.querySelector("#rk_prev").textContent = "Preview: " + remarkStamp(tmp) + " Shared revised FSD with the bank."; };
      root.addEventListener("input", prev); root.addEventListener("change", prev); g.addEventListener("pick", prev); prev();
    },
    onSave: root => {
      const cur = S.sheets[sid], sn = snap("sheets", [sid]);
      store.put("sheets", sid, {...cur, remarkCol: root.querySelector("#rk_col").value || null, remarkFmt: {date: root.querySelector("#rk_date").dataset.v, tag: root.querySelector("#rk_tag").value.trim(), pos: root.querySelector("#rk_pos").value}});
      render(); pushUndo("Remark column settings saved", sn);
    }
  });
}

/* ---------- Backup & restore (JSON) ---------- */
function openBackup() {
  const counts = () => `${Object.keys(S.trackers).length} trackers · ${Object.keys(S.sheets).length} sheets · ${Object.keys(S.rows).length} entries · ${Object.keys(S.dashboards || {}).length} dashboards`;
  openDialog({
    eyebrow: "Data", title: "Backup & restore", saveLabel: "Done",
    body: () => `<div class="field"><span class="lbl">Download a backup</span><p class="hint" style="margin:0">Everything in the database right now: ${counts()}.</p><button class="btn" type="button" id="bkDl" style="align-self:flex-start">${ICON.dl} Download backup (.json)</button></div>
      <div class="field"><span class="lbl">Restore from a backup file</span><p class="hint" style="margin:0">Adds or overwrites trackers, sheets and entries with the same IDs. Nothing else is deleted.</p><input class="inp" type="file" id="bkFile" accept=".json,application/json"><div id="bkMsg" class="hint"></div><button class="btn primary" type="button" id="bkGo" style="align-self:flex-start" disabled>Restore</button></div>`,
    mount: root => {
      let data = null;
      root.querySelector("#bkDl").onclick = () => DL.save({filename: `tracker-backup-${todayISO()}.json`, data: JSON.stringify({exportedAt: new Date().toISOString(), trackers: S.trackers, sheets: S.sheets, rows: S.rows, dashboards: S.dashboards || {}}, null, 1)});
      root.querySelector("#bkFile").onchange = async e => {
        const f = e.target.files[0]; data = null; root.querySelector("#bkGo").disabled = true; if (!f) return;
        try { const j = JSON.parse(await f.text()); if (!j.sheets || !j.rows) throw 0; data = j;
          root.querySelector("#bkMsg").textContent = `Ready: ${Object.keys(j.trackers || {}).length} trackers, ${Object.keys(j.sheets).length} sheets, ${Object.keys(j.rows).length} entries, ${Object.keys(j.dashboards || {}).length} dashboards.`; root.querySelector("#bkGo").disabled = false; }
        catch (x) { root.querySelector("#bkMsg").textContent = "That file isn't a tracker backup."; }
      };
      root.querySelector("#bkGo").onclick = async () => {
        if (!data) return; const b = root.querySelector("#bkGo"); b.disabled = true; b.textContent = "Restoring…";
        const snaps = [], tasks = [];
        for (const k of ["trackers", "sheets", "rows", "dashboards"]) for (const [id, d] of Object.entries(data[k] || {})) { snaps.push([k, id, clone(S[k][id])]); tasks.push(() => store.put(k, id, d)); }
        await pool(tasks, 12); closeDialog(true); render(); pushUndo(`Restored ${tasks.length} items`, snaps);
      };
    },
    onSave: () => {}
  });
}

/* ---------- Inline cell editor ---------- */
let CP = null;
function closeCellPop() { $("#cellPop")?.remove(); document.querySelectorAll("td.editing").forEach(t => t.classList.remove("editing")); CP = null; }
function saveCell(rowId, colId, value) {
  const r = S.rows[rowId], sh = S.sheets[r?.sheetId]; if (!r || !sh) return;
  const v = String(value ?? "").trim(), old = (r.cells || {})[colId] || "";
  closeCellPop();
  if (v === old) return;
  const cells = {...(r.cells || {})}; if (v) cells[colId] = v; else delete cells[colId];
  const c = (sh.columns || []).find(x => x.id === colId);
  if (sh.statusCol === colId && v && !statusesOf(tid(sh)).some(x => x.name.toLowerCase() === v.toLowerCase())) { const T = tid(sh), list = [...clone(statusesOf(T)), {name: v, cat: "progress"}], base = S.trackers[T] || {name: curTracker()?.name, order: 0}; store.put("trackers", T, {...base, statuses: list}).then(() => syncStatusColumns(T, list)); toast(`“${v}” added to the workflow`); }
  else if (c?.type === "select" && v && !(c.options || []).includes(v)) store.put("sheets", r.sheetId, {...sh, columns: sh.columns.map(x => x.id === colId ? {...x, options: [...(x.options || []), v]} : x)});
  const sc = statusCol(sh);
  if (sc && sc.id === colId && tone(v) === "good" && tone(old) !== "good") confetti();
  const sn = snap("rows", [rowId]);
  store.put("rows", rowId, {...r, cells, updatedAt: new Date().toISOString()});
  render(); pushUndo(`${c?.label || "Field"} updated`, sn);
  requestAnimationFrame(() => { const tr = document.getElementById("row-" + rowId); if (tr) tr.classList.add("flash"); });
}
function openCellPop(td) {
  closeCellPop(); closeColMenu();
  const tr = td.closest("tr"), rowId = tr.dataset.row, colId = td.dataset.cell;
  const r = S.rows[rowId], sh = S.sheets[r?.sheetId], c = (sh?.columns || []).find(x => x.id === colId); if (!c) return;
  if (c.type === "calc") { toast(`${c.label} is calculated automatically`); return; }
  const v = (r.cells || {})[colId] || "";
  CP = {rowId, colId}; td.classList.add("editing");
  const m = document.createElement("div"); m.className = "cellpop" + (c.type === "long" ? " wide" : ""); m.id = "cellPop"; m.setAttribute("role", "dialog");
  const title = `<div class="ttl"><span>${esc(c.label)}</span><span style="text-transform:none;letter-spacing:0;font-weight:500">${esc(TYPES[c.type])}</span></div>`;
  const acts = (extra = "") => `<div class="acts">${extra}<span class="sp"></span><button type="button" class="btn ghost" data-cp="cancel">Cancel</button><button type="button" class="btn primary" data-cp="save">Save</button></div>`;
  if (c.type === "select" && sh.statusCol === c.id) {
    m.className = "cellpop wide";
    const wf = statusesOf(tid(sh)), inWf = wf.some(x => x.name === v);
    m.innerHTML = title + `<div class="wfpick">${wf.map((x, i) => `<button type="button" class="wfopt t-${(STATUS_CATS[x.cat] || STATUS_CATS.progress).tone}" aria-pressed="${v === x.name}" data-pick="${esc(x.name)}"><span class="wfi">${i + 1}</span>${esc(x.name)}</button>`).join("")}${v && !inWf ? `<button type="button" class="wfopt t-neu" aria-pressed="true" data-pick="${esc(v)}"><span class="wfi">–</span>${esc(v)}</button>` : ""}</div>
      <div class="row2"><input class="inp" id="cpNew" placeholder="New stage… press Enter (adds it to the ${esc(curTracker()?.name || "")} workflow)"></div>
      <div class="acts">${v ? `<button type="button" class="stamp" data-cp="clear" style="color:var(--bad)">Clear value</button>` : ""}<span class="sp"></span><button type="button" class="stamp" data-cp="workflow">Edit workflow…</button></div>`;
  } else if (c.type === "select") {
    const opts = [...new Set([...(c.options || []), ...(v ? [v] : [])])];
    m.innerHTML = title + `<div class="opts">${opts.map(o => `<button type="button" class="opt ${v === o ? "t-" + tone(o) : ""}" aria-pressed="${v === o}" data-pick="${esc(o)}">${esc(o)}</button>`).join("")}</div>
      <div class="row2"><input class="inp" id="cpNew" placeholder="Other value… press Enter"></div>${v ? `<div class="acts"><button type="button" class="stamp" data-cp="clear" style="color:var(--bad)">Clear value</button></div>` : ""}`;
  } else if (c.type === "date") {
    m.innerHTML = title + `<input class="inp" type="date" id="cpIn" value="${esc(/^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "")}">` + acts(`<button type="button" class="stamp" data-cp="today">Today</button>${v ? `<button type="button" class="stamp" data-cp="clear" style="color:var(--bad)">Clear</button>` : ""}`);
  } else if (sh.assigneeCol === c.id) {
    m.className = "cellpop wide";
    const T = tid(sh), {people, owners} = peopleOf(T), cur = splitNames(v), curL = cur.map(x => x.toLowerCase());
    const unknown = cur.filter(n => !people.some(p => p.name.toLowerCase() === n.toLowerCase()));
    const grp = (o, list) => list.length ? `<div class="ppgrp"><b>${esc(o)}</b><div class="opts">${list.map(n => `<button type="button" class="opt" data-asg="${esc(n)}" aria-pressed="${curL.includes(n.toLowerCase())}">${esc(n)}</button>`).join("")}</div></div>` : "";
    m.innerHTML = title + `<div class="asgpick">${owners.map(o => grp(o, people.filter(p => p.owner === o).map(p => p.name))).join("")}${grp("Not in the people list", [...unknown, ...people.filter(p => !owners.includes(p.owner)).map(p => p.name)])}${!people.length ? `<div class="hint">No people yet. Add one below, or set them up in ⋯ → People & owners.</div>` : ""}</div>
      <div class="row2" style="flex:none"><input class="inp" id="asNew" placeholder="Add a person" style="flex:2"><select class="inp" id="asOwn" style="flex:1">${owners.map(o => `<option>${esc(o)}</option>`).join("")}</select><button class="btn" type="button" data-cp="asadd" style="flex:none">Add</button></div>
      <div class="banner" id="asPrev"></div>` + acts(`<button type="button" class="stamp" data-cp="people">People & owners…</button>`);
  } else if (isRemark(sh, c)) {
    m.className = "cellpop wide rmkpop";
    m.innerHTML = title + `<div class="rmkadd"><label class="hint" for="rmNew">New update · will be added as <b>${esc(remarkStamp(sh))}</b></label>
        <textarea class="inp" id="rmNew" rows="3" placeholder="Type the new comment…"></textarea>
        <div class="acts">${AI_ON ? `<button type="button" class="stamp" data-cp="rephrase">${ICON.spark} Rephrase</button><button type="button" class="stamp" data-cp="improve">${ICON.spark} Improve</button><button type="button" class="stamp" data-cp="revert" hidden>↶ Undo AI</button>` : ""}<span class="sp"></span><button type="button" class="btn ghost" data-cp="cancel">Cancel</button><button type="button" class="btn primary" data-cp="rmadd">Add update</button></div></div>
      <div id="rmOut"></div>
      <div class="acts" style="border-top:1px solid var(--line);padding-top:8px">${AI_ON && v ? `<button type="button" class="stamp" data-cp="rmsum">${ICON.spark} Summarise remarks</button>` : ""}${v ? `<button type="button" class="stamp" data-cp="rmfull">Edit full text</button>` : ""}</div>
      <div id="rmFull" hidden><textarea class="inp" id="cpIn">${esc(v)}</textarea><div class="acts"><span class="sp"></span><button type="button" class="btn primary" data-cp="save">Save full text</button></div></div>`;
  } else if (c.type === "long") {
    m.innerHTML = title + `<textarea class="inp" id="cpIn" placeholder="Write the update…">${esc(v)}</textarea>` + acts(`<span class="hint">Ctrl + Enter to save</span>`);
  } else {
    m.innerHTML = title + `<input class="inp" id="cpIn" ${c.type === "number" ? 'type="number" style="font-family:var(--f-mono)"' : ""} value="${esc(v)}">` + acts(`<span class="hint">Enter to save</span>`);
  }
  document.body.appendChild(m);
  CP.place = () => {
    if (sheetMode()) return;
    const rc = td.getBoundingClientRect();
    if (!td.isConnected || rc.bottom < 0 || rc.top > innerHeight) { closeCellPop(); return; }
    let top = rc.bottom + 4; if (top + m.offsetHeight > innerHeight - 8) top = Math.max(8, rc.top - m.offsetHeight - 4);
    m.style.top = top + "px"; m.style.left = Math.max(8, Math.min(innerWidth - m.offsetWidth - 8, rc.left)) + "px";
  };
  CP.place();
  if (m.querySelector(".asgpick")) { const upd = () => { const sel = [...m.querySelectorAll("[data-asg][aria-pressed=true]")].map(x => x.dataset.asg); const o = ownersFromAssignee(sh, sel.join(", ")); m.querySelector("#asPrev").innerHTML = sel.length ? `Assignee: <b>${esc(sel.join(", "))}</b> · Owner: <b>${esc(o.join(", ") || "not set (add these people under an owner)")}</b>` : "No one assigned"; }; m.addEventListener("asgchange", upd); upd(); m.querySelector("#asNew").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); m.querySelector('[data-cp="asadd"]').click(); } }); }
  const inp = m.querySelector("#rmNew") || (m.querySelector("#rmFull") ? null : m.querySelector("#cpIn")) || (isTouch() ? null : m.querySelector("#cpNew"));
  inp?.focus({preventScroll: true});
  if (inp && inp.tagName === "TEXTAREA") { inp.setSelectionRange(0, 0); }
  else if (inp && inp.type !== "date") inp.select?.();
  if (c.type === "date") { try { inp.showPicker?.(); } catch (e) {} inp.addEventListener("change", () => { if (inp.value) saveCell(rowId, colId, inp.value); }); }
  m.addEventListener("keydown", e => {
    if (e.key === "Escape") { e.stopPropagation(); closeCellPop(); return; }
    if (e.target.id === "cpNew" && e.key === "Enter") { e.preventDefault(); if (e.target.value.trim()) saveCell(rowId, colId, e.target.value); return; }
    if (e.target.id === "cpIn" && e.key === "Enter" && (e.target.tagName !== "TEXTAREA" || e.ctrlKey || e.metaKey)) { e.preventDefault(); saveCell(rowId, colId, e.target.value); }
    if (e.target.id === "rmNew" && e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); m.querySelector('[data-cp="rmadd"]').click(); }
  });
  m.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.pick !== undefined) return saveCell(rowId, colId, (r.cells || {})[colId] === b.dataset.pick ? "" : b.dataset.pick);
    const a = b.dataset.cp, f = m.querySelector("#cpIn");
    if (b.dataset.asg !== undefined) { b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") !== "true"); m.dispatchEvent(new Event("asgchange")); return; }
    if (a === "cancel") closeCellPop();
    else if (a === "save" && m.querySelector(".asgpick")) saveCell(rowId, colId, [...m.querySelectorAll("[data-asg][aria-pressed=true]")].map(x => x.dataset.asg).join(", "));
    else if (a === "save") saveCell(rowId, colId, f ? f.value : "");
    else if (a === "clear") saveCell(rowId, colId, "");
    else if (a === "today") saveCell(rowId, colId, todayISO());
    else if (a === "people") { closeCellPop(); openPeople(); }
    else if (a === "workflow") { closeCellPop(); openWorkflow(); }
    else if (a === "asadd") { const nm = splitNames(m.querySelector("#asNew").value), o = m.querySelector("#asOwn").value; if (!nm.length) return; const {people, owners} = peopleOf(tid(sh)); const pp = clone(people); nm.forEach(n => { const ex = pp.find(p => p.name.toLowerCase() === n.toLowerCase()); if (ex) ex.owner = o; else pp.push({name: n, owner: o}); }); saveTrackerPeople(tid(sh), pp, owners).then(() => { const sel = [...m.querySelectorAll("[data-asg][aria-pressed=true]")].map(x => x.dataset.asg).concat(nm); const tdd = td; closeCellPop(); openCellPop(tdd); const mm = $("#cellPop"); mm.querySelectorAll("[data-asg]").forEach(x => x.setAttribute("aria-pressed", sel.map(s => s.toLowerCase()).includes(x.dataset.asg.toLowerCase()))); mm.dispatchEvent(new Event("asgchange")); }); }
    else if (a === "rmadd") { const t = m.querySelector("#rmNew").value.trim(); if (!t) { m.querySelector("#rmNew").focus(); toast("Type the update first"); return; } saveCell(rowId, colId, addRemark(sh, (r.cells || {})[colId], t)); }
    else if (a === "rmfull") { m.querySelector("#rmFull").hidden = false; b.hidden = true; m.querySelector("#cpIn").focus(); CP.place?.(); }
    else if (a === "rephrase" || a === "improve") {
      const ta = m.querySelector("#rmNew"), t = ta.value.trim(); if (!t) { ta.focus(); toast("Type a comment first, then rephrase or improve it"); return; }
      if (!AI.key) { closeCellPop(); openAI("settings"); return; }
      const old = b.textContent; b.disabled = true; b.textContent = "Working…";
      aiRewrite(t, a).then(x => { m.dataset.prev = t; ta.value = x; m.querySelector('[data-cp="revert"]').hidden = false; }).catch(err => toast(err.message)).finally(() => { b.disabled = false; b.innerHTML = `${ICON.spark} ${a === "improve" ? "Improve" : "Rephrase"}`; });
    }
    else if (a === "revert") { m.querySelector("#rmNew").value = m.dataset.prev || ""; b.hidden = true; }
    else if (a === "rmsum") { remarkSummaryInto(m.querySelector("#rmOut"), (r.cells || {})[colId], m.querySelector("#rmNew")); }
  });
}
document.addEventListener("mousedown", e => { if (CP && !e.target.closest("#cellPop") && !e.target.closest("td.editing")) closeCellPop(); });
async function remarkSummaryInto(box, text, useInto) {
  if (!AI.key) { closeCellPop(); openAI("settings"); return; }
  box.className = "aisum"; box.innerHTML = `<span class="aithink">Summarising…</span>`; CP?.place?.();
  try { const s = await aiSummary(text); box.innerHTML = `<div class="aitxt">${esc(s)}</div><div class="row2" style="flex:none"><button type="button" class="stamp" data-sumcopy>Copy</button>${useInto ? `<button type="button" class="stamp" data-sumuse>Use as new update</button>` : ""}</div>`;
    box.querySelector("[data-sumcopy]").onclick = () => navigator.clipboard.writeText(s).then(() => toast("Summary copied"), () => {});
    box.querySelector("[data-sumuse]")?.addEventListener("click", () => { useInto.value = "Summary: " + s; useInto.focus(); });
  } catch (e) { box.innerHTML = `<span style="color:var(--bad)">${esc(e.message)}</span>`; }
  CP?.place?.();
}
/* summary icon inside remark cells */
function openRemarkSummaryPop(btn) {
  const td = btn.closest("td"), rowId = td.closest("tr").dataset.row, colId = td.dataset.cell, r = S.rows[rowId], sh = S.sheets[r?.sheetId], c = (sh?.columns || []).find(x => x.id === colId);
  closeCellPop(); closeColMenu(); CP = {rowId, colId}; td.classList.add("editing");
  const m = document.createElement("div"); m.className = "cellpop wide"; m.id = "cellPop";
  m.innerHTML = `<div class="ttl"><span>${ICON.spark} Summary · ${esc(c?.label || "")}</span><button type="button" class="icon" data-x aria-label="Close">✕</button></div><div id="rsOut"></div><div class="acts"><span class="sp"></span><button type="button" class="btn" data-edit>Add an update…</button></div>`;
  document.body.appendChild(m);
  CP.place = () => { if (sheetMode()) return; const rc = td.getBoundingClientRect(); if (!td.isConnected || rc.bottom < 0 || rc.top > innerHeight) { closeCellPop(); return; } let top = rc.bottom + 4; if (top + m.offsetHeight > innerHeight - 8) top = Math.max(8, rc.top - m.offsetHeight - 4); m.style.top = top + "px"; m.style.left = Math.max(8, Math.min(innerWidth - m.offsetWidth - 8, rc.left)) + "px"; };
  CP.place();
  m.querySelector("[data-x]").onclick = closeCellPop;
  m.querySelector("[data-edit]").onclick = () => openCellPop(td);
  m.addEventListener("keydown", e => { if (e.key === "Escape") { e.stopPropagation(); closeCellPop(); } });
  remarkSummaryInto(m.querySelector("#rsOut"), (r.cells || {})[colId], null);
}
const sheetMode = () => matchMedia("(max-width:760px)").matches;
const isTouch = () => matchMedia("(hover:none)").matches;
window.addEventListener("resize", () => { if (CP && !sheetMode()) CP.place?.(); });
/* keep bottom sheets and the entry form above the on-screen keyboard */
if (window.visualViewport) { const vv = window.visualViewport; const upd = () => document.documentElement.style.setProperty("--kb", Math.max(0, Math.round(innerHeight - vv.height - vv.offsetTop)) + "px"); vv.addEventListener("resize", upd); vv.addEventListener("scroll", upd); upd(); }
document.addEventListener("scroll", e => { if (CP && !e.target.closest?.("#cellPop")) CP.place?.(); }, true);

/* ---------- Column header menu ---------- */
let CM = null;
function closeColMenu() { $("#colMenu")?.remove(); CM = null; }
function openColMenu(colId, anchor) {
  closeColMenu();
  const sh = S.sheets[S.sheetId], cols = sh.columns || [], i = cols.findIndex(c => c.id === colId), c = cols[i]; if (!c) return;
  CM = {colId, t: Date.now()};
  const m = document.createElement("div"); m.className = "colmenu"; m.id = "colMenu"; m.setAttribute("role", "menu");
  m.innerHTML = `<div class="ttl">${esc(TYPES[c.type] || "")}${c.type === "calc" ? " · " + esc(CALC[c.calc?.kind]?.name || "") : ""}</div>
    <div class="rn"><input class="inp" id="cmName" value="${esc(c.label)}" aria-label="Column name"><button class="btn primary" type="button" data-cm="rename">Rename</button></div><hr>
    <button type="button" data-cm="asc">↑ Sort ascending</button><button type="button" data-cm="desc">↓ Sort descending</button>
    <button type="button" data-cm="filter">${ICON.filter} Filter by this column</button>
    ${c.type === "date" ? `<button type="button" data-cm="aging">⏱ Add aging from this date</button>` : ""}
    ${c.type === "calc" || c.type === "select" ? `<button type="button" data-cm="edit">✎ Edit ${c.type === "calc" ? "calculation" : "dropdown options"}</button>` : ""}
    <hr><button type="button" data-cm="left" ${i === 0 ? "disabled style='opacity:.4'" : ""}>← Move left</button><button type="button" data-cm="right" ${i === cols.length - 1 ? "disabled style='opacity:.4'" : ""}>→ Move right</button>
    <div class="cmfmt" data-l="Format"><span class="seg mini">${["left", "center", "right"].map(a => `<button type="button" data-cm="al" data-v="${a}" aria-pressed="${(sheetVP(S.sheetId).colfmt[c.id]?.align || VP.fmt.align) === a}" title="Align ${a}">${({left: "⟸", center: "≡", right: "⟹"})[a]}</button>`).join("")}</span>
      <button type="button" class="bbtn" data-cm="bold" aria-pressed="${!!sheetVP(S.sheetId).colfmt[c.id]?.bold}" title="Bold">B</button>
      <button type="button" class="bbtn" data-cm="wrap" aria-pressed="${sheetVP(S.sheetId).colfmt[c.id]?.wrap === "on"}" title="Wrap text">↵</button></div>
    <div class="cmfmt tints" data-l="Highlight">${Object.keys(TINTS).map(t => `<button type="button" class="tint" data-cm="tint" data-v="${t}" aria-pressed="${(sheetVP(S.sheetId).colfmt[c.id]?.color || "none") === t}" title="Highlight ${t}" style="--d:${TINT_DOT[t]}"></button>`).join("")}</div>
    ${c.type !== "calc" ? `<button type="button" data-cm="titlecol">${S.sheets[S.sheetId].titleCol === c.id ? "H Stop using as card heading" : "H Use as card heading"}</button>` : ""}
    ${c.type === "text" || c.type === "select" ? `<button type="button" data-cm="statuscol">${S.sheets[S.sheetId].statusCol === c.id ? "◉ Status workflow…" : "◉ Set as status column"}</button>` : ""}
    ${c.type === "text" || c.type === "select" ? `<button type="button" data-cm="assignee">${S.sheets[S.sheetId].assigneeCol === c.id ? "@ Assignee settings…" : "@ Set as assignee column"}</button>` : ""}
    ${c.type === "long" || c.type === "text" ? `<button type="button" data-cm="remark">${S.sheets[S.sheetId].remarkCol === c.id ? "✎ Remark column settings…" : "✎ Set as remark column"}</button>` : ""}
    <button type="button" data-cm="hide">⊘ Hide column</button><button type="button" data-cm="width">↔ Reset width</button>
    <hr><button type="button" class="red" data-cm="delete">${ICON.trash} Delete column</button>`;
  document.body.appendChild(m);
  const r = anchor.getBoundingClientRect();
  m.style.top = Math.min(innerHeight - m.offsetHeight - 8, r.bottom + 4) + "px";
  m.style.left = Math.max(8, Math.min(innerWidth - m.offsetWidth - 8, r.left)) + "px";
  const nm = m.querySelector("#cmName"); nm.focus({preventScroll: true}); nm.select();
  nm.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); m.querySelector('[data-cm="rename"]').click(); } if (e.key === "Escape") { e.stopPropagation(); closeColMenu(); } });
  m.addEventListener("click", e => {
    const b = e.target.closest("[data-cm]"); if (!b || b.disabled) return;
    const sh2 = S.sheets[S.sheetId], cs = [...(sh2.columns || [])], j = cs.findIndex(x => x.id === colId);
    const save = (next, msg) => { store.put("sheets", S.sheetId, {...sh2, columns: next}); closeColMenu(); toast(msg); render(); };
    switch (b.dataset.cm) {
      case "rename": { const v = nm.value.trim(); if (!v) { toast("Column name can't be empty"); return; } if (v === cs[j].label) { closeColMenu(); return; } cs[j] = {...cs[j], label: v}; save(cs, `Renamed to “${v}”`); break; }
      case "asc": case "desc": S.sort = {sheet: S.sheetId, col: colId, dir: b.dataset.cm === "asc" ? 1 : -1}; closeColMenu(); render(); break;
      case "filter": closeColMenu(); openFilter(null, colId); break;
      case "aging": closeColMenu(); openAddColumn("aging", colId); break;
      case "edit": closeColMenu(); openModal(S.sheetId); break;
      case "al": { colFmt(S.sheetId, colId).align = b.dataset.v; saveVP(); closeColMenu(); render(); break; }
      case "bold": { const cf = colFmt(S.sheetId, colId); cf.bold ? delete cf.bold : cf.bold = true; saveVP(); closeColMenu(); render(); break; }
      case "wrap": { const cf = colFmt(S.sheetId, colId); cf.wrap === "on" ? delete cf.wrap : cf.wrap = "on"; saveVP(); closeColMenu(); render(); break; }
      case "tint": { const cf = colFmt(S.sheetId, colId); b.dataset.v === "none" ? delete cf.color : cf.color = b.dataset.v; saveVP(); closeColMenu(); render(); break; }
      case "remark": closeColMenu(); openRemarkSettings(colId); break;
      case "assignee": closeColMenu(); openAssigneeSettings(colId); break;
      case "titlecol": { closeColMenu(); const sid = S.sheetId, cur = S.sheets[sid], snaps = snap("sheets", [sid]), on = cur.titleCol !== colId; store.put("sheets", sid, {...cur, titleCol: on ? colId : null}).then(() => { render(); pushUndo(on ? `Cards now use “${c.label}” as heading` : "Card heading set to automatic", snaps); }); break; }
      case "statuscol": closeColMenu(); S.sheets[S.sheetId].statusCol === colId ? openWorkflow() : openStatusSettings(colId); break;
      case "hide": { const v = sheetVP(S.sheetId); if (!v.hidden.includes(colId)) v.hidden.push(colId); saveVP(); closeColMenu(); render(); toast(`“${c.label}” hidden. Use Format to show it again`); break; }
      case "width": { delete sheetVP(S.sheetId).widths[colId]; saveVP(); closeColMenu(); render(); break; }
      case "left": case "right": { const k = b.dataset.cm === "left" ? j - 1 : j + 1; [cs[j], cs[k]] = [cs[k], cs[j]]; save(cs, "Column moved"); break; }
      case "delete": if (!b.classList.contains("armed")) { b.classList.add("armed"); b.innerHTML = "Click again to delete this column"; return; } cs.splice(j, 1); save(cs, `Column “${c.label}” deleted`); break;
    }
  });
}
document.addEventListener("mousedown", e => { if (CM && !e.target.closest("#colMenu") && !e.target.closest("[data-colmenu]")) closeColMenu(); });
let lastW = innerWidth; window.addEventListener("resize", () => { if (innerWidth !== lastW) { lastW = innerWidth; closeColMenu(); } });
document.addEventListener("scroll", e => { if (CM && !sheetMode() && Date.now() - (CM.t || 0) > 400 && !e.target.closest?.("#colMenu")) closeColMenu(); }, true);

/* ---------- Drawer (entry form) ---------- */
let D = null; // {sheetId, rowId, cells}
const drawerOpen = () => $("#drawer").classList.contains("open");
function openDrawer(sheetId, rowId, preset) {
  const sh = S.sheets[sheetId]; if (!sh) return;
  const cols = sh.columns || [];
  let cells = rowId ? {...(S.rows[rowId]?.cells || {})} : {...(preset || {})};
  if (!rowId && !preset) {
    cols.forEach(c => { if (c.type === "number" && /^(sr|sl|s\.?no|#|no)/i.test(c.label)) { const mx = rowsOf(sheetId).reduce((m, r) => Math.max(m, +(r.cells || {})[c.id] || 0), 0); cells[c.id] = String(mx + 1); } });
  }
  D = {sheetId, rowId, cells, orig: JSON.stringify(cells), imp: rowId ? !!S.rows[rowId]?.imp : false};
  paintImp();
  $("#drEyebrow").textContent = sh.name;
  $("#drTitle").textContent = rowId ? (cells[titleCol(sh)?.id] || "Edit entry") : "New entry";
  $("#drDelete").hidden = !rowId; $("#drDup").hidden = !rowId; $("#drSaveNext").hidden = !!rowId;
  $("#drDelete").classList.remove("armed"); $("#drDelete").textContent = "Delete";
  const f = $("#drForm");
  f.innerHTML = cols.map(c => {
    const v = cells[c.id] ?? "", id = `f_${c.id}`;
    let ctl;
    if (c.type === "calc") return `<div class="field half" data-calc="${esc(c.id)}"><div class="lbl"><span>${esc(c.label)} <span class="typ">Auto-calculated</span></span></div><div class="calcbox"><span class="cv"></span><small>${esc(calcDesc(sh, c))}</small></div></div>`;
    if (c.type === "long") ctl = `<textarea class="inp" id="${id}" data-col="${esc(c.id)}" rows="4" placeholder="Write the latest update…">${esc(v)}</textarea>`;
    else if (c.type === "date") ctl = `<input class="inp" type="date" id="${id}" data-col="${esc(c.id)}" value="${esc(/^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "")}">`;
    else if (c.type === "number") ctl = `<input class="inp" type="number" id="${id}" data-col="${esc(c.id)}" value="${esc(v)}" style="max-width:160px;font-family:var(--f-mono)">`;
    else if (c.type === "select") {
      const opts = [...new Set([...(c.options || []), ...(v ? [v] : [])])];
      ctl = `<div class="opts" role="group" aria-labelledby="l_${esc(c.id)}" data-sel="${esc(c.id)}">${opts.map(o => `<button type="button" class="opt ${v === o ? "t-" + tone(o) : ""}" aria-pressed="${v === o}" data-v="${esc(o)}" title="${esc(o)}">${esc(o)}</button>`).join("")}<button type="button" class="opt addopt" data-addopt="${esc(c.id)}">+ Other…</button></div><input class="inp" id="${id}" data-newopt="${esc(c.id)}" placeholder="Type a new option and press Enter" hidden>`;
    } else ctl = `<input class="inp" id="${id}" data-col="${esc(c.id)}" value="${esc(v)}">`;
    if (sh.assigneeCol === c.id) { const {people} = peopleOf(tid(sh)); ctl = `<input class="inp" id="${id}" data-col="${esc(c.id)}" value="${esc(v)}" list="dl_people" placeholder="Names, separated by commas"><datalist id="dl_people">${people.map(p => `<option value="${esc(p.name)}">${esc(p.owner)}</option>`).join("")}</datalist><span class="hint" data-ownprev="${esc(c.id)}">Owner fills automatically: ${esc(ownersFromAssignee(sh, v).join(", ") || "—")}</span>`; }
    if (sh.ownerCol === c.id && sh.assigneeCol) ctl = `<div class="calcbox"><span data-ownval>${esc(v || "—")}</span><small>From the assignee, using People & owners</small></div>`;
    const rmk = isRemark(sh, c);
    const stamp = rmk && AI_ON ? `<span><button type="button" class="stamp" data-aisum="${esc(c.id)}" title="AI summary of this field">${ICON.spark} Summarise</button></span>` : "";
    if (rmk) ctl = `<div class="rmkadd"><textarea class="inp" id="dr_rm_${esc(c.id)}" rows="2" placeholder="New update · added as ${esc(remarkStamp(sh))}"></textarea><div class="acts">${AI_ON ? `<button type="button" class="stamp" data-airw="rephrase" data-col="${esc(c.id)}">${ICON.spark} Rephrase</button><button type="button" class="stamp" data-airw="improve" data-col="${esc(c.id)}">${ICON.spark} Improve</button>` : ""}<span class="sp" style="flex:1"></span><button type="button" class="btn" data-rmadd="${esc(c.id)}">Add update</button></div></div>` + ctl;
    const half = ["text", "date", "number"].includes(c.type) && !rmk && sh.assigneeCol !== c.id;
    return `<div class="field ${v ? "filled" : ""} ${half ? "half" : ""}" data-type="${esc(c.type)}" data-field="${esc(c.id)}"><div class="lbl"><label id="l_${esc(c.id)}" for="${id}">${esc(c.label)} <span class="typ">${esc(TYPES[c.type] || "")}</span></label>${stamp}</div>${ctl}</div>`;
  }).join("") + (rowId && S.rows[rowId]?.updatedAt ? `<div class="hint">Last saved ${esc(ago(S.rows[rowId].updatedAt))}${S.rows[rowId].updatedBy ? ` by ${esc(S.rows[rowId].updatedBy)}` : ""}</div>` : "");
  f.querySelectorAll("textarea").forEach(autogrow);
  updateProgress();
  $("#drawer").classList.add("open"); $("#drawer").setAttribute("aria-hidden", "false"); $("#scrim").classList.add("open");
  if (!isTouch()) setTimeout(() => { const first = f.querySelector(rowId ? "textarea, input:not([hidden])" : "input:not([hidden]):not([type=number]), textarea"); first?.focus(); }, 120);
}
function autogrow(t) { t.style.height = "auto"; t.style.height = Math.min(420, t.scrollHeight + 4) + "px"; }
function updateProgress() {
  const sh = {id: D.sheetId, ...S.sheets[D.sheetId]}, all = sh.columns || [], cols = all.filter(c => c.type !== "calc"); const n = cols.filter(c => String(D.cells[c.id] || "").trim()).length;
  const pr = {id: D.rowId || "__new", cells: D.cells, updatedAt: D.rowId ? S.rows[D.rowId]?.updatedAt : new Date().toISOString()};
  document.querySelectorAll("#drForm [data-calc]").forEach(el => { const c = all.find(x => x.id === el.dataset.calc), v = calcCell(sh, c, pr); el.querySelector(".cv").innerHTML = v.text ? (v.t === "plain" ? `<b>${esc(v.text)}</b>` : `<span class="pill t-${v.t}">${esc(v.text)}</span>`) : `<span style="color:var(--muted)">Fill the linked fields to calculate</span>`; });
  $("#drProg").style.width = (cols.length ? n / cols.length * 100 : 0) + "%";
  document.querySelectorAll("#drForm .field").forEach(el => el.classList.toggle("filled", !!String(D.cells[el.dataset.field] || "").trim()));
}
function closeDrawer(force) {
  if (!D) return;
  if (!force && JSON.stringify(D.cells) !== D.orig) {
    const h = $("#drHint"); if (h.dataset.warn !== "1") { h.dataset.warn = "1"; h.textContent = "Unsaved changes. Press Esc again to discard."; h.style.color = "var(--warn)"; return; }
  }
  $("#drHint").dataset.warn = ""; $("#drHint").textContent = "Ctrl + Enter to save"; $("#drHint").style.color = "";
  $("#drawer").classList.remove("open"); $("#drawer").setAttribute("aria-hidden", "true"); $("#scrim").classList.remove("open");
  D = null; render();
}
async function saveDrawer(next) {
  if (!D) return;
  const sh = S.sheets[D.sheetId], cells = {};
  Object.entries(D.cells).forEach(([k, v]) => { v = String(v ?? "").trim(); if (v) cells[k] = v; });
  if (!Object.keys(cells).length) { toast("Fill in at least one field first"); return; }
  const sc = statusCol(sh), wasGood = D.rowId && tone(S.rows[D.rowId]?.cells?.[sc?.id]) === "good";
  const isGood = sc && cells[sc.id] && tone(cells[sc.id]) === "good";
  // remember new select options on the sheet
  let colsChanged = false;
  const cols = (sh.columns || []).map(c => { if (c.type === "select" && cells[c.id] && !(c.options || []).includes(cells[c.id])) { colsChanged = true; return {...c, options:[...(c.options || []), cells[c.id]]}; } return c; });
  if (colsChanged) store.put("sheets", D.sheetId, {...sh, columns: cols});
  const id = D.rowId || uid("r");
  const order = D.rowId ? S.rows[D.rowId].order : rowsOf(D.sheetId).reduce((m, r) => Math.max(m, r.order || 0), 0) + 1;
  const sheetId = D.sheetId, isNew = !D.rowId;
  const sn = snap("rows", [id]).concat(colsChanged ? [] : []);
  store.put("rows", id, {sheetId, order, cells, imp: !!D.imp, updatedAt: new Date().toISOString()});
  if (isGood && !wasGood) confetti();
  pushUndo(isNew ? "Entry added" : "Changes saved", sn);
  if (next) { D.orig = JSON.stringify(D.cells); openDrawer(sheetId, null); renderNav(); }
  else { closeDrawer(true); S.view = "sheet"; S.sheetId = sheetId; render(); requestAnimationFrame(() => { const tr = document.getElementById("row-" + id); if (tr) { tr.classList.add("flash"); tr.scrollIntoView({block:"nearest"}); } }); }
}

$("#drForm").addEventListener("input", e => {
  const t = e.target; if (!D) return;
  if (t.dataset.col) { D.cells[t.dataset.col] = t.value; if (t.tagName === "TEXTAREA") autogrow(t); updateProgress();
    const shh = S.sheets[D.sheetId]; if (shh?.assigneeCol === t.dataset.col) { const o = ownersFromAssignee(shh, t.value).join(", "); const pv = document.querySelector(`[data-ownprev="${CSS.escape(t.dataset.col)}"]`); if (pv) pv.textContent = "Owner fills automatically: " + (o || "—"); const ov = document.querySelector("[data-ownval]"); if (ov && o) ov.textContent = o; } }
});
$("#drForm").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b || !D) return;
  if (b.dataset.v !== undefined) {
    const grp = b.closest("[data-sel]"), col = grp.dataset.sel, v = b.dataset.v;
    D.cells[col] = D.cells[col] === v ? "" : v;
    grp.querySelectorAll(".opt[data-v]").forEach(o => { const on = o.dataset.v === D.cells[col]; o.setAttribute("aria-pressed", on); o.className = "opt" + (on ? " t-" + tone(o.dataset.v) : ""); });
    updateProgress();
  } else if (b.dataset.addopt) { const inp = $(`#f_${CSS.escape(b.dataset.addopt)}`); inp.hidden = false; inp.focus(); }
  else if (b.dataset.aisum) summariseField(b.dataset.aisum, b);
  else if (b.dataset.rmadd) { const cid = b.dataset.rmadd, ta = $(`#dr_rm_${CSS.escape(cid)}`), t = $(`#f_${CSS.escape(cid)}`); if (!ta.value.trim()) { ta.focus(); return; } t.value = addRemark(S.sheets[D.sheetId], t.value, ta.value); D.cells[cid] = t.value; ta.value = ""; autogrow(t); updateProgress(); toast("Update added. Save the entry to keep it"); }
  else if (b.dataset.airw) { const cid = b.dataset.col, ta = $(`#dr_rm_${CSS.escape(cid)}`); if (!ta.value.trim()) { ta.focus(); toast("Type a comment first"); return; } if (!AI.key) { openAI("settings"); return; } const lbl = b.innerHTML; b.disabled = true; b.textContent = "Working…"; aiRewrite(ta.value, b.dataset.airw).then(x => { ta.value = x; }).catch(err => toast(err.message)).finally(() => { b.disabled = false; b.innerHTML = lbl; }); }
  else if (b.dataset.aiuse) {
    const col = b.dataset.aiuse, t = $(`#f_${CSS.escape(col)}`), txt = b.closest(".aisum").querySelector(".aitxt").textContent, pre = `${stampText()}(Summary): `;
    if (b.dataset.mode === "copy") { try { navigator.clipboard.writeText(txt); toast("Summary copied"); } catch (e) {} return; }
    t.value = addRemark(S.sheets[D.sheetId], t.value, "Summary: " + txt); D.cells[col] = t.value; autogrow(t); updateProgress(); b.closest(".aisum").remove(); toast("Summary added at the top. Save to keep it");
  }
  else if (b.dataset.stamp) {
    const t = $(`#f_${CSS.escape(b.dataset.stamp)}`), pre = `${stampText()}(Fable): `;
    t.value = pre + (t.value ? "\n" + t.value : ""); D.cells[b.dataset.stamp] = t.value; autogrow(t); t.focus(); t.setSelectionRange(pre.length, pre.length); updateProgress();
  }
});
$("#drForm").addEventListener("keydown", e => {
  const t = e.target;
  if (t.dataset.newopt && e.key === "Enter") {
    e.preventDefault(); const v = t.value.trim(); if (!v) return; const col = t.dataset.newopt; D.cells[col] = v;
    const grp = document.querySelector(`[data-sel="${CSS.escape(col)}"]`);
    if (![...grp.querySelectorAll("[data-v]")].some(o => o.dataset.v === v)) { const nb = document.createElement("button"); nb.type = "button"; nb.className = "opt"; nb.dataset.v = v; nb.textContent = v; grp.insertBefore(nb, grp.querySelector(".addopt")); }
    grp.querySelectorAll(".opt[data-v]").forEach(o => { const on = o.dataset.v === v; o.setAttribute("aria-pressed", on); o.className = "opt" + (on ? " t-" + tone(o.dataset.v) : ""); });
    t.value = ""; t.hidden = true; updateProgress();
  }
});
$("#drForm").addEventListener("submit", e => e.preventDefault());
function paintImp() { const b = $("#drImp"); b.setAttribute("aria-pressed", String(!!D?.imp)); b.innerHTML = `${ICON.flag} ${D?.imp ? "Marked important" : "Mark as important"}`; b.style.cssText = "align-self:flex-start;margin-top:4px;" + (D?.imp ? "background:var(--bad);color:#fff;border-color:var(--bad)" : "color:var(--bad)"); }
$("#drImp").onclick = () => { if (!D) return; D.imp = !D.imp; D.orig = D.orig + (D.imp ? "" : ""); paintImp(); };
$("#drSave").onclick = () => saveDrawer(false);
$("#drSaveNext").onclick = () => saveDrawer(true);
$("#drClose").onclick = () => closeDrawer();
$("#scrim").onclick = () => closeDrawer();
$("#drDup").onclick = () => { const c = {...D.cells}; const sid = D.sheetId; closeDrawer(true); openDrawer(sid, null, c); toast("Copy ready. Edit and save."); };
$("#drDelete").onclick = () => {
  const b = $("#drDelete");
  if (!b.classList.contains("armed")) { b.classList.add("armed"); b.textContent = "Click again to delete"; setTimeout(() => { b.classList.remove("armed"); b.textContent = "Delete"; }, 3500); return; }
  const sn = snap("rows", [D.rowId]); store.del("rows", D.rowId); closeDrawer(true); pushUndo("Entry deleted", sn);
};

/* ---------- Sheet modal ---------- */
const TEMPLATES = {
  blank:{name:"Blank", desc:"Start with two columns", cols:[["Item","text"],["Notes","long"]]},
  issues:{name:"Issue log", desc:"Raised, owner, status, due", cols:[["Sr. No.","number"],["Issue","text"],["Raised by","select",["Bank","Fable"]],["Owner","text"],["Raised on","date"],["Due date","date"],["Status","select",["Open","WIP","Blocker","Closed"]],["Remarks","long"]]},
  api:{name:"API checklist", desc:"Docs, credentials, POC, integration", cols:[["Sr.","number"],["Name of the API","text"],["Scope","select",["Phase 1","Phase 2","Out of scope"]],["Doc received?","select",["Yes","Not received","NA"]],["UAT credentials?","select",["Received","Not received","Bank to confirm"]],["POC Status","select",["Completed","WIP","Blocker"]],["Integration Status","select",["Completed","WIP","Not started"]],["Current Owner","select",["Bank","Fable"]],["Remarks","long"]]},
  mom:{name:"Meeting actions", desc:"MOM points with owners", cols:[["Meeting date","date"],["Action point","long"],["Owner","text"],["Target date","date"],["Status","select",["Open","Done"]]]},
};
let M = null; // {sheetId|null, name, note, cols:[{id,label,type,options}], tpl}
function openModal(sheetId) {
  if (sheetId) { const s = S.sheets[sheetId]; M = {sheetId, name: s.name, note: s.note || "", cols: (s.columns || []).map(c => ({...c, options: [...(c.options || [])]}))}; }
  else M = {sheetId: null, name: "", note: "", tpl: "issues", cols: tplCols("issues")};
  $("#mEyebrow").textContent = sheetId ? "Edit sheet" : "New sheet";
  $("#mTitle").textContent = sheetId ? M.name : "Design your sheet";
  $("#mSave").textContent = sheetId ? "Save changes" : "Create sheet";
  $("#mDelete").hidden = !sheetId; $("#mDelete").classList.remove("armed"); $("#mDelete").textContent = "Delete sheet";
  renderModal(); $("#modal").hidden = false; setTimeout(() => $("#m_name")?.focus(), 50);
}
const tplCols = k => TEMPLATES[k].cols.map(([label, type, options]) => ({id: uid("c"), label, type, options: options ? [...options] : []}));
function renderModal() {
  const b = $("#mBody");
  b.innerHTML = `
  ${M.sheetId ? "" : `<div class="banner" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span style="flex:1;min-width:180px">Have the sheet in Excel? Upload it and each tab becomes a sheet in <b>${esc(curTracker()?.name || "this project")}</b>.</span><button type="button" class="btn" data-act="importx" style="flex:none">${ICON.ul} Upload Excel…</button></div>`}
  ${M.sheetId ? "" : `<div class="field"><span class="lbl">Start from</span><div class="tpls">${Object.entries(TEMPLATES).map(([k, t]) => `<button type="button" class="tpl" data-tpl="${k}" aria-pressed="${M.tpl === k}"><b>${t.name}</b><span>${t.desc}</span></button>`).join("")}</div></div>`}
  <div class="field"><label for="m_name">Sheet name</label><input class="inp" id="m_name" value="${esc(M.name)}" placeholder="e.g. UAT defects"></div>
  <div class="field"><label for="m_note">Pinned note <span class="typ">optional</span></label><input class="inp" id="m_note" value="${esc(M.note)}" placeholder="A reminder shown at the top of the sheet"></div>
  <div class="field"><span class="lbl">Columns <span class="typ">${M.cols.length}</span></span><div class="cols">${M.cols.map((c, i) => `
    <div class="colrow" data-i="${i}">
      <input class="inp" aria-label="Column name" data-k="label" value="${esc(c.label)}" placeholder="Column name">
      <select class="inp" aria-label="Column type" data-k="type">${Object.entries(TYPES).map(([k, l]) => `<option value="${k}" ${c.type === k ? "selected" : ""}>${l}</option>`).join("")}</select>
      <div class="acts"><button type="button" class="icon" data-mv="-1" aria-label="Move up">${ICON.up}</button><button type="button" class="icon" data-mv="1" aria-label="Move down">${ICON.down}</button><button type="button" class="icon" data-rm aria-label="Remove column">${ICON.trash}</button></div>
      ${c.type === "calc" ? calcCfgHTML(c.calc || {kind: "aging", a: M.cols.find(x => x.type === "date")?.id}, M.cols, c.id) : ""}
      ${c.type === "select" ? `<input class="inp optsin" aria-label="Choices" data-k="options" value="${esc((c.options || []).join(", "))}" placeholder="Choices, separated by commas (e.g. Open, WIP, Closed)">` : ""}
    </div>`).join("")}</div>
    <button type="button" class="btn" data-addcol style="align-self:flex-start">${ICON.plus} Add column</button></div>
  ${M.sheetId ? `<div class="hint">Removing a column hides its values; existing entries keep them until edited.</div>` : ""}`;
}
$("#mBody").addEventListener("input", e => {
  const t = e.target;
  if (t.id === "m_name") M.name = t.value; else if (t.id === "m_note") M.note = t.value;
  else if (t.dataset.ck) { const row = t.closest(".colrow"), i = +row.dataset.i; M.cols[i].calc = readCalc(row) || {...(M.cols[i].calc || {}), [t.dataset.ck]: t.value}; }
  else if (t.dataset.k) { const i = +t.closest(".colrow").dataset.i, k = t.dataset.k; if (k === "options") M.cols[i].options = t.value.split(",").map(s => s.trim()).filter(Boolean); else M.cols[i][k] = t.value; if (k === "type") renderModal(); }
});
$("#mBody").addEventListener("change", e => { if (e.target.dataset.ck) { const row = e.target.closest(".colrow"), i = +row.dataset.i; if (e.target.dataset.ck === "kind") { M.cols[i].calc = {kind: e.target.value}; renderModal(); } else M.cols[i].calc = readCalc(row) || {...(M.cols[i].calc || {}), [e.target.dataset.ck]: e.target.value}; return; } if (e.target.dataset.k === "type") { const i = +e.target.closest(".colrow").dataset.i; M.cols[i].type = e.target.value; renderModal(); } });
$("#mBody").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  if (b.dataset.act === "importx") { closeModal(); $("#fileIn").click(); return; }
  if (b.dataset.tpl) { M.tpl = b.dataset.tpl; M.cols = tplCols(b.dataset.tpl); if (!M.name || Object.values(TEMPLATES).some(t => t.name === M.name)) M.name = TEMPLATES[b.dataset.tpl].name === "Blank" ? "" : TEMPLATES[b.dataset.tpl].name; renderModal(); return; }
  const row = b.closest(".colrow"), i = row ? +row.dataset.i : -1;
  if (b.dataset.mv) { const j = i + +b.dataset.mv; if (j >= 0 && j < M.cols.length) { [M.cols[i], M.cols[j]] = [M.cols[j], M.cols[i]]; renderModal(); } }
  else if (b.hasAttribute("data-rm")) { M.cols.splice(i, 1); renderModal(); }
  else if (b.hasAttribute("data-addcol")) { M.cols.push({id: uid("c"), label: "", type: "text", options: []}); renderModal(); const ins = document.querySelectorAll('.colrow input[data-k="label"]'); ins[ins.length - 1]?.focus(); }
});
function closeModal() { $("#modal").hidden = true; M = null; }
$("#mClose").onclick = closeModal; $("#mCancel").onclick = closeModal;
$("#modal").addEventListener("click", e => { if (e.target.id === "modal") closeModal(); });
$("#mSave").onclick = () => {
  const name = M.name.trim(); if (!name) { toast("Give the sheet a name"); $("#m_name").focus(); return; }
  const cols = M.cols.filter(c => c.label.trim()).map(c => { const o = {id: c.id, label: c.label.trim(), type: c.type}; if (c.type === "select") o.options = c.options || []; if (c.type === "calc") o.calc = c.calc || {kind: "aging"}; return o; });
  const badCalc = cols.find(c => c.type === "calc" && ["aging","due","between","arith"].includes(c.calc.kind) && (!c.calc.a || (["between","arith"].includes(c.calc.kind) && !c.calc.b)));
  if (badCalc) { toast(`Pick the columns “${badCalc.label}” calculates from`); return; }
  if (!cols.length) { toast("Add at least one column"); return; }
  if (M.sheetId) { store.put("sheets", M.sheetId, {...S.sheets[M.sheetId], name, note: M.note.trim(), columns: cols}); toast("Sheet updated"); S.sheetId = M.sheetId; }
  else { const id = uid("s"), order = sheetList().reduce((m, s) => Math.max(m, s.order || 0), 0) + 1; store.put("sheets", id, {name, note: M.note.trim(), order, columns: cols, trackerId: curTracker()?.id || "bcp"}); S.sheetId = id; toast("Sheet created. Add your first entry."); }
  S.view = "sheet"; closeModal(); render();
};
$("#mDelete").onclick = async () => {
  const b = $("#mDelete");
  if (!b.classList.contains("armed")) { b.classList.add("armed"); b.textContent = `Delete sheet and ${rowsOf(M.sheetId).length} entries?`; return; }
  const sid = M.sheetId, rids = rowsOf(sid).map(r => r.id), sn = snap("sheets", [sid]).concat(snap("rows", rids)); closeModal(); S.view = "home"; S.sheetId = null;
  await store.del("sheets", sid); await pool(rids.map(id => () => store.del("rows", id)));
  render(); pushUndo("Sheet deleted", sn);
};
async function pool(tasks, n = 6) { let i = 0; await Promise.all(Array.from({length: n}, async () => { while (i < tasks.length) await tasks[i++](); })); }

/* ---------- Import / export ---------- */
const fmtCell = v => { if (v instanceof Date) { const d = new Date(v.getTime() + 12 * 3600e3); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; } return v == null ? "" : String(v).trim(); };
const filledN = r => r.filter(Boolean).length;
const looksData = v => /^-?\d+([.,]\d+)?$/.test(v) || /^\d{4}-\d{2}-\d{2}$/.test(v);
/* A heading row: one short value, followed by a row that looks like column headings */
function isHeadingRow(r, next) {
  if (filledN(r) !== 1 || !next || filledN(next) < 2) return false;
  const t = r.find(Boolean); if (t.length > 60) return false;
  const cells = next.filter(Boolean);
  return cells.every(v => v.length <= 40 && !looksData(v));
}
/* Split one Excel tab into blocks: [{title, header, body}] */
function splitSections(rows) {
  const out = [], notes = []; let pend = [], cur = null;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (isHeadingRow(r, rows[i + 1])) { pend.push(r.find(Boolean)); continue; }
    if (!cur && filledN(r) === 1) { notes.push(r.find(Boolean)); continue; }
    if (!cur || pend.length) { cur = {titles: pend, header: r, body: []}; out.push(cur); pend = []; continue; }
    cur.body.push(r);
  }
  return {sections: out, notes};
}
function buildParsed(name, note, header, body) {
  const width = Math.max(header.length, ...body.map(r => r.length));
  const keep = []; for (let i = 0; i < width; i++) if (header[i] || body.some(r => r[i])) keep.push(i);
  const columns = keep.map((i, n) => {
    const label = header[i] || `Column ${n + 1}`, vals = body.map(r => r[i]).filter(Boolean), avg = vals.reduce((s, v) => s + v.length, 0) / Math.max(1, vals.length), distinct = [...new Set(vals)];
    let type = "text";
    if (vals.length && vals.every(v => /^\d{4}-\d{2}-\d{2}$/.test(v))) type = "date";
    else if (vals.length && vals.every(v => /^-?\d+(\.\d+)?$/.test(v))) type = "number";
    else if (avg > 55) type = "long";
    else if (distinct.length <= 8 && vals.length > distinct.length && avg < 30 && !/aging|owner|name|email|mail|remark|desc/i.test(label)) type = "select";
    const c = {id: uid("c"), label, type}; if (type === "select") c.options = distinct.sort(); return c;
  });
  const dates = columns.filter(c => c.type === "date"), firstDate = dates[0];
  const dueDate = dates.find(c => /expir|due|eta|target|renew|deadline|valid/i.test(c.label)) || dates[dates.length - 1];
  columns.forEach(c => {
    if (c.type === "date") return;
    if (firstDate && /aging|ageing|days open/i.test(c.label)) { c.type = "calc"; c.calc = {kind: "aging", a: firstDate.id, warn: 15, alert: 30}; delete c.options; }
    else if (dueDate && /days?\b.*\b(to|left|remain|until|before)\b|days?\s*(to\s*)?(expir|due)/i.test(c.label)) { c.type = "calc"; c.calc = {kind: "due", a: dueDate.id, warn: 30}; delete c.options; }
  });
  return {name, note, columns, body: body.map(r => { const cells = {}; keep.forEach((i, n) => { if (r[i] && columns[n].type !== "calc") cells[columns[n].id] = r[i]; }); return cells; }).filter(c => Object.keys(c).length)};
}
/* Returns one or more sheets for an Excel tab */
function inferSheets(name, aoa) {
  const rows = aoa.map(r => (r || []).map(fmtCell)).filter(r => r.some(Boolean));
  if (!rows.length) return [];
  const {sections, notes} = splitSections(rows);
  if (!sections.length) return [];
  if (sections.length === 1) { const sc = sections[0]; return [buildParsed(name, [...notes, ...sc.titles].filter(t => t.toLowerCase() !== name.toLowerCase()).join(" · "), sc.header, sc.body)]; }
  const lead = [...notes, ...(sections[0].titles.length > 1 ? sections[0].titles.slice(0, -1) : [])].filter(t => t.toLowerCase() !== name.toLowerCase());
  return sections.map((sc, k) => {
    const title = sc.titles[sc.titles.length - 1] || `${name} ${k + 1}`;
    return buildParsed(title, `From “${name}”${lead.length ? " · " + lead.join(" · ") : ""}`, sc.header, sc.body);
  });
}
function inferSheet(name, aoa) { return inferSheets(name, aoa)[0] || null; }
/* Re-split an existing sheet that was imported as one block */
async function splitExistingSheet() {
  const sid = S.sheetId, sh = S.sheets[sid]; if (!sh) return;
  const cols = sh.columns || [], rows = rowsOf(sid);
  const generic = cols.slice(1).every(c => /^Column \d+$/.test(c.label));
  const aoa = [generic ? [cols[0]?.label || ""] : cols.map(c => c.label), ...rows.map(r => cols.map(c => c.type === "calc" ? "" : ((r.cells || {})[c.id] || "")))];
  const parts = inferSheets(sh.name, aoa);
  if (parts.length < 2) { toast("No section headings found in this sheet"); return; }
  const snaps = snap("sheets", [sid]).concat(snap("rows", rows.map(r => r.id)));
  let order = sh.order || 0; const names = new Set(sheetList().map(s => s.name)), now = new Date().toISOString(), tasks = [], newIds = [];
  for (const pt of parts) {
    let nm = pt.name, k = 2; while (names.has(nm)) nm = `${pt.name} (${k++})`; names.add(nm);
    const nid = uid("s"); newIds.push(nid); order += 0.01;
    snaps.push(["sheets", nid, null]);
    await store.put("sheets", nid, {name: nm, note: pt.note, order, columns: pt.columns, trackerId: tid(sh)});
    pt.body.forEach((cells, i) => { const rid = uid("r") + i; snaps.push(["rows", rid, null]); tasks.push(() => store.put("rows", rid, {sheetId: nid, order: i + 1, cells, updatedAt: now})); });
  }
  await pool(tasks); await pool(rows.map(r => () => store.del("rows", r.id))); await store.del("sheets", sid);
  S.sheetId = newIds[0]; render(); pushUndo(`Split into ${parts.length} sheets: ${parts.map(p => p.name).join(", ")}`, snaps);
}
$("#fileIn").addEventListener("change", async e => {
  const f = e.target.files[0]; e.target.value = ""; if (!f) return;
  if (!window.XLSX) { toast("The Excel reader didn't load. Check your connection and try again."); return; }
  try {
    toast("Reading " + f.name + "…");
    const wb = XLSX.read(await f.arrayBuffer(), {type: "array", cellDates: true});
    if (wb.SheetNames.includes("_tracker_meta")) { openExcelUpdate(wb, f.name); return; }
    const items = [];
    for (const wsName of wb.SheetNames) for (const parsed of inferSheets(wsName.trim(), XLSX.utils.sheet_to_json(wb.Sheets[wsName], {header: 1, raw: true, defval: ""}))) items.push({tab: wsName.trim(), parsed});
    if (!items.length) { toast("No tables found in that file"); return; }
    openImportDialog(items, f.name);
  } catch (err) { console.error(err); toast("Couldn't read that file. Is it an Excel workbook?"); }
});
/* ---------- Import sheets into a project ---------- */
async function importItems(items, trackerId) {
  const now = new Date().toISOString(), tasks = [], snaps = [];
  const names = new Set(sheetList(trackerId).map(s => s.name));
  let order = sheetList(trackerId).reduce((m, s) => Math.max(m, s.order || 0), 0), nRows = 0, nNew = 0, nAdd = 0;
  for (const it of items) {
    const P = it.parsed;
    if (it.target && S.sheets[it.target]) {
      const sid = it.target, sh = S.sheets[sid]; snaps.push(["sheets", sid, clone(sh)]);
      const cols = [...(sh.columns || [])], map = {};
      P.columns.forEach(pc => { const ex = cols.find(c => c.type !== "calc" && c.label.trim().toLowerCase() === pc.label.trim().toLowerCase()); if (ex) map[pc.id] = ex.id; else { const nc = {...pc, id: uid("c")}; cols.push(nc); map[pc.id] = nc.id; } });
      const add = {};
      let o = rowsOf(sid).reduce((m, r) => Math.max(m, r.order || 0), 0);
      P.body.forEach((cells, i) => { const nc = {}; Object.entries(cells).forEach(([k, v]) => { if (map[k] && v !== "") nc[map[k]] = v; }); if (!Object.keys(nc).length) return;
        cols.forEach(c => { if (c.type === "select" && nc[c.id] && !(c.options || []).includes(nc[c.id])) (add[c.id] = add[c.id] || new Set()).add(nc[c.id]); });
        const rid = uid("r") + i, oo = ++o; nRows++; snaps.push(["rows", rid, null]); tasks.push(() => store.put("rows", rid, {sheetId: sid, order: oo, cells: nc, updatedAt: now})); });
      await store.put("sheets", sid, {...sh, columns: cols.map(c => add[c.id] ? {...c, options: [...(c.options || []), ...add[c.id]]} : c)}); nAdd++;
    } else {
      const base = (it.name || P.name).trim() || P.name; let nm = base, k = 2; while (names.has(nm)) nm = `${base} (${k++})`; names.add(nm);
      const sid = uid("s"); order++; nNew++; snaps.push(["sheets", sid, null]);
      await store.put("sheets", sid, {name: nm, note: P.note, order, columns: P.columns, trackerId});
      P.body.forEach((cells, i) => { const rid = uid("r") + i; nRows++; snaps.push(["rows", rid, null]); tasks.push(() => store.put("rows", rid, {sheetId: sid, order: i + 1, cells, updatedAt: now})); });
    }
  }
  await pool(tasks);
  return {nNew, nAdd, nRows, snaps};
}
function openImportDialog(items, fname) {
  const ct = curTracker();
  items.forEach(it => { it.on = true; it.name = it.parsed.name; it.target = ""; });
  let trk = ct?.id || "__new";
  const opts = tId => sheetList(tId).map(s => `<option value="${esc(s.id)}">Add rows to “${esc(s.name)}”</option>`).join("");
  const rowsHTML = () => items.map((it, i) => { const same = sheetList(trk).find(s => s.name.trim().toLowerCase() === it.name.trim().toLowerCase());
    return `<div class="improw" data-i="${i}"><input type="checkbox" data-imp="on" ${it.on ? "checked" : ""} aria-label="Import this table">
      <div class="impmain"><input class="inp mini" data-imp="name" value="${esc(it.name)}" aria-label="Sheet name" ${it.target ? "disabled" : ""}>
      <span class="hint">${it.parsed.body.length} rows · ${it.parsed.columns.length} columns${it.tab !== it.parsed.name ? ` · from tab “${esc(it.tab)}”` : ""}${same && !it.target ? ` · <b style="color:var(--warn)">a sheet with this name exists</b>` : ""}</span></div>
      <select class="inp mini" data-imp="target" aria-label="Where to put it"><option value="">New sheet</option>${trk === "__new" ? "" : opts(trk)}</select></div>`; }).join("");
  openDialog({
    eyebrow: fname, title: "Import sheets from Excel", saveLabel: "Import",
    body: () => `<div class="field"><label for="im_trk">Add to project</label><select class="inp" id="im_trk">${trackerList().map(t => `<option value="${esc(t.id)}" ${t.id === trk ? "selected" : ""}>${esc(t.name)} (${sheetList(t.id).length} sheets)</option>`).join("")}<option value="__new" ${trk === "__new" ? "selected" : ""}>+ New project…</option></select></div>
      <div class="field" id="im_newf" ${trk === "__new" ? "" : "hidden"}><label for="im_newn">New project name</label><input class="inp" id="im_newn" placeholder="e.g. SCB"></div>
      <div class="field"><span class="lbl">Tables found (${items.length})</span><div class="implist" id="im_list">${rowsHTML()}</div></div>
      <p class="hint" style="margin:0">Each tab (and each titled section inside a tab) becomes its own sheet. Choose <b>Add rows to …</b> to append to a sheet you already have; columns are matched by name and any new columns are added.</p>`,
    mount: root => {
      const list = root.querySelector("#im_list"), sel = root.querySelector("#im_trk");
      const redraw = () => { list.innerHTML = rowsHTML(); list.querySelectorAll(".improw").forEach(r => { r.querySelector('[data-imp=target]').value = items[+r.dataset.i].target; }); };
      sel.addEventListener("change", () => { trk = sel.value; items.forEach(it => it.target = ""); root.querySelector("#im_newf").hidden = trk !== "__new"; redraw(); });
      list.addEventListener("input", e => { const r = e.target.closest(".improw"); if (!r) return; const it = items[+r.dataset.i], k = e.target.dataset.imp;
        if (k === "on") it.on = e.target.checked; else if (k === "name") it.name = e.target.value; });
      list.addEventListener("change", e => { const r = e.target.closest(".improw"); if (!r) return; const it = items[+r.dataset.i];
        if (e.target.dataset.imp === "on") it.on = e.target.checked; if (e.target.dataset.imp === "target") { it.target = e.target.value; redraw(); } });
    },
    onSave: async root => {
      const pick = items.filter(it => it.on); if (!pick.length) { toast("Tick at least one table to import"); return false; }
      let tId = trk;
      if (tId === "__new") { const name = root.querySelector("#im_newn").value.trim(); if (!name) { toast("Enter the new project's name"); return false; }
        tId = uid("t"); await store.put("trackers", tId, {name, short: shortOf(name), order: trackerList().reduce((m, x) => Math.max(m, x.order || 0), 0) + 1, color: TCOLORS[trackerList().length % TCOLORS.length]}); }
      toast("Importing…");
      const r = await importItems(pick, tId);
      if (window.__dashImport) { const cb = window.__dashImport; window.__dashImport = null; setTimeout(() => cb([...new Set(r.snaps.filter(x => x[0] === "sheets").map(x => x[1]))], tId), 50); }
      if (tId !== S.trackerId) setTracker(tId); else render();
      pushUndo(`${r.nNew ? `${r.nNew} new sheet${r.nNew === 1 ? "" : "s"}` : ""}${r.nNew && r.nAdd ? " and " : ""}${r.nAdd ? `rows added to ${r.nAdd} sheet${r.nAdd === 1 ? "" : "s"}` : ""} · ${r.nRows} entries imported`, r.snaps);
    }
  });
}
/* ---------- Upload edits from an exported Excel ---------- */
function openExcelUpdate(wb, fname) {
  const meta = XLSX.utils.sheet_to_json(wb.Sheets._tracker_meta, {header: 1, defval: ""}).slice(1).filter(r => r[0] && r[1]);
  const plan = [];
  for (const [tab, sid] of meta) {
    const sh = S.sheets[sid], ws = wb.Sheets[tab];
    if (!sh || !ws) { plan.push({tab, missing: true}); continue; }
    const cols = (sh.columns || []).filter(c => c.type !== "calc");
    const aoa = XLSX.utils.sheet_to_json(ws, {header: 1, raw: true, defval: ""}).map(r => r.map(fmtCell));
    const hi = aoa.findIndex(r => r.includes("Row ID")); if (hi < 0) { plan.push({tab, missing: true}); continue; }
    const head = aoa[hi], ridI = head.indexOf("Row ID");
    const map = head.map(h => cols.find(c => c.label === h) || null);
    const updates = [], creates = []; let changed = 0;
    for (const row of aoa.slice(hi + 1)) {
      const cells = {}; let any = false;
      map.forEach((c, j) => { if (!c) return; let v = String(row[j] ?? "").trim(); if (v) any = true; if (c.type === "date" && v) v = normDate(v); if (c.type === "number") v = v.replace(/,/g, ""); cells[c.id] = v; });
      if (!any) continue;
      const rid = String(row[ridI] || "").trim(), cur = rid && S.rows[rid] && S.rows[rid].sheetId === sid ? S.rows[rid] : null;
      if (cur) {
        const diff = Object.keys(cells).filter(k => String(cells[k] || "") !== String((cur.cells || {})[k] || ""));
        if (diff.length) { changed += diff.length; const merged = {...(cur.cells || {})}; diff.forEach(k => { if (cells[k]) merged[k] = cells[k]; else delete merged[k]; }); updates.push({rid, cells: merged}); }
      } else { Object.keys(cells).forEach(k => { if (!cells[k]) delete cells[k]; }); creates.push(cells); }
    }
    plan.push({tab, sid, name: sh.name, updates, creates, changed});
  }
  const known = new Set(meta.map(m => m[0])), extra = [];
  wb.SheetNames.filter(n => n !== "_tracker_meta" && !known.has(n)).forEach(n => inferSheets(n.trim(), XLSX.utils.sheet_to_json(wb.Sheets[n], {header: 1, raw: true, defval: ""})).forEach(parsed => extra.push({tab: n, parsed, name: parsed.name, target: ""})));
  const total = plan.reduce((m, p) => m + (p.updates?.length || 0) + (p.creates?.length || 0), 0) + extra.length;
  openDialog({
    eyebrow: fname, title: "Upload edits from Excel", saveLabel: total ? `Apply ${total} change${total === 1 ? "" : "s"}` : "Close",
    body: () => `<p class="hint" style="margin:0">This file was downloaded from the tracker. Here's what changed:</p>
      <div class="group">${plan.map(p => p.missing ? `<div class="ck"><span>${esc(p.tab)}</span><span class="n" style="color:var(--warn)">sheet not found, skipped</span></div>`
        : `<div class="ck"><b>${esc(p.name)}</b><span class="n">${p.updates.length} updated (${p.changed} cells) · ${p.creates.length} new</span></div>`).join("")}
      ${extra.map((x, i) => `<label class="ck"><input type="checkbox" data-xtra="${i}" checked> <b>${esc(x.name)}</b><span class="n" style="color:var(--good)">new tab · add as a new sheet in ${esc(curTracker()?.name || "")} (${x.parsed.body.length} rows)</span></label>`).join("")}</div>
      ${total ? `<span class="hint">Rows you deleted in Excel are not deleted here. Calculated columns (Aging, Days left) are ignored and recalculate on their own.</span>` : `<div class="banner">No changes found compared with the tracker.</div>`}`,
    onSave: async root => {
      if (!total) return;
      const pickX = extra.filter((x, i) => root.querySelector(`[data-xtra="${i}"]`)?.checked);
      const xr = pickX.length ? await importItems(pickX, curTracker()?.id || "bcp") : {snaps: [], nNew: 0};
      const now = new Date().toISOString(), snaps = [...xr.snaps], tasks = [];
      for (const p of plan) { if (p.missing) continue;
        p.updates.forEach(u => { snaps.push(["rows", u.rid, clone(S.rows[u.rid])]); tasks.push(() => store.put("rows", u.rid, {...S.rows[u.rid], cells: u.cells, updatedAt: now})); });
        let order = rowsOf(p.sid).reduce((m, r) => Math.max(m, r.order || 0), 0);
        const srC = (S.sheets[p.sid].columns || []).filter(c => c.type === "number" && /^(sr|sl|s\.?no|#|no)/i.test(c.label)), srM = {};
        srC.forEach(c => { srM[c.id] = rowsOf(p.sid).reduce((m, r) => Math.max(m, +(r.cells || {})[c.id] || 0), 0); });
        p.creates.forEach((cells, i) => { srC.forEach(c => { if (!cells[c.id]) cells[c.id] = String(++srM[c.id]); }); const id = uid("r") + i; snaps.push(["rows", id, null]); const o = ++order; tasks.push(() => store.put("rows", id, {sheetId: p.sid, order: o, cells, updatedAt: now})); });
        const sh = S.sheets[p.sid], add = {};
        [...p.updates.map(u => u.cells), ...p.creates].forEach(cells => (sh.columns || []).forEach(c => { if (c.type === "select" && cells[c.id] && !(c.options || []).includes(cells[c.id])) (add[c.id] = add[c.id] || new Set()).add(cells[c.id]); }));
        if (Object.keys(add).length) { snaps.push(["sheets", p.sid, clone(sh)]); store.put("sheets", p.sid, {...sh, columns: sh.columns.map(c => add[c.id] ? {...c, options: [...(c.options || []), ...add[c.id]]} : c)}); }
      }
      await pool(tasks, 10); render(); pushUndo(`${total} change${total === 1 ? "" : "s"} uploaded from Excel${xr.nNew ? ` · ${xr.nNew} new sheet${xr.nNew === 1 ? "" : "s"}` : ""}`, snaps);
    }
  });
}

/* ---------- Grid (Excel-style) editing ---------- */
S.gedits = {}; S.gnew = {};
const colLetter = i => { let s = ""; i++; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - m) / 26); } return s; };
const gDisplay = (c, v) => c.type === "date" && /^\d{4}-\d{2}-\d{2}$/.test(v || "") ? fmtDate(v) : (v || "");
const gNorm = (c, v) => { v = String(v ?? "").trim(); if (c.type === "date" && v) return normDate(v); if (c.type === "number") return v.replace(/,/g, ""); return v; };
function gridDirtyCount(sid) { const E = S.gedits[sid] || {}, N = S.gnew[sid] || []; return Object.values(E).reduce((m, o) => m + Object.keys(o).length, 0) + N.filter(n => Object.values(n.cells).some(Boolean)).length; }
function gridBarHTML(sid) {
  const n = gridDirtyCount(sid);
  return n ? `<span class="gdot"></span><b>${n} unsaved change${n === 1 ? "" : "s"}</b><span class="hint">Yellow cells are edited. Ctrl+S saves.</span><span style="flex:1"></span><button class="btn ghost" type="button" data-act="gdiscard">Discard</button><button class="btn primary" type="button" data-act="gsave">Save changes</button>`
    : `<span class="hint">Click a cell and type, like Excel. Enter/Tab/arrows move, Esc undoes the cell, paste blocks from Excel, type in the last row to add entries.</span>`;
}
function renderGrid(sh, rows, cols) {
  const E = S.gedits[sh.id] = S.gedits[sh.id] || {}, N = S.gnew[sh.id] = S.gnew[sh.id] || [];
  const lists = cols.filter(c => c.type === "select").map(c => `<datalist id="dl_${esc(c.id)}">${(c.options || []).map(o => `<option value="${esc(o)}">`).join("")}</datalist>`).join("");
  const cell = (key, r, c, ri, ci) => {
    if (c.type === "calc") { if (!r) return `<td class="gcalc"></td>`; const v = calcCell(sh, c, r); return `<td class="gcalc ${v.t && v.t !== "plain" ? "t-" + v.t : ""}" title="Calculated automatically">${esc(v.text)}</td>`; }
    const edited = r ? E[r.id] && E[r.id][c.id] !== undefined : false;
    const v = r ? (edited ? E[r.id][c.id] : (r.cells || {})[c.id]) : (N[key]?.cells[c.id] || "");
    const dirty = edited || (!r && v);
    return `<td class="${dirty ? "dirty" : ""} g-${c.type}"><input class="gc" data-k="${esc(r ? r.id : "new:" + key)}" data-c="${esc(c.id)}" data-ri="${ri}" data-ci="${ci}" value="${esc(gDisplay(c, v))}" ${c.type === "select" ? `list="dl_${esc(c.id)}"` : ""} aria-label="${esc(c.label)} row ${ri + 1}" autocomplete="off" spellcheck="false"></td>`;
  };
  let ri = 0;
  const body = rows.map(r => { const st = rowState(sh, r); const tr = `<tr class="${st.imp ? "imp" : ""} ${st.breach ? "breach" : ""} ${S.sel.has(r.id) ? "sel" : ""}"><td class="rn"><input type="checkbox" class="rowck" data-selrow="${esc(r.id)}" aria-label="Select row" ${S.sel.has(r.id) ? "checked" : ""}><span>${ri + 1}</span></td>${cols.map((c, ci) => cell(null, r, c, ri, ci)).join("")}</tr>`; ri++; return tr; }).join("")
    + [...N.map((n, k) => k), N.length].map(k => { const tr = `<tr class="gnew"><td class="rn"><span>${k === N.length ? "+" : "new"}</span></td>${cols.map((c, ci) => cell(k, null, c, ri, ci)).join("")}</tr>`; ri++; return tr; }).join("");
  return `<div class="gridbar" id="gridbar">${gridBarHTML(sh.id)}</div><div class="tablewrap xlwrap">${lists}<table class="xl"><thead><tr><th class="rn"></th>${cols.map((c, i) => `<th class="g-${c.type}" title="${esc(c.label)}"><span class="L">${colLetter(i)}</span>${esc(c.label)}${c.type === "calc" ? ' <span class="fx">fx</span>' : ""}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table></div>`;
}
function gSet(sid, key, c, raw) {
  const v = gNorm(c, raw);
  if (key.startsWith("new:")) { const k = +key.slice(4), N = S.gnew[sid]; while (N.length <= k) N.push({cells: {}}); N[k].cells[c.id] = v; return; }
  const E = S.gedits[sid], orig = (S.rows[key]?.cells || {})[c.id] || "";
  E[key] = E[key] || {};
  if (v === orig) { delete E[key][c.id]; if (!Object.keys(E[key]).length) delete E[key]; } else E[key][c.id] = v;
}
function gFocus(ri, ci) {
  const t = document.querySelector(`.gc[data-ri="${ri}"][data-ci="${ci}"]`);
  if (t) { t.focus({preventScroll: false}); t.select(); return true; }
  return false;
}
function gMove(inp, dr, dc) {
  const ri = +inp.dataset.ri, ci = +inp.dataset.ci, cols = (S.sheets[S.sheetId]?.columns || []).length;
  if (dr) { gFocus(ri + dr, ci); return; }
  for (let c = ci + dc; c >= 0 && c < cols; c += dc) if (gFocus(ri, c)) return;
  if (dc > 0) for (let c = 0; c < cols; c++) if (gFocus(ri + 1, c)) return;
}
function gRefreshAfter(inp, structural) {
  const sid = S.sheetId, td = inp.closest("td");
  const key = inp.dataset.k, cid = inp.dataset.c;
  const dirty = key.startsWith("new:") ? !!inp.value.trim() : !!(S.gedits[sid][key] && S.gedits[sid][key][cid] !== undefined);
  td.classList.toggle("dirty", dirty);
  const bar = $("#gridbar"); if (bar) bar.innerHTML = gridBarHTML(sid);
  if (structural) { const pos = [+inp.dataset.ri, +inp.dataset.ci]; render(); const t = document.querySelector(`.gc[data-ri="${pos[0]}"][data-ci="${pos[1]}"]`); if (t) { t.focus({preventScroll: true}); const L = t.value.length; try { t.setSelectionRange(L, L); } catch (e) {} } }
}
document.addEventListener("input", e => {
  const inp = e.target; if (!inp.classList?.contains("gc")) return;
  const sh = S.sheets[S.sheetId], c = (sh.columns || []).find(x => x.id === inp.dataset.c); if (!c) return;
  const key = inp.dataset.k, N = S.gnew[S.sheetId] || [];
  const structural = key === "new:" + N.length && inp.value.trim();
  gSet(S.sheetId, key, c, inp.value); gRefreshAfter(inp, structural);
});
document.addEventListener("change", e => {
  const inp = e.target; if (!inp.classList?.contains("gc")) return;
  const c = (S.sheets[S.sheetId]?.columns || []).find(x => x.id === inp.dataset.c);
  if (c?.type === "date") { const v = gNorm(c, inp.value); inp.value = gDisplay(c, v); }
});
document.addEventListener("keydown", e => {
  const inp = e.target; if (!inp.classList?.contains("gc")) return;
  const k = e.key;
  if ((e.ctrlKey || e.metaKey) && (k === "s" || k === "S")) { e.preventDefault(); saveGrid(); return; }
  if (k === "Enter") { e.preventDefault(); gMove(inp, e.shiftKey ? -1 : 1, 0); return; }
  if (k === "Tab") { e.preventDefault(); gMove(inp, 0, e.shiftKey ? -1 : 1); return; }
  if (k === "ArrowDown") { e.preventDefault(); gMove(inp, 1, 0); return; }
  if (k === "ArrowUp") { e.preventDefault(); gMove(inp, -1, 0); return; }
  if (k === "ArrowLeft" && inp.selectionStart === 0 && inp.selectionEnd === 0) { e.preventDefault(); gMove(inp, 0, -1); return; }
  if (k === "ArrowRight" && inp.selectionStart === inp.value.length) { e.preventDefault(); gMove(inp, 0, 1); return; }
  if (k === "Escape") {
    e.preventDefault(); e.stopPropagation();
    const sid = S.sheetId, key = inp.dataset.k, c = (S.sheets[sid].columns || []).find(x => x.id === inp.dataset.c);
    const orig = key.startsWith("new:") ? "" : (S.rows[key]?.cells || {})[c.id] || "";
    inp.value = gDisplay(c, orig); gSet(sid, key, c, orig); gRefreshAfter(inp, false); inp.select();
  }
}, true);
document.addEventListener("paste", e => {
  const inp = e.target; if (!inp.classList?.contains("gc")) return;
  const t = e.clipboardData?.getData("text/plain") || ""; if (!/[\t\n]/.test(t.replace(/\r?\n$/, ""))) return;
  e.preventDefault(); e.stopPropagation();
  const sid = S.sheetId, sh = S.sheets[sid], cols = sh.columns || [], grid = parseTSV(t.replace(/\r?\n$/, ""));
  const vis = filteredRows({id: sid, ...sh}), r0 = +inp.dataset.ri, c0 = +inp.dataset.ci;
  grid.forEach((line, i) => line.forEach((val, j) => {
    const c = cols[c0 + j]; if (!c || c.type === "calc") return;
    const ri = r0 + i, key = ri < vis.length ? vis[ri].id : "new:" + (ri - vis.length);
    gSet(sid, key, c, val);
  }));
  render(); gFocus(r0, c0); toast(`Pasted ${grid.length} row${grid.length === 1 ? "" : "s"}. Review the yellow cells, then Save.`);
}, true);
async function saveGrid() {
  const sid = S.sheetId, sh = S.sheets[sid]; if (!sh) return;
  const E = S.gedits[sid] || {}, N = (S.gnew[sid] || []).filter(n => Object.values(n.cells).some(Boolean));
  if (!Object.keys(E).length && !N.length) { toast("No changes to save"); return; }
  const now = new Date().toISOString(), snaps = [], tasks = [], add = {};
  const noteOpt = (c, v) => { if (c.type === "select" && v && !(c.options || []).includes(v)) (add[c.id] = add[c.id] || new Set()).add(v); };
  let n = 0;
  for (const [rid, ch] of Object.entries(E)) {
    const r = S.rows[rid]; if (!r) continue;
    const cells = {...(r.cells || {})};
    for (const [cid, v] of Object.entries(ch)) { n++; if (v) cells[cid] = v; else delete cells[cid]; noteOpt((sh.columns || []).find(c => c.id === cid) || {}, v); }
    snaps.push(["rows", rid, clone(r)]); tasks.push(() => store.put("rows", rid, {...r, cells, updatedAt: now}));
  }
  let order = rowsOf(sid).reduce((m, r) => Math.max(m, r.order || 0), 0);
  const srCols = (sh.columns || []).filter(c => c.type === "number" && /^(sr|sl|s\.?no|#|no)/i.test(c.label)), srMax = {};
  srCols.forEach(c => { srMax[c.id] = rowsOf(sid).reduce((m, r) => Math.max(m, +(r.cells || {})[c.id] || 0), 0); });
  N.forEach((nr, i) => { srCols.forEach(c => { if (!nr.cells[c.id]) nr.cells[c.id] = String(++srMax[c.id]); }); const cells = {}; Object.entries(nr.cells).forEach(([cid, v]) => { if (v) { cells[cid] = v; noteOpt((sh.columns || []).find(c => c.id === cid) || {}, v); } }); const id = uid("r") + i, o = ++order; n++; snaps.push(["rows", id, null]); tasks.push(() => store.put("rows", id, {sheetId: sid, order: o, cells, updatedAt: now})); });
  if (Object.keys(add).length) { snaps.push(["sheets", sid, clone(sh)]); store.put("sheets", sid, {...sh, columns: sh.columns.map(c => add[c.id] ? {...c, options: [...(c.options || []), ...add[c.id]]} : c)}); }
  S.gedits[sid] = {}; S.gnew[sid] = [];
  await pool(tasks, 10); render(); pushUndo(`Saved ${n} change${n === 1 ? "" : "s"}${N.length ? ` · ${N.length} new row${N.length === 1 ? "" : "s"}` : ""}`, snaps);
}
const gridHasFocus = () => !!document.activeElement?.classList?.contains("gc");
window.addEventListener("beforeunload", e => { if (Object.keys(S.gedits).some(sid => gridDirtyCount(sid))) { e.preventDefault(); e.returnValue = ""; } });

/* ---------- Table view preferences (per browser) ---------- */
const VP_DEF = {grid: "rows", stripe: false, head: "light", size: "m", rowh: 44, lines: "3", freeze: false, align: "left", valign: "top", hcase: "upper", halign: "left", pad: "normal", datefmt: "dmy", pill: "pill", boldFirst: false, hover: true, border: "soft"};
const TINTS = {none: "", yellow: "rgba(255,213,74,.22)", green: "rgba(46,170,110,.16)", blue: "rgba(60,120,230,.14)", red: "rgba(220,70,60,.14)", purple: "rgba(140,90,210,.15)", grey: "rgba(120,130,128,.14)"};
const TINT_DOT = {none: "transparent", yellow: "#F2C230", green: "#2EAA6E", blue: "#3C78E6", red: "#DC463C", purple: "#8C5AD2", grey: "#8A9592"};
function fmtDateV(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v || ""); if (!m) return v || "";
  const f = VP.fmt.datefmt;
  return f === "dash" ? `${m[3]}-${m[2]}-${m[1]}` : f === "iso" ? `${m[1]}-${m[2]}-${m[3]}` : f === "short" ? `${m[3]}-${MON[+m[2] - 1]}-${m[1].slice(2)}` : f === "us" ? `${MON[+m[2] - 1]} ${+m[3]}, ${m[1]}` : fmtDate(v);
}
function colFmt(sid, cid) { const v = sheetVP(sid); v.colfmt = v.colfmt || {}; return v.colfmt[cid] = v.colfmt[cid] || {}; }
let VP = {fmt: {...VP_DEF}, sheets: {}};
try { const v = JSON.parse(localStorage.getItem("bcp-view") || "null"); if (v) VP = {fmt: {...VP_DEF, ...(v.fmt || {})}, sheets: v.sheets || {}}; } catch (e) {}
const saveVP = () => { try { localStorage.setItem("bcp-view", JSON.stringify(VP)); } catch (e) {} };
function sheetVP(sid) { const v = VP.sheets[sid] = VP.sheets[sid] || {}; v.hidden = v.hidden || []; v.widths = v.widths || {}; v.colfmt = v.colfmt || {}; return v; }
function openFormat() {
  const sid = S.sheetId, sh = S.sheets[sid], cols = sh.columns || [], before = JSON.stringify(VP);
  const ch = (id, val, opts) => `<div class="choices" id="${id}">${opts.map(([v, b, d]) => `<button type="button" class="choice" data-v="${v}" aria-pressed="${String(val) === String(v)}"><b>${b}</b>${d ? `<span>${d}</span>` : ""}</button>`).join("")}</div>`;
  openDialog({
    eyebrow: sh.name, title: "Table format", saveLabel: "Done",
    body: () => {
      const F = VP.fmt, v = sheetVP(sid);
      return `<div class="field"><span class="lbl">Gridlines</span>${ch("fm_grid", F.grid, [["none", "None", "Clean"], ["rows", "Rows", "Lines between rows"], ["all", "All", "Excel-style grid"]])}</div>
      <div class="field"><span class="lbl">Header</span>${ch("fm_head", F.head, [["light", "Light", "Soft grey"], ["bold", "Bold", "Theme colour"], ["plain", "Plain", "No fill"]])}</div>
      <div class="row2" style="flex:none;gap:16px">
        <div class="field" style="flex:1"><span class="lbl">Text size</span>${ch("fm_size", F.size, [["s", "Small"], ["m", "Normal"], ["l", "Large"]])}</div>
        <div class="field" style="flex:1"><span class="lbl">Long text shows</span>${ch("fm_lines", F.lines, [["1", "1 line"], ["3", "3 lines"], ["all", "Everything"]])}</div></div>
      <div class="field"><label for="fm_rowh">Row height <span class="typ" id="fm_rowv">${F.rowh}px</span></label><input type="range" id="fm_rowh" min="30" max="140" step="2" value="${F.rowh}" style="accent-color:var(--accent)"></div>
      <div class="field"><span class="lbl">Options</span>
        <label class="ck"><input type="checkbox" id="fm_stripe" ${F.stripe ? "checked" : ""}> Striped rows</label>
        <label class="ck"><input type="checkbox" id="fm_boldfirst" ${F.boldFirst ? "checked" : ""}> Bold first column</label>
        <label class="ck"><input type="checkbox" id="fm_hover" ${F.hover ? "checked" : ""}> Highlight row under the mouse</label>
        <label class="ck"><input type="checkbox" id="fm_freeze" ${F.freeze ? "checked" : ""}> Freeze first column while scrolling sideways</label></div>
      <div class="row2" style="flex:none;gap:16px">
        <div class="field" style="flex:1"><span class="lbl">Cell text alignment</span>${ch("fm_align", F.align, [["left", "Left"], ["center", "Center"], ["right", "Right"]])}</div>
        <div class="field" style="flex:1"><span class="lbl">Vertical alignment</span>${ch("fm_valign", F.valign, [["top", "Top"], ["middle", "Middle"], ["bottom", "Bottom"]])}</div></div>
      <div class="row2" style="flex:none;gap:16px">
        <div class="field" style="flex:1"><span class="lbl">Heading text</span>${ch("fm_hcase", F.hcase, [["upper", "UPPERCASE"], ["normal", "Normal case"]])}</div>
        <div class="field" style="flex:1"><span class="lbl">Heading alignment</span>${ch("fm_halign", F.halign, [["left", "Left"], ["center", "Center"], ["right", "Right"]])}</div></div>
      <div class="row2" style="flex:none;gap:16px">
        <div class="field" style="flex:1"><span class="lbl">Cell padding</span>${ch("fm_pad", F.pad, [["tight", "Tight"], ["normal", "Normal"], ["roomy", "Roomy"]])}</div>
        <div class="field" style="flex:1"><span class="lbl">Border colour</span>${ch("fm_border", F.border, [["soft", "Soft"], ["strong", "Strong"], ["accent", "Theme"]])}</div></div>
      <div class="row2" style="flex:none;gap:16px">
        <div class="field" style="flex:1"><span class="lbl">Date format</span>${ch("fm_datefmt", F.datefmt, [["dmy", "21 Sep 2026"], ["short", "21-Sep-26"], ["dash", "21-09-2026"], ["iso", "2026-09-21"], ["us", "Sep 21, 2026"]])}</div>
        <div class="field" style="flex:1"><span class="lbl">Status values</span>${ch("fm_pill", F.pill, [["pill", "Pill", "Filled badge"], ["dot", "Dot", "Coloured dot"], ["text", "Text", "Coloured text"]])}</div></div>
      <div class="field"><span class="lbl">Columns in this sheet <span class="typ">show · align · wrap · bold · highlight · width</span></span>
        <div class="cfmt"><div class="cfh"><span>Column</span><span>Show</span><span>Align</span><span>Wrap</span><span>Bold</span><span>Highlight</span><span>Width</span></div>
        ${cols.map(c => { const cf = v.colfmt[c.id] || {}; return `<div class="cfr" data-cf="${esc(c.id)}">
          <span class="cn" title="${esc(c.label)}">${esc(c.label)}</span>
          <input type="checkbox" data-vis="${esc(c.id)}" ${v.hidden.includes(c.id) ? "" : "checked"} aria-label="Show ${esc(c.label)}">
          <span class="seg mini">${[["", "Auto"], ["left", "L"], ["center", "C"], ["right", "R"]].map(([a, l]) => `<button type="button" data-cfk="align" data-cfv="${a}" aria-pressed="${(cf.align || "") === a}" title="${a || "Use table setting"}">${l}</button>`).join("")}</span>
          <select class="inp mini" data-cfk="wrap" aria-label="Wrap"><option value="" ${!cf.wrap ? "selected" : ""}>Auto</option><option value="on" ${cf.wrap === "on" ? "selected" : ""}>Wrap all</option><option value="off" ${cf.wrap === "off" ? "selected" : ""}>One line</option></select>
          <button type="button" class="bbtn" data-cfk="bold" data-cfv="${cf.bold ? "" : "1"}" aria-pressed="${!!cf.bold}" title="Bold">B</button>
          <span class="tints">${Object.keys(TINTS).map(t => `<button type="button" class="tint" data-cfk="color" data-cfv="${t === "none" ? "" : t}" aria-pressed="${(cf.color || "none") === t}" title="${t}" style="--d:${TINT_DOT[t]}"></button>`).join("")}</span>
          <input class="inp mini" type="number" min="60" max="900" step="10" data-cfk="width" placeholder="auto" value="${v.widths[c.id] || ""}" aria-label="Width in pixels">
        </div>`; }).join("")}</div>
        <div class="row2" style="flex:none"><button class="btn" type="button" id="fm_showall" style="flex:none">Show all columns</button><button class="btn" type="button" id="fm_resetw" style="flex:none">Reset column widths</button></div>
        <span class="hint">Drag the edge of a column heading to resize it. These settings are saved in this browser and don't change what others see.</span></div>
      <button class="btn ghost" type="button" id="fm_reset" style="align-self:flex-start">Restore default format</button>`;
    },
    mount: root => {
      const F = VP.fmt, live = () => { saveVP(); render(); };
      [["fm_grid", "grid"], ["fm_head", "head"], ["fm_size", "size"], ["fm_lines", "lines"], ["fm_align", "align"], ["fm_valign", "valign"], ["fm_hcase", "hcase"], ["fm_halign", "halign"], ["fm_pad", "pad"], ["fm_border", "border"], ["fm_datefmt", "datefmt"], ["fm_pill", "pill"]].forEach(([id, key]) => { const g = root.querySelector("#" + id); pressGroup(g, ".choice", "v"); g.addEventListener("pick", () => { F[key] = g.dataset.v; live(); }); });
      root.querySelector("#fm_rowh").addEventListener("input", e => { F.rowh = +e.target.value; root.querySelector("#fm_rowv").textContent = F.rowh + "px"; live(); });
      root.querySelector("#fm_stripe").addEventListener("change", e => { F.stripe = e.target.checked; live(); });
      root.querySelector("#fm_freeze").addEventListener("change", e => { F.freeze = e.target.checked; live(); });
      root.querySelector("#fm_boldfirst").addEventListener("change", e => { F.boldFirst = e.target.checked; live(); });
      root.querySelector("#fm_hover").addEventListener("change", e => { F.hover = e.target.checked; live(); });
      const cfSet = (el, val) => { const row = el.closest("[data-cf]"), cid = row.dataset.cf, k = el.dataset.cfk, cf = colFmt(sid, cid);
        if (k === "width") { const w = parseInt(val, 10); if (w >= 60) sheetVP(sid).widths[cid] = Math.min(900, w); else delete sheetVP(sid).widths[cid]; }
        else if (val) cf[k] = k === "bold" ? true : val; else delete cf[k];
        if (k === "align") row.querySelectorAll('[data-cfk="align"]').forEach(b => b.setAttribute("aria-pressed", b.dataset.cfv === (val || "")));
        if (k === "color") row.querySelectorAll('[data-cfk="color"]').forEach(b => b.setAttribute("aria-pressed", (b.dataset.cfv || "") === (val || "")));
        if (k === "bold") { el.setAttribute("aria-pressed", String(!!val)); el.dataset.cfv = val ? "" : "1"; }
        live(); };
      root.addEventListener("click", e => { const b = e.target.closest("button[data-cfk]"); if (b) cfSet(b, b.dataset.cfv); });
      root.addEventListener("change", e => { const el = e.target.closest("select[data-cfk],input[data-cfk]"); if (el) cfSet(el, el.value); });
      root.addEventListener("change", e => { const id = e.target.dataset.vis; if (!id) return; const v = sheetVP(sid); v.hidden = e.target.checked ? v.hidden.filter(x => x !== id) : [...new Set([...v.hidden, id])]; live(); });
      root.querySelector("#fm_showall").onclick = () => { sheetVP(sid).hidden = []; root.querySelectorAll("[data-vis]").forEach(k => k.checked = true); live(); };
      root.querySelector("#fm_resetw").onclick = () => { sheetVP(sid).widths = {}; live(); root.querySelectorAll(".ck .n").forEach(n => n.remove()); };
      root.querySelector("#fm_reset").onclick = () => { VP.fmt = {...VP_DEF}; saveVP(); closeDialog(true); render(); openFormat(); };
    },
    onSave: () => { saveVP(); toast("Table format saved"); },
    onCancel: () => { VP = JSON.parse(before); saveVP(); render(); }
  });
}
/* column resize by dragging the heading edge */
let RSZ = null;
document.addEventListener("pointerdown", e => {
  const h = e.target.closest?.(".rsz"); if (!h) return;
  e.preventDefault(); e.stopPropagation();
  const th = h.closest("th"), id = h.dataset.rsz;
  RSZ = {id, th, x: e.clientX, w: th.getBoundingClientRect().width, cells: [...document.querySelectorAll(`.tablewrap td[data-cell="${CSS.escape(id)}"]`)]};
  h.setPointerCapture?.(e.pointerId); document.body.classList.add("resizing");
});
document.addEventListener("pointermove", e => {
  if (!RSZ) return; const w = Math.max(60, Math.min(900, Math.round(RSZ.w + e.clientX - RSZ.x)));
  RSZ.cur = w; [RSZ.th, ...RSZ.cells].forEach(el => { el.style.width = el.style.minWidth = el.style.maxWidth = w + "px"; });
});
document.addEventListener("pointerup", () => {
  if (!RSZ) return; if (RSZ.cur) { sheetVP(S.sheetId).widths[RSZ.id] = RSZ.cur; saveVP(); }
  RSZ = null; document.body.classList.remove("resizing");
});
document.addEventListener("dblclick", e => { const h = e.target.closest?.(".rsz"); if (!h) return; delete sheetVP(S.sheetId).widths[h.dataset.rsz]; saveVP(); render(); });
document.addEventListener("dragstart", e => { if (e.target.closest?.(".rsz") || RSZ) e.preventDefault(); }, true);
/* add a row right in the table */
async function addRowInline() {
  const sid = S.sheetId, sh = S.sheets[sid]; if (!sh) return;
  if ((S.layout[sid] || "") === "cards") { openDrawer(sid, null); return; }
  const cols = sh.columns || [], cells = {};
  cols.forEach(c => { if (c.type === "number" && /^(sr|sl|s\.?no|#|no)/i.test(c.label)) cells[c.id] = String(rowsOf(sid).reduce((m, r) => Math.max(m, +(r.cells || {})[c.id] || 0), 0) + 1); });
  const id = uid("r"), order = rowsOf(sid).reduce((m, r) => Math.max(m, r.order || 0), 0) + 1;
  S.q = ""; S.filters[sid] = []; S.onlyRed[sid] = false;
  await store.put("rows", id, {sheetId: sid, order, cells, updatedAt: new Date().toISOString()});
  render(); pushUndo("Row added", [["rows", id, null]]);
  const vp = sheetVP(sid), first = cols.find(c => c.type !== "calc" && c.type !== "number" && !vp.hidden.includes(c.id));
  requestAnimationFrame(() => { const tr = document.getElementById("row-" + id); if (!tr) return; tr.scrollIntoView({block: "nearest"}); tr.classList.add("flash"); const td = first && tr.querySelector(`td[data-cell="${CSS.escape(first.id)}"]`); if (td) openCellPop(td); });
}
/* quick add column from the table header */
function openQuickCol(anchor) {
  closeColMenu(); closeCellPop();
  const m = document.createElement("div"); m.className = "colmenu"; m.id = "colMenu"; CM = {colId: "__new", t: Date.now()};
  const T = [["text", "Free text"], ["select", "Dropdown"], ["date", "Date"], ["number", "Number"], ["long", "Long text"]];
  m.innerHTML = `<div class="ttl">New column</div><div class="rn"><input class="inp" id="qcName" placeholder="Column name"></div>
    <div class="opts" id="qcType" style="padding:4px 6px">${T.map(([v, l], i) => `<button type="button" class="opt" data-qt="${v}" aria-pressed="${i === 0}">${l}</button>`).join("")}</div>
    <div class="rn" id="qcOptsRow" hidden><input class="inp" id="qcOpts" placeholder="Options, comma separated (Open, WIP, Closed)"></div>
    <div class="rn"><button class="btn primary" type="button" id="qcAdd" style="flex:1;justify-content:center">Add column</button></div>
    <button type="button" id="qcMore">More options (aging, formulas, position)…</button>`;
  document.body.appendChild(m);
  const r = anchor.getBoundingClientRect(); m.style.top = Math.min(innerHeight - m.offsetHeight - 8, r.bottom + 4) + "px"; m.style.left = Math.max(8, Math.min(innerWidth - m.offsetWidth - 8, r.right - m.offsetWidth)) + "px";
  let type = "text"; const nm = m.querySelector("#qcName"); nm.focus({preventScroll: true});
  m.querySelector("#qcType").addEventListener("click", e => { const b = e.target.closest("[data-qt]"); if (!b) return; type = b.dataset.qt; m.querySelectorAll("[data-qt]").forEach(x => x.setAttribute("aria-pressed", x === b)); m.querySelector("#qcOptsRow").hidden = type !== "select"; });
  const add = () => {
    const label = nm.value.trim(); if (!label) { nm.focus(); toast("Type a column name"); return; }
    const sh = S.sheets[S.sheetId], c = {id: uid("c"), label, type};
    if (type === "select") c.options = [...new Set(m.querySelector("#qcOpts").value.split(",").map(x => x.trim()).filter(Boolean))];
    const sn = snap("sheets", [S.sheetId]); store.put("sheets", S.sheetId, {...sh, columns: [...(sh.columns || []), c]}); closeColMenu(); render(); pushUndo(`Column “${label}” added`, sn);
    requestAnimationFrame(() => { const tw = document.querySelector(".tablewrap"); if (tw) tw.scrollLeft = tw.scrollWidth; });
  };
  m.querySelector("#qcAdd").onclick = add;
  m.addEventListener("keydown", e => { if (e.key === "Enter" && e.target.tagName === "INPUT") { e.preventDefault(); add(); } if (e.key === "Escape") { e.stopPropagation(); closeColMenu(); } });
  m.querySelector("#qcMore").onclick = () => { closeColMenu(); openAddColumn(); };
}

/* ---------- AI (Google Gemini) ---------- */
const AI_ON = !!window.AI_FEATURES;
const AI = {key: "", model: "", models: [], auto: true};
try { Object.assign(AI, JSON.parse(localStorage.getItem("ai-settings") || "{}")); } catch (e) {}
const saveAI = () => { try { localStorage.setItem("ai-settings", JSON.stringify(AI)); } catch (e) {} };
const GAPI = "https://generativelanguage.googleapis.com/v1beta";
function pickBestModel(list) {
  const ver = n => { const m = /gemini-(\d+(?:\.\d+)?)/.exec(n); return m ? parseFloat(m[1]) : 0; };
  const stable = list.filter(m => m.free && !/preview|exp|latest/.test(m.id));
  const flash = (stable.length ? stable : list.filter(m => m.free)).filter(m => /-flash$/.test(m.id) || /-flash-\d{3}$/.test(m.id));
  const pool = flash.length ? flash : list.filter(m => m.free);
  return (pool.sort((a, b) => ver(b.id) - ver(a.id))[0] || list[0] || {}).id || "";
}
async function aiLoadModels() {
  if (!AI.key) throw new Error("Add your Gemini API key first.");
  const r = await fetch(`${GAPI}/models?pageSize=200`, {headers: {"x-goog-api-key": AI.key}});
  const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error?.message || `Google returned ${r.status}`);
  AI.models = (j.models || []).filter(m => (m.supportedGenerationMethods || []).includes("generateContent") && /gemini|gemma/.test(m.name) && !/image|tts|audio|live|embedding|vision|veo|imagen|robotics|computer-use/.test(m.name))
    .map(m => { const id = m.name.replace(/^models\//, ""); return {id, label: m.displayName || id, free: /flash|gemma/.test(id), ctx: m.inputTokenLimit || 0}; })
    .sort((a, b) => (b.free - a.free) || b.id.localeCompare(a.id, undefined, {numeric: true}));
  if (AI.auto || !AI.models.some(m => m.id === AI.model)) AI.model = pickBestModel(AI.models);
  AI.updatedAt = new Date().toISOString(); saveAI(); return AI.models;
}
async function gemini(prompt, {json = false, system = "", temp = 0.3} = {}) {
  if (!AI.key) throw new Error("Add your Gemini API key in AI → Settings.");
  if (!AI.model) await aiLoadModels();
  const body = {contents: [{role: "user", parts: [{text: prompt}]}], generationConfig: {temperature: temp, ...(json ? {responseMimeType: "application/json"} : {})}};
  if (system) body.systemInstruction = {parts: [{text: system}]};
  const r = await fetch(`${GAPI}/models/${encodeURIComponent(AI.model)}:generateContent`, {method: "POST", headers: {"Content-Type": "application/json", "x-goog-api-key": AI.key}, body: JSON.stringify(body)});
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(r.status === 429 ? "Free-tier limit reached for this model. Wait a minute or pick another model in AI → Settings." : (j.error?.message || `Google returned ${r.status}`));
  const txt = (j.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("");
  if (!txt) throw new Error(j.promptFeedback?.blockReason ? "Google blocked this request (" + j.promptFeedback.blockReason + ")." : "The model returned no answer. Try again.");
  if (!json) return txt;
  try { return JSON.parse(txt.replace(/^```(?:json)?\s*|\s*```$/g, "")); } catch (e) { throw new Error("The model's answer wasn't in the expected format. Try again."); }
}
/* Serialise sheets as compact text for the model */
function sheetsContext(ids, maxChars = 350000) {
  const out = []; let used = 0;
  for (const id of ids) {
    const sh = {id, ...S.sheets[id]}, cols = sh.columns || [], rows = rowsOf(id);
    const head = `### Sheet: ${sh.name}${sh.note ? ` (note: ${sh.note})` : ""} — ${rows.length} rows${sh.remarkCol ? ` (remark column: ${(cols.find(c => c.id === sh.remarkCol) || {}).label})` : ""}\nrow_id | ${cols.map(c => c.label + (c.type === "calc" ? " (auto)" : "")).join(" | ")} | flags | last_updated`;
    const lines = [head];
    for (const r of rows) {
      const st = rowState(sh, r), flags = [st.imp ? "IMPORTANT" : "", st.breach ? `ETA CROSSED +${st.late}d` : "", isDoneRow(sh, r) ? "DONE" : ""].filter(Boolean).join(",");
      const vals = cols.map(c => { let v = c.type === "calc" ? calcCell(sh, c, r).text : ((r.cells || {})[c.id] || ""); v = String(v).replace(/\s*\n\s*/g, " ⏎ "); return v.length > 700 ? v.slice(0, 700) + "…" : v; });
      const line = `${r.id} | ${vals.join(" | ")} | ${flags} | ${(r.updatedAt || "").slice(0, 10)}`;
      if (used + line.length > maxChars) { lines.push("…(more rows omitted for length)"); break; }
      used += line.length; lines.push(line);
    }
    out.push(lines.join("\n"));
  }
  return out.join("\n\n");
}
const aiSystem = () => `You help a project manager track bank integration projects. Today is ${fmtDate(todayISO())} (${todayISO()}). Use ONLY the tracker data given. "Working days" exclude Saturday and Sunday. Rows flagged ETA CROSSED are late; DONE rows are complete. When you refer to specific rows, cite them inline as [[row_id]] using the exact row_id. Be concise and practical. If the data does not contain the answer, say so.`;
/* tiny safe markdown → HTML with row links */
function aiHTML(t) {
  let h = esc(t);
  h = h.replace(/\[\[([A-Za-z0-9_-]+)\]\]/g, (m, id) => { const r = S.rows[id]; if (!r) return ""; const sh = S.sheets[r.sheetId], tc = titleCol({id: r.sheetId, ...sh}); return `<button type="button" class="airow" data-airow="${id}" title="Open entry">${esc((r.cells || {})[tc?.id] || "entry")}<small>${esc(sh?.name || "")}</small></button>`; });
  h = h.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/^#{1,4}\s*(.+)$/gm, "<b>$1</b>");
  h = h.split(/\n/).map(l => /^\s*[-*•]\s+/.test(l) ? `<li>${l.replace(/^\s*[-*•]\s+/, "")}</li>` : /^\s*\d+\.\s+/.test(l) ? `<li>${l.replace(/^\s*\d+\.\s+/, "")}</li>` : l ? `<p>${l}</p>` : "").join("");
  return h.replace(/(<li>.*?<\/li>)+/g, m => `<ul>${m}</ul>`);
}
function sheetPicker(id, preset) {
  const trks = trackerList(); const sel = new Set(preset);
  return `<div class="group aipick" id="${id}">${trks.map(t => { const sh = sheetList(t.id); if (!sh.length) return ""; return `<div data-g="${esc(t.id)}"><label class="ck head"><input type="checkbox" data-grp="${esc(t.id)}" ${sh.every(s => sel.has(s.id)) ? "checked" : ""}> ${esc(t.name)} <span class="n">${sh.length} sheets</span></label><div class="kids">${sh.map(s => `<label class="ck"><input type="checkbox" data-sh="${esc(s.id)}" ${sel.has(s.id) ? "checked" : ""}> ${esc(s.name)} <span class="n">${rowsOf(s.id).length}</span></label>`).join("")}</div></div>`; }).join("")}</div>`;
}
function wirePicker(root, id) {
  const box = root.querySelector("#" + id);
  box.addEventListener("change", e => { if (e.target.dataset.grp) box.querySelectorAll(`[data-g="${CSS.escape(e.target.dataset.grp)}"] [data-sh]`).forEach(k => k.checked = e.target.checked); box.querySelectorAll("[data-grp]").forEach(h => { const ks = [...box.querySelectorAll(`[data-g="${CSS.escape(h.dataset.grp)}"] [data-sh]`)], n = ks.filter(k => k.checked).length; h.checked = n === ks.length; h.indeterminate = n > 0 && n < ks.length; }); });
  return () => [...box.querySelectorAll("[data-sh]:checked")].map(k => k.dataset.sh);
}
let AIP = {tab: "ask", ask: [], q: ""};
function openAI(tab) {
  AIP.tab = tab || (AI.key ? (AIP.tab === "sum" ? "ask" : AIP.tab) : "settings");
  const tabs = [["ask", "Ask the tracker"], ["email", "Status email"], ["settings", "Settings"]];
  openDialog({
    eyebrow: "AI assistant · Gemini", title: "Ask, draft and summarise", saveLabel: "Close",
    body: () => `<div class="seg aitabs" role="tablist">${tabs.map(([k, l]) => `<button type="button" data-aitab="${k}" aria-pressed="${AIP.tab === k}">${l}</button>`).join("")}</div><div id="aipane"></div>`,
    mount: root => {
      const pane = root.querySelector("#aipane");
      const show = () => { root.querySelectorAll("[data-aitab]").forEach(b => b.setAttribute("aria-pressed", b.dataset.aitab === AIP.tab)); ({ask: paneAsk, email: paneEmail, sum: paneSum, settings: paneSettings})[AIP.tab](pane); };
      root.addEventListener("click", e => { const b = e.target.closest("[data-aitab]"); if (b) { AIP.tab = b.dataset.aitab; show(); } });
      root.addEventListener("click", e => { const b = e.target.closest("[data-airow]"); if (!b) return; const r = S.rows[b.dataset.airow]; if (!r) return; closeDialog(true); S.view = "sheet"; S.sheetId = r.sheetId; render(); openDrawer(r.sheetId, b.dataset.airow); });
      show();
    },
    onSave: () => {}
  });
  document.querySelector("#dlg .mbox").classList.add("wide");
}
const needKey = pane => { if (AI.key) return false; pane.innerHTML = `<div class="banner">Add your Gemini API key in <button class="stamp" type="button" data-aitab="settings">Settings</button> to use AI.</div>`; return true; };
function paneAsk(pane) {
  if (needKey(pane)) return;
  const preset = AIP.askSheets || (S.sheetId ? [S.sheetId] : sheetList().map(s => s.id));
  const ideas = ["What's pending with the bank for more than 20 working days?", "Which APIs are blocked and why?", "Summarise everything that crossed its ETA", "What changed in the last 7 days?", "Who owns the most open items?"];
  pane.innerHTML = `<div class="field"><span class="lbl">Answer from these sheets</span>${sheetPicker("ai_ask_sh", preset)}</div>
    <div class="field"><label for="ai_q">Your question</label><textarea class="inp" id="ai_q" rows="2" placeholder="Ask anything about the selected sheets…">${esc(AIP.q || "")}</textarea>
      <div class="chips">${ideas.map(q => `<button type="button" class="chip t-neu" data-idea="${esc(q)}">${esc(q)}</button>`).join("")}</div></div>
    <button class="btn primary" type="button" id="ai_go" style="align-self:flex-start">${ICON.spark} Ask</button>
    <div class="aiout" id="ai_out">${AIP.last ? aiHTML(AIP.last) : ""}</div>`;
  const sel = wirePicker(pane, "ai_ask_sh"), q = pane.querySelector("#ai_q"), out = pane.querySelector("#ai_out"), go = pane.querySelector("#ai_go");
  pane.querySelectorAll("[data-idea]").forEach(b => b.onclick = () => { q.value = b.dataset.idea; q.focus(); });
  const run = async () => {
    const ids = sel(); AIP.askSheets = ids; AIP.q = q.value.trim(); if (!AIP.q) { q.focus(); return; } if (!ids.length) { toast("Pick at least one sheet"); return; }
    go.disabled = true; out.innerHTML = `<div class="aithink">Reading ${ids.length} sheet${ids.length > 1 ? "s" : ""}…</div>`;
    try { AIP.last = await gemini(`Tracker data:\n\n${sheetsContext(ids)}\n\nQuestion: ${AIP.q}`, {system: aiSystem()}); out.innerHTML = aiHTML(AIP.last) + `<div class="aimeta">${esc(AI.model)} · answers can be wrong, check the linked entries</div>`; }
    catch (e) { out.innerHTML = `<div class="banner" style="color:var(--bad)">${esc(e.message)}</div>`; }
    go.disabled = false;
  };
  go.onclick = run; q.addEventListener("keydown", e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); run(); } });
}
function paneEmail(pane) {
  if (needKey(pane)) return;
  const preset = AIP.mailSheets || sheetList().map(s => s.id);
  pane.innerHTML = `<div class="field"><span class="lbl">Include these sheets</span>${sheetPicker("ai_m_sh", preset)}</div>
    <div class="row2" style="flex:none;gap:12px">
      <div class="field" style="flex:2"><span class="lbl">Period</span><div class="row2" style="flex:none;gap:8px;align-items:center"><input class="inp" type="date" id="ai_from" style="flex:1"><span class="hint">to</span><input class="inp" type="date" id="ai_to" style="flex:1"></div>
        <div class="chips">${[["week", "This week"], ["7", "Last 7 days"], ["14", "Last 14 days"], ["month", "This month"], ["30", "Last 30 days"]].map(([k, l]) => `<button type="button" class="chip t-neu" data-per="${k}">${l}</button>`).join("")}</div></div>
      <div class="field" style="flex:1"><label for="ai_tone">Style</label><select class="inp" id="ai_tone"><option value="formal and concise">Formal, concise</option><option value="brief bullet points only">Very brief bullets</option><option value="detailed with context">Detailed</option></select></div></div>
    <div class="field"><label for="ai_extra">Anything to add? <span class="typ">optional</span></label><input class="inp" id="ai_extra" placeholder="e.g. mention the go-live target of 15 Dec, sign off as Fable team"></div>
    <button class="btn primary" type="button" id="ai_mgo" style="align-self:flex-start">${ICON.spark} Draft email</button>
    <div id="ai_mout"></div>`;
  const sel = wirePicker(pane, "ai_m_sh"), go = pane.querySelector("#ai_mgo"), out = pane.querySelector("#ai_mout");
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const setPer = k => { const t = today0(), f = new Date(t); if (k === "week") f.setDate(t.getDate() - ((t.getDay() + 6) % 7)); else if (k === "month") f.setDate(1); else f.setDate(t.getDate() - (+k - 1)); pane.querySelector("#ai_from").value = iso(f); pane.querySelector("#ai_to").value = iso(t); pane.querySelectorAll("[data-per]").forEach(b => b.setAttribute("aria-pressed", b.dataset.per === k)); AIP.per = k; };
  pane.querySelectorAll("[data-per]").forEach(b => b.onclick = () => setPer(b.dataset.per));
  if (AIP.from && AIP.to) { pane.querySelector("#ai_from").value = AIP.from; pane.querySelector("#ai_to").value = AIP.to; } else setPer("week");
  go.onclick = async () => {
    const ids = sel(); AIP.mailSheets = ids; if (!ids.length) { toast("Pick at least one sheet"); return; }
    const trk = [...new Set(ids.map(id => trackerList().find(t => t.id === tid(S.sheets[id]))?.name))].filter(Boolean).join(" & ");
    const from = pane.querySelector("#ai_from").value, to = pane.querySelector("#ai_to").value; if (!from || !to || from > to) { toast("Pick a valid period: from date on or before the to date"); return; } AIP.from = from; AIP.to = to;
    go.disabled = true; out.innerHTML = `<div class="aithink">Writing the update…</div>`;
    try {
      const j = await gemini(`Write a status email for the ${trk || "bank"} project covering the period ${fmtDate(from)} to ${fmtDate(to)} (${from} to ${to}). Style: ${pane.querySelector("#ai_tone").value}. ${pane.querySelector("#ai_extra").value}
Focus on what happened in that period: remark lines dated within it and rows whose last_updated falls in it. Still list items that are open, blocked or past their ETA as of the end date.
Structure the body with short sections: Summary; Completed; In progress; Pending with the bank / blockers; ETA crossed (with days late); Next steps. Use plain text with "- " bullets, no markdown symbols like ** or #. Do not invent facts. Do not include row ids.
Return JSON: {"subject": string, "body": string}.

Tracker data:
${sheetsContext(ids)}`, {json: true, system: aiSystem(), temp: 0.4});
      out.innerHTML = `<div class="field"><label for="ai_subj">Subject</label><input class="inp" id="ai_subj" value="${esc(j.subject || "")}"></div><div class="field"><label for="ai_body">Body</label><textarea class="inp" id="ai_body" rows="16">${esc(j.body || "")}</textarea></div>
        <div class="row2" style="flex:none"><button class="btn primary" type="button" id="ai_copy" style="flex:none">Copy email</button><button class="btn" type="button" id="ai_again" style="flex:none">Draft again</button></div><span class="hint">Edit freely, then paste into Outlook. Check the facts before sending.</span>`;
      out.querySelector("#ai_copy").onclick = () => { const t = `Subject: ${out.querySelector("#ai_subj").value}\n\n${out.querySelector("#ai_body").value}`; navigator.clipboard.writeText(t).then(() => toast("Email copied"), () => { out.querySelector("#ai_body").select(); document.execCommand("copy"); toast("Email copied"); }); };
      out.querySelector("#ai_again").onclick = () => go.click();
    } catch (e) { out.innerHTML = `<div class="banner" style="color:var(--bad)">${esc(e.message)}</div>`; }
    go.disabled = false;
  };
}
function paneSum(pane) {
  if (needKey(pane)) return;
  const sid = S.sheetId, sh = S.sheets[sid]; if (!sh) { pane.innerHTML = `<div class="banner">Open a sheet first.</div>`; return; }
  const cols = sh.columns || [], textCols = cols.filter(c => c.type === "long" || c.type === "text"), def = (cols.find(c => c.type === "long" && /remark|summary|update|response|comment/i.test(c.label)) || textCols[0])?.id;
  const visible = filteredRows({id: sid, ...sh});
  pane.innerHTML = `<p class="hint" style="margin:0">Sheet: <b>${esc(sh.name)}</b></p>
    <div class="row2" style="flex:none;gap:12px">
      <div class="field" style="flex:1"><label for="ai_scol">Remarks column to summarise</label><select class="inp" id="ai_scol">${textCols.map(c => `<option value="${esc(c.id)}" ${c.id === def ? "selected" : ""}>${esc(c.label)}</option>`).join("")}</select></div>
      <div class="field" style="flex:1"><label for="ai_srows">Rows</label><select class="inp" id="ai_srows">${S.sel.size ? `<option value="sel">Selected rows (${S.sel.size})</option>` : ""}<option value="vis">Rows shown now (${visible.length})</option><option value="all">All rows (${rowsOf(sid).length})</option></select></div></div>
    <button class="btn primary" type="button" id="ai_sgo" style="align-self:flex-start">${ICON.spark} Summarise</button><div id="ai_sout"></div>`;
  const go = pane.querySelector("#ai_sgo"), out = pane.querySelector("#ai_sout");
  go.onclick = async () => {
    const cid = pane.querySelector("#ai_scol").value, mode = pane.querySelector("#ai_srows").value;
    const rows = (mode === "sel" ? rowsOf(sid).filter(r => S.sel.has(r.id)) : mode === "vis" ? visible : rowsOf(sid)).filter(r => ((r.cells || {})[cid] || "").trim()).slice(0, 150);
    if (!rows.length) { out.innerHTML = `<div class="banner">No text in that column for these rows.</div>`; return; }
    const tc = titleCol({id: sid, ...sh});
    go.disabled = true; out.innerHTML = `<div class="aithink">Summarising ${rows.length} entries…</div>`;
    try {
      const j = await gemini(`For each entry, write the CURRENT status in at most 2 short sentences (max 220 characters), based on the latest dated update first. Keep names, dates and who it is pending with. Return JSON object mapping row_id to summary.\n\n${rows.map(r => `row_id: ${r.id}\ntitle: ${(r.cells || {})[tc?.id] || ""}\ntext: ${String(r.cells[cid]).slice(0, 4000)}`).join("\n---\n")}`, {json: true, system: aiSystem()});
      const res = rows.map(r => ({r, s: String(j[r.id] || "").trim()})).filter(x => x.s);
      const tgtOpts = cols.filter(c => (c.type === "long" || c.type === "text") && c.id !== cid);
      out.innerHTML = `<div class="sumlist">${res.map(x => `<label class="sumrow"><input type="checkbox" data-sr="${x.r.id}" checked><span><b>${esc((x.r.cells || {})[tc?.id] || "Entry")}</b><span class="aitxt" contenteditable="true">${esc(x.s)}</span></span></label>`).join("")}</div>
        <div class="row2" style="flex:none;align-items:end;gap:10px"><div class="field" style="flex:1"><label for="ai_stgt">Save ticked summaries into</label><select class="inp" id="ai_stgt"><option value="__new">New column “AI summary”</option>${tgtOpts.map(c => `<option value="${esc(c.id)}">${esc(c.label)} (replace)</option>`).join("")}<option value="__top">Top of “${esc(cols.find(c => c.id === cid).label)}” as today's update</option></select></div><button class="btn primary" type="button" id="ai_ssave" style="flex:none">Save</button></div>
        <span class="hint">You can edit any summary before saving. Undo is available after saving.</span>`;
      out.querySelector("#ai_ssave").onclick = async () => {
        let tgt = out.querySelector("#ai_stgt").value; const snaps = [], now = new Date().toISOString(), cur = S.sheets[sid];
        if (tgt === "__new") { const nc = {id: uid("c"), label: "AI summary", type: "long"}; snaps.push(["sheets", sid, clone(cur)]); const pos = cur.columns.findIndex(c => c.id === cid) + 1; const ncols = [...cur.columns]; ncols.splice(pos, 0, nc); await store.put("sheets", sid, {...cur, columns: ncols}); tgt = nc.id; }
        const picks = [...out.querySelectorAll("[data-sr]:checked")].map(k => [k.dataset.sr, k.closest(".sumrow").querySelector(".aitxt").textContent.trim()]);
        await pool(picks.map(([rid, txt]) => () => { const r = S.rows[rid]; snaps.push(["rows", rid, clone(r)]); const cells = {...(r.cells || {})}; if (tgt === "__top") cells[cid] = `${stampText()}(Summary): ${txt}\n${cells[cid] || ""}`; else cells[tgt] = txt; return store.put("rows", rid, {...r, cells, updatedAt: now}); }));
        closeDialog(true); render(); pushUndo(`${picks.length} summaries saved`, snaps);
      };
    } catch (e) { out.innerHTML = `<div class="banner" style="color:var(--bad)">${esc(e.message)}</div>`; }
    go.disabled = false;
  };
}
function paneSettings(pane) {
  const opts = () => AI.models.length ? AI.models.map(m => `<option value="${esc(m.id)}" ${m.id === AI.model ? "selected" : ""}>${esc(m.label)}${m.free ? " · free tier" : ""} — ${esc(m.id)}</option>`).join("") : `<option value="">Click “Update models” after adding your key</option>`;
  pane.innerHTML = `<div class="field"><label for="ai_key">Gemini API key</label><div class="row2" style="flex:none"><input class="inp" id="ai_key" type="password" autocomplete="off" placeholder="AIza…" value="${esc(AI.key)}" style="flex:1"><button class="btn" type="button" id="ai_show" style="flex:none">Show</button></div>
      <span class="hint">Get a free key at aistudio.google.com/apikey. The key is stored only in this browser, never in the website files or the shared database.</span></div>
    <div class="field"><label for="ai_model">Model</label><select class="inp" id="ai_model">${opts()}</select>
      <label class="ck"><input type="checkbox" id="ai_auto" ${AI.auto ? "checked" : ""}> Always use the newest free Flash model when updating</label>
      <div class="row2" style="flex:none"><button class="btn" type="button" id="ai_upd" style="flex:none">↻ Update models</button><button class="btn" type="button" id="ai_test" style="flex:none">Test</button></div>
      <span class="hint" id="ai_smsg">${AI.updatedAt ? `Model list updated ${esc(ago(AI.updatedAt))}.` : ""} Models marked “free tier” (Flash, Flash-Lite, Gemma) can be used without billing, within Google's daily limits.</span></div>
    <div class="banner" style="font-size:12.5px">Tip: in Google Cloud console → Credentials, restrict this key to your website address (HTTP referrer) so it can't be used elsewhere. Entry text you send to AI goes to Google.</div>`;
  const msg = pane.querySelector("#ai_smsg"), keyIn = pane.querySelector("#ai_key");
  pane.querySelector("#ai_show").onclick = e => { keyIn.type = keyIn.type === "password" ? "text" : "password"; e.target.textContent = keyIn.type === "password" ? "Show" : "Hide"; };
  keyIn.addEventListener("change", () => { AI.key = keyIn.value.trim(); saveAI(); });
  pane.querySelector("#ai_model").addEventListener("change", e => { AI.model = e.target.value; AI.auto = false; pane.querySelector("#ai_auto").checked = false; saveAI(); });
  pane.querySelector("#ai_auto").addEventListener("change", e => { AI.auto = e.target.checked; saveAI(); });
  pane.querySelector("#ai_upd").onclick = async () => { AI.key = keyIn.value.trim(); saveAI(); msg.textContent = "Checking Google for the latest models…"; msg.style.color = "";
    try { await aiLoadModels(); pane.querySelector("#ai_model").innerHTML = opts(); msg.textContent = `Found ${AI.models.length} models. Using ${AI.model}.`; } catch (e) { msg.textContent = e.message; msg.style.color = "var(--bad)"; } };
  pane.querySelector("#ai_test").onclick = async () => { AI.key = keyIn.value.trim(); saveAI(); msg.textContent = "Testing…"; msg.style.color = "";
    try { const t = await gemini("Reply with the single word: ready"); msg.textContent = `Working ✓ (${AI.model} said “${t.trim().slice(0, 30)}”)`; msg.style.color = "var(--good)"; } catch (e) { msg.textContent = e.message; msg.style.color = "var(--bad)"; } };
}
/* entry form: summarise one field */
async function summariseField(cid, btn) {
  const t = $(`#f_${CSS.escape(cid)}`), txt = (t?.value || "").trim();
  if (!txt) { toast("Nothing to summarise yet"); return; }
  if (!AI.key) { openAI("settings"); return; }
  const field = btn.closest(".field"); field.querySelector(".aisum")?.remove();
  const box = document.createElement("div"); box.className = "aisum"; box.innerHTML = `<span class="aithink">Summarising…</span>`; field.appendChild(box);
  try {
    const s = await gemini(`Summarise the CURRENT status of this tracker entry in at most 2 short sentences (max 220 characters). Start from the latest dated update, keep names, dates and who it's pending with.\n\n${txt.slice(0, 8000)}`, {system: aiSystem()});
    box.innerHTML = `<div class="aitxt">${esc(s.trim())}</div><div class="row2" style="flex:none"><button type="button" class="stamp" data-aiuse="${esc(cid)}">Add as today's update</button><button type="button" class="stamp" data-aiuse="${esc(cid)}" data-mode="copy">Copy</button></div>`;
  } catch (e) { box.innerHTML = `<span style="color:var(--bad)">${esc(e.message)}</span>`; }
}
/* plain-English filters */
async function aiFilter(q) {
  if (!AI.key) throw new Error("Add your Gemini API key in AI → Settings first.");
  const sid = S.sheetId, sh = {id: sid, ...S.sheets[sid]}, cols = sh.columns || [];
  const schema = cols.map(c => { const k = fkind(c); return {id: c.id, label: c.label, type: c.type === "calc" ? `number (${CALC[c.calc?.kind]?.name || "calculated"}, in days)` : c.type, ...(c.type === "select" ? {options: c.options || []} : {}), allowed_ops: k === "in" ? ["in", "empty", "notempty"] : k === "date" ? ["before", "after", "on", "between", "overdue", "next7", "last7", "thismonth", "empty", "notempty"] : k === "num" ? ["gt", "lt", "eq", "between", "empty", "notempty"] : ["contains", "notcontains", "empty", "notempty"]}; });
  const sample = rowsOf(sid).slice(0, 8).map(r => Object.fromEntries(cols.filter(c => c.type !== "calc").map(c => [c.label, String((r.cells || {})[c.id] || "").slice(0, 60)])));
  const j = await gemini(`Convert the user's request into filters for a table. Today is ${todayISO()}.
Columns: ${JSON.stringify(schema)}
Example rows: ${JSON.stringify(sample)}
Rules: "in" takes val as an array of exact option values; date ops take val as "YYYY-MM-DD" (between: ["YYYY-MM-DD","YYYY-MM-DD"]); number ops take numbers (between: [min,max]); contains takes a text val; overdue/next7/last7/thismonth/empty/notempty take val null. For things like "expiring in the next 3 months" use between with today and the end date. Use "search" only for free-text matching across all columns when no single column fits.
Return JSON: {"filters":[{"col": column id, "op": string, "val": any}], "search": string or "", "explanation": short string}.
Request: ${q}`, {json: true, system: "You output only valid JSON."});
  const ok = (j.filters || []).filter(f => { const c = cols.find(x => x.id === f.col); if (!c) return false; const k = fkind(c); const sc = schema.find(x => x.id === c.id); if (!sc.allowed_ops.includes(f.op)) return false; if (f.op === "in") { f.val = (Array.isArray(f.val) ? f.val : [f.val]).map(String); return f.val.length; } if (f.op === "between") return Array.isArray(f.val) && f.val.length === 2; if (["contains", "notcontains", "before", "after", "on", "gt", "lt", "eq"].includes(f.op)) return f.val != null && f.val !== ""; return true; });
  if (!ok.length && !j.search) throw new Error("Couldn't turn that into a filter. Try naming a column, e.g. “Status is WIP”.");
  S.filters[sid] = ok; S.q = j.search || ""; saveFilters(); render();
  return ok.length + (j.search ? 1 : 0);
}

/* ---------- Generic dialog ---------- */
let DLG = null;
function openDialog(o) {
  DLG = o;
  $("#dEyebrow").textContent = o.eyebrow || ""; $("#dTitle").textContent = o.title || "";
  $("#dSave").textContent = o.saveLabel || "Save";
  const del = $("#dDelete"); del.hidden = !o.onDelete; del.classList.remove("armed"); del.textContent = o.deleteLabel || "Delete";
  $("#dBody").innerHTML = o.body(); o.mount && o.mount($("#dBody"));
  $("#dlg").hidden = false;
  setTimeout(() => $("#dBody").querySelector("input:not([type=checkbox]),select,textarea")?.focus(), 50);
}
function closeDialog(saved) { if (saved !== true && DLG?.onCancel) DLG.onCancel(); $("#dlg").hidden = true; DLG = null; }
$("#dClose").onclick = closeDialog; $("#dCancel").onclick = closeDialog;
$("#dlg").addEventListener("click", e => { if (e.target.id === "dlg") closeDialog(); });
$("#dSave").onclick = async () => { if (DLG && (await DLG.onSave($("#dBody"))) !== false) closeDialog(true); };
$("#dDelete").onclick = async () => {
  const b = $("#dDelete");
  if (!b.classList.contains("armed")) { b.classList.add("armed"); b.textContent = DLG.confirmLabel || "Click again to delete"; return; }
  const fn = DLG.onDelete; closeDialog(true); await fn();
};
const pressGroup = (root, sel, attr) => root.addEventListener("click", e => { const b = e.target.closest(sel); if (!b) return; root.querySelectorAll(sel).forEach(x => x.setAttribute("aria-pressed", x === b)); root.dataset[attr] = b.dataset.v; root.dispatchEvent(new Event("pick")); });

/* ---------- Calc config UI ---------- */
function calcCfgHTML(k, cols, selfId, lockKind) {
  k = k || {kind: "aging"};
  const dates = cols.filter(c => c.type === "date" && c.id !== selfId), nums = cols.filter(c => (c.type === "number" || c.type === "calc") && c.id !== selfId);
  const sel = (key, list, val, blank) => `<select class="inp" data-ck="${key}">${blank ? `<option value="">${blank}</option>` : ""}${list.map(c => `<option value="${esc(c.id)}" ${c.id === val ? "selected" : ""}>${esc(c.label)}</option>`).join("")}</select>`;
  const noDates = !dates.length && ["aging","due","between"].includes(k.kind) ? `<span class="hint" style="grid-column:1/-1;color:var(--warn)">Add a Date column first, then link it here.</span>` : "";
  let f = "";
  if (k.kind === "aging") f = `<label>Count from (start date)${sel("a", dates, k.a)}</label><label>ETA column · red when crossed${sel("eta", dates.filter(c => c.id !== k.a), k.eta, "No ETA")}</label><label>Count<select class="inp" data-ck="days"><option value="work" ${k.days !== "all" ? "selected" : ""}>Working days (Mon–Fri)</option><option value="all" ${k.days === "all" ? "selected" : ""}>All calendar days</option></select></label><label>Stop counting at${sel("b", dates.filter(c => c.id !== k.a), k.b, "Today (stops when closed)")}</label><label>Amber after (days)<input class="inp" type="number" data-ck="warn" value="${esc(k.warn ?? 10)}"></label><label>Red after (days)<input class="inp" type="number" data-ck="alert" value="${esc(k.alert ?? 20)}"></label>`;
  else if (k.kind === "due") f = `<label>Due date${sel("a", dates, k.a)}</label><label>Amber when days left ≤<input class="inp" type="number" data-ck="warn" value="${esc(k.warn ?? 3)}"></label>`;
  else if (k.kind === "between") f = `<label>From date${sel("a", dates, k.a)}</label><label>To date${sel("b", dates, k.b)}</label>`;
  else if (k.kind === "arith") f = `<label>First number${sel("a", nums, k.a)}</label><label>Operation<select class="inp" data-ck="op">${[["+","+ add"],["-","− subtract"],["*","× multiply"],["/","÷ divide"]].map(([v, l]) => `<option value="${v}" ${k.op === v ? "selected" : ""}>${l}</option>`).join("")}</select></label><label>Second number${sel("b", nums, k.b)}</label>`;
  const kindSel = lockKind ? `<input type="hidden" data-ck="kind" value="${k.kind}">` : `<label>Calculation<select class="inp" data-ck="kind">${Object.entries(CALC).map(([v, x]) => `<option value="${v}" ${k.kind === v ? "selected" : ""}>${x.name}</option>`).join("")}</select></label>`;
  return `<div class="cfg">${kindSel}${f}${noDates}</div>`;
}
function readCalc(root) { const k = {}; root.querySelectorAll("[data-ck]").forEach(el => { if (el.value !== "") k[el.dataset.ck] = el.value; }); if (k.warn) k.warn = +k.warn; if (k.alert) k.alert = +k.alert;
  const dateKinds = ["aging","due","between"]; if (dateKinds.includes(k.kind) && !k.a) return null; if ((k.kind === "between" || k.kind === "arith") && (!k.a || !k.b)) return null; return k; }

/* ---------- Add column ---------- */
function openAddColumn(preset, fromDate) {
  const sh = S.sheets[S.sheetId]; if (!sh) return;
  const cols = sh.columns || [];
  const CHO = {select: ["Dropdown", "Pick from a list"], text: ["Free text", "One line"], long: ["Long text / notes", "Remarks, updates"], date: ["Date", "Calendar picker"], number: ["Number", "Sr. no, counts"], aging: ["Aging", "Working days, ETA alert"], calc: ["Other formula", "Due countdown, maths"]};
  const firstDate = fromDate || cols.find(c => c.type === "date")?.id;
  const etaGuess = cols.find(c => c.type === "date" && c.id !== firstDate && /eta|due|target|closure|expected/i.test(c.label))?.id;
  let t0 = preset || "select";
  openDialog({
    eyebrow: sh.name, title: preset === "aging" ? "Add an aging column" : "Add a column", saveLabel: "Add column",
    body: () => `
      <div class="field"><label for="ac_name">Column name</label><input class="inp" id="ac_name" value="${preset === "aging" ? "Aging" : ""}" placeholder="e.g. Priority, Bank SPOC, Go-live date"></div>
      <div class="field"><span class="lbl">Entry type</span><div class="choices" id="ac_types">${Object.entries(CHO).map(([k, [l, h]]) => `<button type="button" class="choice" data-v="${k}" aria-pressed="${k === t0}"><b>${l}</b><span>${h}</span></button>`).join("")}</div></div>
      <div class="field" id="ac_optsf" ${t0 === "select" ? "" : "hidden"}><label for="ac_opts">Dropdown options <span class="typ">one per line</span></label><textarea class="inp" id="ac_opts" rows="4" placeholder="Open&#10;WIP&#10;Blocker&#10;Closed"></textarea><span class="hint">You can also add a new option later while filling an entry.</span></div>
      <div class="field" id="ac_agingf" ${t0 === "aging" ? "" : "hidden"}><span class="lbl">Aging set-up</span><div id="ac_aging">${calcCfgHTML({kind: "aging", a: firstDate, eta: etaGuess}, cols, null, true)}</div><span class="hint">Counts Monday to Friday after the start date, up to today, skipping dates in the tracker's holiday calendar. Rows whose ETA has passed turn red and move to the top.</span></div>
      <div class="field" id="ac_calcf" ${t0 === "calc" ? "" : "hidden"}><span class="lbl">How to calculate</span><div id="ac_calc">${calcCfgHTML({kind: "due", a: firstDate}, cols)}</div></div>
      <div class="field"><label for="ac_pos">Place it</label><select class="inp" id="ac_pos"><option value="${cols.length}">At the end</option>${cols.map((c, i) => `<option value="${i + 1}" ${fromDate === c.id ? "selected" : ""}>After “${esc(c.label)}”</option>`).join("")}<option value="0">At the start</option></select></div>`,
    mount: root => {
      const g = root.querySelector("#ac_types"); g.dataset.t = t0; pressGroup(g, ".choice", "t");
      g.addEventListener("pick", () => { const t = g.dataset.t, nm = root.querySelector("#ac_name");
        root.querySelector("#ac_optsf").hidden = t !== "select"; root.querySelector("#ac_agingf").hidden = t !== "aging"; root.querySelector("#ac_calcf").hidden = t !== "calc";
        if (t === "aging" && !nm.value) nm.value = "Aging"; if (t === "calc" && (!nm.value || nm.value === "Aging")) nm.value = CALC[root.querySelector('#ac_calc [data-ck="kind"]').value].name; });
      root.querySelector("#ac_calc").addEventListener("change", e => { if (e.target.dataset.ck === "kind") { const kind = e.target.value; const nm = root.querySelector("#ac_name"); if (!nm.value || Object.values(CALC).some(x => x.name === nm.value)) nm.value = CALC[kind].name; root.querySelector("#ac_calc").innerHTML = calcCfgHTML({kind, a: (kind === "arith" ? cols.find(c => c.type === "number") : cols.find(c => c.type === "date"))?.id}, cols); } });
    },
    onSave: root => {
      const label = root.querySelector("#ac_name").value.trim(); if (!label) { toast("Name the column first"); root.querySelector("#ac_name").focus(); return false; }
      const t = root.querySelector("#ac_types").dataset.t || "text";
      const c = {id: uid("c"), label, type: t === "aging" ? "calc" : t};
      if (t === "select") c.options = [...new Set(root.querySelector("#ac_opts").value.split(/\n|,/).map(s => s.trim()).filter(Boolean))];
      if (t === "aging") { c.calc = readCalc(root.querySelector("#ac_aging")); if (!c.calc) { toast("Pick the date column to count from. Add a Date column first if there isn't one."); return false; } }
      if (t === "calc") { c.calc = readCalc(root.querySelector("#ac_calc")); if (!c.calc) { toast("Pick the columns this calculation uses"); return false; } }
      const next = [...cols]; next.splice(+root.querySelector("#ac_pos").value, 0, c);
      store.put("sheets", S.sheetId, {...sh, columns: next}); toast(`Column “${label}” added`); render();
    }
  });
}

/* ---------- Trackers ---------- */
function openTrackerDialog(editId) {
  const t = editId ? curTracker() : null, others = trackerList();
  openDialog({
    eyebrow: t ? "Edit tracker" : "New tracker", title: t ? t.name : "Add a bank or client", saveLabel: t ? "Save" : "Create tracker",
    onDelete: t ? async () => {
      const sh = sheetList(t.id), rowIds = Object.entries(S.rows).filter(([, r]) => sh.some(s => s.id === r.sheetId)).map(([id]) => id);
      await pool(rowIds.map(id => () => store.del("rows", id))); await pool(sh.map(s => () => store.del("sheets", s.id))); await pool(Object.entries(S.dashboards || {}).filter(([, d]) => d.trackerId === t.id).map(([id]) => () => store.del("dashboards", id)));
      if (S.trackers[t.id]) await store.del("trackers", t.id);
      toast(`${t.name} deleted`); setTracker(trackerList()[0]?.id || "");
    } : null,
    deleteLabel: "Delete tracker", confirmLabel: t ? `Delete ${t.name}, its ${sheetList(t.id).length} sheets and entries?` : "",
    body: () => `
      <div class="field"><label for="tk_name">Bank / client name</label><input class="inp" id="tk_name" value="${esc(t?.name || "")}" placeholder="e.g. SCB, Standard Chartered Bank"></div>
      <div class="field"><label for="tk_short">Short code <span class="typ">shown on the badge</span></label><input class="inp" id="tk_short" maxlength="4" style="max-width:140px;text-transform:uppercase;font-family:var(--f-mono)" value="${esc(t?.short || "")}" placeholder="SCB"></div>
      ${t ? "" : `<div class="field"><span class="lbl">Start with</span><div class="choices" id="tk_start">
        <button type="button" class="choice" data-v="empty" aria-pressed="${!others.length}"><b>Empty tracker</b><span>Add sheets yourself</span></button>
        ${others.length ? `<button type="button" class="choice" data-v="copy" aria-pressed="true"><b>Copy sheet structure</b><span>Same sheets &amp; columns, no entries</span></button>` : ""}
        <button type="button" class="choice" data-v="standard" aria-pressed="false"><b>Standard bank set</b><span>Issues, API checklist, MOM actions</span></button></div></div>
      ${others.length ? `<div class="field" id="tk_fromf"><label for="tk_from">Copy from</label><select class="inp" id="tk_from">${others.map(o => `<option value="${esc(o.id)}" ${o.id === S.trackerId ? "selected" : ""}>${esc(o.name)} (${sheetList(o.id).length} sheets)</option>`).join("")}</select></div>` : ""}`}`,
    mount: root => {
      const nm = root.querySelector("#tk_name"), sc = root.querySelector("#tk_short");
      nm.addEventListener("input", () => { if (!sc.dataset.touched) sc.value = shortOf(nm.value); }); sc.addEventListener("input", () => sc.dataset.touched = "1");
      const g = root.querySelector("#tk_start"); if (g) { g.dataset.s = others.length ? "copy" : "empty"; pressGroup(g, ".choice", "s"); g.addEventListener("pick", () => { const f = root.querySelector("#tk_fromf"); if (f) f.hidden = g.dataset.s !== "copy"; }); }
    },
    onSave: async root => {
      const name = root.querySelector("#tk_name").value.trim(); if (!name) { toast("Enter the bank or client name"); return false; }
      const short = (root.querySelector("#tk_short").value.trim() || shortOf(name)).toUpperCase().slice(0, 4);
      if (t) { await store.put("trackers", t.id, {...(S.trackers[t.id] || {}), name, short, order: t.order ?? 0, color: trackerColor(t)}); toast("Tracker updated"); render(); return; }
      const id = uid("t"), order = trackerList().reduce((m, x) => Math.max(m, x.order || 0), 0) + 1;
      await store.put("trackers", id, {name, short, order, color: TCOLORS[trackerList().length % TCOLORS.length]});
      const mode = root.querySelector("#tk_start")?.dataset.s || "empty";
      let made = 0;
      if (mode === "copy") { const from = root.querySelector("#tk_from").value; const src = sheetList(from); await pool(src.map((s, i) => () => store.put("sheets", uid("s") + i, {name: s.name, note: "", order: i + 1, columns: (s.columns || []).map(c => ({...c, options: [...(c.options || [])]})), trackerId: id}))); made = src.length; }
      if (mode === "standard") { const ks = ["issues", "api", "mom"]; await pool(ks.map((k, i) => () => store.put("sheets", uid("s") + i, {name: TEMPLATES[k].name, note: "", order: i + 1, columns: tplCols(k).map(({id, label, type, options}) => type === "select" ? {id, label, type, options} : {id, label, type}), trackerId: id}))); made = ks.length; }
      setTracker(id); toast(`${name} tracker ready${made ? ` with ${made} sheets` : ""}`);
    }
  });
}

/* ---------- Download ---------- */
let DL = undefined; // undefined = not checked yet, null = unavailable
DL = {save: async ({filename, data}) => { const blob = data instanceof Blob ? data : new Blob([data], {type: /\.json$/.test(filename) ? "application/json" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); return {status: "saved"}; }};
const dlReady = Promise.resolve(DL);
const isDoneX = (sh, r) => { const sc = statusCol(sh); return sc ? tone((r.cells || {})[sc.id]) === "good" : null; };
const pickRows = (s, mode) => rowsOf(s.id).filter(r => mode === "all" || (mode === "red" ? (r.imp || rowState(s, r).breach) : isDoneX(s, r) === null || isDoneX(s, r) === (mode === "done")));
function openExport(preset) {
  const trks = trackerList();
  const checked = new Set(preset === "sheet" ? [S.sheetId] : sheetList().map(s => s.id));
  openDialog({
    eyebrow: "Download", title: "Download as Excel", saveLabel: "Download Excel",
    body: () => `
      <div id="dl_state"></div>
      <div class="field"><span class="lbl">Sheets <span class="typ">pick a whole tracker or single sheets</span></span>
      ${trks.map(t => { const sh = sheetList(t.id); if (!sh.length) return ""; return `<div class="group" data-g="${esc(t.id)}">
        <label class="ck head"><input type="checkbox" data-grp="${esc(t.id)}"> ${esc(t.name)} <span class="n">${sh.length} sheets</span></label>
        <div class="kids">${sh.map(s => `<label class="ck"><input type="checkbox" data-sh="${esc(s.id)}" ${checked.has(s.id) ? "checked" : ""}> ${esc(s.name)} <span class="n">${rowsOf(s.id).length}</span></label>`).join("")}</div></div>`; }).join("")}</div>
      <div class="field"><span class="lbl">Which entries</span><div class="choices" id="ex_rows">
        <button type="button" class="choice" data-v="all" aria-pressed="true"><b>All entries</b><span>Everything in the sheet</span></button>
        <button type="button" class="choice" data-v="done" aria-pressed="false"><b>Completed only</b><span>Closed, Done, Completed, Yes</span></button>
        <button type="button" class="choice" data-v="open" aria-pressed="false"><b>Open only</b><span>WIP, pending, blockers</span></button>
        <button type="button" class="choice" data-v="red" aria-pressed="false"><b>Red items only</b><span>Important + ETA crossed</span></button></div></div>
      <div class="banner" id="ex_sum"></div>
      <span class="hint">Edit the file in Excel and upload it back with <b>Import Excel</b>: changed cells update the matching entries and new rows are added. Keep the hidden Row ID column.</span>`,
    mount: root => {
      const g = root.querySelector("#ex_rows"); g.dataset.r = "all"; pressGroup(g, ".choice", "r");
      const sel = () => [...root.querySelectorAll("[data-sh]:checked")].map(k => k.dataset.sh);
      const sync = () => {
        root.querySelectorAll("[data-grp]").forEach(h => { const ks = [...root.querySelectorAll(`[data-g="${CSS.escape(h.dataset.grp)}"] [data-sh]`)]; const n = ks.filter(k => k.checked).length; h.checked = n === ks.length; h.indeterminate = n > 0 && n < ks.length; });
        const ids = sel(), n = ids.reduce((m, id) => m + pickRows({id, ...S.sheets[id]}, g.dataset.r).length, 0);
        root.querySelector("#ex_sum").textContent = ids.length ? `${ids.length} sheet${ids.length > 1 ? "s" : ""} · ${n} entries · formatted workbook with a summary tab, coloured statuses, filters on every header, and red rows for important / ETA-crossed items.` : "Pick at least one sheet.";
        $("#dSave").disabled = !ids.length;
      };
      root.addEventListener("change", e => { if (e.target.dataset.grp) root.querySelectorAll(`[data-g="${CSS.escape(e.target.dataset.grp)}"] [data-sh]`).forEach(k => k.checked = e.target.checked); sync(); });
      g.addEventListener("pick", sync); sync();
      const showState = async () => {
        await dlReady; const box = root.querySelector("#dl_state"); if (!box || DL) return;
        let perm = null, st = "unavailable"; try { perm = await window.claude?.use?.("permissions"); st = perm ? await perm.state("downloads") : "unavailable"; } catch (e) {}
        box.innerHTML = `<div class="dlwarn"><b>Saving files isn't available where this page is open right now.</b>
          <span>${st === "denied" ? "Downloads were turned off for this page. Allow them, then try again." : "This happens in some embedded or preview views. Open the tracker in the Claude app or on claude.ai and download from there."} Meanwhile you can copy the selected sheets and paste them straight into Excel.</span>
          <div class="row2" style="flex:none">${st === "denied" && perm ? `<button class="btn" type="button" id="dl_allow">Allow downloads</button>` : ""}<button class="btn" type="button" id="dl_copy">Copy for Excel</button></div></div>`;
        box.querySelector("#dl_allow")?.addEventListener("click", async () => { try { await perm.manage(); } catch (e) { toast("Open the page's Permissions menu to allow downloads"); } });
        box.querySelector("#dl_copy").addEventListener("click", () => copyForExcel(sel(), g.dataset.r));
      };
      showState();
    },
    onSave: async root => {
      const ids = [...root.querySelectorAll("[data-sh]:checked")].map(k => k.dataset.sh), mode = root.querySelector("#ex_rows").dataset.r;
      $("#dSave").disabled = false;
      if (!ids.length) return false;
      return await exportXlsx(ids, mode);
    }
  });
}
function exportValue(s, c, r) {
  if (c.type === "calc") { const v = calcCell(s, c, r); return ["aging","between","serial","arith"].includes(c.calc?.kind) && v.n != null ? v.n : v.text; }
  return (r.cells || {})[c.id] || "";
}
function copyForExcel(ids, mode) {
  const parts = ids.map(id => { const s = {id, ...S.sheets[id]}, cols = s.columns || [];
    const lines = [cols.map(c => c.label).join("\t"), ...pickRows(s, mode).map(r => cols.map(c => String(exportValue(s, c, r)).replace(/\t/g, " ").replace(/\r?\n/g, " | ")).join("\t"))];
    return (ids.length > 1 ? s.name + "\n" : "") + lines.join("\n"); });
  const text = parts.join("\n\n");
  const fallback = () => { const ta = document.createElement("textarea"); ta.value = text; ta.style.cssText = "position:fixed;opacity:0"; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); toast("Copied. Paste into Excel"); } catch (e) { toast("Copy blocked by this view"); } ta.remove(); };
  try { navigator.clipboard.writeText(text).then(() => toast("Copied. Paste into Excel with Ctrl+V"), fallback); } catch (e) { fallback(); }
}
/* Excel builder with styles (xlsx-js-style) */
const XC = {ink:"10231F", head:"0C5E48", headLine:"0A4A39", line:"D3DED9", zebra:"F4F8F6", muted:"5A6E68",
  tone:{good:["DDF3E8","167E57"], warn:["FCEBCC","A6640A"], bad:["FBE0DD","BF3A31"], info:["E0E9F8","2F5DA8"], neu:["E7ECEA","5D6D69"]}};
const border = (rgb) => ({top:{style:"thin",color:{rgb}}, bottom:{style:"thin",color:{rgb}}, left:{style:"thin",color:{rgb}}, right:{style:"thin",color:{rgb}}});
const xlDate = v => { const d = parseD(v); return d ? (Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(1899, 11, 30)) / 86400000 : null; };
function buildWS(s, rows, trk) {
  const cols = s.columns || [], states = new Map(rows.map(r => [r.id, rowState(s, r)]));
  const hasFlag = rows.some(r => states.get(r.id).imp || states.get(r.id).breach);
  const out = (hasFlag ? [{id: "__flag", label: "Flag", type: "flag"}] : []).concat(cols).concat([{id: "__rid", label: "Row ID", type: "rid"}]);
  const W = {flag: 14, long: 55, text: 26, select: 18, date: 14, number: 9, calc: 18, rid: 12};
  const N = out.length, aoa = [], merges = [], heights = [];
  const C = (v, st, extra) => Object.assign({v, t: typeof v === "number" ? "n" : "s", s: st}, extra || {});
  aoa.push([C(s.name, {font: {bold: true, sz: 16, color: {rgb: XC.ink}}})]); heights.push({hpt: 26}); merges.push({s: {r: 0, c: 0}, e: {r: 0, c: N - 1}});
  aoa.push([C(`${trk?.name || ""} · Exported ${fmtDate(todayISO())} · ${rows.length} entries`, {font: {italic: true, sz: 10, color: {rgb: XC.muted}}})]); heights.push({hpt: 16}); merges.push({s: {r: 1, c: 0}, e: {r: 1, c: N - 1}});
  if (s.note) { const r = aoa.length; aoa.push([C("Note: " + s.note, {fill: {fgColor: {rgb: "FCEBCC"}}, font: {sz: 10, color: {rgb: "6B4A0F"}}, alignment: {wrapText: true, vertical: "top"}})]); merges.push({s: {r, c: 0}, e: {r, c: N - 1}}); heights.push({hpt: Math.min(90, 16 * Math.ceil(s.note.length / Math.max(60, out.reduce((m, c) => m + (W[c.type] || 18), 0) * 1.1)))}); }
  aoa.push([]); heights.push({hpt: 6});
  const hr = aoa.length;
  aoa.push(out.map(c => C(c.type === "calc" && c.calc?.kind === "aging" ? `${c.label} (${c.calc.days === "all" ? "days" : "working days"})` : c.label, {fill: {fgColor: {rgb: XC.head}}, font: {bold: true, sz: 11, color: {rgb: "FFFFFF"}}, alignment: {wrapText: true, vertical: "center", horizontal: "center"}, border: border(XC.headLine)})));
  heights.push({hpt: 30});
  rows.forEach((r, i) => {
    const st = states.get(r.id), redFill = st.imp ? "FBE0DD" : st.breach ? "FDEEEE" : (i % 2 ? XC.zebra : "FFFFFF");
    let lines = 1;
    aoa.push(out.map(c => {
      const base = {fill: {fgColor: {rgb: redFill}}, border: border(XC.line), alignment: {wrapText: true, vertical: "top"}, font: {sz: 10, color: {rgb: XC.ink}}};
      if (c.type === "rid") return C(r.id, {font: {sz: 8, color: {rgb: "9AA5A2"}}});
      if (c.type === "flag") return C(st.imp ? "IMPORTANT" : st.breach ? "ETA CROSSED" : "", {...base, font: {sz: 9, bold: true, color: {rgb: "BF3A31"}}, alignment: {vertical: "top", horizontal: "center"}});
      const raw = (r.cells || {})[c.id] ?? "";
      if (c.type === "date") { const n = xlDate(raw); const late = st.breach && st.etaCols.has(c.id); return n == null ? C(raw, base) : C(n, {...base, numFmt: "dd-mmm-yyyy", alignment: {vertical: "top", horizontal: "center"}, font: {sz: 10, bold: late, color: {rgb: late ? "BF3A31" : XC.ink}}}, {z: "dd-mmm-yyyy"}); }
      if (c.type === "number") { const n = parseFloat(raw); return isNaN(n) ? C(raw, base) : C(n, {...base, alignment: {vertical: "top", horizontal: "center"}}); }
      if (c.type === "select") { if (!raw) return C("", base); const [bg, fg] = XC.tone[tone(raw)]; return C(raw, {...base, fill: {fgColor: {rgb: bg}}, font: {sz: 10, bold: true, color: {rgb: fg}}, alignment: {vertical: "top", horizontal: "center", wrapText: true}}); }
      if (c.type === "calc") { const v = calcCell(s, c, r), val = exportValue(s, c, r); if (val === "" || val == null) return C("", base); const tc = v.t === "plain" ? null : XC.tone[v.t]; return C(val, {...base, ...(tc ? {fill: {fgColor: {rgb: tc[0]}}, font: {sz: 10, bold: true, color: {rgb: tc[1]}}} : {}), alignment: {vertical: "top", horizontal: "center"}}); }
      const text = String(raw); lines = Math.max(lines, text.split("\n").reduce((m, l) => m + Math.max(1, Math.ceil(l.length / ((W[c.type] || 20) * 1.15))), 0));
      return C(text, base);
    }));
    heights.push({hpt: Math.min(180, Math.max(18, 13.5 * lines + 4))});
  });
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!merges"] = merges; ws["!rows"] = heights; ws["!cols"] = out.map(c => c.type === "rid" ? {wch: 12, hidden: true} : {wch: W[c.type] || 18});
  if (rows.length) ws["!autofilter"] = {ref: XLSX.utils.encode_range({s: {r: hr, c: 0}, e: {r: hr + rows.length, c: N - 1}})};
  return ws;
}
function buildSummary(list, mode, tmap) {
  const head = ["Tracker", "Sheet", "Entries", "Important", "ETA crossed", "Completed", "Open"];
  const hs = {fill: {fgColor: {rgb: XC.head}}, font: {bold: true, color: {rgb: "FFFFFF"}}, alignment: {horizontal: "center", vertical: "center"}, border: border(XC.headLine)};
  const aoa = [[{v: "Tracker export", t: "s", s: {font: {bold: true, sz: 16}}}], [{v: `Exported ${fmtDate(todayISO())}${mode !== "all" ? ` · ${({done: "Completed only", open: "Open only", red: "Red items only"})[mode]}` : ""}`, t: "s", s: {font: {italic: true, sz: 10, color: {rgb: XC.muted}}}}], [], head.map(h => ({v: h, t: "s", s: hs}))];
  list.forEach(({s, rows}, i) => {
    const st = rows.map(r => rowState(s, r)), done = rows.filter(r => isDoneX(s, r) === true).length;
    const vals = [tmap[tid(s)]?.name || "", s.name, rows.length, st.filter(x => x.imp).length, st.filter(x => x.breach).length, done, rows.length - done];
    aoa.push(vals.map((v, j) => ({v, t: typeof v === "number" ? "n" : "s", s: {border: border(XC.line), fill: {fgColor: {rgb: i % 2 ? XC.zebra : "FFFFFF"}}, alignment: {horizontal: j > 1 ? "center" : "left"}, font: {bold: (j === 3 || j === 4) && v > 0, color: {rgb: (j === 3 || j === 4) && v > 0 ? "BF3A31" : XC.ink}}}})));
  });
  const ws = XLSX.utils.aoa_to_sheet(aoa); ws["!cols"] = [{wch: 22}, {wch: 34}, {wch: 10}, {wch: 12}, {wch: 13}, {wch: 12}, {wch: 10}]; ws["!rows"] = [{hpt: 26}, {hpt: 16}, {hpt: 6}, {hpt: 24}];
  return ws;
}
async function exportXlsx(ids, mode) {
  if (!window.XLSX) { toast("The Excel writer didn't load. Check your connection."); return false; }
  const wb = XLSX.utils.book_new(), used = new Set(["Summary", "_tracker_meta"]), meta = [];
  const trkIds = new Set(ids.map(id => tid(S.sheets[id]))), multi = trkIds.size > 1;
  const tmap = Object.fromEntries(trackerList().map(t => [t.id, t]));
  const list = allSheets().filter(s => ids.includes(s.id)).sort((a, b) => (tmap[tid(a)]?.order ?? 0) - (tmap[tid(b)]?.order ?? 0)).map(s => ({s, rows: (() => { const rs = pickRows(s, mode), st = new Map(rs.map(r => [r.id, rowState(s, r)])); return rs.sort((a, b) => (st.get(a.id).imp ? 0 : st.get(a.id).breach ? 1 : 2) - (st.get(b.id).imp ? 0 : st.get(b.id).breach ? 1 : 2)); })()}));
  if (list.length > 1) XLSX.utils.book_append_sheet(wb, buildSummary(list, mode, tmap), "Summary");
  for (const {s, rows} of list) {
    const t = tmap[tid(s)], base = (multi ? `${t?.short || shortOf(t?.name)} - ` : "") + s.name;
    let nm = base.replace(/[\\\/\?\*\[\]:]/g, " ").slice(0, 31).trim() || "Sheet", k = 2; while (used.has(nm)) nm = nm.slice(0, 28) + " " + k++; used.add(nm);
    XLSX.utils.book_append_sheet(wb, buildWS(s, rows, t), nm); meta.push([nm, s.id, tid(s)]);
  }
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["tab", "sheetId", "trackerId", "note"], ...meta.map(m => [...m, "Used by Bank Project Tracker to upload edits back. Don't change."])]), "_tracker_meta");
  wb.Workbook = {Sheets: wb.SheetNames.map(n => ({Hidden: n === "_tracker_meta" ? 1 : 0}))};
  const data = new Uint8Array(XLSX.write(wb, {bookType: "xlsx", type: "array", cellStyles: true}));
  const one = ids.length === 1 ? S.sheets[ids[0]].name : null, t0 = tmap[[...trkIds][0]];
  const label = (multi ? "All_Trackers" : `${t0?.short || shortOf(t0?.name)}_${one ? one : "Tracker"}`) + ({done: "_Completed", open: "_Open", red: "_Red_items"}[mode] || "");
  const fname = `${label.replace(/[^\w\- ]+/g, "").replace(/\s+/g, "_")}_${todayISO()}.xlsx`;
  await dlReady;
  if (!DL) { toast("Saving files isn't available in this view. Use Copy for Excel."); return false; }
  try { await DL.save({filename: fname, data}); toast("Workbook saved"); return true; }
  catch (e) { if (e.code !== "declined") toast("Couldn't save the file (" + (e.code || "error") + ")"); return e.code === "declined"; }
}

/* ---------- Global events ---------- */
document.addEventListener("click", e => {
  if (!e.target.closest(".trk")) { $("#trkPop").hidden = true; $("#trkBtn").setAttribute("aria-expanded", "false"); }
  const b = e.target.closest("[data-sheet],[data-home],[data-open],[data-act],[data-layout],[data-filter],[data-sort],[data-trk],[data-fedit],[data-fdel],[data-imp],[data-colmenu],[data-rmksum],td[data-cell]");
  if (!b || b.closest("#drawer") || b.closest("#modal") || b.closest("#dlg")) { if (!e.target.closest(".menu")) $("#sheetMenu")?.setAttribute("hidden", ""); return; }
  if (!b.closest(".menu")) $("#sheetMenu")?.setAttribute("hidden", "");
  if (b.closest("#trkPop")) $("#trkPop").hidden = true;
  if (b.dataset.rmksum !== undefined) { openRemarkSummaryPop(b); }
  else if (b.dataset.cell) { if (!(CP && b.classList.contains("editing"))) openCellPop(b); }
  else if (b.dataset.imp) { e.stopPropagation(); toggleImp(b.dataset.imp); }
  else if (b.dataset.colmenu) { if (CM && CM.colId === b.dataset.colmenu) closeColMenu(); else openColMenu(b.dataset.colmenu, b); }
  else if (b.dataset.trk) setTracker(b.dataset.trk);
  else if (b.dataset.home !== undefined) { S.view = "home"; S.sheetId = null; S.q = ""; render(); window.scrollTo(0, 0); }
  else if (b.dataset.sheet) { if (S.sheetId !== b.dataset.sheet) { S.q = ""; } S.view = "sheet"; S.sheetId = b.dataset.sheet; render(); window.scrollTo(0, 0); }
  else if (b.dataset.open) { const r = S.rows[b.dataset.open]; if (r) openDrawer(r.sheetId, b.dataset.open); }
  else if (b.dataset.layout) { S.layout[S.sheetId] = b.dataset.layout; try { localStorage.setItem("bcp-layout", JSON.stringify(S.layout)); } catch (e) {} render(); }
  else if (b.dataset.filter !== undefined) {
    const v = b.dataset.filter, col = b.dataset.col, list = S.filters[S.sheetId] || [], i = list.findIndex(f => f.col === col && f.op === "in");
    if (i < 0) list.push({col, op: "in", val: [v]});
    else { const vals = new Set(list[i].val); vals.has(v) ? vals.delete(v) : vals.add(v); if (vals.size) list[i] = {...list[i], val: [...vals]}; else list.splice(i, 1); }
    S.filters[S.sheetId] = list; saveFilters(); render();
  }
  else if (b.dataset.fedit !== undefined) openFilter(+b.dataset.fedit);
  else if (b.dataset.fdel !== undefined) { (S.filters[S.sheetId] || []).splice(+b.dataset.fdel, 1); saveFilters(); render(); }
  else if (b.dataset.sort) { const c = b.dataset.sort; S.sort = S.sort && S.sort.sheet === S.sheetId && S.sort.col === c ? (S.sort.dir > 0 ? {...S.sort, dir: -1} : null) : {sheet: S.sheetId, col: c, dir: 1}; render(); }
  else switch (b.dataset.act) {
    case "add": openDrawer(S.sheetId, null); break;
    case "newsheet": openModal(null); break;
    case "import": $("#fileIn").click(); break;
    case "importx": closeModal(); $("#fileIn").click(); break;
    case "cmdk": openCmdk(); break;
    case "share": openShares(); break;
    case "keys": openKeys(); break;
    case "export": openExport(S.view === "sheet" ? "sheet" : "tracker"); break;
    case "exportone": openExport("sheet"); break;
    case "addcol": openAddColumn(); break;
    case "theme": openThemeDialog(); break;
    case "newtracker": openTrackerDialog(null); break;
    case "edittracker": openTrackerDialog(S.trackerId); break;
    case "clear": S.q = ""; S.filters[S.sheetId] = []; S.onlyRed[S.sheetId] = false; saveFilters(); render(); break;
    case "filter": openFilter(null); break;
    case "addaging": openAddColumn("aging"); break;
    case "toggleside": toggleSide(); break;
    case "fullscreen": toggleFull(); break;
    case "noteedit": S.noteEdit = S.sheetId; render(); break;
    case "notecancel": S.noteEdit = null; render(); break;
    case "notesave": saveNote(false); break;
    case "noteclear": saveNote(true); break;
    case "onlyred": S.onlyRed[S.sheetId] = !S.onlyRed[S.sheetId]; render(); break;
    case "markred": { const sh = {id: S.sheetId, ...S.sheets[S.sheetId]}; const ids = rowsOf(sh.id).filter(r => !r.imp && rowState(sh, r).breach).map(r => r.id), sn = snap("rows", ids); pool(ids.map(id => () => store.put("rows", id, {...S.rows[id], imp: true}))).then(() => { render(); pushUndo(`${ids.length} marked important`, sn); }); break; }
    case "paste": openPaste(""); break;
    case "holidays": openHolidays(); break;
    case "backup": openBackup(); break;
    case "splitsec": splitExistingSheet(); break;
    case "gsave": saveGrid(); break;
    case "ai": openAI(); break;
    case "remarkset": openRemarkSettings(); break;
    case "assignset": openAssigneeSettings(); break;
    case "statusset": openStatusSettings(); break;
    case "cardset": openCardSettings(); break;
    case "workflow": openWorkflow(); break;
    case "people": openPeople(); break;
    case "fmt": openFormat(); break;
    case "addrow": addRowInline(); break;
    case "addcolq": openQuickCol(b); break;
    case "gdiscard": S.gedits[S.sheetId] = {}; S.gnew[S.sheetId] = []; render(); toast("Unsaved changes discarded"); break;
    case "xlupdate": $("#fileIn").click(); break;
    case "bulkset": openBulkSet(); break;
    case "bulkimp": case "bulkunimp": bulkUpdate(r => ({...r, imp: b.dataset.act === "bulkimp"}), b.dataset.act === "bulkimp" ? "marked important" : "unmarked"); break;
    case "bulkdel": bulkDelete(); break;
    case "bulkclear": S.sel.clear(); render(); break;
    case "attn": { const r = S.rows[b.dataset.row]; if (r) { S.view = "sheet"; S.sheetId = r.sheetId; render(); openDrawer(r.sheetId, b.dataset.row); } break; }
    case "sheetmenu": $("#sheetMenu").toggleAttribute("hidden"); break;
    case "editsheet": openModal(S.sheetId); break;
    case "delsheet": openModal(S.sheetId); setTimeout(() => $("#mDelete").click(), 0); break;
    case "dupsheet": { const s = S.sheets[S.sheetId], id = uid("s"); store.put("sheets", id, {...s, name: s.name + " (copy)", order: (s.order || 0) + .5}); S.sheetId = id; toast("Empty copy of the sheet created"); render(); break; }
  }
});
document.addEventListener("change", e => {
  const id = e.target.dataset?.selrow; if (!id) return;
  e.target.checked ? S.sel.add(id) : S.sel.delete(id); render();
});
document.addEventListener("click", e => { if (e.target.closest?.(".rowck")) e.stopPropagation(); }, true);
$("#sideScrim").onclick = closeSideDrawer;
document.addEventListener("click", e => { if (narrow() && e.target.closest(".side [data-sheet], .side [data-dash], .side [data-home], .side [data-trk], .side #addSheetBtn, .side [data-act]")) setTimeout(closeSideDrawer, 0); });
$("#addSheetBtn").onclick = () => curTracker() ? openModal(null) : openTrackerDialog(null);
$("#trkBtn").onclick = () => { const p = $("#trkPop"); p.hidden = !p.hidden; $("#trkBtn").setAttribute("aria-expanded", String(!p.hidden)); };
document.addEventListener("keydown", e => {
  if (e.target.matches?.("tr[data-row]") && e.key === "Enter") { openDrawer(S.rows[e.target.dataset.row]?.sheetId, e.target.dataset.row); return; }
  if (e.key === "Escape" && S.full && !document.fullscreenElement && !CM && !CP && !gridHasFocus() && $("#dlg").hidden && $("#modal").hidden && !drawerOpen()) { toggleFull(); return; }
  if (e.key === "Escape" && CP) { closeCellPop(); return; }
  if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === "z" || e.key === "Z") && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName) && $("#dlg").hidden && $("#modal").hidden && !drawerOpen()) { e.preventDefault(); doUndo(); return; }
  if (e.key === "Escape") { if (CM) closeColMenu(); else if (!$("#dlg").hidden) closeDialog(); else if (!$("#modal").hidden) closeModal(); else if (drawerOpen()) closeDrawer(); return; }
  if (drawerOpen() && e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); saveDrawer(false); return; }
  const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName) || drawerOpen() || !$("#modal").hidden || !$("#dlg").hidden;
  if (typing) return;
  if ((e.key === "n" || e.key === "N") && S.view === "sheet") { e.preventDefault(); openDrawer(S.sheetId, null); }
  if (e.key === "[") { e.preventDefault(); toggleSide(); }
  if (e.key === "f" || e.key === "F") { e.preventDefault(); toggleFull(); }
  if (S.view === "sheet" && e.altKey && (e.key === "ArrowRight" || e.key === "ArrowLeft")) { const l = sheetList(), i = l.findIndex(x => x.id === S.sheetId), n = l[(i + (e.key === "ArrowRight" ? 1 : -1) + l.length) % l.length]; if (n) { e.preventDefault(); S.sheetId = n.id; S.q = ""; render(); } }
  if (e.key === "/" && $("#q")) { e.preventDefault(); $("#q").focus(); }
});

/* ---------- Command palette (Ctrl+K) ---------- */
let CK = null;
function runAct(a) { const b = document.createElement("button"); b.type = "button"; b.dataset.act = a; b.hidden = true; document.body.append(b); b.click(); b.remove(); }
function ckActions() {
  const inSheet = S.view === "sheet" && S.sheets[S.sheetId], ct = curTracker();
  return [
    inSheet && ["New entry", "add", "N"], ["New sheet", "newsheet"], ["New dashboard (AI suggestions)", "newdash"], ["Import sheets from Excel", "import"], ["Download Excel", "export"],
    inSheet && ["Filter this sheet", "filter"], inSheet && ["Format table", "fmt"], ["Theme & appearance", "theme"], ["Full screen", "fullscreen", "F"],
    ct && [`Status workflow for ${ct.name}`, "workflow"], ct && [`People & owners for ${ct.name}`, "people"], ct && [`Holiday calendar for ${ct.name}`, "holidays"],
    ["Share sheets (view-only link)", "share"], ["New tracker (another bank)", "newtracker"], ["Keyboard shortcuts", "keys", "?"], AI_ON && ["Ask AI", "ai"]
  ].filter(Boolean).map(([label, act, k]) => ({kind: "act", label, act, k}));
}
function openCmdk() {
  if (!$("#cmdk")) { const d = document.createElement("div"); d.id = "cmdk"; d.className = "cmdk"; d.hidden = true; d.innerHTML = `<div class="cmdk-box" role="dialog" aria-label="Search everything"><div class="cmdk-in">${ICON.search}<input id="cmdkIn" autocomplete="off" spellcheck="false"><label class="cmdk-all"><input type="checkbox" id="cmdkAll"> All projects</label></div><div class="cmdk-list" id="cmdkList" role="listbox"></div><div class="cmdk-foot"><span><span class="kbd">↑</span><span class="kbd">↓</span> move</span><span><span class="kbd">Enter</span> open</span><span><span class="kbd">Esc</span> close</span></div></div>`; document.body.append(d);
    d.addEventListener("mousedown", e => { if (e.target === d) closeCmdk(); });
    $("#cmdkIn").addEventListener("input", () => { CK.sel = 0; drawCmdk(); });
    $("#cmdkAll").addEventListener("change", () => { CK.sel = 0; drawCmdk(); $("#cmdkIn").focus(); });
    $("#cmdkIn").addEventListener("keydown", e => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); const n = CK.items.length; if (n) { CK.sel = (CK.sel + (e.key === "ArrowDown" ? 1 : -1) + n) % n; paintSel(); } }
      else if (e.key === "Enter") { e.preventDefault(); pickCmdk(CK.items[CK.sel]); }
      else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); closeCmdk(); }
    });
    $("#cmdkList").addEventListener("click", e => { const b = e.target.closest("[data-ck]"); if (b) pickCmdk(CK.items[+b.dataset.ck]); });
    $("#cmdkList").addEventListener("mousemove", e => { const b = e.target.closest("[data-ck]"); if (b && +b.dataset.ck !== CK.sel) { CK.sel = +b.dataset.ck; paintSel(); } });
  }
  const idx = Object.entries(S.rows).map(([id, r]) => { const sh = S.sheets[r.sheetId]; if (!sh) return null; const tc = titleCol(sh), sc = statusCol(sh);
    return {id, sid: r.sheetId, trk: tid(sh), title: (r.cells || {})[tc?.id] || "Untitled entry", status: sc ? (r.cells || {})[sc.id] : "", text: Object.values(r.cells || {}).join(" \u2003 "), low: Object.values(r.cells || {}).join(" ").toLowerCase()}; }).filter(Boolean);
  CK = {idx, sel: 0, items: []};
  $("#cmdkIn").value = ""; $("#cmdkIn").placeholder = `Search ${curTracker()?.name || "entries"}, jump to a sheet, or run an action…`; $("#cmdkAll").checked = false;
  $("#cmdk").hidden = false; drawCmdk(); setTimeout(() => $("#cmdkIn").focus(), 20);
}
function closeCmdk() { if ($("#cmdk")) $("#cmdk").hidden = true; CK = null; }
function hl(text, toks) { let h = esc(text); toks.forEach(t => { if (t.length > 1) h = h.replace(new RegExp("(" + esc(t).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig"), "<mark>$1</mark>"); }); return h; }
function snippet(text, tok) { const i = text.toLowerCase().indexOf(tok); if (i < 0) return text.slice(0, 120); const a = Math.max(0, i - 50); return (a ? "…" : "") + text.slice(a, a + 140) + (a + 140 < text.length ? "…" : ""); }
function drawCmdk() {
  const q = $("#cmdkIn").value.trim().toLowerCase(), toks = q.split(/\s+/).filter(Boolean), all = $("#cmdkAll").checked, ct = curTracker()?.id;
  const sheets = allSheets().filter(sh => (all || tid(sh) === ct) && (!toks.length || toks.every(t => sh.name.toLowerCase().includes(t)))).slice(0, toks.length ? 6 : 8).map(sh => ({kind: "sheet", sh}));
  const acts = ckActions().filter(a => !toks.length || toks.every(t => a.label.toLowerCase().includes(t))).slice(0, toks.length ? 5 : 6);
  const rows = toks.length ? CK.idx.filter(x => (all || x.trk === ct) && toks.every(t => x.low.includes(t))).slice(0, 40).map(x => ({kind: "row", x})) : [];
  CK.items = [...rows, ...sheets, ...acts];
  const grp = (title, list, off) => list.length ? `<div class="ck-h">${title}</div>` + list.map((it, k) => { const i = off + k;
    if (it.kind === "row") { const sh = S.sheets[it.x.sid], tr = trackerList().find(t => t.id === it.x.trk); return `<button type="button" class="ck-it" data-ck="${i}" role="option"><span class="ck-ic">${ICON.edit}</span><span class="ck-main"><b>${hl(it.x.title, toks)}</b><small>${all && tr ? esc(tr.name) + " · " : ""}${esc(sh?.name || "")}${it.x.status ? ` · <span class="pill t-${tone(it.x.status)}">${esc(it.x.status)}</span>` : ""}</small><span class="ck-snip">${hl(snippet(it.x.text, toks[0]), toks)}</span></span></button>`; }
    if (it.kind === "sheet") { const tr = trackerList().find(t => t.id === tid(it.sh)); return `<button type="button" class="ck-it" data-ck="${i}" role="option"><span class="ck-ic"><i class="dot" style="background:${esc(it.sh.color || trackerColor(tr))}"></i></span><span class="ck-main"><b>${hl(it.sh.name, toks)}</b><small>${esc(tr?.name || "")} · ${rowsOf(it.sh.id).length} entries</small></span></button>`; }
    return `<button type="button" class="ck-it" data-ck="${i}" role="option"><span class="ck-ic">›</span><span class="ck-main"><b>${hl(it.label, toks)}</b></span>${it.k ? `<span class="kbd">${esc(it.k)}</span>` : ""}</button>`; }).join("") : "";
  $("#cmdkList").innerHTML = (grp(`Entries${rows.length === 40 ? " (first 40)" : ""}`, rows, 0) + grp("Sheets", sheets, rows.length) + grp("Actions", acts, rows.length + sheets.length)) || `<div class="ck-empty">Nothing matches “${esc(q)}”.${all ? "" : " Tick <b>All projects</b> to search every bank."}</div>`;
  paintSel();
}
function paintSel() { document.querySelectorAll("#cmdkList .ck-it").forEach(b => b.setAttribute("aria-selected", String(+b.dataset.ck === CK.sel))); document.querySelector('#cmdkList .ck-it[aria-selected="true"]')?.scrollIntoView({block: "nearest"}); }
function pickCmdk(it) {
  if (!it) return; closeCmdk();
  if (it.kind === "act") { runAct(it.act); return; }
  const sid = it.kind === "row" ? it.x.sid : it.sh.id, sh = S.sheets[sid]; if (!sh) return;
  if (tid(sh) !== curTracker()?.id) setTracker(tid(sh));
  S.view = "sheet"; S.sheetId = sid; S.q = ""; render(); window.scrollTo(0, 0);
  if (it.kind === "row") { const el = document.getElementById("row-" + it.x.id); if (el) { el.scrollIntoView({block: "center"}); el.classList.add("flash"); setTimeout(() => el.classList.remove("flash"), 1600); } openDrawer(sid, it.x.id); }
}
function openKeys() {
  const K = [["Ctrl K", "Search everything (entries, sheets, actions)"], ["/", "Search this sheet"], ["N", "New entry"], ["Ctrl Enter", "Save the open entry"], ["Esc", "Close a window"], ["[", "Hide / show the side menu"], ["F", "Full screen"], ["Alt → / Alt ←", "Next / previous sheet"], ["Ctrl Z", "Undo"], ["Ctrl V", "Paste rows from Excel"], ["Ctrl S", "Save Excel-style grid edits"]];
  openDialog({eyebrow: "Help", title: "Keyboard shortcuts", saveLabel: "Done", body: () => `<div class="keys">${K.map(([k, d]) => `<div class="keyrow"><span>${k.split(" ").map(x => `<span class="kbd">${esc(x)}</span>`).join(" ")}</span><span>${esc(d)}</span></div>`).join("")}</div>`, onSave: () => {}});
}
document.addEventListener("keydown", e => {
  if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) { e.preventDefault(); e.stopPropagation(); if ($("#cmdk") && !$("#cmdk").hidden) closeCmdk(); else openCmdk(); }
  else if (e.key === "?" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName) && $("#dlg").hidden && $("#modal").hidden && !drawerOpen()) { e.preventDefault(); openKeys(); }
}, true);

/* ---------- Toast + confetti ---------- */
let tT; function toast(msg, withUndo) {
  const t = $("#toast"); t.innerHTML = "✓  " + esc(msg) + (withUndo ? ` <button type="button" id="undoBtn">Undo</button>` : "");
  t.classList.toggle("undo", !!withUndo); t.classList.add("show"); clearTimeout(tT);
  tT = setTimeout(() => t.classList.remove("show", "undo"), withUndo ? 8000 : 2600);
  if (withUndo) $("#undoBtn").onclick = () => doUndo();
}
/* ---------- Undo ---------- */
const UNDO = [];
const clone = o => o == null ? null : JSON.parse(JSON.stringify(o));
function snap(kind, ids) { return ids.map(id => [kind, id, clone(S[kind][id])]); }
function pushUndo(msg, snaps) { UNDO.push({msg, snaps}); if (UNDO.length > 25) UNDO.shift(); toast(msg, true); }
async function doUndo() {
  const u = UNDO.pop(); if (!u) { toast("Nothing to undo"); return; }
  $("#toast").classList.remove("show", "undo");
  const order = k => k === "trackers" ? 0 : k === "sheets" ? 1 : 2;
  const sn = [...u.snaps].sort((a, b) => order(a[0]) - order(b[0]));
  for (const k of ["trackers", "sheets", "rows", "dashboards"]) await pool(sn.filter(x => x[0] === k).map(([kind, id, prev]) => () => prev ? store.put(kind, id, prev) : store.del(kind, id)));
  toast(`Undone: ${u.msg}`); render();
}
function confetti() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const c = $("#confetti"), ctx = c.getContext("2d"); c.width = innerWidth; c.height = innerHeight;
  const cols = ["#0C8565","#3CC99A","#F2A93B","#2F5DA8","#F2857C"];
  const ps = Array.from({length: 120}, () => ({x: innerWidth * (.55 + Math.random() * .4), y: innerHeight * .9, vx: (Math.random() - .6) * 9, vy: -Math.random() * 15 - 6, r: Math.random() * 6 + 3, c: cols[Math.random() * cols.length | 0], a: Math.random() * 6}));
  let f = 0; (function tick() { ctx.clearRect(0, 0, c.width, c.height); ps.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += .45; p.a += .2; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); ctx.restore(); }); if (++f < 90) requestAnimationFrame(tick); else ctx.clearRect(0, 0, c.width, c.height); })();
}

/* ---------- Themes ---------- */
const TK = ["bg","surface","surface-2","line","muted","accent","accent-soft","accent-ink","side","side-ink","side-muted","side-hover","side-active"];
const P = (...v) => Object.fromEntries(TK.map((k, i) => [k, v[i]]));
const SKINS = {
  jade:    {name:"Jade",     mood:"Calm & fresh",   light:P("#F2F6F4","#FFFFFF","#E8EFEC","#D3DED9","#5A6E68","#0C8565","#D5F0E6","#FFFFFF","#0C2A25","#DDEDE8","#8FB0A7","#143A33","#1B4C42"), dark:P("#0A1412","#111E1B","#172925","#24403A","#93AAA3","#3CC99A","#163D33","#06261D","#071110","#D7E8E2","#7E9C94","#0F221F","#16332D")},
  ocean:   {name:"Ocean",    mood:"Clear & focused", light:P("#F1F5FA","#FFFFFF","#E6EDF6","#D0DBE8","#56677D","#1F5FD1","#DCE7FB","#FFFFFF","#0E2142","#DCE6F7","#8DA2C6","#17305A","#1F3E73"), dark:P("#0A101C","#111A2A","#172338","#24344F","#93A3BD","#6EA0FF","#172C52","#08162E","#070C16","#D6E1F5","#7D8FB0","#0F1A2E","#16264A")},
  saffron: {name:"Saffron",  mood:"Warm & upbeat",  light:P("#FAF6EF","#FFFFFF","#F2EADC","#E5D9C4","#6E604B","#C2650A","#FBE5CC","#FFFFFF","#2B1E10","#F2E6D6","#B39B7D","#3A2916","#4C351C"), dark:P("#15100A","#1D1710","#261E15","#3A2E20","#B3A38C","#F2A04B","#3D2A14","#2A1604","#0F0B06","#EFE2D0","#A08B70","#1C150D","#2A1F12")},
  plum:    {name:"Plum",     mood:"Creative",       light:P("#F6F3F9","#FFFFFF","#ECE6F3","#DCD3E8","#66597A","#7140C9","#E8DEFA","#FFFFFF","#23163A","#E8DFF6","#A797C4","#301F4E","#3E2963"), dark:P("#110D18","#191322","#21192D","#342846","#A99CBE","#B08BFF","#2E2150","#1A0B3A","#0B0812","#E4DAF4","#9584B4","#160F22","#241839")},
  berry:   {name:"Berry",    mood:"Bold & lively",  light:P("#FAF3F5","#FFFFFF","#F3E6EA","#E7D2D9","#735A63","#C2185B","#FADBE6","#FFFFFF","#33111F","#F6DFE8","#C495A8","#43182A","#561F37"), dark:P("#170A0F","#201117","#2A1720","#432532","#C2A0AE","#FF6FA3","#4A1A2E","#33061A","#0F0609","#F2DCE5","#A9808F","#1E0D14","#2E1420")},
  graphite:{name:"Graphite", mood:"Minimal",        light:P("#F4F4F2","#FFFFFF","#EAEAE6","#D8D8D2","#63635C","#1F1F1C","#E4E4DE","#FFFFFF","#1A1A18","#E9E9E4","#9C9C94","#262623","#33332F"), dark:P("#0E0E0D","#171716","#1F1F1D","#30302D","#A3A39B","#F2B13B","#3A2E15","#1A1204","#080807","#E6E6E0","#8E8E86","#141413","#22221F")},
};
let TH = {skin:"jade", mode:"system", density:"comfy", contrast:"std", font:"figtree", headFont:"display"};
const FONTS = {
  figtree:  {name:"Figtree", w:"400;500;600;700", note:"Default · friendly"},
  inter:    {name:"Inter", w:"400;500;600;700", note:"Crisp UI standard"},
  roboto:   {name:"Roboto", w:"400;500;700", note:"Android / Google"},
  opensans: {name:"Open Sans", w:"400;500;600;700", note:"Neutral, very readable"},
  lato:     {name:"Lato", w:"400;700", note:"Warm, rounded"},
  poppins:  {name:"Poppins", w:"400;500;600;700", note:"Geometric, bold"},
  montserrat:{name:"Montserrat", w:"400;500;600;700", note:"Wide, modern"},
  nunito:   {name:"Nunito", w:"400;500;600;700", note:"Soft, rounded"},
  source:   {name:"Source Sans 3", w:"400;500;600;700", note:"Compact, clear"},
  plex:     {name:"IBM Plex Sans", w:"400;500;600;700", note:"Corporate, technical"},
  manrope:  {name:"Manrope", w:"400;500;600;700", note:"Clean fintech look"},
  dmsans:   {name:"DM Sans", w:"400;500;600;700", note:"Light and airy"},
  worksans: {name:"Work Sans", w:"400;500;600;700", note:"Plain and sturdy"},
  noto:     {name:"Noto Sans", w:"400;500;600;700", note:"Wide language support"},
  jakarta:  {name:"Plus Jakarta Sans", w:"400;500;600;700", note:"Sharp, contemporary"},
  atkinson: {name:"Atkinson Hyperlegible", w:"400;700", note:"Built for low vision"},
  lexend:   {name:"Lexend", w:"400;500;600;700", note:"Eases reading strain"},
  system:   {name:"System default", sys:true, note:"Your device's own font"},
};
const loadedFonts = new Set(["Figtree"]);
function loadFont(key) {
  const f = FONTS[key]; if (!f || f.sys || loadedFonts.has(f.name)) return; loadedFonts.add(f.name);
  const l = document.createElement("link"); l.rel = "stylesheet"; l.href = `https://fonts.googleapis.com/css2?family=${f.name.replace(/ /g, "+")}:wght@${f.w}&display=swap`; document.head.appendChild(l);
}
const hex2 = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mixHex = (a, b, t) => { const x = hex2(a), y = hex2(b); return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join(""); };
const HC = {light: {good:"#0B5E3E", warn:"#7A4600", bad:"#9A1F17", neu:"#3F4D49", info:"#1C3F80"}, dark: {good:"#8BF0C4", warn:"#FFD08A", bad:"#FFB0A8", neu:"#D0DCD8", info:"#B9D0FF"}};
try { TH = {...TH, ...JSON.parse(localStorage.getItem("bcp-theme") || "{}")}; } catch (e) {}
if (!SKINS[TH.skin]) TH.skin = "jade";
const root = document.documentElement; let hostTheme = root.getAttribute("data-theme"), weSet = false;
function isDark() { const a = root.getAttribute("data-theme"); return a ? a === "dark" : matchMedia("(prefers-color-scheme: dark)").matches; }
let applying = false;
function applyTheme() {
  applying = true;
  if (TH.mode === "system") { if (weSet) { if (hostTheme) root.setAttribute("data-theme", hostTheme); else root.removeAttribute("data-theme"); weSet = false; } }
  else { if (root.getAttribute("data-theme") !== TH.mode) root.setAttribute("data-theme", TH.mode); weSet = true; }
  const dark = isDark(), pal = {...SKINS[TH.skin][dark ? "dark" : "light"]}, far = dark ? "#ffffff" : "#000000";
  pal.ink = pal.ink || (dark ? "#E3EEEA" : "#10231F");
  const C = TH.contrast;
  if (C === "soft") { pal.muted = mixHex(pal.muted, pal.bg, .28); pal["side-muted"] = mixHex(pal["side-muted"], pal.side, .25); }
  if (C === "high" || C === "max") {
    const k = C === "max" ? 1 : .6;
    pal.ink = mixHex(pal.ink, far, k); pal.muted = mixHex(pal.muted, pal.ink, C === "max" ? .75 : .45); pal.line = mixHex(pal.line, pal.muted, C === "max" ? .5 : .3);
    pal["side-muted"] = mixHex(pal["side-muted"], pal["side-ink"], C === "max" ? .7 : .4); pal["side-ink"] = mixHex(pal["side-ink"], "#ffffff", k);
  }
  if (C === "soft") pal.ink = mixHex(pal.ink, pal.muted, .22);
  Object.entries(pal).forEach(([k, v]) => root.style.setProperty("--" + k, v));
  Object.keys(HC.light).forEach(k => (C === "high" || C === "max") ? root.style.setProperty("--" + k, HC[dark ? "dark" : "light"][k]) : root.style.removeProperty("--" + k));
  root.dataset.density = TH.density; root.dataset.contrast = C;
  const f = FONTS[TH.font] || FONTS.figtree; loadFont(TH.font);
  const stack = f.sys ? `ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif` : `"${f.name}",ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif`;
  root.style.setProperty("--f-body", stack);
  if (TH.headFont === "same") root.style.setProperty("--f-display", stack); else root.style.removeProperty("--f-display");
  applying = false;
}
const saveTheme = () => { try { localStorage.setItem("bcp-theme", JSON.stringify(TH)); } catch (e) {} };
matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", applyTheme);
new MutationObserver(() => { const cur = root.getAttribute("data-theme"); if (TH.mode === "system") { hostTheme = cur; applyTheme(); } else if (cur !== TH.mode) { applyTheme(); } }).observe(root, {attributes: true, attributeFilter: ["data-theme"]});
applyTheme();

function openThemeDialog() {
  const before = {...TH};
  const sw = (k, s) => { const p = s[isDark() ? "dark" : "light"]; return `<button type="button" class="skin" data-skin="${k}" aria-pressed="${TH.skin === k}">
      <span class="pv" style="background:${p.bg}"><span class="sb" style="background:${p.side}"><i style="background:${p.accent}"></i><i style="background:${p["side-muted"]}"></i><i style="background:${p["side-muted"]}"></i></span>
      <span class="cv"><i style="background:${p.line};width:80%"></i><i style="background:${p.line};width:55%"></i><b style="background:${p.accent}"></b></span></span>
      <span class="nm">${s.name}<small>${s.mood}</small></span></button>`; };
  openDialog({
    eyebrow: "Personalise", title: "Theme & appearance", saveLabel: "Done",
    body: () => `
      <div class="field"><span class="lbl">Colour theme</span><div class="skins" id="th_skins">${Object.entries(SKINS).map(([k, s]) => sw(k, s)).join("")}</div></div>
      <div class="field"><span class="lbl">Appearance</span><div class="choices" id="th_mode">
        <button type="button" class="choice" data-v="light" aria-pressed="${TH.mode === "light"}"><b>Light</b><span>Bright workspace</span></button>
        <button type="button" class="choice" data-v="dark" aria-pressed="${TH.mode === "dark"}"><b>Dark</b><span>Easy on the eyes</span></button>
        <button type="button" class="choice" data-v="system" aria-pressed="${TH.mode === "system"}"><b>Match system</b><span>Follows your device</span></button></div></div>
      <div class="field"><span class="lbl">Density</span><div class="choices" id="th_den">
        <button type="button" class="choice" data-v="comfy" aria-pressed="${TH.density === "comfy"}"><b>Comfortable</b><span>Roomy rows</span></button>
        <button type="button" class="choice" data-v="compact" aria-pressed="${TH.density === "compact"}"><b>Compact</b><span>More rows on screen</span></button></div></div>
      <div class="field"><span class="lbl">Text contrast <span class="typ" id="th_cprev">Aa · ${esc(({soft:"Soft",std:"Standard",high:"High",max:"Maximum"})[TH.contrast])}</span></span><div class="choices" id="th_con">
        <button type="button" class="choice" data-v="soft" aria-pressed="${TH.contrast === "soft"}"><b>Soft</b><span>Gentle, low glare</span></button>
        <button type="button" class="choice" data-v="std" aria-pressed="${TH.contrast === "std"}"><b>Standard</b><span>Balanced</span></button>
        <button type="button" class="choice" data-v="high" aria-pressed="${TH.contrast === "high"}"><b>High</b><span>Darker text and lines</span></button>
        <button type="button" class="choice" data-v="max" aria-pressed="${TH.contrast === "max"}"><b>Maximum</b><span>Black on white, bold statuses</span></button></div></div>
      <div class="field"><span class="lbl">Font</span><div class="fontgrid" id="th_font">${Object.entries(FONTS).map(([k, f]) => `<button type="button" class="choice fontc" data-v="${k}" aria-pressed="${TH.font === k}"><b style="font-family:${f.sys ? "system-ui" : `'${f.name}'`},system-ui;font-size:17px;font-weight:600">${esc(f.name)}</b><span style="font-family:${f.sys ? "system-ui" : `'${f.name}'`},system-ui;font-size:13px;color:var(--ink)">Login API fails · 21 Sep</span><span>${esc(f.note)}</span></button>`).join("")}</div></div>
      <div class="field"><span class="lbl">Headings</span><div class="choices" id="th_head">
        <button type="button" class="choice" data-v="display" aria-pressed="${TH.headFont !== "same"}"><b style="font-family:'Bricolage Grotesque'">Display font</b><span>Bold, characterful headings</span></button>
        <button type="button" class="choice" data-v="same" aria-pressed="${TH.headFont === "same"}"><b>Same as text</b><span>One font everywhere</span></button></div></div>
      <span class="hint">Your theme is saved in this browser and doesn't change what teammates see.</span>`,
    mount: root2 => {
      const refreshSwatches = () => { const g = root2.querySelector("#th_skins"); g.innerHTML = Object.entries(SKINS).map(([k, s]) => sw(k, s)).join(""); };
      root2.querySelector("#th_skins").addEventListener("click", e => { const b = e.target.closest("[data-skin]"); if (!b) return; TH.skin = b.dataset.skin; applyTheme(); refreshSwatches(); });
      const m = root2.querySelector("#th_mode"); pressGroup(m, ".choice", "v"); m.addEventListener("pick", () => { TH.mode = m.dataset.v; applyTheme(); refreshSwatches(); });
      const d = root2.querySelector("#th_den"); pressGroup(d, ".choice", "v"); d.addEventListener("pick", () => { TH.density = d.dataset.v; applyTheme(); });
      const cn = root2.querySelector("#th_con"); pressGroup(cn, ".choice", "v"); cn.addEventListener("pick", () => { TH.contrast = cn.dataset.v; applyTheme(); root2.querySelector("#th_cprev").textContent = "Aa · " + ({soft:"Soft",std:"Standard",high:"High",max:"Maximum"})[TH.contrast]; });
      const fg = root2.querySelector("#th_font"); pressGroup(fg, ".choice", "v"); fg.addEventListener("pick", () => { TH.font = fg.dataset.v; applyTheme(); });
      const hd = root2.querySelector("#th_head"); pressGroup(hd, ".choice", "v"); hd.addEventListener("pick", () => { TH.headFont = hd.dataset.v; applyTheme(); });
      if (!document.getElementById("fontPreviewCss")) { const l = document.createElement("link"); l.id = "fontPreviewCss"; l.rel = "stylesheet"; l.href = "https://fonts.googleapis.com/css2?" + Object.values(FONTS).filter(f => !f.sys).map(f => "family=" + f.name.replace(/ /g, "+") + ":wght@" + (f.w.includes("600") ? "400;600" : "400;700")).join("&") + "&text=" + encodeURIComponent("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789·") + "&display=swap"; document.head.appendChild(l); }
    },
    onSave: () => { saveTheme(); toast(`Appearance saved · ${SKINS[TH.skin].name}, ${(FONTS[TH.font] || FONTS.figtree).name}`); },
    onCancel: () => { TH = before; applyTheme(); }
  });
}

try { S.layout = JSON.parse(localStorage.getItem("bcp-layout") || "{}") || {}; } catch (e) {}
try { S.noside = localStorage.getItem("bcp-noside") === "1"; } catch (e) {}
function applySide() { document.querySelector(".app").classList.toggle("noside", !!S.noside); }
const narrow = () => matchMedia("(max-width:1024px)").matches;
function closeSideDrawer() { document.querySelector(".app").classList.remove("sideopen"); }
function toggleSide() { if (narrow()) { document.querySelector(".app").classList.toggle("sideopen"); return; } S.noside = !S.noside; try { localStorage.setItem("bcp-noside", S.noside ? "1" : "0"); } catch (e) {} applySide(); render(); toast(S.noside ? "Side menu hidden. Press [ or the menu button to bring it back" : "Side menu shown"); }
applySide();
let fsActive = false;
function applyFull() { document.querySelector(".app").classList.toggle("full", !!S.full); render(); }
function toggleFull() {
  S.full = !S.full;
  if (S.full) { try { const pr = document.documentElement.requestFullscreen?.(); if (pr?.catch) pr.catch(() => toast("Full-screen view on. Press Esc or F to exit")); else toast("Full-screen view on. Press Esc or F to exit"); } catch (e) { toast("Full-screen view on. Press Esc or F to exit"); } }
  else if (document.fullscreenElement) { document.exitFullscreen?.().catch(() => {}); }
  applyFull();
}
document.addEventListener("fullscreenchange", () => { const on = !!document.fullscreenElement; if (!on && fsActive && S.full) { S.full = false; applyFull(); } fsActive = on; });

/* ---------- Drag to reorder: sheet tabs and columns ---------- */
let DRAG = null;
const clearDrop = () => document.querySelectorAll(".drop-l,.drop-r,.dragging").forEach(el => el.classList.remove("drop-l", "drop-r", "dragging"));
document.addEventListener("dragstart", e => {
  const t = e.target.closest?.("[data-dragsheet],[data-dragcol]"); if (!t) return;
  DRAG = t.dataset.dragsheet ? {kind: "sheet", id: t.dataset.dragsheet} : {kind: "col", id: t.dataset.dragcol};
  t.classList.add("dragging"); e.dataTransfer.effectAllowed = "move"; try { e.dataTransfer.setData("text/plain", DRAG.id); } catch (x) {}
  closeColMenu();
});
document.addEventListener("dragover", e => {
  if (!DRAG) return; const t = e.target.closest?.(DRAG.kind === "sheet" ? "[data-dragsheet]" : "[data-dragcol]"); if (!t) return;
  e.preventDefault(); const r = t.getBoundingClientRect(), right = e.clientX > r.left + r.width / 2;
  document.querySelectorAll(".drop-l,.drop-r").forEach(el => el.classList.remove("drop-l", "drop-r")); t.classList.add(right ? "drop-r" : "drop-l");
});
document.addEventListener("drop", e => {
  if (!DRAG) return; const t = e.target.closest?.(DRAG.kind === "sheet" ? "[data-dragsheet]" : "[data-dragcol]"); if (!t) { clearDrop(); DRAG = null; return; }
  e.preventDefault(); const right = t.classList.contains("drop-r"), target = t.dataset.dragsheet || t.dataset.dragcol;
  if (target !== DRAG.id) {
    if (DRAG.kind === "col") {
      const sh = S.sheets[S.sheetId], cs = [...(sh.columns || [])], from = cs.findIndex(c => c.id === DRAG.id), [moved] = cs.splice(from, 1);
      const to = cs.findIndex(c => c.id === target) + (right ? 1 : 0); cs.splice(to, 0, moved);
      store.put("sheets", S.sheetId, {...sh, columns: cs}); toast(`Moved “${moved.label}”`);
    } else {
      const l = sheetList().map(s => s.id), from = l.indexOf(DRAG.id); l.splice(from, 1); l.splice(l.indexOf(target) + (right ? 1 : 0), 0, DRAG.id);
      l.forEach((id, i) => { if (S.sheets[id].order !== i + 1) store.put("sheets", id, {...S.sheets[id], order: i + 1}); }); toast("Sheet order updated");
    }
  }
  clearDrop(); DRAG = null; render();
});
document.addEventListener("dragend", () => { clearDrop(); DRAG = null; });
/* ---------- Module API (dashboard / AI modules plug in here) ---------- */
window.BT = {
  get S() { return S; }, get store() { return store; }, get AI_ON() { return AI_ON; }, get AI() { return AI; }, get pending() { return pending; },
  $, esc, uid, clone, toast, render, renderNav, topbar, openDialog, closeDialog, pushUndo, snap, pool, pressGroup,
  sheetList, trackerList, curTracker, setTracker, tid, rowsOf, calcCell, rowState, isDoneRow, statusCol, titleCol, statusesOf, tone, fmtDate, normDate, todayISO, ago,
  openDrawer, gemini, openAI, inferSheets, openImportDialog, trackerColor, ICON, TYPES, SWATCH, saveFilters, get DL() { return typeof DL === "undefined" ? null : DL; },
  get STATUS_META() { return STATUS_META; }, STATUS_CATS
};
init();
})();
