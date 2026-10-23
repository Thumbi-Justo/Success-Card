// Caro's KCSE Success Card — small, dependency-free interactions
const openCardButton = document.querySelector("#openCard");
const messageSection = document.querySelector("#message");
const celebrateButton = document.querySelector("#celebrateButton");
const celebrationMessage = document.querySelector("#celebrationMessage");

openCardButton?.addEventListener("click", () => {
  messageSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  openCardButton.innerHTML = '<span>Your surprise is open</span><span class="button-icon" aria-hidden="true">✓</span>';
  openCardButton.setAttribute("aria-label", "Your surprise is open");
});

const encouragements = [
  "Breathe in confidence. Breathe out the pressure. ✨",
  "You are prepared to take this one question at a time. 💛",
  "Your effort matters, Caro. Keep going. ✦",
  "Calm mind. Brave heart. Do your best. ♡",
  "Whatever the paper looks like, pause, think, and begin. 🌟"
];

celebrateButton?.addEventListener("click", () => {
  const current = celebrationMessage?.textContent;
  let next = encouragements[Math.floor(Math.random() * encouragements.length)];
  if (encouragements.length > 1 && next === current) {
    next = encouragements[(encouragements.indexOf(next) + 1) % encouragements.length];
  }
  if (celebrationMessage) celebrationMessage.textContent = next;
  burstConfetti();
});

// Reveal sections as they enter the screen.
const revealSections = document.querySelectorAll(".message-section, .confidence-section, .finale");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealSections.forEach((section) => observer.observe(section));
} else {
  revealSections.forEach((section) => section.classList.add("in-view"));
}

// Lightweight gold sparkle canvas background.
const canvas = document.querySelector("#sparkles");
const ctx = canvas?.getContext("2d");
let particles = [];
let frameId;

function resizeCanvas() {
  if (!canvas || !ctx) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  const amount = Math.min(75, Math.floor(window.innerWidth / 16));
  particles = Array.from({ length: amount }, () => makeParticle(true));
}

function makeParticle(randomY = false) {
  return {
    x: Math.random() * window.innerWidth,
    y: randomY ? Math.random() * window.innerHeight : window.innerHeight + 8,
    radius: Math.random() * 1.4 + 0.35,
    speed: Math.random() * 0.28 + 0.08,
    drift: (Math.random() - 0.5) * 0.18,
    alpha: Math.random() * 0.55 + 0.12
  };
}

function drawSparkles() {
  if (!canvas || !ctx) return;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  particles.forEach((particle) => {
    particle.y -= particle.speed;
    particle.x += particle.drift;
    if (particle.y < -8) Object.assign(particle, makeParticle(false));
    if (particle.x < -8) particle.x = window.innerWidth + 8;
    if (particle.x > window.innerWidth + 8) particle.x = -8;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(239, 202, 123, ${particle.alpha})`;
    ctx.fill();
  });
  frameId = window.requestAnimationFrame(drawSparkles);
}

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (canvas && ctx && !reducedMotion) {
  resizeCanvas();
  drawSparkles();
  window.addEventListener("resize", resizeCanvas, { passive: true });
} else if (canvas) {
  canvas.style.display = "none";
}

// A short confetti burst when Caro taps the courage button.
function burstConfetti() {
  if (reducedMotion) return;
  const colors = ["#e4bd69", "#ffe2a0", "#fff4d8", "#b68b43"];
  const count = 90;
  const pieces = [];
  for (let i = 0; i < count; i++) {
    pieces.push({
      x: window.innerWidth * (0.2 + Math.random() * 0.6),
      y: window.innerHeight * 0.65,
      vx: (Math.random() - 0.5) * 8,
      vy: -Math.random() * 8 - 2,
      size: Math.random() * 5 + 2,
      spin: Math.random() * 0.2,
      angle: Math.random() * Math.PI,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 70 + Math.random() * 30
    });
  }

  const overlay = document.createElement("canvas");
  overlay.className = "confetti-overlay";
  Object.assign(overlay.style, {
    position: "fixed", inset: "0", width: "100%", height: "100%",
    pointerEvents: "none", zIndex: "10"
  });
  document.body.appendChild(overlay);
  const overlayCtx = overlay.getContext("2d");
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  overlay.width = Math.floor(window.innerWidth * ratio);
  overlay.height = Math.floor(window.innerHeight * ratio);
  overlayCtx.scale(ratio, ratio);

  let step = 0;
  function animate() {
    overlayCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    pieces.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.13;
      p.angle += p.spin;
      p.life -= 1;
      overlayCtx.save();
      overlayCtx.translate(p.x, p.y);
      overlayCtx.rotate(p.angle);
      overlayCtx.fillStyle = p.color;
      overlayCtx.globalAlpha = Math.max(0, Math.min(1, p.life / 35));
      overlayCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.7);
      overlayCtx.restore();
    });
    step++;
    if (step < 100 && pieces.some((p) => p.life > 0)) {
      window.requestAnimationFrame(animate);
    } else {
      overlay.remove();
    }
  }
  window.requestAnimationFrame(animate);
}

window.addEventListener("beforeunload", () => {
  if (frameId) window.cancelAnimationFrame(frameId);
});
