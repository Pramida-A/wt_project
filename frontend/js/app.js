(function(){
  const KEYS={cart:"sq_cart_v1",profiles:"sq_profiles_v1",user:"sq_current_user_v1",orders:"sq_orders_v1",wishlist:"sq_wishlist_v1"};
  function read(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
  function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));window.dispatchEvent(new CustomEvent("cg-data-changed"));return true}catch{toast("This browser could not save the change. Check available storage.",true);return false}}
  function escapeHTML(value){return String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char]))}
  function money(value){return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(Number(value)||0)}
  function getCart(){return read(KEYS.cart,{})}
  function getStock(id){const saved=read("sq_admin_stock_v1",{}),product=(window.SHOP_PRODUCTS||[]).find(item=>item.id===id);return Number.isInteger(saved[id])?saved[id]:Math.max(0,Number(product?.stock)||0)}
  function setStock(id,quantity){const saved=read("sq_admin_stock_v1",{});saved[id]=Math.max(0,Math.floor(Number(quantity)||0));const ok=write("sq_admin_stock_v1",saved);const updated=read("sq_stock_updated_v1",{});updated[id]=new Date().toISOString();write("sq_stock_updated_v1",updated);return ok}
  function cartCount(){return Object.values(getCart()).reduce((sum,quantity)=>sum+(Number(quantity)||0),0)}
  function setCurrentUser(user){write(KEYS.user,user)}
  function getCurrentUser(){return read(KEYS.user,null)}
  function addToCart(productId,quantity=1){
    const product=(window.SHOP_PRODUCTS||[]).find(item=>item.id===productId);if(!product)return;
    const cart=getCart(),stock=getStock(productId),next=(Number(cart[productId])||0)+quantity;
    if(stock<1){toast(`${product.name} is currently out of stock.`,true);return}
    if(next>stock){toast(`Only ${stock} available right now.`,true);return}
    cart[productId]=Math.min(20,next);if(write(KEYS.cart,cart)){window.ShopTracking?.trackEvent("add_to_cart",{productId,category:product.category});toast(`${product.name} added to your cart.`)}
  }
  function toggleWishlist(productId){const list=read(KEYS.wishlist,[]),index=list.indexOf(productId);if(index>=0){list.splice(index,1);toast("Removed from your wishlist.")}else{list.push(productId);toast("Saved to your wishlist.")}write(KEYS.wishlist,list);return index<0}
  function renderProductCard(product){
    const name=escapeHTML(product.name),stock=getStock(product.id),tag=product.tag?`<span class="product-tag">${escapeHTML(product.tag)}</span>`:"",out=stock<1;
    const saved=read(KEYS.wishlist,[]).includes(product.id);
    return `<article class="product-card"><a class="product-image-wrap" href="product.html?id=${encodeURIComponent(product.id)}" aria-label="View ${name}"><img class="product-image" src="${escapeHTML(product.image)}" alt="${name}" loading="lazy">${tag}</a><button class="quick-add" data-add="${escapeHTML(product.id)}" type="button" aria-label="Add ${name} to cart" title="Add to cart" ${out?"disabled":""}>${out?"–":"+"}</button><button class="wishlist-button" data-wishlist="${escapeHTML(product.id)}" type="button" aria-label="${saved?"Remove from":"Add to"} wishlist" aria-pressed="${saved}">${saved?"♥":"♡"}</button><div class="product-info"><p class="product-category">${escapeHTML(product.category)}</p><div class="product-title-row"><a class="product-title" href="product.html?id=${encodeURIComponent(product.id)}">${name}</a><span class="product-price">${money(product.price)}${product.mrp?`<del>${money(product.mrp)}</del>`:""}</span></div><p class="product-unit">${escapeHTML(product.unit||"1 piece")} · <span class="${stock<=5?"stock-low-text":"stock-available-text"}">${out?"Out of stock":stock<=5?`Only ${stock} left`:"In stock"}</span></p><div class="product-rating"><span class="star">★</span> ${Number(product.rating).toFixed(1)} <span>(${product.reviews})</span></div></div></article>`;
  }
  function toast(message,isError=false){let region=document.querySelector(".toast-region");if(!region){region=document.createElement("div");region.className="toast-region";region.setAttribute("aria-live","polite");document.body.append(region)}const item=document.createElement("div");item.className=`toast${isError?" error":""}`;item.textContent=message;region.append(item);setTimeout(()=>item.remove(),2800)}
  function renderChrome(){
    const header=document.getElementById("site-header");
    if(header)header.innerHTML=`<div class="delivery-strip"><div class="wrap delivery-inner"><span>⚡ Quick delivery in your neighbourhood</span><button class="location-button" id="location-button" type="button">⌖ Deliver to <strong id="delivery-city">Mumbai</strong> <span>⌄</span></button></div></div><header class="site-header"><div class="wrap nav-wrap"><a class="brand" href="index.html"><span class="brand-mark">s.</span><span>ShopeQuick</span></a><nav class="main-nav" id="main-nav" aria-label="Main navigation"><a href="products.html">Shop all</a><a href="products.html?category=Fruits%20%26%20Vegetables">Fresh produce</a><a href="products.html?category=Groceries">Groceries</a><a href="products.html?category=Offers">Offers</a></nav><div class="nav-actions"><form class="header-search" id="header-search"><span aria-hidden="true">⌕</span><input name="q" type="search" aria-label="Search products" placeholder="Search atta, mangoes…"></form><a class="icon-link" href="orders.html" aria-label="My orders and wishlist">♡</a><a class="icon-link bag-link" href="cart.html" aria-label="Shopping bag">♧<span class="cart-count" id="cart-count">0</span></a><a class="icon-link account-link" href="${getCurrentUser()?"orders.html":"login.html"}" aria-label="Your account">○</a><button class="menu-toggle" id="menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded="false">☰</button></div></div></header>`;
    const footer=document.getElementById("site-footer");if(footer)footer.innerHTML=`<footer class="site-footer"><div class="wrap footer-inner"><a class="brand" href="index.html"><span class="brand-mark">s.</span><span>ShopeQuick</span></a><span>Your neighbourhood store, online.</span><span>Static academic demo · no real payments</span></div></footer>`;
    header?.querySelector(".main-nav")?.insertAdjacentHTML("beforeend",'<a href="orders.html">My orders</a><a href="admin-login.html">Admin</a>');
    updateCartCount();const city=read("sq_delivery_city_v1","Mumbai"),cityLabel=document.getElementById("delivery-city");if(cityLabel)cityLabel.textContent=city;
    document.getElementById("location-button")?.addEventListener("click",()=>{const next=prompt("Choose your delivery city",read("sq_delivery_city_v1","Mumbai"));if(next?.trim()){write("sq_delivery_city_v1",next.trim());document.getElementById("delivery-city").textContent=next.trim()}});
    document.getElementById("header-search")?.addEventListener("submit",event=>{event.preventDefault();const query=new FormData(event.currentTarget).get("q").trim();if(query)window.ShopTracking?.trackEvent("search",{query});location.href=`products.html?q=${encodeURIComponent(query)}`});
    document.getElementById("menu-toggle")?.addEventListener("click",event=>{const nav=document.getElementById("main-nav"),open=nav.classList.toggle("open");event.currentTarget.setAttribute("aria-expanded",String(open))});
  }
  function updateCartCount(){const badge=document.getElementById("cart-count");if(badge)badge.textContent=cartCount()}
  document.addEventListener("click",event=>{const wish=event.target.closest("[data-wishlist]");if(wish){toggleWishlist(wish.dataset.wishlist);wish.setAttribute("aria-pressed",String(read(KEYS.wishlist,[]).includes(wish.dataset.wishlist)));wish.textContent=wish.getAttribute("aria-pressed")==="true"?"♥":"♡";return}const button=event.target.closest("[data-add]");if(button)addToCart(button.dataset.add)});
  document.addEventListener("cg-data-changed",updateCartCount);
  window.Store={KEYS,read,write,escapeHTML,money,getCart,getStock,setStock,cartCount,setCurrentUser,getCurrentUser,addToCart,toggleWishlist,renderProductCard,toast,updateCartCount};
  const page=location.pathname.split("/").pop(),authPages=new Set(["login.html","register.html","admin-login.html","admin.html"]);
  if(!getCurrentUser()&&!authPages.has(page)){location.replace("login.html");return}
  renderChrome();
})();
