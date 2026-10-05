// 9876543210 → 98765 43210 (the space is for reading; only the digits are kept).
const spaced = (d) => d.length > 5 ? d.slice(0, 5) + ' ' + d.slice(5) : d;

class Page extends DCLogic {
  // Everything the shared <header> binds to. The header markup is identical on every
  // page, so this method is too; each page only says whether someone is signed in,
  // where the emblem links, and (on the homepage) what Log in does.
  headerVals({ loggedIn, homeHref, onLoginClick, onLogOut }) {
    const s = this.state;
    const lang = s.lang || 'en';
    const name = this.props.userName ?? 'Ananya Rao';
    const opt = (on) => 'display: block; width: 100%; text-align: left; padding: 8px 10px; border: none; border-radius: 6px; background: transparent; font-family: inherit; font-size: 13px; line-height: 18px; cursor: pointer; font-weight: ' + (on ? '600' : '500') + '; color: ' + (on ? '#4A2BC2' : '#171717') + ';';
    return {
      homeHref: homeHref,
      isLoggedIn: loggedIn,
      isLoggedOut: !loggedIn,
      onLoginClick: onLoginClick,
      userName: name,
      userInitials: name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase(),
      textZoom: s.scale || 1,
      rootTracking: s.wide ? '0.06em' : 'normal',
      trackingWide: !!s.wide,
      toggleTracking: () => this.setState(st => ({ wide: !st.wide })),
      increaseText: () => this.setState(st => ({ scale: Math.min(1.4, +((st.scale || 1) + 0.1).toFixed(2)) })),
      decreaseText: () => this.setState(st => ({ scale: Math.max(0.85, +((st.scale || 1) - 0.1).toFixed(2)) })),
      resetText: () => this.setState({ scale: 1 }),
      isEnglish: lang === 'en',
      isHindi: lang === 'hi',
      langLabel: lang === 'en' ? 'English' : 'हिन्दी',
      langOpen: !!s.langOpen,
      toggleLangMenu: () => this.setState(st => ({ langOpen: !st.langOpen })),
      enOptStyle: opt(lang === 'en'),
      hiOptStyle: opt(lang === 'hi'),
      setEnglish: () => this.setState({ lang: 'en', langOpen: false }),
      setHindi: () => this.setState({ lang: 'hi', langOpen: false }),
      guidesOpen: !!s.guidesOpen,
      openGuides: () => this.setState({ guidesOpen: true }),
      closeGuides: () => this.setState({ guidesOpen: false }),
      // Keyboard: close the Guides menu once focus has left the link and its menu.
      closeGuidesOnBlur: (e) => {
        const wrap = e.currentTarget.closest('[data-guides]');
        if (!wrap || !wrap.contains(e.relatedTarget)) this.setState({ guidesOpen: false });
      },
      // Help menu: opens on click; Escape or focus leaving it closes it.
      helpOpen: !!s.helpOpen,
      toggleHelp: () => this.setState(st => ({ helpOpen: !st.helpOpen })),
      closeHelpOnBlur: (e) => {
        const wrap = e.currentTarget.closest('[data-help]');
        if (!wrap || !wrap.contains(e.relatedTarget)) this.setState({ helpOpen: false });
      },
      helpKeydown: (e) => {
        if (e.key !== 'Escape' || !s.helpOpen) return;
        this.setState({ helpOpen: false });
        e.currentTarget.querySelector('button').focus();
      },
      helpBloHref: 'service.html?s=book-blo' + (loggedIn ? '&loggedIn=1' : ''),
      // Log in brings the person back to this page, signed in.
      loginHref: 'login.html?next=' + encodeURIComponent(location.pathname.split('/').pop() || 'index.html'),
      // Account menu, shown once signed in: profile, my applications, log out.
      accountOpen: !!s.accountOpen,
      toggleAccount: () => this.setState(st => ({ accountOpen: !st.accountOpen })),
      closeAccountOnBlur: (e) => {
        const wrap = e.currentTarget.closest('[data-account]');
        if (!wrap || !wrap.contains(e.relatedTarget)) this.setState({ accountOpen: false });
      },
      // Signs out straight away by reloading this page without the signed-in flag. Only a
      // page with unsaved work (the application form) passes onLogOut to ask first.
      logOut: () => {
        this.setState({ accountOpen: false });
        if (onLogOut) { onLogOut(); return; }
        const q = new URLSearchParams(location.search);
        q.delete('loggedIn'); q.delete('signedIn');
        location.href = location.pathname + (q.toString() ? '?' + q : '');
      }
    };
  }

  state = {
    step: 'details',
    values: initialValues(),
    errors: {},
    resent: false
  };

  setVal(key, value) {
    const errors = Object.assign({}, this.state.errors);
    // An error goes as soon as its field is put right.
    if (errors[key] && !check[key](value)) delete errors[key];
    this.setState({ values: Object.assign({}, this.state.values, { [key]: value }), errors: errors });
  }

  // Back to the page the person came from, signed in. Only a page on this site is accepted,
  // so the link cannot be used to send someone elsewhere. The one question a page may carry
  // through is the Form 8 purpose, so the form opens where it was started.
  signedInHref() {
    let next = 'index.html';
    let carried = '';
    try {
      const asked = new URLSearchParams(location.search).get('next') || '';
      const page = asked.split('?')[0];
      if (/^[a-z0-9-]+\.html$/i.test(page) && page !== 'login.html' && page !== 'signup.html') {
        next = page;
        const purpose = new URLSearchParams(asked.split('?')[1] || '').get('purpose');
        if (/^(correct|move|replace|disability)$/.test(purpose || '')) carried = 'purpose=' + purpose + '&';
      }
    } catch (err) {}
    return next + '?' + carried + 'loggedIn=1';
  }

  // The one-time password step has just been put on the page: draw its boxes and move to them.
  // PROTOTYPE: with the sample answers on, the one-time password then types itself in.
  openOtpBoxes() {
    setTimeout(() => {
      const boxes = document.getElementById('otpBoxes');
      if (!boxes) return;
      AuthOtp.mount(boxes);
      if (SAMPLE_ANSWERS.ON) AuthOtp.play(boxes, SAMPLE_ANSWERS.otp, () => this.verifyOtp());
      else AuthOtp.focus(boxes);
    }, 0);
  }

  verifyOtp() {
    const boxes = document.getElementById('otpBoxes');
    const msg = check.otp(AuthOtp.value(boxes));
    if (msg) {
      AuthOtp.setError(boxes, msg);
      AuthOtp.focus(boxes);
      return;
    }
    AuthOtp.succeed(boxes, () => { location.href = this.signedInHref(); });
  }

  renderVals() {
    const s = this.state;
    const v = s.values;
    const e = s.errors;
    const field = (key) => ({
      boxClass: 'ux4g-input-container ux4g-input-md' + (e[key] ? ' ux4g-input-error' : ''),
      error: e[key] || '',
      invalid: !!e[key]
    });
    const focus = (id) => setTimeout(() => { const el = document.getElementById(id); if (el) el.focus(); }, 0);

    return {
      ...this.headerVals({ loggedIn: false, homeHref: 'index.html' }),
      stepDetails: s.step === 'details',
      stepOtp: s.step === 'otp',
      // Log in keeps the page the person was heading for.
      loginLink: 'login.html' + location.search,
      v: v,
      f: { name: field('name'), mobile: field('mobile'), email: field('email') },
      on: {
        name: (ev) => this.setVal('name', ev.target.value),
        mobile: (ev) => {
          const digits = ev.target.value.replace(/[^0-9]/g, '').slice(0, 10);
          ev.target.value = spaced(digits);
          this.setVal('mobile', digits);
        },
        email: (ev) => this.setVal('email', ev.target.value)
      },
      // Shown as 98765 43210, the same format as everywhere else; kept as ten digits.
      mobileValue: spaced(v.mobile),
      mobileShown: '+91\u00A0' + v.mobile.slice(0, 5) + '\u00A0' + v.mobile.slice(5),
      resentNote: s.resent ? 'A new one-time password has been sent.' : '',

      onSendOtp: (ev) => {
        ev.preventDefault();
        const errors = {};
        ['name', 'mobile', 'email'].forEach(key => { const msg = check[key](v[key]); if (msg) errors[key] = msg; });
        const first = ['name', 'mobile', 'email'].filter(key => errors[key])[0];
        if (first) {
          this.setState({ errors: errors });
          focus({ name: 'signupName', mobile: 'signupMobile', email: 'signupEmail' }[first]);
          return;
        }
        this.setState({ step: 'otp', errors: {}, resent: false });
        this.openOtpBoxes();
      },
      backToDetails: (ev) => {
        ev.preventDefault();
        AuthOtp.stop(document.getElementById('otpBoxes'));
        this.setState({ step: 'details', errors: {}, resent: false });
        focus('signupMobile');
      },
      resendOtp: () => {
        const boxes = document.getElementById('otpBoxes');
        this.setState({ resent: true });
        if (SAMPLE_ANSWERS.ON) AuthOtp.play(boxes, SAMPLE_ANSWERS.otp, () => this.verifyOtp());
        else { AuthOtp.setError(boxes, ''); AuthOtp.fill(boxes, ''); AuthOtp.focus(boxes); }
      },
      onVerify: (ev) => {
        ev.preventDefault();
        if (AuthOtp.busy(document.getElementById('otpBoxes'))) return;
        this.verifyOtp();
      }
    };
  }
}

// PROTOTYPE: the sample answers start filled in, so the whole sign up can be clicked through
// without typing a name, a number or a one-time password. Set ON to false to start empty.
const SAMPLE_ANSWERS = {
  ON: true,
  name: 'Ananya Rao',
  mobile: '9876543210',
  otp: '123456'
};

function initialValues() {
  const on = SAMPLE_ANSWERS.ON;
  return {
    name: on ? SAMPLE_ANSWERS.name : '',
    mobile: on ? SAMPLE_ANSWERS.mobile : '',
    email: ''
  };
}

// Each returns the message to show, or nothing when the value is fine. PROTOTYPE: any six
// digits are accepted as the one-time password.
const check = {
  name: (value) => value.trim() ? '' : 'Enter your full name.',
  mobile: (value) => /^[6-9][0-9]{9}$/.test(value.trim()) ? '' : 'Enter a valid 10-digit mobile number.',
  email: (value) => !value.trim() || /^[^ @]+@[^ @]+[.][^ @]+$/.test(value.trim()) ? '' : 'Enter a valid email address.',
  otp: (value) => /^[0-9]{6}$/.test(value) ? '' : 'Enter the 6 digit one-time password.'
};

DC.mount(Page, document.getElementById('app'), {});
