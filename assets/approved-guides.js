// Shared release inputs for all three guides. Empty values keep the visible holds.
(function () {
  'use strict';
  var release = {
    callUrl: '',
    trialTerms: ''
  };

  if (release.callUrl) {
    var url;
    try { url = new URL(release.callUrl); } catch (err) { url = null; }
    if (url && url.protocol === 'https:') {
      document.querySelectorAll('[data-guide-call]').forEach(function (button) {
        var link = document.createElement('a');
        link.className = button.className;
        link.textContent = button.textContent;
        link.href = url.href;
        link.setAttribute('data-guide-call', '');
        link.setAttribute('data-copy', button.getAttribute('data-copy'));
        button.replaceWith(link);
      });
      document.querySelectorAll('[data-guide-call-pending]').forEach(function (marker) {
        marker.hidden = true;
      });
    }
  }

  if (release.trialTerms) {
    document.querySelectorAll('[data-guide-terms]').forEach(function (terms) {
      terms.textContent = release.trialTerms;
    });
    document.querySelectorAll('[data-guide-price-pending]').forEach(function (marker) {
      marker.hidden = true;
    });
  }
})();
