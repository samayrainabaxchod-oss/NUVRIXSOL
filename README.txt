NuvrixSol — SCROLL FRAME BACKGROUND EDITION

WHAT'S INCLUDED
- Original NuvrixSol website design and sections.
- 300 scroll-controlled video frames, optimized to WebP (~9 MB total).
- The opening background changes frame-by-frame as the user scrolls, like a video scrubber.
- Nearby frames are preloaded only; the browser does not load all 300 full-size PNGs.
- Existing opening title, floating image tiles, navigation, galleries, and page sections remain.

RUN ON WINDOWS
1. Extract this ZIP using File Explorer > Extract All.
2. Open the extracted NuvrixSol_Animated folder.
3. Click the File Explorer address bar, type powershell, and press Enter.
4. Run:
   powershell -ExecutionPolicy Bypass -File .\START-NuvrixSol.ps1
5. The browser should open at http://localhost:8080.
6. Keep the PowerShell window open. Press Ctrl+C to stop the preview server.

REQUIREMENTS
- Windows PowerShell 5.1 or later.
- No Node.js installation is required for this static preview.
- Internet connection is required for the website's existing Google Fonts and external Unsplash imagery.
- The local scroll frames are included in this ZIP.

NOTES
- The sequence is synchronized to the scroll progress of the opening cinematic section. Scroll down to advance and scroll up to reverse.
- Frame images are WebP converted from the provided 1280x720 PNG frames, using lossy compression to reduce download size.
- This is a local preview, not a deployed website.
- Please test on your computer; the archive and file structure are verified, but browser rendering on your device has not been independently run here.


Collection update: six homepage collection tiles are included: Electronics, Home Decor, Mobile Accessories, Furniture, Kitchen Decor, and All Collections. The Explore the edit horizontal area also has direct links for the requested categories. Category backgrounds use stronger contrast/saturation and resized image URLs for faster loading.


SHOPIFY INTEGRATION
See SHOPIFY-SETUP-README.txt. Configure shopify-config.js with your Shopify store domain and Storefront API public token before testing live products and checkout.
