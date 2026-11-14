// Same-browser visit notes. Kept local until a form explicitly includes them.
(function () {
  'use strict';
  var key = 'lead_attribution', maxAge = 90 * 24 * 60 * 60 * 1000, now = Date.now();
  var names = ['source', 'medium', 'campaign', 'term', 'content'];
  function clean(value, max) {
    return typeof value === 'string' ? value.replace(/[\u0000-\u001F\u007F]/g, '').slice(0, max) : '';
  }
  function touch(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    var at = Date.parse(value.at);
    if (!isFinite(at) || now - at > maxAge) return null;
    var out = { at: new Date(at).toISOString(), landing: clean(value.landing, 200), utm: {} };
    if (out.landing.charAt(0) !== '/') return null;
    var ref = clean(value.ref, 100);
    if (ref) out.ref = ref;
    names.forEach(function (name) {
      var text = clean(value.utm && value.utm[name], 100);
      if (text) out.utm[name] = text;
    });
    return out;
  }
  var state = { v: 1, first: null, latest: null };
  try {
    var stored = JSON.parse(window.localStorage.getItem(key));
    if (stored && stored.v === 1) {
      state.first = touch(stored.first);
      state.latest = touch(stored.latest);
    }
  } catch (err) { /* Storage may be disabled or contain an older value. */ }
  var visit = { at: new Date(now).toISOString(), landing: clean(window.location.pathname, 200), utm: {} };
  try {
    var params = new URLSearchParams(window.location.search);
    names.forEach(function (name) {
      var text = clean(params.get('utm_' + name), 100);
      if (text) visit.utm[name] = text;
    });
    if (document.referrer) {
      var ref = new URL(document.referrer);
      if ((ref.protocol === 'http:' || ref.protocol === 'https:') &&
          ref.hostname.replace(/^www\./, '') !== window.location.hostname.replace(/^www\./, '')) {
        visit.ref = clean(ref.hostname, 100);
      }
    }
  } catch (err) { /* Malformed referrers do not affect the form. */ }
  if (!state.first) state.first = visit;
  if (visit.ref || Object.keys(visit.utm).length) state.latest = visit;
  try { window.localStorage.setItem(key, JSON.stringify(state)); } catch (err) { /* Keep the in-memory visit. */ }
  window.leadAttribution = {
    get: function () {
      try { return JSON.parse(JSON.stringify(state)); } catch (err) { return null; }
    }
  };
})();
