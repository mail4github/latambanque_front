if (API.token()) location.href = 'app.html';
const err = document.getElementById('err');
function validPw(pw){ return pw.length>=6 && /[A-Za-z]/.test(pw) && /[0-9]/.test(pw); }

document.getElementById('form').addEventListener('submit', async (e)=>{
  e.preventDefault();
  err.classList.remove('show');
  const pw = document.getElementById('password').value;
  if (!validPw(pw)){
    err.textContent = 'La contraseña debe tener mínimo 6 caracteres e incluir letras y números.';
    err.classList.add('show'); return;
  }
  const btn = document.getElementById('submit');
  btn.disabled = true; btn.textContent = 'Creando…';
  try{
    const data = await API.post('/api/register', {
      nombre: document.getElementById('nombre').value.trim(),
      apellidos: document.getElementById('apellidos').value.trim(),
      docType: document.getElementById('docType').value,
      docNumber: document.getElementById('docNumber').value.trim(),
      email: document.getElementById('email').value.trim(),
      password: pw,
    });
    localStorage.setItem('cb_token', data.token);
    location.href = 'app.html';
  }catch(ex){
    err.textContent = ex.message; err.classList.add('show');
    btn.disabled = false; btn.textContent = 'Crear cuenta';
  }
});