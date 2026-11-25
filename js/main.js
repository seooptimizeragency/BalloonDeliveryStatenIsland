// Shared interactivity: FAQ accordion, scroll-spy nav, YouTube click-to-load
// facades, mobile nav, and in-page Order Inquiry form submission.
document.addEventListener('DOMContentLoaded', () => {
  // FAQ accordion (with aria-expanded)
  document.querySelectorAll('.faq-item .faq-q').forEach(btn => {
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Scroll-spy for nav highlight
  const sections = [...document.querySelectorAll('[data-spy]')];
  const links = [...document.querySelectorAll('.main-nav a[data-spy-link]')];
  if (sections.length && links.length && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(l => l.classList.toggle('active',
            l.getAttribute('href') === '/#' + e.target.id));
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(s => obs.observe(s));
  }

  // YouTube facades: load the real player only on click
  document.querySelectorAll('.yt-facade').forEach(btn => {
    btn.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube.com/embed/' + btn.dataset.yt + '?autoplay=1&rel=0';
      iframe.title = btn.dataset.title || 'Balloons Lane video';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      btn.replaceWith(iframe);
    });
  });

  // Order Inquiry forms: validate, then submit in-page through a hidden iframe
  // (classic FormSubmit post; _next returns to the local /form-sent/ page).
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  document.querySelectorAll('form[data-inquiry-form]').forEach(form => {
    const note = form.querySelector('.form-note');
    const btn = form.querySelector('button[type="submit"]');
    const frame = form.querySelector('iframe.submit-frame');
    let submitted = false;
    let pollTimer = null;
    let timeoutTimer = null;

    function setNote(text, isError) {
      if (!note) return;
      note.textContent = text;
      note.classList.toggle('form-note-error', !!isError);
      note.classList.toggle('form-note-success', !isError && !!text);
    }
    function fieldError(input, msg) {
      if (!input) return;
      input.classList.add('field-invalid');
      input.setAttribute('aria-invalid', 'true');
      const field = input.closest('.field');
      if (field) {
        let err = field.querySelector('.field-error');
        if (!err) { err = document.createElement('p'); err.className = 'field-error'; field.appendChild(err); }
        err.textContent = msg;
      }
    }
    function clearFieldError(input) {
      if (!input) return;
      input.classList.remove('field-invalid');
      input.removeAttribute('aria-invalid');
      const field = input.closest('.field');
      const err = field ? field.querySelector('.field-error') : null;
      if (err) err.remove();
    }
    function finish(success) {
      submitted = false;
      if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
      if (timeoutTimer) { clearTimeout(timeoutTimer); timeoutTimer = null; }
      if (btn) { btn.disabled = false; btn.textContent = 'Send'; }
      if (success) {
        setNote('Thank you! Your inquiry has been submitted successfully. We will contact you soon.', false);
        form.reset();
      } else {
        setNote('Sorry, your inquiry could not be sent. Please try again or call 718.675.2820.', true);
      }
    }
    function frameAtFormSent() {
      try {
        return !!(frame && frame.contentWindow && frame.contentWindow.location.pathname.includes('/form-sent'));
      } catch (err) {
        return false;
      }
    }

    form.addEventListener('input', e => clearFieldError(e.target));
    form.addEventListener('change', e => {
      clearFieldError(e.target);
      if (e.target.closest('.verify-row')) setNote('', false);
    });

    if (frame) {
      frame.addEventListener('load', () => {
        if (submitted && frameAtFormSent()) finish(true);
      });
    }

    form.addEventListener('submit', e => {
      const honey = form.querySelector('[name="_honey"]');
      if (honey && honey.value) { e.preventDefault(); return; }
      let firstBad = null;
      function bad(input, msg) {
        fieldError(input, msg);
        if (!firstBad) firstBad = input;
      }
      const email = form.querySelector('[name="email"]');
      if (!email || !emailRe.test(email.value.trim())) bad(email, 'Please enter a valid email address.');
      const date = form.querySelector('[name="field_69a55f6"]');
      if (!date || !date.value) bad(date, 'Please choose your event date.');
      const zip = form.querySelector('[name="field_eebb742"]');
      if (!zip || !zip.value.trim()) bad(zip, 'Please enter your delivery zip code.');
      const message = form.querySelector('[name="message"]');
      if (!message || !message.value.trim()) bad(message, 'Please write your message.');
      const human = form.querySelector('.verify-row input[type="checkbox"]');
      if (human && !human.checked) {
        setNote('Please verify you are human before sending.', true);
        if (!firstBad) firstBad = human;
      }
      if (firstBad) {
        e.preventDefault();
        firstBad.focus();
        return;
      }
      setNote('', false);
      submitted = true;
      if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
      pollTimer = setInterval(() => {
        if (frameAtFormSent()) finish(true);
      }, 400);
      timeoutTimer = setTimeout(() => finish(false), 15000);
    });
  });
});

/* Mobile nav: hamburger toggle */
(function () {
  var btn = document.querySelector('.nav-toggle');
  var nav = document.getElementById('mainNav');
  if (!btn || !nav) return;
  btn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    btn.textContent = open ? '✕' : '☰';
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      btn.textContent = '☰';
    }
  });
})();
