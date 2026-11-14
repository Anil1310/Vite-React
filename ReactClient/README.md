# Divine Classes - Vite + React Web Application

A full-stack, responsive web application for **Divine Classes Institute Management System**, engineered with Vite, React 19, and Tailwind CSS. Built to be hosted as a pure Single Page Application (SPA) on **Vercel** with **Supabase REST** as the primary real-time database and **Google Sheets** as the secondary mirror/sync.

---

## 🚀 Key Architectural Features (Web App Golden Architecture)

1. **Top Header Navigation (Strict 4-Control Standard)**:
   - **Cloud Sync** (`fa-cloud`): Real-time sync indicator & 1-click sync with Supabase and Google Sheets.
   - **Theme Switcher** (`fa-moon` / `fa-sun`): Instant dark/light mode toggle persisted in `localStorage`.
   - **Notification Bell** (`fa-bell`): Unread alerts badge and notifications center.
   - **Unified User Profile Badge**: Clickable avatar pill with user role & title, opening role-specific profile & ID card.

2. **Multi-Role RBAC & Profile Modal Architecture**:
   - **Administrator**: Full institute management, batch creation, scholar master directory, settings, and developer controls.
   - **Faculty / Teacher**: Department view, daily attendance marking, offline test evaluation, study material sharing.
   - **Student / Scholar**: Batch timetable, attendance ratio, fee ledger, report card, downloadable ID card with barcode.

3. **Dynamic Monthly Tuition Fees (Strict Rule 8)**:
   - Total Fees Paid field is **permanently initialized to ₹0 on admission and strictly non-editable** by anyone.
   - Tuition payments accumulate dynamically into `paidFee`.
   - Every recorded monthly payment advances next fee due date forward by `Math.floor(payment / monthlyFee)` months.

4. **10-Day "Remember Me" & 2-Hour Inactivity Auto-Logout (Strict Rule 7)**:
   - "Remember Me" saves credentials in `localStorage ('DIVINE_SAVED_CREDS')` with 10-day expiration.
   - 2-hour inactivity tracker (`DIVINE_LAST_ACTIVITY`) automatically ends inactive sessions while preserving remembered credentials.

5. **AI Assistant & Voice Recognition (Rule 9)**:
   - Floating assistant launcher button (`#divine-chatbot-btn`) + drawer (`#divine-chatbot-window`).
   - Web Speech API microphone input for oral inquiries.
   - State-aware query resolution for live student dues, timetable, marks, and institute details.
   - Governed by master toggle (`chatbotEnabled`) in Settings.

6. **Universal Developer Attribution**:
   - `© 2026 Designed & Engineered by Dev. Anil Kumar Chahar • 8126390611 • v2.5 Cloud Edition`

---

## 🛠️ Run Locally

### Windows 11:
Double-click `2_Local_Preview.bat` or run:
```powershell
cd ReactClient
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### macOS / Linux:
```bash
cd ReactClient
chmod +x *.sh
./2_Local_Preview.sh
```

---

## ☁️ Deploy to Vercel

### Option 1: 1-Click Script
Double-click `4_Deploy_Vercel.bat` (or run `./4_Deploy_Vercel.sh`).

### Option 2: Vercel Dashboard / Git
1. Push this repository to GitHub/GitLab.
2. In the Vercel Dashboard, import the project.
3. Set the **Root Directory** to `ReactClient`.
4. Framework Preset: **Vite**.
5. Environment Variables:
   - `VITE_SUPABASE_URL`: `https://srjqsofkjizwskqnzyfn.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `sb_publishable_vxonFVKPpyJjY5O-Y9mS6g_bhSYCcsS`
   - `VITE_APPS_SCRIPT_WEB_APP_URL`: `https://script.google.com/macros/s/AKfycbzW3POboCUJfKE2W-vFKVRMvwu6Q6OV9yELYhy-SZTVSQY8nlO43Kj1PhlNUeTj0JtV/exec`
6. Click **Deploy**. The included `vercel.json` ensures all deep SPA routes resolve cleanly without 404 errors.
