# NONO (Smart Time Tracker)

**NONO** is a privacy-first, automated time-tracking tool that helps you regain control of your digital life. It runs quietly in your browser, respecting your data while giving you brutal/retro-styled insights into your productivity.

![NONO Dashboard](./dashboard-preview.png)

## 🚀 How to Use NONO (User Guide)

Follow these simple steps to start tracking your time.

### 1. Download the Extension
Download the latest version of the extension from the **Releases** section of this repository, or use the link below if available.

- **[Download Extension ZIP](./release/nono-extension.zip)** 
*(Make sure to unzip this file after downloading)*

### 2. Install in Chrome
Since NONO is currently in Beta (and privacy-focused), it is installed manually to give you full control.

1.  **Unzip the File**: Extract the downloaded ZIP file. You will see a folder containing the extension files.
2.  **Open Extensions Page**: Open Google Chrome and paste `chrome://extensions` into the address bar.
3.  **Enable Developer Mode**: Toggle the "Developer mode" switch in the top-right corner of the page.
4.  **Drag & Drop**: Drag the unzipped folder directly onto the Chrome Extensions page.
5.  **Pin It**: Click the puzzle icon in the Chrome toolbar and pin **NONO** so you can see its status.

### 3. Connect to Dashboard
1.  **Open the Web App**: Navigate to the NONO Dashboard ([https://nono-web.vercel.app/](https://nono-web.vercel.app/)).
2.  **Sign In**: Log in using your Google account.
3.  **Activate**: Open the NONO extension popup. It should automatically detect your session and show **"User Portal (Connected)"**.

**You are all set!** Browse the web as usual. NONO will track your active tabs and present your data on the dashboard.

---

## ❓ Troubleshooting

-   **Popup says "Not Connected"?**
    -   Ensure you have opened the Dashboard tab at least once after signing in.
    -   Refresh the Dashboard page.
-   **No data appearing?**
    -   Check that the extension is enabled in `chrome://extensions`.
    -   Ensure you are not in a restricted browser environment (like Incognito, unless allowed).

---

## �‍💻 For Developers

If you want to contribute to NONO or run the full stack locally, follow the guide below.

### Tech Stack
-   **Extension**: Manifest V3, Vanilla JS
-   **Frontend**: React 19, Vite, Tailwind CSS v4
-   **Backend**: Node.js, Express, Supabase

### Local Development Setup

#### 1. Server (`apps/server`)
```bash
cd apps/server
npm install
node index.js
# Runs on localhost:3000
```

#### 2. Web Dashboard (`apps/web`)
```bash
cd apps/web
npm install
npm run dev
# Runs on localhost:5173
```

#### 3. Load Extension (`apps/extension`)
1.  Go to `chrome://extensions`.
2.  Click **Load Unpacked**.
3.  Select the `apps/extension` folder.

For full deployment details, please contact the maintainer.
