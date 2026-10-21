/* NuvrixSol Shopify Storefront integration. Requires config.js. */
(function () {
  'use strict';
  const cfg = window.NUVRIX_SHOPIFY || {};
  const ready = cfg.storeDomain && !cfg.storeDomain.includes('YOUR-STORE') &&
    cfg.storefrontAccessToken && !cfg.storefrontAccessToken.includes('PASTE_');
  const state = { products: [], collections: [], cartId: '', checkoutUrl: '' };
  const money = (amount, currency) => {
    try { return new Intl.NumberFormat(undefined, {style:'currency',currency:currency || cfg.currencyFallback || 'USD'}).format(Number(amount)); }
    catch (_) { return (currency || '$') + Number(amount || 0).toFixed(2); }
  };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const api = async (query, variables={}) => {
    const domain = String(cfg.storeDomain || '').replace(/^https?:\/\//,'').replace(/\/$/,'');
    const response = await fetch(`https://${domain}/api/${cfg.apiVersion || '2026-07'}/graphql.json`, {
      method:'POST',
      headers:{'Content-Type':'application/json','X-Shopify-Storefront-Access-Token':cfg.storefrontAccessToken},
      body:JSON.stringify({query,variables})
    });
    const body = await response.json();
    if (!response.ok || body.errors) throw new Error((body.errors || [{message:'Shopify request failed'}]).map(e=>e.message).join('; '));
    return body.data;
  };
  const productFields = `id title handle description productType tags availableForSale featuredImage { url altText } images(first:8) { nodes { url altText } } priceRange { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } } variants(first:50) { nodes { id title availableForSale price { amount currencyCode } selectedOptions { name value } } }`;
  const productsQuery = `query Products($first:Int!){ products(first:$first, sortKey:BEST_SELLING){ nodes { ${productFields} } } }`;
  const collectionsQuery = `query Collections($first:Int!){ collections(first:$first){ nodes { id title handle description products(first:24){ nodes { ${productFields} } } } } }`;
  const productByHandleQuery = `query Product($handle:String!){ product(handle:$handle){ ${productFields} } }`;
  const getImage = p => (p.featuredImage && p.featuredImage.url) || (p.images && p.images.nodes[0] && p.images.nodes[0].url) || '';
  const price = p => p.priceRange && p.priceRange.minVariantPrice ? money(p.priceRange.minVariantPrice.amount,p.priceRange.minVariantPrice.currencyCode) : '';
  const categoryOf = p => p.productType || (p.tags && p.tags[0]) || 'Featured';
  function card(p, addButton) {
    const img = getImage(p);
    const variant = (p.variants && p.variants.nodes || []).find(v=>v.availableForSale) || (p.variants && p.variants.nodes || [])[0];
    return `<article class="product-card reveal" role="link" tabindex="0" data-shopify-handle="${esc(p.handle)}" onclick="if(!event.target.closest('.add'))location.href='product.html?handle=${encodeURIComponent(p.handle)}'" onkeydown="if(event.key==='Enter')this.click()">
      <div class="product-image">${img?`<img loading="lazy" decoding="async" src="${esc(img)}" alt="${esc((p.featuredImage&&p.featuredImage.altText)||p.title)}">`:''}
      <span class="tag">${esc(categoryOf(p))}</span>${addButton?`<button class="add" data-shopify-variant="${esc(variant?variant.id:'')}" data-shopify-title="${esc(p.title)}" aria-label="Add ${esc(p.title)} to cart" ${!variant||!variant.availableForSale?'disabled':''}>+</button>`:''}</div>
      <div class="product-meta"><div><h3>${esc(p.title)}</h3><p>${esc(categoryOf(p))}${p.description?` · ${esc(p.description.slice(0,75))}`:''}</p></div><strong>${esc(price(p))}</strong></div></article>`;
  }
  function notice(message) {
    let el=document.getElementById('shopifyNotice');
    if(!el){el=document.createElement('div');el.id='shopifyNotice';el.setAttribute('role','status');el.style.cssText='position:fixed;z-index:9999;bottom:22px;left:50%;transform:translateX(-50%);max-width:calc(100% - 32px);padding:14px 20px;background:#171914;color:#fff;border-radius:12px;font:13px/1.5 Arial,sans-serif;box-shadow:0 10px 35px #0003';document.body.appendChild(el);}
    el.textContent=message;el.hidden=false;
  }
  function configNotice() {
    if(!ready) notice('Shopify setup needed: add your store domain and Storefront API public token in shopify-config.js. Preview products remain visible.');
  }
  async function createCart(variantId) {
    const data=await api(`mutation CartCreate($input:CartInput!){ cartCreate(input:$input){ cart { id checkoutUrl totalQuantity } userErrors { field message } } }`,{input:{lines:[{merchandiseId:variantId,quantity:1}]}});
    const result=data.cartCreate;
    if(result.userErrors && result.userErrors.length) throw new Error(result.userErrors.map(e=>e.message).join(', '));
    state.cartId=result.cart.id;state.checkoutUrl=result.cart.checkoutUrl;
    try{localStorage.setItem('nuvrixShopifyCartId',state.cartId);localStorage.setItem('nuvrixShopifyCheckoutUrl',state.checkoutUrl);}catch(_){}
    return result.cart;
  }
  async function addToCart(variantId,title,button) {
    if(!ready){configNotice();return;}
    if(!variantId){notice('This product currently has no available variant.');return;}
    if(button){button.disabled=true;button.textContent='…';}
    try {
      let cartId=state.cartId;
      try{cartId=cartId||localStorage.getItem('nuvrixShopifyCartId')||'';}catch(_){}
      if(cartId) {
        const data=await api(`mutation AddLines($cartId:ID!,$lines:[CartLineInput!]!){ cartLinesAdd(cartId:$cartId,lines:$lines){ cart { id checkoutUrl totalQuantity } userErrors { field message } } }`,{cartId,lines:[{merchandiseId:variantId,quantity:1}]});
        const result=data.cartLinesAdd;
        if(result.userErrors&&result.userErrors.length) throw new Error(result.userErrors.map(e=>e.message).join(', '));
        state.cartId=result.cart.id;state.checkoutUrl=result.cart.checkoutUrl;
        try{localStorage.setItem('nuvrixShopifyCheckoutUrl',state.checkoutUrl);}catch(_){}
      } else await createCart(variantId);
      notice(`${title} added to your Shopify cart.`);
      const go=document.createElement('button');go.textContent='Checkout';go.style.cssText='margin-left:12px;border:0;border-radius:20px;padding:7px 12px;background:#d9f36f;color:#171914;font-weight:700;cursor:pointer';
      go.onclick=()=>{if(state.checkoutUrl)location.href=state.checkoutUrl;};document.getElementById('shopifyNotice').appendChild(go);
      const count=document.getElementById('count');if(count)count.textContent='✓';
    } catch(e){console.error(e);notice('Could not add to cart: '+e.message);}
    finally{if(button){button.disabled=false;button.textContent='+';}}
  }
  function installAddButtons() {
    document.addEventListener('click', function(e){
      const b=e.target.closest('[data-shopify-variant]');
      if(!b)return;
      e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
      addToCart(b.dataset.shopifyVariant,b.dataset.shopifyTitle||'Product',b);
    },true);
    const bagButton=document.querySelector('button[aria-label="Bag"]');
    if(bagButton) bagButton.addEventListener('click',function(e){
      if(!ready){configNotice();return;}
      let url=state.checkoutUrl;
      try{url=url||localStorage.getItem('nuvrixShopifyCheckoutUrl');}catch(_){}
      if(url){e.preventDefault();e.stopImmediatePropagation();location.href=url;}
    },true);
  }
  function showProducts(products) {
    const grid=document.getElementById('productGrid');
    if(!grid||!products.length)return;
    state.products=products;
    grid.innerHTML=products.map(p=>card(p,true)).join('');
    if(typeof observeReveals==='function')observeReveals();
  }
  async function loadHome() {
    try {
      const data=await api(productsQuery,{first:24});
      const products=data.products.nodes||[];
      if(products.length)showProducts(products);
      const count=document.getElementById('count');
      if(count)count.textContent='0';
    } catch(e){console.error('Shopify product load failed:',e);notice('Shopify connection failed. Check the store domain, Storefront token and Storefront API permissions.');}
  }
  async function loadProduct() {
    const mount=document.getElementById('detail'); if(!mount)return;
    const params=new URLSearchParams(location.search),handle=params.get('handle');
    if(!handle)return;
    if(!ready){configNotice();return;}
    try{
      const data=await api(productByHandleQuery,{handle});
      const p=data.product;if(!p){notice('Product not found in Shopify.');return;}
      state.products=[p];
      document.title='NuvrixSol — '+p.title;
      const img=getImage(p), variants=(p.variants&&p.variants.nodes||[]).filter(v=>v.availableForSale);
      const options=variants.map(v=>`<option value="${esc(v.id)}">${esc(v.title)} · ${esc(money(v.price.amount,v.price.currencyCode))}</option>`).join('');
      mount.innerHTML=`<section class="detail"><div class="heroimg">${img?`<img src="${esc(img)}" alt="${esc((p.featuredImage&&p.featuredImage.altText)||p.title)}">`:''}</div><div class="copy"><div class="eyebrow">${esc(categoryOf(p))}</div><h1>${esc(p.title)}</h1><div class="price">${esc(price(p))}</div><p>${esc(p.description||'A considered everyday find selected by NuvrixSol.')}</p>${variants.length>1?`<label for="shopifyVariant" style="display:block;margin:18px 0 8px">Choose an option</label><select id="shopifyVariant" style="width:100%;padding:12px;background:#111;color:#fff;border:1px solid #777">${options}</select>`:''}<button class="button" id="shopifyBuy" style="cursor:pointer" data-shopify-title="${esc(p.title)}">Add to cart ↗</button><p class="muted">Secure checkout is handled by your Shopify store.</p><a class="back" href="collection.html?category=${encodeURIComponent(categoryOf(p))}">More in ${esc(categoryOf(p))} ↗</a><br><a class="back" href="index.html">Continue exploring the homepage</a></div></section>`;
      document.getElementById('shopifyBuy').onclick=()=>addToCart((document.getElementById('shopifyVariant')||{value:variants[0]&&variants[0].id}).value,p.title,document.getElementById('shopifyBuy'));
    }catch(e){console.error(e);notice('Could not load this Shopify product. Check your Storefront API settings.');}
  }
  async function loadCollection() {
    const grid=document.getElementById('grid');if(!grid)return;
    if(!ready){configNotice();return;}
    const requested=new URLSearchParams(location.search).get('category')||'All';
    try{
      const data=await api(collectionsQuery,{first:50});
      state.collections=data.collections.nodes||[];
      let collection=state.collections.find(c=>c.title.toLowerCase()===requested.toLowerCase()||c.handle.toLowerCase()===requested.toLowerCase().replace(/\s+/g,'-'));
      let products=collection?(collection.products.nodes||[]):[];
      if(!collection||!products.length){
        const all=await api(productsQuery,{first:50});
        const aliases={'mobile accessories':['mobile','accessor'],'kitchen decor':['kitchen'],'home decor':['home decor','decor'],'electronics':['electronics','tech'],'furniture':['furniture','sofa','chair']};
        const terms=aliases[requested.toLowerCase()]||[requested.toLowerCase()];
        products=(all.products.nodes||[]).filter(p=>requested==='All'||terms.some(t=>(p.productType+' '+p.title+' '+(p.tags||[]).join(' ')).toLowerCase().includes(t)));
        if(requested==='All')products=all.products.nodes||[];
      }
      document.getElementById('title').textContent=requested==='All'?'All collections':requested;
      if(products.length)grid.innerHTML=products.map(p=>`<a class="card" href="product.html?handle=${encodeURIComponent(p.handle)}"><div class="img">${getImage(p)?`<img loading="lazy" src="${esc(getImage(p))}" alt="${esc(p.title)}">`:''}</div><h3>${esc(p.title)}</h3><div class="muted">${esc(categoryOf(p))} · ${esc((p.description||'').slice(0,90))}</div><div class="price">${esc(price(p))}</div><span class="button">View product ↗</span></a>`).join('');
      else grid.innerHTML='<p>No Shopify products found for this collection. Add products and assign them to a matching Shopify collection.</p>';
    }catch(e){console.error(e);notice('Could not load Shopify collection. Check the Storefront API permissions.');}
  }
  function init() {
    installAddButtons();
    if(!ready){configNotice();return;}
    if(document.getElementById('productGrid'))loadHome();
    if(document.getElementById('detail'))loadProduct();
    if(document.getElementById('grid'))loadCollection();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();