function Layout(obj = {}) {
  const _obj = { ...obj };

  let _state = {
    isOpen: true,
    mode: "overlay",
    darkmode: "light",
    user: null,
  };

  const _ui = {
    get menu() {
      return document.querySelector("#btnMenu");
    },
    get navBar() {
      return document.querySelector("#navBar");
    },
    get sideBar() {
      return document.querySelector("#appAside");
    },
    get hiddenText() {
      return document.querySelectorAll(".app_aside-hide");
    },
    get listSetting() {
      return document.querySelector("#listSetting");
    },
    get multiBox() {
      return document.querySelector("#multiBox");
    },
    get groupMultiLang() {
      return document.querySelector("#groupMultiLang");
    },
    get setting() {
      return document.querySelector("#setting");
    },
    get iconLink() {
      return document.querySelectorAll(".app_aside-link--animation");
    },
    get link() {
      return document.querySelectorAll(".app_aside-link--size");
    },
    get darkModeSwitch() {
      return document.querySelector("#darkModeSwitch");
    },
    get main() {
      return document.querySelector("#appMain");
    },
    get userName() {
      return document.querySelector("#userName");
    },
    get userId() {
      return document.querySelector("#userId");
    },
  };

  function setState(newState) {
    _state = { ..._state, ...newState };
    loadData(); // mỗi lần state thay đổi thì render lại
  }

  function handleClickLink() {
    // _ui.link.forEach((item) => {
    //   item.addEventListener("click", (e) => {
    //     e.preventDefault();
    //     _ui.link.forEach((link) => link.classList.remove("active"));
    //     item.classList.add("active");
    //   });
    // });
    const currentPath = window.location.pathname;

    _ui.link.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === currentPath) {
        link.classList.add("active");
      }
    });
  }

  function expandActiveMenu() {
    const activeLinks = document.querySelectorAll(".active");
    activeLinks.forEach((link) => {
      let parentCollapse = link.closest(".collapse");
      while (parentCollapse) {
        parentCollapse.classList.add("show");
        const toggleBtn = document.querySelector(`[data-bs-target="#${parentCollapse.id}"]`);
        if (toggleBtn) {
          toggleBtn.setAttribute("aria-expanded", "true");
        }
        parentCollapse = parentCollapse.parentElement.closest(".collapse");
      }
    });
  }

  function handleClickMenu() {
    const newIsOpen = !_state.isOpen;
    localStorage.setItem("isOpen", JSON.stringify(newIsOpen));
    setState({ isOpen: newIsOpen });
  }

  function handleDarkMode() {
    const newDarkMode = _ui.darkModeSwitch.checked ? "dark" : "light";

    localStorage.setItem("dark-mode", JSON.stringify(newDarkMode));
    setState({ darkmode: newDarkMode });
  }

  function setMode(mode) {
    setState({ mode });
    localStorage.setItem("sidebar-mode", mode);
  }

  function logout() {
    Swal.fire({
      title: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        localStorage.removeItem("userinfo");

        // Reset state app
        _state.user = null;

        // Chuyển hướng
        window.location.href = "/";
      }
    });
  }

  function renderUser() {
    _ui.userName.textContent = _state.user.name;
    _ui.userId.textContent = _state.user.id === 1 ? "Admin" : _state.user.id === 2 ? "Manager" : "User";
  }

  function renderDarkMode() {
    document.documentElement.setAttribute("data-bs-theme", _state.darkmode);
    if (_ui.darkModeSwitch) {
      _ui.darkModeSwitch.checked = _state.darkmode === "dark";
    }
  }

  function renderSidebar() {
    const { main, navBar, sideBar, hiddenText, iconLink } = _ui;
    const { isOpen, mode } = _state;

    // reset trạng thái về mặc định trước
    main?.classList.remove("action-collapse", "action-overlay");
    navBar?.classList.remove("action-collapse", "action-overlay");
    sideBar?.classList.remove("action-collapse", "action-overlay");
    hiddenText.forEach((item) => item.classList.remove("active"));
    iconLink.forEach((item) => item.classList.remove("justify-content-center"));

    // nếu sidebar đang đóng thì thoát sớm
    if (isOpen) return;

    if (mode === "overlay") {
      navBar?.classList.add("action-overlay");
      sideBar?.classList.add("action-overlay");
      main?.classList.add("action-overlay");
    }

    if (mode === "collapse") {
      hiddenText.forEach((item) => item.classList.add("active"));
      iconLink.forEach((item) => item.classList.add("justify-content-center"));
      main?.classList.add("action-collapse");
      navBar?.classList.add("action-collapse");
      sideBar?.classList.add("action-collapse");
    }
  }

  function loadData() {
    renderSidebar();
    renderDarkMode();
    renderUser();
  }

  function handleEventListener() {
    _ui.menu?.addEventListener("click", handleClickMenu);
    _ui.groupMultiLang?.addEventListener("click", () => {
      _ui.multiBox.classList.toggle("d-none");
    });
    _ui.setting?.addEventListener("click", () => {
      _ui.multiBox.classList.add("d-none");
    });
    document.addEventListener("pointerdown", (e) => {
      if (!_ui.multiBox?.contains(e.target) && !_ui.groupMultiLang?.contains(e.target)) {
        _ui.multiBox?.classList.add("d-none");
      }
    });

    _ui.darkModeSwitch?.addEventListener("change", handleDarkMode);
    handleClickLink();
    expandActiveMenu();
  }

  function getLocalStorage(key, defaultValue) {
    try {
      const value = localStorage.getItem(key);
      return value !== null ? JSON.parse(value) : defaultValue;
    } catch (e) {
      console.warn(`Error parsing localStorage key "${key}":`, e);
      return defaultValue;
    }
  }

  function changeState() {
    _state.user = getLocalStorage("userinfo", null);
    _state.isOpen = getLocalStorage("isOpen", false);
    _state.darkmode = getLocalStorage("dark-mode", "light");
  }

  function init() {
    changeState();
    handleEventListener();
    loadData();
  }

  return { init, setMode, logout };
}

export default Layout;
document.addEventListener("DOMContentLoaded", () => {
  const layout = Layout(); // tạo instance
  layout.init();
  layout.setMode("overlay");
  window.logout = layout.logout;
});
