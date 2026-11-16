// Shared call destination for all three guides.
(function () {
  'use strict';
  var release = {
    callUrl: 'https://calendly.com/socialmoneymodels/free-discovery-call-atm-audit'
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

})();
