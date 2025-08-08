const ui={
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

let i=1;
function handlePlusClick()
{
    
    ui.plus.addEventListener("click",()=>{
        ++i;
        const formHtml=
    `<div class="mb-2 form-input">
    <div class="item">
      <div class="inputDate d-flex justify-content-between">
          <label for="">chia lương ${i}</label>
          <i class="bi bi-trash3-fill delete"></i>
        </div>
        <div class="inputDate d-flex justify-content-between gap-2 mt-2">
          <select name="" id="">
            <option selected value="">----Chọn----</option>
            <option value="">Nhà</option>
            <option value="">Ăn</option>
            <option value="">Đi lại</option>
          </select>
          <input type="text" class="form-control" placeholder="Số tiền" />
          <input type="text" class="form-control" placeholder="ghi chú" name="" id="">
        </div>
        </div>
        </div>
    `
        ui.formInput.insertAdjacentHTML("beforeend",formHtml)
    })
}
function handleDeleteClick()
{
     
        ui.group2.addEventListener('click',(e)=>{
            if(e.target.classList.contains('delete'))
            if(confirm("bạn xác nhận xóa?"))
            {
                    e.target.closest('.item').remove()
            }
        })
   
}
handlePlusClick()
handleDeleteClick();