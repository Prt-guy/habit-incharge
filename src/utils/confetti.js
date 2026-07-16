import confetti from "canvas-confetti";

const COLORS = ["#2563eb", "#a3e635", "#111827", "#84cc16", "#1d4ed8"];

export function burstConfetti() {
  confetti({
    particleCount: 90,
    spread: 70,
    origin: { y: 0.7 },
    colors: COLORS,
    disableForReducedMotion: true,
  });
}

export function levelUpConfetti() {
  const end = Date.now() + 900;
  (function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 60,
      origin: { x: 0 },
      colors: COLORS,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 60,
      origin: { x: 1 },
      colors: COLORS,
      disableForReducedMotion: true,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
