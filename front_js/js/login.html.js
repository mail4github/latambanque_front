var redirect_on_login = "/app.html";

if (API.token()) {
    location.href = redirect_on_login;
}

document.getElementById('form').addEventListener('submit', async (e)=>{
    e.preventDefault();
    $("#text_entering").show();
    $("#text_login").hide();
    login(document.getElementById('email').value.trim(), document.getElementById('password').value);
});

// ¿Olvidaste tu contraseña?
document.getElementById('forgotLink').addEventListener('click', ()=>{
    const box = document.getElementById('resetBox');
    box.style.display = box.style.display==='none' ? 'block' : 'none';
});
document.getElementById('resetBtn').addEventListener('click', async ()=>{
    const doc = document.getElementById('resetDoc').value.trim();
    const m = document.getElementById('resetMsg');
    if (!doc){ 
        m.innerHTML = '<div class="error show">Introduce tu dirección de correo electrónico.</div>'; 
        return; 
    }
    try{
        await API.post('/api/user_send_email_with_verification_pin', { 
            entered_email: doc 
        });
        m.innerHTML = '<div class="ok">Solicitud enviada. El equipo del banco restablecerá tu contraseña y te notificará. Gracias.</div>';
        document.getElementById('resetDoc').value = '';
    }
    catch(ex){
        m.innerHTML = '<div class="error show">'+ex.message+'</div>';
    }
});