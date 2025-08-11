/*! Baixa Pace® — Calculadora de Pace (widget)
 *  - Unidade km/mi, presets 5K/10K/21K/42K
 *  - Preencha 2 campos para calcular o 3º (Tempo, Distância, Pace)
 *  - Botões: Copiar, Compartilhar, WhatsApp, Instagram Web
 *  - Toast animado
 *  - Uso: window.BaixaPacePaceWidget.mount(el[, {unit:'km'|'mi', presetKm:Number}])
 */
(function () {
  const KM_PER_MI = 1.60934;

  function ensureBlinkerFont() {
    if (!document.querySelector('link[href*=\"fonts.googleapis.com'][href*=\"Blinker\"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Blinker:wght@400;600;700&display=swap';
      document.head.appendChild(link);
    }
  }

  function injectStyles(rootId) {
    const style = document.createElement('style');
    style.setAttribute('data-bpx', rootId);
    style.textContent = `
    .bp-pace { font-family: 'Blinker', system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial, sans-serif; color:#141414; }
    .bp-pace .bp-wrap{ --bp-red:#d42f2f; --bp-bg:#fff; --bp-text:#141414; --bp-muted:#777; --bp-border:#e7e7e7;
      max-width: 880px; margin: 0 auto; padding: 24px; background: var(--bp-bg); border:1px solid var(--bp-border); border-radius: 18px; box-shadow: 0 10px 30px rgba(0,0,0,.06);
    }
    .bp-pace .bp-title{ display:flex; align-items:center; gap:10px; margin-bottom: 18px; }
    .bp-pace .bp-title h2{ font-size: clamp(20px, 2.4vw, 28px); margin:0; font-weight: 700; letter-spacing:.2px; }
    .bp-pace .bp-badge{ font-size:12px; font-weight:700; color:#fff; background:var(--bp-red); padding:6px 10px; border-radius:999px; letter-spacing:.3px; text-transform:uppercase; }

    .bp-pace .bp-row{ display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; }
    .bp-pace .bp-seg{ display:flex; gap:8px; background:#fafafa; padding:6px; border:1px solid var(--bp-border); border-radius: 14px; width:max-content; }
    .bp-pace .bp-seg button{ appearance:none; border:0; padding:10px 14px; border-radius:10px; font-weight:600; cursor:pointer; background:transparent; color:var(--bp-text); transition: all .18s ease; }
    .bp-pace .bp-seg button[aria-pressed=\"true\"]{ background: var(--bp-red); color:#fff; box-shadow: 0 4px 12px rgba(212,47,47,.35); }
    .bp-pace .bp-seg small{ display:block; font-size:11px; opacity:.85; margin-top:2px }

    .bp-pace .bp-units{ display:flex; align-items:center; gap:10px; }
    .bp-pace .bp-chips{ display:flex; gap:8px; flex-wrap:wrap; }
    .bp-pace .bp-chip{ border:1px solid var(--bp-border); background:#fff; padding:8px 12px; border-radius:999px; font-weight:700; font-size:13px; cursor:pointer; }
    .bp-pace .bp-chip:hover{ border-color:var(--bp-red); }

    .bp-pace .bp-grid{ display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-top:16px; }
    @media (max-width: 720px){ .bp-pace .bp-grid{ grid-template-columns: 1fr; } }

    .bp-pace .bp-card{ border:1px solid var(--bp-border); border-radius:16px; padding:16px; background:#fff; }
    .bp-pace .bp-label{ font-size:12px; text-transform:uppercase; letter-spacing:.4px; color:var(--bp-muted); font-weight:700; display:block; margin-bottom:10px; }

    .bp-pace .bp-rows{ display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
    .bp-pace .bp-field{ position:relative; flex:1 1 130px; min-width:120px; }
    .bp-pace .bp-input{ width:100%; padding:14px 12px; border:1px solid var(--bp-border); border-radius:12px; font-size:16px; line-height:1; outline:none; transition:border-color .2s, box-shadow .2s; }
    .bp-pace .bp-input:focus{ border-color:var(--bp-red); box-shadow:0 0 0 4px rgba(212,47,47,.12); }
    .bp-pace .bp-addon{ position:absolute; right:10px; top:50%; transform:translateY(-50%); font-size:12px; color:var(--bp-muted); font-weight:700; background:#fff; padding:0 4px; }
    .bp-pace .bp-mini{ display:flex; gap:8px; }
    .bp-pace .bp-mini .bp-input{ text-align:center; padding:14px 10px; }
    .bp-pace .bp-mini .bp-field{ min-width:86px; }
    .bp-pace .bp-note{ font-size:12px; color:var(--bp-muted); margin-top:8px; }
    .bp-pace input[type=number]::-webkit-outer-spin-button, 
    .bp-pace input[type=number]::-webkit-inner-spin-button{ -webkit-appearance: none; margin: 0; }
    .bp-pace input[type=number]{ -moz-appearance:textfield; }

    .bp-pace .bp-actions{ display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px; margin-top:14px; }
    .bp-pace .bp-summary{ font-weight:600; font-size:15px; }
    .bp-pace .bp-buttons{ display:flex; gap:10px; }
    .bp-pace .bp-btn{ display:inline-flex; align-items:center; gap:8px; border:1px solid var(--bp-border); background:#fff; padding:10px 14px; border-radius:12px; font-weight:700; cursor:pointer; transition: transform .14s ease, box-shadow .14s ease, border-color .2s; user-select:none; }
    .bp-pace .bp-btn:hover{ transform: translateY(-1px); box-shadow:0 6px 18px rgba(0,0,0,.08); }
    .bp-pace .bp-btn:active{ transform: translateY(0); box-shadow:none; }
    .bp-pace .bp-btn.primary{ background:var(--bp-red); color:#fff; border-color:var(--bp-red); }
    .bp-pace .bp-btn .bp-ico{ width:18px; height:18px; display:inline-block; }

    .bp-pace .bp-toast{ position: fixed; left: 50%; top: 14px; transform: translate(-50%, -30px); opacity:0; z-index: 9999; background: #fff; border:1px solid var(--bp-border); border-left:4px solid var(--bp-red); border-radius: 12px; padding: 12px 14px; font-weight:700; box-shadow:0 10px 30px rgba(0,0,0,.12); transition: transform .25s ease, opacity .25s ease; }
    .bp-pace .bp-toast.show{ transform: translate(-50%, 0); opacity:1; }
    `;
    document.head.appendChild(style);
  }

  function buildMarkup(uid) {
    return `
    <div class="bp-wrap" role="region" aria-label="Calculadora de pace">
      <div class="bp-title bp-row">
        <div style="display:flex; align-items:center; gap:10px;">
          <span class="bp-badge">Baixa Pace®</span>
          <h2>Calculadora de Pace</h2>
        </div>
        <div class="bp-units" aria-label="Alternar unidade">
          <div class="bp-seg" role="tablist">
            <button class="bp-unit" role="tab" aria-pressed="true" data-unit="km">km</button>
            <button class="bp-unit" role="tab" aria-pressed="false" data-unit="mi">mi</button>
          </div>
        </div>
      </div>

      <div class="bp-row" style="margin-bottom:8px">
        <div class="bp-seg" role="tablist" aria-label="Escolha o que deseja calcular">
          <button class="bp-seg-btn" role="tab" aria-pressed="true" data-target="pace">Calcular Pace<small data-pacelabel>min/km</small></button>
          <button class="bp-seg-btn" role="tab" aria-pressed="false" data-target="tempo">Calcular Tempo<small>hh:mm:ss</small></button>
          <button class="bp-seg-btn" role="tab" aria-pressed="false" data-target="dist">Calcular Distância<small><span data-unitlabel>km</span></small></button>
        </div>
        <div class="bp-chips" aria-label="Presets de distância">
          <button class="bp-chip" data-preset="5">5K</button>
          <button class="bp-chip" data-preset="10">10K</button>
          <button class="bp-chip" data-preset="21.1">21K</button>
          <button class="bp-chip" data-preset="42.2">42K</button>
        </div>
      </div>

      <div class="bp-grid" id="${uid}-grid">
        <div class="bp-card">
          <label class="bp-label" for="${uid}-h">Tempo Total</label>
          <div class="bp-mini bp-rows" data-group="tempo">
            <div class="bp-field">
              <input id="${uid}-h" class="bp-input" type="number" inputmode="numeric" min="0" step="1" placeholder="0" aria-label="Horas">
              <span class="bp-addon">h</span>
            </div>
            <div class="bp-field">
              <input id="${uid}-m" class="bp-input" type="number" inputmode="numeric" min="0" step="1" placeholder="00" aria-label="Minutos">
              <span class="bp-addon">min</span>
            </div>
            <div class="bp-field">
              <input id="${uid}-s" class="bp-input" type="number" inputmode="numeric" min="0" step="1" placeholder="00" aria-label="Segundos">
              <span class="bp-addon">s</span>
            </div>
          </div>
          <div class="bp-note">Ex.: 0 h 45 min 0 s</div>
        </div>

        <div class="bp-card">
          <label class="bp-label" for="${uid}-dist">Distância</label>
          <div class="bp-rows" data-group="dist">
            <div class="bp-field">
              <input id="${uid}-dist" class="bp-input" type="number" inputmode="decimal" min="0" step="0.01" placeholder="10.00" aria-label="Distância">
              <span class="bp-addon" data-unitaddon>km</span>
            </div>
          </div>
          <div class="bp-note">Ex.: 5.00 • 10.00 • 21.10 • 42.20</div>
        </div>

        <div class="bp-card">
          <label class="bp-label" for="${uid}-pm">Pace</label>
          <div class="bp-mini bp-rows" data-group="pace">
            <div class="bp-field">
              <input id="${uid}-pm" class="bp-input" type="number" inputmode="numeric" min="0" step="1" placeholder="04" aria-label="Minutos por unidade">
              <span class="bp-addon" data-paceaddon>min/km</span>
            </div>
            <div class="bp-field">
              <input id="${uid}-ps" class="bp-input" type="number" inputmode="numeric" min="0" max="59" step="1" placeholder="30" aria-label="Segundos por unidade">
              <span class="bp-addon">s</span>
            </div>
          </div>
          <div class="bp-note">Ex.: 04:30 <span data-pacefoot>min/km</span></div>
        </div>

        <div class="bp-card">
          <label class="bp-label">Resultado</label>
          <div class="bp-actions">
            <div class="bp-summary" id="${uid}-summary">Preencha qualquer 2 campos para calcular o 3º.</div>
            <div class="bp-buttons">
              <button class="bp-btn" id="${uid}-copy" type="button" aria-live="polite">
                <svg class="bp-ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16 1H6a2 2 0 0 0-2 2v12h2V3h10V1zm3 4H10a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H10V7h9v14z"/></svg>
                <span>Copiar</span>
              </button>
              <button class="bp-btn" id="${uid}-share" type="button">
                <svg class="bp-ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18 8a3 3 0 1 0-2.83-4H12v2h3.17A3 3 0 0 0 18 8zM6 13a3 3 0 1 0 2.83 4H12v-2H8.83A3 3 0 0 0 6 13zm12 5a3 3 0 1 0-2.83-4H12v2h3.17A3 3 0 0 0 18 18z"/></svg>
                <span>Compartilhar</span>
              </button>
              <button class="bp-btn" id="${uid}-wa" type="button">
                <svg class="bp-ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.5 3.5A11.5 11.5 0 0 0 2.1 17.8L1 23l5.4-1.1A11.5 11.5 0 1 0 20.5 3.5ZM12 20.5c-1.8 0-3.6-.5-5.1-1.5l-.4-.3-3 .6.6-2.9-.3-.4A8.9 8.9 0 1 1 12 20.5Zm4.8-6.7c-.3-.1-1.8-.9-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-1 .9-.1 0-.3 0-.5-.1a7.2 7.2 0 0 1-2.1-1.3 8 8 0 0 1-1.5-1.8c-.2-.3 0-.4.1-.6l.3-.4.1-.2c.1-.2.1-.3 0-.5 0-.1-.7-1.7-.9-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1.1 2.8 1.2 3c.1.2 2.1 3.1 5 4.3.7.3 1.2.5 1.6.6.6.2 1.1.1 1.5.1.5-.1 1.8-.7 2-1.4.2-.7.2-1.2.1-1.4-.1-.1-.2-.1-.4-.2Z"/></svg>
                <span>WhatsApp</span>
              </button>
              <button class="bp-btn" id="${uid}-ig" type="button">
                <svg class="bp-ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5Zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5ZM18 6.2a1 1 0 1 1-1.1 1 1 1 0 0 1 1.1-1Z"/></svg>
                <span>Instagram Web</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="bp-toast" role="status" aria-live="polite"></div>
    `;
  }

  function mount(containerOrSelector, options) {
    ensureBlinkerFont();
    const el = typeof containerOrSelector === 'string' ? document.querySelector(containerOrSelector) : containerOrSelector;
    if (!el) { console.warn('[BaixaPacePaceWidget] container não encontrado'); return null; }
    const uid = 'bpw' + Math.random().toString(36).slice(2, 7);
    el.classList.add('bp-pace');
    injectStyles(uid);
    el.innerHTML = buildMarkup(uid);

    const root = el;
    const scope = root.querySelector('#' + uid + '-grid');
    const toastEl = root.querySelector('.bp-toast');
    const state = { unit: (options && options.unit) === 'mi' ? 'mi' : 'km' };

    const sel = (q) => root.querySelector(q);
    const selAll = (q) => Array.from(root.querySelectorAll(q));

    const els = {
      h: scope.querySelector('#' + uid + '-h'),
      m: scope.querySelector('#' + uid + '-m'),
      s: scope.querySelector('#' + uid + '-s'),
      dist: scope.querySelector('#' + uid + '-dist'),
      pm: scope.querySelector('#' + uid + '-pm'),
      ps: scope.querySelector('#' + uid + '-ps'),
      summary: scope.querySelector('#' + uid + '-summary'),
      unitAddon: scope.querySelector('[data-unitaddon]'),
      paceAddon: scope.querySelector('[data-paceaddon]'),
      paceFoot: scope.querySelector('[data-pacefoot]'),
      copy: scope.querySelector('#' + uid + '-copy'),
      share: scope.querySelector('#' + uid + '-share'),
      wa: scope.querySelector('#' + uid + '-wa'),
      ig: scope.querySelector('#' + uid + '-ig'),
      unitKmBtn: sel('.bp-unit[data-unit="km"]'),
      unitMiBtn: sel('.bp-unit[data-unit="mi"]'),
      unitLabel: sel('[data-unitlabel]'),
      paceLabel: sel('[data-pacelabel]'),
      segBtns: selAll('.bp-seg-btn'),
      chips: selAll('.bp-chip'),
    };

    let isUpdating = false;

    function hasVal(v) { return v !== '' && v != null; }
    function toInt(v) { const n = parseInt(v, 10); return Number.isFinite(n) ? n : 0; }

    function readTime() {
      const hh = hasVal(els.h.value) ? toInt(els.h.value) : 0;
      const mm = hasVal(els.m.value) ? toInt(els.m.value) : 0;
      const ss = hasVal(els.s.value) ? toInt(els.s.value) : 0;
      const provided = hasVal(els.h.value) || hasVal(els.m.value) || hasVal(els.s.value);
      const total = (hh * 3600) + (mm * 60) + ss;
      return { provided, total };
    }
    function writeTime(total) {
      const hh = Math.floor(total / 3600);
      const mm = Math.floor((total % 3600) / 60);
      const ss = Math.max(0, Math.round(total % 60));
      els.h.value = String(hh);
      els.m.value = String(mm).padStart(2, '0');
      els.s.value = String(ss).padStart(2, '0');
    }

    function readDist() {
      const provided = hasVal(els.dist.value);
      const dist = provided ? Math.max(0, parseFloat(String(els.dist.value).replace(',', '.'))) : 0;
      return { provided, dist };
    }
    function writeDist(v) {
      const r = Math.round(v * 100) / 100;
      els.dist.value = r.toFixed(2);
    }

    function readPace() {
      const minProvided = hasVal(els.pm.value);
      const secProvided = hasVal(els.ps.value);
      const provided = minProvided || secProvided;
      const pmin = minProvided ? toInt(els.pm.value) : 0;
      const psec = secProvided ? toInt(els.ps.value) : 0;
      const total = (pmin * 60) + psec; // s por unidade atual
      return { provided, total };
    }
    function writePace(total) {
      const t = Math.max(0, Math.round(total));
      const pm = Math.floor(t / 60);
      const ps = t % 60;
      els.pm.value = String(pm).padStart(2, '0');
      els.ps.value = String(ps).padStart(2, '0');
    }

    function fmtTime(total) {
      const hh = Math.floor(total / 3600);
      const mm = Math.floor((total % 3600) / 60);
      const ss = Math.max(0, Math.round(total % 60));
      return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
    }
    function fmtPace(total) {
      const t = Math.max(0, Math.round(total));
      const pm = Math.floor(t / 60); const ps = t % 60;
      return `${String(pm).padStart(2, '0')}:${String(ps).padStart(2, '0')} min/${state.unit}`;
    }

    function convertDist(value, from, to) {
      if (from === to) return value;
      return to === 'mi' ? (value / KM_PER_MI) : (value * KM_PER_MI);
    }
    function convertPace(spu, from, to) { // segundos por unidade
      if (from === to) return spu;
      return to === 'mi' ? (spu * KM_PER_MI) : (spu / KM_PER_MI);
    }

    function uiUpdateUnitLabels() {
      const u = state.unit;
      els.unitAddon.textContent = u;
      els.paceAddon.textContent = `min/${u}`;
      els.paceFoot.textContent = `min/${u}`;
      if (els.unitLabel) els.unitLabel.textContent = u;
      if (els.paceLabel) els.paceLabel.textContent = `min/${u}`;
      [els.unitKmBtn, els.unitMiBtn].forEach(b => b && b.setAttribute('aria-pressed', String(b.dataset.unit === u)));
    }

    function activeTarget() {
      const btn = els.segBtns.find(b => b.getAttribute('aria-pressed') === 'true');
      return btn ? btn.dataset.target : 'pace';
    }
    function setActiveTarget(target) {
      els.segBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.target === target)));
      compute();
    }
    els.segBtns.forEach(b => b.addEventListener('click', () => setActiveTarget(b.dataset.target)));

    function getProvidedState() {
      const T = readTime();
      const D = readDist();
      const P = readPace();
      const count = [T.provided, D.provided, P.provided].filter(Boolean).length;
      return { T, D, P, count };
    }

    function compute() {
      if (isUpdating) return; isUpdating = true;
      try {
        const { T, D, P, count } = getProvidedState();
        let target = activeTarget();

        if (count === 2) {
          if (!T.provided) target = 'tempo';
          else if (!D.provided) target = 'dist';
          else if (!P.provided) target = 'pace';
          els.segBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.target === target)));
        }

        if (target === 'pace' && T.provided && D.provided && D.dist > 0) {
          const pace = T.total / D.dist; // s por unidade atual
          writePace(pace);
        } else if (target === 'tempo' && P.provided && D.provided) {
          const total = Math.round(P.total * D.dist);
          writeTime(total);
        } else if (target === 'dist' && P.provided && T.provided && P.total > 0) {
          const dist = T.total / P.total;
          writeDist(dist);
        }

        updateSummary();
      } finally { isUpdating = false; }
    }

    function updateSummary() {
      const T = readTime();
      const D = readDist();
      const P = readPace();
      if ([T.provided, D.provided, P.provided].every(Boolean) && D.dist > 0) {
        els.summary.textContent = `Tempo: ${fmtTime(T.total)} • Distância: ${D.dist.toFixed(2)} ${state.unit} • Pace: ${fmtPace(P.total)}`;
      } else {
        els.summary.textContent = 'Preencha qualquer 2 campos para calcular o 3º.';
      }
    }

    ['input', 'change'].forEach(evt => {
      [els.h, els.m, els.s, els.dist, els.pm, els.ps].forEach(el => el.addEventListener(evt, compute));
    });
    [els.m, els.s, els.pm, els.ps].forEach(el => el.addEventListener('blur', () => {
      if (el.value !== '' && el.value != null) { el.value = String(parseInt(el.value || '0', 10)).padStart(2, '0'); }
    }));

    function setUnit(newU) {
      if (newU === state.unit) return;
      const prev = state.unit; state.unit = newU;
      const D = readDist(); if (D.provided) { writeDist(convertDist(D.dist, prev, newU)); }
      const P = readPace(); if (P.provided) { writePace(convertPace(P.total, prev, newU)); }
      uiUpdateUnitLabels();
      compute();
    }
    els.unitKmBtn && els.unitKmBtn.addEventListener('click', () => setUnit('km'));
    els.unitMiBtn && els.unitMiBtn.addEventListener('click', () => setUnit('mi'));

    function presetToUnit(kmVal) { return state.unit === 'km' ? kmVal : (kmVal / KM_PER_MI); }
    els.chips.forEach(chip => chip.addEventListener('click', () => {
      const kmVal = parseFloat(chip.dataset.preset);
      const v = presetToUnit(kmVal);
      writeDist(v);
      compute();
    }));

    let toastTimer;
    function showToast(msg) {
      clearTimeout(toastTimer);
      toastEl.textContent = msg;
      toastEl.classList.add('show');
      toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
    }

    function resultText() {
      const T = readTime();
      const D = readDist();
      const P = readPace();
      if (D.dist > 0) {
        return `Meu resultado — Tempo: ${fmtTime(T.total)} • Distância: ${D.dist.toFixed(2)} ${state.unit} • Pace: ${fmtPace(P.total)} — via Baixa Pace®`;
      }
      return 'Resultado da Calculadora de Pace — Baixa Pace®';
    }

    els.copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(resultText());
        const prev = els.copy.querySelector('span').textContent;
        els.copy.querySelector('span').textContent = 'Copiado!';
        showToast('Resultado copiado!');
        setTimeout(() => els.copy.querySelector('span').textContent = prev, 1500);
      } catch (err) { showToast('Não foi possível copiar.'); }
    });

    els.share.addEventListener('click', async () => {
      const text = resultText();
      if (navigator.share) {
        try { await navigator.share({ title: 'Meu pace', text }); showToast('Compartilhado!'); }
        catch (err) { showToast('Não foi possível compartilhar.'); }
      } else {
        try { await navigator.clipboard.writeText(text); showToast('Compartilhar indisponível. Resultado copiado!'); }
        catch (err) { showToast('Não foi possível compartilhar.'); }
      }
    });

    els.wa.addEventListener('click', () => {
      const url = 'https://wa.me/?text=' + encodeURIComponent(resultText());
      window.open(url, '_blank', 'noopener');
      showToast('Abrindo WhatsApp…');
    });

    els.ig.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(resultText()); } catch (e) {}
      window.open('https://www.instagram.com/', '_blank', 'noopener');
      showToast('Texto copiado! Abra uma DM no Instagram e cole.');
    });

    // Inicializa UI
    uiUpdateUnitLabels();
    if (options && typeof options.presetKm === 'number') {
      const v = state.unit === 'km' ? options.presetKm : (options.presetKm / KM_PER_MI);
      writeDist(v);
    }
    compute();

    return { setUnit, compute, get unit() { return state.unit; } };
  }

  window.BaixaPacePaceWidget = {
    mount,
    version: '1.2.0'
  };
})();