NUVRIXSOL — SHOPIFY INTEGRATION PACKAGE

IMPORTANT
This website is prepared to connect to Shopify, but it cannot access your store until you add your store domain and Storefront API public access token. Those credentials are unique to your Shopify account and were not included with the website files.

SET UP SHOPIFY
1. Create/sign in to your Shopify store and add products, product images, prices, variants and inventory.
2. In Shopify Admin, open Settings > Apps and sales channels and create/configure a custom app that has Storefront API access (the exact menu labels can vary).
3. Enable Storefront API access to products, collections, and cart/checkout. Generate/copy the Storefront API public access token.
4. Open shopify-config.js in Notepad or VS Code.
5. Replace:
   YOUR-STORE.myshopify.com
   with your actual Shopify store domain, for example yourstore.myshopify.com.
6. Replace PASTE_STOREFRONT_PUBLIC_ACCESS_TOKEN_HERE with the Storefront API PUBLIC access token.
   Never paste an Admin API access token or Admin API secret into this file.
7. Save the file.
8. Run PowerShell from this folder:
   Set-ExecutionPolicy -Scope Process Bypass
   .\START-NUVRIXSOL.ps1
9. Test product cards, product detail pages, collection pages, add-to-cart and checkout.

WHAT THIS PACKAGE CONNECTS
- Homepage product grid pulls real Shopify products and prices.
- Collection pages load Shopify collections/products.
- Product detail page can load by Shopify product handle.
- Add-to-cart creates/updates a Shopify cart.
- Checkout redirects to Shopify's hosted checkout.
- The original homepage animation, styling and other sections are retained.

NOTES
- The browser storefront uses Shopify's Storefront API and a public Storefront token. Public tokens are designed for storefront use; never use a private/Admin token here.
- Your Shopify store must have products published to the relevant sales channel and Storefront API permissions enabled.
- For a category page to map directly, create Shopify collections with matching names (Electronics, Home Decor, Mobile Accessories, Furniture, Kitchen Decor). The integration also tries a title/tag/type match when no matching collection exists.
- This is a static website preview. To publish it online, host the files on a static hosting service and use your own domain; the local PowerShell server is only for local testing.
- Prices and checkout currency are controlled by Shopify Markets/store settings.
- Browser network access is required for Shopify API requests.
