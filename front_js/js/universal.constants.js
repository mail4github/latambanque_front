if (typeof SITE_DOMAIN == "undefined") {
    var SITE_DOMAIN = "https://bet365onstock.com/";
}
var BASE_CURRENCY_DESCRIPTION = "USDT Solana";
var current_game_starts_at = 0;
var FREE_GAME_MAX_PLAYERS = 50;
var battle_room_stocks_limit = 1;
var TRACK_COOKIE_NAME = get_domain_name(SITE_DOMAIN) + "_ref_id";

if (typeof PAYD_GAME_REWARD !== "undefined") {
    PAYD_GAME_REWARD.forEach(row => {
        row.forEach(col => {
            col["share"] = (Number(col["share"]) * 100).toFixed(1);
        });
    });
}
const POKER_STOCKS_LIMIT = 5;

const STOCK_VS_STOCK_ROOMS = [
    [
        {
            "code": "NFLX",
            "name": "Netflix",
        }, 
        {
            "code":"DIS",
            "name": "Disney",
        }
    ],
    [
        {
            "code": "UBER",
            "name": "Uber",
        }, 
        {
            "code":"LFT",
            "name": "Lift",
        }
    ],
    [
        {
            "code": "SQ",
            "name": "Square",
        }, 
        {
            "code":"PYPL",
            "name": "Paypal",
        }
    ],
    [
        {
            "code": "GOOGL",
            "name": "Alphabet",
        }, 
        {
            "code":"META",
            "name": "Facebook",
        }
    ],
    [
        {
            "code": "AMD",
            "name": "AMD",
        }, 
        {
            "code":"INTC",
            "name": "Intel",
        }
    ],
    [
        {
            "code": "META",
            "name": "Facebook",
        }, 
        {
            "code":"TWTR",
            "name": "Twitter",
        }
    ],
    [
        {
            "code": "AAPL",
            "name": "Apple",
        }, 
        {
            "code":"MSFT",
            "name": "Microsoft",
        }
    ],
    [
        {
            "code": "AMZN",
            "name": "Amazon",
        }, 
        {
            "code":"WMT",
            "name": "Walmart",
        }
    ],
    [
        {
            "code": "GOOGL",
            "name": "Google",
        }, 
        {
            "code":"MSFT",
            "name": "Microsoft",
        }
    ],
    [
        {
            "code": "TSLA",
            "name": "Tesla",
        }, 
        {
            "code":"GM",
            "name": "General Motors",
        }
    ],
    [
        {
            "code": "PFE",
            "name": "Pfizer",
        }, 
        {
            "code":"JNJ",
            "name": "Johnson & Johnson",
        }
    ],
    [
        {
            "code": "GS",
            "name": "Goldman Sachs",
        }, 
        {
            "code":"JS",
            "name": "JPMorgan Chase",
        }
    ],
    [
        {
            "code": "T",
            "name": "AT&T",
        }, 
        {
            "code":"VZ",
            "name": "Verizon",
        }
    ],
    [
        {
            "code": "FDX",
            "name": "FedEx",
        }, 
        {
            "code":"UPS",
            "name": "UPS",
        }
    ],
    [
        {
            "code": "F",
            "name": "Ford",
        }, 
        {
            "code":"GM",
            "name": "General Motors",
        }
    ],
    [
        {
            "code": "NKE",
            "name": "Nike",
        }, 
        {
            "code":"ADS",
            "name": "Adidas",
        }
    ],
    [
        {
            "code": "KO",
            "name": "The Coca-Cola",
        }, 
        {
            "code":"PEP",
            "name": "PepsiCo",
        }
    ],
    [
        {
            "code": "MCD",
            "name": "McDonald's",
        }, 
        {
            "code":"BK",
            "name": "Burger King",
        }
    ],
    [
        {
            "code": "IBM",
            "name": "IBM",
        }, 
        {
            "code":"ORCL",
            "name": "Oracle",
        }
    ],
    [
        {
            "code": "CVX",
            "name": "Chevron",
        }, 
        {
            "code":"XOM",
            "name": "ExxonMobil",
        }
    ],
];

const CRYPTO_STOCK_VS_STOCK_ROOMS = [
    [
        {
            "code": "BTC",
            "name": "Bitcoin",
        }, 
        {
            "code":"ETH",
            "name": "Ethereum",
        }
    ],
    [
        {
            "code": "SOL",
            "name": "Solana",
        }, 
        {
            "code":"ETH",
            "name": "Ethereum",
        }
    ],
    [
        {
            "code": "BNB",
            "name": "Binance",
        }, 
        {
            "code":"BTC",
            "name": "Bitcoin",
        }
    ],
    [
        {
            "code": "XRP",
            "name": "XRP",
        }, 
        {
            "code":"ETH",
            "name": "Ethereum",
        }
    ],
    [
        {
            "code": "BTC",
            "name": "Bitcoin",
        }, 
        {
            "code":"SOL",
            "name": "Solana",
        }
    ],
    [
        {
            "code": "BTC",
            "name": "Bitcoin",
        }, 
        {
            "code":"AVAX",
            "name": "Avalanche",
        }
    ],
    [
        {
            "code": "ADA",
            "name": "Cardano",
        }, 
        {
            "code":"SOL",
            "name": "Solana",
        }
    ],
    [
        {
            "code": "AVAX",
            "name": "Avalanche",
        }, 
        {
            "code":"NEAR",
            "name": "NEAR Protocol",
        }
    ],
    [
        {
            "code": "ETH",
            "name": "Ethereum",
        }, 
        {
            "code":"MATIC",
            "name": "Polygon",
        }
    ],
    [
        {
            "code": "OP",
            "name": "Optimism",
        }, 
        {
            "code":"ABR",
            "name": "Arbitrum",
        }
    ],
    [
        {
            "code": "XRP",
            "name": "XRP",
        }, 
        {
            "code":"XLM",
            "name": "Stellar",
        }
    ],
    [
        {
            "code": "ADA",
            "name": "Cardano",
        }, 
        {
            "code":"XRP",
            "name": "XRP",
        }
    ],
    [
        {
            "code": "BTC",
            "name": "Bitcoin",
        }, 
        {
            "code":"XRP",
            "name": "XRP",
        }
    ],
    [
        {
            "code": "BNB",
            "name": "Binance Coin",
        }, 
        {
            "code":"TRX",
            "name": "Tron",
        }
    ],
    [
        {
            "code": "FET",
            "name": "Fetch ai",
        }, 
        {
            "code":"AGIX",
            "name": "SingularityNET",
        }
    ],
    [
        {
            "code": "RNDR",
            "name": "Render Token",
        }, 
        {
            "code":"NEAR",
            "name": "NEAR Protocol",
        }
    ],
    [
        {
            "code": "DOGE",
            "name": "Dogecoin",
        }, 
        {
            "code":"SHIB",
            "name": "Shiba Inu",
        }
    ],
    [
        {
            "code": "DOGE",
            "name": "Dogecoin",
        }, 
        {
            "code":"PEPE",
            "name": "Pepe",
        }
    ],
    [
        {
            "code": "SHIB",
            "name": "Shiba Inu",
        }, 
        {
            "code":"PEPE",
            "name": "Pepe",
        }
    ],
    [
        {
            "code": "BONK",
            "name": "Bonk",
        }, 
        {
            "code":"WIF",
            "name": "Dogwifhat",
        }
    ],
];

const BATTLECOIN_RATE_TO_USD = 1;
var SPINNER_CODE = `
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:50px; height:50px; margin: auto; display: block;">
    <style>
        .spinner_qM83{
            animation:spinner_8HQG 1.05s infinite;
            fill:rgba(255, 255, 255, 0.5);
        }
        .spinner_oXPr{
            animation-delay:.1s
        }
        .spinner_ZTLf{
            animation-delay:.2s
        }
        @keyframes spinner_8HQG{
            0%,57.14%{ animation-timing-function:cubic-bezier(0.33,.66,.66,1); transform:translate(0) }
            28.57%{ animation-timing-function:cubic-bezier(0.33,0,.66,.33);transform:translateY(-6px)}
            100%{ transform:translate(0)}
        }
    </style>
    <circle class="spinner_qM83" cx="4" cy="12" r="3"/>
    <circle class="spinner_qM83 spinner_oXPr" cx="12" cy="12" r="3"/>
    <circle class="spinner_qM83 spinner_ZTLf" cx="20" cy="12" r="3"/>
</svg>
`;

const SHARE_URL_PATH = "vg/<current_page_url>/<room_type>/<status_of_room>/<stocks_limit>/<room_numb>";
const SHARE_URL = SITE_DOMAIN + SHARE_URL_PATH;
const SOCIAL_CODE_TEMPLATE = `
<div class="social d-flex justify-content-center py-1">
    <i class="no-desk bi bi-chevron-left color_gold fs-5 ml-1 mt-0 align-self-center" onclick="if ( $(this).hasClass('bi-chevron-right') ) {$(this).removeClass('bi-chevron-right').addClass('bi-chevron-left'); $('.social_images_row').hide();} else {$(this).addClass('bi-chevron-right').removeClass('bi-chevron-left'); $('.social_images_row').removeClass('no-mobile'); $('.social_images_row').show();} "></i>
    <i class="no-mobile bi bi-chevron-right color_gold fs-5 ml-1 mt-0 align-self-center " onclick="if ( $(this).hasClass('bi-chevron-right') ) {$(this).removeClass('bi-chevron-right').addClass('bi-chevron-left'); $('.social_images_row').hide();} else {$(this).addClass('bi-chevron-right').removeClass('bi-chevron-left'); $('.social_images_row').removeClass('no-mobile'); $('.social_images_row').show();} "></i>
    <div class="social_images_row no-mobile">
        <a href="#" onclick="window.open('https://vk.com/share.php?url=' + encodeURIComponent('${SHARE_URL}'), '_blank');" target="_blank"><img src="/image/social/vk.png"></a>
        <a href="#" onclick="window.open('https://twitter.com/share?url=' + encodeURIComponent('${SHARE_URL}'), '_blank');" target="_blank"><img src="/image/social/x.png"></a>
        <a href="#" onclick="window.open('https://www.facebook.com/sharer.php?u=' + encodeURIComponent('${SHARE_URL}'), '_blank');" target="_blank"><img src="/image/social/facebook.png"></a>
        <a href="#" onclick="window.open('https://wa.me/?text=' + encodeURIComponent('${SHARE_URL}'), '_blank');" target="_blank"><img src="/image/social/whatsapp.svg"></a>
        <a href="#" onclick="window.open('tg://msg_url?url=' + encodeURIComponent('${SHARE_URL}'), '_blank');" target="_blank"><img src="/image/social/telegram.svg"></a>
        <a href="#" onclick="window.open('viber://forward?text=' + encodeURIComponent('${SHARE_URL}'), '_blank');" target="_blank"><img src="/image/social/viber.svg"></a>
        <a href="#" onclick="window.open('signal://send?text=' + encodeURIComponent('${SHARE_URL}'), '_blank');" target="_blank"><img src="/image/social/signal.svg"></a>
    </div>
    <a href="#" class="color_gold font-weight-light fs-5 px-2 align-self-center" onclick="copy_to_clipboard('${SHARE_URL}', 'URL has been copied to clipboard'); return false;">
        Copy 
        <img src="/image/social/share.svg" style="width:auto; height:0.8em; margin:auto 10px auto 0;">
    </a>
</div>
`;
var SOCIAL_CODE = SOCIAL_CODE_TEMPLATE;
var FUNCTION_AFTER_COPY = "undefined_function";
var SOCIAL_CODE_GAME_COST = null;

const SOCIAL_CODE_TEMPLATE_NEW = `
<div class="zoom_65_at_short_desk">
    <div class="d-flex justify-content-center">
        <a href="https://x.com/StockBattle365" target="_blank"><img class="social-s" src="/image/social/x.png"></a>
        <a href="https://www.facebook.com/share/1C6PTzSbA2/?mibextid=wwXIfr" target="_blank"><img class="social-s" src="/image/social/fb.png"></a>
        <a href="https://chat.whatsapp.com/DW2xKdRMMtQCxQya0XGYAY" target="_blank"><img class="social-s" src="/image/social/wt.png"></a>
        <a href="tg://msg_url?url=${SHARE_URL}" target="_blank"><img class="social-s" src="/image/social/tg.png"></a>
        <a href="https://www.tiktok.com/@stockbattle" target="_blank"><img class="social-s" src="/image/social/tt.png"></a>
        <a href="https://www.linkedin.com/groups/15786035/" target="_blank"><img class="social-s" src="/image/social/in.png"></a>
        <a href="https://www.instagram.com/bet365onstock?igsh=MWVzYW1xcGZqMmd5Mw%3D%3D&utm_source=qr" target="_blank"><img class="social-s" src="/image/social/inst.png"></a>
        <a href="#" onclick="let tr = translate_str('A link to invite your friends has been copied to clipboard.'); copy_to_clipboard('${SHARE_URL}', tr, undefined, '${FUNCTION_AFTER_COPY}'); return false;">
            <img src="/image/social/copy.png" class="social-copy">
        </a>
    </div>
    
</div>
`;
/*
<button 
        type="button" 
        class="publish_to_telegram_btn border-2px border-primary btn color_bkg_haiti d-block fs-5 mx-auto py-0 rounded rounded-pill _shadow_0_8 text-white shadow-none-when-active glow-inside-blue-when-active mt-1"
        style="min-width:130px;" 
        onclick="post_on_telegram('', undefined, SOCIAL_CODE_GAME_COST);">
        <img src="/image/social/telegram_white.svg" style="width:auto; height:14px; margin:-2px 5px 0 0;">
        Publish
    </button>
*/
var SOCIAL_CODE_NEW = SOCIAL_CODE_TEMPLATE_NEW;
var TELEGRAM_BOT_URL = "http://t.me//StockBattleBot?start=id";
if (typeof FOLLOWING_FEE !== "undefined") {
    var FOLLOWING_FEE_PERCENT = Math.round(FOLLOWING_FEE * 100);
}
var PASSWORD_CPEC_SYMBOLS = ".!#@%";
var debug_code_begin = "<!--";
var debug_code_end = "-->";
var prod_code_begin = "";
var prod_code_end = "";

var language_checks = 0;
var selected_language = "";
var script_filename = "index_html";
var timer_collect_translated_strings = 0;
var google_translate_initiated = false;
var global_language = get_cookie("language") || "en"; //!!!!!!!<<<<<<<<<<<<<<<<
var defaultPage = "index-page";
var referral_number = generate_referral_number();
var referrals_rate = Math.round(localStorage.getItem("referrals_rate") * 100) || 5;
