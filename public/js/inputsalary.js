const ui={
    get submit()
    {
        return document.querySelector('.submit');
    },
    get plus(){
        return document.querySelector('.plus');
    },
    get delete(){
        return document.querySelector('.delete');
    },
    get group2(){
        return document.querySelector('.group2');
    },
    get formInput()
    {
        return document.querySelector('.form-input');
    }
}
ui.submit.addEventListener('click',()=>{
   Swal.fire({
  title: "Success!",
  icon: "success",
  text:"Bạn đã thêm thành công"
//   draggable: true
});
})
