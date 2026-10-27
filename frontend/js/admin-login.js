(function(){
  const form=document.getElementById("admin-login-form"),message=document.getElementById("admin-login-message");
  if(sessionStorage.getItem("sq_demo_admin_session")==="active")location.replace("admin.html");
  form.addEventListener("submit",event=>{event.preventDefault();const values=new FormData(form),username=String(values.get("username")||"").trim().toLowerCase(),password=String(values.get("password")||"");
    if(username!=="admin@shopequick.demo"||password!=="QuickDemo24!"){message.textContent="Those demo credentials do not match. Use the sample access shown below.";message.classList.add("error");return}
    sessionStorage.setItem("sq_demo_admin_session","active");location.replace("admin.html");
  });
})();
