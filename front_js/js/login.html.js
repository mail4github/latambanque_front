if (API.token()) location.href = 'app.html';
const err = document.getElementById('err');
document.getElementById('form').addEventListener('submit', async (e)=>{
  e.preventDefault();
  err.classList.remove('show');
  const btn = document.getElementById('submit');
  btn.disabled = true; btn.textContent = 'Entrando…';
  try{
    const data = await API.post('/api/login', {
      docNumber: document.getElementById('docNumber').value.trim(),
      password: document.getElementById('password').value,
    });
    localStorage.setItem('cb_token', data.token);
    location.href = 'app.html';
  }
  catch(ex){
    err.textContent = ex.message; err.classList.add('show');
    btn.disabled = false; btn.textContent = 'Iniciar sesión';
  }
});

// ¿Olvidaste tu contraseña?
document.getElementById('forgotLink').addEventListener('click', ()=>{
  const box = document.getElementById('resetBox');
  box.style.display = box.style.display==='none' ? 'block' : 'none';
});
document.getElementById('resetBtn').addEventListener('click', async ()=>{
  const doc = document.getElementById('resetDoc').value.trim();
  const m = document.getElementById('resetMsg');
  if (!doc){ m.innerHTML = '<div class="error show">Ingresa tu número de documento.</div>'; return; }
  try{
    await API.post('/api/password-reset', { docNumber: doc });
    m.innerHTML = '<div class="ok">Solicitud enviada. El equipo del banco restablecerá tu contraseña y te notificará. Gracias.</div>';
    document.getElementById('resetDoc').value='';
  }
  catch(ex){ 
    m.innerHTML = '<div class="error show">'+ex.message+'</div>';
  }
});