
window.toggleNav = function(){
  const nav = document.getElementById('nav');
  const btn = document.querySelector('.nav-toggle');
  const open = nav.classList.toggle('open');
  btn.setAttribute('aria-expanded', open ? 'true' : 'false');
};

window.handleFormSubmit = function(e){
  e.preventDefault();
  const form = e.target;
  if(!form.checkValidity()){ form.reportValidity(); return false; }
  document.getElementById('formStatus').textContent = "Dziękujemy! Formularz został wysłany (demo).";
  form.reset();
  return false;
};


// ==== Reservation modal logic + API submit ====
(function(){
  const modal = document.getElementById('reserveModal');
  if(!modal) return;
  const openers = document.querySelectorAll('[data-open-reserve]');
  const closer = modal.querySelector('[data-close-modal]');
  const form = document.getElementById('reserveForm');
  const statusEl = document.getElementById('reserveStatus');

  function open(){ modal.hidden = false; document.body.style.overflow='hidden'; }
  function close(){ modal.hidden = true; document.body.style.overflow=''; statusEl.textContent=''; form.reset(); }

  openers.forEach(btn=>btn.addEventListener('click', open));
  closer.addEventListener('click', close);
  modal.addEventListener('click', (e)=>{ if(e.target===modal) close(); });
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && !modal.hidden) close(); });

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    if(!form.checkValidity()){ form.reportValidity(); return; }
    const data = Object.fromEntries(new FormData(form).entries());
    try{
      const res = await fetch('/api/reservations', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(data)
      });
      if(!res.ok) throw new Error('Błąd serwera');
      statusEl.textContent = 'Dziękujemy! Rezerwacja została zapisana.';
      setTimeout(close, 1000);
    }catch(err){
      statusEl.textContent = 'Nie udało się wysłać rezerwacji. Spróbuj ponownie.';
    }
  });
})();
