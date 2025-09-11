const Utils= (function  ()  {

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
export default Utils