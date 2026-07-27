// Utilidades compartidas del frontend
const API = {
	token(){ 
		return localStorage.getItem('cb_token'); 
	},
	adminToken(){ 
		return localStorage.getItem('cb_admin_token'); 
	},
	async call(method, url, body, token){
		
		let session_token = token || this.token();
		let request_data = body ? body : {};
		if ( !session_token ) {
			const res = await fetch(
				SITE_DOMAIN + "api/api_token_seed", 
				{
					method: "POST",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
					},
					body: undefined,
				}
			);
			try { 
				let session_token_data = await res.json();
				session_token = md5( session_token_data.values + Math.floor(Date.now() / 1000 / 60) );
			} 
			catch(e){
				console.error(e);
			}
		}
		else {
			request_data.userid = get_cookie("user_id");
		}
		if ( session_token ) {
			request_data.token = session_token;
			const res = await fetch(SITE_DOMAIN + url, 
				{
					method: "POST",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
					},
					body: new URLSearchParams(request_data),
				}
			);
			let res_ok = res.ok;
			let data = {};
			try { 
				data = await res.json(); 
				if ( ! data.success && data.error_code == 2 ) {
					res_ok = false;
				}
			} 
			catch(e){
				console.error(e);
			}
			if ( !res_ok ) {
				throw new Error(data.error || ('Error autoriz ' + res.status));
			}
			return data;
		}
		else {
			throw new Error('Error: no token');
		}
	},
	get(u,t){ 
		return this.call('GET', u, null, t); 
	},
	post(u,b,t){ 
		return this.call('POST', u, b, t); 
	},
	del(u,t){ 
		return this.call('DELETE', u, null, t); 
	},
};

/* ===== Iconografía de línea, minimalista y de un solo tono ===== */
const ICONS = {
  home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
  activity:'<path d="M3 12h3.5l2.5 6 4-13 2.5 7H21"/>',
  market:'<path d="M3 17l5-5 4 3 8-9"/><path d="M16 6h5v5"/>',
  profile:'<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c.8-3.5 3.8-5.5 7.5-5.5s6.7 2 7.5 5.5"/>',
  plus:'<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
  receive:'<path d="M12 3v13"/><path d="M7 11l5 5 5-5"/><path d="M5 21h14"/>',
  send:'<path d="M21 3 3 11l7 2 2 7L21 3z"/><path d="M21 3 10 13"/>',
  list:'<path d="M9 6h12M9 12h12M9 18h12"/><circle cx="4.5" cy="6" r="1.2"/><circle cx="4.5" cy="12" r="1.2"/><circle cx="4.5" cy="18" r="1.2"/>',
  bell:'<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
  bank:'<path d="M3 10l9-5 9 5"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8"/><path d="M3 21h18"/>',
  shield:'<path d="M12 3l8 3v5.5c0 4.6-3.4 8-8 9.5-4.6-1.5-8-4.9-8-9.5V6l8-3z"/><path d="M9 12l2 2 4-4"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.7 2.8 2.7 15.2 0 18-2.7-2.8-2.7-15.2 0-18z"/>',
  bolt:'<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/>',
  handshake:'<path d="M7 11l3-3 3 3 2-2 4 4-3 3-2-2"/><path d="M14 16l-2 2-3-3"/><path d="M3 9l4-4"/>',
  in:'<path d="M17 7 8 16"/><path d="M16 16H8V8"/>',
  out:'<path d="M7 17 16 8"/><path d="M8 8h8v8"/>',
  adjust:'<path d="M4 7h16M4 12h16M4 17h16"/><circle cx="9" cy="7" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="8" cy="17" r="2"/>',
};
function icon(name, size){
  const p = ICONS[name] || '';
  const sz = size ? ` width="${size}" height="${size}"` : '';
  return `<svg class="ic-svg"${sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
}
function paintIcons(root){
  (root || document).querySelectorAll('[data-icon]').forEach(el=>{
    if (el.dataset.iconDone) return;
    el.innerHTML = icon(el.dataset.icon, el.dataset.iconSize ? +el.dataset.iconSize : undefined);
    el.dataset.iconDone = '1';
  });
}

/* ===== Emojis estilo iPhone (Apple) ===== */
// Convierte cualquier emoji del DOM a su versión Apple (estética premium iPhone).
// Usa imágenes PNG de Apple servidas por jsdelivr (rápido y cacheable).
// Si una imagen no existe, cae de vuelta al emoji del sistema (onerror).
const APPLE_EMOJI_BASE = 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.1.2/img/apple/64/';
function emojiCodepoints(str){
  const out = [];
  for (const ch of str) out.push(ch.codePointAt(0).toString(16));
  return out.join('-');
}
function appleEmojiUrl(e){ return APPLE_EMOJI_BASE + emojiCodepoints(e) + '.png'; }

function emojiToFragment(text){
  const frag = document.createDocumentFragment();
  /*let last = 0, m;
  const rx = /\p{RGI_Emoji}/gv;
  while ((m = rx.exec(text))){
    if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
    const img = document.createElement('img');
    img.className = 'ae';
    img.alt = m[0];
    img.src = appleEmojiUrl(m[0]);
    img.onerror = function(){ this.replaceWith(document.createTextNode(this.alt)); };
    frag.appendChild(img);
    last = m.index + m[0].length;
  }
  if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));*/
  return frag;
}

function applyAppleEmoji(root){
  let testRx;
  try { testRx = /\p{RGI_Emoji}/v; } catch(e){ return; } // navegador sin soporte: no hacemos nada
  const base = root || document.body;
  const walker = document.createTreeWalker(base, NodeFilter.SHOW_TEXT, {
    acceptNode(n){
      if (!n.nodeValue || !/\p{RGI_Emoji}/v.test(n.nodeValue)) return NodeFilter.FILTER_REJECT;
      const p = n.parentElement;
      if (!p || p.closest('script,style,textarea,input,select,.ae-done') || p.tagName==='IMG') return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const n of nodes){
    const frag = emojiToFragment(n.nodeValue);
    n.parentNode.replaceChild(frag, n);
  }
}

/* ===== Iconos de monedas ===== */
const CRYPTO_CODES = new Set(['BTC','ETH','USDT','BNB']);
function isCrypto(code, meta){ return (meta && meta.type==='crypto') || CRYPTO_CODES.has(code); }
function cryptoIconUrl(code){
  return 'https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/' + code.toLowerCase() + '.svg';
}
const COIN_COLORS = { BTC:'#F7931A', ETH:'#627EEA', USDT:'#26A17B', BNB:'#F3BA2F' };
function coinColor(code){ return COIN_COLORS[code] || '#6B7280'; }

// Código ISO de país (2 letras) a partir del emoji de bandera (indicadores regionales)
function flagToIso(flag){
  if (!flag) return null;
  const cps = [...flag].map(c => c.codePointAt(0));
  if (cps.length === 2 && cps[0] >= 0x1F1E6 && cps[0] <= 0x1F1FF && cps[1] >= 0x1F1E6 && cps[1] <= 0x1F1FF){
    return String.fromCharCode(cps[0] - 0x1F1E6 + 97) + String.fromCharCode(cps[1] - 0x1F1E6 + 97);
  }
  return null;
}
// Banderas circulares (diseñadas para círculo): rellenan completo sin cortar estrellas/cantones.
function flagCdnUrl(iso){ return 'https://cdn.jsdelivr.net/gh/HatScripts/circle-flags@gh-pages/flags/' + iso + '.svg'; }

// Devuelve el HTML de un icono de moneda (logo cripto o bandera plana que rellena el círculo)
function currencyIcon(code, meta, size){
  const s = size || 46;
  if (isCrypto(code, meta)){
    const fb = (COIN_COLORS[code]||'#6B7280');
    return `<img class="cur-ic" src="${cryptoIconUrl(code)}" width="${s}" height="${s}"
      onerror="this.outerHTML='<span class=\\'cur-ic fiat-ic\\' style=&quot;width:${s}px;height:${s}px;background:${fb}&quot;>${code.slice(0,3)}</span>'">`;
  }
  const flag = (meta && meta.flag) ? meta.flag : '🏳️';
  const iso = flagToIso(flag);
  if (iso){
    return `<span class="flag-wrap" style="width:${s}px;height:${s}px">
      <img class="flag-fill" src="${flagCdnUrl(iso)}" alt="${code}" loading="lazy"
        onerror="this.onerror=null;this.src='${appleEmojiUrl(flag)}'"></span>`;
  }
  return `<span class="flag-wrap" style="width:${s}px;height:${s}px">
    <img class="flag-fill" src="${appleEmojiUrl(flag)}" alt="${code}"></span>`;
}

/* ===== Formato ===== */
function fmtMoney(n, max){
  const d = max != null ? max : 2;
  return Number(n).toLocaleString('es-MX', { minimumFractionDigits:2, maximumFractionDigits:d });
}
function fmtCrypto(n){
  return Number(n).toLocaleString('es-MX', { minimumFractionDigits:0, maximumFractionDigits:8 });
}
function fmtBalance(code, n, type){
  if (type === 'crypto') return fmtCrypto(n);
  return fmtMoney(n, 2);
}
function fmtUsd(n){
  return '$' + Number(n).toLocaleString('es-MX', { minimumFractionDigits:2, maximumFractionDigits:2 }) + ' USD';
}
function fmtAccountNumber(num){
  if (!num) return '—';
  const s = String(num);
  return s.replace(/(.{4})/g, '$1 ').trim();
}
function timeAgo(iso){
  const d = new Date(iso); const s = (Date.now()-d.getTime())/1000;
  if (s<60) return 'hace instantes';
  if (s<3600) return 'hace ' + Math.floor(s/60) + ' min';
  if (s<86400) return 'hace ' + Math.floor(s/3600) + ' h';
  return d.toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'numeric' });
}
function fmtDate(iso){
  return new Date(iso).toLocaleDateString('es-MX', { day:'2-digit', month:'long', year:'numeric' });
}
function requireAuth()
{ 
  if(!API.token()){ 
    location.href='login.html'; 
  } 
}
function logout()
{
  //API.post('/api/logout').catch(()=>{}).finally(()=>{ 
    localStorage.removeItem('cb_token'); 
    location.href='index.html'; 
  //}); 
}

// Aplica emojis Apple e íconos de línea automáticamente al cargar cada página
document.addEventListener('DOMContentLoaded', ()=>{ applyAppleEmoji(); paintIcons(); });
