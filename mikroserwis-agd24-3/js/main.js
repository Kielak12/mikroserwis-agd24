
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
