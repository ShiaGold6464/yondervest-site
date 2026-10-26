/* =========================================================
   Yondervest — landing page script
   ---------------------------------------------------------
   EMAIL SIGNUPS (Web3Forms)
   Signups are emailed to the inbox linked to the access key
   below. The inbox address itself is NEVER in this code — it
   lives only in your Web3Forms account. The key can only send
   to that one inbox, so it is safe to be public.

   To set up: get a free key at https://web3forms.com using
   the inbox you want signups sent to, then paste it here:
   ========================================================= */
var WEB3FORMS_ACCESS_KEY = 'YOUR_ACCESS_KEY_HERE';

(function () {
  'use strict';

  // footer year
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear() + ' Yondervest';

  // reveal signup section on scroll
  var sec = document.querySelector('.signup');
  if (sec) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { sec.classList.add('in'); io.disconnect(); }
        });
      }, { threshold: 0.25 });
      io.observe(sec);
    } else {
      sec.classList.add('in');
    }
  }

  // email signup
  var form = document.getElementById('signup-form');
  var msg = document.getElementById('form-msg');
  if (!form || !msg) return;

  var EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[A-Za-z]{2,}$/;
  var lastSubmit = 0;

  function show(text, isError) {
    msg.textContent = text;               // textContent only — never innerHTML
    msg.className = 'form-msg' + (isError ? ' err' : '');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // honeypot: real people never fill this hidden box, bots do
    if (form.botcheck && form.botcheck.checked) { show("You're in. We'll be in touch.", false); return; }

    // basic rate limit: one submit per 10 seconds per visitor
    var now = Date.now();
    if (now - lastSubmit < 10000) { show('One moment, then try again.', true); return; }

    var email = String(form.email.value || '').trim().slice(0, 254);
    if (!EMAIL_RE.test(email)) { show('Enter a valid email.', true); form.email.focus(); return; }

    if (!WEB3FORMS_ACCESS_KEY || WEB3FORMS_ACCESS_KEY === 'YOUR_ACCESS_KEY_HERE') {
      show('Signups open soon. Check back shortly.', true); return;
    }

    lastSubmit = now;
    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    show('Sending...', false);

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: 'New Yondervest waitlist signup',
        from_name: 'Yondervest Landing Page',
        email: email,
        botcheck: false
      })
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.success) { form.reset(); show("You're in. We'll be in touch.", false); }
        else { throw new Error('failed'); }
      })
      .catch(function () { show('Something went wrong. Try again.', true); })
      .then(function () { btn.disabled = false; });
  });
})();
