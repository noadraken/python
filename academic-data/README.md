# Academic Analytics Pro (Excel Data & GPA Manager)

A beautiful, high-fidelity academic database dashboard built using **React**, **TypeScript**, and **Tailwind CSS**. It simulates Python Pandas-style dataframe merge operations, student dataset join workflows, and calculates weighted aggregate GPA (IPK) metrics with on-demand **A4 Academic Transcript PDF download** reports.

---

## 📋 Common Questions Resolved


### Which file should I run?
Because this is a compiled React Single Page Application (SPA) powered by **Vite**, you do **not** double-click or run an individual `.tsx` or `.ts` file directly. 
Vite orchestrates your assets and hot-relies on `index.html` as the main gateway file. You run the ecosystem scripts from your Terminal using npm. 

The executable script targets are handled inside the environment's configurations through:
* **Development Server Command**: `npm run dev`
* **Production Build Command**: `npm run build`

---

## 🚀 Step-by-Step Local Setup

Follow these simple instructions to open, run, and modify the application inside your local **Visual Studio Code** editor:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your computer. Node.js comes bundled with `npm` (Node Package Manager).

---

### Step 1: Open the Project in VS Code
1. Export or download the ZIP archive of this project, then extract it to a directory on your computer.
2. Open **VS Code**.
3. Choose **File > Open Folder...** and select your extracted project folder.

---

### Step 2: Open terminal and install dependencies
1. Open the integrated terminal inside VS Code by pressing ``Ctrl + ` `` (Windows/Linux) or ``Cmd + ` `` (macOS), or by clicking **Terminal > New Terminal** in the top menu.
2. Run the package installation command to pull in libraries like React, Tailwind CSS, Lucide icons, SheetJS (`xlsx`), and the `jspdf` PDF printing engine:
   ```bash
   npm install
   ```

---

### Step 3: Run the Development Server
1. Spin up the localized dev container server by executing:
   ```bash
   npm run dev
   ```
2. Once the operation boots up, click the URL provided in your terminal command lines (usually **`http://localhost:3000`**) to open the live interactive dashboard inside your default web browser.

---

### Step 4: Productive Commands Reference

| Command | Action | Output Description |
| :--- | :--- | :--- |
| `npm install` | Installs dependencies | Downloads local packages into the `node_modules/` folder. |
| `npm run dev` | Runs development server | Opens local host server with real-time modifications update support (Hot Reload). |
| `npm run build` | Compiles for deployment | Bundles and minifies the code assets into a super-fast static output inside `/dist`. |
| `npm run lint` | Inspects type correctness | Checks for TypeScript compilation or naming issues. |

---

## 🛠️ Main App Code Architecture

* **`/src/App.tsx`**: The master core component managing reactive state files loaded, student aggregates logic, system metrics rows, and section layouts.
* **`/src/types.ts`**: Holds shared TypeScript interface templates like `Student`, `Subject`, `RawScore`, and `GPAReportItem`.
* **`/src/components/StudentReportGenerator.tsx`**: The specialized query panel search and A4 PDF printing handler utilizing `jspdf`.
* **`/src/components/DataTables.tsx`**: Renders spreadsheet mock list blocks where users can add/delete columns representing Subjects, Students, and RawScores.
* **`/src/data.ts`**: Contains the baseline simulated academic registry datasets.
