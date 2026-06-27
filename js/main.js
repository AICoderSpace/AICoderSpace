/* ── Lang toggle ── */
function setLang(lang) {
  document.body.classList.toggle('zh', lang === 'zh');
  document.getElementById('btn-en').classList.toggle('active', lang === 'en');
  document.getElementById('btn-zh').classList.toggle('active', lang === 'zh');
  localStorage.setItem('lang', lang);
}

/* ── Restore saved lang ── */
(function () {
  const saved = localStorage.getItem('lang');
  if (saved === 'zh') setLang('zh');
})();

/* ── Smooth nav scroll ── */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

/* ── Starfield ── */
(function () {
  const canvas = document.getElementById('star-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function init() {
    stars = Array.from({ length: 110 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.2,
      phase: Math.random() * Math.PI * 2,
      spd: Math.random() * 0.0012 + 0.0004,
    }));
  }

  function draw(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      const a = 0.08 + 0.38 * (0.5 + 0.5 * Math.sin(t * s.spd * 1000 + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180,210,255,${a})`;
      ctx.fill();
    });
  }

  function tick(t) {
    draw(t / 1000);
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', () => { resize(); init(); });
  resize();
  init();
  requestAnimationFrame(tick);
})();

/* ── Scroll-reveal ── */
(function () {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  const style = document.createElement('style');
  style.textContent = `
    [data-reveal] { opacity: 0; transform: translateY(24px); transition: opacity .6s ease, transform .6s ease; }
    [data-reveal].revealed { opacity: 1; transform: none; }
  `;
  document.head.appendChild(style);

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => io.observe(el));
})();
