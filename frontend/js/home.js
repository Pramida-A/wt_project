(function(){
  const categories=[
    {name:"Fruits & Vegetables",mark:"🥭",tone:"produce"},{name:"Groceries",mark:"🌾",tone:"grocery"},
    {name:"Snacks & Beverages",mark:"☕",tone:"snacks"},{name:"Dairy & Bakery",mark:"🥛",tone:"dairy"},
    {name:"Beauty & Personal Care",mark:"✿",tone:"care"},{name:"Home & Kitchen",mark:"⌂",tone:"home"},
    {name:"Stationery & Study",mark:"✎",tone:"stationery"},{name:"Home & Electronics",mark:"⌁",tone:"electronics"}
  ];
  const root=document.getElementById("home-categories");
  if(root)root.innerHTML=categories.map(category=>`<a class="category-tile ${category.tone}" href="products.html?category=${encodeURIComponent(category.name)}" data-category="${window.Store.escapeHTML(category.name)}"><span aria-hidden="true">${category.mark}</span><strong>${window.Store.escapeHTML(category.name)}</strong></a>`).join("");
  root?.addEventListener("click",event=>{const tile=event.target.closest("[data-category]");if(tile)window.ShopTracking?.trackEvent("category_selection",{category:tile.dataset.category})});
  const featured=document.getElementById("featured-products");if(featured)featured.innerHTML=window.SHOP_PRODUCTS.slice().sort((a,b)=>b.popularity-a.popularity).slice(0,8).map(window.Store.renderProductCard).join("");
})();
