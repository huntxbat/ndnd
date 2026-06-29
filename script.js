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

  function updateCandleCount() {
    const activeCandles = candles.filter(c => !c.classList.contains("out")).length;
    candleCountDisplay.textContent = activeCandles;
  }

  function addCandle(left, top) {
    const candle = document.createElement("div");
    candle.className = "candle";
    candle.style.left = left + "px";
    candle.style.top = top + "px";
    const flame = document.createElement("div");
    flame.className = "flame";
    candle.appendChild(flame);
    cake.appendChild(candle);
    candles.push(candle);
    updateCandleCount();
  }

  // Click on cake to add candles
  cake.addEventListener("click", function (event) {
    if (celebrationTriggered) return;
    const rect = cake.getBoundingClientRect();
    const left = event.clientX - rect.left;
    const top = event.clientY - rect.top;
    addCandle(left, top);
  });

  function initCandles() {
    candles.forEach(c => c.remove());
    candles = [];
    updateCandleCount();
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

    if (!celebrationTriggered && candles.length > 0 && candles.every(c => c.classList.contains("out"))) {
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

  document.getElementById("birthdayMessage").addEventListener("click", hideBirthdayMessage);

  window.relightCandles = function () {
    if (confettiInterval) { clearInterval(confettiInterval); confettiInterval = null; }
    celebrationTriggered = false;
    hideBirthdayMessage();
    document.getElementById("relightBtn").style.display = "none";
    initCandles();
  };

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
