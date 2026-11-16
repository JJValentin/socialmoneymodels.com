// Two-question quiz with the existing signup, attribution and tracking integration.
(function () {
  function lead(formName) { if (window.trackEvent) window.trackEvent('generate_lead', { form_name: formName }); }
  // The one place for the outbound links. index.html carries the same hrefs as the JS-off fallback.
  var SKOOL_URL = 'https://www.skool.com/social-money-models-7594';
  var SUBSTACK_URL = 'https://thejoshuav.substack.com/subscribe';
  var LIVE_HOSTS = ['socialmoneymodels.com', 'www.socialmoneymodels.com'];

  // Joshua's tagged list (functions/api/signup.js). Only on the live host, so previews and tests never add rows.
  async function record(address, extra) {
    if (LIVE_HOSTS.indexOf(location.hostname) === -1 && !window.SMM_FORCE_SUBSCRIBE) return false;
    var body = { email: address };
    Object.keys(extra || {}).forEach(function (k) { body[k] = extra[k]; });
    var controller = new AbortController();
    var timer = window.setTimeout(function () { controller.abort(); }, 12000);
    try {
      var response = await fetch('/api/signup', { method: 'POST', keepalive: true,
        signal: controller.signal, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      var saved = await response.json();
      return response.ok && saved.ok === true;
    } catch (err) { return false; }
    finally { window.clearTimeout(timer); }
  }
  document.querySelectorAll('[data-skool]').forEach(function (a) { a.href = SKOOL_URL; });
  document.querySelectorAll('[data-substack]').forEach(function (a) { a.href = SUBSTACK_URL; });

  // EchoOS "Get notified": the link opens a one-field form in the card (JS off: the link goes to the EchoOS waitlist on tryechoos.com).
  var notify = document.getElementById('notify-echoos');
  var notifyOpen = document.querySelector('[data-notify-toggle]');
  if (notify && notifyOpen) {
    var nEmail = notify.querySelector('input[type=email]');
    var nError = notify.querySelector('.notify__error');
    var nNote = notify.querySelector('.notify__note');
    notifyOpen.addEventListener('click', function (e) {
      e.preventDefault();
      notify.hidden = false;
      notifyOpen.setAttribute('aria-expanded', 'true');
      nEmail.focus();
    });
    notify.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = nEmail.value.trim();
      if (!v || !nEmail.checkValidity()) {
        nEmail.setAttribute('aria-invalid', 'true');
        nError.textContent = 'Enter an email like name@yourbusiness.com.';
        nEmail.focus();
        return;
      }
      nEmail.removeAttribute('aria-invalid');
      nError.textContent = '';
      var notifyData = { source: 'echoos' };
      try { notifyData.attribution = window.leadAttribution.get(); } catch (err) {}
      record(v, notifyData);
      lead('echoos_notify');
      notify.querySelector('.notify__row').hidden = true;
      nNote.textContent = 'You’re on the list. I’ll email you when EchoOS opens.';
    });
  }

  var form = document.getElementById('quiz-form');
  if (!form) return;
  var quiz = document.getElementById('quiz');
  var home = document.getElementById('home');
  var result = document.getElementById('result');
  var steps = form.querySelectorAll('.step');
  var bars = form.querySelectorAll('.progress span');
  var count = form.querySelector('.count');
  var back = form.querySelector('.back');
  var email = document.getElementById('email');
  var error = document.getElementById('email-error');
  var submit = form.querySelector('[type=submit]');
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  var HOME_TITLE = document.title;
  var answers = { 1: null, 2: null };
  var current = 1;
  var pending = false;

  function unlock() {
    pending = false;
    submit.disabled = false;
    back.disabled = false;
    email.readOnly = false;
    form.removeAttribute('aria-busy');
    submit.textContent = 'Open my guide';
  }
  window.addEventListener('pageshow', function (e) { if (e.persisted) unlock(); });

  // Provisional destinations. Release waits for approved, implemented guides.
  var GUIDE_URLS = {
    content: '/content-that-gets-watched/',
    income: '/attention-to-income/',
    clients: '/predictable-clients/'
  };

  function show(n, focus) {
    current = n;
    steps.forEach(function (s) { s.hidden = Number(s.dataset.step) !== n; });
    bars.forEach(function (b, i) { b.classList.toggle('is-on', i < Math.min(n, 2)); });
    count.textContent = n < 3 ? 'Question ' + n + ' of 2' : '';
    back.hidden = n === 1;
    if (focus) (n === 3 ? email : steps[n - 1].querySelector('.q')).focus({ preventScroll: true });
  }

  function reveal(key) {
    var article;
    result.querySelectorAll('.result').forEach(function (a) {
      a.hidden = a.dataset.result !== key;
      if (!a.hidden) article = a;
    });
    home.hidden = true;
    result.hidden = false;
    document.body.classList.add('is-result');
    document.title = article.querySelector('.result__title').textContent + ' | Social Money Models';
    window.scrollTo(0, 0);
    article.querySelector('.result__title').focus({ preventScroll: true });
  }

  form.addEventListener('click', function (e) {
    var opt = e.target.closest('.opt');
    if (!opt || pending || opt.closest('.step').hidden) return;
    var q = Number(opt.dataset.q);
    answers[q] = opt.dataset.v;
    opt.parentElement.querySelectorAll('.opt').forEach(function (o) { o.setAttribute('aria-pressed', String(o === opt)); });
    if (q === 2 && answers[2] === 'none') reveal('newsletter');
    else show(q + 1, true);
  });
  form.querySelectorAll('.opt').forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
  back.addEventListener('click', function () { if (!pending) show(Math.max(1, current - 1), true); });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (pending || current !== 3 || !answers[1] || !answers[2] || answers[2] === 'none') return;
    var value = email.value.trim();
    if (!value || !email.checkValidity()) {
      email.setAttribute('aria-invalid', 'true');
      error.textContent = 'Enter a valid email address to continue.';
      email.focus();
      return;
    }
    email.removeAttribute('aria-invalid');
    error.textContent = '';
    pending = true;
    submit.disabled = true;
    back.disabled = true;
    email.readOnly = true;
    form.setAttribute('aria-busy', 'true');
    submit.textContent = 'Opening your guide...';
    var quizData = { source: 'quiz' };
    [1, 2].forEach(function (q) {
      quizData['q' + q] = form.querySelector('[data-q="' + q + '"][data-v="' + answers[q] + '"] .opt__text').textContent;
    });
    // The existing endpoint stores q1/q2. Do not invent a legacy step tag for a selected win.
    try { quizData.attribution = window.leadAttribution.get(); } catch (err) {}
    try {
      if (!await record(value, quizData)) throw new Error('save_failed');
      lead('quiz');
      window.location.assign(GUIDE_URLS[answers[1]]);
    } catch (err) {
      error.textContent = "Your email didn't save. Try again to open your guide.";
      error.focus();
      unlock();
    }
  });

  function goHome(toQuiz, keepAnswers) {
    if (pending) return;
    if (!keepAnswers) {
      answers = { 1: null, 2: null };
      form.querySelectorAll('.opt').forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
      email.value = '';
    }
    error.textContent = '';
    email.removeAttribute('aria-invalid');
    result.hidden = true;
    home.hidden = false;
    document.body.classList.remove('is-result');
    document.title = HOME_TITLE;
    show(keepAnswers ? 2 : 1, false);
    if (toQuiz) {
      quiz.scrollIntoView({ behavior: calm.matches ? 'auto' : 'smooth', block: 'start' });
      steps[current - 1].querySelector('.q').focus({ preventScroll: true });
    } else {
      window.scrollTo(0, 0);
      document.getElementById('hero-title').focus({ preventScroll: true });
    }
  }
  result.querySelector('.change-answer').addEventListener('click', function () { goHome(true, true); });
  document.querySelector('.nav__mark').addEventListener('click', function (e) {
    if (pending) { e.preventDefault(); return; }
    if (!result.hidden) { e.preventDefault(); goHome(false, false); }
  });
  // Shared navigation remains usable while result screens hide the homepage.
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (pending) { e.preventDefault(); return; }
      if (result.hidden) return;
      var target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      goHome(false, false);
      target.scrollIntoView({ behavior: calm.matches ? 'auto' : 'smooth', block: 'start' });
    });
  });
  document.querySelectorAll('.js-start').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      if (pending) return;
      quiz.scrollIntoView({ behavior: calm.matches ? 'auto' : 'smooth', block: 'start' });
      (current === 3 ? email : steps[current - 1].querySelector('.q')).focus({ preventScroll: true });
    });
  });
  show(1, false);
})();
