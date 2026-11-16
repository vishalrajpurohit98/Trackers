# Bank Project Tracker: AI dashboards and collaborative editing

This package has **two separate entry points**:

| Folder | What it is | Backend |
|---|---|---|
| `offline/` | Test version. Open `offline/index.html` straight from your computer. | None. Data stays in this browser (localStorage). |
| `github/` | Production version for GitHub Pages. | Firebase Authentication + Realtime Database |

The two folders share the same dashboard and AI modules (`js/dashboard.js`, `js/ai-dashboard.js`). The offline `js/app.js` contains no sign-in or database code. The GitHub `js/app.js` contains no offline sample-data code.

```
offline/                          github/
├─ index.html                     ├─ index.html
├─ css/app.css                    ├─ css/app.css
├─ css/dashboard.css              ├─ css/dashboard.css
├─ js/config.js     (AI on/off)   ├─ js/config.js     (Firebase config, idle timeout, AI on/off)
├─ js/sample-data.js (fictional)  ├─ js/app.js        (tracker UI + Firebase auth, sync, sharing)
├─ js/app.js        (tracker UI + local storage)
├─ js/dashboard.js  (charts, KPIs, layout)          ├─ js/dashboard.js
├─ js/ai-dashboard.js (profiling + suggestions)     ├─ js/ai-dashboard.js
├─ js/offline.js    (offline labels, reset)         ├─ database.rules.json (paste into Firebase)
└─ js/vendor/xlsx.bundle.js (Excel, bundled)        └─ js/vendor/xlsx.bundle.js
```

**Never put a backup `.json` file or real bank data in the GitHub repository.** The repository holds only the app.

---

## What works where

| Feature | Offline version | Needs internet | Needs GitHub version (backend) |
|---|:-:|:-:|:-:|
| Trackers, sheets, entries, filters, formatting, status workflow, undo, bulk edit, paste | ✅ | | |
| Excel upload / download (library bundled locally) | ✅ | | |
| Dashboards: quick suggestions, KPIs, charts, add / remove / rearrange / resize | ✅ | | |
| Charts update automatically when entries are edited, added or deleted | ✅ (this browser) | | |
| AI suggestions, Ask the tracker, Status email, Rephrase (Google Gemini) | | ✅ + your key | |
| Import a Google Sheet by link | | ✅ | |
| Web fonts (falls back to system fonts) | | ✅ | |
| Sign-in, sign-out, session timeout, Back-button guard | | | ✅ |
| Private data per account | | | ✅ |
| Share dashboards with **View** or **Edit** access | | | ✅ |
| Collaborative editing with real-time sync between people and devices | | | ✅ |
| View-only links to sheets | | | ✅ |

The offline version labels these limits in the app: open **Offline test version · what works?** at the bottom of the side menu. Its Share button is marked **GitHub version**, and AI buttons are marked **needs internet + key**.

---

## A. Run the offline version

1. Unzip the package.
2. Open the `offline` folder and double-click `index.html`. It works in Chrome, Edge, Firefox or Safari, with no server, install or internet needed.
3. A fictional **Demo Bank (sample)** tracker opens with two sheets and a ready-made dashboard.

Things to try:
- Open **Change requests**, change a status to *Production Deployment Signed Off*, add or delete an entry, then go back to the dashboard. The KPIs and charts recalculate.
- Click **Suggest charts** or **＋ New dashboard** and tick sheets. The assistant studies the columns and suggests KPIs and charts, each with a short reason. Tick the ones you want or click **Add all**.
- Use **Edit layout** to drag charts into a new order (or use ‹ ›), resize with ⇔, and remove with ✕. Undo brings a removed chart back.
- Use **Add chart** to build one yourself: pick the sheet, chart type, group-by column, measure and filter, and a live preview appears.
- Use **Upload Excel / CSV…** in the dashboard wizard. Each tab becomes a sheet, and the wizard reopens with those sheets selected.
- Click any bar or slice to jump to the matching entries in the sheet.

To reset, go to **Offline test version · what works? → Reload sample data** or **Clear all local data**. Use **Backup & restore** (tracker switcher) to move your test data into the GitHub version later.

---

## B. Deploy the GitHub version

### 1. Firebase (skip the steps you've already done)

1. In the [Firebase console](https://console.firebase.google.com), create a project. Then go to **Build → Realtime Database → Create database** and start in locked mode.
2. **Rules tab:** open `github/database.rules.json`, copy all of it, paste it over the existing rules and click **Publish**.
   - If you still need to copy data from the old shared `tracker` folder, add this block inside `"rules"`, with your own email in lowercase. Remove it again after copying.
     ```json
     "tracker": { ".read": "auth != null && auth.token.email === 'you@example.com'", ".write": false }
     ```
3. **Build → Authentication → Sign-in method:** turn on **Email/Password**, and **Google** too (Google accounts count as confirmed emails, which makes sharing easiest). Then under **Settings → User actions**, tick **Enable create (sign-up)**.
4. **Authentication → Settings → Authorized domains:** add `<your-username>.github.io`.

### 2. Config

`github/js/config.js` already holds the config for project `trackers-4ad6e`. For another project, paste that project's values from **Project settings → Your apps → Web app**. These values are public by design; the rules and sign-in protect the data.

You can also change these settings in the same file:
- `window.IDLE_SIGNOUT_MINUTES = 60` (0 turns off automatic sign-out)
- `window.AI_FEATURES = true`

### 3. Upload to GitHub Pages

1. Open your repository on GitHub, then go to **Add file → Upload files**.
2. Drag in **everything inside the `github` folder**: `index.html`, the `css` and `js` folders, `database.rules.json` and this README. GitHub keeps the folders.
   - If you're updating from the earlier single-file version, just upload over it. Your data is in Firebase and isn't touched.
3. Click **Commit changes**.
4. If Pages isn't on yet, go to **Settings → Pages → Deploy from a branch → `main` / `(root)` → Save**.
5. Wait 1–2 minutes, open `https://<your-username>.github.io/<repo>/`, and press **Ctrl + Shift + R**.

---

## C. AI dashboard suggestions

Dashboards sit in the same tab bar and side list as your sheets, marked with a dashboard icon. Create one with **＋ Dashboard** (next to the sheet tabs) or **New dashboard** (side list).

1. Click **＋ Dashboard** or **Suggest charts** (on a dashboard).
2. **Data source:** tick one or more sheets, upload an Excel/CSV file, or paste a Google Sheets link. Google Sheets import needs internet and a sheet shared as "Anyone with the link" or published to the web. It imports a copy; later edits in Google aren't pulled in.
3. **Analyse data:** the assistant profiles each column on your device: its type, role (status, person, category, date, measure, id, text), how full it is, distinct values, number ranges, date ranges, and links between sheets such as shared column names and values. It shows **Insights** and suggestions straight away, at no cost and without internet.
4. **Ask AI for smarter suggestions** (optional, needs a Gemini key from AI → Settings) sends the profile to Gemini. That's column names, types, counts and the top values per column, never whole rows.
   - Every answer is checked against your real columns. Anything that refers to a missing column or an unsupported chart type is dropped.
   - Results are cached per data profile, so asking again for the same sheets doesn't make another API call. **Ask AI again** forces a fresh call.
   - AI is only called when you click the button.
5. **Suggest from these sheets:** the chips at the top of the suggestions let you add or remove sheets at any time, and the suggestions refresh straight away. **Upload / import data…** brings in new sheets.
6. Tick the suggestions you want, or click **Add all**. Each card shows a live preview and **why** the chart is useful. On the dashboard, the **i** button shows that reason again.

**Add your own:** on a dashboard, **＋ KPI** and **＋ Chart** let you build any KPI or chart from any sheet in the project, with a live preview. **Edit layout** lets you reorder (drag or ‹ ›), resize (⇔), edit (✎) or remove (✕) charts.

**Download for the client:** on a dashboard click **Download**.
- **Excel:** the workbook starts with a *Dashboard* tab with KPI cards, a data table for every chart and **native Excel charts** (column, bar, stacked, line, pie, donut) that the client can restyle. The source sheets follow, formatted as usual. Untick sheets you don't want to send.
- **PDF:** **Save this dashboard as PDF…** opens the print window; choose "Save as PDF".
- Values are calculated at the moment you download. Re-uploading the file for edits ignores the Dashboard and Summary tabs.

**Chart types:** KPI (count / sum / average / % of entries), Column, Bar, Stacked bar, Line (trend by day/week/month, optional running total, split by a column), Pie, Donut, Top list, and a cross-sheet comparison.

**Always live:** a dashboard stores only the chart *definitions* (which sheet, columns, measure and filter), never numbers. Every view recalculates from the current entries, so edited, added and deleted rows show up immediately.

**Error handling:**
- If a source sheet or column is deleted, the chart shows a clear message such as "The group by column … no longer exists. Edit the chart" instead of wrong numbers.
- Empty sheets show "No entries yet".
- Invalid files, unreadable Google links, being offline, a missing key, and Gemini quota or errors each show a specific message. The quick suggestions keep working when AI fails.

---

## D. Sharing sheets and dashboards with View / Edit access (GitHub version)

**Sheets:** click the share icon in the top bar (or the tracker switcher → Share sheets).
1. Tick the sheets and give the share a name.
2. Choose **People I add**, then add emails and set **Can view** or **Can edit data** for each person.
3. Click **Share**. The link is copied, and the window lists every current share with **Copy link**, **Edit** (change sheets, people or roles) and **Stop sharing**.

People with edit access open the link, sign in, and work in the normal table and form view. They can add, change and delete entries in those sheets only, and their changes land directly in your sheets. **Anyone with the link** is still available for read-only copies that need no sign-in.

**Dashboards:**

On a dashboard click **Share**. Add people by email and choose **Can view** or **Can edit data**, then click **Save sharing** and **Copy link**.

| | Can view | Can edit data | Owner |
|---|:-:|:-:|:-:|
| See the dashboard and its source sheets, live | ✅ | ✅ | ✅ |
| Filter, sort, search, open entries, download Excel | ✅ | ✅ | ✅ |
| Add, change and delete entries in the dashboard's source sheets | | ✅ | ✅ |
| Change charts, layout, sheet columns, workflow, other sheets | | | ✅ |
| See the owner's other sheets and dashboards | | | ✅ |

How it works:
- **One source of truth.** People with edit access write directly into the owner's sheets in Firebase, and nothing is copied per user. Every open screen (owner and collaborators) updates within a second or two, and the dashboard recalculates.
- **Who changed what:** each entry records the email that saved it last.
- **Enforced by the database rules, not just the screen.** The owner's app keeps an access list (`users/<owner>/acl`) for each sheet and dashboard. The rules in `database.rules.json` only let a signed-in person with a **confirmed email** on that list:
  - read those sheets, the dashboard and the project's settings;
  - write entries only where they have **edit** access;
  - never delete or restructure sheets.
- Everything else stays private: reads or writes outside the list are refused with `PERMISSION_DENIED`.
- People sign in with the email you added. Google accounts work straight away. Email-and-password accounts confirm their email once; the link page has a **Send confirmation email** button.
- Dashboards shared with someone appear in their side menu under **Shared with me**.
- Removing a person takes effect immediately; their open page switches to "No access".

Limits:
- People you share sheets with can't add columns, delete sheets or see your other sheets.
- If two people edit the **same entry** at the same moment, the last save wins. Edits to different entries never conflict.
- Collaborators can't create new sheets or dashboards in the owner's project.
- Offline edits sync only while the tab stays open.

The older **view-only sheet links** (tracker switcher → Share sheets) still work as before. They keep a read-only copy for people outside your team, which can be opened without signing in. To give people **edit** access, use dashboard sharing.

---

## E. Sign-in and session handling (GitHub version)

- **Keep me signed in on this device:** untick it on shared computers.
- **Sign out** asks you to confirm, then clears the tracker from the page. Back and Forward only show the sign-in screen afterwards.
- Pressing **Back** while signed in asks whether to stay, leave, or sign out and leave.
- You're signed out automatically after 60 minutes of inactivity (`IDLE_SIGNOUT_MINUTES` in `js/config.js`).
- Signing out in one tab signs out every open tab.

---

## F. Architecture (for maintainers)

| File | Responsibility |
|---|---|
| `js/app.js` | Tracker UI (sheets, table, cards, forms, filters, import/export, status workflow) and the data store for that build. It exposes a small module API, `window.BT`. |
| `js/dashboard.js` | Dashboard model and rendering: computes every KPI/chart from `BT.S` on each render, draws charts in plain HTML/SVG (no chart library), handles the chart builder, layout editing, drill-down and error states. No AI or backend code. |
| `js/ai-dashboard.js` | Column profiling, rule-based suggestions, the optional Gemini call (validation, caching), Google Sheets import and the suggestion wizard. It only produces chart definitions; rendering is done by `dashboard.js`. |
| `js/config.js` | Settings: Firebase config (GitHub), AI switch, idle timeout. |
| `js/sample-data.js`, `js/offline.js` | Offline version only. |
| `database.rules.json` | Firebase security rules: private data, ACL-based dashboard sharing, inbox, view-only links. |

Data in Firebase:

| Path | Contents |
|---|---|
| `users/<uid>/tracker/{trackers,sheets,rows,dashboards}` | The owner's data. Rows are indexed by `sheetId`. |
| `users/<uid>/acl/{sheets,trackers,dash}/<id>/<email,key>` | Who may read or edit. Written by the owner's app. |
| `inbox/<email,key>/<owner~dashboard>` | "Shared with me" entries. |
| `shares/<id>` | View-only sheet links (existing feature). |

**AI cost control:**
- Rule-based suggestions run on your device.
- Gemini is called only when someone clicks the button, with a compact profile instead of the rows.
- Results are cached per profile (last 15).
- The model is the free Flash model chosen in AI → Settings.
- Each person uses their own key, stored only in their browser.

---

## G. Existing features (unchanged)

These features work as before:
- Status workflow (21 stages per project)
- Assignee → Owner auto-fill
- Card heading
- Ctrl + K search
- Excel import into a chosen project
- Formatting
- Undo
- Bulk edit
- Paste from Excel
- Holiday calendar
- Remark column with AI summary
- Ask the tracker
- Status email
- Themes and fonts
- Mobile layout

Use **Backup & restore** (tracker switcher) for a `.json` copy; it now includes dashboards.

## Troubleshooting

| Message | Fix |
|---|---|
| "Sharing is blocked by the database rules" / "Couldn't update sharing" | Publish `database.rules.json` (section B.1.2). |
| A person sees **No access** on a dashboard link | Check their email under Share. They must sign in with that exact email, and password accounts must confirm the email. |
| **Confirm your email** screen | Click **Send confirmation email**, click the link in the email, then click **I've confirmed it**. |
| A chart says a column no longer exists | The column was renamed or deleted. Click ✎ (Edit layout) and pick another column. |
| AI: "Free-tier limit reached" | Wait a minute or pick another model in AI → Settings. The quick suggestions still work. |
| Google Sheet import fails | Share the sheet as "Anyone with the link (Viewer)" or publish it to the web. You can also download it as .xlsx and use Upload Excel. |
| "This website isn't on the Firebase authorized domains list" | Add `<your-username>.github.io` (section B.1.4). |
| Old version still showing after upload | Wait 1–2 minutes and press Ctrl + Shift + R. |
