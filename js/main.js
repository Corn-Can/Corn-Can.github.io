/* ----------------- 側邊欄折疊邏輯 ----------------- */
document.querySelectorAll('.menu-group-title').forEach(title=>{
    title.addEventListener('click',()=>{

        title.classList.toggle('active');
        const id=title.dataset.accordion;
        const submenu=document.getElementById(id);
        submenu.classList.toggle('active');
    });
  });
  
  /* ----------------- 模組切換 ----------------- */
  const menuItems = document.querySelectorAll('.menu-item');
  const modules = document.querySelectorAll('.module');
  menuItems.forEach(item=>{
    item.addEventListener('click', ()=>{
      menuItems.forEach(i=>i.classList.remove('active'));
      item.classList.add('active');
      const targetId = item.dataset.target;
      modules.forEach(m=>m.style.display = m.id === targetId ? 'block':'none');
    });
  });