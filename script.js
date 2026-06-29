document.addEventListener("DOMContentLoaded", function () {
  const cake = document.querySelector(".cake");
  const candleCountDisplay = document.getElementById("candleCount");
  let candles = [];
  let audioContext;
  let analyser;
  let microphone;
  let audio = new Audio('hbd.mp3');
  let confettiInterval = null;
  let celebrationTriggered = false;

  // ── Candle layout: "24" shape in the middle + simple row candles ──────────
  // The cake is 250px wide, 200px tall. Candle top anchor = top of icing (~2px).
  // Positions are {left, top} relative to cake div.

  function getCandlePositions() {
    const positions = [];

    // ── Simple background candles (row along the back of cake) ───────────────
    const simpleRow = [
      { left: 18, top: -18 },
      { left: 34, top: -22 },
      { left: 50, top: -24 },
      { left: 195, top: -24 },
      { left: 211, top: -22 },
      { left: 227, top: -18 },
    ];
    simpleRow.forEach(p => positions.push({ ...p, type: 'simple' }));

    // ── "2" shape — left side ────────────────────────────────────────────────
    //  Top bar of 2
    const two = [
      { left: 68,  top: -55 },
      { left: 78,  top: -60 },
      { left: 88,  top: -63 },
      { left: 98,  top: -64 },
      { left: 108, top: -63 },
      // top-right curve
      { left: 116, top: -58 },
      { left: 121, top: -50 },
      // diagonal down-left
      { left: 115, top: -42 },
      { left: 107, top: -35 },
      { left: 98,  top: -28 },
      { left: 89,  top: -22 },
      { left: 80,  top: -16 },
      // bottom bar of 2
      { left: 88,  top: -10 },
      { left: 98,  top: -8  },
      { left: 108, top: -8  },
      { left: 118, top: -8  },
      { left: 128, top: -8  },
    ];
    two.forEach(p => positions.push({ ...p, type: 'numeral' }));

    // ── "4" shape — right side ───────────────────────────────────────────────
    const four = [
      // left vertical of 4
      { left: 148, top: -62 },
      { left: 148, top: -50 },
      { left: 148, top: -38 },
      { left: 148, top: -26 },
      // horizontal bar of 4
      { left: 157, top: -26 },
      { left: 166, top: -26 },
      { left: 175, top: -26 },
      { left: 184, top: -26 },
      // right vertical of 4
      { left: 175, top: -62 },
      { left: 175, top: -50 },
      { left: 175, top: -38 },
      { left: 175, top: -14 },
    ];
    four.forEach(p => positions.push({ ...p, type: 'numeral' }));

    return positions;
  }

  function createCandle(pos) {
    const candle = document.createElement("div");
    candle.className = pos.type === 'numeral' ? "candle candle-numeral" : "candle candle-simple";
    candle.style.left = pos.left + "px";
    candle.style.top = pos.top + "px";

    const flame = document.createElement("div");
    flame.className = "flame";
    candle.appendChild(flame);

    cake.appendChild(candle);
    candles.push(candle);
  }

  function initCandles() {
    // Remove existing candles
    candles.forEach(c => c.remove());
    candles = [];

    const positions = getCandlePositions();
    positions.forEach(pos => createCandle(pos));
    updateCandleCount();
  }

  function updateCandleCount() {
    const activeCandles = candles.filter(c => !c.classList.contains("out")).length;
    candleCountDisplay.textContent = activeCandles;
  }

  function isBlowing() {
    if (!analyser) return false;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
    return (sum / bufferLength) > 50;
  }

  function blowOutCandles() {
    if (candles.length === 0) return;
    if (!candles.some(c => !c.classList.contains("out"))) return;

    if (isBlowing()) {
      let blownOut = 0;
      candles.forEach(candle => {
        if (!candle.classList.contains("out") && Math.random() > 0.4) {
          candle.classList.add("out");
          blownOut++;
        }
      });
      if (blownOut > 0) updateCandleCount();
    }

    if (!celebrationTriggered && candles.every(c => c.classList.contains("out"))) {
      celebrationTriggered = true;
      setTimeout(() => {
        showBirthdayMessage();
        triggerConfetti();
        confettiInterval = setInterval(() => {
          confetti({ particleCount: 150, spread: 90, origin: { y: 0 } });
        }, 1000);
        releaseBalloons();
        document.getElementById("relightBtn").style.display = "block";
      }, 300);
      try { audio.play(); } catch(e) {}
    }
  }

  function showBirthdayMessage() {
    const msg = document.getElementById("birthdayMessage");
    msg.style.display = "flex";
    setTimeout(() => msg.classList.add("visible"), 50);
  }

  function hideBirthdayMessage() {
    const msg = document.getElementById("birthdayMessage");
    msg.classList.remove("visible");
    setTimeout(() => msg.style.display = "none", 500);
  }

  // Close message on click
  document.getElementById("birthdayMessage").addEventListener("click", hideBirthdayMessage);

  // Relight function (global so button can call it)
  window.relightCandles = function () {
    // Stop endless confetti
    if (confettiInterval) { clearInterval(confettiInterval); confettiInterval = null; }
    celebrationTriggered = false;
    hideBirthdayMessage();
    document.getElementById("relightBtn").style.display = "none";
    initCandles();
  };

  // Init candles on load
  initCandles();

  // Microphone
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 256;
        setInterval(blowOutCandles, 200);
      })
      .catch(err => console.log("Mic error: " + err));
  }
});

function triggerConfetti() {
  confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
}

function releaseBalloons() {
  const colors = ['#2bcfde', '#dd2547', '#ffc2d1', '#ffe5ec', '#fb6f92', '#ffd700'];
  for (let i = 0; i < 30; i++) {
    const balloon = document.createElement('div');
    balloon.className = 'balloon';
    balloon.style.left = Math.random() * 100 + 'vw';
    balloon.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    balloon.style.animationDuration = (Math.random() * 2 + 4) + 's';
    balloon.style.animationDelay = Math.random() * 2 + 's';
    document.body.appendChild(balloon);
    setTimeout(() => balloon.remove(), 8000);
  }
}
