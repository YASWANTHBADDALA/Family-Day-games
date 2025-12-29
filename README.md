# Family Day Quiz

A small, local web quiz app that loads question sets from JSON and saves scores to the browser `localStorage`.

## Quick Start (recommended)

1. Open PowerShell in the project folder (where `index.html` lives):

```powershell
cd "c:\Users\YASWANTHREDDY\Desktop\Family Quiz"
```

2. Start a simple HTTP server (so `fetch()` can load the JSON files reliably).

- Using Python 3 (recommended if installed):

```powershell
python -m http.server 8000
```

- Using Node (if you have Node.js):

```powershell
npx http-server -p 8000
```

3. Open your browser and navigate to:

```
http://localhost:8000
```

Then click the app UI — it boots to the welcome screen and runs in the browser.

## Alternative: VS Code Live Server

- Install the **Live Server** extension for VS Code.
- Open this folder in VS Code and click `Go Live` (bottom-right) to serve the site.

## Opening `index.html` directly

You can double-click `index.html` to open it via the `file://` protocol, however many browsers block `fetch()` on local files for security. If you see errors like "Error loading questions", use one of the local server methods above.

## Files in this project

- **`index.html`**: App shell and entry point that loads `app.js`.
- **`app.js`**: Main application logic (UI, quiz flow, leaderboard, fetches JSON files).
- **`style.css`**: Styles for the UI.
- **`kids.json`**, **`teens.json`**, **`seniors.json`**: Question sets loaded at runtime.

## Notes and troubleshooting

- The app fetches the JSON files listed in `app.js` (`kids.json`, `teens.json`, `seniors.json`). Ensure these files are present in the same folder as `index.html`.
- Scores are stored in `localStorage` under the key `familyDayQuizLeaderboard`.
- If you get JSON or network errors, ensure your browser request URL is `http://localhost:8000/...` and all files are in the served directory.

## Development tips

- To edit assets, open the folder in your code editor and refresh the browser after saving.
- Use the browser DevTools Console to see errors printed by `app.js` (helpful for debugging fetch issues).

---

If you'd like, I can also add a short `package.json` + npm script or a PowerShell script to start the server automatically. Want that?