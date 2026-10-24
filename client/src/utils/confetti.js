import confetti from 'canvas-confetti';

/**
 * Fires a high-tech cyberpunk celebration burst of particles.
 */
export function fireCyberpunkConfetti() {
  const count = 40;
  const defaults = {
    origin: { y: 0.7 },
    colors: ['#06b6d4', '#8b5cf6', '#10b981', '#ec4899', '#f59e0b']
  };

  confetti({
    ...defaults,
    particleCount: count,
    spread: 60,
    startVelocity: 35
  });

  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 25,
      angle: 60,
      spread: 55,
      origin: { x: 0 }
    });
    confetti({
      ...defaults,
      particleCount: 25,
      angle: 120,
      spread: 55,
      origin: { x: 1 }
    });
  }, 150);
}
