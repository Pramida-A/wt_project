(function(){
  const search=document.getElementById("catalog-search"),category=document.getElementById("category-filter"),price=document.getElementById("price-filter"),sort=document.getElementById("sort-products"),availability=document.getElementById("availability-filter"),discount=document.getElementById("discount-filter"),products=window.SHOP_PRODUCTS||[];let lastQuery="";
  category.innerHTML+=[...new Set(products.map(item=>item.category))].sort().map(name=>`<option value="${window.Store.escapeHTML(name)}">${window.Store.escapeHTML(name)}</option>`).join("");category.innerHTML+='<option value="Offers">Offers</option>';
  const params=new URLSearchParams(location.search);search.value=params.get("q")||"";const initial=params.get("category");if(initial&&(initial==="Offers"||products.some(item=>item.category===initial)))category.value=initial;
  function render(){
    const query=search.value.trim().toLowerCase();if(query&&query!==lastQuery){window.ShopTracking?.trackEvent("search",{query});lastQuery=query}
    let result=products.filter(item=>item.name.toLowerCase().includes(query)||item.category.toLowerCase().includes(query)||item.description.toLowerCase().includes(query));
    if(category.value==="Offers")result=result.filter(item=>item.mrp>item.price);else if(category.value!=="all")result=result.filter(item=>item.category===category.value);
    if(price.value!=="all"){const [min,max]=price.value.split("-").map(Number);result=result.filter(item=>item.price>=min&&item.price<max)}
    if(discount.value==="discounted")result=result.filter(item=>item.mrp>item.price);
    if(availability.value==="available")result=result.filter(item=>window.Store.getStock(item.id)>0);
    if(sort.value==="price-low")result.sort((a,b)=>a.price-b.price);else if(sort.value==="price-high")result.sort((a,b)=>b.price-a.price);else if(sort.value==="rating")result.sort((a,b)=>b.rating-a.rating);else result.sort((a,b)=>b.popularity-a.popularity);
    document.getElementById("result-count").textContent=`${result.length} ${result.length===1?"item":"items"}`;document.getElementById("catalog-products").innerHTML=result.map(window.Store.renderProductCard).join("");document.getElementById("catalog-empty").hidden=result.length>0;
  }
  let timer;search.addEventListener("input",()=>{clearTimeout(timer);timer=setTimeout(render,160)});category.addEventListener("change",()=>{if(category.value!=="all")window.ShopTracking?.trackEvent("category_selection",{category:category.value});render()});price.addEventListener("change",render);sort.addEventListener("change",render);availability.addEventListener("change",render);discount.addEventListener("change",render);
  document.getElementById("clear-filters").addEventListener("click",()=>{search.value="";category.value="all";price.value="all";sort.value="popular";availability.value="all";discount.value="all";lastQuery="";render()});window.addEventListener("cg-data-changed",render);render();
})();
