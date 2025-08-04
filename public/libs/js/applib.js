
(function (global) {
  class FormValidator {
    constructor(option) {
      this.option = option;
      this.rules = {
        isRequired: (value) =>
          value.trim() ? "" : "*Trường này không được để trống.",
        isEmail: (value) =>
          /\S+@\S+\.\S+/.test(value) ? "" : "*Email không hợp lệ.",
        minLength: (value, min) =>
          value.length >= min ? "" : `*Phải có ít nhất ${min} ký tự.`,
        isMatch: (value, compareValue) => {
          const compareInput = document.getElementById(compareValue);
          return value === compareInput?.value ? "" : "*Giá trị không khớp.";
        },
      };
      this.init();
    }

    getParent(element, selector) {
      while (element.parentElement) {
        if (element.parentElement.matches(selector))
          return element.parentElement;
        element = element.parentElement;
      }
    }

    showError(input, message) {
      const formGroup = this.getParent(input, this.option.formGroupSelect);
      const msg =
        formGroup?.querySelector(this.option.message) ||
        formGroup.nextElementSibling;
      if (msg) {
        msg.innerHTML = message;
        input.classList.add("invalid");
      }
    }

clearError(inputElement) {
  const formGroup = this.getParent(inputElement,this.option.formGroupSelect);
  if (formGroup) {
    const messageElement = formGroup.querySelector(this.option.message); // chắc chắn lấy đúng thẻ error
    if (messageElement) {
      messageElement.innerHTML = '';
    }
    inputElement.classList.remove('invalid');
  }
}

    validate(input) {
      const rules = input.dataset.rule ? input.dataset.rule.split(",") : [];
      let error = "";
      for (let rule of rules) {
        const [ruleName, ...params] = rule.split(":");
        if (this.rules[ruleName]) {
          error = this.rules[ruleName](input.value, ...params);
          if (error) break;
        }
      }

      if (error) {
        this.showError(input, error);
        return false;
      } else {
        this.clearError(input);
        return true;
      }
    }

    init() {
      const form = document.querySelector(this.option.form);
      if (!form) return;

      form.onsubmit = (e) => {
        e.preventDefault();
        let isValid = true;

        form.querySelectorAll("input, select").forEach((input) => {
          if (!this.validate(input)) isValid = false;
        });

        if (isValid && typeof this.option.onSubmit === "function") {
          const formData = new FormData(form);
          const data = {};
          formData.forEach((value, key) => (data[key] = value));
          this.option.onSubmit(data);
        }
      };

      form.querySelectorAll("input, select").forEach((input) => {
        input.oninput = () => this.validate(input);
        input.onblur = () => this.validate(input);
      });
    }
  }

  class DataTableLib {
    constructor(options = {}) {
      const defaults = {
        api: null,
        rows: 5,
        currentPage: 1,
        lastPage: 1,
        onRender: null,
        tableId: "tbl-application",
      };

      Object.assign(this, defaults, options);
      this.data = [];
      this.filteredData = [];
    }

    async init() {
      await this.fetchData();
    }

    async fetchData() {
      try {
        const res = await fetch(this.api);
        this.data = await res.json();
        this.filteredData = [...this.data];
        this.updatePagination();
        this.render();
      } catch (err) {
        console.error("Lỗi khi fetch:", err);
      }
    }

    updatePagination() {
      this.lastPage = Math.ceil(this.filteredData.length / this.rows) || 1;
      this.currentPage = Math.min(this.currentPage, this.lastPage);
    }

    getDataForCurrentPage() {
      const start = (this.currentPage - 1) * this.rows;
      const end = start + this.rows;
      return this.filteredData.slice(start, end);
    }

    renderPagination() {
      document.querySelector(".pagination-wrapper")?.remove();

      const isFirst = this.currentPage === 1;
      const isLast = this.currentPage === this.lastPage;

      const html = `
        <div class="pagination-wrapper">
          <div class="pagination-nav">
            <button class="page-btn prev-page" ${
              isFirst ? "disabled" : ""
            }>◀</button>
            <span class="page-info">Trang ${this.currentPage} / ${
        this.lastPage
      }</span>
            <button class="page-btn next-page" ${
              isLast ? "disabled" : ""
            }>▶</button>
          </div>
        </div>
      `;

      const tableElem = document.getElementById(this.tableId);
      tableElem
        ?.closest(".table-responsive")
        ?.insertAdjacentHTML("afterend", html);

      document.querySelector(".prev-page")?.addEventListener("click", () => {
        if (!isFirst) {
          this.currentPage--;
          this.render();
        }
      });

      document.querySelector(".next-page")?.addEventListener("click", () => {
        if (!isLast) {
          this.currentPage++;
          this.render();
        }
      });
    }

    flattenValues(obj) {
      return Object.values(obj).flatMap((val) =>
        typeof val === "object" && val !== null
          ? this.flattenValues(val)
          : [val]
      );
    }

    search(keyword = "") {
      const key = keyword.toLowerCase().trim();
      this.filteredData = key
        ? this.data.filter((item) =>
            this.flattenValues(item).some((val) =>
              String(val ?? "")
                .toLowerCase()
                .includes(key)
            )
          )
        : [...this.data];

      this.currentPage = 1;
      this.updatePagination();
      this.render();
    }

    render() {
      if (typeof this.onRender === "function") {
        const data = this.getDataForCurrentPage();
        this.onRender(data, this);
      }
      this.renderPagination();
    }

    reload() {
      this.filteredData = [...this.data];
      this.updatePagination();
      this.render();
    }
  }

  class getData {
    constructor(baseURL = "") {
      this.baseURL = baseURL;
    }
    buildQueryParams(params = {}) {
      return Object.keys(params)
        .map(
          (key) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
        )
        .join("&");
    }

    async request(endpoint, method = "GET", data = null, headers = {}) {
      const token = localStorage.getItem("token"); // optional

      const config = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      };

      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }

      if (data && method !== "GET") {
        config.body = JSON.stringify(data);
      }

      try {
        const response = await fetch(this.baseURL + endpoint, config);

        const contentType = response.headers.get("content-type");
        const parse = contentType?.includes("application/json")
          ? response.json()
          : response.text();

        if (!response.ok) {
          const errorData = await parse;
          throw new Error(errorData.message || `HTTP error ${response.status}`);
        }

        return await parse;
      } catch (error) {
        console.error(`[API ${method}] ${endpoint}:`, error);
        throw error;
      }
    }
    get(endpoint, params = {}, headers = {}) {
      const query = this.buildQueryParams(params);
      const url = query ? `${endpoint}?${query}` : endpoint;
      return this.request(url, "GET", null, headers);
    }
    post(endpoint, data, headers = {}) {
      return this.request(endpoint, "POST", data, headers);
    }

    put(endpoint, data, headers = {}) {
      return this.request(endpoint, "PUT", data, headers);
    }

    delete(endpoint, headers = {}) {
      return this.request(endpoint, "DELETE", null, headers);
    }
  }

  global.AppLib = {
    FormValidator,
    DataTableLib,
    getData,
  };
})(window);

// Validate form
//  new AppLib.FormValidator({
//     form: "#register",
//     formGroupSelect: ".form-group",
//     message: ".error-message",
//     onSubmit: function (data) {
//       console.log("Đăng ký thành công", data);
//     },
//   });

//   // Table với tìm kiếm và phân trang
//   const table = new AppLib.DataTableLib({
//     api: "https://jsonplaceholder.typicode.com/users",
//     tableId: "tbl-application", đổi theo id được
//     rows: 5,
//     onRender: function (data, instance) {
//       const tbody = document.querySelector("#tbl-application tbody");
//       tbody.innerHTML = data
//         .map((item) => `<tr><td>${item.id}</td><td>${item.name}</td><td>${item.email}</td></tr>`)
//         .join("");
//     },
//   });
//   table.init();

//   document.getElementById("searchInput").addEventListener("input", function () {
//     table.search(this.value);
//   });
