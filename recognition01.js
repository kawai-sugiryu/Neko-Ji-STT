'use strict';

// ===== Google Fonts 日本語対応フォント一覧 =====
const FONTS = [
  { label: 'Noto Sans JP',            value: 'Noto+Sans+JP' },
  { label: 'Noto Serif JP',           value: 'Noto+Serif+JP' },
  { label: 'M PLUS 1p',              value: 'M+PLUS+1p' },
  { label: 'M PLUS Rounded 1c',      value: 'M+PLUS+Rounded+1c' },
  { label: 'Kosugi Maru',            value: 'Kosugi+Maru' },
  { label: 'Kosugi',                 value: 'Kosugi' },
  { label: 'Sawarabi Gothic',        value: 'Sawarabi+Gothic' },
  { label: 'Sawarabi Mincho',        value: 'Sawarabi+Mincho' },
  { label: 'Zen Kaku Gothic New',    value: 'Zen+Kaku+Gothic+New' },
  { label: 'Zen Kaku Gothic Antique',value: 'Zen+Kaku+Gothic+Antique' },
  { label: 'Zen Old Mincho',         value: 'Zen+Old+Mincho' },
  { label: 'Zen Maru Gothic',        value: 'Zen+Maru+Gothic' },
  { label: 'BIZ UDPGothic',         value: 'BIZ+UDPGothic' },
  { label: 'BIZ UDPMincho',         value: 'BIZ+UDPMincho' },
  { label: 'Hina Mincho',           value: 'Hina+Mincho' },
  { label: 'Kaisei Decol',          value: 'Kaisei+Decol' },
  { label: 'Kaisei Opti',           value: 'Kaisei+Opti' },
  { label: 'Dela Gothic One',       value: 'Dela+Gothic+One' },
  { label: 'DotGothic16',           value: 'DotGothic16' },
  { label: 'RocknRoll One',         value: 'RocknRoll+One' },
  { label: 'Reggae One',            value: 'Reggae+One' },
  { label: 'Stick',                 value: 'Stick' },
  { label: 'Train One',             value: 'Train+One' },
  { label: 'Yusei Magic',           value: 'Yusei+Magic' },
  { label: 'Kiwi Maru',            value: 'Kiwi+Maru' },
  { label: 'Rampart One',           value: 'Rampart+One' },
];

// ===== DOM 参照 =====
const $ = id => document.getElementById(id);

const stgFs1   = $('stgFs1');
const stgFs2   = $('stgFs2');
const stgFs2b  = $('stgFs2b');
const stgFs2g  = $('stgFs2g');
const stgFs2bg = $('stgFs2bg');
const stgFs3   = $('stgFs3');
const stgFs4   = $('stgFs4');
const stgFs4b  = $('stgFs4b');
const stgFs4g  = $('stgFs4g');
const stgFs4bg = $('stgFs4bg');
const stgMicOn = $('stgMicOn');
const stgBouyomi   = $('stgBouyomi');
const stgVoicevox  = $('stgVoicevox');
const stgFont  = $('stgFont');

const stg = $('stg');
const mic = $('mic');
const oin = $('oin');

const win_x = $('x');   const win_y = $('y');
const win_w = $('w');   const win_h = $('h');
const log_w = $('lw');  const log_h = $('lh');
const cur_w = $('cw');
const r_align = $('r_align');
const cw_auto = $('cw_auto');

const content      = $('content');
const v_border     = $('v_border');
const h_border     = $('h_border');
const l_log        = $('l_log');
const r_log        = $('r_log');
const diag_current = $('current');
const settingsPanel= $('settingsPanel');
const statusMsg    = $('statusMsg');

// ===== AudioContext（VOICEVOX & Edge SR 対策で先に生成） =====
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// ===== フォントセレクト初期化 =====
(function initFontSelect() {
  FONTS.forEach(f => {
    const opt = document.createElement('option');
    opt.value = f.value;
    opt.textContent = f.label;
    stgFont.appendChild(opt);
  });
  const saved = localStorage.getItem('defFont') || 'Noto+Sans+JP';
  stgFont.value = saved;
  applyFont(saved);
})();

stgFont.addEventListener('change', () => {
  applyFont(stgFont.value);
  localStorage.setItem('defFont', stgFont.value);
});

function applyFont(value) {
  const name = value.replace(/\+/g, ' ');
  const linkId = 'gf-' + value;
  if (!document.getElementById(linkId)) {
    const link = document.createElement('link');
    link.id   = linkId;
    link.rel  = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${value}:wght@400;500;700&display=swap`;
    document.head.appendChild(link);
  }
  document.documentElement.style.setProperty('--font-family', `'${name}', sans-serif`);
}

// ===== text-shadow ビルダー =====
/**
 * 2重縁取り対応の text-shadow 値を生成する。
 * グラデーション有効時は方向ベクトルに応じて lerpHex で色を補間。
 * 2重目(外側)→1重目(内側)の順で parts に積む。
 */
function buildTextShadow(s1, c1, c1g, s2, c2, c2g) {
  const parts = [];
  const addLayer = (s, c, cg) => {
    if (!s || s <= 0) return;
    for (let i = -s; i <= s; i++) {
      for (let j = -s; j <= s; j++) {
        if (i === 0 && j === 0) continue;
        const color = cg
          ? lerpHex(c, cg, ((i + s) / (s * 2) + (j + s) / (s * 2)) / 2)
          : c;
        parts.push(`${i}px ${j}px 0 ${color}`);
      }
    }
  };
  addLayer(s2, c2, c2g || null);  // 2重目を先（背面）
  addLayer(s1, c1, c1g || null);  // 1重目を後（前面）
  return parts.length ? parts.join(',') : 'none';
}

function lerpHex(hex1, hex2, t) {
  const r1 = parseInt(hex1.slice(1,3),16), g1 = parseInt(hex1.slice(3,5),16), b1 = parseInt(hex1.slice(5,7),16);
  const r2 = parseInt(hex2.slice(1,3),16), g2 = parseInt(hex2.slice(3,5),16), b2 = parseInt(hex2.slice(5,7),16);
  return '#' + [
    Math.round(r1 + (r2-r1)*t),
    Math.round(g1 + (g2-g1)*t),
    Math.round(b1 + (b2-b1)*t),
  ].map(v => v.toString(16).padStart(2,'0')).join('');
}

function hex(pickr) {
  return pickr.getColor().toHEXA().toString().slice(0, 7);
}

// ===== Pickr 共通ファクトリ =====
function createPickr(el, defaultColor) {
  return Pickr.create({
    el,
    theme: 'monolith',
    comparison: false,
    lockOpacity: false,
    default: defaultColor,
    components: {
      preview: true, opacity: false, hue: true,
      interaction: { input: true, hex: true, hsva: true, save: false }
    }
  }).on('hide', self => self.applyColor(true));
}

// 背景色
const stgBgc1 = createPickr('#stgBgc1', localStorage.getItem('defBgc1') || '#DBDAFF');
const stgBgc2 = createPickr('#stgBgc2', localStorage.getItem('defBgc2') || '#8B90C7');
const stgBgc3 = createPickr('#stgBgc3', localStorage.getItem('defBgc3') || '#65659B');
stgBgc1.on('change', hsva => { document.body.style.backgroundColor = hsva.toHEXA(); });

// 文字色・縁取り色
const stgFc1   = createPickr('#stgFc1',   localStorage.getItem('defFc1')   || '#00488C');
const stgFc2   = createPickr('#stgFc2',   localStorage.getItem('defFc2')   || '#FFFFFF');
const stgFc2g  = createPickr('#stgFc2g',  localStorage.getItem('defFc2g')  || '#FFFF00');
const stgFc2b  = createPickr('#stgFc2b',  localStorage.getItem('defFc2b')  || '#000000');
const stgFc2bg = createPickr('#stgFc2bg', localStorage.getItem('defFc2bg') || '#FF0000');
const stgFc3   = createPickr('#stgFc3',   localStorage.getItem('defFc3')   || '#FFFFFF');
const stgFc4   = createPickr('#stgFc4',   localStorage.getItem('defFc4')   || '#D82222');
const stgFc4g  = createPickr('#stgFc4g',  localStorage.getItem('defFc4g')  || '#FFAA00');
const stgFc4b  = createPickr('#stgFc4b',  localStorage.getItem('defFc4b')  || '#000000');
const stgFc4bg = createPickr('#stgFc4bg', localStorage.getItem('defFc4bg') || '#FF0000');

// ===== SpeechRecognition =====
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SR) alert('このブラウザは SpeechRecognition に対応していません。');

const recognition = new SR();
recognition.continuous     = true;
recognition.lang           = 'ja';
recognition.interimResults = true;
recognition.maxAlternatives= 1;

let lastIdx    = 0;
let retryCount = 0;
let retryTimer = null;
let srRunning  = false;

/**
 * Edge 対策：
 * - AudioContext が suspended のまま start() するとネットワークエラーになるため先に resume。
 * - delay を挟むことで Edge の内部状態が安定してから起動できる。
 */
function srStart(delay = 0) {
  if (srRunning) return;
  const doStart = () => {
    const p = audioCtx.state === 'suspended' ? audioCtx.resume() : Promise.resolve();
    p.then(() => {
      if (!mic.checked) return;
      try {
        recognition.start();
        srRunning = true;
      } catch (_) {
        // InvalidStateError（多重起動）は無視
      }
    });
  };
  delay > 0 ? setTimeout(doStart, delay) : doStart();
}

function srStop() {
  srRunning = false;
  try { recognition.stop(); } catch (_) {}
}

recognition.onstart = () => { srRunning = true; };

recognition.onend = () => {
  srRunning = false;
  if (!mic.checked) return;
  if (retryCount >= 5) {
    // 連続失敗多発 → mic 強制 OFF
    mic.checked = false;
    document.querySelector('label[for="mic"]').textContent = 'mic_off';
    console.warn('[SR] 連続エラーが多いため停止しました');
    retryCount = 0;
    return;
  }
  // networkエラー後は少し待ってから再起動（Edge で有効）
  const delay = retryCount > 0 ? 800 : 150;
  srStart(delay);
  retryCount++;
  clearTimeout(retryTimer);
  retryTimer = setTimeout(() => { retryCount = 0; }, 8000);
};

recognition.onresult = (event) => {
  const last    = event.results.length - 1;
  const outText = event.results[last][0].transcript;
  const activeLog = r_align.checked ? r_log : l_log;
  let logElm = activeLog.querySelector(`.r${lastIdx}`);

  if (!logElm) {
    const shadow1 = buildTextShadow(
      +stgFs4.value,  hex(stgFc4),  stgFs4g.checked  ? hex(stgFc4g)  : null,
      +stgFs4b.value, hex(stgFc4b), stgFs4bg.checked ? hex(stgFc4bg) : null
    );
    const celm = document.createElement('div');
    celm.textContent = outText;
    celm.style.cssText = [
      `font-size:${stgFs3.value}pt`,
      `color:${hex(stgFc3)}`,
      `text-shadow:${shadow1}`,
      `font-family:var(--font-family)`,
    ].join(';');
    diag_current.replaceChildren(celm);

    const shadow2 = buildTextShadow(
      +stgFs2.value,  hex(stgFc2),  stgFs2g.checked  ? hex(stgFc2g)  : null,
      +stgFs2b.value, hex(stgFc2b), stgFs2bg.checked ? hex(stgFc2bg) : null
    );
    const lelm = document.createElement('div');
    lelm.textContent = outText;
    lelm.className   = `r${lastIdx}`;
    lelm.style.cssText = [
      `font-size:${stgFs1.value}pt`,
      `color:${hex(stgFc1)}`,
      `text-shadow:${shadow2}`,
      `background-color:${hex(lastIdx % 2 === 0 ? stgBgc2 : stgBgc3)}`,
      `font-family:var(--font-family)`,
    ].join(';');
    activeLog.prepend(lelm);

  } else {
    if (diag_current.firstChild) diag_current.firstChild.textContent = outText;
    logElm.textContent = outText;
  }

  if (event.results[last].isFinal) {
    lastIdx++;
    srStop();   // onend → srStart(delay) でリトライ
    if (stgBouyomi.checked)       sendBouyomi(outText);
    else if (stgVoicevox.checked) sendVoicevox(outText);
  }
};

recognition.onerror = (e) => {
  const errType = e.error ?? e.message ?? String(e);
  srRunning = false;
  switch (errType) {
    case 'no-speech':
      // 無音は正常。onend で再起動される
      break;
    case 'network':
      // Edge で頻出。onend 後のリトライ（delay付き）に任せる
      console.warn('[SR] network error（Edge の既知挙動）');
      break;
    case 'audio-capture':
      // マイク取得失敗。onend 後に再試行
      console.warn('[SR] audio-capture: マイクが一時的に取得できませんでした');
      break;
    case 'not-allowed':
    case 'service-not-allowed':
      // 権限エラーは自動リトライしない
      console.error('[SR] マイクの使用が許可されていません');
      mic.checked = false;
      document.querySelector('label[for="mic"]').textContent = 'mic_off';
      break;
    default:
      console.warn('[SR error]', errType, e);
  }
};

// ===== 棒読みちゃん =====
function sendBouyomi(text) {
  fetch(`http://localhost:50080/Talk?text=${encodeURIComponent(text)}`).catch(() => {});
}

// ===== VOICEVOX =====
async function sendVoicevox(text) {
  const speaker = 5;
  try {
    const qRes  = await fetch(
      `http://localhost:50021/audio_query?speaker=${speaker}&text=${encodeURIComponent(text)}`,
      { method: 'POST' }
    );
    const query = await qRes.json();
    const sRes  = await fetch(`http://localhost:50021/synthesis?speaker=${speaker}`, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body   : JSON.stringify(query),
    });
    const buf   = await sRes.arrayBuffer();
    const audio = await audioCtx.decodeAudioData(buf);
    const src   = audioCtx.createBufferSource();
    src.buffer  = audio;
    src.connect(audioCtx.destination);
    src.start(0);
  } catch (err) {
    console.warn('[VOICEVOX]', err);
  }
}

// ===== ResizeObserver =====
new ResizeObserver(([e]) => {
  log_w.value = Math.ceil(e.contentRect.width  + 20);
  log_h.value = Math.ceil(e.contentRect.height + 10);
  localStorage.setItem('defLW', log_w.value);
  localStorage.setItem('defLH', log_h.value);
}).observe(l_log);

new ResizeObserver(([e]) => {
  cur_w.value = Math.ceil(e.contentRect.width + 10);
  if (cur_w.value * 1 !== document.body.clientWidth - 27) cw_auto.checked = false;
  localStorage.setItem('defCW', cur_w.value);
}).observe(diag_current);

// ===== 設定パネル表示切替 =====
stg.addEventListener('change', () => {
  const show = stg.checked;
  settingsPanel.classList.toggle('visible', show);
  v_border.style.opacity = show ? '1' : '';
  h_border.style.opacity = show ? '1' : '';
  document.querySelector('.icons').style.opacity = show ? '1' : '';
  localStorage.setItem('defStg', show ? '1' : '');
});

// ===== マイク =====
mic.addEventListener('change', () => {
  const micLabel = document.querySelector('label[for="mic"]');
  if (mic.checked) {
    // ユーザー操作の直接ハンドラ内で audioCtx.resume() → srStart()
    retryCount = 0;
    srStart(0);
    micLabel.textContent = 'mic';
  } else {
    srStop();
    micLabel.textContent = 'mic_off';
  }
});

// ===== 別窓 =====
oin.addEventListener('change', () => {
  const winName = 'recognition';
  const opt = `resizable=yes,scrollbars=yes,status=no,screenY=${win_y.value},screenX=${win_x.value},innerWidth=${win_w.value},innerHeight=${win_h.value}`;
  if (oin.checked) {
    if (mic.checked) mic.click();
    const w = window.open(window.location, winName, opt);
    w.addEventListener('load', () => w.addEventListener('unload', () => { oin.checked = false; }));
  } else {
    window.open('', winName, opt).close();
  }
});

// ===== ログ配置切替 =====
r_align.addEventListener('change', () => {
  const bw = v_border.clientWidth;
  if (r_align.checked) {
    const xpos = content.clientWidth - bw - log_w.value * 1;
    content.style.gridTemplateColumns = `1fr ${bw}px ${xpos}px`;
    while (l_log.lastChild) r_log.prepend(l_log.lastChild);
  } else {
    content.style.gridTemplateColumns = `${log_w.value}px ${bw}px 1fr`;
    while (r_log.lastChild) l_log.prepend(r_log.lastChild);
  }
  localStorage.setItem('defRAlign', r_align.checked ? '1' : '');
});

// ===== 最新幅 auto =====
cw_auto.addEventListener('change', () => {
  diag_current.style.width = cw_auto.checked ? 'auto' : `${diag_current.clientWidth + 7}px`;
});

// ===== ドラッグ仕切り移動 =====
let isDraggingV = false;
let isDraggingH = false;

v_border.addEventListener('mousedown', () => { isDraggingV = true; });
h_border.addEventListener('mousedown', () => { isDraggingH = true; });

content.addEventListener('mousemove', (e) => {
  if (isDraggingV) {
    const bw = v_border.clientWidth;
    content.style.gridTemplateColumns = r_align.checked
      ? `1fr ${bw}px ${content.clientWidth - bw - e.clientX}px`
      : `${e.clientX}px ${bw}px 1fr`;
    e.preventDefault();
  } else if (isDraggingH) {
    const bh = h_border.clientHeight;
    content.style.gridTemplateRows = `1fr ${bh}px ${content.clientHeight - bh - e.clientY}px`;
    e.preventDefault();
  }
});

content.addEventListener('mouseup', () => {
  isDraggingV = isDraggingH = false;
  localStorage.setItem('defLW', log_w.value);
  localStorage.setItem('defLH', log_h.value);
  localStorage.setItem('defCW', cur_w.value);
  localStorage.setItem('defCwAuto', cw_auto.checked ? '1' : '');
});

// ===== 位置取得 =====
$('getSizePos').onclick = () => {
  win_x.value = window.screenX;
  win_y.value = window.screenY;
  win_w.value = Math.round(window.innerWidth  * (window.innerWidth  / document.body.clientWidth));
  win_h.value = Math.round(window.innerHeight * (window.innerHeight / document.body.clientHeight));
};

// ===== Save =====
$('stgSave').onclick = () => {
  const pickrMap = {
    defBgc1: stgBgc1, defBgc2: stgBgc2, defBgc3: stgBgc3,
    defFc1: stgFc1, defFc2: stgFc2, defFc2g: stgFc2g, defFc2b: stgFc2b, defFc2bg: stgFc2bg,
    defFc3: stgFc3, defFc4: stgFc4, defFc4g: stgFc4g, defFc4b: stgFc4b, defFc4bg: stgFc4bg,
  };
  for (const [k, p] of Object.entries(pickrMap)) localStorage.setItem(k, hex(p));

  localStorage.setItem('defFs1',   stgFs1.value);
  localStorage.setItem('defFs2',   stgFs2.value);
  localStorage.setItem('defFs2b',  stgFs2b.value);
  localStorage.setItem('defFs2g',  stgFs2g.checked  ? '1' : '');
  localStorage.setItem('defFs2bg', stgFs2bg.checked ? '1' : '');
  localStorage.setItem('defFs3',   stgFs3.value);
  localStorage.setItem('defFs4',   stgFs4.value);
  localStorage.setItem('defFs4b',  stgFs4b.value);
  localStorage.setItem('defFs4g',  stgFs4g.checked  ? '1' : '');
  localStorage.setItem('defFs4bg', stgFs4bg.checked ? '1' : '');
  localStorage.setItem('defFont',  stgFont.value);
  localStorage.setItem('defMicOn', stgMicOn.checked ? '1' : '');
  localStorage.setItem('defX', win_x.value);
  localStorage.setItem('defY', win_y.value);
  localStorage.setItem('defW', win_w.value);
  localStorage.setItem('defH', win_h.value);
  localStorage.setItem('defLW', log_w.value);
  localStorage.setItem('defLH', log_h.value);
  localStorage.setItem('defCW', cur_w.value);
  localStorage.setItem('defCwAuto', cw_auto.checked ? '1' : '');
  localStorage.setItem('defRAlign', r_align.checked ? '1' : '');

  showStatus('saved.');
};

// ===== Clear =====
$('stgClear').onclick = () => {
  localStorage.clear();
  showStatus('cleared.');
};

function showStatus(msg) {
  statusMsg.textContent = msg;
  statusMsg.classList.add('visible');
  setTimeout(() => statusMsg.classList.remove('visible'), 1200);
}

// ===== localStorage を try-catch で保護（Edge のトラッキング防止対策） =====
const LS = {
  get(key, fallback = null) {
    try { return localStorage.getItem(key) ?? fallback; }
    catch (_) { return fallback; }
  },
  set(key, val) {
    try { localStorage.setItem(key, val); } catch (_) {}
  },
  clear() {
    try { localStorage.clear(); } catch (_) {}
  }
};

// ===== 設定復元 =====
(function restoreSettings() {
  document.body.style.backgroundColor = LS.get('defBgc1', '#DBDAFF');

  stgFs1.value  = LS.get('defFs1',  stgFs1.value);
  stgFs2.value  = LS.get('defFs2',  stgFs2.value);
  stgFs2b.value = LS.get('defFs2b', stgFs2b.value);
  stgFs3.value  = LS.get('defFs3',  stgFs3.value);
  stgFs4.value  = LS.get('defFs4',  stgFs4.value);
  stgFs4b.value = LS.get('defFs4b', stgFs4b.value);

  stgFs2g.checked  = !!LS.get('defFs2g');
  stgFs2bg.checked = !!LS.get('defFs2bg');
  stgFs4g.checked  = !!LS.get('defFs4g');
  stgFs4bg.checked = !!LS.get('defFs4bg');

  stgMicOn.checked = !!LS.get('defMicOn');
  if (stgMicOn.checked) mic.click();

  if (LS.get('defStg')) stg.click();

  win_x.value = LS.get('defX', win_x.value);
  win_y.value = LS.get('defY', win_y.value);
  win_w.value = LS.get('defW', win_w.value);
  win_h.value = LS.get('defH', win_h.value);

  const defLH = LS.get('defLH');
  if (defLH) {
    const bh = h_border.clientHeight;
    content.style.gridTemplateRows = `1fr ${bh}px ${content.clientHeight - bh - defLH * 1}px`;
  }

  r_align.checked = !!LS.get('defRAlign');
  const defLW = LS.get('defLW');
  if (defLW) {
    const bw = v_border.clientWidth;
    content.style.gridTemplateColumns = r_align.checked
      ? `1fr ${bw}px ${content.clientWidth - bw - defLW * 1}px`
      : `${defLW}px ${bw}px 1fr`;
  }

  const defCW     = LS.get('defCW');
  const defCwAuto = LS.get('defCwAuto');
  cw_auto.checked = defCwAuto
    ? true
    : (document.body.clientWidth - 27) === (defCW * 1);
  if (!cw_auto.checked && defCW) {
    diag_current.style.width = `${defCW * 1 + 7}px`;
  }
})();
