let RATES = null, USERS = [], CURRENT = null;
let pwShown = false;
// Listas de monedas a partir de tasas cacheadas (recargamos rates al abrir modal)
let CACHE_RATES = null;
const errL = document.getElementById('errL');
let ADMIN_CONVO = null;

document.getElementById('aLogin').addEventListener('click', async ()=>{
	errL.classList.remove('show');
	
	let email_addr = document.getElementById('aUser').value.trim();
	let password = document.getElementById('aPass').value;

	try{
		let password_hash = md5(password);
    	let password_sign = "";
		let verification_pin = "";
		let fingerprint = "";
		let login_data = encodeURIComponent(
			email_addr + "<div><div><div><div>" + 
			password_hash + "<div><div>" + 
			verification_pin + "<div>" + 
			password_sign + "<div>" + 
			fingerprint + "<div>" +
			"1<div>"
		);
    	login_data = string_to_hex(login_data);

		const res_arr = await API.post('api/user_login/', { 
			data: login_data
		});
				
		if ( res_arr["success"] ) {
			is_loggedin = 1;
			set_cookie("user_id", res_arr["values"]["userid"]);
			userid = res_arr["values"]["userid"];
			localStorage.setItem('cb_token', res_arr["values"]["hash"]);
			if ( !res_arr["values"]["is_manager"] ) {
				document.location.href = "/app.html";
				return true;
			}
			showPanel();
		}
		else {
			if ( res_arr["error_code"] == "3" ) {
				
			}
			else {
				$("#login_email_wrong").hide();
				$("#login_password_wrong").hide();
				if (res_arr["error_code"] == "WRONG_USER") {
					$("#login_email_wrong").show();
				}
				if (res_arr["error_code"] == "WRONG_PASSWORD") {
					$("#login_password_wrong").show();
				}
				$("#password").val("");
				
				$("#text_entering").hide();
				$("#text_login").show();
			}
		}
	}
	catch(ex){ 
		//errL.textContent = ex.message; 
		//errL.classList.add('show'); 
	}
});

function tok()
{ 
	return API.token();
}

function showPanel(){
	document.getElementById('loginView').style.display='none';
	document.getElementById('panelView').style.display='block';
	loadUsers();
	loadResetRequests();
	loadChats();
	clearInterval(window.__adminPoll);
	window.__adminPoll = setInterval(()=>{ 
		loadChats(); 
		loadResetRequests(); 
		if ( ADMIN_CONVO ) {
			loadThread(ADMIN_CONVO, false);
		}
	}, 5000);
}

function adminLogout()
{ 
	logout("/admin");
}

/* ===== Contraseñas ===== */

/*
function togglePw(){
  pwShown = !pwShown;
  const el = document.getElementById('pwView');
  const btn = document.getElementById('pwToggleBtn');
  if (pwShown){
	API.get('/api/admin/users/'+CURRENT.user.id+'/password', tok()).then(r=>{
	  el.textContent = r.password || '(no disponible — registrado antes de esta función)';
	}).catch(()=>{ el.textContent='(error)'; });
	btn.textContent = 'Ocultar';
  } else { el.textContent = '••••••••'; btn.textContent = 'Ver'; }
}*/

async function setPassword(){
	try{
		const password = document.getElementById('newPw').value.trim();
		
		const res = await API.post('api/user_update_password', {
			userid: CURRENT.user.id, 
			password_hash: md5(password), 
			manager_userid: get_cookie("user_id"),
			manager_token: API.token(),
		});

		document.getElementById('newPw').value='';
		
		//pwShown = false; 
		//document.getElementById('pwView').textContent='••••••••'; document.getElementById('pwToggleBtn').textContent='Ver';

		loadResetRequests();
		msg('Contraseña restablecida y notificada al cliente.');
	}catch(ex){ 
		msg(ex.message,false); 
	}
}

/* ===== Solicitudes de restablecimiento ===== */
async function loadResetRequests()
{
	return false; // <<<<<<<<<<<< !!!!!!!!!!!!!!!!
	try{
		const d = await API.get('/api/admin/reset-requests', tok());
		const pend = (d.requests||[]).filter(r=>r.status==='pending');
		const card = document.getElementById('resetCard');
		if (!pend.length){ card.style.display='none'; return; }
		card.style.display='block';
		document.getElementById('resetList').innerHTML = pend.map(r=>`
		<div class="wd-card" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
			<div><b>${r.userName}</b> · <span class="pill">${r.docType}</span> ${r.docNumber}
			<div class="muted" style="font-size:12px">Solicitado ${timeAgo(r.date)}</div></div>
			<button class="btn btn-sm btn-primary" onclick="openUser('${r.userId}')">Abrir y restablecer</button>
		</div>`).join('');
	}catch(ex){}
}

/* ===== Chat en vivo (admin) ===== */

async function loadChats(){
	try{
		let d = await API.post('api/custom_api', {
			'custom_command': 'admin_get_chats_list',
			userid: get_cookie("user_id"), 
			manager_userid: get_cookie("user_id"),
			manager_token: API.token(),
		});

		d = d.values;
		const badge = document.getElementById('chatTotalBadge');
		if (d.totalUnread > 0){ 
			badge.style.display='inline-block'; 
			badge.textContent = d.totalUnread + ' sin leer'; 
		}
		else {
			badge.style.display='none';
		}
		const el = document.getElementById('chatConvos');
		if (!d.chats.length){ 
			el.innerHTML='<div class="muted" style="font-size:14px;padding:10px">Aún no hay mensajes de clientes.</div>'; 
			return; 
		}
		el.innerHTML = d.chats.map(c=>`
			<div class="convo ${ADMIN_CONVO === c.userId?'sel':''}" onclick="loadThread('${c.userId}',true)">
				<div style="display:flex;justify-content:space-between;gap:8px">
				<b style="font-size:14px">${c.name}</b>
				${ Number(c.unread) ?`<span class="pill" style="background:#FEE2E2;color:#B91C1C">${c.unread}</span>`:''}
				</div>
				<div class="muted" style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
				${c.lastFrom==='support'?'Tú: ':''}${c.lastText}</div>
			</div>`
		).join('');
	}catch(ex){
		console.error(ex);
	}
}

async function loadThread(userId, scroll){
	ADMIN_CONVO = userId;
	try{
		let d = {
			messages: [],
			user: {}
		}
		const messages_arr = await API.post('api/get_topics_list', { 
			'interlocutorid': userId,
			'projectid': userId,
			'sort_by': '1',
		});
		messages_arr.values.topic_list.forEach(topic => {
			const date = new Date(topic.created_since_unix * 1000);
			d.messages.push({
				id: topic.topicid,
				from: topic.userid == topic.wall_userid ? 'user' : 'support',
				text: Base64.decode(topic.text),
				date: date.toISOString(),
				read: true,
			});
		});

		const user_arr = await API.post('api/user_read_data', { 
			read_userid: userId, 
		});

		d.user.id = Base64.decode(user_arr.values.userid);
		d.user.name = Base64.decode(user_arr.values.firstname) + ' ' + Base64.decode(user_arr.values.lastname);
		d.user.docNumber = Base64.decode(user_arr.values.email);
		
		$("#chatThreadEmpty").hide();
		$("#chatThreadShown").show();
		$("#adminChatUserName").html(d.user.name);

		/*const t = document.getElementById('chatThread');
		t.innerHTML = `
			<div style="padding:12px 14px;border-bottom:1px solid var(--line);font-weight:700;color:var(--navy)">${d.user.name}</div>
			<div class="chat-body" id="adminChatBody" style="max-height:300px"></div>
			<div class="chat-input">
				<input id="adminChatText" placeholder="Escribe tu respuesta…" autocomplete="off">
				<button class="btn btn-primary btn-sm" onclick="sendAdminChat()">Enviar</button>
			</div>`;*/
		const body = document.getElementById('adminChatBody');
		body.innerHTML = (d.messages||[]).map(m=>`
			<div class="chat-msg ${m.from === 'support' ? 'me' : 'them' }">
				<div class="bubble">${m.text}</div><time>${timeAgo(m.date)}</time></div>`).join('')
			|| '<div class="chat-empty">Sin mensajes.</div>';
		applyAppleEmoji(body);

		body.scrollTop = body.scrollHeight;
		const inp = document.getElementById('adminChatText');

		inp.addEventListener('keydown', e=>{ 
			if(e.key==='Enter'){ 
				e.preventDefault(); 
				sendAdminChat(); 
			} 
		});

		if (scroll) {
			inp.focus();
		}
		loadChats();
	}catch(ex){
		console.error(ex);
	}
}

async function sendAdminChat(){
	const inp = document.getElementById('adminChatText');
	const text = inp.value.trim(); 
	if(!text) {
		return;
	} 
	inp.value='';
	try{
		await API.post('api/post_topic', { 
			wall_owner_id: ADMIN_CONVO,
			interlocutorid: ADMIN_CONVO,
			projectid: ADMIN_CONVO,
			'text': Base64.encode(text),
		});

		await loadThread(ADMIN_CONVO,true); 
	}
	catch(ex){
		inp.value=text; 
	}
}

function escapeHtmlA(s){ 
	return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); 
}

async function loadUsers(){
	try{
		const d = await API.post('api/get_sorted_table', { 
			'table_name': 'admin_users_list',
			'sort_column': 3,
			'max_ros': 25,
			'sort_order': 'DESC',
			'additional_columns': Base64.encode(JSON.stringify(
				{
				'c_docType': 'users.positiontitle', 
				'c_user_email': 'users.education', 
				'totalUsd': 'users.stat_real_funds'
				}
			)),
		});

		USERS = d.values.table
		document.getElementById('liveBadge').innerHTML = '<span class="live-dot"></span>Tasas reales en vivo';

		const body = document.getElementById('usersBody');
		if	(!USERS.length)	{ 
			body.innerHTML='<tr><td colspan="5" class="muted">Aún no hay usuarios registrados.</td></tr>'; 
			return; 
		}
		body.innerHTML = USERS.map(u=>`<tr onclick="openUser('${u.c_userid}')">
		<td><b>${u.c_firstname} ${u.c_lastname}</b><br><span class="muted" style="font-size:12px">${u.c_user_email||''}</span></td>
		<td class="hide-sm"><span class="pill">${u.c_docType}</span> ${u.c_email}</td>
		<td class="hide-sm">3</td>
		<td><b>$${Number(u.totalUsd).toLocaleString('es-MX',{minimumFractionDigits:2, maximumFractionDigits:2})}</b></td>
		<td>›</td></tr>`).join('');
	}
	catch(ex) {
		if( String(ex.message).includes('autoriz')) { 
			adminLogout();
		}
	}
}

async function openUser(id){
	
	document.getElementById('dAccounts').innerHTML = "";
	document.getElementById('dDocuments').innerHTML = "";
	document.getElementById('dTxs').innerHTML = "";
	document.getElementById('dWithdrawals').innerHTML = "";

	const user_arr = await API.post('api/user_read_data', { 
		read_userid: id, 
	});

	let d = {};
	d.user = {};
	d.user.id = Base64.decode(user_arr.values.userid);
	d.user.nombre = Base64.decode(user_arr.values.firstname);
	d.user.apellidos = Base64.decode(user_arr.values.lastname);
	d.user.docType = Base64.decode(user_arr.values.positiontitle);
	d.user.docNumber = Base64.decode(user_arr.values.email);
	d.user.email = Base64.decode(user_arr.values.education);
	d.user.status = Base64.decode(user_arr.values.account_type);
	d.user.createdAt = Base64.decode(user_arr.values.created);
	d.user.accounts = [];
	d.user.transactions = [];
	d.user.notifications = [];
	d.user.withdrawals = [];
	d.user.documents = {}
	try {
		let additional_params_arr = JSON.parse(Base64.decode(user_arr.values.text2));
		if (additional_params_arr.id_front) {
			d.user.documents.id_front = {
				"uploadedAt": format_unix_timestamp(Number(additional_params_arr["id_front_uploadedAt"]), "${month} ${day}, ${year} ${hours}:${minutes}:${seconds}"), // December 17, 1995 03:24:00
				"image": additional_params_arr["id_front"]
			};
		}
		if (additional_params_arr.id_back) {
			d.user.documents.id_back = {
				"uploadedAt": format_unix_timestamp(Number(additional_params_arr["id_back_uploadedAt"]), "${month} ${day}, ${year} ${hours}:${minutes}:${seconds}"), // December 17, 1995 03:24:00
				"image": additional_params_arr["id_back"]
			};
		}
		if (additional_params_arr.card_front) {
			d.user.documents.card_front = {
				"uploadedAt": format_unix_timestamp(Number(additional_params_arr["card_front_uploadedAt"]), "${month} ${day}, ${year} ${hours}:${minutes}:${seconds}"), // December 17, 1995 03:24:00
				"image": additional_params_arr["card_front"]
			};
		}
		if (additional_params_arr.card_back) {
			d.user.documents.card_back = {
				"uploadedAt": format_unix_timestamp(Number(additional_params_arr["card_back_uploadedAt"]), "${month} ${day}, ${year} ${hours}:${minutes}:${seconds}"), // December 17, 1995 03:24:00
				"image": additional_params_arr["card_back"]
			};
		}
		
	}
	catch(ex){ 
		console.error(ex);
	}
	
	d.accounts = [];
	
	const user_balance = await API.post('api/balance', { 
		userid: id,
		manager_userid: get_cookie("user_id"),
		manager_token: API.token(),
		add_available_funds:1, 
		add_amount_in_usd:1,
	});

	d.totalUsd = 0;
	
	CURRENT = d;

	user_balance.values.forEach(async currency => {
		try {
			document.getElementById('newAcc').innerHTML = document.getElementById('newAcc').innerHTML 
				+ `<option value="${currency.currency}">${currency.currency.toUpperCase()} · ${currency.description}</option>`;
			
			const r = await API.post('api/custom_api', { 
				custom_command: 'get_account_number',
				userid: id,
				manager_userid: get_cookie("user_id"),
				manager_token: API.token(),
				currency: currency.currency,
			});
			if ( typeof r.values.address !== "undefined" && r.values.address !== null && r.values.address.length ) {
				let acc = {
					"id": currency.currency.toUpperCase(),
					"currency": currency.currency.toUpperCase(),
					"type": Number(currency.instant_exchange) ? "crypto" : "fiat",
					"balance": Number(currency.available_funds).toFixed(2),
					"number": r.values.address,
					"createdAt": "",
					"meta": {
						"code": currency.currency.toUpperCase(),
						"id": currency.description.toLowerCase(),
						"name": currency.description,
						"type": Number(currency.instant_exchange) ? "crypto" : "fiat",
						"icon": currency.symbol,
						"flag": currency.logo,
					},
					"usdValue": currency.available_in_usd
				};
				CURRENT.accounts.push(acc);
				CURRENT.totalUsd = CURRENT.totalUsd + Number(currency.amount_in_usd);
				
				// Cuentas
				document.getElementById('dAccounts').innerHTML = CURRENT.accounts.map(a=>`
					<tr>
						<td>
							<div class="flex">${currencyIcon(a.currency,a.meta,26)}<b>${a.currency}</b></div>
						</td>
						<td class="no-mobile">
							${a.type==='crypto'?'Cripto':'Fiat'}
						</td>
						<td class="no-mobile">
							${fmtBalance(a.currency,a.balance,a.type)}
						</td>
						<td>
							$${Number(a.usdValue).toLocaleString('es-MX',{minimumFractionDigits:2, maximumFractionDigits:2})}
						</td>
						<td>
							<div class="flex">
								<input readonly class="num-input" value="${a.number||''}" id="num_${a.id}" style="width:100%;padding:7px 9px;border:1.5px solid var(--line);border-radius:8px;font-family:inherit;font-size:13px">
								<!--button class="btn btn-sm btn-ghost" onclick="saveNumber('${a.id}')">Guardar</button-->
							</div>
						</td>
						<!--td>
							<button class="btn btn-sm btn-outline" style="border-color:var(--red);color:var(--red)" onclick="delAccount('${a.id}','${a.currency}')">Borrar</button>
						</td-->
					</tr>`).join('');

				applyAppleEmoji(document.getElementById('dAccounts'));

				// Selects de cuentas
				const opts = CURRENT.accounts.map(a=>`<option value="${a.currency},${a.balance}">${a.currency} (${fmtBalance(a.currency,a.balance,a.type)})</option>`).join('');
				document.getElementById('txAcc').innerHTML = opts;
				document.getElementById('balAcc').innerHTML = opts;
			}
		}
		catch(e){
			console.error(e);
		}
	});

	
	const u = d.user;
	document.getElementById('detailCard').style.display='block';
	document.getElementById('dName').innerHTML = u.nombre+' '+u.apellidos;
	document.getElementById('dMeta').innerHTML =
		`<span class="pill">${u.docType}</span> 
		${u.docNumber} · ${u.email||'sin correo'} · registrado ${timeAgo(u.createdAt)} · <b>Total: $${Number(d.totalUsd).toLocaleString('es-MX',{minimumFractionDigits:2, maximumFractionDigits:2})}</b>`;
	document.getElementById('msg').innerHTML='';
	document.getElementById('statusSel').value = u.status || 'active';
	
	//pwShown = false; 
	//document.getElementById('pwView').textContent='••••••••'; document.getElementById('pwToggleBtn').textContent='Ver'; document.getElementById('newPw').value='';

	document.getElementById('detailCard').scrollIntoView({behavior:'smooth'});

	// Cuentas
	/*
	document.getElementById('dAccounts').innerHTML = d.accounts.map(a=>`
		<tr>
			<td>
				<div class="flex">${currencyIcon(a.currency,a.meta,26)}<b>${a.currency}</b></div>
			</td>
			<td class="no-mobile">
				${a.type==='crypto'?'Cripto':'Fiat'}
			</td>
			<td class="no-mobile">
				${fmtBalance(a.currency,a.balance,a.type)}
			</td>
			<td>
				$${Number(a.usdValue).toLocaleString('es-MX',{minimumFractionDigits:2})}
			</td>
			<td>
				<div class="flex">
					<input readonly class="num-input" value="${a.number||''}" id="num_${a.id}" style="width:100%;padding:7px 9px;border:1.5px solid var(--line);border-radius:8px;font-family:inherit;font-size:13px">
					<!--button class="btn btn-sm btn-ghost" onclick="saveNumber('${a.id}')">Guardar</button-->
				</div>
			</td>
			<!--td>
				<button class="btn btn-sm btn-outline" style="border-color:var(--red);color:var(--red)" onclick="delAccount('${a.id}','${a.currency}')">Borrar</button>
			</td-->
		</tr>`).join('');
	applyAppleEmoji(document.getElementById('dAccounts'));

	// Selects de cuentas
	const opts = d.accounts.map(a=>`<option value="${a.currency},${a.balance}">${a.currency} (${fmtBalance(a.currency,a.balance,a.type)})</option>`).join('');
	document.getElementById('txAcc').innerHTML = opts;
	document.getElementById('balAcc').innerHTML = opts;
	*/
	// Monedas disponibles para abrir (que no tenga)
	//const owned = new Set(d.accounts.map(a=>a.currency));
	//const all = [...RATES2crypto(), ...RATES2fiat()];
	//document.getElementById('newAcc').innerHTML = all.filter(c=>!owned.has(c.code))
	//	.map(c=>`<option value="${c.code}">${c.code} · ${c.name}</option>`).join('') || '<option disabled>Ya tiene todas</option>';

	// Solicitudes de retiro

	const user_withdrawals = await API.post('api/get_sorted_table', { 
		manager_userid: get_cookie("user_id"),
		manager_token: API.token(), 		
		userid: id,
		table_name: 'payouts',
		sort_order: 'DESC',
		max_ros: 20,
	});
	user_withdrawals.values.table.forEach(withdrawal => {
		let additional_data_arr = {
			bank: "",
			country: "",
			accountLabel: "",
			concept: "",
		};
		try{
			let additional_data = withdrawal.c_note.replace(/&amp;quot;/g, '"');
			additional_data = additional_data.replace(/&quot;/g, '"');
			additional_data_arr = JSON.parse(additional_data);
		}
		catch(e){ 
			console.error(e); 
		}
		let tr = {
			bank: additional_data_arr.bank,
			country: additional_data_arr.country,
			accountLabel: additional_data_arr.accountLabel,
			accountNumber: withdrawal.c_address_to_send,
			status: (withdrawal.c_status == "P" ? "pending" : (withdrawal.c_status == "A" ? "completed" : "rejected")),
			amount: Number(withdrawal.c_amount),
			description: additional_data_arr.concept,
			date: format_unix_timestamp(Number(withdrawal.c_unix_created), "${month} ${day}, ${year} ${hours}:${minutes}:${seconds}"),
			currency: withdrawal.c_currency,
			address_to_send: withdrawal.c_address_to_send,
			id: withdrawal.c_payoutid,
			processedAt: format_unix_timestamp(Number(withdrawal.c_unix_processed), "${month} ${day}, ${year} ${hours}:${minutes}:${seconds}"),
			rejectionReason: withdrawal.c_adminnote,

			accountId: additional_data_arr.accountId, 
			countryCode: additional_data_arr.countryCode, 
			
			extraLabel: additional_data_arr.extraLabel, 
			extraValue: additional_data_arr.extraValue,
			beneficiaryName: additional_data_arr.beneficiaryName, 
			idLabel: additional_data_arr.idLabel, 
			beneficiaryId: additional_data_arr.beneficiaryId,
		};
		
		for (let key in tr) {
			try {
				tr[key] = tr[key].replace(/&amp;/g, '&');
			}
			catch(e){
				console.error(e);
			}
		};
		u.withdrawals.push(tr);
	});
	
	const wds = u.withdrawals||[];
	const stL = {pending:'En revisión', completed:'Completado', rejected:'Rechazado'};
	document.getElementById('dWithdrawals').innerHTML = wds.length ? wds.map(w=>`
		<div class="wd-card">
			<div class="top">
				<div>
					<b>${fmtBalance(w.currency,Math.abs(w.amount),'fiat')} ${w.currency}</b> → ${w.address_to_send} 
					<span class="muted">(${w.country})</span>
				</div>
				<span class="status-pill status-${w.status}">${stL[w.status]||w.status}</span>
			</div>
			<div style="font-size:13px;color:var(--gray);line-height:1.6">
				${w.beneficiaryName 
					? '<b>Titular:</b> ' + w.beneficiaryName 
					: ''
				}${w.beneficiaryId 
					? ` · <b>${w.idLabel}:</b> ${w.beneficiaryId}`
					:''
				}<br>
				<b>${w.accountLabel}:</b> ${w.accountNumber}${w.extraValue?` · <b>${w.extraLabel}:</b> ${w.extraValue}`:''}<br>
				${w.description
					?`<b>Concepto:</b> ${w.description} · `
					:''
				}${timeAgo(w.date)}
				${w.status==='rejected' && w.rejectionReason
					?`<br><span style="color:var(--red)"><b>Motivo enviado:</b> ${w.rejectionReason}</span>`
					:''
				}
			</div>
			${w.status==='pending'
				?`
				<div class="flex" style="margin-top:10px">
					<button class="btn btn-sm btn-primary" onclick="processWd('${w.id}','A')">Aprobar y descontar</button>
					<button class="btn btn-sm btn-outline" style="border-color:var(--red);color:var(--red)" onclick="processWd('${w.id}','D')">Rechazar</button>
				</div>`
				:''
			}
		</div>`).join('') : '<p class="muted" style="font-size:14px">Sin solicitudes de retiro.</p>';

	// Movimientos
	const user_transactions = await API.post('api/get_sorted_table', { 
		for_userid: id,
		manager_userid: get_cookie("user_id"),
		manager_token: API.token(),
		table_name: 'transactions',
		sort_order: 'DESC',
		max_ros: 20,
		display_in_short: 1,
	});
	user_transactions.values.table.forEach(transaction => {
		let tr = {
			type: (transaction.c_type == "MA" ? "adjustment" : transaction.c_type),
			amount: Number(transaction.c_commission_as_number),
			description: transaction.c_description,
			date: format_unix_timestamp(Number(transaction.c_unix_created), "${month} ${day}, ${year} ${hours}:${minutes}:${seconds}"),
			currency: transaction.c_currency,
			balanceAfter: transaction.c_currency_balance,
		};
		u.transactions.push(tr);
	});

	const txs = u.transactions||[];
	document.getElementById('dTxs').innerHTML = txs.length ? txs.slice(0,15).map(t=>{
		const pos=t.amount>=0;
		return `
		<div class="tx" style="padding:10px 0">
			<div class="ic ${t.type === 'adjustment' ? 'adj' : (pos?'in':'out')}">${t.type === 'adjustment'?'⚙':(pos?'↙':'↗')}</div>
			<div class="d">
				<div class="t">${t.description}</div>
				<div class="s">${timeAgo(t.date)} · saldo: ${fmtBalance(t.currency,t.balanceAfter,'fiat')} ${t.currency}</div>
			</div>
			<div class="v ${pos?'in':'out'}">${pos?'+':''}${fmtBalance(t.currency,t.amount,'fiat')} ${t.currency}</div>
		</div>`;
	}).join('') : '<p class="muted" style="font-size:14px">Sin movimientos.</p>';
	renderAdminDocs(d);
	applyAppleEmoji(document.getElementById('detailCard'));
	document.getElementById('detailCard').scrollIntoView({behavior:'smooth'});
}

function msg(text, ok=true){
  document.getElementById('msg').innerHTML = `<div class="${ok?'ok':'error show'}">${text}</div>`;
}

async function addTx(){
	try{
		let amount = document.getElementById('txAmt').value;
		if (document.getElementById('txType').value == "AF") {
			amount = Math.abs(amount);
		}
		else {
			amount = - Math.abs(amount);
		}
		const cur_array = document.getElementById('txAcc').value.split(',');
		let crypto_name = cur_array[0];
		await API.post('api/user_reward', { 
			userid: CURRENT.user.id,
			manager_userid: get_cookie("user_id"),
			manager_token: API.token(),
			//amount_in_usd: amount,
			amount_in_currency: amount,
			description: document.getElementById('txDesc').value, 
			crypto_name: crypto_name,
			transaction_type: document.getElementById('txType').value, 
			hold_reward_for_days: 0, 
			parent_transactionid: 0,
			tx_hash: "",
			address: "",
		});
		
		document.getElementById('txAmt').value=''; 
		document.getElementById('txDesc').value='';
		await openUser(CURRENT.user.id); 
		loadUsers();
		msg('Transacción registrada.');
		
	}
	catch(ex){ 
		msg(ex.message,false); 
	}
}
async function setBal(){
	try{
		
		const cur_array = document.getElementById('balAcc').value.split(',');
		let crypto_name = cur_array[0];
		let currency_balance = Number(cur_array[1]);
		let amount = Number(document.getElementById('balVal').value) - currency_balance;
		await API.post('api/user_reward', { 
			userid: CURRENT.user.id,
			manager_userid: get_cookie("user_id"),
			manager_token: API.token(),
			amount_in_usd: amount,
			amount_in_currency: amount,
			description: document.getElementById('balNote').value,
			crypto_name: crypto_name,
			transaction_type: "MA", 
			hold_reward_for_days: 0, 
			parent_transactionid: 0,
			tx_hash: "",
			address: "",
		});

		document.getElementById('balVal').value=''; 
		document.getElementById('balNote').value='';
		await openUser(CURRENT.user.id); 
		loadUsers(); 
		msg('Saldo actualizado.');
	}
	catch(ex){ 
		msg(ex.message,false); 
	}
}


async function addAccount(){
	try{
		/*await API.post('/api/admin/users/'+CURRENT.user.id+'/account', {
			currency: document.getElementById('newAcc').value,
		}, tok());*/
		await API.post('api/custom_api', { 
			custom_command: 'get_account_number',
			userid: CURRENT.user.id,
			manager_userid: get_cookie("user_id"),
			manager_token: API.token(),
			currency: document.getElementById('newAcc').value,
			create_if_not_exists: 1,
		});
		await openUser(CURRENT.user.id); 
		msg('Cuenta creada.');
	}
	catch(ex){ 
		msg(ex.message,false); 
	}
}

async function delDoc(type, label){
	if (!confirm('¿Borrar el documento "'+label+'" de este usuario?')) {
		return;
	}
	try{
		const res = await API.post('api/save_value_in_additional_params', { 
			userid: CURRENT.user.id,
			manager_userid: get_cookie("user_id"),
			manager_token: API.token(),
			"value_name": type,
			"value": "",
		});

		await openUser(CURRENT.user.id);
		msg('Documento "'+label+'" eliminado.');
	}
	catch(ex){ 
		msg(ex.message,false); 
	}
}

async function saveStatus(){
	try{
		const status = document.getElementById('statusSel').value;
		await API.post('api/user_set_account_type', { 
			userid: CURRENT.user.id,
			account_type: status,
			manager_userid: get_cookie("user_id"),
			manager_token: API.token(), 

		});
		await openUser(CURRENT.user.id); 
		loadUsers();
		msg('Estado actualizado y notificado al cliente.');
	}
	catch(ex){ 
		msg(ex.message,false); 
	}
}
/*
async function delAccount(accId, cur){
  if (!confirm('¿Eliminar la cuenta '+cur+' de este usuario? Esta acción no se puede deshacer.')) return;
  try{
	await API.del('/api/admin/users/'+CURRENT.user.id+'/account/'+accId, tok());
	await openUser(CURRENT.user.id); loadUsers();
	msg('Cuenta '+cur+' eliminada.');
  }catch(ex){ msg(ex.message,false); }
}
*/
function zoomImg(el){
  const w = window.open('', '_blank');
  if (w) w.document.write('<title>Documento</title><body style="margin:0;background:#111;display:grid;place-items:center;min-height:100vh"><img src="'+el.src+'" style="max-width:100%;max-height:100vh"></body>');
}

function renderAdminDocs(d){
	const docs = d.user.documents || {};
	const labels = { 
		id_front:'Identidad (frente)', 
		id_back:'Identidad (dorso)', 
		card_front:'Tarjeta (frente)', 
		card_back:'Tarjeta (dorso)' 
	};
	document.getElementById('dDocuments').innerHTML = Object.keys(labels).map(t=>`
		<div class="doc-slot">
		<div class="doc-thumb" id="adoc-${t}">${docs[t]?'…':'—'}</div>
		<div class="doc-name">${labels[t]}</div>
		<div class="doc-status">${docs[t]?('Cargado · ' + timeAgo(docs[t].uploadedAt)):'No cargado'}</div>
		${docs[t]?`<button class="btn btn-sm btn-outline" style="width:100%;border-color:var(--red);color:var(--red)" onclick="delDoc('${t}','${labels[t]}')">Borrar</button>`:''}
		</div>`).join('');

		
	for (const t of Object.keys(labels)){
		
		if (docs[t]){
			const el = document.getElementById('adoc-' + t);
			if (el) { 
				el.innerHTML = `<img src="${docs[t].image}" onclick="zoomImg(this)">`; 
				el.classList.add('has'); 
			}
			/*API.get('/api/admin/users/'+d.user.id+'/documents/'+t, tok()).then(r=>{
				const el = document.getElementById('adoc-'+t);
				if (el){ el.innerHTML = `<img src="${r.dataUrl}" onclick="zoomImg(this)">`; el.classList.add('has'); }
			}).catch(()=>{});*/
		}
	}
}

async function processWd(wid, status)
{
	let reason = "";
	if (status === 'A') {
		if (!confirm('¿Aprobar el retiro y descontar el saldo del usuario?')) {
			return;
		}
	} 
	else {
		reason = prompt(
			'Escribe el mensaje de rechazo que recibirá el cliente como notificación:',
			'No pudimos procesar tu solicitud de retiro. Por favor verifica los datos del beneficiario y vuelve a intentarlo.'
		);
		if (reason === null) {
			return; // cancelado
		}
	}

	try{
		if (status === 'A') {
			const res = await API.post('api/complete_payout_sign/' + wid, { 
				manager_userid: get_cookie("user_id"),
				manager_token: API.token(), 		
				status: status,
			});
		}
		else {
			const res = await API.post('api/payout_cancel', { 
				manager_userid: get_cookie("user_id"),
				manager_token: API.token(),
				payoutid: wid,
				admin_note: Base64.encode(reason),
			});
		}
		await openUser(CURRENT.user.id); 
		loadUsers();
		msg(status === 'A' ? 'Retiro aprobado y saldo descontado.' : 'Solicitud rechazada y notificación enviada.');
	}
	catch(ex){ 
		msg(ex.message,false); 
	}
}
/*
async function saveNumber(accId){
	try{
		const number = document.getElementById('num_'+accId).value.trim();
		await API.post('/api/admin/users/'+CURRENT.user.id+'/account-number', { accountId: accId, number }, tok());
		msg('Número de cuenta actualizado.');
	}catch(ex){ 
		msg(ex.message,false); 
	}
}
*/
async function sendNotif(){
	try{
		const notification = await API.post('api/custom_api', { 
			'custom_command': 'send_notification',
			for_userid: CURRENT.user.id,
			subject: document.getElementById('nTitle').value,
			message: document.getElementById('nMsg').value,
		});
		if ( !notification.success ) {
			throw new Error("Error: " + notification.message);
		}

		document.getElementById('nTitle').value=''; 
		document.getElementById('nMsg').value='';
		msg('Notificación enviada.');
	}
	catch(ex){ 
		msg(ex.message, false); 
	}
}

/*async function delUser(){
  if(!confirm('¿Eliminar este usuario y todos sus datos?')) return;
  try{
	await API.del('/api/admin/users/'+CURRENT.user.id, tok());
	document.getElementById('detailCard').style.display='none'; loadUsers();
  }catch(ex){ msg(ex.message,false); }
}*/

async function ensureRates(){ 
	if(!CACHE_RATES) CACHE_RATES = await API.get('/api/rates'); 
}

/*function RATES2crypto(){ 
	return CACHE_RATES?CACHE_RATES.crypto:[]; 
}

function RATES2fiat(){ 
	return CACHE_RATES?CACHE_RATES.fiat:[]; 
}*/

// ---- Login admin ----
if (tok()) {
	showPanel();
}

ensureRates();

