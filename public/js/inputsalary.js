const ui = {
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
};
ui.submit.addEventListener("click", () => {
  Swal.fire({
    title: "Success!",
    icon: "success",
    text: "Bạn đã thêm thành công",
    //   draggable: true
  });
});

for (let i = 0; i < 10; i++) {
  const date = Math.floor(Math.random() * 100);
  const row = `<tr>
      <td>${date}</td>
      <td>${date}</td>
      <td>${date}</td>
      <td>${date}</td>
      <td><button class="btn btn-sm btn-warning" data-bs-toggle="offcanvas" data-bs-target="#offcanvasWithBothOptions" aria-controls="offcanvasWithBothOptions">Sửa</button></td>
      </tr>`;

  ui.tbody.innerHTML += row;
}
ui.plus.addEventListener("click", () => {
  const groups = ui.groupContainer.querySelectorAll(".group-device");
  const newGroup = groups[0].cloneNode(true);

  // reset input
  newGroup.querySelectorAll("input").forEach((input) => (input.value = ""));
  newGroup.querySelector("select").selectedIndex = 0;

  ui.groupContainer.appendChild(newGroup);
  refreshGroupIndex();
});

// Xoá group (event delegation)
ui.groupContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const group = e.target.closest(".group-device");
    if (ui.groupContainer.children.length > 1) {
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
            title: "Deleted!",
            text: "Your file has been deleted.",
            icon: "success",
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
});

// Hàm refresh lại STT
function refreshGroupIndex() {
  const groups = ui.groupContainer.querySelectorAll(".group-device");
  groups.forEach((group, i) => {
    group.querySelector("span").textContent = "Chia lương " + (i + 1);
  });
}
