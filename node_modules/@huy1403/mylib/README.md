```markdown
# applib (phiên bản hiện đại hóa)

applib là một thư viện frontend nhỏ gọn bao gồm 3 thành phần chính:
- FormValidator — validate form dựa trên data-rule.
- DataTableLib — bảng dữ liệu hỗ trợ client/server-side, tìm kiếm, phân trang, sắp xếp, render tuỳ biến cột và hàng (rowRenderer).
- ApiClient — wrapper fetch với timeout, xử lý JSON/text và header mặc định.

Tài liệu này hướng dẫn cách dùng, các tuỳ chọn quan trọng và ví dụ.

---

## Cài đặt / Sử dụng
Sao chép file `applib.mjs` vào dự án của bạn và import các class cần thiết. Nếu dùng bundler (webpack/rollup), import bình thường; nếu sử dụng trực tiếp trên trình duyệt, dùng `<script type="module">`.

Ví dụ:
```html
<script type="module">
import { DataTableLib, FormValidator, ApiClient } from './applib.mjs';
// sử dụng ở đây
</script>
```

---

## FormValidator

Cấu trúc HTML mẫu:
```html
<form id="frm">
  <div class="form-group">
    <input name="email" data-rule="isRequired,isEmail" />
    <div class="msg"></div>
  </div>
  <button type="submit">Submit</button>
</form>
```

Khởi tạo:
```js
import { FormValidator } from './applib.mjs';

new FormValidator({
  form: '#frm',
  formGroupSelect: '.form-group',
  message: '.msg',
  onSubmit: data => console.log('submitted', data)
});
```

Quy ước:
- Các rule đọc từ thuộc tính `data-rule`, phân tách bằng dấu phẩy.
- Supported rules:
  - `isRequired`
  - `isEmail`
  - `minLength:N` (ví dụ `minLength:6`)
  - `isMatch:otherInputId` (so khớp với input có id khác)
- Thông báo lỗi được hiển thị trong phần tử match selector `message` trong `formGroupSelect` hoặc phần tử sibling tiếp theo nếu không tìm thấy.

---

## ApiClient

Ví dụ dùng:
```js
import { ApiClient } from './applib.mjs';

const api = new ApiClient('https://api.example.com', { token: 'YOUR_TOKEN', timeout: 10000 });
const users = await api.get('users', { params: { page: 1 }});
```

Tính năng:
- Tự động parse JSON hoặc trả về text nếu content-type không phải JSON.
- Timeout với AbortController.
- Thiết lập header mặc định và Authorization Bearer token.
- Hỗ trợ `get`, `post`, `put`, `delete`.

Ghi chú:
- `buildUrl` xử lý slash an toàn để tránh double-slash.
- Khi gửi FormData, ApiClient không set `Content-Type` để trình duyệt tự set boundary.

---

## DataTableLib

Tính năng chính:
- Hỗ trợ client-side hoặc server-side.
- Tìm kiếm kèm debounce.
- Phân trang (pagination).
- Sắp xếp (sortable). Dùng delegation, tránh đăng nhiều listener.
- Render tuỳ chỉnh theo cột (`columnsConfig`) và render toàn hàng (`rowRenderer`).
- Hooks: `onBeforeFetch`, `onAfterFetch`, `onError`.
- Tuỳ chọn `safeHtml` cho cột nếu muốn chấp nhận innerHTML cho cột đó.

Khởi tạo ví dụ:
```js
import { DataTableLib } from './applib.mjs';

const dt = new DataTableLib({
  api: '/api/users',          // endpoint (dùng khi serverSide=true hoặc để fetch ban đầu)
  tableId: 'tbl-users',      // id của <table> (phải có <thead> và <tbody>)
  rows: 10,
  searchBoxId: 'search',
  loadingId: 'loading',
  errorId: 'error',
  columnsConfig: [
    { field: 'id', label: 'ID' },
    { field: 'name', label: 'Name' },
    { field: 'email', label: 'Email' },
    { field: 'actions', label: 'Actions', render: row => `<a href="/u/${row.id}">Open</a>`, safeHtml: true }
  ],
  // hooks
  // thực hiện các tác vụ như hiện loaading snipper, log lỗi, log data
  onBeforeFetch: () => console.log('fetching...'),
  onAfterFetch: data => console.log('fetched', data),
  onError: err => console.error(err),
  // nếu serverSide=true, cung cấp buildUrl(page, searchTerm)
});

dt.init();
```

---

### rowRenderer — render tùy biến cả hàng (merge cột, layout phức tạp)
Khi bạn cần merge cột hoặc render hàng phức tạp, dùng `rowRenderer`. Nếu `rowRenderer` được cung cấp, thư viện ưu tiên dùng kết quả này cho mỗi `<tr>`.

Hàm signature:
```js
rowRenderer(row, rowIndex, instance) => string | Node | DocumentFragment | Array | null
```

Quy ước kết quả:
- string: gán trực tiếp vào `tr.innerHTML`. Trách nhiệm sanitize thuộc về người dùng (XSS).
- Node hoặc DocumentFragment: append một cách an toàn vào `<tr>`.
- Array: mỗi phần tử là Node hoặc giá trị chuỗi — sẽ tạo `<td>` cho chuỗi.
- falsy (null/undefined/false) hoặc khi `rowRenderer` ném lỗi -> fallback về render mặc định theo `columnsConfig`.

Ví dụ trả HTML (merge cột bằng colspan):
```js
rowRenderer: (row) => `
  <td colspan="2">${row.name} (${row.email})</td>
  <td>${row.status}</td>
  <td><button data-id="${row.id}">Open</button></td>
`
```

Ví dụ trả DocumentFragment (an toàn hơn):
```js
rowRenderer: (row) => {
  const frag = document.createDocumentFragment();
  const td1 = document.createElement('td');
  td1.colSpan = 2;
  td1.textContent = row.name;
  frag.appendChild(td1);
  const td2 = document.createElement('td');
  td2.textContent = row.status;
  frag.appendChild(td2);
  const td3 = document.createElement('td');
  const btn = document.createElement('button');
  btn.textContent = 'Open';
  btn.dataset.id = row.id;
  td3.appendChild(btn);
  frag.appendChild(td3);
  return frag;
}
```

---

## Tuỳ chọn chính của DataTableLib
- api: string — url endpoint (dùng cho fetch ban đầu hoặc server-side).
- rows: number — số dòng mỗi trang.
- tableId: string — id của table.
- columnsConfig: array — danh sách cột: { field, label, render?, safeHtml? }.
- rowRenderer: function — render toàn hàng (ưu tiên).
- serverSide: boolean — bật pagination server-side.
- buildUrl: function(page, searchTerm) — trả URL khi serverSide=true.
- formatData: function(response) — map response thành mảng hoặc object chứa mảng.
- onBeforeFetch/onAfterFetch/onError: hooks.

---

## Bảo mật (XSS)
- Mặc định dùng `textContent` để tránh XSS.
- Nếu sử dụng `safeHtml` cho cột hoặc trả HTML string từ `rowRenderer`, bạn chịu trách nhiệm sanitize dữ liệu (ví dụ: dùng DOMPurify) nếu dữ liệu đến từ nguồn không tin cậy.

---

## Khả năng tiếp cận (Accessibility)
- Thẻ header có `role="button"` khi bật sortable. Nếu cần, mở rộng bằng `aria-sort` và hỗ trợ keyboard để đạt tiêu chuẩn a11y đầy đủ.

---

## Gợi ý nâng cấp tương lai
- Thêm unit tests cho sort/search/validator (Jest).
- Thêm TypeScript types nếu muốn DX tốt hơn.
- Thêm build (UMD/ESM) để phục vụ CDN.
- Thêm tuỳ chọn sanitize và demo ví dụ.

---

## Contribute
- Mở issue hoặc PR nếu muốn mở rộng tính năng.
- Nếu thay đổi DataTableLib, hãy kèm test cho các edge-case sorting/pagination.

```