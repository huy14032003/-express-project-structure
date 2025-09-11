import API from "/assets/js/callapi.js";
import Utils from "/assets/js/Utils.js";
const Register = (() => {

  const {postUserLogin, postUserRegister}=API

  const _otps = {};

  const _ui = {
    get userLogin() {
      return document.querySelector("#userLogin");
    },
    get passLogin() {
      return document.querySelector("#passLogin");
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
    get popup() {
      return document.querySelector(".popup");
    },
    get popupContent() {
      return document.querySelector(".popup-content");
    },
    get btnClose() {
      return document.querySelector(".btnclose");
    },
    get btnLogin() {
      return document.querySelector("#btnLogin");
    },
    get btnRegister() {
      return document.querySelector("#btnRegister");
    },
  };

  const _state = {};



  async function handleClickLogin() {
    try {
      const res = await postUserLogin({
        username: _ui.userLogin.value.trim(),
        password: _ui.passLogin.value.trim(),
      });

      if (res.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("userinfo", JSON.stringify(res.user));
        window.location.href = "/home";
      }
    } catch (err) {
      Swal.fire({
        title: "Wrong!",
        text: err.message,
        icon: "error",
      });
    }
  }
  function handleEventListener() {
    _ui.btnLogin.addEventListener("click", (e) => {
      e.preventDefault(); // tránh reload form
      handleClickLogin();
    });
    _ui.btnRegister.addEventListener("click", (e) => {
      e.preventDefault(); // tránh reload form
      handleClickRegister();
    });
  }
  function init(otps = {}) {
    
    Utils.merge(_otps, otps);
    handleEventListener();
  }
  return { init };
})();
export default Register;

document.addEventListener("DOMContentLoaded", () => {
  Register.init();
});
