# Bank Project Tracker

A single-page tracker for bank projects (BCP, SCB and more). Hosted on GitHub Pages, data stored in Firebase Realtime Database, sign-in with Google or email.

The repository holds only the app (`index.html`). All project data lives in your Firebase database, protected by sign-in and database rules. **Never commit the backup `.json` file to this repository.**

---

## 1. Create the Firebase database (about 5 minutes)

1. Go to <https://console.firebase.google.com> and click **Create a project** (e.g. `bank-tracker`). Analytics is optional.
2. **Build → Realtime Database → Create database.** Pick a location (`asia-southeast1` is closest to India) and start in **locked mode**.
3. Open the **Rules** tab, replace everything with the rules below, then click **Publish**.
   Only signed-in, verified accounts on your company domain can read or write.

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "tracker": {
      ".read":  "auth != null && auth.token.email_verified == true && auth.token.email.matches(/.*@fablefintech[.]com$/)",
      ".write": "auth != null && auth.token.email_verified == true && auth.token.email.matches(/.*@fablefintech[.]com$/)"
    }
  }
}
```

   To allow specific people instead of a whole domain, use this condition for both `.read` and `.write`:
   `"auth != null && (auth.token.email == 'person1@gmail.com' || auth.token.email == 'person2@company.com')"`

4. **Build → Authentication → Get started → Sign-in method.** Enable **Google**. Optionally enable **Email/Password** too (new email accounts must click the verification link before they can sign in).

## 2. Get your web config

1. **Project settings (gear icon) → General → Your apps → Web `</>`.** Register an app (no hosting needed).
2. Copy the `firebaseConfig` values. Make sure `databaseURL` is included. If it's missing, refresh the page after step 1.2 and copy again.
3. Open `index.html` in any text editor, find `window.FIREBASE_CONFIG` near the top, and paste the values:

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

1. Open your GitHub Pages link and sign in.
2. On the first screen click **Restore from a backup file** (later: tracker switcher → **Backup & restore…**).
3. Choose `bcp-tracker-backup.json`. That loads all 8 BCP sheets and 239 entries.

Everyone who signs in now sees the same data, live. Edits appear on other open screens within a second.

---

## Everyday notes

- **Live status** (bottom of the side menu): *Live · all changes saved*, *Saving…*, or *Offline · changes sync when you reconnect*. Changes made while offline are sent once you're back online, as long as the tab stays open.
- **Who changed what:** each entry records who saved it last (shown at the bottom of the entry form).
- **Backups:** tracker switcher → **Backup & restore… → Download backup** whenever you want a copy. Keep backups out of the GitHub repo.
- **Theme, font, contrast, layout and filters** are personal and saved per browser.
- **Updating the app later:** upload the new `index.html` to the repo again (keep your `FIREBASE_CONFIG` values). Data is untouched.
- **Free limits:** Firebase's free Spark plan includes 1 GB stored and 10 GB/month downloaded, which is far more than this tracker needs.

## Troubleshooting

| Message | Fix |
|---|---|
| "This website isn't on the Firebase authorized domains list" | Do step 4. |
| "No access · check database rules" | Your email doesn't match the rules. Check the domain or email list in step 1.3. |
| "This sign-in method is off" | Enable Google / Email in Authentication → Sign-in method. |
| "Verify your email first" | Click the link in the verification email, then sign in again. |
| Setup screen keeps appearing | `FIREBASE_CONFIG` in `index.html` is empty or missing `databaseURL`. |
