requireAuth();
let ME = null, OWNED = new Set();

/* ===== Saldo total con animación al recibir dinero ===== */
let lastTotal = null;

function fmtUsd2(n){ 
	return Number(n).toLocaleString('es-MX',{
		minimumFractionDigits:2,
		maximumFractionDigits:2}
	);
}

function setTotalBalance(value){
	const el = document.getElementById('totalBalance');
	if (lastTotal !== null && value > lastTotal + 0.005){
		animateMoneyIn(lastTotal, value);
	} else {
		el.textContent = '$' + fmtUsd2(value);
	}
	lastTotal = value;
}

function animateMoneyIn(from, to){
	const card = document.querySelector('.balance-card');
	const el = document.getElementById('totalBalance');
	card.classList.remove('money-in'); void card.offsetWidth; // reinicia la animación
	card.classList.add('money-in');
	// insignia "+ $monto"
	const pop = document.createElement('div');
	pop.className = 'money-pop';
	pop.textContent = '+ $' + fmtUsd2(to - from) + ' USD';
	card.appendChild(pop);
	setTimeout(()=>pop.remove(), 2200);
	// conteo ascendente
	const dur = 1400, start = performance.now();
	function step(now){
		const t = Math.min((now - start) / dur, 1);
		const ease = 1 - Math.pow(1 - t, 3);
		el.textContent = '$' + fmtUsd2(from + (to - from) * ease);
		if (t < 1) requestAnimationFrame(step);
		else { el.textContent = '$' + fmtUsd2(to); setTimeout(()=>card.classList.remove('money-in'), 700); }
	}
	requestAnimationFrame(step);
}
// Sondeo en vivo: refresca y anima si cambia el saldo o el estado de un retiro.
let knownWd = {};
async function pollMe(){
  if (document.hidden || !ME) return;
  try{
	const data = await API.get('api/user_read_data');
	let changed = (lastTotal !== null && Math.abs(data.totalUsd - lastTotal) > 0.005);
	const transitions = [];
	for (const w of (data.user.withdrawals || [])){
	  if (knownWd[w.id] && knownWd[w.id] !== w.status){ transitions.push(w); changed = true; }
	}
	if (changed){
	  await load();
	  for (const w of transitions){
		if (w.status === 'completed') celebrateWithdrawal(w.id);
		else if (w.status === 'rejected') rejectWithdrawal(w.id);
	  }
	}
  }catch(e){}
}

/* ===== Burbujas de solicitud de retiro (estados + contador + animaciones) ===== */
function renderWdCard(w){
  const amount = fmtBalance(w.currency, Math.abs(w.amount), 'fiat') + ' ' + w.currency;
  const dest = `→ ${w.bank} · ${w.country}`;
  const acct = `${w.accountLabel}: ${w.accountNumber}`;
  if (w.status === 'pending'){
	const deadline = new Date(w.date).getTime() + 5*60*1000;
	return `<div class="wd-note wd-pending" id="wd-${w.id}">
	  <div class="wd-head">
		<span class="wd-state">⏳ En revisión</span>
		<span class="wd-timer" id="timer-${w.id}" data-deadline="${deadline}">5:00</span>
	  </div>
	  <div class="wd-amount">${amount}</div>
	  <div class="wd-dest">${dest}</div>
	  <div class="wd-sub">${acct}</div>
	  <div class="wd-msg" id="wdmsg-${w.id}">Verificando tu solicitud… el tiempo estimado es de 3 a 5 minutos.</div>
	</div>`;
  }
  if (w.status === 'completed'){
	return `<div class="wd-note wd-done" id="wd-${w.id}">
	  <div class="wd-head"><span class="wd-state">Completado</span><span class="wd-time">${timeAgo(w.processedAt||w.date)}</span></div>
	  <div class="wd-amount">${amount}</div>
	  <div class="wd-dest">${dest}</div>
	  <div class="wd-msg">¡Tu retiro fue procesado con éxito! 🎉</div>
	</div>`;
  }
  return `<div class="wd-note wd-rejected" id="wd-${w.id}">
	<div class="wd-head"><span class="wd-state">Rechazado</span><span class="wd-time">${timeAgo(w.processedAt||w.date)}</span></div>
	<div class="wd-amount">${amount}</div>
	<div class="wd-dest">${dest}</div>
	<div class="wd-msg"><b>Motivo:</b> ${w.rejectionReason || 'Tu solicitud no pudo procesarse.'} <br><span class="muted" style="font-size:12px">El dinero fue devuelto a tu cuenta.</span></div>
  </div>`;
}
function celebrateWithdrawal(id){
  const el = document.getElementById('wd-'+id);
  if (!el) return;
  el.classList.add('flash-green');
  confettiBurst(el);
}
function rejectWithdrawal(id){
  const el = document.getElementById('wd-'+id);
  if (el) el.classList.add('flash-red');
}
function confettiBurst(target){
  const rect = target.getBoundingClientRect();
  const cx = rect.left + rect.width/2, cy = rect.top + 24;
  const colors = ['#16A34A','#C0982E','#2a4677','#22c55e','#fbbf24','#ef4444','#ffffff'];
  for (let i=0;i<34;i++){
	const p = document.createElement('div');
	p.className = 'confetti-piece';
	p.style.left = cx+'px'; p.style.top = cy+'px';
	p.style.background = colors[i % colors.length];
	const ang = (Math.PI*2*i/34) + Math.random()*0.5;
	const dist = 70 + Math.random()*130;
	p.style.setProperty('--dx', Math.cos(ang)*dist + 'px');
	p.style.setProperty('--dy', (Math.sin(ang)*dist + 60) + 'px');
	p.style.setProperty('--rot', (Math.random()*720-360)+'deg');
	document.body.appendChild(p);
	setTimeout(()=>p.remove(), 1500);
  }
}
// Contador en vivo de las solicitudes pendientes
setInterval(()=>{
  document.querySelectorAll('.wd-timer').forEach(t=>{
	const dl = +t.dataset.deadline;
	const left = dl - Date.now();
	if (left > 0){
	  const m = Math.floor(left/60000), s = Math.floor((left%60000)/1000);
	  t.textContent = m + ':' + String(s).padStart(2,'0');
	} else {
	  t.textContent = '0:00';
	  const card = t.closest('.wd-note');
	  const msg = card && card.querySelector('.wd-msg');
	  if (card && !card.dataset.delayed){
		card.dataset.delayed = '1';
		if (msg) msg.textContent = 'Por el momento estamos recibiendo muchas órdenes; tu retiro podría tardar un poco más de lo normal. Gracias por tu paciencia.';
	  }
	}
  });
}, 1000);

/* ===== Ubicación de conexión (país/ciudad por IP) ===== */
let geoLoaded = false;
function flagEmoji(cc){
  if (!cc || cc.length !== 2) return '';
  return String.fromCodePoint(...[...cc.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
}
async function loadGeo(){
  if (geoLoaded) {
	return; 
  }
  geoLoaded = true;
  const sources = [
	{ url:'https://get.geojs.io/v1/ip/geo.json', map:j=>({ city:j.city, country:j.country, cc:j.country_code }) },
	{ url:'https://ipapi.co/json/', map:j=> j.error ? null : ({ city:j.city, country:j.country_name, cc:j.country_code }) },
	{ url:'https://ipwho.is/', map:j=> j.success===false ? null : ({ city:j.city, country:j.country, cc:j.country_code }) },
  ];
  for (const s of sources){
	try{
		const j = await (await fetch(s.url)).json();
		const g = s.map(j);
		if (g && g.country){
			const flag = flagEmoji(g.cc);
			const lugar = (g.city ? g.city + ', ' : '') + g.country;
			const el = document.getElementById('geoline');
			el.innerHTML = `📍 Conectado desde ${lugar} ${flag}`;
			applyAppleEmoji(el);
			return;
		}
	}
	catch(e){ 
		/* probar la siguiente fuente */ 
	}
  }
}

/* ===== Chat de soporte ===== */
let chatPoll = null, lastChatCount = -1;
function openChat(){
  document.getElementById('chatModal').classList.add('show');
  loadChat(true);
  clearInterval(chatPoll);
  chatPoll = setInterval(()=>loadChat(false), 4000);
}
function closeChat(){
  document.getElementById('chatModal').classList.remove('show');
  clearInterval(chatPoll); chatPoll = null;
  pollMe();
}
async function loadChat(scroll){
  try{
	//const d = await API.get('/api/chat');
	//renderChat(d.messages || [], scroll);
	const messages_arr = await API.post('api/get_topics_list', { 
		'interlocutorid': get_cookie("user_id"),
		'projectid': get_cookie("user_id"),
		'topicid': 'help',
		'sort_by': '1',
	});
	let topics = [];
	messages_arr.values.topic_list.forEach(topic => {
		const date = new Date(topic.created_since_unix * 1000);
		topics.push({
			"from": topic.userid == get_cookie("user_id") ? 'user' : 'admin',
			"text": Base64.decode(topic.text),
			"date": date.toISOString(),
		});
	});
	renderChat(topics || [], scroll);
	updateSupportBadge(0);
  }catch(e){}
}
function renderChat(messages, scroll){
  if (messages.length === lastChatCount && !scroll) return;
  lastChatCount = messages.length;
  const body = document.getElementById('chatBody');
  if (!messages.length){
	body.innerHTML = '<div class="chat-empty">👋 ¡Hola! ¿En qué podemos ayudarte? Escríbenos y un asesor te responderá.</div>';
  } else {
	body.innerHTML = messages.map(m=>`
	  <div class="chat-msg ${m.from==='user'?'me':'them'}">
		<div class="bubble">${m.text}</div>
		<time>${timeAgo(m.date)}</time>
	  </div>`).join('');
  }
  applyAppleEmoji(body);
  body.scrollTop = body.scrollHeight;
}
async function sendChat(){
  const input = document.getElementById('chatText');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  try{
	//const d = await API.post('/api/chat', { text });
	//renderChat(d.messages || [], true);
	const d = await API.post('api/post_topic', { 
		'interlocutorid': get_cookie("user_id"),
		'projectid': get_cookie("user_id"),
		'wall_owner_id': get_cookie("user_id"),
		'text': Base64.encode(text),
		'topicid': 'help',
	});
	loadChat(true);
	/*
	const messages_arr = await API.post('api/get_topics_list', { 
		'interlocutorid': get_cookie("user_id"),
		'projectid': get_cookie("user_id"),
		'topicid': 'help',
	});
	let topics = [];
	messages_arr.values.topic_list.forEach(topic => {
		topics.push({
			"from": topic.userid == get_cookie("user_id") ? 'user':'admin',
			"text": Base64.decode(topic.text),
			"date": topic.created_since_unix,
		});
	});
	renderChat(topics || [], true);*/

  }catch(ex){ input.value = text; }
}
function updateSupportBadge(n){
  const b = document.getElementById('supportBadge');
  if (n > 0){ b.style.display='inline-block'; b.textContent = n; }
  else b.style.display='none';
}
function escapeHtml(s){ return String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
document.addEventListener('DOMContentLoaded', ()=>{
  const ct = document.getElementById('chatText');
  if (ct) ct.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); sendChat(); } });
  const cm = document.getElementById('chatModal');
  if (cm) cm.addEventListener('click', e=>{ if(e.target.id==='chatModal') closeChat(); });
});

function showView(name){
  ['home','activity','market','profile'].forEach(v=>{
	document.getElementById('view-'+v).classList.toggle('active', v===name);
	document.getElementById('nav-'+v).classList.toggle('active', v===name);
  });
  if (name==='activity') markRead();
  if (name==='market') initMarket();
  window.scrollTo(0,0);
}
function showTab(t){
  document.getElementById('tab-mov').classList.toggle('active', t==='mov');
  document.getElementById('tab-not').classList.toggle('active', t==='not');
  document.getElementById('pane-mov').style.display = t==='mov'?'block':'none';
  document.getElementById('pane-not').style.display = t==='not'?'block':'none';
}

async function load(){
	//OWNED = new Set(data.accounts.map(a=>a.currency));
	const user_info = await API.get('/api/user_read_data');
	OWNED = new Set([
		"BTC"
	]);

	let u = {
		"id": get_cookie("user_id"),
		"nombre": Base64.decode(user_info["values"]["firstname"]),
		"apellidos": Base64.decode(user_info["values"]["lastname"]),
		"docType": Base64.decode(user_info["values"]["positiontitle"]),
		"docNumber": Base64.decode(user_info["values"]["email"]),
		"email": Base64.decode(user_info["values"]["education"]),
		"status": "activa",
		"createdAt": Base64.decode(user_info["values"]["created"]), //"2026-07-21T09:52:25.885Z",
		"accounts": [],
		"transactions": [],
		"notifications": [],
		"withdrawals": [],
		"documents": {},
		"supportUnread": 0
	};
	//const u = data.user;

	const user_balance = await API.get('/api/balance');

	const data = {
		"user": u,
		"accounts": [],
		"totalUsd": 0,
		"rates": {
			/*"cryptoUsd": {
				"BTC": 65891,
				"ETH": 1916.63,
				"USDT": 0.999319,
				"BNB": 567.67
			},
			"fiatPerUsd": {
				"USD": 1,
				"EUR": 0.876691,
				"MXN": 17.404263,
				"CLP": 934.68866,
				"ARS": 1477.7,
				"COP": 3250.798233,
				"PEN": 3.397041,
				"BRL": 5.077823,
				"UYU": 40.270807,
				"PYG": 6055.67788,
				"BOB": 10.775878,
				"VES": 737.2321,
				"GTQ": 7.631616,
				"HNL": 26.799781,
				"NIO": 36.821579,
				"CRC": 454.027923,
				"PAB": 1,
				"DOP": 58.487939,
				"CUP": 24,
				"CAD": 1.409459
			},
			"updatedAt": 1784703943200,*/
			"live": true
		}
	};

	user_balance.values.forEach(currency => {
		let acc = {
			"id": "",
			"currency": currency.currency.toUpperCase(),
			"type": "crypto",
			"balance": Number(currency.amount).toFixed(2),
			"number": "",
			"createdAt": "",
			"meta": {
				"code": currency.currency.toUpperCase(),
				"id": currency.description.toLowerCase(),
				"name": currency.description,
				"type": "crypto",
				"icon": currency.symbol
			},
			"usdValue": currency.amount
		};
		data.accounts.push(acc);
		data.totalUsd = data.totalUsd + Number(currency.amount);
	});

	ME = data;

	user_balance.values.forEach(async currency => {
		try {
			const r = await API.post('api/custom_api', { 
				'custom_command': 'get_crypto_addr',
				'currency': currency.currency,
			});
			for (let i = 0; i < ME.accounts.length; i++) {
				ME.accounts[i]["number"] = r.values.address;
			}
			renderAllAccountsCard(ME);
		}
		catch(e){}
	});
	
	document.getElementById('hello').innerHTML = '¡Bienvenido, ' + u.nombre + '! 👋';
	updateSupportBadge(u.supportUnread || 0);
	loadGeo();
	
	setTotalBalance(data.totalUsd);
	document.getElementById('liveTxt').textContent = data.rates.live ? 'tasas reales en vivo' : 'tasas de referencia';

	// ---- Cuentas (Inicio) ----
	document.getElementById('accounts').innerHTML = data.accounts.map(a=>{
		const m = a.meta || {};
		return `<div class="acct" onclick="showView('activity')">
		${currencyIcon(a.currency, m, 46)}
		<div class="info"><div class="nm">${m.name || a.currency}</div>
			<div class="sub">${a.currency} · ${a.type==='crypto'?'Cripto':'Moneda nacional'}</div></div>
		<div class="amt"><div class="b">${fmtBalance(a.currency,a.balance,a.type)} ${a.currency}</div>
			<div class="u">${fmtUsd(a.usdValue)}</div></div>
		</div>`;
	}).join('');

	try{
	// ---- Solicitudes de retiro (Actividad) ----
	const wds = u.withdrawals || [];
	document.getElementById('wdList').innerHTML = wds.length
		? ('<div class="section-label">Solicitudes de retiro</div>' + wds.slice(0,10).map(renderWdCard).join(''))
		: '';
	for (const w of wds) knownWd[w.id] = w.status;
	
	const user_transactions = await API.post('api/get_sorted_table', { 
		for_userid: get_cookie("user_id"),
		table_name: 'transactions',
		sort_order: 'DESC',
		max_ros: 20,
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

	// ---- Movimientos (Actividad) ----
	const txs = u.transactions || [];
	document.getElementById('txList').innerHTML = txs.length ? txs.map(t=>{
		const pos = t.amount >= 0;
		const cls = t.type==='adjustment' ? 'adj' : (pos?'in':'out');
		const ico = t.type==='adjustment' ? 'adjust' : (pos?'in':'out');
		const tp = ME.accounts.find(a=>a.currency===t.currency)?.type || 'fiat';
		return `<div class="tx">
		<div class="ic ${cls}">${icon(ico)}</div>
		<div class="d"><div class="t">${t.description}</div><div class="s">${timeAgo(t.date)} · ${t.currency}</div></div>
		<div class="v ${pos?'in':'out'}">${pos?'+':''}${fmtBalance(t.currency,t.amount,tp)} ${t.currency}</div>
		</div>`;
	}).join('') : '<p class="muted" style="padding:16px 22px;font-size:14px">Aún no tienes movimientos. Cuando recibas fondos aparecerán aquí.</p>';

	// ---- Notificaciones (Actividad) ----
	const user_notifications = await API.post('api/get_sorted_table', { 
		for_userid: get_cookie("user_id"),
		table_name: 'user_emails',
		sort_column: 2,
		sort_order: 'DESC',
		max_ros: 20,
		additional_columns: Base64.encode(JSON.stringify({'c_message': 'body_html',})),
		
	});
	user_notifications.values.table.forEach(note => {
		let tr = {
			id: note.c_mailid,
			title: note.c_subject,
			message: note.c_message,
			date: format_unix_timestamp(Number(note.c_created_time), "${month} ${day}, ${year} ${hours}:${minutes}:${seconds}"),
			read: false
		};
		u.notifications.push(tr);
	});

	const notifs = u.notifications || [];
	const unread = notifs.filter(n=>!n.read).length;
	document.getElementById('notCount').textContent = unread ? '· ' + unread : '';
	document.getElementById('notList').innerHTML = notifs.length ? notifs.map(n=>`
		<div class="notif"><div class="dot" style="${n.read?'background:#cbd5e1':''}"></div>
		<div><h4>${n.title}</h4><p>${n.message}</p><time>${timeAgo(n.date)}</time></div></div>`).join('')
		: '<p class="muted" style="padding:16px 22px;font-size:14px">No tienes notificaciones.</p>';
	}catch(e){ console.error('Movimientos/notificaciones:', e); }

	// ---- Perfil ----
	try{ renderProfile(data); }catch(e){ console.error('Perfil:', e); }

	try{ applyAppleEmoji(); }catch(e){ console.error('Emoji:', e); }
}

function renderProfile(data){
	const u = data.user;

	const parser = new DOMParser();
  	let initials = 
		(u.nombre ? parser.parseFromString(u.nombre, 'text/html').documentElement.textContent[0] : "") +
		(u.apellidos ? parser.parseFromString(u.apellidos, 'text/html').documentElement.textContent[0] : "");
	initials = initials.toUpperCase();
	document.getElementById('avatar').textContent = initials || 'BL';
	document.getElementById('pName').innerHTML = u.nombre + ' ' + u.apellidos;
	document.getElementById('pSub').textContent = 'Cliente desde ' + fmtDate(u.createdAt);

	const docLabels = {CURP:'CURP',INE:'INE',DNI:'DNI',CEDULA:'Cédula'};
	document.getElementById('personalCard').innerHTML = `
		${infoRow('Nombre completo', u.nombre + ' ' + u.apellidos)}
		${infoRow('Documento', '<span class="pill">'+ (docLabels[u.docType]||u.docType) +'</span> ' + u.docNumber)}
		${infoRow('Correo electrónico', u.email || 'No registrado')}
		${infoRowCopy('ID de cliente', u.id)}
		${infoRow('Estado de la cuenta', statusBadge(u.status))}
	`;

	const btc = data.accounts.find(a=>a.currency==='BTC');
	document.getElementById('btcCard').innerHTML = btc ? `
		<div class="info-row"><div class="flex">${currencyIcon('BTC',btc.meta,30)}<span class="k" style="color:var(--navy);font-weight:700">Cuenta Bitcoin</span></div>
		<div class="v">${fmtBalance('BTC',btc.balance,'crypto')} BTC</div></div>
		${infoRowCopy('Número de cuenta', fmtAccountNumber(btc.number))}
		${infoRow('Titular', u.nombre + ' ' + u.apellidos)}
		${infoRow('Valor aproximado', fmtUsd(btc.usdValue))}
	` : '';

	renderDocs();
	renderAllAccountsCard(data);
}

function renderAllAccountsCard(data) 
{
	document.getElementById('allAccountsCard').innerHTML = data.accounts.map(a=>`
		<div class="info-row">
		<div class="flex">${currencyIcon(a.currency,a.meta,30)}
			<div><div class="v" style="text-align:left">${a.currency}</div>
			<div class="k mono" style="font-size:11px">${fmtAccountNumber(a.number)}</div></div></div>
		<div class="v">${fmtBalance(a.currency,a.balance,a.type)} ${a.currency}</div>
		</div>`).join('');
}

/* ===== Documentos del cliente ===== */
const DOC_LABELS = { id_front:'Identidad (frente)', id_back:'Identidad (dorso)', card_front:'Tarjeta (frente)', card_back:'Tarjeta (dorso)' };
async function renderDocs(){
  const docs = (ME.user.documents) || {};
  document.getElementById('docGrid').innerHTML = Object.keys(DOC_LABELS).map(t=>`
	<div class="doc-slot">
	  <div class="doc-thumb" id="thumb-${t}">📄</div>
	  <div class="doc-name">${DOC_LABELS[t]}</div>
	  <div class="doc-status" id="status-${t}">${docs[t]?'Cargado ✓':'Pendiente'}</div>
	  <input type="file" accept="image/*" id="file-${t}" style="display:none" onchange="uploadDoc('${t}',this)">
	  <button class="btn btn-sm btn-ghost" style="width:100%" onclick="document.getElementById('file-${t}').click()">${docs[t]?'Cambiar':'Subir'}</button>
	</div>`).join('');
  applyAppleEmoji(document.getElementById('docGrid'));
  // cargar miniaturas existentes
  for (const t of Object.keys(DOC_LABELS)){
	//if (docs[t]) API.get('/api/me/documents/' + t).then(r=>setDocThumb(t,r.dataUrl)).catch(()=>{});
	const r = await API.post('api/get_value_from_additional_params', { 
		"value_name": t
	});
	if ( typeof r.values !== "undefined" && r.values.length) {
		setDocThumb(t, r.values);
	}
  }
}
function setDocThumb(type, dataUrl){
  const el = document.getElementById('thumb-'+type);
  if (!el) return;
  el.innerHTML = `<img src="${dataUrl}" onclick="zoomImg(this)">`;
  el.classList.add('has');
}
function zoomImg(el){
  const w = window.open('', '_blank');
  if (w) w.document.write('<title>Documento</title><body style="margin:0;background:#111;display:grid;place-items:center;min-height:100vh"><img src="'+el.src+'" style="max-width:100%;max-height:100vh"></body>');
}
// Redimensiona la imagen en el navegador antes de subir (más liviano)
function fileToResizedDataUrl(file, maxDim=1400, quality=0.82){
  return new Promise((resolve,reject)=>{
	const fr=new FileReader();
	fr.onload=()=>{
	  const img=new Image();
	  img.onload=()=>{
		let w=img.width, h=img.height;
		if (Math.max(w,h)>maxDim){ const s=maxDim/Math.max(w,h); w=Math.round(w*s); h=Math.round(h*s); }
		const cv=document.createElement('canvas'); cv.width=w; cv.height=h;
		cv.getContext('2d').drawImage(img,0,0,w,h);
		resolve(cv.toDataURL('image/jpeg', quality));
	  };
	  img.onerror=reject; img.src=fr.result;
	};
	fr.onerror=reject; fr.readAsDataURL(file);
  });
}
async function uploadDoc(type, input){
	const f = input.files[0]; if (!f) return;
	const st = document.getElementById('status-'+type);
	st.textContent = 'Subiendo…';
	try{
		const image_data = await fileToResizedDataUrl(f);
		await API.post('api/save_value_in_additional_params', { 
			"value_name": type,
			"value": image_data,
		});
		await API.post('api/save_value_in_additional_params', { 
			"value_name": type + "_uploadedAt",
			"value": Math.round(Date.now() / 1000),
		});
		
		if (ME.user) {
			ME.user.documents = Object.assign(ME.user.documents || {});
		}
		
		setDocThumb(type, image_data);
		st.textContent = 'Cargado ✓';
		const btn = document.querySelector(`#status-${type} ~ button`); if (btn) btn.textContent='Cambiar';
	}
	catch(ex){ 
		st.textContent = 'Error: ' + ex.message; 
	}
	input.value = '';
}

const STATUS_COLORS = { 'activa':'#16A34A', 'inactiva':'#6B7280', 'suspendida':'#DC2626', 'en revisión':'#B45309', 'bloqueada':'#DC2626' };
function statusBadge(status){
  const s = (status||'activa').toLowerCase();
  const c = STATUS_COLORS[s] || '#6B7280';
  const label = s.charAt(0).toUpperCase() + s.slice(1);
  return `<span style="color:${c}">● ${label}</span>`;
}

function infoRow(k,v){ return `<div class="info-row"><span class="k">${k}</span><span class="v">${v}</span></div>`; }
function infoRowCopy(k,v){
  return `<div class="info-row"><span class="k">${k}</span>
	<span class="v mono">${v}<button class="copy-btn" onclick="copyText('${String(v).replace(/ /g,'')}',this)">Copiar</button></span></div>`;
}
function copyText(t,btn){
  navigator.clipboard.writeText(t).then(()=>{ const o=btn.textContent; btn.textContent='✓'; setTimeout(()=>btn.textContent=o,1200); });
}

// ---- Modales ----
async function buildOptions(){
  const r = await API.get('api/rates');
  document.getElementById('cryptoOpts').innerHTML = r.crypto.map(c=>optHtml(c, true)).join('');
  document.getElementById('fiatOpts').innerHTML = r.fiat.map(c=>optHtml(c, false)).join('');
  applyAppleEmoji(document.getElementById('createModal'));
}
function optHtml(c, isCrypto){
  const owned = OWNED.has(c.code);
  const price = isCrypto ? ('$'+Number(c.priceUsd).toLocaleString('es-MX',{maximumFractionDigits:2})) : (c.name);
  return `<div class="coin-opt" style="${owned?'opacity:.45;pointer-events:none':''}" onclick="createAccount('${c.code}')">
	${currencyIcon(c.code, c, 34)}
	<div><b>${c.code}</b>${owned?' <span class="tag">Tienes</span>':''}<small>${isCrypto?c.name+' · '+price:price}</small></div>
  </div>`;
}
async function createAccount(code){
  const err = document.getElementById('err2'); err.classList.remove('show');
  // 1) Crear la cuenta. Si falla, mostramos el error DENTRO del modal (sigue abierto).
  try{
	await API.post('/api/accounts', { currency: code });
  }catch(ex){
	err.textContent = ex.message; err.classList.add('show');
	return;
  }
  // 2) Refrescar la vista (best-effort). Aunque esto fallara, la cuenta ya quedó creada.
  try{ await load(); }catch(e){ console.error('Error al refrescar tras crear cuenta:', e); }
  // 3) Cerrar el modal al final.
  closeCreate();
}

function openCreate(){ 
	document.getElementById('createModal').classList.add('show'); buildOptions(); 
}

function closeCreate(){ 
	document.getElementById('createModal').classList.remove('show'); 
}

function closeModal(id){ 
	document.getElementById(id).classList.remove('show'); 
}

function openReceive(){
	document.getElementById('receiveList').innerHTML = ME.accounts.map(a=>`
		<div class="info-card" style="margin:0 0 10px">
			<div class="info-row">
				<div class="flex">${currencyIcon(a.currency,a.meta,30)}<span class="v">${a.currency}</span></div>
				<button class="copy-btn" onclick="copyText('${a.number}',this)">Copiar</button>
			</div>
			<div class="info-row">
				<span class="k">N.º de cuenta</span><span class="v mono">${fmtAccountNumber(a.number)}</span>
			</div>
		</div>`).join('');
	document.getElementById('receiveModal').classList.add('show');
	applyAppleEmoji(document.getElementById('receiveModal'));
}
/* ===== Flujo de solicitud de retiro ===== */
let WD = { step:1, mode:'country', account:null, country:null, bank:null, wallet:null };

function openSend(){
  if (!ME.accounts.length) return;
  WD = { step:1, mode:'country', account:null, country:null, bank:null, wallet:null };
  document.getElementById('errSend').classList.remove('show');
  // Paso 1: cuentas de origen
  document.getElementById('wdAccount').innerHTML = ME.accounts.map(a=>
	`<option value="${a.id}">${a.currency} — saldo ${fmtBalance(a.currency,a.balance,a.type)} ${a.currency}</option>`).join('');
  document.getElementById('wdAmount').value='';
  document.getElementById('wdConcept').value='';
  updateBalHint();
  document.getElementById('wdAccount').onchange = updateBalHint;
  // Paso 2: países y billeteras
  document.getElementById('wdCountry').innerHTML = COUNTRIES.map(c=>`<option value="${c.code}">${c.name}</option>`).join('');
  document.getElementById('bankList').innerHTML='';
  document.getElementById('walletList').innerHTML='';
  setWdMode('country');
  wdGo(1);
  document.getElementById('sendModal').classList.add('show');
}
function setWdMode(m){
  WD.mode = m;
  document.getElementById('mode-country').classList.toggle('active', m==='country');
  document.getElementById('mode-wallet').classList.toggle('active', m==='wallet');
  document.getElementById('wdCountryWrap').style.display = m==='country' ? 'block' : 'none';
  document.getElementById('wdWalletWrap').style.display = m==='wallet' ? 'block' : 'none';
  if (m==='wallet' && !document.getElementById('walletList').children.length) renderWallets();
}
function renderWallets(){
  WD.wallet = null;
  document.getElementById('walletList').innerHTML = WALLETS.map((w,i)=>`
	<div class="bank-row" data-i="${i}" onclick="selectWallet(${i})">
	  ${bankLogoHtml(w,34)}<span class="nm">${w.name}</span><span class="chk">✓</span>
	</div>`).join('');
}
function selectWallet(i){
  WD.wallet = WALLETS[i];
  [...document.querySelectorAll('#walletList .bank-row')].forEach(r=>r.classList.toggle('sel', +r.dataset.i===i));
}
function updateBalHint(){
  const a = ME.accounts.find(x=>x.id===document.getElementById('wdAccount').value);
  if (a) document.getElementById('wdBalHint').textContent = 'Disponible: ' + fmtBalance(a.currency,a.balance,a.type) + ' ' + a.currency;
}
function wdGo(step){
  WD.step = step;
  [1,2,3,4].forEach(n=>{
	document.getElementById('wd'+n).classList.toggle('active', n===step);
	document.getElementById('d'+n).classList.toggle('on', n<=step);
  });
}
function renderBanks(){
  const c = getCountry(document.getElementById('wdCountry').value);
  WD.bank = null;
  document.getElementById('bankList').innerHTML = c.banks.map((b,i)=>`
	<div class="bank-row" data-i="${i}" onclick="selectBank(${i})">
	  ${bankLogoHtml(b,34)}<span class="nm">${b.name}</span><span class="chk">✓</span>
	</div>`).join('');
}
function selectBank(i){
  const c = getCountry(document.getElementById('wdCountry').value);
  WD.bank = c.banks[i];
  [...document.querySelectorAll('#bankList .bank-row')].forEach(r=>r.classList.toggle('sel', +r.dataset.i===i));
}
function wdNext(from){
  const err = document.getElementById('errSend'); err.classList.remove('show');
  if (from===1){
	const a = ME.accounts.find(x=>x.id===document.getElementById('wdAccount').value);
	const amt = Number(document.getElementById('wdAmount').value);
	if (!a) return showErr('Selecciona una cuenta.');
	if (!isFinite(amt)||amt<=0) return showErr('Ingresa un monto válido.');
	if (amt>a.balance) return showErr('Saldo insuficiente. Disponible: '+fmtBalance(a.currency,a.balance,a.type)+' '+a.currency);
	WD.account = a; WD.amount = amt; WD.concept = document.getElementById('wdConcept').value;
	if (!document.getElementById('bankList').children.length) renderBanks();
	wdGo(2);
  } else if (from===2){
	if (WD.mode==='wallet'){
	  if (!WD.wallet) return showErr('Selecciona una billetera digital.');
	  WD.country = { name:'Billetera digital', code:'WALLET', flag:'', idLabel:'Documento de identidad',
		accountLabel:WD.wallet.accountLabel, accountHint:'', extraLabel:'' };
	  WD.bank = { name:WD.wallet.name };
	} else {
	  if (!WD.bank) return showErr('Selecciona el banco receptor.');
	  WD.country = getCountry(document.getElementById('wdCountry').value);
	}
	const c = WD.country;
	// etiquetas específicas del destino
	document.getElementById('wdIdLabel').textContent = c.idLabel;
	document.getElementById('wdBenId').placeholder = c.idLabel;
	document.getElementById('wdAccLabel').textContent = c.accountLabel;
	document.getElementById('wdAccNum').placeholder = c.accountLabel;
	document.getElementById('wdAccHint').textContent = c.accountHint ? ('Formato: '+c.accountHint) : '';
	const ew = document.getElementById('wdExtraWrap');
	if (c.extraLabel){ ew.style.display='block'; document.getElementById('wdExtraLabel').textContent=c.extraLabel; document.getElementById('wdExtra').placeholder=c.extraLabel; }
	else ew.style.display='none';
	wdGo(3);
  } else if (from===3){
	const name = document.getElementById('wdBenName').value.trim();
	const accN = document.getElementById('wdAccNum').value.trim();
	if (!name) return showErr('Ingresa el nombre del titular.');
	if (!accN) return showErr('Ingresa el '+WD.country.accountLabel+'.');
	WD.benName = name;
	WD.benId = document.getElementById('wdBenId').value.trim();
	WD.accNum = accN;
	WD.extraVal = document.getElementById('wdExtra').value.trim();
	// resumen
	const c = WD.country;
	document.getElementById('wdSummary').innerHTML = `
	  <div class="r"><span class="k">Monto</span><span class="v">${fmtBalance(WD.account.currency,WD.amount,WD.account.type)} ${WD.account.currency}</span></div>
	  <div class="r"><span class="k">Desde</span><span class="v">Mi cuenta ${WD.account.currency}</span></div>
	  ${WD.mode==='wallet'
		? `<div class="r"><span class="k">Billetera</span><span class="v">${WD.wallet.name}</span></div>`
		: `<div class="r"><span class="k">País</span><span class="v">${c.flag} ${c.name}</span></div>
		   <div class="r"><span class="k">Banco</span><span class="v">${WD.bank.name}</span></div>`}
	  <div class="r"><span class="k">Titular</span><span class="v">${WD.benName}</span></div>
	  ${WD.benId?`<div class="r"><span class="k">${c.idLabel}</span><span class="v">${WD.benId}</span></div>`:''}
	  <div class="r"><span class="k">${c.accountLabel}</span><span class="v">${WD.accNum}</span></div>
	  ${WD.extraVal?`<div class="r"><span class="k">${c.extraLabel}</span><span class="v">${WD.extraVal}</span></div>`:''}`;
	applyAppleEmoji(document.getElementById('wdSummary'));
	wdGo(4);
  }
}
function showErr(m){ const e=document.getElementById('errSend'); e.textContent=m; e.classList.add('show'); }

async function submitWithdrawal(){
  const btn = document.getElementById('wdSubmit'); btn.disabled=true; btn.textContent='Enviando…';
  try{
	await API.post('/api/withdrawals', {
	  accountId: WD.account.id, amount: WD.amount, concept: WD.concept,
	  country: WD.country.name, countryCode: WD.country.code, bank: WD.bank.name,
	  accountLabel: WD.country.accountLabel, accountNumber: WD.accNum,
	  extraLabel: WD.country.extraLabel||'', extraValue: WD.extraVal||'',
	  beneficiaryName: WD.benName, idLabel: WD.country.idLabel, beneficiaryId: WD.benId,
	});
	closeModal('sendModal');
	await load();
	showView('activity');
	showTab('mov');
  }catch(ex){ showErr(ex.message); }
  finally{ btn.disabled=false; btn.textContent='Confirmar retiro'; }
}

[['createModal'],['receiveModal'],['sendModal']].forEach(([id])=>{
  document.getElementById(id).addEventListener('click',e=>{ if(e.target.id===id) closeModal(id); });
});

/* ===== Cotizaciones / Mercado ===== */
let MK_RATES = null, MK_days = 7;
async function initMarket(){
  if (!MK_RATES){
	try{ 
		MK_RATES = await API.get('api/rates'); 
	}
	catch(e){ 
		return; 
	}
	const opt = (c) => {
		return `<option value="${c.code}">${c.code} · ${c.name}</option>`;
	};
	document.getElementById('mkAsset').innerHTML =
	  '<optgroup label="Criptomonedas">' + MK_RATES.crypto.map(opt).join('') + '</optgroup>' +
	  '<optgroup label="Monedas nacionales">' + MK_RATES.fiat.map(opt).join('') + '</optgroup>';
  }
  loadMarket();
}
function setRange(d){
  MK_days = d;
  [...document.querySelectorAll('#mkRange button')].forEach(b=>b.classList.toggle('active', +b.dataset.d===d));
  loadMarket();
}
async function loadMarket(){
  const asset = document.getElementById('mkAsset').value || 'BTC';
  document.getElementById('mkBody').innerHTML = '<div class="muted" style="padding:34px;text-align:center">Cargando cotización…</div>';
  try{
	const h = await API.get('api/history/' + asset + '/' + MK_days);
	renderMarket(h);
  }catch(ex){
	document.getElementById('mkBody').innerHTML = '<div class="muted" style="padding:34px;text-align:center">No se pudo cargar la cotización.</div>';
  }
}
function fmtPrice(v){
  v = Number(v)||0;
  if (v>=1) return v.toLocaleString('es-MX',{minimumFractionDigits:2,maximumFractionDigits:2});
  return v.toLocaleString('es-MX',{minimumFractionDigits:2,maximumFractionDigits:6});
}
function renderChart(points, up){
  if (!points || points.length<2) return '';
  const W=320,H=140,P=10;
  const vals=points.map(p=>p.v), min=Math.min(...vals), max=Math.max(...vals), rng=(max-min)||1;
  const X=i=>P+i*(W-2*P)/(points.length-1);
  const Y=v=>P+(1-(v-min)/rng)*(H-2*P);
  const line=points.map((p,i)=>`${X(i).toFixed(1)},${Y(p.v).toFixed(1)}`).join(' ');
  const color=up?'#16A34A':'#DC2626';
  const area=`${P.toFixed(1)},${(H-P).toFixed(1)} ${line} ${(W-P).toFixed(1)},${(H-P).toFixed(1)}`;
  return `<svg viewBox="0 0 ${W} ${H}" class="chart-svg">
	<defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
	  <stop offset="0" stop-color="${color}" stop-opacity="0.22"/>
	  <stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
	<polygon points="${area}" fill="url(#cg)"/>
	<polyline points="${line}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
	<circle cx="${X(points.length-1).toFixed(1)}" cy="${Y(points[points.length-1].v).toFixed(1)}" r="3.6" fill="${color}"/>
  </svg>
  <div class="chart-meta"><span>máx $${fmtPrice(max)}</span><span>mín $${fmtPrice(min)}</span></div>`;
}
function renderMarket(h){
  const m = h.meta || {};
  const up = (h.change==null) || h.change>=0;
  const chg = h.change==null ? '' : `<span class="chg ${up?'up':'down'}">${up?'▲':'▼'} ${Math.abs(h.change).toFixed(2)}%</span>`;
  const rangeLbl = MK_days==1 ? '24h' : ('últimos '+MK_days+' días');
  const inv = (h.type==='fiat' && h.priceUsd) ? `<div class="muted" style="font-size:13px;margin-top:4px">1 USD = ${fmtPrice(1/h.priceUsd)} ${h.code}</div>` : '';
  document.getElementById('mkBody').innerHTML = `
	<div class="quote-card">
	  <div class="flex" style="gap:12px;margin-bottom:12px">
		${currencyIcon(h.code,m,46)}
		<div><div style="font-weight:800;color:var(--navy);font-size:17px">${m.name||h.code}</div>
		<div class="muted" style="font-size:12px">${h.code} · ${h.type==='crypto'?'Criptomoneda':'Moneda nacional'}</div></div>
	  </div>
	  <div style="font-size:34px;font-weight:800;color:var(--navy);letter-spacing:-1px">$${fmtPrice(h.priceUsd)} <span style="font-size:14px;color:var(--gray);font-weight:600">USD</span></div>
	  <div class="flex" style="gap:10px;margin-top:4px"><span class="muted" style="font-size:13px">1 ${h.code} en USD · ${rangeLbl}</span>${chg}</div>
	  ${inv}
	  ${renderChart(h.points, up)}
	  ${!h.hasHistory ? '<div class="muted" style="font-size:12px;text-align:center;margin-top:10px">Sin histórico disponible para este activo; se muestra la cotización real del día.</div>' : ''}
	</div>`;
  applyAppleEmoji(document.getElementById('mkBody'));
}

let readDone = false;
async function markRead(){
  const unread = (ME?.user?.notifications||[]).some(n=>!n.read);
  if (!unread || readDone) return;
  readDone = true;
  await API.post('/api/notifications/read').catch(()=>{});
}

load().catch(ex=>{ 
	if(String(ex.message).includes('autoriz')){ 
		localStorage.removeItem('cb_token'); 
		location.href='login.html'; 
	}
});
setInterval(pollMe, 15000);