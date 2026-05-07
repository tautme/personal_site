/* script.js — shared behavior.
   - Auto-loads photos/ as a gallery (1.jpg, 2.jpg, ...)
   - Auto-loads music/ as audio players (1.mp3, 2.mp3, ...)
   - On essay pages: progress bar + ambient FM-synth pad
*/

(function () {

  /* ---------- Auto-load photo gallery ---------- */
  const gallery = document.getElementById('photos');
  if (gallery) loadPhotos(gallery);

  function loadPhotos(container) {
    const exts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    let n = 1;
    let loaded = 0;
    const max = 500;

    function tryNext() {
      if (n > max) return finish();
      tryExtensions(n, exts, 0);
    }

    function tryExtensions(num, list, i) {
      if (i >= list.length) {
        // Couldn't find this number with any extension. Stop the gallery.
        return finish();
      }
      const url = `photos/${num}.${list[i]}`;
      const img = new Image();
      img.loading = 'lazy';
      img.onload = () => {
        img.dataset.full = url;
        img.addEventListener('click', () => openLightbox(url));
        container.appendChild(img);
        loaded++;
        n++;
        tryNext();
      };
      img.onerror = () => tryExtensions(num, list, i + 1);
      img.src = url;
    }

    function finish() {
      if (loaded === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty';
        empty.textContent = 'Drop photos named 1.jpg, 2.jpg, … into the photos/ folder.';
        container.appendChild(empty);
      }
    }

    tryNext();
  }

  /* ---------- Lightbox ---------- */
  let lightbox;
  function openLightbox(src) {
    if (!lightbox) {
      lightbox = document.createElement('div');
      lightbox.className = 'lightbox';
      lightbox.addEventListener('click', () => lightbox.classList.remove('open'));
      document.body.appendChild(lightbox);
    }
    lightbox.innerHTML = '';
    const img = document.createElement('img');
    img.src = src;
    lightbox.appendChild(img);
    lightbox.classList.add('open');
  }

  /* ---------- Auto-load music players ---------- */
  const musicList = document.getElementById('music');
  if (musicList) loadMusic(musicList);

  function loadMusic(container) {
    const exts = ['mp3', 'm4a', 'ogg', 'wav'];
    let n = 1;
    let loaded = 0;
    const max = 100;

    function tryNext() {
      if (n > max) return finish();
      tryExtensions(n, exts, 0);
    }

    function tryExtensions(num, list, i) {
      if (i >= list.length) return finish();
      const url = `music/${num}.${list[i]}`;
      // Use fetch with HEAD to avoid downloading; fall back to GET if HEAD fails.
      fetch(url, { method: 'HEAD' })
        .then(r => r.ok ? add(url) : tryExtensions(num, list, i + 1))
        .catch(() => tryExtensions(num, list, i + 1));
    }

    function add(url) {
      const audio = document.createElement('audio');
      audio.src = url;
      audio.controls = true;
      audio.preload = 'none';
      container.appendChild(audio);
      loaded++;
      n++;
      tryNext();
    }

    function finish() {
      if (loaded === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty';
        empty.textContent = 'Drop audio files named 1.mp3, 2.mp3, … into the music/ folder.';
        container.appendChild(empty);
      }
    }

    tryNext();
  }

  /* ---------- Essay-page extras ---------- */

  // Reading progress bar
  const progress = document.querySelector('.progress');
  if (progress) {
    window.addEventListener('scroll', () => {
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      progress.style.width = pct + '%';
    }, { passive: true });
  }

  // Ambient FM-synth pad (after Chowning, 1973). Opt in by including
  // a <button class="music-toggle" id="music-toggle"> element.
  const musicBtn = document.getElementById('music-toggle');
  if (musicBtn) initAmbient(musicBtn);

  function initAmbient(btn) {
    const label = btn.querySelector('.label');
    let ctx = null, master = null, voices = [], playing = false;
    const chord = [130.81, 196.00, 246.94, 329.63, 493.88]; // C3 G3 B3 E4 B4

    function makeVoice(c, freq, ratio, idx, lfoRate, pan) {
      const carrier = c.createOscillator(); carrier.type = 'sine'; carrier.frequency.value = freq;
      const mod = c.createOscillator(); mod.type = 'sine'; mod.frequency.value = freq * ratio;
      const modGain = c.createGain(); modGain.gain.value = freq * idx;
      const lfo = c.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = lfoRate;
      const lfoGain = c.createGain(); lfoGain.gain.value = freq * idx * 0.55;
      lfo.connect(lfoGain); lfoGain.connect(modGain.gain);
      mod.connect(modGain); modGain.connect(carrier.frequency);
      const env = c.createGain(); env.gain.value = 0;
      const p = c.createStereoPanner ? c.createStereoPanner() : null;
      carrier.connect(env);
      if (p) { p.pan.value = pan; env.connect(p); p.connect(master); }
      else { env.connect(master); }
      return { carrier, mod, lfo, env };
    }

    function start() {
      if (ctx) return Promise.resolve();
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
      const t0 = ctx.currentTime;
      master.gain.linearRampToValueAtTime(0.085, t0 + 6);
      const ratios = [1.0, 1.001, 2.0, 1.499, 3.0];
      const lfos = [0.06, 0.08, 0.05, 0.07, 0.04];
      const pans = [-0.6, -0.2, 0.0, 0.25, 0.55];
      const idxs = [0.6, 0.5, 0.35, 0.4, 0.25];
      chord.forEach((f, i) => {
        const v = makeVoice(ctx, f, ratios[i], idxs[i], lfos[i], pans[i]);
        v.carrier.start(); v.mod.start(); v.lfo.start();
        const s = t0 + i * 1.7;
        v.env.gain.setValueAtTime(0, s);
        v.env.gain.linearRampToValueAtTime(0.22, s + 7 + i);
        voices.push(v);
      });
      (function drift() {
        if (!playing || !ctx) return;
        const now = ctx.currentTime;
        voices.forEach(v => {
          const tgt = 0.14 + Math.random() * 0.16;
          v.env.gain.cancelScheduledValues(now);
          v.env.gain.setValueAtTime(v.env.gain.value, now);
          v.env.gain.linearRampToValueAtTime(tgt, now + 6 + Math.random() * 6);
        });
        setTimeout(drift, 5500);
      })();
      playing = true;
      btn.classList.add('on');
      if (label) label.textContent = 'pause';
      return ctx.resume().catch(() => {});
    }

    function stop() {
      if (!ctx) return;
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(master.gain.value, t);
      master.gain.linearRampToValueAtTime(0, t + 2.5);
      const _ctx = ctx, _voices = voices;
      setTimeout(() => {
        _voices.forEach(v => { try { v.carrier.stop(); v.mod.stop(); v.lfo.stop(); } catch(e){} });
        try { _ctx.close(); } catch(e){}
      }, 2700);
      ctx = null; voices = []; playing = false;
      btn.classList.remove('on');
      if (label) label.textContent = 'ambient';
    }

    btn.addEventListener('click', () => playing ? stop() : start());

    // Try autoplay; if blocked, start on first user interaction.
    window.addEventListener('load', () => {
      setTimeout(() => {
        start();
        setTimeout(() => {
          if (!ctx || ctx.state !== 'running') {
            if (ctx) { try { ctx.close(); } catch(e){} ctx = null; voices = []; playing = false; btn.classList.remove('on'); if (label) label.textContent = 'ambient'; }
            const evs = ['pointerdown', 'keydown', 'scroll', 'touchstart'];
            const fn = () => { if (!playing) start(); evs.forEach(e => window.removeEventListener(e, fn)); };
            evs.forEach(e => window.addEventListener(e, fn, { passive: true }));
          }
        }, 400);
      }, 600);
    });
  }
})();
