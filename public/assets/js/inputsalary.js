const App = (() => {
  const _state = {};
  const proxyState = new Proxy(_state, {
    set(target, key, value) {
      target[key] = value;
      render();
      return true;
    },
  });
  const _ui = {
    get submit() {
      return document.querySelector("#btnsubmit");
    },
    get plus() {
      return document.querySelector("#btnPlus");
    },
    get delete() {
      return document.querySelector("#btnDelete");
    },
    get group() {
      return document.querySelector("#groupDevice");
    },
    get formInput() {
      return document.querySelector(".form-input");
    },
    get tbody() {
      return document.querySelector("tbody");
    },
    get groupContainer() {
      return document.querySelector("#groupContainer");
    },
    get amoutSalary() {
      return document.querySelector("#amoutSalary");
    },
    get percentSalary() {
      return document.querySelector("#percentSalary");
    },
    get amoutSalaryDetail() {
      return document.querySelector("#amoutSalaryDetail1");
    },
    get form1() {
      return document.querySelector("#form1");
    },
  };

  function renderTable() {
    for (let i = 0; i < 10; i++) {
      const date = Math.floor(Math.random() * 100);
      const row = `<tr>
      <td>${date}</td>
      <td>${date}</td>
      <td>${date}</td>
      <td>${date}</td>
      <td><button class="btn btn-sm btn-warning" data-bs-toggle="offcanvas" data-bs-target="#offcanvasWithBothOptions" aria-controls="offcanvasWithBothOptions">Sửa</button></td>
      </tr>`;

      _ui.tbody.innerHTML += row;
    }
  }

  function handleSubmit() {
    const data=new FormData(_ui.form1)
    const obj=Object.fromEntries(data.entries())
    Swal.fire({
      title: "Success!",
      icon: "success",
      text: "Bạn đã thêm thành công",
      //   draggable: true
    });
    console.log(obj);
  }
  function handlePlusGroup() {
    const groups = _ui.groupContainer.querySelectorAll(".group-device");
    const lastGroup = groups[groups.length - 1];
    const newGroup = lastGroup.cloneNode(true);
    newGroup.querySelectorAll("input").forEach((input) => (input.value = ""));
    _ui.groupContainer.appendChild(newGroup);
    refreshGroupIndex();
  }
  // Xoá group (event delegation)
  function handleDeleteGroup(e) {
    if (e.target.classList.contains("delete-btn")) {
      const group = e.target.closest(".group-device");
      if (_ui.groupContainer.children.length > 1) {
        Swal.fire({
          title: "Are you sure?",
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, delete it!",
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire({
              icon: "success",
              showConfirmButton: false,
              title: "Delete it!",
              timer: 1500,
            });
            group.remove();
            refreshGroupIndex();
          }
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Phải nhiều hơn 1 để xóa !",
        });
      }
    }
  }

  // Hàm refresh lại STT
  function refreshGroupIndex() {
    const groups = _ui.groupContainer.querySelectorAll(".group-device");
    groups.forEach((group, i) => {
      const idx = i + 1;

      // cập nhật id cho detail
      const detailInput = group.querySelector(".detailDevice");
      if (detailInput) {
        detailInput.name = "detailDevice" + idx;
      }

      const detailType = group.querySelector(".typeDeviceSalary");
      if (detailType) {
        detailType.name = "typeDeviceSalary" + idx;
      }
      const note = group.querySelector(".note");
      if (note) {
        note.name = "note" + idx;
      }
      const amoutSalaryDetail = group.querySelector(".amoutSalaryDetail");
      if (amoutSalaryDetail) {
        amoutSalaryDetail.name = "detailDeviceSalary" + idx;
      }

      // nếu bạn có label hoặc text hiển thị số thứ tự thì cũng set lại
      const label = group.querySelector(".group-device span");
      if (label) {
        label.textContent = "Chia lương " + idx;
      }
    });
  }

  function parseCurrency(value) {
    if (!value) return 0;
    // bỏ dấu phẩy phân tách hàng nghìn
    let cleaned = value.replace(/,/g, "");
    return Number(cleaned);
  }

  function parsePercent(value) {
    if (!value) return 0;
    // đổi dấu , thành . để đọc được số thập phân
    let cleaned = value.replace(",", ".");
    return parseFloat(cleaned);
  }

  function handleDeviceSalary(e) {
    const isPercentInput = e.target.classList.contains("precentDetail");
    const salary = parseCurrency(_ui.amoutSalary.value);

    if (isPercentInput) {
      // 🔹 Trường hợp thay đổi % trong group
      const currenGroup = e.target.closest(".group-device");
      if (!currenGroup) return;

      const currenAmountDetail = currenGroup.querySelector(".amoutSalaryDetail");
      if (!currenAmountDetail) return;

      let percent = parsePercent(e.target.value) || 0;

      if (percent < 0 || percent > 100) {
        Swal.fire({
          icon: "error",
          title: "Giá trị không hợp lệ",
          text: "Phần trăm phải nằm trong khoảng 0 - 100",
        });
        e.target.value = "";
        currenAmountDetail.value = "";
        return;
      }

      const total = (salary * percent) / 100;
      currenAmountDetail.value = total.toLocaleString("en-US");
    }

    // 🔹 Luôn luôn kiểm tra tổng %
    let totalPercent = 0;
    const allPercents = _ui.groupContainer.querySelectorAll(".precentDetail");
    allPercents.forEach((input) => {
      totalPercent += parsePercent(input.value) || 0;

      // nếu nhập từ lương tổng thì update lại tất cả chi tiết
      if (!isPercentInput && salary > 0) {
        const group = input.closest(".group-device");
        const detail = group.querySelector(".amoutSalaryDetail");
        const percent = parsePercent(input.value) || 0;
        detail.value = ((salary * percent) / 100).toLocaleString("en-US");
      }
    });

    if (totalPercent > 100) {
      Swal.fire({
        icon: "warning",
        title: "Tổng phần trăm vượt quá 100%",
        text: `Hiện tại tổng là ${totalPercent}%`,
      });
      e.target.value = "";
      const currenGroup = e.target.closest(".group-device");
      if (currenGroup) {
        const currenAmountDetail = currenGroup.querySelector(".amoutSalaryDetail");
        if (currenAmountDetail) {
          currenAmountDetail.value = "";
        }
      }
    }
  }

  function handleGlobalClick(e) {
    if (e.target.classList.contains("only-number")) {
      e.target.value = e.target.value.replace(/[^0-9]/g, "");
    }
    if (e.target.classList.contains("currency-input")) {
      let value = e.target.value.replace(/\D/g, "");
      e.target.value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    if (e.target.classList.contains("precentDetail")) {
      handleDeviceSalary(e);
    }
  }

  function handleAddEventListener() {
    _ui.groupContainer.addEventListener("click", (e) => handleDeleteGroup(e));
    _ui.plus.addEventListener("click", handlePlusGroup);
    _ui.submit.addEventListener("click", (e) => {
      e.preventDefault();
      handleSubmit();
    });
    _ui.amoutSalary.addEventListener("input", (e) => handleDeviceSalary(e));
    document.addEventListener("input", (e) => handleGlobalClick(e));
  }
  function render() {
    renderTable();
  }
  function init() {
    render();
    handleAddEventListener();
  }

  return { init };
})();
export default App;

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
