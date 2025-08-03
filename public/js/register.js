const ui = {
    get userLogin()
    {
        return document.querySelector('#userLogin')
    },
    get passLogin()
    {
        return document.querySelector('#passLogin')
    },
  get email() {
    return document.querySelector("#email");
  },
  get user() {
    return document.querySelector("#user");
  },
  get pass() {
    return document.querySelector("#pass");
  },
  get btnSubmit() {
    return document.querySelector(".submit");
  },
  get popup()
  {
    return document.querySelector('.popup')
  },
  get popupContent()
  {
    return document.querySelector('.popup-content')
  },
  get btnClose()
  {
    return document.querySelector('.btnclose')
  },
};
const api = new AppLib.getData("http://localhost:3000");

function showPopup(type, message) {
  const icon = type === "success"
    ? "../images/check_19009714.gif"
    : "../images/file-error_19015336.gif";
  const color = type === "success" ? "success" : "error";
  const btnClass = type === "success" ? "btn-success" : "btn-warning";
  const btnText = type === "success" ? "OK" : "Close";

  ui.popupContent.innerHTML = `
    <img src="${icon}" alt="">
    <span class="title ${color}">${type.charAt(0).toUpperCase() + type.slice(1)}!</span>
    <span>${message}</span>
    <button class="btn ${btnClass} mt-3 btnclose">${btnText}</button>
  `;
  ui.popup.style.display = "flex";
  closePopup();
}
function closePopup()
{
 ui.btnClose.addEventListener('click',(e)=>{
    e.preventDefault();
    console.log(e.target);
    ui.popup.style.display='none'
 })

}
document.addEventListener('click',(e)=>{

    if(e.target===ui.popup)
    {
         ui.popup.style.display='none'
    }
})
async function postApiRegister() {
  try {
     const res=await api.post("/api/auth/register", {
      name: ui.user.value.trim(),
      email: ui.email.value.trim(),
      password: ui.pass.value.trim(),
    })
    ui.popup.style.display="flex"
    ui.popupContent.innerHTML='';
        showPopup('success',res.message)
        closePopup()
    
  } catch (error) {
    ui.popup.style.display="flex"
  
    showPopup('error',error.message)
    closePopup();
    console.log(error.message);
  }
}
async function postApiLogin() {
  try {
     const res=await api.post("/api/auth/login", {
      username: ui.userLogin.value.trim(),
      password: ui.passLogin.value.trim(),
    })
   
    ui.popupContent.innerHTML='';
        
        
     localStorage.setItem("token", res.token);
     window.location.href='/home'
  } catch (error) {
    ui.popup.style.display="flex"
  
     showPopup('error',error.message)
    closePopup();
    console.log(error.message);
  }
}
new AppLib.FormValidator({
  form: "#register",
  formGroupSelect: ".form-group",
  message: ".error-message",
  onSubmit: function (data) {
    postApiRegister();
  },
});
new AppLib.FormValidator({
  form: "#login",
  formGroupSelect: ".form-group",
  message: ".error-message",
  onSubmit: function (data) {
    postApiLogin();
  },
});
