const Sidebar=(()=>{
  const _opts={
    menuIcon:null,
    sideBar:null,
    navBar:null,
    app_main:null,
    btnDarkMode:null,
    groupMultiLang:null,
    multiBox:null,
  }
  const ui={
    get menuIcon()
    {
      return document.querySelector(_opts.menuIcon)
    },
    get sideBar()
    {
      return document.querySelector(_opts.sideBar)
    },
    get navBar()
    {
      return document.querySelector(_opts.navBar)
    },
    get app_main()
    {
      return document.querySelector(_opts.app_main)
    },
    get btnDarkMode()
    {
      return document.querySelector(_opts.btnDarkMode)
    },
    get groupMultiLang()
    {
      return document.querySelector(_opts.groupMultiLang)
    },
    get multiBox()
    {
      return document.querySelector(_opts.multiBox)
    },
  };
  const state={
    isDark:false,
  };


function handleEventListener()
{
handleClickMenu()
handleClickDarkMode()
handleClickMulti();
}


function handleClickMenu()
{
  ui.menuIcon.addEventListener('click',()=>{
    ui.sideBar.classList.toggle("collapsed")
    ui.navBar.classList.toggle("collapsed")
    ui.app_main.classList.toggle("collapsed")
  })
}
function handleClickDarkMode()
{
  ui.btnDarkMode.addEventListener('click',()=>{
    state.isDark = !state.isDark;
    console.log(state.isDark);
    ui.btnDarkMode.classList.toggle('darkMode');
    document.body.classList.toggle("darkMode");
    state.isDark? ui.btnDarkMode.innerHTML=`<i class="bi bi-brightness-high fs-5 text-light"></i>`:ui.btnDarkMode.innerHTML=` <i class="bi bi-moon-stars fs-5"></i>`
  })
}
function handleClickMulti()
{
  ui.groupMultiLang.addEventListener('click',()=>{
    ui.multiBox.classList.toggle('d-none')
  })
}
  function init(opt = {})
  {
    Utils.merge(_opts,opt)
    handleEventListener()
  }
  return{init};
})();

const Utils = (() => {

    /**
     * @param {object} target The object that is store data
     * @param {object} resorce The object that need passing data to target
     * @returns {object} The object is merged
     */
    function merge (target, resorce) {
        for (let i in resorce) {
            if (
                i in target &&
                typeof resorce[i] === 'object' &&
                typeof target[i] === 'object'
            ) {
                merge(target[i], resorce[i]);
                continue;
            }
            target[i] = resorce[i];
        }
        return target;
    };

    function debounce (func, timeout = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => { func.apply(this, args) }, timeout);
        };
    }

    function throttle (func, timeout = 300) {
        let lastTime = 0;
        return (...args) => {
            let now = Date.now();
            if (now - lastTime >= timeout) {
                func.apply(this, args);
                lastTime = now;
            }
        }
    }

    function getParamsURL (str) {
        const prm = decodeURIComponent(decodeURIComponent(new URLSearchParams(location.search).get(str)));
        return prm === 'null' ? null : prm;
    }

    /**
     * @param {string} field The name of params that you want to change the value.
     * @param {string | number} value The value must be change.
     */
    function changeParamsURL (field, value) {
        const url = new URL(window.location);
        url.searchParams.set(field, value);
        const newUrl = url.toString().replace(/\+/g, '%20');
        window.history.pushState({}, '', newUrl);
    }

    /**
     * 
     * @param {any} val Giá trị bất kỳ
     */
    function fixNullish(val) {
        return val ?? 'N/A';
    }
    return {
        debounce,
        throttle,
        getParamsURL,
        changeParamsURL,
        merge,
        fixNullish
    }
})();
