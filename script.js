/* =========================================================
   RASWEB – Interactive JavaScript
   ========================================================= */

'use strict';

// ── UTILITIES ──────────────────────────────────────────────
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ── NAVBAR SCROLL SHADOW ────────────────────────────────────
(function initNavbar() {
  const navbar = qs('#navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
})();

// ── HAMBURGER MENU ──────────────────────────────────────────
(function initHamburger() {
  const btn   = qs('#hamburger');
  const links = qs('#navLinks');

  btn.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
    const spans = qsa('span', btn);
    if (open) {
      spans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  // close on link click
  qsa('a', links).forEach(a => a.addEventListener('click', () => {
    links.classList.remove('open');
    btn.setAttribute('aria-expanded', false);
    const spans = qsa('span', btn);
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }));
})();

// ── PARTICLE SYSTEM ─────────────────────────────────────────
(function initParticles() {
  const container = qs('#particles');
  const COUNT = 55;

  for (let i = 0; i < COUNT; i++) {
    const el = document.createElement('div');
    el.className = 'particle';
    const size  = Math.random() * 2.5 + 1;
    const left  = Math.random() * 100;
    const dur   = Math.random() * 18 + 12;   // 12–30s
    const delay = Math.random() * -30;
    const opacity = Math.random() * 0.5 + 0.15;
    Object.assign(el.style, {
      width:            `${size}px`,
      height:           `${size}px`,
      left:             `${left}%`,
      animationDuration: `${dur}s`,
      animationDelay:   `${delay}s`,
      opacity:          opacity,
    });
    container.appendChild(el);
  }
})();

// ── INTERSECTION OBSERVER – FEATURE CARDS ──────────────────
(function initFeatureCards() {
  const cards = qsa('.feature-card');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const card  = entry.target;
        const delay = parseInt(card.dataset.delay || '0', 10);
        setTimeout(() => card.classList.add('visible'), delay);
        observer.unobserve(card);
      }
    });
  }, { threshold: 0.15 });

  cards.forEach(c => observer.observe(c));
})();

// ── COUNTER ANIMATION ───────────────────────────────────────
(function initCounters() {
  const counters = qsa('.stat-number');

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start    = performance.now();

    function step(now) {
      const t       = Math.min((now - start) / duration, 1);
      const current = Math.round(easeOut(t) * target);
      el.textContent = current.toLocaleString();
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();

// ── ACTIVE NAV LINK HIGHLIGHTING ────────────────────────────
(function initActiveNav() {
  const sections = qsa('section[id]');
  const links    = qsa('.nav-links a');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = links.find(l => l.getAttribute('href') === `#${entry.target.id}`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => observer.observe(s));
})();

// ── PARALLAX BLOBS ──────────────────────────────────────────
(function initParallax() {
  const blobs = qsa('.blob');
  window.addEventListener('mousemove', e => {
    const cx = e.clientX / window.innerWidth  - 0.5;
    const cy = e.clientY / window.innerHeight - 0.5;
    blobs.forEach((blob, i) => {
      const factor = (i + 1) * 18;
      blob.style.transform = `translate(${cx * factor}px, ${cy * factor}px)`;
    });
  }, { passive: true });
})();

// ── FLOATING CARD TILT ──────────────────────────────────────
(function initCardTilt() {
  qsa('.floating-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(600px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) scale(1.05)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

// ── CONTACT FORM ─────────────────────────────────────────────
(function initContactForm() {
  const form    = qs('#contactForm');
  const toast   = qs('#formToast');
  const submitBtn = qs('#submitBtn');

  function showToast(msg, type) {
    toast.textContent = msg;
    toast.className   = `form-toast ${type}`;
    setTimeout(() => {
      toast.textContent = '';
      toast.className   = 'form-toast';
    }, 4000);
  }

  function validateField(field) {
    const val = field.value.trim();
    if (!val) { field.classList.add('error'); return false; }
    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      field.classList.add('error'); return false;
    }
    field.classList.remove('error');
    return true;
  }

  // live clear error
  qsa('input, textarea', form).forEach(f => {
    f.addEventListener('input', () => f.classList.remove('error'));
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const fields  = qsa('input, textarea', form);
    const allOk   = fields.map(validateField).every(Boolean);
    if (!allOk) { showToast('Please fill in all fields correctly.', 'error'); return; }

    // simulate async submission
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    await new Promise(r => setTimeout(r, 1400));
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message ✦';
    form.reset();
    showToast("🎉 Message sent! We'll get back to you soon.", 'success');
  });
})();

// ── HERO CTA RIPPLE ─────────────────────────────────────────
(function initRipple() {
  qsa('.btn-primary, .btn-ghost').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect  = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size   = Math.max(rect.width, rect.height) * 2;
      Object.assign(ripple.style, {
        position: 'absolute',
        width:    `${size}px`,
        height:   `${size}px`,
        left:     `${e.clientX - rect.left - size / 2}px`,
        top:      `${e.clientY - rect.top  - size / 2}px`,
        background: 'rgba(255,255,255,0.18)',
        borderRadius: '50%',
        transform: 'scale(0)',
        animation: 'rippleAnim .55s ease-out forwards',
        pointerEvents: 'none',
      });

      // inject keyframe once
      if (!document.getElementById('ripple-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-style';
        style.textContent = `@keyframes rippleAnim { to { transform: scale(1); opacity: 0; } }`;
        document.head.appendChild(style);
      }

      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
})();

// ── HERO BUTTONS – SCROLL & DEMO ────────────────────────────
(function initHeroButtons() {
  qs('#heroStart')?.addEventListener('click', () => {
    qs('#features').scrollIntoView({ behavior: 'smooth' });
  });

  qs('#heroDemo')?.addEventListener('click', () => {
    // Placeholder: open a demo modal or scroll to stats
    qs('#stats').scrollIntoView({ behavior: 'smooth' });
  });

  qs('#navCta')?.addEventListener('click', () => {
    qs('#contact').scrollIntoView({ behavior: 'smooth' });
  });
})();

console.log('%cRASWeb loaded 🚀', 'color:#7c3aed;font-size:16px;font-weight:bold;');
