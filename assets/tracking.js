/* Tracking for socialmoneymodels.com: Google Tag Manager (GA4 + Meta Pixel are configured inside GTM).
   GTM_ID is the container ID (GTM-KPSZSQ7B). The same ID sits in each page's <noscript> iframe; change both together.
   Events pushed to window.dataLayer (GTM triggers on these names):
     generate_lead   { form_name: 'quiz' }               quiz form (#quiz-form) email accepted, result shown
     generate_lead   { form_name: 'echoos_notify' }      EchoOS Get notified form (#notify-echoos) email accepted
     outbound_click  { link_domain, link_url, link_text, outbound_type: 'skool' | 'substack' } */
(function (w, d) {
  var GTM_ID = 'GTM-KPSZSQ7B';

  // Standard GTM head snippet (googletagmanager.com/gtm.js), reading GTM_ID above.
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
  var first = d.getElementsByTagName('script')[0];
  var gtm = d.createElement('script');
  gtm.async = true;
  gtm.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM_ID;
  first.parentNode.insertBefore(gtm, first);

  // trackEvent('generate_lead', { form_name: 'contact' }) -> dataLayer.push({ event: 'generate_lead', form_name: 'contact' })
  w.trackEvent = function (name, params) {
    var o = { event: name };
    for (var k in params || {}) if (Object.prototype.hasOwnProperty.call(params, k)) o[k] = params[k];
    w.dataLayer.push(o);
  };

  var OUTBOUND = [['skool', /(^|\.)skool\.com$/], ['substack', /(^|\.)substack\.com$/]];
  d.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || !a.hostname) return;
    var host = a.hostname.toLowerCase();
    for (var i = 0; i < OUTBOUND.length; i++) {
      if (OUTBOUND[i][1].test(host)) {
        w.trackEvent('outbound_click', { link_domain: host, link_url: a.href, link_text: (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100), outbound_type: OUTBOUND[i][0] });
        return;
      }
    }
  }, true);
})(window, document);
