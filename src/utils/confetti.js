import confetti from "canvas-confetti";

const COLORS = ["#007FFF", "#FFFFFF", "#4FB2FF", "#7FA8D9", "#1A8CFF"];

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
