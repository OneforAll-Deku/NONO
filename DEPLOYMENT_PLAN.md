# 🚀 Smart Time Tracker Deployment Master Plan

This guide outlines how to take your project from `localhost` to a live URL that anyone can use.

---

## 🏗️ Architecture Overview

1.  **Database**: Supabase (Cloud Postgres) - *Already Live*
2.  **Backend API**: Express Server - *Needs Hosting (Render/Railway)*
3.  **Frontend**: React Web App - *Needs Hosting (Vercel/Netlify)*
4.  **Extension**: Chrome Extension - *Needs Packaging & Distribution*

---

## ✅ Phase 1: Prepare the Backend (Server)

The server needs to run 24/7 on the internet.

1.  **Choose a Host**:
    *   **Render** (Free tier available, good for Node.js).
    *   **Railway** (Very easy, small cost or trial).
2.  **Steps**:
    *   Connect your GitHub repo to Render/Railway.
    *   Root Directory: `apps/server`
    *   Build Command: `npm install`
    *   Start Command: `node index.js`
    *   **Environment Variables**: You MUST add these in the host's dashboard:
        *   `SUPABASE_URL`: (Your Supabase URL)
        *   `SUPABASE_KEY`: (Your Supabase Service/Anon Key)
        *   `PORT`: `3000` (or `8080`, host usually assigns this)
3.  **Result**: You will get a URL like `https://smart-tracker-api.onrender.com`. **Save this URL.**

---

## 🎨 Phase 2: Prepare the Frontend (Web Dashboard)

1.  **Choose a Host**:
    *   **Vercel** (Highly recommended for Vite/React).
2.  **Steps**:
    *   Connect GitHub repo to Vercel.
    *   Root Directory: `apps/web`
    *   Framework Preset: `Vite`
    *   **Environment Variables**:
        *   `VITE_API_URL`: `https://smart-tracker-api.onrender.com` (The URL from Phase 1).
        *   `VITE_SUPABASE_URL`: (Your Supabase URL)
        *   `VITE_SUPABASE_ANON_KEY`: (Your Supabase Anon Key)
3.  **Result**: You will get a URL like `https://smart-time-tracker.vercel.app`. **Save this URL.**

---

## 🔌 Phase 3: Configure the Extension for Production

The extension currently points to `localhost`. We need to point it to your new live URLs.

1.  **Edit `apps/extension/background.js`**:
    *   Find where `fetch("http://localhost:3000/api/logs")` is called.
    *   Replace `http://localhost:3000` with your **Backend URL** (from Phase 1).

2.  **Edit `apps/extension/popup.js`**:
    *   Find `const API_BASE = "http://localhost:3000";`
    *   Replace with your **Backend URL**.
    *   Find `const DASHBOARD_URL = "http://localhost:5173/";`
    *   Replace with your **Frontend URL** (from Phase 2).

3.  **Edit `apps/extension/manifest.json`**:
    *   Update `host_permissions` if you restricted them to localhost (currently it tracks all domains, so this might be fine).

---

## 📦 Phase 4: Packaging for Users

Once the code is updated with live URLs:

1.  **Run the Package Script**:
    ```powershell
    ./package_extension.ps1
    ```
2.  **Get the ZIP**: 
    *   Take the `smart-time-tracker-extension.zip` from the `release` folder.
3.  **Host the ZIP**:
    *   Upload this ZIP to Google Drive, Dropbox, or a GitHub Release.
    *   Put the download link on your Landing Page!

---

## 👩‍💻 Phase 5: User Installation Guide (The "Easy" Way)

Since we are not publishing to the Chrome Web Store (which costs $5 and takes weeks for review), users must install it manually. 

**Instructions for your Users:**

1.  **Download** the `smart-time-tracker-extension.zip`.
2.  **Unzip** it to a folder.
3.  Open Chrome and go to `chrome://extensions`.
4.  Turn on **Developer Mode** (top right switch).
5.  Drag and drop the **unzipped folder** onto the page.
6.  **Done!** Go to the Dashboard to connect.

---

## 🚀 Future: Chrome Web Store (The "Easiest" Way)

To make it truly 1-click install:
1.  Register a Google Chrome Web Store Developer account ($5 fee).
2.  Upload your ZIP file.
3.  Fill out the listing details (Screenshots, Privacy Policy).
4.  Wait for review (1-3 days).
5.  Users can then just click "Add to Chrome".
