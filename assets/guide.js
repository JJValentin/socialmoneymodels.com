// Guide pages: the Copy button on each message block. Copies the message text as shown, brackets included.
(function () {
  function fallbackCopy(text, button) {
    var field = document.createElement('textarea');
    field.value = text;
    field.readOnly = true;
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
    field.remove();
    button.focus({ preventScroll: true });
    return ok;
  }

  function done(button) {
    button.classList.add('done');
    button.querySelector('span').textContent = 'Copied';
    button.querySelector('svg').innerHTML = '<path d="m3.5 8.5 3 3 6-7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>';
  }

  document.querySelectorAll('.msg .copy').forEach(function (button) {
    button.hidden = false;
    button.addEventListener('click', function () {
      var text = button.closest('.msg').querySelector('.bubble').textContent.replace(/\s+/g, ' ').trim();
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { done(button); }, function () {
          if (fallbackCopy(text, button)) done(button);
        });
      } else if (fallbackCopy(text, button)) {
        done(button);
      }
    });
  });
})();
