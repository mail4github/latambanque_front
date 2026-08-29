// Países destino para retiros/transferencias, con su terminología bancaria local
// y los principales bancos (con dominio para obtener el logo).
const COUNTRIES = [
	// ---------- América del Norte ----------
	{ code:'US', name:'Estados Unidos', flag:'🇺🇸', currency:'USD',
		accountLabel:'Número de cuenta (Account Number)', accountHint:'',
		extraLabel:'Routing Number (ABA)', idLabel:'SSN / ITIN',
		banks:[
			{name:'JPMorgan Chase',domain:'chase.com'},
			{name:'Bank of America',domain:'bankofamerica.com'},
			{name:'Wells Fargo',domain:'wellsfargo.com'},
			{name:'Citibank',domain:'citi.com'},
			{name:'U.S. Bank',domain:'usbank.com'},
			{name:'PNC Bank',domain:'pnc.com'},
			{name:'Truist Financial',domain:'truist.com'},
			{name:'Goldman Sachs',domain:'goldmansachs.com'},
			{name:'Capital One',domain:'capitalone.com'},
			{name:'TD Bank',domain:'td.com'} 
		] 
	},

	{ code:'CA', name:'Canadá', flag:'🇨🇦', currency:'CAD',
		accountLabel:'Número de cuenta', accountHint:'',
		extraLabel:'Transit + Institution Number', idLabel:'SIN',
		banks:[
			{name:'Royal Bank of Canada (RBC)',domain:'rbc.com'},
			{name:'TD Canada Trust',domain:'td.com'},
			{name:'Scotiabank',domain:'scotiabank.com'},
			{name:'Bank of Montreal (BMO)',domain:'bmo.com'},
			{name:'CIBC',domain:'cibc.com'},
			{name:'National Bank of Canada',domain:'nbc.ca'},
			{name:'Laurentian Bank',domain:'laurentianbank.ca'},
			{name:'Canadian Western Bank',domain:'cwbank.com'} 
		] 
	},

	{ code:'MX', name:'México', flag:'🇲🇽', currency:'MXN',
		accountLabel:'Cuenta CLABE', accountHint:'18 dígitos',
		extraLabel:'', idLabel:'RFC o CURP',
		banks:[
			{name:'Mercado Pago',domain:'mercadopago.com.mx'},
			{name:'BBVA México',domain:'bbva.mx'},
			{name:'Santander México',domain:'santander.com.mx'},
			{name:'Banorte',domain:'banorte.com'},
			{name:'Citibanamex',domain:'banamex.com'},
			{name:'HSBC México',domain:'hsbc.com.mx'},
			{name:'Scotiabank México',domain:'scotiabank.com.mx'},
			{name:'Inbursa',domain:'inbursa.com'},
			{name:'Banco Azteca',domain:'bancoazteca.com.mx'},
			{name:'BanCoppel',domain:'bancoppel.com'},
			{name:'Banco del Bienestar',domain:'bancodelbienestar.gob.mx',logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Logo_Banco_del_Bienestar.png/250px-Logo_Banco_del_Bienestar.png'},
			{name:'BanRegio',domain:'banregio.com'},
			{name:'Afirme',domain:'afirme.com'} 
		] 
	},

	// ---------- América Central y El Caribe ----------
	{ code:'CR', name:'Costa Rica', flag:'🇨🇷', currency:'CRC',
		accountLabel:'Cuenta IBAN', accountHint:'CR + 20 dígitos',
		extraLabel:'', idLabel:'Cédula',
		banks:[
			{name:'Banco Nacional de Costa Rica (BNCR)',domain:'bncr.fi.cr'},
			{name:'Banco de Costa Rica (BCR)',domain:'bancobcr.com'},
			{name:'Banco Popular',domain:'bancopopular.fi.cr'},
			{name:'BAC Credomatic',domain:'baccredomatic.com'},
			{name:'Scotiabank Costa Rica',domain:'scotiabank.com'},
			{name:'Davivienda Costa Rica',domain:'davivienda.com'},
			{name:'Banco Promerica',domain:'promerica.fi.cr'},
			{name:'Banco Lafise',domain:'lafise.com'} 
		] 
	},

	{ code:'PA', name:'Panamá', flag:'🇵🇦', currency:'PAB',
		accountLabel:'Número de cuenta', accountHint:'',
		extraLabel:'', idLabel:'Cédula / RUC',
		banks:[
			{name:'Banco General',domain:'bgeneral.com'},
			{name:'Banco Nacional de Panamá',domain:'banconal.com.pa'},
			{name:'Banistmo',domain:'banistmo.com'},
			{name:'BAC Credomatic Panamá',domain:'baccredomatic.com'},
			{name:'Global Bank',domain:'globalbank.com.pa'},
			{name:'Caja de Ahorros',domain:'cajadeahorros.com.pa'},
			{name:'Multibank',domain:'multibank.com.pa'},
			{name:'Banesco Panamá',domain:'banesco.com.pa'},
			{name:'Scotiabank Panamá',domain:'scotiabank.com'},
			{name:'St. Georges Bank',domain:'stgeorgesbank.com'} 
		] 
	},

	{ code:'DO', name:'República Dominicana', flag:'🇩🇴', currency:'DOP',
		accountLabel:'Número de cuenta', accountHint:'',
		extraLabel:'', idLabel:'Cédula',
		banks:[
			{name:'Banco Popular Dominicano',domain:'popularenlinea.com'},
			{name:'Banreservas',domain:'banreservas.com'},
			{name:'Banco BHD',domain:'bhd.com.do'},
			{name:'Scotiabank Rep. Dominicana',domain:'scotiabank.com.do'},
			{name:'APAP',domain:'apap.com.do'},
			{name:'Banco Promerica',domain:'promerica.com.do'},
			{name:'Banco Santa Cruz',domain:'bancosantacruz.com.do'},
			{name:'Banesco',domain:'banesco.com.do'} 
		] 
	},

	// ---------- América del Sur ----------
	{ code:'CO', name:'Colombia', flag:'🇨🇴', currency:'COP',
		accountLabel:'Número de cuenta', accountHint:'',
		extraLabel:'Tipo de cuenta (Ahorros / Corriente)', idLabel:'Cédula de Ciudadanía',
		banks:[
			{name:'Bancolombia',domain:'bancolombia.com'},
			{name:'Banco de Bogotá',domain:'bancodebogota.com'},
			{name:'Davivienda',domain:'davivienda.com'},
			{name:'BBVA Colombia',domain:'bbva.com.co'},
			{name:'Banco de Occidente',domain:'bancodeoccidente.com.co'},
			{name:'Banco Popular',domain:'bancopopular.com.co'},
			{name:'Scotiabank Colpatria',domain:'scotiabankcolpatria.com'},
			{name:'Itaú Colombia',domain:'itau.co'},
			{name:'Banco Caja Social',domain:'bancocajasocial.com'},
			{name:'Banco Agrario',domain:'bancoagrario.gov.co'} 
		] 
	},

	{ code:'BR', name:'Brasil', flag:'🇧🇷', currency:'BRL',
		accountLabel:'Agência e Conta', accountHint:'',
		extraLabel:'Chave PIX', idLabel:'CPF',
		banks:[
			{name:'Itaú Unibanco',domain:'itau.com.br'},
			{name:'Banco do Brasil',domain:'bb.com.br'},
			{name:'Bradesco',domain:'bradesco.com.br'},
			{name:'Caixa Econômica Federal',domain:'caixa.gov.br'},
			{name:'Santander Brasil',domain:'santander.com.br'},
			{name:'Nubank',domain:'nubank.com.br'},
			{name:'BTG Pactual',domain:'btgpactual.com'},
			{name:'Banco Safra',domain:'safra.com.br'},
			{name:'Sicoob',domain:'sicoob.com.br'},
			{name:'Sicredi',domain:'sicredi.com.br'} 
		] 
	},

	{ code:'AR', name:'Argentina', flag:'🇦🇷', currency:'ARS',
		accountLabel:'CBU / CVU', accountHint:'22 dígitos',
		extraLabel:'Alias', idLabel:'CUIT / CUIL / DNI',
		banks:[
			{name:'Banco Nación',domain:'bna.com.ar'},
			{name:'Banco Provincia',domain:'bancoprovincia.com.ar'},
			{name:'Banco Galicia',domain:'galicia.com.ar'},
			{name:'Santander Argentina',domain:'santander.com.ar'},
			{name:'BBVA Argentina',domain:'bbva.com.ar'},
			{name:'Banco Macro',domain:'macro.com.ar'},
			{name:'Banco Ciudad',domain:'bancociudad.com.ar'},
			{name:'HSBC Argentina',domain:'hsbc.com.ar'},
			{name:'ICBC Argentina',domain:'icbc.com.ar'},
			{name:'Banco Credicoop',domain:'bancocredicoop.coop'} 
		] 
	},

	{ code:'CL', name:'Chile', flag:'🇨🇱', currency:'CLP',
		accountLabel:'Número de cuenta', accountHint:'',
		extraLabel:'Tipo de cuenta', idLabel:'RUT',
		banks:[
			{name:'Banco Santander Chile',domain:'santander.cl'},
			{name:'Banco de Chile',domain:'bancochile.cl'},
			{name:'BancoEstado',domain:'bancoestado.cl'},
			{name:'Banco de Crédito e Inversiones (Bci)',domain:'bci.cl'},
			{name:'Scotiabank Chile',domain:'scotiabank.cl'},
			{name:'Itaú Corpbanca',domain:'itau.cl'},
			{name:'Banco Falabella',domain:'bancofalabella.cl'},
			{name:'Banco Security',domain:'security.cl'},
			{name:'Banco BICE',domain:'bice.cl'},
			{name:'Banco Consorcio',domain:'consorcio.cl'} 
		] 
	},

	{ code:'PE', name:'Perú', flag:'🇵🇪', currency:'PEN',
		accountLabel:'CCI (Código de Cuenta Interbancario)', accountHint:'20 dígitos',
		extraLabel:'', idLabel:'DNI / RUC',
		banks:[
			{name:'Banco de Crédito del Perú (BCP)',domain:'viabcp.com'},
			{name:'BBVA Perú',domain:'bbva.pe'},
			{name:'Scotiabank Perú',domain:'scotiabank.com.pe'},
			{name:'Interbank',domain:'interbank.pe'},
			{name:'Banco de la Nación',domain:'bn.com.pe'},
			{name:'Mibanco',domain:'mibanco.com.pe'},
			{name:'Banco Pichincha Perú',domain:'pichincha.pe'},
			{name:'BanBif',domain:'banbif.com.pe'},
			{name:'Banco Falabella Perú',domain:'bancofalabella.pe'},
			{name:'Banco Ripley Perú',domain:'bancoripley.com.pe'} 
		] 
	},

	{ code:'EC', name:'Ecuador', flag:'🇪🇨', currency:'USD',
		accountLabel:'Número de cuenta', accountHint:'',
		extraLabel:'Tipo de cuenta (Ahorros / Corriente)', idLabel:'Cédula',
		banks:[
			{name:'Banco Pichincha',domain:'pichincha.com'},
			{name:'Banco Guayaquil',domain:'bancoguayaquil.com'},
			{name:'Banco del Pacífico',domain:'bancodelpacifico.com'},
			{name:'Produbanco',domain:'produbanco.com.ec'},
			{name:'Banco Bolivariano',domain:'bolivariano.com'},
			{name:'Banco Internacional',domain:'bancointernacional.com.ec'},
			{name:'Banco del Austro',domain:'bancodelaustro.com'},
			{name:'Banco Solidario',domain:'banco-solidario.com'} 
		] 
	},

	{ code:'UY', name:'Uruguay', flag:'🇺🇾', currency:'UYU',
		accountLabel:'Número de cuenta', accountHint:'',
		extraLabel:'', idLabel:'Cédula de Identidad',
		banks:[
			{name:'Banco República (BROU)',domain:'brou.com.uy'},
			{name:'Santander Uruguay',domain:'santander.com.uy'},
			{name:'Banco Itaú Uruguay',domain:'itau.com.uy'},
			{name:'BBVA Uruguay',domain:'bbva.com.uy'},
			{name:'Scotiabank Uruguay',domain:'scotiabank.com.uy'},
			{name:'Banque Heritage',domain:'heritage.com.uy'},
			{name:'Banco Hipotecario (BHU)',domain:'bhu.com.uy'} 
		] 
	},

	{ code:'GT', name:'Guatemala', flag:'', currency:'GTQ',
		accountLabel:'Número de cuenta', accountHint:'',
		extraLabel:'Tipo de cuenta (Ahorros / Corriente)', 
		idLabel:'Cédula',
		banks:[
			{name:'Banco Industrial (BI)',domain:'corporacionbi.com'},
			{name:'Banco Agromercantil (BAM)',domain:'bam.com.gt'},
			{name:'Banrural',domain:'banrural.com.gt'},
			{name:'BAC Guatemala',domain:'baccredomatic.com'},
			{name:'Banco G&T Continental',domain:'gtc.com.gt'},
			{name:'Banco Promerica',domain:'bancopromerica.com.gt'},
		] 
	},
	{ code:'SV', name:'El Salvador', flag:'', currency:'USD',
		accountLabel:'Número de cuenta', accountHint:'',
		extraLabel:'Tipo de cuenta (Ahorros / Corriente)', 
		idLabel:'Cédula',
		banks:[
			{name:'Banco Agrícola',domain:'www.bancoagricola.com'},
			{name:'Banco Cuscatlán',domain:'bancocuscatlan.com'},
			{name:'Banco Davivienda',domain:'davivienda.com'},
			{name:'Banco de América Central (BAC)',domain:'baccredomatic.com'},
			{name:'Banco Hipotecario',domain:'hipotecario.com.ar'},
			{name:'Banco Promerica',domain:'bancopromerica.com.gt'},
		] 
	},
];

function getCountry(code){ 
	return COUNTRIES.find(c=>c.code===code); 
}

// Billeteras digitales (alternativa a banco/país)
const WALLETS = [
	{ name:'Binance',      domain:'binance.com',     accountLabel:'Correo o Binance Pay ID' },
	{ name:'Bitso',        domain:'bitso.com',       accountLabel:'Correo o CLABE de Bitso' },
	{ name:'Global66',     domain:'global66.com',    accountLabel:'Correo o teléfono' },
	{ name:'Mercado Pago', domain:'mercadopago.com', accountLabel:'Correo, CVU o alias' },
	{ name:'PayPal',       domain:'paypal.com',      accountLabel:'Correo de PayPal' },
	{ name:'Wise',         domain:'wise.com',        accountLabel:'Correo o usuario de Wise' },
	{ name:'Airtm',        domain:'airtm.com',       accountLabel:'Correo de Airtm' },
	{ name:'Payoneer',     domain:'payoneer.com',    accountLabel:'Correo de Payoneer' },
	{ name:'Skrill',       domain:'skrill.com',      accountLabel:'Correo de Skrill' },
	{ name:'AstroPay',     domain:'astropay.com',    accountLabel:'Correo o usuario' },
	{ name:'USDT Solana',  domain:'tether.to',       accountLabel:'Dirección criptográfica' },
];

// Logo del banco: DuckDuckGo (directo) con respaldo a favicon de Google y, por último, inicial.
function bankLogoUrl(domain){ 
	return 'https://icons.duckduckgo.com/ip3/'+domain+'.ico'; 
}

function bankLogoHtml(bank, size)
{
	const s = size||34;
	const fav = bankLogoUrl(bank.domain);
	const gfav = 'https://www.google.com/s2/favicons?domain=' + bank.domain + '&sz=64';
	const primary = bank.logo || fav;          // logo directo si está definido
	const fallback = bank.logo ? fav : gfav;   // si no, cadena de favicons
	return `
	<img class="bank-logo" width="${s}" height="${s}" loading="lazy"
		src="${primary}"
		onerror="this.onerror=null; this.src='${fallback}';">`;
}