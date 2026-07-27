if (API.token()) {
	location.href = 'app.html';
}
const err = document.getElementById('err');
function validPw(pw){ 
	return pw.length>=6 && /[A-Za-z]/.test(pw) && /[0-9]/.test(pw); 
}

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
		const data = await API.post('/api/user_signup', {
			email: document.getElementById('docNumber').value.trim(), 
            hashed_password: md5(pw), 
            firstname: Base64.encode(document.getElementById('nombre').value.trim()), 
            lastname: Base64.encode(document.getElementById('apellidos').value.trim()), 
            country: "",
            parentid: "",
            user_domain: get_domain_name(SITE_DOMAIN),
            send_email: "0",
			do_login: "yes"
            //nickname: Base64.encode(document.getElementById('email').value.trim()),
            //phone: "",
            //avatar_number: document.getElementById('docType').value,
		});
		if (data.values.length == 0) {

			const pairs = data.message.split('&');
			// Map each pair to an array of [key, value]
			const res_arr = {};
			pairs.map(pair => {
				const [key, value] = pair.split('=');
				res_arr[decodeURIComponent(key)] = decodeURIComponent(value);
			});
						
			if ( typeof res_arr.hash !== "undefined" && res_arr.hash.length) {
				localStorage.setItem('cb_token', res_arr.hash);
				set_cookie("user_id", res_arr.userid);
				location.href = 'app.html';
			}
			else {			
				location.href = 'login.html';
			}
		}
		else {
			throw new Error(data["values"]);
		}
	}catch(ex){
		err.textContent = ex.message; 
		err.classList.add('show');
		btn.disabled = false; 
		btn.textContent = 'Crear cuenta';
	}
});