/* ── STARFIELD (homepage only) ── */
const canvas = document.getElementById('starfield');
const heroEl = document.getElementById('hero');

if (canvas && heroEl) {
  const ctx = canvas.getContext('2d');
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

  heroEl.addEventListener('mousemove', e => {
    const dx = (e.clientX / W - 0.5) * 0.3;
    const dy = (e.clientY / H - 0.5) * 0.3;
    for (const s of stars) {
      s.x += dx * s.radius * 0.25;
      s.y += dy * s.radius * 0.25;
    }
  });
}

/* trend bars — animate on scroll into view */
const trendItems = document.querySelectorAll('.trend-item');
if (trendItems.length) {
  trendItems.forEach(item => {
    const bar = item.querySelector('.trend-bar');
    if (bar) bar.style.setProperty('--pct', bar.dataset.pct);
  });

  const trendObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        trendObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.35 });

  trendItems.forEach(item => trendObserver.observe(item));
}

/* sobre parallax background */
const sobreBg = document.querySelector('.sobre-parallax-bg');
const sobreSection = document.getElementById('sobre');

if (sobreBg && sobreSection) {
  const updateParallax = () => {
    const rect = sobreSection.getBoundingClientRect();
    const vh = window.innerHeight;
    if (rect.bottom < 0 || rect.top > vh) return;
    const progress = (vh - rect.top) / (vh + rect.height);
    const offset = (progress - 0.5) * 80;
    sobreBg.style.transform = `translate3d(0, ${offset}px, 0) scale(1.08)`;
  };

  window.addEventListener('scroll', updateParallax, { passive: true });
  window.addEventListener('resize', updateParallax);
  updateParallax();
}
