// ============================================================
//  FOURTH & FOREVER — sounds.js
//  Web Audio API sound engine. No files needed — all generated.
//  Call: FFF.sound.play('click') etc.
// ============================================================
(function(){
  let ctx = null;
  let muted = false;

  function getCtx(){
    if(!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if(ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, type, duration, volume, attack, decay){
    try {
      const c = getCtx();
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, c.currentTime);
      gain.gain.setValueAtTime(0, c.currentTime);
      gain.gain.linearRampToValueAtTime(volume || 0.3, c.currentTime + (attack || 0.01));
      gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + (duration || 0.3));
      osc.start(c.currentTime);
      osc.stop(c.currentTime + (duration || 0.3) + 0.05);
    } catch(e) {}
  }

  function noise(duration, volume, filterFreq){
    try {
      const c = getCtx();
      const bufSize = c.sampleRate * duration;
      const buf = c.createBuffer(1, bufSize, c.sampleRate);
      const data = buf.getChannelData(0);
      for(let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
      const src = c.createBufferSource();
      src.buffer = buf;
      const filter = c.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = filterFreq || 1000;
      filter.Q.value = 0.5;
      const gain = c.createGain();
      gain.gain.setValueAtTime(volume || 0.15, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
      src.connect(filter);
      filter.connect(gain);
      gain.connect(c.destination);
      src.start();
      src.stop(c.currentTime + duration + 0.05);
    } catch(e) {}
  }

  function chord(freqs, type, duration, volume){
    freqs.forEach((f, i) => {
      setTimeout(() => tone(f, type, duration, volume / freqs.length, 0.01, duration), i * 30);
    });
  }

  const SOUNDS = {
    // UI clicks
    click(){
      tone(800, 'sine', 0.06, 0.18, 0.005, 0.06);
    },
    clickSoft(){
      tone(600, 'sine', 0.05, 0.10, 0.005, 0.05);
    },
    hover(){
      tone(1200, 'sine', 0.04, 0.06, 0.002, 0.04);
    },
    tab(){
      tone(700, 'triangle', 0.08, 0.15, 0.005, 0.08);
      setTimeout(() => tone(900, 'triangle', 0.06, 0.10, 0.005, 0.06), 40);
    },

    // Casino / slot machine feels
    slotSpin(){
      // rapid ticking sound
      for(let i = 0; i < 8; i++){
        setTimeout(() => tone(400 + i * 80, 'square', 0.04, 0.08, 0.002, 0.04), i * 40);
      }
    },
    coin(){
      // bright coin ping
      tone(1200, 'triangle', 0.15, 0.3, 0.001, 0.15);
      setTimeout(() => tone(1600, 'triangle', 0.1, 0.2, 0.001, 0.12), 60);
      setTimeout(() => tone(2000, 'triangle', 0.07, 0.15, 0.001, 0.1), 110);
    },
    jackpot(){
      // ascending cascade — great play
      const notes = [523, 659, 784, 1047, 1319];
      notes.forEach((f, i) => {
        setTimeout(() => {
          tone(f, 'triangle', 0.25, 0.35, 0.005, 0.25);
          if(i === notes.length - 1){
            setTimeout(() => chord([1047, 1319, 1568], 'triangle', 0.4, 0.6), 100);
          }
        }, i * 80);
      });
    },
    bust(){
      // descending groan — wrong call
      tone(300, 'sawtooth', 0.08, 0.25, 0.01, 0.08);
      setTimeout(() => tone(220, 'sawtooth', 0.15, 0.3, 0.01, 0.15), 80);
      setTimeout(() => tone(150, 'sawtooth', 0.25, 0.35, 0.01, 0.25), 180);
      setTimeout(() => noise(0.3, 0.1, 200), 300);
    },
    goodPlay(){
      tone(660, 'triangle', 0.12, 0.25, 0.005, 0.12);
      setTimeout(() => tone(880, 'triangle', 0.12, 0.25, 0.005, 0.12), 80);
    },

    // Recruiting
    offer(){
      // triumphant two-note
      tone(523, 'triangle', 0.15, 0.3, 0.01, 0.15);
      setTimeout(() => tone(784, 'triangle', 0.2, 0.35, 0.01, 0.2), 100);
    },
    commit(){
      // full celebration
      const notes = [523, 659, 784, 880, 1047];
      notes.forEach((f, i) => {
        setTimeout(() => tone(f, 'triangle', 0.2, 0.4, 0.005, 0.2), i * 60);
      });
      setTimeout(() => chord([784, 988, 1175], 'triangle', 0.5, 0.7), 400);
      setTimeout(() => noise(0.2, 0.08, 2000), 400);
    },
    needleFound(){
      // mysterious reveal + excitement
      tone(220, 'sine', 0.3, 0.2, 0.1, 0.3);
      setTimeout(() => tone(440, 'triangle', 0.2, 0.3, 0.05, 0.2), 200);
      setTimeout(() => tone(880, 'triangle', 0.15, 0.4, 0.01, 0.15), 350);
      setTimeout(() => tone(1760, 'triangle', 0.1, 0.35, 0.01, 0.12), 450);
    },
    scoutDeploy(){
      tone(600, 'sine', 0.1, 0.2, 0.01, 0.1);
      setTimeout(() => tone(700, 'sine', 0.08, 0.15, 0.005, 0.08), 80);
    },
    visit(){
      tone(440, 'triangle', 0.12, 0.25, 0.01, 0.12);
      setTimeout(() => tone(550, 'triangle', 0.1, 0.2, 0.01, 0.1), 70);
    },
    decommit(){
      tone(400, 'sawtooth', 0.1, 0.2, 0.01, 0.1);
      setTimeout(() => tone(280, 'sawtooth', 0.15, 0.25, 0.01, 0.15), 90);
    },

    // NIL / boosters
    nilGain(){
      tone(880, 'sine', 0.1, 0.25, 0.005, 0.1);
      setTimeout(() => tone(1100, 'sine', 0.08, 0.2, 0.005, 0.08), 70);
      setTimeout(() => tone(1320, 'sine', 0.06, 0.15, 0.005, 0.06), 130);
    },
    nilLoss(){
      tone(350, 'triangle', 0.12, 0.2, 0.01, 0.12);
      setTimeout(() => tone(260, 'triangle', 0.15, 0.25, 0.01, 0.15), 100);
    },
    boosterHappy(){
      tone(660, 'sine', 0.08, 0.2, 0.005, 0.08);
      setTimeout(() => tone(880, 'sine', 0.08, 0.2, 0.005, 0.08), 60);
    },
    boosterAngry(){
      noise(0.15, 0.12, 300);
      setTimeout(() => tone(200, 'sawtooth', 0.15, 0.2, 0.01, 0.15), 100);
    },
    nilOverCap(){
      // alarm-like
      for(let i = 0; i < 3; i++){
        setTimeout(() => {
          tone(880, 'square', 0.08, 0.25, 0.002, 0.08);
          setTimeout(() => tone(660, 'square', 0.08, 0.2, 0.002, 0.08), 100);
        }, i * 220);
      }
    },

    // Game / week
    weekAdvance(){
      tone(440, 'sine', 0.08, 0.2, 0.005, 0.08);
      setTimeout(() => tone(550, 'sine', 0.08, 0.2, 0.005, 0.08), 60);
      setTimeout(() => tone(660, 'sine', 0.08, 0.2, 0.005, 0.08), 120);
    },
    win(){
      const notes = [523, 659, 784, 1047];
      notes.forEach((f, i) => setTimeout(() => tone(f, 'triangle', 0.3, 0.4, 0.005, 0.3), i * 100));
      setTimeout(() => chord([784, 988, 1175, 1568], 'triangle', 0.5, 0.8), 500);
    },
    loss(){
      tone(330, 'sawtooth', 0.15, 0.3, 0.01, 0.15);
      setTimeout(() => tone(247, 'sawtooth', 0.18, 0.35, 0.01, 0.18), 120);
      setTimeout(() => tone(185, 'sawtooth', 0.2, 0.4, 0.01, 0.2), 260);
    },
    alert(){
      tone(700, 'square', 0.08, 0.2, 0.002, 0.08);
      setTimeout(() => tone(700, 'square', 0.08, 0.2, 0.002, 0.08), 150);
    },
    save(){
      tone(600, 'triangle', 0.06, 0.15, 0.005, 0.06);
      setTimeout(() => tone(800, 'triangle', 0.06, 0.15, 0.005, 0.06), 50);
    },
    modal(){
      tone(500, 'sine', 0.08, 0.15, 0.005, 0.08);
    },
    dismiss(){
      tone(400, 'sine', 0.06, 0.12, 0.005, 0.06);
    },
    playCall(){
      // satisfying "click-lock" when picking a play
      tone(300, 'square', 0.04, 0.15, 0.002, 0.04);
      setTimeout(() => tone(500, 'square', 0.06, 0.2, 0.002, 0.06), 30);
      setTimeout(() => tone(700, 'sine', 0.08, 0.2, 0.005, 0.08), 60);
    },
  };

  window.FFF = window.FFF || {};
  window.FFF.sound = {
    play(name){
      if(muted) return;
      if(SOUNDS[name]) SOUNDS[name]();
    },
    mute(){ muted = true; },
    unmute(){ muted = false; },
    toggle(){ muted = !muted; return !muted; },
    isMuted(){ return muted; },
  };
})();
