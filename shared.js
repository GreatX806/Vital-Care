/* shared.js — runs on every page */

// ── LOADER ──
window.addEventListener('load', () => {
  setTimeout(() => {
    const l = document.getElementById('loader');
    if (l) l.classList.add('gone');
    // kick counters
    animateCounters();
    // kick hero text
    document.querySelectorAll('.hero-in').forEach(el => el.classList.add('show'));
  }, 1500);
});

// ── NAV SCROLL ──
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ── HAMBURGER ──
const ham = document.querySelector('.ham');
const navLinks = document.querySelector('.nav-links');
ham?.addEventListener('click', () => {
  ham.classList.toggle('open');
  navLinks.classList.toggle('open');
});
// close on link click
navLinks?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  ham?.classList.remove('open');
  navLinks.classList.remove('open');
}));

// active nav link
(function setActive() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href')?.split('/').pop();
    if (href === page) a.classList.add('active');
  });
})();

// ── SCROLL REVEAL ──
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('up');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

function initReveal() {
  document.querySelectorAll('.reveal, .reveal-l').forEach(el => revealObserver.observe(el));
}
document.addEventListener('DOMContentLoaded', initReveal);

// ── COUNTER ANIMATION ──
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    let current = 0;
    const step = target / 60;
    const t = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current) + suffix;
      if (current >= target) clearInterval(t);
    }, 16);
  });
}

// ── TESTIMONIAL SLIDER ──
function initSlider() {
  const track = document.querySelector('.testi-track');
  const dots  = document.querySelectorAll('.testi-dot');
  if (!track) return;
  let idx = 0;
  const count = track.children.length;
  function go(n) {
    idx = (n + count) % count;
    track.style.transform = `translateX(-${idx * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }
  dots.forEach((d, i) => d.addEventListener('click', () => go(i)));
  document.querySelector('.testi-prev')?.addEventListener('click', () => go(idx - 1));
  document.querySelector('.testi-next')?.addEventListener('click', () => go(idx + 1));
  setInterval(() => go(idx + 1), 5500);
}
document.addEventListener('DOMContentLoaded', initSlider);

// ── HERO CANVAS (DNA particles) ──
function initCanvas(id) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const particles = Array.from({ length: 70 }, () => ({
    x: Math.random() * 1600, y: Math.random() * 900,
    r: Math.random() * 2 + .5,
    vx: (Math.random() - .5) * .5, vy: (Math.random() - .5) * .5,
    a: Math.random() * .5 + .2,
  }));

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    t += .012;

    // grid
    for (let x = 0; x < W; x += 55)
      for (let y = 0; y < H; y += 55) {
        ctx.beginPath(); ctx.arc(x, y, .8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,188,212,.07)'; ctx.fill();
      }

    // DNA helix
    const amp = 45, seg = 20;
    for (let x = 0; x < W + 50; x += 2) {
      const y1 = H * .32 + Math.sin(x * .013 + t) * amp;
      const y2 = H * .32 + Math.sin(x * .013 + t + Math.PI) * amp;
      ctx.beginPath(); ctx.arc(x, y1, 1.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,188,212,${.12 + Math.abs(Math.sin(x*.04)) * .15})`; ctx.fill();
      ctx.beginPath(); ctx.arc(x, y2, 1.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(77,208,225,${.09 + Math.abs(Math.cos(x*.04)) * .12})`; ctx.fill();
      if (x % seg === 0) {
        ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2);
        ctx.strokeStyle = 'rgba(0,188,212,.10)'; ctx.lineWidth = 1; ctx.stroke();
      }
    }

    // particles + connections
    particles.forEach(p => {
      p.x = (p.x + p.vx + W) % W;
      p.y = (p.y + p.vy + H) % H;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,188,212,${p.a})`; ctx.fill();
    });
    particles.forEach((a, i) => particles.slice(i + 1).forEach(b => {
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 110) {
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(0,188,212,${.1 * (1 - d / 110)})`; ctx.lineWidth = .8; ctx.stroke();
      }
    }));

    // glow orb
    const gx = W * .7 + Math.sin(t * .3) * 90;
    const gy = H * .4 + Math.cos(t * .2) * 60;
    const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, 300);
    g.addColorStop(0, 'rgba(0,188,212,.14)'); g.addColorStop(1, 'transparent');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    requestAnimationFrame(draw);
  }
  draw();
}
document.addEventListener('DOMContentLoaded', () => initCanvas('heroCanvas'));

// ── BOOKING FORM ──
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('bookingForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    this.style.display = 'none';
    document.querySelector('.form-success').style.display = 'block';
    setTimeout(() => {
      this.style.display = 'block';
      document.querySelector('.form-success').style.display = 'none';
      this.reset();
    }, 4500);
  });
});
