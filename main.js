// ─── LOADING ───
window.addEventListener('load', () => {
  setTimeout(() => {
    document.querySelector('.loading-overlay')?.classList.add('hidden');
    document.querySelector('.hero-content')?.classList.add('page-enter');
    animateCounters();
  }, 1600);
});

// ─── NAV SCROLL ───
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
  nav?.classList.toggle('scrolled', window.scrollY > 60);
});

// ─── SPA NAVIGATION ───
function showPage(id, clickedLink) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  const page = document.getElementById(id);
  if (page) { page.classList.add('active'); page.classList.add('page-enter'); setTimeout(() => page.classList.remove('page-enter'), 600); }
  if (clickedLink) clickedLink.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  // Close mobile nav
  document.querySelector('.nav-links')?.classList.remove('open');
  document.querySelector('.hamburger')?.classList.remove('open');
  // Trigger animations for the shown page
  setTimeout(triggerScrollAnimations, 100);
}

document.querySelectorAll('[data-page]').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    const pageId = el.dataset.page;
    const navLink = document.querySelector(`.nav-links a[data-page="${pageId}"]`);
    showPage(pageId, navLink || el);
  });
});

// ─── HAMBURGER ───
document.querySelector('.hamburger')?.addEventListener('click', function() {
  this.classList.toggle('open');
  document.querySelector('.nav-links')?.classList.toggle('open');
});

// ─── HERO CANVAS ANIMATION (Particles + Glow) ───
const canvas = document.getElementById('heroCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let W = canvas.width = canvas.offsetWidth;
  let H = canvas.height = canvas.offsetHeight;
  window.addEventListener('resize', () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; });

  // Particles
  const particles = Array.from({ length: 80 }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    r: Math.random() * 2 + 0.5,
    vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
    alpha: Math.random() * 0.5 + 0.2,
    color: Math.random() > 0.5 ? '#00BCD4' : '#4DD0E1'
  }));

  // DNA-like strands
  let time = 0;

  function drawDNA() {
    const spacing = 18;
    const amplitude = 40;
    const speed = 0.02;
    for (let x = 0; x < W + 100; x += 2) {
      const y1 = H * 0.3 + Math.sin((x * 0.015) + time) * amplitude;
      const y2 = H * 0.3 + Math.sin((x * 0.015) + time + Math.PI) * amplitude;
      // Strand 1
      ctx.beginPath();
      ctx.arc(x, y1, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,188,212,${0.15 + Math.abs(Math.sin(x * 0.05)) * 0.2})`;
      ctx.fill();
      // Strand 2
      ctx.beginPath();
      ctx.arc(x, y2, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(77,208,225,${0.1 + Math.abs(Math.cos(x * 0.05)) * 0.15})`;
      ctx.fill();
      // Rungs
      if (x % spacing === 0) {
        ctx.beginPath();
        ctx.moveTo(x, y1); ctx.lineTo(x, y2);
        ctx.strokeStyle = 'rgba(0,188,212,0.12)';
        ctx.lineWidth = 1; ctx.stroke();
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    time += 0.015;

    // Grid dots
    for (let x = 0; x < W; x += 50) {
      for (let y = 0; y < H; y += 50) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,188,212,0.08)';
        ctx.fill();
      }
    }

    drawDNA();

    // Particles
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color.replace(')', `,${p.alpha})`).replace('rgb', 'rgba');
      ctx.fill();
    });

    // Connect nearby particles
    particles.forEach((a, i) => {
      particles.slice(i + 1).forEach(b => {
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(0,188,212,${0.12 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.8; ctx.stroke();
        }
      });
    });

    // Glow orbs
    const gx = W * 0.7 + Math.sin(time * 0.3) * 80;
    const gy = H * 0.4 + Math.cos(time * 0.2) * 60;
    const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, 280);
    grad.addColorStop(0, 'rgba(0,188,212,0.12)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    requestAnimationFrame(animate);
  }
  animate();
}

// ─── ECG / HEARTBEAT SVG ───
function drawECG() {
  const svg = document.getElementById('ecgPath');
  if (!svg) return;
  const W = svg.parentElement.offsetWidth * 2;
  const H = 120;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const mid = H / 2;

  let d = `M 0 ${mid} `;
  const segW = 120;
  const segs = Math.ceil(W / segW) + 1;
  for (let i = 0; i < segs; i++) {
    const x = i * segW;
    d += `L ${x} ${mid} L ${x + 10} ${mid} L ${x + 18} ${mid - 5} L ${x + 24} ${mid + 30} L ${x + 30} ${mid - 60} L ${x + 36} ${mid + 15} L ${x + 42} ${mid} L ${x + segW} ${mid} `;
  }
  svg.querySelector('path')?.setAttribute('d', d);

  // Animate
  const path = svg.querySelector('path');
  if (path) {
    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
    path.style.animation = 'ecgAnim 3s linear infinite';
  }
}

// ─── COUNTER ANIMATION ───
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    let current = 0;
    const inc = target / 60;
    const timer = setInterval(() => {
      current = Math.min(current + inc, target);
      el.textContent = Math.floor(current) + suffix;
      if (current >= target) clearInterval(timer);
    }, 16);
  });
}

// ─── SCROLL ANIMATIONS ───
function triggerScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-up, .fade-left, .why-list li').forEach(el => {
    observer.observe(el);
  });
}

// ─── TESTIMONIALS SLIDER ───
let slideIndex = 0;
const slides = document.querySelectorAll('.testimonial-slide');
const dots = document.querySelectorAll('.dot');

function goToSlide(n) {
  slideIndex = (n + slides.length) % slides.length;
  document.querySelector('.testimonials-track').style.transform = `translateX(-${slideIndex * 100}%)`;
  dots.forEach((d, i) => d.classList.toggle('active', i === slideIndex));
}

document.querySelector('.prev-btn')?.addEventListener('click', () => goToSlide(slideIndex - 1));
document.querySelector('.next-btn')?.addEventListener('click', () => goToSlide(slideIndex + 1));
dots.forEach((d, i) => d.addEventListener('click', () => goToSlide(i)));

// Auto-slide
setInterval(() => goToSlide(slideIndex + 1), 5000);

// ─── FORM ───
document.querySelector('.booking-form form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target;
  form.style.display = 'none';
  document.querySelector('.form-success').style.display = 'block';
  setTimeout(() => {
    form.style.display = 'block';
    document.querySelector('.form-success').style.display = 'none';
    form.reset();
  }, 4000);
});

// ─── INIT ───
drawECG();
triggerScrollAnimations();

// Add ECG keyframe
const style = document.createElement('style');
style.textContent = `
@keyframes ecgAnim {
  0% { stroke-dashoffset: var(--len, 3000); }
  100% { stroke-dashoffset: calc(var(--len, 3000) * -1); }
}`;
document.head.appendChild(style);
