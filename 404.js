/* Starfield + subtle parallax for 404 page */
const canvas = document.getElementById('errorStarfield');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let W, H, stars = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createStars(n = 180) {
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.4 + 0.3,
      a: Math.random(),
      gold: Math.random() < 0.12,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    for (const s of stars) {
      const alpha = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(t * 0.002 + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.gold
        ? `rgba(201,168,76,${alpha})`
        : `rgba(220,232,245,${alpha})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); createStars(); });
  resize();
  createStars();
  requestAnimationFrame(draw);
}
