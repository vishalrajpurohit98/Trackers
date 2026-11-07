# Bank Project Tracker

A single-page tracker for bank projects (BCP, SCB and more). Hosted on GitHub Pages, data stored in Firebase Realtime Database. Sign in with email and password (or Google); the browser remembers you.

The repository holds only the app (`index.html`). All project data lives in your Firebase database, reachable only through the app. **Never commit the backup `.json` file to this repository.**

---

## 1. Create the Firebase database (about 5 minutes)

1. Go to <https://console.firebase.google.com> and click **Create a project** (e.g. `bank-tracker`). Analytics is optional.
2. **Build → Realtime Database → Create database.** Pick a location (`asia-southeast1` is closest to India) and start in **locked mode**.
3. Open the **Rules** tab, replace everything with the rules below, then click **Publish**.
   Anyone with an account can use the tracker. People who aren't signed in can't read or change anything.

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "tracker": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

4. **Build → Authentication → Get started → Sign-in method.** Enable **Email/Password**. Optionally enable **Google** for one-click sign-in.
   Then open **Authentication → Settings → User actions** and make sure **Enable create (sign-up)** is ticked, so new people can use **Create account**.

## 2. Get your web config

1. **Project settings (gear icon) → General → Your apps → Web `</>`.** Register an app (no hosting needed).
2. Copy the `firebaseConfig` values. Make sure `databaseURL` is included. If it's missing, refresh the page after step 1.2 and copy again.
3. Your config for project `trackers-4ad6e` is already filled in. For a different project, open `index.html` in any text editor, find `window.FIREBASE_CONFIG` near the top, and paste the values:

```js
window.FIREBASE_CONFIG = {
  apiKey: "AIza…",
  authDomain: "bank-tracker.firebaseapp.com",
  databaseURL: "https://bank-tracker-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bank-tracker",
  appId: "1:…:web:…"
};
```

These values are public by design. Security comes from the rules and sign-in, not from hiding the config.

(If you skip this step, the app asks for the config the first time it opens on each device and remembers it there.)

## 3. Publish on GitHub Pages

1. On GitHub, click **New repository** (e.g. `bank-tracker`). Public is fine, since the repo contains no data.
2. **Add file → Upload files** → drop in `index.html` and this `README.md` → **Commit changes**.
3. **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / `(root)` → Save.**
4. After about a minute your site is live at `https://<your-username>.github.io/bank-tracker/`.

## 4. Allow your GitHub Pages address to sign in

Firebase console → **Authentication → Settings → Authorized domains → Add domain** → `<your-username>.github.io`.

## 5. Load your existing data

1. Open your GitHub Pages link. The first time, type your email and a password and click **Create account**. After that the browser keeps you signed in.
2. On the first screen click **Restore from a backup file** (later: tracker switcher → **Backup & restore…**).
3. Choose `bcp-tracker-backup.json`. That loads all 8 BCP sheets and 239 entries.

Everyone who signs in now sees the same data, live. Edits appear on other open screens within a second.

---

## Everyday notes

- **Live status** (bottom of the side menu): *Live · all changes saved*, *Saving…*, or *Offline · changes sync when you reconnect*. Changes made while offline are sent once you're back online, as long as the tab stays open.
- **Who changed what:** each entry records who saved it last (shown at the bottom of the entry form): shown as their email.
- **Backups:** tracker switcher → **Backup & restore… → Download backup** whenever you want a copy. Keep backups out of the GitHub repo.
- **Theme, font, contrast, layout and filters** are personal and saved per browser.
- **Updating the app later:** upload the new `index.html` to the repo again (keep your `FIREBASE_CONFIG` values). Data is untouched.
- **Free limits:** Firebase's free Spark plan includes 1 GB stored and 10 GB/month downloaded, which is far more than this tracker needs.

## Troubleshooting

| Message | Fix |
|---|---|
| "This website isn't on the Firebase authorized domains list" | Do step 4. |
| "New accounts are switched off" | Tick **Enable create (sign-up)** in Authentication → Settings → User actions (step 1.4). |
| "No access · check database rules" | Paste the rules from step 1.3 and click Publish. |
| "This sign-in method is off" | Enable Google / Email in Authentication → Sign-in method. |
| Setup screen keeps appearing | `FIREBASE_CONFIG` in `index.html` is empty or missing `databaseURL`. |
