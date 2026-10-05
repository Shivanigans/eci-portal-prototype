/* The one log in form, shared by the full-page log in (login.html) and the log in dialog on the
 * homepage. Both are only wrappers: the heading, copy, fields, sizes and behaviour all come from
 * here, and the look from assets/css/auth.css.
 *
 *   LoginForm.mount(el, { id, headingTag, signupHref, onSuccess, onClose })
 *     Draws the form into el. `id` prefixes every id, so two forms never clash. With onClose,
 *     a close button sits beside the heading (the dialog uses this).
 *   LoginForm.openDialog({ onSuccess }) / LoginForm.closeDialog()
 *     The homepage dialog: a scrim, the form in a card, Escape and a scrim click close it,
 *     and focus goes back to whatever opened it.
 *
 * Two steps, one replacing the other in the same card:
 *   1. Log in to continue: Resident elector / Overseas elector, then mobile number OR EPIC number
 *      (overseas: email address OR EPIC number), Send OTP, and the line to sign up.
 *   2. Enter the code: where it was sent (masked) with Change, the six UX4G OTP boxes
 *      (assets/js/auth-otp.js), Resend code after a countdown, and Verify.
 *
 * PROTOTYPE: the demo mobile number is filled in. Only the mobile number (and overseas, the
 * email) leads to step 2; EPIC alone shows a note instead. In step 2 the demo code fills itself
 * in after a second and is checked straight away, so nothing needs typing or pressing.
 */
(function () {
  'use strict';

  var SAMPLE_OTP = '123456';
  var DEMO_HINT = 'Demo account: 98765 43210, code 123456.';
  var EPIC_NOTE = 'EPIC login is not available in this demo. Use the demo mobile number above.';
  // PROTOTYPE timings, in milliseconds: when the code fills itself in after step 2 opens, and
  // how long "Verification successful" shows before moving on.
  var FILL_AFTER = 1000;
  var SUCCESS_FOR = 1000;
  // Seconds before Resend code can be pressed.
  var RESEND_AFTER = 30;

  function field(p, o) {
    var helperId = p + '-' + o.key + '-help';
    // A field with a hint always shows its helper line (the hint, or an error in its place).
    // A field without one carries no state class until it has a message, because UX4G shows the
    // helper under any state class.
    return '' +
      '<div class="ux4g-input-container ux4g-input-md' + (o.hint ? ' ux4g-input-default' : '') + '" data-field="' + o.key + '">' +
        '<label class="ux4g-label-m-default" for="' + p + '-' + o.key + '">' + o.label + '</label>' +
        '<div class="ux4g-input">' +
          (o.prefix ? '<span class="ux4g-input-prefix" aria-hidden="true">' + o.prefix + '</span>' : '') +
          '<input class="ux4g-input-input" id="' + p + '-' + o.key + '" name="' + o.key + '" ' + o.attrs + ' aria-describedby="' + helperId + '">' +
        '</div>' +
        '<div id="' + helperId + '" class="ux4g-input-helper"' + (o.hint ? '' : ' hidden') + ' data-hint="' + (o.hint || '') + '">' +
          '<span class="ux4g-icon-outlined ux4g-input-helper-icon" aria-hidden="true">' + (o.hint ? 'info' : 'error') + '</span>' +
          '<span class="ux4g-input-helper-text">' + (o.hint || '') + '</span>' +
        '</div>' +
      '</div>';
  }

  var OR = '<div class="ux4g-divider-horizontal-text" aria-hidden="true">' +
    '<span class="ux4g-divider-label ux4g-body-xs-default ux4g-text-neutral-secondary">OR</span></div>';

  function markup(p, o) {
    var h = o.headingTag || 'h1';
    return '' +
      '<div class="login-head">' +
        '<' + h + ' id="' + p + '-title" tabindex="-1" class="ux4g-title-l-strong ux4g-text-neutral-primary ux4g-m-none">Log in to continue</' + h + '>' +
        (o.onClose ? '<button type="button" class="ux4g-icon-btn ux4g-icon-btn-md ux4g-icon-btn-text-primary login-close" aria-label="Close"><span class="ux4g-icon-outlined" aria-hidden="true">close</span></button>' : '') +
      '</div>' +

      // Step 1: who is logging in.
      '<div class="login-step" data-step="details">' +
        '<p class="ux4g-body-s-default ux4g-text-neutral-secondary ux4g-m-none login-intro">You need an account to register, track, or update your voter details.</p>' +
        '<form class="auth-form login-form" data-form="details" novalidate>' +
          '<div role="tablist" aria-label="Elector type" class="login-switch">' +
            '<button type="button" role="tab" aria-selected="true" data-mode="resident" class="login-switch-tab">Resident elector</button>' +
            '<button type="button" role="tab" aria-selected="false" data-mode="overseas" class="login-switch-tab">Overseas elector</button>' +
          '</div>' +
          '<div class="auth-group" data-group="resident">' +
            field(p, { key: 'mobile', label: 'Mobile number', prefix: '+91', hint: DEMO_HINT,
              attrs: 'type="tel" inputmode="numeric" autocomplete="tel-national" maxlength="11" placeholder="98765 43210" value="98765 43210"' }) +
            OR +
            field(p, { key: 'epic', label: 'EPIC number', attrs: 'type="text" autocomplete="off" placeholder="ABC1234567"' }) +
          '</div>' +
          '<div class="auth-group" data-group="overseas" hidden>' +
            field(p, { key: 'email', label: 'Email address', attrs: 'type="email" inputmode="email" autocomplete="email" placeholder="name@example.com"' }) +
            OR +
            field(p, { key: 'oepic', label: 'EPIC number', attrs: 'type="text" autocomplete="off" placeholder="ABC1234567"' }) +
          '</div>' +
          '<button class="ux4g-btn ux4g-btn-primary ux4g-btn-lg ux4g-w-100" type="submit">Send OTP</button>' +
        '</form>' +
        '<p class="ux4g-body-s-default ux4g-text-neutral-secondary ux4g-m-none login-signup">No account yet? <a class="ux4g-text-link" href="' + (o.signupHref || 'signup.html') + '">Sign up</a></p>' +
      '</div>' +

      // Step 2: the code. It replaces step 1 in the same card.
      '<div class="login-step" data-step="code" hidden>' +
        '<p class="ux4g-body-s-default ux4g-text-neutral-secondary ux4g-m-none login-intro login-sent">Sent to <span data-sent-to></span> ' +
          '<button type="button" class="ux4g-text-link-sm link-btn login-change">Change</button></p>' +
        '<form class="auth-form login-form" data-form="code" novalidate>' +
          '<div id="' + p + '-otp" class="ux4g-otp auth-otp" data-ux-state="default" data-ux-count="6" data-ux-no-separator="true" role="group" aria-labelledby="' + p + '-otp-label" aria-describedby="' + p + '-otp-note">' +
            '<div class="ux4g-otp-label ux4g-sr-only" id="' + p + '-otp-label">6 digit code</div>' +
            '<div class="ux4g-otp-group"><input class="ux4g-otp-source" type="hidden" value="" placeholder="-"></div>' +
            '<div class="ux4g-otp-meta ux4g-body-s-default ux4g-otp-meta-between">' +
              '<span class="ux4g-otp-helper" id="' + p + '-otp-note" aria-live="polite" data-otp-note="Demo code: 123456">Demo code: 123456</span>' +
              '<button type="button" class="ux4g-btn ux4g-btn-text-primary ux4g-btn-sm login-resend">Resend code</button>' +
            '</div>' +
          '</div>' +
          '<button class="ux4g-btn ux4g-btn-primary ux4g-btn-lg ux4g-w-100" type="submit" data-otp-submit>Verify</button>' +
          '<p class="ux4g-body-s-default ux4g-text-neutral-secondary ux4g-m-none auth-status" role="status" aria-live="polite"></p>' +
        '</form>' +
      '</div>';
  }

  function mount(el, o) {
    o = o || {};
    var p = o.id || 'login';
    el.innerHTML = markup(p, o);
    var q = function (s) { return el.querySelector(s); };
    var title = q('#' + p + '-title');
    var steps = { details: q('[data-step="details"]'), code: q('[data-step="code"]') };
    var tabs = el.querySelectorAll('[role="tab"]');
    var groups = { resident: q('[data-group="resident"]'), overseas: q('[data-group="overseas"]') };
    var inputs = { mobile: q('#' + p + '-mobile'), epic: q('#' + p + '-epic'), email: q('#' + p + '-email'), oepic: q('#' + p + '-oepic') };
    var otp = q('#' + p + '-otp'), status = q('.auth-status'), resend = q('.login-resend'), change = q('.login-change');
    var mode = 'resident', sentFrom = null, countdown = null, done = false, leaving = null;

    function setMode(m) {
      mode = m;
      tabs.forEach(function (t) { t.setAttribute('aria-selected', String(t.dataset.mode === m)); });
      groups.resident.hidden = m !== 'resident';
      groups.overseas.hidden = m !== 'overseas';
    }
    tabs.forEach(function (t) { t.addEventListener('click', function () { setMode(t.dataset.mode); }); });

    // UX4G Input states. The helper line holds the hint, or in its place an error or a note.
    // `kind` is 'error', 'note' or '' (back to the hint, or nothing).
    function setHelper(input, kind, message) {
      var box = input.closest('.ux4g-input-container');
      var helper = document.getElementById(input.getAttribute('aria-describedby'));
      var hint = helper.dataset.hint;
      var text = kind ? message : hint;
      box.classList.toggle('ux4g-input-error', kind === 'error');
      box.classList.toggle('ux4g-input-default', kind !== 'error' && !!text);
      helper.querySelector('.ux4g-input-helper-icon').textContent = kind === 'error' ? 'error' : 'info';
      helper.querySelector('.ux4g-input-helper-text').textContent = text || '';
      helper.hidden = !text;
      if (kind === 'error') input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
    }
    function setDisabled(input, disabled) {
      input.disabled = disabled;
      input.closest('.ux4g-input').classList.toggle('ux4g-input-is-disabled', disabled);
      if (disabled) setHelper(input, '', '');
    }
    // A mobile number (overseas: an email) greys out the EPIC field below it until it is cleared.
    // The EPIC field never greys out the other, so the demo number can always be used.
    function pair(a, b) {
      a.addEventListener('input', function () { setDisabled(b, a.value.trim() !== ''); });
      setDisabled(b, a.value.trim() !== '');
    }
    pair(inputs.mobile, inputs.epic);
    pair(inputs.email, inputs.oepic);
    Object.keys(inputs).forEach(function (k) { inputs[k].addEventListener('input', function () { setHelper(inputs[k], '', ''); }); });

    var digits = function (s) { return s.replace(/\s/g, ''); };

    // Checks step 1. Returns where the code goes ({ masked, input }), or null with the reason shown.
    function validate() {
      var first = null, say = function (input, kind, msg) { setHelper(input, kind, msg); first = first || input; };
      var main = mode === 'resident' ? inputs.mobile : inputs.email;
      var epic = mode === 'resident' ? inputs.epic : inputs.oepic;
      setHelper(main, '', ''); setHelper(epic, '', '');
      var v = mode === 'resident' ? digits(main.value) : main.value.trim();
      if (v) {
        if (mode === 'resident' && !/^[6-9]\d{9}$/.test(v)) say(main, 'error', 'Enter a valid 10-digit mobile number.');
        if (mode === 'overseas' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) say(main, 'error', 'Enter a valid email address.');
      } else if (epic.value.trim()) {
        // PROTOTYPE: there is no EPIC log in behind this demo.
        say(epic, 'note', EPIC_NOTE);
      } else {
        say(main, 'error', mode === 'resident' ? 'Enter your mobile number or EPIC number.' : 'Enter your email address or EPIC number.');
      }
      if (first) { first.focus(); return null; }
      // Only the end of the number (or the first letter of the email) is shown.
      var masked = mode === 'resident'
        ? '+91 XXXXX ' + v.slice(5)
        : v.charAt(0) + '•••' + v.slice(v.indexOf('@'));
      return { masked: masked, input: main };
    }

    function stopCountdown() { clearInterval(countdown); countdown = null; }
    function startCountdown() {
      stopCountdown();
      var left = RESEND_AFTER;
      var show = function () {
        resend.disabled = left > 0;
        resend.textContent = left > 0 ? 'Resend code in ' + left + 's' : 'Resend code';
      };
      show();
      countdown = setInterval(function () { left -= 1; show(); if (left <= 0) stopCountdown(); }, 1000);
    }

    // PROTOTYPE: the demo code fills itself in a second after the step opens, then is checked.
    function autofill() {
      AuthOtp.stop(otp);
      AuthOtp.fill(otp, '');
      AuthOtp.setStatus(otp, '', '');
      AuthOtp.later(otp, FILL_AFTER, function () { AuthOtp.fill(otp, SAMPLE_OTP); verify(); });
    }

    function showCode(to) {
      sentFrom = to.input;
      done = false;
      q('[data-sent-to]').textContent = to.masked;
      change.setAttribute('aria-label', 'Change ' + (mode === 'resident' ? 'mobile number' : 'email address'));
      status.textContent = '';
      steps.details.hidden = true;
      steps.code.hidden = false;
      title.textContent = 'Enter the code';
      AuthOtp.mount(otp);
      startCountdown();
      autofill();
      title.focus();
    }

    function showDetails() {
      clearTimeout(leaving); leaving = null; done = false;
      AuthOtp.stop(otp);
      stopCountdown();
      steps.code.hidden = true;
      steps.details.hidden = false;
      title.textContent = 'Log in to continue';
      if (sentFrom) sentFrom.focus();
    }

    // The code is checked; "Verification successful" shows for a moment, then the person moves on.
    function verify() {
      if (!/^[0-9]{6}$/.test(AuthOtp.value(otp))) {
        AuthOtp.setError(otp, 'Enter the 6 digit code.');
        AuthOtp.focus(otp);
        return;
      }
      done = true;
      var active = document.activeElement;
      if (active && otp.contains(active)) active.blur();
      otp.querySelectorAll('.ux4g-otp-slot').forEach(function (slot) { slot.classList.remove('ux4g-otp-focus'); });
      AuthOtp.setStatus(otp, 'success', 'Verification successful');
      // Its own timer, so touching the boxes now cannot stop the person moving on.
      leaving = setTimeout(function () { leaving = null; if (o.onSuccess) o.onSuccess(); }, SUCCESS_FOR);
    }

    q('[data-form="details"]').addEventListener('submit', function (e) {
      e.preventDefault();
      var to = validate();
      if (to) showCode(to);
    });
    q('[data-form="code"]').addEventListener('submit', function (e) {
      e.preventDefault();
      if (done || AuthOtp.busy(otp)) return;
      verify();
    });
    change.addEventListener('click', showDetails);
    resend.addEventListener('click', function () {
      if (done) return;
      status.textContent = 'A new code has been sent.';
      startCountdown();
      autofill();
    });
    if (o.onClose) q('.login-close').addEventListener('click', o.onClose);

    return { reset: function () { if (steps.details.hidden) showDetails(); } };
  }

  // ---- The homepage dialog -------------------------------------------------------------
  var dlg = null, opener = null;

  function focusables() {
    return Array.prototype.filter.call(
      dlg.card.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"])'),
      function (n) { return n.offsetParent !== null; });
  }

  function buildDialog(o) {
    var scrim = document.createElement('div');
    scrim.className = 'login-dialog-scrim';
    scrim.hidden = true;
    scrim.innerHTML = '<div class="login-card login-dialog" role="dialog" aria-modal="true" aria-labelledby="dlg-title"></div>';
    document.body.appendChild(scrim);
    var card = scrim.firstChild;
    dlg = { scrim: scrim, card: card, o: o };
    dlg.form = mount(card, {
      id: 'dlg', headingTag: 'h2', signupHref: 'signup.html',
      onClose: closeDialog,
      onSuccess: function () { closeDialog(); if (dlg.o.onSuccess) dlg.o.onSuccess(); }
    });
    scrim.addEventListener('click', function (e) { if (e.target === scrim) closeDialog(); });
    scrim.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); closeDialog(); return; }
      if (e.key !== 'Tab') return;
      var f = focusables(); if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
  }

  function openDialog(o) {
    if (!dlg) buildDialog(o || {}); else if (o) dlg.o = o;
    opener = document.activeElement;
    dlg.scrim.hidden = false;
    document.body.classList.add('login-dialog-lock');
    var first = dlg.card.querySelector('[role="tab"][aria-selected="true"]');
    if (first) first.focus();
  }

  function closeDialog() {
    if (!dlg || dlg.scrim.hidden) return;
    dlg.form.reset();
    dlg.scrim.hidden = true;
    document.body.classList.remove('login-dialog-lock');
    if (opener && document.contains(opener) && opener !== document.body) opener.focus();
    opener = null;
  }

  window.LoginForm = { mount: mount, openDialog: openDialog, closeDialog: closeDialog };
})();
