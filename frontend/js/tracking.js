(function(){
  const EVENTS_KEY="cg_activity_v1";
  const SESSION_KEY="cg_session_v1";
  function sessionId(){
    let id=sessionStorage.getItem(SESSION_KEY);
    if(!id){id=globalThis.crypto?.randomUUID?.()||`session-${Date.now()}-${Math.random().toString(16).slice(2)}`;sessionStorage.setItem(SESSION_KEY,id)}
    return id;
  }
  function getEvents(){
    try{const value=JSON.parse(localStorage.getItem(EVENTS_KEY)||"[]");return Array.isArray(value)?value:[]}catch{return []}
  }
  function trackEvent(type,details={}){
    const safeTypes=new Set(["product_view","search","category_selection","add_to_cart","cart_removal","checkout_attempt","order_completed"]);
    if(!safeTypes.has(type))return;
    const event={id:globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random()}`,type,timestamp:new Date().toISOString(),sessionId:sessionId()};
    for(const key of ["productId","category","query","orderId"]){if(typeof details[key]==="string")event[key]=details[key].slice(0,160)}
    const events=getEvents();events.push(event);
    try{localStorage.setItem(EVENTS_KEY,JSON.stringify(events.slice(-500)))}catch(error){console.warn("Activity could not be saved in this browser.",error)}
    window.dispatchEvent(new CustomEvent("cg-data-changed"));
  }
  window.ShopTracking={trackEvent,getEvents,clearEvents(){localStorage.removeItem(EVENTS_KEY);window.dispatchEvent(new CustomEvent("cg-data-changed"))}};
})();