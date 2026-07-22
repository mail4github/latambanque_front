var number_of_fail_logins = 0;
var is_loggedin = 0;
var redirect_on_login = "/app.html";

if (API.token()) {
    location.href = redirect_on_login;
}

//const err = document.getElementById('err');

function reload_page_on_login(get_param)
{
    if ( is_loggedin ) {
        document.location.href = redirect_on_login + ( typeof get_param == "string" && get_param.length ? "?" + get_param : "");
    }
    else
        document.location.reload();
}

function login(
    email_addr, 
    password, 
    password_hash,
    verification_pin
)
{
    let redirect_get_param = "";
    if ( typeof verification_pin !== "undefined") {
        password = "";
        password_hash = "";
        //redirect_get_param = "page=personal_settings.html";
    }
    else {
        if ( typeof password_hash == "undefined" )
            password_hash = md5( decodeURIComponent(password.replace(/\+/g, "%20")) );
    }

    let date = new Date();
    const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
    const mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(date);
    const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);
    date = `${ye}-${mo}-${da}`;
    
    let password_sign = "";//decodeURIComponent(password.replace(/\+/g, "%20"));
    //password_sign = password_sign.substr(password_sign.length - 3, 3);
    //password_sign = md5(password_sign + date);

    if ( typeof verification_pin == "undefined" ) {
        verification_pin = "";
    }

    let fingerprint = "";
    try {
        if ( typeof fp != "undefined" ) {
            fingerprint = fp.get();
        }
    }
    catch(error){
        write_console_log(" --- fingerprint eror --- " + error);
    }

    let login_data = encodeURIComponent(email_addr + "<div>" + "" + "<div><div><div>" + password_hash + "<div><div>" + verification_pin + "<div>" + password_sign + "<div>" + fingerprint + "<div>");
    login_data = string_to_hex(login_data);
    let url = SITE_DOMAIN + "api/user_login/"; 
    $.ajax({
        method: "POST",
        url: url,
        data: { data: login_data }
    })
    .done(function( ajax__result ) {
        try {
            let arr_ajax__result = JSON.parse(ajax__result);
            if ( arr_ajax__result["success"] ) {
                is_loggedin = 1;
                set_cookie("user_id", arr_ajax__result["values"]["userid"]);
                userid = arr_ajax__result["values"]["userid"];
                localStorage.setItem('cb_token', arr_ajax__result["values"]["hash"]);
                reload_page_on_login(redirect_get_param);
            }
            else {
                if ( arr_ajax__result["error_code"] == "3" ) {
                    setTimeout(function(){ login(); }, 5000);
                }
                else {
                    $("#login_email_wrong").hide();
                    $("#login_password_wrong").hide();
                    if (arr_ajax__result["error_code"] == "WRONG_USER") {
                        $("#login_email_wrong").show();
                    }
                    if (arr_ajax__result["error_code"] == "WRONG_PASSWORD") {
                        $("#login_password_wrong").show();
                    }
                    $("#password").val("");
                    
                    $("#text_entering").hide();
                    $("#text_login").show();

                    number_of_fail_logins++;
                    if (number_of_fail_logins > 3)
                        document.location.reload();
                }
            }
        }
        catch(error){}
    });
    return false;
}


document.getElementById('form').addEventListener('submit', async (e)=>{
    e.preventDefault();
    $("#text_entering").show();
    $("#text_login").hide();
    //err.classList.remove('show');
    //const btn = document.getElementById('submit');
    //btn.disabled = true; 
    //btn.textContent = 'Entrando…';
    login(document.getElementById('docNumber').value.trim(), document.getElementById('password').value);
    /*
    try{
        const data = await API.post('/api/login', {
            docNumber: document.getElementById('docNumber').value.trim(),
            password: document.getElementById('password').value,
        });
        localStorage.setItem('cb_token', data.token);
        location.href = 'app.html';
    }
    catch(ex){
        err.textContent = ex.message; 
        err.classList.add('show');
        btn.disabled = false; 
        btn.textContent = 'Iniciar sesión';
    }*/
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
        m.innerHTML = '<div class="error show">Ingresa tu número de documento.</div>'; 
        return; 
    }
    try{
        await API.post('/api/password-reset', { 
            docNumber: doc 
        });
        m.innerHTML = '<div class="ok">Solicitud enviada. El equipo del banco restablecerá tu contraseña y te notificará. Gracias.</div>';
        document.getElementById('resetDoc').value = '';
    }
    catch(ex){
        m.innerHTML = '<div class="error show">'+ex.message+'</div>';
    }
});