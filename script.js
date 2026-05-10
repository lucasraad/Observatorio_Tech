/* ── STARFIELD ── */
const canvas = document.getElementById('starfield');
const ctx    = canvas.getContext('2d');
let W, H, stars = [];

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

function createStars(n = 300) {
  stars = [];
  for (let i = 0; i < n; i++) {
    const r = Math.random();
    stars.push({
      x:     Math.random() * W,
      y:     Math.random() * H,
      radius: r < 0.6 ? 0.5 : r < 0.9 ? 0.9 : 1.5,
      alpha:  0.3 + Math.random() * 0.7,
      speed:  0.0003 + Math.random() * 0.001,
      phase:  Math.random() * Math.PI * 2,
      gold:   Math.random() < 0.08,
    });
  }
}

function drawStars(t) {
  ctx.clearRect(0, 0, W, H);
  for (const s of stars) {
    const a = s.alpha * (0.5 + 0.5 * Math.sin(t * s.speed * 800 + s.phase));
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.fillStyle = s.gold ? `rgba(201,168,76,${a})` : `rgba(220,232,245,${a})`;
    ctx.fill();
  }
}

function loop(t) {
  drawStars(t);
  requestAnimationFrame(loop);
}

window.addEventListener('resize', () => { resize(); createStars(); });
resize();
createStars();
requestAnimationFrame(loop);

/* subtle parallax */
document.getElementById('hero').addEventListener('mousemove', e => {
  const dx = (e.clientX / W - 0.5) * 0.3;
  const dy = (e.clientY / H - 0.5) * 0.3;
  for (const s of stars) {
    s.x += dx * s.radius * 0.25;
    s.y += dy * s.radius * 0.25;
  }
});

/* header scroll */
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
  header.style.background = window.scrollY > 40
    ? 'rgba(4,6,15,0.97)'
    : 'rgba(4,6,15,0.85)';
});
