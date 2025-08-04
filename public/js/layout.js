const item = document.querySelector(".sidebar .item");
const menuIcon = document.querySelector(".menu-icon");
const allCollapse = document.querySelectorAll(".collapse");
const allArrow = document.querySelectorAll(".bi-chevron-right");
const Wrapper = document.querySelector(".wrapper-container");
const toggle = document.querySelectorAll(".sidebar .link .item .toggle");
const iconArrow = document.querySelectorAll(
  ".sidebar .link .item .bi-chevron-right"
);
const itemCollapse = document.querySelectorAll(".collapse");
const profile=document.querySelector('.profile');
const multiLang=document.querySelector('.multi-lang');

profile.addEventListener('click',()=>{
  document.querySelector('.box').classList.toggle('show');
})
multiLang.addEventListener('click',()=>{
  document.querySelector('.box-multi').classList.toggle('show');
})

menuIcon.addEventListener("click", () => {
  Wrapper.classList.toggle("collsapsed");
  // Đóng tất cả các menu con
  allCollapse.forEach((collapse) => {
    collapse.classList.remove("show");
  });

  // Reset mũi tên
  allArrow.forEach((arrow) => {
    arrow.classList.remove("rotate");
  });
});
let isProcessing = false;

toggle.forEach((item, index) => {
  item.addEventListener("click", (e) => {
    if (isProcessing) {
      e.preventDefault(); // chặn click liên tục
      return;
    }
    isProcessing = true;
    setTimeout(() => {
      isProcessing = false;
    }, 350);
    Wrapper.classList.remove("collsapsed");
    iconArrow[index].classList.toggle("rotate");
  });
});
