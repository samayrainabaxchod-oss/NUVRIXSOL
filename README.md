# NuvrixSol Scroll Animation Preview

Domain configured for GitHub Pages: **https://www.nuvrixsol.store/**

## Run locally on Windows
1. Extract this ZIP.
2. Open the `NuvrixSol_Animated` folder.
3. Type `powershell` in File Explorer's address bar and press Enter.
4. Run: `powershell -ExecutionPolicy Bypass -File .\START-NuvrixSol.ps1`
5. Open `http://localhost:8080`. Scroll down to advance the 300-frame background and scroll up to reverse it.

The background sequence uses WebP frames and only keeps a small nearby preload window to limit memory use. The server sets long-lived cache headers for static images.

## Domain note
The ZIP includes a `CNAME` file for `www.nuvrixsol.store`. On GitHub, configure the same domain under **Repository → Settings → Pages → Custom domain** and set your registrar DNS `CNAME` record for `www` to your GitHub Pages hostname. DNS setup is separate from this ZIP.
