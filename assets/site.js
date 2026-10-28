// Social Money Models v5: the 3-question quiz, the email gate and the result. Quiz flow and focus logic kept from v4.
// Email: on submit, the visitor's email is posted to Substack's own embed form endpoint
// (/api/v1/free?nojs=true, the same fields as thejoshuav.substack.com/embed) inside a hidden iframe,
// so Substack adds them to Social/Money. Only on the live host, so previews and tests never subscribe anyone.
// Quiz answers are not sent anywhere. No analytics, no storage.
(function () {
  // The one place for the outbound links. index.html carries the same hrefs as the JS-off fallback.
  var SKOOL_URL = 'https://www.skool.com/social-money-models-7594';
  var SUBSTACK_URL = 'https://thejoshuav.substack.com/subscribe';
  var SUBSTACK_FORM = 'https://thejoshuav.substack.com/api/v1/free?nojs=true';
  var LIVE_HOSTS = ['socialmoneymodels.com', 'www.socialmoneymodels.com'];

  // Fire and forget: the result shows at once; Substack sends its own welcome email.
  function subscribe(address) {
    if (LIVE_HOSTS.indexOf(location.hostname) === -1 && !window.SMM_FORCE_SUBSCRIBE) return;
    var frame = document.querySelector('iframe[name="smm-substack"]');
    if (!frame) {
      frame = document.createElement('iframe');
      frame.name = 'smm-substack';
      frame.title = 'Newsletter signup';
      frame.hidden = true;
      frame.tabIndex = -1;
      frame.setAttribute('aria-hidden', 'true');
      document.body.appendChild(frame);
    }
    var f = document.createElement('form');
    f.method = 'post';
    f.action = SUBSTACK_FORM;
    f.target = 'smm-substack';
    f.hidden = true;
    var fields = { email: address, source: 'embed', first_url: location.href, first_referrer: document.referrer,
      current_url: location.href, current_referrer: document.referrer };
    Object.keys(fields).forEach(function (k) {
      var i = document.createElement('input');
      i.type = 'hidden'; i.name = k; i.value = fields[k];
      f.appendChild(i);
    });
    document.body.appendChild(f);
    f.submit();
    f.remove();
  }
  document.querySelectorAll('[data-skool]').forEach(function (a) { a.href = SKOOL_URL; });
  document.querySelectorAll('[data-substack]').forEach(function (a) { a.href = SUBSTACK_URL; });

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
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  var HOME_TITLE = document.title;

  var answers = { 1: null, 2: null, 3: null };
  var current = 1;

  var ECHO = {
    1: {
      a: 'a path to clients you can repeat, not luck',
      b: 'a steady way to land clients without waiting on referrals',
      c: 'more of the people in your audience or list to become clients'
    },
    2: {
      a: 'do great work for your clients, and find new ones when you can',
      b: 'post something useful, then wait for people to reach out',
      c: 'try a new tactic, then drop it when it doesn’t land fast',
      d: 'talk to interested people, then let it drift when you’re busy'
    },
    3: {
      prereq: 'you can’t say your offer in one clear line yet, or your contacts are scattered all over',
      start: 'plenty of people know you and what you do, but almost nobody asks to work with you',
      dm: 'conversations start, but they rarely turn into a booked call',
      close: 'you get on calls, but too many end with “let me think about it”'
    }
  };

  // Which rows of the shared system list get "You are here".
  var HERE = { prereq: ['prereq'], start: ['s0', 's1'], dm: ['s2'], close: ['s3'] };

  function show(n, focus) {
    current = n;
    steps.forEach(function (s) {
      var on = Number(s.dataset.step) === n;
      s.hidden = !on;
      s.classList.remove('is-in');
      if (on) { void s.offsetWidth; s.classList.add('is-in'); }
    });
    bars.forEach(function (b, i) { b.classList.toggle('is-on', i < Math.min(n, 3)); });
    count.textContent = n <= 3 ? n + ' of 3' : 'Last step';
    back.hidden = n === 1;
    if (focus) {
      var target = n === 4 ? email : steps[n - 1].querySelector('.q');
      target.focus({ preventScroll: true });
    }
  }

  form.addEventListener('click', function (e) {
    var opt = e.target.closest('.opt');
    if (!opt) return;
    var q = Number(opt.dataset.q);
    answers[q] = opt.dataset.v;
    opt.parentElement.querySelectorAll('.opt').forEach(function (o) {
      o.setAttribute('aria-pressed', String(o === opt));
    });
    window.setTimeout(function () { show(q + 1, true); }, calm.matches ? 0 : 220);
  });

  form.querySelectorAll('.opt').forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });

  back.addEventListener('click', function () { show(Math.max(1, current - 1), true); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var value = email.value.trim();
    if (!value || !email.checkValidity()) {
      email.setAttribute('aria-invalid', 'true');
      error.textContent = 'Enter an email like name@yourbusiness.com.';
      email.focus();
      return;
    }
    email.removeAttribute('aria-invalid');
    error.textContent = '';
    subscribe(value);
    reveal();
  });

  function reveal() {
    var key = answers[3];
    var article = null;
    result.querySelectorAll('.result').forEach(function (a) {
      var on = a.dataset.result === key;
      a.hidden = !on;
      if (on) article = a;
    });
    article.querySelectorAll('[data-echo]').forEach(function (s) {
      var q = s.dataset.echo;
      s.textContent = ECHO[q][answers[q]];
    });
    result.querySelectorAll('.steprow').forEach(function (r) {
      r.classList.toggle('is-here', HERE[key].indexOf(r.dataset.row) !== -1);
    });
    home.hidden = true;
    result.hidden = false;
    document.body.classList.add('is-result');
    document.title = 'Your result | Social Money Models';
    window.scrollTo(0, 0);
    article.querySelector('.result__title').focus({ preventScroll: true });
  }

  // The retake reset. toQuiz picks where to land: question 1 (Retake) or the top of the home page (wordmark).
  function goHome(toQuiz) {
    answers = { 1: null, 2: null, 3: null };
    form.querySelectorAll('.opt').forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
    email.value = '';
    result.hidden = true;
    home.hidden = false;
    document.body.classList.remove('is-result');
    document.title = HOME_TITLE;
    show(1, false);
    if (toQuiz) {
      quiz.scrollIntoView({ behavior: calm.matches ? 'auto' : 'smooth', block: 'start' });
      steps[0].querySelector('.q').focus({ preventScroll: true });
    } else {
      window.scrollTo(0, 0);
      document.getElementById('hero-title').focus({ preventScroll: true });
    }
  }

  result.querySelector('.retake').addEventListener('click', function () { goHome(true); });

  document.querySelector('.nav__mark').addEventListener('click', function (e) {
    if (!document.body.classList.contains('is-result')) return;
    e.preventDefault();
    goHome(false);
  });

  document.querySelectorAll('.js-start').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      quiz.scrollIntoView({ behavior: calm.matches ? 'auto' : 'smooth', block: 'start' });
      var target = current === 4 ? email : steps[current - 1].querySelector('.q');
      target.focus({ preventScroll: true });
    });
  });

  show(1, false);
})();
