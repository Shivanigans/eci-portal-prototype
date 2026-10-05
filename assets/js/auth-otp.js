// The one-time password boxes on the log in and sign up pages: UX4G's Input-OTP. Its script
// (ux4g.js) draws one box for each digit from the hidden input inside the group, and keeps
// that hidden input in step with what is typed.
const AuthOtp = {
  // PROTOTYPE: how the sample one-time password is typed in. It waits as long as a text
  // message takes to arrive, then goes in a digit at a time, as a person types it.
  ARRIVES_AFTER: 900,
  DIGIT_EVERY: 230,
  CHECKING_FOR: 900,
  SUCCESS_FOR: 700,

  timers: new WeakMap(),

  // Draws the boxes. UX4G does this itself only for a `data-ux-otp` element that is on the
  // page when it loads, and these are shown later, so they are drawn when their step opens.
  mount(el) {
    if (window.ux4g && window.ux4g.OtpInput) window.ux4g.OtpInput.getOrCreate(el);
    if (el.dataset.authOtp) return;
    el.dataset.authOtp = 'on';
    // An error goes as soon as a digit changes.
    el.addEventListener('input', () => AuthOtp.setStatus(el, '', ''));
    // The person takes over as soon as they touch the boxes: the sample stops typing itself.
    ['keydown', 'pointerdown', 'paste'].forEach(type => el.addEventListener(type, () => AuthOtp.stop(el)));
  },

  // The form's verify button: the one marked data-otp-submit, or its only submit button.
  submit(el) {
    const form = el.closest('form');
    return form.querySelector('[data-otp-submit]') || form.querySelector('[type="submit"]');
  },

  value(el) {
    return el.querySelector('.ux4g-otp-source').value;
  },

  boxes(el) {
    return Array.from(el.querySelectorAll('.ux4g-otp-input'));
  },

  // Puts one digit in its box, the way UX4G does when it is typed.
  setDigit(el, index, digit) {
    const input = AuthOtp.boxes(el)[index];
    if (!input) return;
    input.value = digit;
    input.placeholder = digit ? '' : '-';
    input.classList.toggle('ux4g-title-m-strong', !!digit);
    input.classList.toggle('ux4g-body-m-default', !digit);
    el.querySelector('.ux4g-otp-source').value = AuthOtp.boxes(el).map(box => box.value).join('');
  },

  fill(el, digits) {
    AuthOtp.boxes(el).forEach((input, i) => AuthOtp.setDigit(el, i, digits[i] || ''));
    if (!AuthOtp.boxes(el).length) el.querySelector('.ux4g-otp-source').value = digits;
  },

  // The line under the boxes: the helper text, an error, or the success message, with UX4G's
  // status styling for the last two. `kind` is 'error', 'success' or '' for the helper text.
  setStatus(el, kind, message) {
    const note = el.querySelector('[data-otp-note]');
    el.classList.toggle('ux4g-otp-error', kind === 'error');
    el.classList.toggle('ux4g-otp-success', kind === 'success');
    if (kind === 'error') el.setAttribute('aria-invalid', 'true');
    else el.removeAttribute('aria-invalid');
    note.className = kind ? 'ux4g-otp-status' : 'ux4g-otp-helper';
    note.textContent = '';
    if (!kind) { note.textContent = note.dataset.otpNote; return; }
    const icon = document.createElement('span');
    icon.className = 'ux4g-icon-outlined';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = kind === 'error' ? 'error' : 'done';
    const text = document.createElement('span');
    text.textContent = message;
    note.append(icon, text);
  },

  setError(el, message) {
    AuthOtp.setStatus(el, message ? 'error' : '', message);
  },

  focus(el, index) {
    const boxes = AuthOtp.boxes(el);
    const empty = boxes.filter(input => !input.value)[0];
    const target = index != null ? boxes[index] : (empty || boxes[boxes.length - 1]);
    if (target) target.focus({ preventScroll: true });
  },

  later(el, ms, fn) {
    const list = AuthOtp.timers.get(el) || [];
    const id = setTimeout(() => {
      list.splice(list.indexOf(id), 1);
      fn();
    }, ms);
    list.push(id);
    AuthOtp.timers.set(el, list);
  },

  // True while the sample is still typing itself in, or the check after it is running.
  busy(el) {
    return (AuthOtp.timers.get(el) || []).length > 0;
  },

  // Stops anything still to come: digits being typed, or the check that follows them.
  stop(el) {
    (AuthOtp.timers.get(el) || []).forEach(clearTimeout);
    AuthOtp.timers.delete(el);
    if (el.classList.contains('ux4g-otp-success')) AuthOtp.setStatus(el, '', '');
    const button = AuthOtp.submit(el);
    if (button.dataset.label) {
      button.textContent = button.dataset.label;
      delete button.dataset.label;
      button.disabled = false;
      button.removeAttribute('aria-busy');
    }
  },

  // PROTOTYPE: types the sample one-time password into empty boxes, one digit at a time with
  // the cursor moving along, then calls onDone. Nothing is typed by the person.
  play(el, digits, onDone) {
    AuthOtp.stop(el);
    AuthOtp.setStatus(el, '', '');
    AuthOtp.fill(el, '');
    AuthOtp.focus(el, 0);
    const still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // A little unevenness between digits, as fingers have.
    const gaps = [0, 40, -30, 60, -20, 30];
    let at = AuthOtp.ARRIVES_AFTER;
    digits.split('').forEach((digit, i) => {
      if (!still) at += AuthOtp.DIGIT_EVERY + (gaps[i % gaps.length] || 0);
      AuthOtp.later(el, at, () => {
        AuthOtp.setDigit(el, i, digit);
        AuthOtp.focus(el, Math.min(i + 1, digits.length - 1));
      });
    });
    AuthOtp.later(el, at + 350, onDone);
  },

  // The check after a complete one-time password: the button shows it is working, the boxes
  // turn to UX4G's success state, and then onDone moves on.
  succeed(el, onDone) {
    AuthOtp.stop(el);
    const button = AuthOtp.submit(el);
    button.dataset.label = button.textContent;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    button.textContent = '';
    const spinner = document.createElement('span');
    spinner.className = 'ux4g-spinner-inverse-full ux4g-spinner-xs';
    spinner.setAttribute('aria-hidden', 'true');
    button.append(spinner, ' Verifying');
    const active = document.activeElement;
    if (active && el.contains(active)) active.blur();
    el.querySelectorAll('.ux4g-otp-slot').forEach(slot => slot.classList.remove('ux4g-otp-focus'));
    AuthOtp.later(el, AuthOtp.CHECKING_FOR, () => {
      AuthOtp.setStatus(el, 'success', 'Verification successful');
      button.textContent = 'Verified';
    });
    AuthOtp.later(el, AuthOtp.CHECKING_FOR + AuthOtp.SUCCESS_FOR, onDone);
  }
};
