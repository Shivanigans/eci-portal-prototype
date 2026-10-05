/* "Find your nearest centre" side sheet, shared by the homepage and both prep screens.
 *
 * Any element with data-centre-sheet opens it. It is a UX4G Drawer (right), built
 * once and appended to <body>, outside #app, so the page's text-size zoom and
 * dc-lite re-renders never touch it.
 *
 * UX4G's runtime (ux4g-custom.js) already closes a drawer on Escape, an overlay
 * click and [data-drawer-close]. It does not move focus, so this file adds that:
 * focus goes to the close button on open, Tab stays inside the sheet, and focus
 * returns to whatever opened it. The same three closes are handled here too, so the
 * sheet still works if the runtime is missing; closing twice is harmless.
 *
 * PROTOTYPE, with no real location lookup and no browser permission prompt:
 *   - On open, "Finding centres near you…" shows for a second, then the bar reads
 *     "Using your current location" over the 3 nearest sample centres (centres.js).
 *   - "Enter PIN code instead" swaps the bar for a PIN code field, Search and a "Use my
 *     current location" link back. Any 6-digit PIN shows the same loading line, then the
 *     same 3 centres under "Centres near <PIN>". Anything else gets an inline error.
 */
(function () {
  'use strict';

  var SHOWN = 3;            // centres listed
  var FINDING_FOR = 1000;   // ms the loading line shows
  var PIN_ERROR = 'Enter a 6-digit PIN code.';
  var ALL_CENTRES_QUERY = 'Electoral Registration Office near me';

  var overlay, sheet, closeBtn, locBar, pinForm, pinInput, pinBox, pinHelper, loading, results, heading, list, opener, timer;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function mapsUrl(query) {
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query);
  }

  function centreItem(c, i) {
    var tag = c.openNow
      ? '<span class="ux4g-tag-tonal-success">Open now</span>'
      : '<span class="ux4g-tag-tonal-neutral">Closed</span>';
    return '<li class="centre-item">' +
      '<div class="ux4g-d-flex ux4g-ai-start ux4g-jc-between ux4g-gap-x-s">' +
        '<h3 id="centre-' + i + '" class="ux4g-body-m-strong ux4g-text-neutral-primary ux4g-m-none">' + esc(c.name) + '</h3>' +
        '<span class="ux4g-flex-shrink-0">' + tag + '</span>' +
      '</div>' +
      '<p class="ux4g-body-s-default ux4g-text-neutral-secondary ux4g-m-none">' + esc(c.address) + '</p>' +
      '<p class="ux4g-body-s-default ux4g-text-neutral-secondary ux4g-m-none">' +
        esc(c.distance) + ' away<span aria-hidden="true"> · </span><span class="ux4g-sr-only">. </span>' + esc(c.hours) +
      '</p>' +
      // Maps searches for the centre by name.
      '<a class="ux4g-text-link-sm centre-maps" href="' + esc(mapsUrl(c.name)) + '" target="_blank" rel="noopener" aria-describedby="centre-' + i + '">' +
        'Open in Google Maps<span class="ux4g-icon-outlined" aria-hidden="true">open_in_new</span>' +
        '<span class="ux4g-sr-only"> (opens in a new tab)</span>' +
      '</a>' +
    '</li>';
  }

  function build() {
    var centres = (window.ECI_CENTRES || []).slice(0, SHOWN);
    overlay = document.createElement('div');
    overlay.className = 'ux4g-drawer-overlay';
    overlay.innerHTML =
      '<div class="ux4g-drawer ux4g-drawer-right centre-sheet" id="centre-sheet" role="dialog" aria-modal="true" aria-labelledby="centre-sheet-title">' +
        '<div class="ux4g-drawer-header">' +
          '<div class="ux4g-drawer-title-group">' +
            '<div class="ux4g-drawer-title-wrapper">' +
              '<h2 class="ux4g-drawer-title" id="centre-sheet-title">Find your nearest centre</h2>' +
            '</div>' +
          '</div>' +
          '<button type="button" class="ux4g-drawer-close" data-drawer-close aria-label="Close">' +
            '<span class="ux4g-icon-outlined" aria-hidden="true">close</span>' +
          '</button>' +
        '</div>' +
        '<div class="ux4g-drawer-body ux4g-d-flex ux4g-flex-column ux4g-gap-y-m">' +
          // `hidden` sits on plain wrappers: UX4G's ux4g-d-flex is a layered !important
          // and would beat the [hidden] rule on the same element.
          '<div class="centre-loc-bar">' +
            '<div class="ux4g-d-flex ux4g-ai-center ux4g-flex-wrap ux4g-gap-x-xs ux4g-p-s ux4g-radius-m ux4g-bg-neutral-soft">' +
              '<span class="ux4g-icon-outlined ux4g-text-primary" aria-hidden="true">my_location</span>' +
              '<span class="ux4g-body-s-default ux4g-text-neutral-primary ux4g-flex-1">Using your current location</span>' +
              '<button type="button" class="ux4g-text-link-sm link-btn centre-pin-link">Enter PIN code instead</button>' +
            '</div>' +
          '</div>' +
          '<form class="centre-pin-form" hidden novalidate>' +
            '<div class="ux4g-d-flex ux4g-ai-start ux4g-gap-x-s">' +
              '<div class="ux4g-input-container ux4g-input-md ux4g-flex-1 centre-pin-field">' +
                '<label class="ux4g-label-m-default" for="centre-pin">PIN code</label>' +
                '<div class="ux4g-input">' +
                  '<input class="ux4g-input-input" id="centre-pin" type="text" inputmode="numeric" autocomplete="postal-code" maxlength="6" aria-describedby="centre-pin-help">' +
                '</div>' +
                // Shown only with an error: UX4G shows the helper under any state class.
                '<div id="centre-pin-help" class="ux4g-input-helper" hidden>' +
                  '<span class="ux4g-icon-outlined ux4g-input-helper-icon" aria-hidden="true">error</span>' +
                  '<span class="ux4g-input-helper-text"></span>' +
                '</div>' +
              '</div>' +
              '<button type="submit" class="ux4g-btn ux4g-btn-outline-primary ux4g-btn-md centre-pin-search">Search</button>' +
            '</div>' +
            '<button type="button" class="ux4g-text-link-sm link-btn centre-here-link">' +
              '<span class="ux4g-icon-outlined" aria-hidden="true">my_location</span>Use my current location' +
            '</button>' +
          '</form>' +
          '<div class="centre-loading" role="status" aria-live="polite" tabindex="-1">' +
            '<div class="ux4g-d-flex ux4g-ai-center ux4g-gap-x-xs">' +
              '<span class="ux4g-spinner-primary-full ux4g-spinner-xs" aria-hidden="true"></span>' +
              '<span class="ux4g-body-s-default ux4g-text-neutral-secondary">Finding centres near you…</span>' +
            '</div>' +
          '</div>' +
          '<div class="centre-results" hidden>' +
            '<h3 class="ux4g-label-l-strong ux4g-text-neutral-secondary ux4g-m-none" id="centre-list-heading">Centres near you</h3>' +
            '<ul class="centre-list" aria-labelledby="centre-list-heading">' + centres.map(centreItem).join('') + '</ul>' +
            '<a class="ux4g-text-link-sm centre-maps centre-all" href="' + esc(mapsUrl(ALL_CENTRES_QUERY)) + '" target="_blank" rel="noopener">' +
              'See all centres on Google Maps<span class="ux4g-icon-outlined" aria-hidden="true">open_in_new</span>' +
              '<span class="ux4g-sr-only"> (opens in a new tab)</span>' +
            '</a>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    var q = function (s) { return overlay.querySelector(s); };
    sheet = q('.ux4g-drawer');
    closeBtn = q('.ux4g-drawer-close');
    locBar = q('.centre-loc-bar');
    pinForm = q('.centre-pin-form');
    pinInput = q('#centre-pin');
    pinBox = q('.centre-pin-field');
    pinHelper = q('#centre-pin-help');
    loading = q('.centre-loading');
    results = q('.centre-results');
    heading = q('#centre-list-heading');
    list = q('.centre-list');

    q('.centre-pin-link').addEventListener('click', function () { showPin(); pinInput.focus(); });
    q('.centre-here-link').addEventListener('click', function () { useLocation(true); });
    pinInput.addEventListener('input', function () { setPinError(''); });
    pinForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var pin = pinInput.value.replace(/\s/g, '');
      if (!/^[0-9]{6}$/.test(pin)) { setPinError(PIN_ERROR); pinInput.focus(); return; }
      setPinError('');
      find('Centres near ' + pin);
    });
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (!e.target.closest('.ux4g-drawer')) close(); });
    overlay.addEventListener('keydown', trapTab);

    // The UX4G runtime closes the drawer by removing the class. Watch for that so
    // focus still returns to the opener whichever way it closed.
    new MutationObserver(function () {
      if (!sheet.classList.contains('ux4g-drawer-open')) restoreFocus();
    }).observe(sheet, { attributes: true, attributeFilter: ['class'] });
  }

  // UX4G Input error state, with the message in the helper line.
  function setPinError(message) {
    pinBox.classList.toggle('ux4g-input-error', !!message);
    pinHelper.hidden = !message;
    pinHelper.querySelector('.ux4g-input-helper-text').textContent = message;
    if (message) pinInput.setAttribute('aria-invalid', 'true'); else pinInput.removeAttribute('aria-invalid');
  }

  // PROTOTYPE: the loading line for a second, then the same sample centres.
  function find(title, onDone) {
    clearTimeout(timer);
    results.hidden = true;
    loading.hidden = false;
    timer = setTimeout(function () {
      heading.textContent = title;
      loading.hidden = true;
      results.hidden = false;
      if (onDone) onDone();
    }, FINDING_FOR);
  }

  function showPin() {
    locBar.hidden = true;
    pinForm.hidden = false;
  }

  // Back to "current location": the bar appears with the results, once it is "found".
  // With moveFocus, focus waits on the loading line, then goes to the PIN code link.
  function useLocation(moveFocus) {
    pinForm.hidden = true;
    setPinError('');
    pinInput.value = '';
    locBar.hidden = true;
    if (moveFocus) loading.focus();
    find('Centres near you', function () {
      locBar.hidden = false;
      if (moveFocus) locBar.querySelector('.centre-pin-link').focus();
    });
  }

  function open(trigger) {
    if (!overlay) build();
    opener = trigger || document.activeElement;
    overlay.classList.add('ux4g-drawer-open');
    sheet.classList.add('ux4g-drawer-open');
    document.body.classList.add('ux4g-drawer-lock');
    useLocation(false);
    // The overlay fades in from visibility:hidden, which blocks focus until it flips.
    requestAnimationFrame(function () { closeBtn.focus(); });
  }

  function close() {
    if (!sheet || !sheet.classList.contains('ux4g-drawer-open')) return;
    clearTimeout(timer);
    overlay.classList.remove('ux4g-drawer-open');
    sheet.classList.remove('ux4g-drawer-open');
    document.body.classList.remove('ux4g-drawer-lock');
  }

  function restoreFocus() {
    var el = opener;
    opener = null;
    if (el && document.contains(el) && typeof el.focus === 'function') el.focus();
  }

  function focusables() {
    return Array.prototype.filter.call(
      sheet.querySelectorAll('a[href], button:not([disabled]), input:not([disabled])'),
      function (el) { return el.offsetParent !== null; }
    );
  }

  function trapTab(e) {
    if (e.key !== 'Tab') return;
    var f = focusables();
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-centre-sheet]');
    if (!t) return;
    e.preventDefault();
    open(t);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });

  window.CentreSheet = { open: open, close: close };
})();
