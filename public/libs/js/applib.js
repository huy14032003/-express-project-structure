/**
 * applib.mjs - Modernized FormValidator, DataTableLib, ApiClient
 * - safer URL handling
 * - abort + timeout handling
 * - search/sort robust (nulls, numbers, strings)
 * - prevent duplicate listeners (delegation)
 * - recursive array extraction
 * - flattenValues with cycle guard
 * - safe rendering by default (avoid innerHTML unless explicit)

*/

/* -------------------- ApiClient -------------------- */

export class ApiClient {
  constructor(baseUrl = "", options = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.defaultHeaders = options.headers || {};
    this.token = options.token || null;
    this.defaultTimeout = options.timeout || 10000;
    this.endpoints={}
  }

  setToken(token) {
    this.token = token;
  }

  buildUrl(endpoint) {
    return `${this.baseUrl}/${endpoint}`.replace(/\/+$/, "");
  }

  getDefaultHeaders(noCache = false) {
    const headers = {
      "Content-Type": "application/json",
      ...this.defaultHeaders,
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    if (noCache) {
      headers["Cache-Control"] = "no-cache";
      headers["Pragma"] = "no-cache";
    }

    return headers;
  }

  async fetchWithTimeout(resource, options = {}) {
    const { timeout = this.defaultTimeout } = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(resource, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(id);

      if (!response.ok) {
        let errorDetail =null;
        const errorBody = await response.json();
        try {
          errorDetail = errorBody.message || JSON.stringify(errorBody);
        } catch (err) {}
        throw {
          status: response.status,
          url: resource,
          body: errorBody,
          message: errorBody?.message || `Request failed with status ${response.status}`
        };
      }

      return await response.json();
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("Request timeout exceeded");
      }
      throw error;
    }
  }

  buildQueryParams(params = {}) {
    const query = new URLSearchParams(params).toString();
    return query ? `?${query}` : "";
  }

  async get(endpoint, { params = {}, noCache = false, timeout } = {}) {
    const url = this.buildUrl(endpoint) + this.buildQueryParams(params);
    return this.fetchWithTimeout(url, {
      method: "GET",
      headers: this.getDefaultHeaders(noCache),
      timeout,
    });
  }

  async post(endpoint, body = {}, { noCache = false, timeout } = {}) {
    const isFormData = body instanceof FormData;

    return this.fetchWithTimeout(this.buildUrl(endpoint), {
      method: "POST",
      headers: isFormData ? undefined : this.getDefaultHeaders(noCache),
      body: isFormData ? body : JSON.stringify(body),
      timeout,
    });
  }

  async put(endpoint, body = {}, { noCache = false, timeout } = {}) {
    return this.fetchWithTimeout(this.buildUrl(endpoint), {
      method: "PUT",
      headers: this.getDefaultHeaders(noCache),
      body: JSON.stringify(body),
      timeout,
    });
  }

  async delete(endpoint, { noCache = false, timeout } = {}) {
    return this.fetchWithTimeout(this.buildUrl(endpoint), {
      method: "DELETE",
      headers: this.getDefaultHeaders(noCache),
      timeout,
    });
    
  }
  registerGetEndpoint(name, url, cacheOpt) {
    this.endpoints[name] = (params = {}) =>
      this.get(url, { params, noCache: cacheOpt === "no-cache" });
  }

  registerPostEndpoint(name, url) {
    this.endpoints[name] = (data = {}) =>
      this.post(url, data);
  }

  registerPutEndpoint(name, url) {
    this.endpoints[name] = (data = {}) =>
      this.put(url, data);
  }

  registerDeleteEndpoint(name, url) {
    this.endpoints[name] = (params = {}) =>
      this.delete(url, { params });
  }
}

/* -------------------- DataTableLib -------------------- */

export class DataTableLib {
  constructor(options = {}) {
    const defaults = {
      api: null,
      rows: 5,
      currentPage: 1,
      tableId: "tbl-application",
      onRender: null,
      // new: rowRenderer - function(row, rowIndex, tableInstance) => string|Node|null
      rowRenderer: null,
      pagination: true,
      searchBoxId: "",
      serverSide: false,
      totalRows: 0,
      loadingId: "",
      errorId: "",
      sortable: true,
      paginationId: "",
      columnsConfig: [],
      searchDebounceMs: 400,
      buildUrl: null,
      formatData: null,
      // hooks
      onBeforeFetch: null,
      onAfterFetch: null,
      onError: null,
      emptyMessage: "No data available",
      emptyRenderer: null, // optional: (container) => Node | string (string sẽ được gán bằng textContent trừ khi bạn muốn innerHTML)
      emptyClass: "dt-empty", // class cho <tr> khi empty
    };
    this.config = Object.assign({}, defaults, options);
    // copy main props for convenience
    Object.assign(this, this.config);

    this.data = [];
    this.filteredData = [];
    this.sortConfig = { key: null, direction: "asc" };
    this.baseApi = this.api;

    this._searchTimer = null;
    this._abortController = null;
  }

  // find first array in nested object (DFS)
  getArrayFromData(data, visited = new WeakSet()) {
    if (Array.isArray(data)) return [...data];
    if (data && typeof data === "object") {
      if (visited.has(data)) return [];
      visited.add(data);
      for (const key in data) {
        try {
          const val = data[key];
          if (Array.isArray(val)) return [...val];
          if (val && typeof val === "object") {
            const found = this.getArrayFromData(val, visited);
            if (found.length) return found;
          }
        } catch {}
      }
    }
    return [];
  }

  async init() {
    // initial fetch + setup
    await this.fetchData();
    this._setupSearch();
    // sorting uses delegation attached after render; ensure it's attached
    if (this.sortable) this.enableSorting();
  }

  _setupSearch() {
    if (!this.searchBoxId) return;
    const input = document.getElementById(this.searchBoxId);
    if (!input) return;
    input.addEventListener("input", (e) => {
      const keyword = e.target.value || "";
      clearTimeout(this._searchTimer);
      this._searchTimer = setTimeout(() => {
        if (this.serverSide) {
          this.currentPage = 1;
          this.fetchData(1, keyword);
        } else {
          this.search(keyword);
        }
      }, this.searchDebounceMs);
    });
  }

  async fetchData(page = this.currentPage, searchTerm = "") {
    this.showLoading(true);
    try {
      try {
        this._abortController?.abort();
      } catch {}
      this._abortController = new AbortController();

      if (typeof this.config.onBeforeFetch === "function") {
        try {
          this.config.onBeforeFetch({ page, searchTerm });
        } catch {}
      }

      let url =
        this.serverSide && typeof this.buildUrl === "function"
          ? this.buildUrl(page, searchTerm)
          : this.api;

      if (!url) {
        const msg = "No API URL provided";
        this.showError(msg);
        if (typeof this.config.onError === "function")
          this.config.onError(new Error(msg));
        this.showLoading(false);
        return;
      }

      const res = await fetch(url, { signal: this._abortController.signal });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      let result;
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) result = await res.json();
      else result = await res.text();

      if (typeof this.formatData === "function") {
        const formatted = this.formatData(result) || [];
        this.data = Array.isArray(formatted)
          ? formatted
          : this.getArrayFromData(formatted);
      } else {
        this.data = this.getArrayFromData(result);
      }

      this.filteredData = [...this.data];
      this.totalRows = this.serverSide
        ? result.total || this.filteredData.length
        : this.filteredData.length;

      if (typeof this.config.onAfterFetch === "function") {
        try {
          this.config.onAfterFetch(this.filteredData);
        } catch {}
      }

      this.render();
    } catch (err) {
      if (err.name !== "AbortError") {
        this.showError(err.message || String(err));
        if (typeof this.config.onError === "function") this.config.onError(err);
      }
    } finally {
      this.showLoading(false);
    }
  }

  // flatten values recursively with cycle protection
  flattenValues(obj, seen = new WeakSet()) {
    if (obj == null) return [obj];
    if (typeof obj !== "object") return [obj];
    if (seen.has(obj)) return [];
    seen.add(obj);
    if (Array.isArray(obj)) {
      return obj.flatMap((v) => this.flattenValues(v, seen));
    }
    return Object.values(obj).flatMap((val) =>
      typeof val === "object" && val !== null
        ? this.flattenValues(val, seen)
        : [val]
    );
  }

  search(keyword = "") {
    const key = String(keyword || "")
      .toLowerCase()
      .trim();
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
    this.render();
  }

  enableSorting() {
    const table = document.getElementById(this.tableId);
    if (!table) return;
    const thead = table.querySelector("thead");
    if (!thead) return;
    if (thead.dataset.sortAttached) return;
    thead.dataset.sortAttached = "1";

    thead.addEventListener("click", (e) => {
      const th = e.target.closest("th");
      if (!th) return;
      const key = th.dataset.key;
      if (!key) return;
      this.sortConfig.direction =
        this.sortConfig.key === key && this.sortConfig.direction === "asc"
          ? "desc"
          : "asc";
      this.sortConfig.key = key;
      this.sortData();
    });
  }

  sortData() {
    const { key, direction } = this.sortConfig;
    if (!key) return;
    const normalize = (v) => {
      if (v == null) return "";
      if (typeof v === "number") return v;
      const num = Number(v);
      if (!Number.isNaN(num) && String(v).trim() !== "") return num;
      return String(v).toLowerCase();
    };

    this.filteredData.sort((a, b) => {
      const valA = normalize(a[key]);
      const valB = normalize(b[key]);
      if (valA < valB) return direction === "asc" ? -1 : 1;
      if (valA > valB) return direction === "asc" ? 1 : -1;
      return 0;
    });
    this.render();
  }

  escapeHtml(str = "") {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  renderTableRows() {
    const table = document.getElementById(this.tableId);
    const thead = table?.querySelector("thead");
    const tbody = table?.querySelector("tbody");
    if (!tbody || !thead) return;

    // build header
    thead.innerHTML = "";
    const headerRow = document.createElement("tr");
    this.columnsConfig.forEach((col) => {
      const th = document.createElement("th");
      th.textContent = col.label || col.field;
      if (col.field) th.dataset.key = col.field;
      if (this.sortable) th.setAttribute("role", "button");
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // build rows
    tbody.innerHTML = "";
    let displayData = this.filteredData;
    let totalPages = 1;

    if (this.pagination) {
      if (this.serverSide) {
        totalPages = Math.ceil(this.totalRows / this.rows) || 1;
      } else {
        totalPages = Math.ceil(displayData.length / this.rows) || 1;
        const start = (this.currentPage - 1) * this.rows;
        const end = start + this.rows;
        displayData = displayData.slice(start, end);
      }
    }

    const fragment = document.createDocumentFragment();
    displayData.forEach((row, rowIndex) => {
      const tr = document.createElement("tr");

      // NEW: if user provided rowRenderer, use it (can return HTML string or Node)
      if (typeof this.rowRenderer === "function") {
        try {
          const out = this.rowRenderer(row, rowIndex, this);
          if (out instanceof Node) {
            tr.appendChild(out);
            fragment.appendChild(tr);
            return;
          } else if (typeof out === "string") {
            // user expects full HTML for the row
            tr.innerHTML = out;
            fragment.appendChild(tr);
            return;
          } else if (Array.isArray(out)) {
            out.forEach((item) => {
              if (item instanceof Node) tr.appendChild(item);
              else {
                const td = document.createElement("td");
                td.textContent = String(item ?? "");
                tr.appendChild(td);
              }
            });
            fragment.appendChild(tr);
            return;
          }
          // if out is falsy, fallback to default column rendering
        } catch (err) {
          // if rowRenderer throws, fallback to default rendering
          console.error("rowRenderer error:", err);
        }
      }

      // default per-column rendering
      this.columnsConfig.forEach((col) => {
        const td = document.createElement("td");
        try {
          if (typeof col.render === "function") {
            const out = col.render(row);
            if (out instanceof Node) {
              td.appendChild(out);
            } else if (col.safeHtml) {
              td.innerHTML = String(out ?? "");
            } else {
              td.textContent = String(out ?? "");
            }
          } else {
            const val = row[col.field] ?? "";
            td.textContent = String(val);
          }
        } catch (err) {
          td.textContent = "";
        }
        tr.appendChild(td);
      });

      fragment.appendChild(tr);
    });
    tbody.appendChild(fragment);

    if (this.pagination) this.renderPagination(totalPages);
    // enableSorting attaches on thead only once; ensure it's attached
    if (this.sortable) this.enableSorting();
  }

  renderPagination(totalPages) {
    if (!this.pagination) return;
    if (this.serverSide)
      totalPages = Math.ceil(this.totalRows / this.rows) || 1;

    const containerId = this.paginationId || `pagination-${this.tableId}`;
    let container = document.getElementById(containerId);

    if (!container) {
      container = document.createElement("div");
      container.id = containerId;
      const tableElem = document.getElementById(this.tableId);
      const wrapper =
        tableElem?.closest(".table-responsive") || tableElem?.parentElement;
      wrapper?.appendChild(container);
    }

    container.innerHTML = "";

    const addButton = (label, page, active = false, disabled = false) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = label;
      if (active) btn.classList.add("active");
      if (disabled) btn.disabled = true;
      if (!disabled) {
        btn.addEventListener("click", () => {
          this.currentPage = Math.min(Math.max(1, page), totalPages);
          if (this.serverSide) this.fetchData(this.currentPage);
          else this.renderTableRows();
        });
      }
      container.appendChild(btn);
    };

    addButton("«", this.currentPage - 1, false, this.currentPage === 1);
    if (this.currentPage > 2) addButton(1, 1);
    if (this.currentPage >= 3)
      container.appendChild(document.createTextNode("..."));
    for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
      if (i > 0 && i <= totalPages) addButton(i, i, i === this.currentPage);
    }
    if (this.currentPage < totalPages - 2)
      container.appendChild(document.createTextNode("..."));
    if (this.currentPage < totalPages - 1) addButton(totalPages, totalPages);
    addButton(
      "»",
      this.currentPage + 1,
      false,
      this.currentPage === totalPages
    );
  }

  render() {
    // legacy onRender (kept): called with filteredData and instance
    if (typeof this.onRender === "function")
      this.onRender(this.filteredData, this);
    this.renderTableRows();
  }

  reload() {
    this.filteredData = [...this.data];
    this.currentPage = 1;
    this.render();
  }

  showLoading(show) {
    if (!this.loadingId) return;
    const el = document.getElementById(this.loadingId);
    if (el) el.style.display = show ? "block" : "none";
  }

  showError(message) {
    if (!this.errorId) return;
    const el = document.getElementById(this.errorId);
    if (el) {
      el.textContent = message;
      el.style.display = "block";
    } else {
      // fallback console
      console.error("DataTableLib Error:", message);
    }
  }
}
